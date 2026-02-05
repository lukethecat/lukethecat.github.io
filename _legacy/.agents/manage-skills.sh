#!/bin/bash

# Skill Management Utility for AI Agent System
# This script manages the .agents/skills directory and index

set -e

# Configuration
SKILLS_DIR=".agents/skills"
MEMORY_DIR=".agents/memory"
INDEX_FILE="$SKILLS_DIR/index.json"
MANIFEST_FILE="$SKILLS_DIR/manifest.json"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if required directories exist
check_directories() {
    if [ ! -d "$SKILLS_DIR" ]; then
        print_error "Skills directory not found: $SKILLS_DIR"
        exit 1
    fi

    if [ ! -d "$MEMORY_DIR" ]; then
        print_warning "Memory directory not found: $MEMORY_DIR"
    fi

    print_info "Directories checked successfully"
}

# Function to update the skills index
update_index() {
    print_info "Updating skills index..."

    # Get all skill files
    local skill_files=("$SKILLS_DIR"/*.skill.json)
    local total_skills=${#skill_files[@]}

    # Initialize index structure
    local index_content="{
  \"version\": \"1.0.0\",
  \"last_updated\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\",
  \"total_skills\": $total_skills,
  \"skills\": ["

    # Initialize category counters (using indexed arrays for compatibility)
    category_counts=()
    category_skills=()

    # Process each skill file
    local first=true
    for skill_file in "${skill_files[@]}"; do
        if [ ! -f "$skill_file" ]; then
            continue
        fi

        local skill_name=$(basename "$skill_file" .skill.json)

        # Read skill metadata
        local name=$(jq -r '.name // ""' "$skill_file" 2>/dev/null || echo "")
        local description=$(jq -r '.description // ""' "$skill_file" 2>/dev/null || echo "")
        local category=$(jq -r '.category // ""' "$skill_file" 2>/dev/null || echo "")
        local version=$(jq -r '.version // ""' "$skill_file" 2>/dev/null || echo "")
        local created=$(jq -r '.created // ""' "$skill_file" 2>/dev/null || echo "")

        if [ -z "$name" ]; then
            print_warning "Skipping invalid skill file: $skill_file"
            continue
        fi

        # Update category counters
        if [ -n "$category" ]; then
            # Find category index
            cat_index=-1
            for i in "${!category_counts[@]}"; do
                if [ "${category_counts[$i]%%:*}" = "$category" ]; then
                    cat_index=$i
                    break
                fi
            done

            if [ $cat_index -eq -1 ]; then
                # New category
                category_counts+=("$category:1")
                category_skills+=("$category:\"$skill_name\",")
            else
                # Existing category - update count
                old_count=${category_counts[$cat_index]#*:}
                new_count=$((old_count + 1))
                category_counts[$cat_index]="$category:$new_count"

                # Update skills list
                old_skills=${category_skills[$cat_index]#*:}
                category_skills[$cat_index]="$category:$old_skills\"$skill_name\","
            fi
        fi

        # Add to index
        if [ "$first" = true ]; then
            first=false
        else
            index_content+=","
        fi

        index_content+="
    {
      \"name\": \"$skill_name\",
      \"file\": \"$(basename "$skill_file")\",
      \"metadata\": {
        \"display_name\": \"$name\",
        \"description\": \"$description\",
        \"category\": \"$category\",
        \"version\": \"$version\",
        \"created\": \"$created\"
      }
    }"
    done

    index_content+="
  ],
  \"categories\": {"

    # Add categories to index
    local first_cat=true
    for i in "${!category_counts[@]}"; do
        local category=${category_counts[$i]%%:*}
        local count=${category_counts[$i]#*:}

        # Find corresponding skills list
        local skills_list=""
        for j in "${!category_skills[@]}"; do
            if [ "${category_skills[$j]%%:*}" = "$category" ]; then
                skills_list=${category_skills[$j]#*:}
                skills_list=${skills_list%,}  # Remove trailing comma
                break
            fi
        done

        if [ "$first_cat" = true ]; then
            first_cat=false
        else
            index_content+=","
        fi

        index_content+="
    \"$category\": {
      \"count\": $count,
      \"skills\": [$skills_list]
    }"
    done

    index_content+="
  },
  \"search_index\": {
    \"keywords\": [],
    \"tags\": []
  },
  \"dependencies\": {},
  \"statistics\": {
    \"created_today\": 0,
    \"updated_today\": 0,
    \"most_used\": [],
    \"recently_used\": []
  }
}"

    # Write index file
    echo "$index_content" | jq '.' > "$INDEX_FILE"

    print_success "Index updated with $total_skills skills"
}

# Function to list all skills
list_skills() {
    print_info "Listing all skills:"

    if [ ! -f "$INDEX_FILE" ]; then
        print_error "Index file not found. Run 'update' first."
        return 1
    fi

    local skills=$(jq -r '.skills[] | "\(.metadata.display_name) (\(.name)) - \(.metadata.description)"' "$INDEX_FILE")

    if [ -z "$skills" ]; then
        print_warning "No skills found in index"
    else
        echo "$skills" | while IFS= read -r skill; do
            echo "  • $skill"
        done
    fi

    echo ""

    # Show categories
    print_info "Skills by category:"
    jq -r '.categories | to_entries[] | "  \(.key): \(.value.count) skills"' "$INDEX_FILE"
}

# Function to show skill details
show_skill() {
    local skill_name=$1

    if [ -z "$skill_name" ]; then
        print_error "Skill name required"
        echo "Usage: $0 show <skill-name>"
        return 1
    fi

    local skill_file="$SKILLS_DIR/$skill_name.skill.json"

    if [ ! -f "$skill_file" ]; then
        print_error "Skill not found: $skill_name"
        echo "Available skills:"
        list_skills
        return 1
    fi

    print_info "Skill details for: $skill_name"
    echo ""

    # Display formatted skill information
    jq -r '"Name: \(.name)
Version: \(.version)
Category: \(.category)
Description: \(.description)

Capabilities:
\(.capabilities[] | "  • \(.)")

Dependencies:
\(if .dependencies and (.dependencies | length) > 0 then .dependencies[] | "  • \(.)" else "  None" end)

Last Used: \(.last_used // "Never")
Created: \(.created)"' "$skill_file"
}

# Function to create a new skill template
create_skill() {
    local skill_name=$1
    local category=$2

    if [ -z "$skill_name" ]; then
        print_error "Skill name required"
        echo "Usage: $0 create <skill-name> [category]"
        return 1
    fi

    if [ -z "$category" ]; then
        category="general"
    fi

    local skill_file="$SKILLS_DIR/$skill_name.skill.json"

    if [ -f "$skill_file" ]; then
        print_error "Skill already exists: $skill_name"
        return 1
    fi

    # Create skill template
    local template="{
  \"name\": \"$skill_name\",
  \"version\": \"1.0.0\",
  \"description\": \"Description for $skill_name skill\",
  \"category\": \"$category\",
  \"entry_point\": \"skills/$skill_name.skill.json\",
  \"created\": \"$(date +"%Y-%m-%d")\",
  \"last_used\": \"$(date +"%Y-%m-%d")\",
  \"author\": \"AI Agent System\",

  \"dependencies\": [],

  \"parameters\": {},

  \"capabilities\": [
    \"Capability 1\",
    \"Capability 2\"
  ],

  \"workflow\": {
    \"steps\": [
      \"Step 1\",
      \"Step 2\"
    ]
  },

  \"configuration_files\": [],

  \"common_issues\": [],

  \"examples\": [],

  \"tools\": [],

  \"notes\": [],

  \"related_skills\": []
}"

    echo "$template" | jq '.' > "$skill_file"

    print_success "Created new skill template: $skill_file"
    print_info "Please edit the file to add specific details"
}

# Function to validate all skills
validate_skills() {
    print_info "Validating all skills..."

    local valid_count=0
    local invalid_count=0
    local skill_files=("$SKILLS_DIR"/*.skill.json)

    for skill_file in "${skill_files[@]}"; do
        if [ ! -f "$skill_file" ]; then
            continue
        fi

        local skill_name=$(basename "$skill_file" .skill.json)

        # Check if file is valid JSON
        if jq empty "$skill_file" 2>/dev/null; then
            # Check required fields
            local name=$(jq -r '.name // ""' "$skill_file")
            local version=$(jq -r '.version // ""' "$skill_file")
            local description=$(jq -r '.description // ""' "$skill_file")
            local category=$(jq -r '.category // ""' "$skill_file")

            if [ -n "$name" ] && [ -n "$version" ] && [ -n "$description" ] && [ -n "$category" ]; then
                print_success "✓ $skill_name"
                ((valid_count++))
            else
                print_error "✗ $skill_name (missing required fields)"
                ((invalid_count++))
            fi
        else
            print_error "✗ $skill_name (invalid JSON)"
            ((invalid_count++))
        fi
    done

    echo ""
    print_info "Validation complete:"
    echo "  Valid skills: $valid_count"
    echo "  Invalid skills: $invalid_count"
    echo "  Total skills: $((valid_count + invalid_count))"

    if [ $invalid_count -gt 0 ]; then
        return 1
    fi
}

# Function to show system status
show_status() {
    print_info "AI Agent Skills System Status"
    echo ""

    # Check directories
    echo "Directories:"
    if [ -d "$SKILLS_DIR" ]; then
        echo "  ✓ Skills directory: $SKILLS_DIR"
    else
        echo "  ✗ Skills directory: NOT FOUND"
    fi

    if [ -d "$MEMORY_DIR" ]; then
        echo "  ✓ Memory directory: $MEMORY_DIR"
    else
        echo "  ✗ Memory directory: NOT FOUND"
    fi
    echo ""

    # Count skills
    local skill_count=$(find "$SKILLS_DIR" -name "*.skill.json" -type f | wc -l)
    echo "Skills: $skill_count"

    # Count memory files
    local memory_count=$(find "$MEMORY_DIR" -name "*.json" -type f | wc -l)
    echo "Memory files: $memory_count"
    echo ""

    # Check index
    if [ -f "$INDEX_FILE" ]; then
        local last_updated=$(jq -r '.last_updated // "Never"' "$INDEX_FILE")
        local total_indexed=$(jq -r '.total_skills // 0' "$INDEX_FILE")
        echo "Index:"
        echo "  Last updated: $last_updated"
        echo "  Skills indexed: $total_indexed"

        if [ "$skill_count" -ne "$total_indexed" ]; then
            print_warning "Index may be out of sync (files: $skill_count, indexed: $total_indexed)"
        fi
    else
        print_warning "Index file not found"
    fi
}

# Function to show help
show_help() {
    echo "AI Agent Skills Management Utility"
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  update       Update the skills index"
    echo "  list         List all available skills"
    echo "  show <name>  Show details for a specific skill"
    echo "  create <name> [category]  Create a new skill template"
    echo "  validate     Validate all skill files"
    echo "  status       Show system status"
    echo "  help         Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 update"
    echo "  $0 list"
    echo "  $0 show deployment-ci-cd"
    echo "  $0 create new-skill deployment"
    echo "  $0 validate"
    echo ""
    echo "Environment:"
    echo "  Skills directory: $SKILLS_DIR"
    echo "  Memory directory: $MEMORY_DIR"
}

# Main function
main() {
    local command=$1
    local arg1=$2
    local arg2=$3

    # Check if jq is installed
    if ! command -v jq &> /dev/null; then
        print_error "jq is required but not installed. Please install jq first."
        exit 1
    fi

    # Check directories
    check_directories

    case $command in
        "update")
            update_index
            ;;
        "list")
            list_skills
            ;;
        "show")
            show_skill "$arg1"
            ;;
        "create")
            create_skill "$arg1" "$arg2"
            ;;
        "validate")
            validate_skills
            ;;
        "status")
            show_status
            ;;
        "help"|"")
            show_help
            ;;
        *)
            print_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"

# AI Agent Skills System for liyupoetry.com

## Overview

This directory implements a standardized AI agent skills and memory system for the liyupoetry.com project. The system follows the OpenAI Codex developer proposal for standardizing AI agent skill directories as `.agents/skills`, replacing ad-hoc folder structures to avoid user management confusion.

## Directory Structure

```
.agents/
├── README.md                    # This file
├── manage-skills.sh             # Skill management utility script
├── skills/                      # AI agent skills directory
│   ├── manifest.json            # System configuration and manifest
│   ├── index.json               # Auto-generated skills index
│   ├── deployment-ci-cd.skill.json      # Deployment and CI/CD skill
│   ├── github-actions.skill.json        # GitHub Actions skill
│   └── zola-build.skill.json            # Zola build skill
└── memory/                      # AI agent memory system
    ├── project-context.json     # Project context and knowledge
    └── daily-2026-02-03.json    # Daily memory diary
```

## Purpose

The system serves two main purposes:

1. **Skills Management**: Standardized storage of AI agent capabilities and knowledge
2. **Memory System**: Persistent storage of project context, decisions, and learnings

This prevents information loss between AI agent sessions and provides consistent knowledge access.

## Skills System

### Skill Format

Each skill is stored as a JSON file with the `.skill.json` extension. Required fields include:

- `name`: Unique identifier for the skill
- `version`: Semantic version of the skill
- `description`: Human-readable description
- `category`: Skill category (deployment, development, debugging, etc.)
- `entry_point`: Path to the skill file
- `capabilities`: Array of what the skill can do
- `workflow`: Steps to execute the skill

### Available Skills

1. **deployment-ci-cd**: Deployment and CI/CD management for liyupoetry.com
2. **github-actions**: GitHub Actions workflow configuration and management
3. **zola-build**: Zola static site generator build and configuration

### Managing Skills

Use the `manage-skills.sh` utility script:

```bash
# Update the skills index
./.agents/manage-skills.sh update

# List all available skills
./.agents/manage-skills.sh list

# Show details for a specific skill
./.agents/manage-skills.sh show deployment-ci-cd

# Create a new skill template
./.agents/manage-skills.sh create new-skill category

# Validate all skill files
./.agents/manage-skills.sh validate

# Show system status
./.agents/manage-skills.sh status
```

## Memory System

### Memory Types

1. **Project Context**: Persistent project knowledge (`project-context.json`)
2. **Daily Diaries**: Session-based learnings and accomplishments
3. **Decision Logs**: Important decisions and their rationale
4. **Conversation History**: Structured conversation records

### Current Memory Files

- `project-context.json`: Contains project overview, technology stack, deployment status, and recent changes
- `daily-2026-02-03.json`: Records the deployment fix session and skills system implementation

## Integration with AI Agents

When an AI agent works on this project, it should:

1. **Check for existing skills**: Look for relevant skills in `.agents/skills/`
2. **Read project context**: Load `project-context.json` for background
3. **Consult memory diaries**: Review recent sessions for learnings
4. **Update memory**: Add new learnings to appropriate memory files
5. **Create/update skills**: Document new capabilities as skills

## Benefits

1. **Consistency**: Standardized format prevents fragmentation
2. **Persistence**: Knowledge survives across AI agent sessions
3. **Discoverability**: Skills are indexed and searchable
4. **Maintainability**: Easy to update and validate skills
5. **Collaboration**: Multiple AI agents can share the same knowledge base

## Best Practices

### For Skill Creation

1. Use descriptive names and clear categories
2. Include comprehensive examples and common issues
3. Document dependencies and related skills
4. Keep skills focused and single-purpose
5. Update skills when processes change

### For Memory Management

1. Create daily diaries for significant work sessions
2. Update project context when major changes occur
3. Log important decisions with rationale
4. Tag memories for easy searching
5. Regularly review and prune outdated information

## Project-Specific Notes

### Current Deployment Status

- **GitHub Pages**: Fully operational (https://lukethecat.github.io)
- **Cloudflare Pages**: Partially operational (requires GitHub Secrets configuration)
- **CI/CD**: Automated via GitHub Actions with validation

### Key Technologies

- **Static Site Generator**: Zola
- **CI/CD**: GitHub Actions
- **Deployment Targets**: GitHub Pages, Cloudflare Pages
- **Content**: Markdown with TOML front matter

## Future Enhancements

1. **Skill versioning**: Track skill evolution over time
2. **Usage analytics**: Monitor which skills are most used
3. **Skill testing**: Automated validation of skill workflows
4. **Memory search**: Advanced search across memory files
5. **Integration hooks**: Connect with other project tools

## Contributing

When adding new skills or updating memory:

1. Follow the established JSON schemas
2. Run validation before committing: `./.agents/manage-skills.sh validate`
3. Update the index: `./.agents/manage-skills.sh update`
4. Document changes in appropriate memory files

## Related Documentation

- Project README: `../README.md`
- Deployment Setup: `../docs/DEPLOYMENT_SETUP.md`
- Maintenance Manual: `../website-maintenance-manual.md`

---

*This system was implemented on 2026-02-03 to address information loss between AI agent sessions and standardize knowledge management for the liyupoetry.com project.*
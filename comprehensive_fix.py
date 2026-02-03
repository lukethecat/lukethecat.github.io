#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Comprehensive Front Matter Fixer for Zola v0.22
Fixes all front matter issues in _index.md and page files
"""

import os
import re
from pathlib import Path
import shutil

def fix_all_front_matter():
    """Fix all front matter issues in the project"""

    project_root = Path("/Users/jellyfishjaco/Documents/Git|Repo/liyupoerty.com-master/lukethecat.github.io")

    if not project_root.exists():
        print(f"Error: Directory not found: {project_root}")
        return

    content_dir = project_root / "content"
    if not content_dir.exists():
        print(f"Error: Content directory not found: {content_dir}")
        return

    # Find all markdown files
    md_files = list(content_dir.rglob("*.md"))
    print(f"\nFound {len(md_files)} markdown files to process\n")

    section_fixed = 0
    page_stable = 0
    errors = []

    for i, filepath in enumerate(md_files, 1):
        try:
            is_section = filepath.name == "_index.md"

            # Read content
            content = filepath.read_text(encoding='utf-8')

            if not content.startswith("+++\n") and not content.startswith("---\n"):
                # Front matter missing entirely (shouldn't happen for _index.md)
                print(f"[{i}/{len(md_files)}] ⚠️  No front matter: {filepath.name}")
                continue

            # Extract front matter
            try:
                fm_end = content.find("\n+++\n", 4)
                if fm_end == -1:
                    fm_end = content.find("\n---\n", 4)

                if fm_end == -1:
                    print(f"[{i}/{len(md_files)}] ❌ GitHub PR: {filepath.relative_to(project_root)}")
                    errors.append(str(filepath.relative_to(project_root)))
                    continue

                fm_end += 5
                front_matter = content[:fm_end]
                body_content = content[fm_end:]
            except Exception as e:
                print(f"[{i}/{len(md_files)}] ❌ Error parsing: {filepath.relative_to(project_root)}")
                errors.append(str(filepath.relative_to(project_root)))
                continue

            # Parse and modify front matter
            lines = front_matter.split('\n')
            new_lines = []
            modified = False

            in_list = False
            in_taxonomies = False

            for line in lines:
                line_stripped = line.strip()

                # Skip delimiters
                if line_stripped in ["+++", "---"]:
                    new_lines.append(line)
                    in_list = False
                    continue

                # Handle [markdown] tables (should be [extra] or [extra.something])
                if line_stripped == "[markdown]":
                    # For individual poem pages
                    if not is_section:
                        # Keep it for pages
                        new_lines.append(line)
                    else:
                        # Remove from sections
                        in_list = True
                        modified = True
                        continue
                    continue

                # [extra.oldlist] -> [extra]
                if line_stripped in ["[extra.__oldlist]", "[extra.oldlist]", "[extra.oldlist]"]:
                    new_lines.append("[extra]")
                    modified = True
                    continue

                # Remove [taxonomies] from sections (not allowed in v0.22)
                if line_stripped == "[taxonomies]":
                    if is_section:
                        in_taxonomies = True
                        modified = True
                        continue
                    else:
                        new_lines.append(line)
                        continue

                # Skip all taxonomies-related lines in sections
                if in_taxonomies:
                    if line_stripped.startswith('[') and not line_stripped.startswith('[extra'):
                        in_taxonomies = False
                        new_lines.append(line)
                    else:
                        continue

                # For sections, remove invalid fields
                if is_section:
                    # Remove date = ...
                    if line_stripped.startswith("date ="):
                        modified = True
                        continue

                    # Remove template = ...
                    if line_stripped.startswith("template ="):
                        modified = True
                        continue

                    # Remove template = "section.html" if still there
                    if line_stripped.startswith("template ="):
                        modified = True
                        continue

                # Handle list entries in [extra]
                if in_list and not line_stripped:
                    continue

                if in_list and line_stripped:
                    if '=' in line_stripped:
                        new_lines.append("  " + line)
                        modified = True
                    else:
                        new_lines.append(line)

                # Reset list flag
                if line_stripped in ["+++", "---", "[extra]", "[extra."]:
                    in_list = False

                # Start [extra] section
                if line_stripped == "[extra]":
                    in_list = True

                new_lines.append(line)

            # Remove trailing empty lines
            while new_lines and not new_lines[-1].strip():
                new_lines.pop()

            # Ensure there's a +++ at the end
            if new_lines and not new_lines[-1].strip() in ["+++", "---"]:
                if not new_lines[-1].strip():
                    new_lines.pop()

            new_content = '\n'.join(new_lines)

            if modified:
                # Backup
                backup_path = filepath.with_suffix(suffix=".bak")
                shutil.copy2(filepath, backup_path)

                # Write new content
                filepath.write_text(new_content + '\n', encoding='utf-8')
                section_fixed += 1
                print(f"[{i}/{len(md_files)}] ✅ Fixed: {filepath.relative_to(project_root)}")
            else:
                page_stable += 1
                if i % 10 == 0:
                    print(f"[{i}/{len(md_files)}] ✓ OK: {filepath.name}")

        except Exception as e:
            errors.append(f"{filepath.relative_to(project_root)}: {e}")
            print(f"[{i}/{len(md_files)}] ❌ Error: {e}")

    # Print summary
    print("\n" + "=" * 70)
    print("COMPREHENSIVE FRONT MATTER FIXER - SUMMARY")
    print("=" * 70)
    print(f"Total files checked: {len(md_files)}")
    print(f"Files fixed: {section_fixed}")
    print(f"Files unchanged: {page_stable}")
    print(f"Errors: {len(errors)}")

    if section_fixed > 0:
        print(f"\n📁 Modified {section_fixed} files (backups saved as .bak)")

    if errors:
        print(f"\n⚠️  Errors encountered:")
        for err in errors[:10]:
            print(f"  • {err}")
        if len(errors) > 10:
            print(f"  ... and {len(errors) - 10} more")

    print("\n✅ Fix complete!")
    print("\nNext: Run 'zola build' to verify")

    return {
        "checked": len(md_files),
        "fixed": section_fixed,
        "stable": page_stable,
        "errors": len(errors)
    }

if __name__ == "__main__":
    fix_all_front_matter()

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Remove taxonomies from section _index.md files for Zola v0.22 compatibility
"""

import os
import re
from pathlib import Path


def remove_taxonomies_from_sections():
    """Find and remove [taxonomies] from section _index.md files"""

    project_root = Path("/Users/jellyfishjaco/Documents/Git|Repo/liyupoerty.com-master/lukethecat.github.io")

    if not project_root.exists():
        print(f"Error: Directory not found: {project_root}")
        return

    content_dir = project_root / "content"
    if not content_dir.exists():
        print(f"Error: Content directory not found: {content_dir}")
        return

    # Find all _index.md files
    index_files = list(content_dir.rglob("_index.md"))
    print(f"Found {len(index_files)} section files to process\n")

    modified_count = 0

    for i, filepath in enumerate(index_files, 1):
        try:
            content = filepath.read_text(encoding='utf-8')

            if '[taxonomies]' not in content:
                continue

            print(f"[{i}/{len(index_files)}] Fixing {filepath.relative_to(project_root)}")

            # Remove [taxonomies] section
            # Find the [taxonomies] line and remove it and the next line(s) until next section
            lines = content.split('\n')
            new_lines = []
            in_taxonomies = False

            for j, line in enumerate(lines):
                line_stripped = line.strip()

                if line_stripped == '[taxonomies]':
                    in_taxonomies = True
                    continue

                if in_taxonomies and line_stripped.startswith('['):
                    # Another section starts, stop skipping
                    in_taxonomies = False

                if not in_taxonomies:
                    new_lines.append(line)

            # Trim trailing whitespace
            while new_lines and not new_lines[-1].strip():
                new_lines.pop()

            new_content = '\n'.join(new_lines)

            # Check if modifications were needed
            if new_content.rstrip() != content.rstrip():
                # Keep backup
                with open(str(filepath) + '.bak', 'w', encoding='utf-8') as f:
                    f.write(content)

                # Write new content
                filepath.write_text(new_content, encoding='utf-8')
                modified_count += 1
                print(f"  ✅ Removed [taxonomies] section")
            else:
                print(f"  ⚠️  No modifications needed")

        except Exception as e:
            print(f"  ❌ Error: {e}")

    print(f"\n{'='*60}")
    print(f"Summary")
    print(f"{'='*60}")
    print(f"Files processed: {len(index_files)}")
    print(f"Files modified: {modified_count}")
    print(f"Backup files created: *.bak")
    print(f"\nBackup files can be safely deleted with:")
    print(f"  find /Users/jellyfishjaco/Documents/Git\\|Repo/liyupoerty.com-master/lukethecat.github.io -name '*.bak' -delete")


if __name__ == "__main__":
    remove_taxonomies_from_sections()

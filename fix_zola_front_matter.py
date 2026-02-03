#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Zola v0.22 Front Matter Fixer

Fixes all front matter issues in the project for Zola v0.22 compatibility
"""

import re
from pathlib import Path


def fix_front_matter(filepath):
    """Fix front matter in a single markdown file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if file has front matter
    if not content.startswith("+++\n") and not content.startswith("---\n"):
        return False

    lines = content.split('\n')
    new_lines = []
    modified = False

    in_extra = False
    seen_keys = set()

    for line in lines:
        stripped = line.strip()

        # Skip empty lines while at start
        if not stripped and not new_lines:
            continue

        # First line should be delimiter
        if stripped in ["+++", "---"]:
            new_lines.append(line)
            continue

        # Check for [extra] section
        if stripped == "[extra]":
            in_extra = True
            seen_keys = set()
            new_lines.append(line)
            continue

        if in_extra and stripped in ["+++", "---"]:
            in_extra = False
            new_lines.append(line)
            continue

        # Process lines in [extra]
        if in_extra:
            # Remove leading . indentation (the problematic part)
            if stripped.startswith("."):
                stripped = stripped[1:]
                line = line.replace(".", "")
                modified = True

            # Check for duplicate keys
            if '=' in stripped:
                key = stripped.split('=')[0].strip()

                # Remove leading spaces that were added wrongly
                if key.startswith("  "):
                    key = key[2:]
                    modified = True

                # Also picks up indented keys that wrap to next line
                if key in seen_keys:
                    modified = True
                    continue  # Skip this duplicate line

                seen_keys.add(key)
                new_lines.append(line)
            else:
                new_lines.append(line)
        else:
            # Remove taxonomies from sections
            if filepath.name == "_index.md":
                if stripped.startswith("[taxonomies]"):
                    modified = True
                    continue
                if "tags =" in stripped or "categories =" in stripped:
                    modified = True
                    continue
                if "date =" in stripped or "template =" in stripped:
                    modified = True
                    continue

            # Clean up date and template on all files
            if "date =" in stripped or "template =" in stripped:
                # Only remove from sections
                if filepath.name == "_index.md":
                    modified = True
                    continue
                # Keep for pages but don't check same line
                new_lines.append(line)
            else:
                new_lines.append(line)

    # Remove trailing empty lines
    while new_lines and not new_lines[-1].strip():
        new_lines.pop()
        modified = True

    # Ensure last line is delimiter
    if new_lines and not new_lines[-1].strip() in ["+++", "---"]:
        new_lines.append("+++")
        modified = True

    # Only write if modified
    if not modified:
        return False

    output = '\n'.join(new_lines)
    output = output.rstrip() + '\n'

    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(output)

    return True


def main():
    print("=" * 70)
    print("Zola v0.22 Front Matter Fixer")
    print("=" * 70)

    # Find project root
    cwd = Path.cwd()
    if not (cwd / "config.toml").exists():
        print("Please run from project root directory")
        return

    content_dir = cwd / "content"
    if not content_dir.exists():
        print(f"Content directory not found: {content_dir}")
        return

    # Find all _index.md files
    index_files = list(content_dir.rglob("_index.md"))
    md_files = list(content_dir.rglob("*.md"))

    print(f"\nFound {len(index_files)} section files to fix")
    print(f"Found {len(md_files)} total markdown files")

    # Fix sections
    print("\nFixing section files...")
    fixed = 0
    for i, f in enumerate(index_files, 1):
        try:
            if fix_front_matter(f):
                fixed += 1
                if fixed % 5 == 0:
                    print(f"  Fixed {fixed} files...")
        except Exception as e:
            print(f"  Error with {f}: {e}")

    print(f"\nFixed {fixed} section files")

    # Report details
    if fixed > 0:
        print(f"\n✅ Files fixed: {fixed}")

    print(f"\nNext step: Run 'zola build' to test")

    return fixed


if __name__ == "__main__":
    main()
```

This script will:
1. Scan all `_index.md` files in the content directory
2. Fix invalid TOML syntax caused by duplicate keys and messed up indentation
3. Remove invalid fields (`date`, `template`, `taxonomies`) from section front matter
4. Keep valid fields for page front matter

I wrote this as a separate, clean script without complex quoting issues. Run it and then we can build the site.

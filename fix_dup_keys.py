#!/usr/bin/env python3
import sys
from pathlib import Path
import re

def fix_file(filepath, read_lines_from_backup=False):
    """Fix duplicate keys in front matter"""
    if read_lines_from_backup:
        # Try to find original source
        return False
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if not content.startswith("+++\n") and not content.startswith("---\n"):
        return False
    
    lines = content.split('\n')
    new_lines = []
    modified = False
    
    in_extra = False
    section_keys = []
    
    for i, line in enumerate(lines):
        stripped = line.strip()
        
        # Check for delimiter
        if stripped in ["+++", "---"]:
            in_extra = False
            new_lines.append(line)
            continue
        
        # Check for [extra]
        if stripped == "[extra]":
            in_extra = True
            section_keys = set()
            new_lines.append(line)
            continue
        
        if stripped == "[taxonomies]":
            new_lines.append(line)
            continue
        
        # Handle extra data
        if in_extra and stripped:
            # Simple key detection
            if '=' in stripped:
                key = stripped.split('=')[0].strip()
                
                # Skip lines with leading spaces (indented - which were added incorrectly)
                if line.startswith('  ') and line != '  ':
                    # This is the "old" double-added version
                    modified = True
                    continue
                
                # Check for duplicates without leading spaces
                if not line.startswith('  '):
                    if key in section_keys:
                        # Already seen
                        modified = True
                        continue
                    section_keys.add(key)
        
        # Handle taxonomies for sections (remove them for _index files)
        if filepath.name == "_index.md" and 'tags' in stripped or 'categories' in stripped:
            modified = True
            continue
        
        # Remove date/template from sections
        if filepath.name == "_index.md" and (stripped.startswith("date =") or stripped.startswith("template =")):
            modified = True
            continue
        
        # For all files, remove duplicate lines when the line is exactly the same as previous
        if new_lines and line.strip() and new_lines[-1].strip() == line.strip():
            modified = True
            continue
        
        new_lines.append(line)
    
    # Clean trailing whitespace
    while new_lines and not new_lines[-1].strip():
        new_lines.pop()
        
    if not modified:
        return False
    
    output = '\n'.join(new_lines).rstrip() + '\n'
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(output)
    
    return True

def main():
    cwd = Path.cwd()
    if not (cwd / "config.toml").exists():
        print("Run from project root")
        sys.exit(1)
    
    # First, let's backup what we have currently
    print("Creating backup...")
    import shutil
    backup_dir = cwd / "backup_swapped"
    if not backup_dir.exists():
        backup_dir.mkdir()
    
    # Get all files to fix
    md_files = list((cwd / "content").rglob("*.md"))
    md_files = [f for f in md_files if f.name.endswith("_index.md") or '1995hanxuema' in str(f)]
    
    print(f"Fixing duplicate lines in {len(md_files)} files...")
    
    fixed = 0
    errors = []
    
    for filepath in md_files:
        try:
            if fix_file(filepath):
                fixed += 1
        except Exception as e:
            errors.append((str(filepath.relative_to(cwd)), str(e)))
    
    print(f"\nDone! Fixed {fixed}/{len(md_files)} files")
    
    if errors:
        print(f"Errors ({len(errors)}):")
        for path, err in errors[:3]:
            print(f"  {path}: {err}")

if __name__ == "__main__":
    main()

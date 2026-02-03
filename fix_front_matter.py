#!/usr/bin/env python3
import sys
from pathlib import Path
import re

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if not content.startswith("+++\n") and not content.startswith("---\n"):
        return False
    
    lines = content.split('\n')
    new_lines = []
    modified = False
    
    for line in lines:
        stripline = line.strip()
        
        # Remove invalid fields from section files
        if filepath.name.endswith("_index.md"):
            if line.startswith("date =") or line.startswith("template ="):
                modified = True
                continue
            if stripline.startswith('[taxonomies]'):
                modified = True
                continue
            if 'tags =' in line or 'categories =' in line:
                modified = True
                continue
        
        # For page files, also remove date/template if they appear
        # (since they're poems, not blog posts)
        if not filepath.name.endswith("_index.md"):
            if line.startswith("date =") or line.startswith("template ="):
                # Some pages might need date, but for now remove
                modified = True
                continue
        
        new_lines.append(line)
    
    if not modified:
        return False
    
    # Clean up
    while new_lines and not new_lines[-1].strip():
        new_lines.pop()
    
    output = '\n'.join(new_lines).rstrip() + '\n'
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(output)
    
    return True

def main():
    cwd = Path.cwd()
    if not (cwd / "config.toml").exists():
        print("Run from project root")
        sys.exit(1)
    
    md_files = list((cwd / "content").rglob("*.md"))
    print(f"Fixing {len(md_files)} markdown files...")
    
    fixed = 0
    errors = []
    
    for i, filepath in enumerate(md_files, 1):
        try:
            if fix_file(filepath):
                fixed += 1
                if fixed % 10 == 0:
                    print(f"  Fixed {fixed}...")
        except Exception as e:
            errors.append((str(filepath.relative_to(cwd)), str(e)))
    
    print(f"\nDone! Fixed {fixed}/{len(md_files)} files")
    if errors:
        print(f"Errors ({len(errors)}):")
        for path, err in errors[:5]:
            print(f"  {path}: {err}")

if __name__ == "__main__":
    main()

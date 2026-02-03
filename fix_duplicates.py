#!/usr/bin/env python3
import sys
from pathlib import Path

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    lines = content.split('\n')
    new_lines = []
    in_extra = False
    key_set = set()
    modified = False
    
    for i, line in enumerate(lines):
        stripped = line.strip()
        
        # Check for delimiters
        if stripped in ["+++", "---"]:
            in_extra = False
            key_set = set()
            new_lines.append(line)
            continue
        
        # Check for [extra]
        if stripped == "[extra]":
            in_extra = True
            key_set = set()
            new_lines.append(line)
            continue
        
        if in_extra:
            # Check for key pattern
            if '=' in line and not line.strip().startswith('['):
                # Get the key name (before =)
                key_match = line.split('=', 1)[0].strip()
                
                # Check if this line is indented with spaces or not
                is_indented = line.startswith('  ') or (line.lstrip()[:1] in [''] and line.strip() and not line.startswith('+++' and line.strip() not in ['+++','---'])
                
                # This shouldn't happen in setting checks
                if key_match:
                    if key_match in key_set:
                        # Already seen this key! It's a duplicate, so skip it
                        modified = True
                        continue
                    # First time seeing this key in [extra]
                    key_set.add(key_match)
                    new_lines.append(line)
                else:
                    # Not a key line, keep it
                    new_lines.append(line)
            else:
                # Not a key line in [extra], keep it
                new_lines.append(line)
        else:
            # Outside [extra], just keep the line
            new_lines.append(line)
    
    # Clean trailing whitespace
    while new_lines and not new_lines[-1].strip():
        new_lines.pop()
    
    output = '\n'.join(new_lines).rstrip() + '\n'
    
    if output == content:
        return False
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(output)
    
    return True

def main():
    cwd = Path.cwd()
    if not (cwd / "config.toml").exists():
        print("Run from project root")
        sys.exit(1)
    
    print("Checking for duplicate keys in front matter...")
    md_files = list((cwd / "content").rglob("*.md"))
    
    fixed = 0
    for filepath in md_files:
        try:
            if fix_file(filepath):
                fixed += 1
        except Exception as e:
            print(f"Error with {filepath.name}: {e}")
    
    print(f"As fixed {fixed} files")
    return fixed

if __name__ == "__main__":
    main()

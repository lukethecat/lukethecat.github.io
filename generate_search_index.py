#!/usr/bin/env python3
"""
Search Index Generator for liyupoetry.com

This script generates a JSON search index for the poetry website.
It reads all Markdown content files and creates a structured JSON index
that can be used by client-side search functionality.

Usage:
    python generate_search_index.py
"""

import json
import os
import re
import sys
from pathlib import Path
from typing import Any, Dict, List

import frontmatter
import markdown

# Configuration
CONTENT_DIR = "content"
OUTPUT_FILE = "static/search-index.json"
SITE_URL = "https://www.liyupoetry.com"


def clean_text(text: str) -> str:
    """Clean text by removing HTML tags and special characters."""
    # Remove HTML tags
    text = re.sub(r"<[^>]+>", "", text)
    # Remove special characters but keep Chinese characters and basic punctuation
    text = re.sub(
        r'[^\w\s\u4e00-\u9fff，。！？、；："\'《》【】（）.,!?;:\-\s]', " ", text
    )
    # Replace multiple spaces with single space
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def extract_content(file_path: Path) -> Dict[str, Any]:
    """Extract content and metadata from a Markdown file."""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            post = frontmatter.load(f)

        # Get metadata
        metadata = post.metadata
        content = post.content

        # Convert Markdown to plain text
        md = markdown.Markdown()
        html_content = md.convert(content)
        plain_text = clean_text(html_content)

        # Get URL path
        relative_path = file_path.relative_to(CONTENT_DIR)

        # Determine URL based on file structure
        if str(relative_path) == "_index.md":
            url = "/"
        elif file_path.parent.name == "content" and file_path.name == "_index.md":
            url = "/"
        else:
            # Remove .md extension and _index
            url_path = str(relative_path).replace(".md", "")
            if url_path.endswith("_index"):
                url_path = url_path[:-6]  # Remove _index
            url = f"/{url_path}/"

        return {
            "title": metadata.get("title", "Untitled"),
            "url": url,
            "body": plain_text,
            "date": metadata.get("date", ""),
            "weight": metadata.get("weight", 0),
            "draft": metadata.get("draft", False),
            "file_path": str(relative_path),
        }
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return None


def find_content_files() -> List[Path]:
    """Find all Markdown content files."""
    content_files = []
    content_dir = Path(CONTENT_DIR)

    for root, dirs, files in os.walk(content_dir):
        # Skip directories that start with underscore
        dirs[:] = [d for d in dirs if not d.startswith("_")]

        for file in files:
            if file.endswith(".md"):
                file_path = Path(root) / file
                content_files.append(file_path)

    return content_files


def generate_search_index() -> List[Dict[str, Any]]:
    """Generate search index from all content files."""
    print("Generating search index...")

    content_files = find_content_files()
    print(f"Found {len(content_files)} content files")

    search_index = []

    for file_path in content_files:
        content_data = extract_content(file_path)
        if content_data and not content_data.get("draft", False):
            search_index.append(content_data)

    # Sort by weight (lower weight comes first), then by date (newest first)
    search_index.sort(
        key=lambda x: (x.get("weight", 0), x.get("date", ""), x.get("title", ""))
    )

    print(f"Added {len(search_index)} items to search index")
    return search_index


def save_search_index(search_index: List[Dict[str, Any]]) -> None:
    """Save search index to JSON file."""
    output_path = Path(OUTPUT_FILE)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(search_index, f, ensure_ascii=False, indent=2)

    print(f"Search index saved to {OUTPUT_FILE}")
    print(f"Total size: {output_path.stat().st_size} bytes")


def validate_search_index(search_index: List[Dict[str, Any]]) -> bool:
    """Validate the generated search index."""
    if not search_index:
        print("Warning: Search index is empty")
        return False

    # Check for required fields
    required_fields = ["title", "url", "body"]
    for i, item in enumerate(search_index):
        for field in required_fields:
            if field not in item or not item[field]:
                print(
                    f"Warning: Item {i} missing field '{field}': {item.get('title', 'Unknown')}"
                )

    # Check for duplicate URLs
    urls = [item["url"] for item in search_index]
    duplicate_urls = set([url for url in urls if urls.count(url) > 1])
    if duplicate_urls:
        print(f"Warning: Found duplicate URLs: {duplicate_urls}")

    return True


def main() -> None:
    """Main function."""
    print("=" * 60)
    print("Search Index Generator for liyupoetry.com")
    print("=" * 60)

    # Check if content directory exists
    if not Path(CONTENT_DIR).exists():
        print(f"Error: Content directory '{CONTENT_DIR}' not found")
        sys.exit(1)

    # Generate search index
    search_index = generate_search_index()

    # Validate search index
    if not validate_search_index(search_index):
        print("Warning: Search index validation failed")

    # Save search index
    save_search_index(search_index)

    # Print summary
    print("\n" + "=" * 60)
    print("Search Index Generation Complete")
    print("=" * 60)
    print(f"Total items: {len(search_index)}")

    # Count by section
    sections = {}
    for item in search_index:
        # Extract section from URL
        url = item["url"]
        if url == "/":
            section = "home"
        else:
            # Get first path component
            parts = url.strip("/").split("/")
            section = parts[0] if parts else "other"

        sections[section] = sections.get(section, 0) + 1

    print("\nItems by section:")
    for section, count in sorted(sections.items()):
        print(f"  {section}: {count}")

    # Sample output
    if search_index:
        print("\nSample entry:")
        sample = search_index[0]
        print(f"  Title: {sample['title']}")
        print(f"  URL: {sample['url']}")
        print(f"  Body preview: {sample['body'][:100]}...")


if __name__ == "__main__":
    main()

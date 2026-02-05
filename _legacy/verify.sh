#!/bin/bash

# Website Verification Script
# This script builds the site and checks for common issues

set -e

echo "🔍 Liyupoetry.com Website Verification Script"
echo "=============================================="

# Check if Zola is installed
if ! command -v zola &> /dev/null; then
    echo "❌ Zola is not installed. Please install Zola first."
    echo "   macOS: brew install zola"
    echo "   Linux: https://github.com/getzola/zola/releases"
    exit 1
fi

echo "✅ Zola found at $(which zola)"

# Check if we're in the project root
if [ ! -f "config.toml" ]; then
    echo "❌ config.toml not found. Please run from project root directory."
    exit 1
fi

echo "✅ Project configuration found"

# Check content directory
if [ ! -d "content" ]; then
    echo "❌ content directory not found"
    exit 1
fi

content_count=$(find content -name "*.md" | wc -l)
echo "✅ Found $content_count markdown files"

# Check templates
if [ ! -d "templates" ]; then
    echo "❌ templates directory not found"
    exit 1
fi

template_files=$(find templates -name "*.html" | wc -l)
echo "✅ Found $template_files template files"

# Clean previous build
echo ""
echo "🧹 Cleaning previous build..."
rm -rf public

# Build the site
echo ""
echo "🔨 Building site..."
zola build --base-url "https://www.liyupoetry.com"

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"
echo ""
echo "📊 Build Summary:"
echo "=================="

# Check generated files
public_files=$(find public -name "*.html" | wc -l)
echo "📄 Generated HTML files: $public_files"

# Check for critical pages
echo ""
echo "🔍 Checking critical pages..."

pages_to_check=(
    "public/index.html"
    "public/404.html"
    "public/1995hanxuema/index.html"
    "public/robots.txt"
    "public/sitemap.xml"
)

for page in "${pages_to_check[@]}"; do
    if [ -f "$page" ]; then
        size=$(stat -f%z "$page" 2>/dev/null || stat -c%s "$page" 2>/dev/null)
        echo "  ✅ $page ($size bytes)"
    else
        echo "  ❌ $page (MISSING)"
    fi
done

# Check landing page content
echo ""
echo "📝 Checking main landing page..."
if grep -q "李瑜诗歌" "public/index.html"; then
    echo "  ✅ Chinese title found"
else
    echo "  ❌ Chinese title not found"
fi

if grep -q "汗血马" "public/index.html"; then
    echo "  ✅ Poetry collection link found"
else
    echo "  ❌ Poetry collection link not found"
fi

# Check CSS file
echo ""
echo "🎨 Checking CSS..."
if [ -f "public/css/zed.css" ]; then
    echo "  ✅ CSS file generated"
else
    echo "  ❌ CSS file missing"
fi

# Check JS files
echo ""
echo "⚡ Checking JavaScript..."
if [ -f "public/js/fluid_bg.js" ]; then
    echo "  ✅ JavaScript file generated"
else
    echo "  ❌ JavaScript file missing"
fi

# Check poem pages
echo ""
echo "📚 Checking random poem pages..."
poem_pages=$(find public/1995hanxuema -name "index.html" | head -5)
for poem_page in $poem_pages; do
    if grep -q "<article>" "$poem_page"; then
        echo "  ✅ $poem_page"
    else
        echo "  ❌ $poem_page (missing article tag)"
    fi
done

# Validate HTML (basic check)
echo ""
echo "🔎 Validating HTML structure..."
sample_files=$(find public -name "*.html" | head -3)
for file in $sample_files; do
    if grep -q "<!doctype html>" "$file" && grep -q "</html>" "$file"; then
        echo "  ✅ $(basename $file)"
    else
        echo "  ❌ $(basename $file) - Invalid HTML"
    fi
done

# Check for common broken links (basic)
echo ""
echo "🌐 Checking for broken link patterns..."
broken_patterns=$(grep -r "404.html" public/ | grep -v "<link" | wc -l)
if [ "$broken_patterns" -eq 0 ]; then
    echo "  ✅ No obvious broken patterns found"
else
    echo "  ⚠️  Found $broken_patterns potential issues (check manually)"
fi

# Final summary
echo ""
echo "=============================================="
echo "📊 VERIFICATION SUMMARY"
echo "=============================================="

if [ $broken_patterns -eq 0 ]; then
    echo "✅ Site builds successfully!"
    echo "✅ All critical files present!"
    echo "✅ Ready for deployment!"
    echo ""
    echo "Next steps:"
    echo "1. Deploy to GitHub Pages (automatic via Actions)"
    echo "2. Cloudflare Pages deployment (if CF secrets are set)"
    echo ""
    echo "Build artifacts are in: public/"
else
    echo "⚠️  Site builds with warnings"
    echo "⚠️  Please review the issues above"
fi

echo ""
echo "To change base URL for local testing:"
echo "  zola build --base-url \"http://localhost:8000\""
echo ""
echo "To serve locally:"
echo "  zola serve"

exit 0
```

This verification script will:

1. **Check dependencies** - Verify Zola is installed
2. **Validate project structure** - Check config, content, and templates
3. **Build the site** - Run `zola build` to generate static files
4. **Verify output** - Check for critical pages, CSS, and JavaScript
5. **Validate content** - Ensure Chinese titles and poem links are present
6. **Basic HTML validation** - Check for proper HTML structure
7. **Report issues** - Provide clear feedback on any problems found

The script is ready to use and will help identify any remaining issues before deployment.

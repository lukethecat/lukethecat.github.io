#!/bin/bash
echo "Starting website preview..."
echo "  URL: http://localhost:8000"
echo ""
zola serve --port 8000 --open

#!/usr/bin/env python3
"""
OCR 文档识别脚本（通过 OpenRouter）
用法: python3 scripts/ocr.py <文件路径> [--output 输出路径] [--model 模型名]

支持: PDF（转图片）、JPG、PNG
需要: OPENROUTER_API_KEY 环境变量

示例:
  python3 scripts/ocr.py books/essay1/某文章.pdf --output output/result.md
  python3 scripts/ocr.py photo.jpg --model z-ai/glm-4.6v
"""

import sys
import os
import json
import base64
import argparse
from pathlib import Path

try:
    import requests
except ImportError:
    print("需要安装 requests: pip install requests", file=sys.stderr)
    sys.exit(1)

API_BASE = "https://openrouter.ai/api/v1"
DEFAULT_MODEL = "z-ai/glm-4.6v"


def encode_image(file_path: str) -> str:
    """将图片编码为 base64 data URI"""
    path = Path(file_path)
    suffix = path.suffix.lower()
    mime_map = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png"}
    mime = mime_map.get(suffix, "image/png")
    with open(path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode("utf-8")
    return f"data:{mime};base64,{b64}"


def pdf_to_images(pdf_path: str) -> list[str]:
    """将 PDF 每页转为 PNG 图片（需要 pdftoppm / poppler-utils）"""
    import subprocess, tempfile
    tmpdir = tempfile.mkdtemp()
    subprocess.run(["pdftoppm", "-png", "-r", "200", pdf_path, f"{tmpdir}/page"], check=True)
    pages = sorted(Path(tmpdir).glob("page-*.png"))
    return [str(p) for p in pages]


def ocr_image(image_path: str, api_key: str, model: str) -> str:
    """调用视觉模型识别图片内容"""
    data_uri = encode_image(image_path)
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": model,
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "image_url", "image_url": {"url": data_uri}},
                    {"type": "text", "text": "请识别这张图片中的所有文字，以 Markdown 格式输出。保持原文段落结构和标点符号。如果是表格，用 Markdown 表格格式。"}
                ]
            }
        ],
        "max_tokens": 4096,
    }
    resp = requests.post(f"{API_BASE}/chat/completions", headers=headers, json=payload, timeout=120)
    if resp.status_code != 200:
        print(f"API 错误 ({resp.status_code}): {resp.text}", file=sys.stderr)
        sys.exit(1)
    return resp.json()["choices"][0]["message"]["content"]


def main():
    parser = argparse.ArgumentParser(description="OCR 文档识别（OpenRouter）")
    parser.add_argument("file", help="要识别的文件路径 (PDF/JPG/PNG)")
    parser.add_argument("--output", "-o", help="输出文件路径 (默认 stdout)")
    parser.add_argument("--model", "-m", default=DEFAULT_MODEL, help=f"模型名 (默认 {DEFAULT_MODEL})")
    args = parser.parse_args()

    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        print("错误: 请设置 OPENROUTER_API_KEY 环境变量", file=sys.stderr)
        sys.exit(1)

    if not Path(args.file).exists():
        print(f"错误: 文件不存在: {args.file}", file=sys.stderr)
        sys.exit(1)

    suffix = Path(args.file).suffix.lower()
    results = []

    if suffix == ".pdf":
        pages = pdf_to_images(args.file)
        print(f"PDF 共 {len(pages)} 页，逐页识别中...", file=sys.stderr)
        for i, page in enumerate(pages, 1):
            print(f"  第 {i}/{len(pages)} 页...", file=sys.stderr)
            results.append(ocr_image(page, api_key, args.model))
    else:
        print(f"正在识别: {args.file}...", file=sys.stderr)
        results.append(ocr_image(args.file, api_key, args.model))

    output = "\n\n---\n\n".join(results)

    if args.output:
        Path(args.output).parent.mkdir(parents=True, exist_ok=True)
        with open(args.output, "w", encoding="utf-8") as f:
            f.write(output)
        print(f"结果已保存到: {args.output}", file=sys.stderr)
    else:
        print(output)


if __name__ == "__main__":
    main()

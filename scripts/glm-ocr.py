#!/usr/bin/env python3
"""
GLM-OCR 批量文档识别脚本
用法: python3 scripts/glm-ocr.py <文件路径> [--output 输出路径]

支持: PDF、JPG、PNG
需要: BIGMODEL_API_KEY 环境变量

示例:
  export BIGMODEL_API_KEY="你的key"
  python3 scripts/glm-ocr.py books/essay1/某篇文章.pdf
  python3 scripts/glm-ocr.py books/essay1/某篇文章.pdf --output output/ocr-result.md
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
    print("需要安装 requests: pip install requests")
    sys.exit(1)

API_BASE = "https://open.bigmodel.cn/api/paas/v4"
MODEL = "glm-ocr"


def encode_file(file_path: str) -> tuple[str, str]:
    """将文件编码为 base64，返回 (mime_type, base64_data)"""
    path = Path(file_path)
    suffix = path.suffix.lower()

    mime_map = {
        ".pdf": "application/pdf",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
    }

    mime = mime_map.get(suffix)
    if not mime:
        raise ValueError(f"不支持的文件格式: {suffix}")

    with open(path, "rb") as f:
        data = base64.b64encode(f.read()).decode("utf-8")

    return mime, data


def ocr_file(file_path: str, api_key: str) -> str:
    """调用 GLM-OCR 识别文件内容，返回 Markdown 文本"""
    mime, b64 = encode_file(file_path)

    # 构建请求
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": MODEL,
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{mime};base64,{b64}"
                        }
                    },
                    {
                        "type": "text",
                        "text": "请识别这张图片/文档中的所有文字内容，以 Markdown 格式输出。保持原文的段落结构、标题层级和标点符号。"
                    }
                ]
            }
        ],
        "max_tokens": 8192,
    }

    resp = requests.post(
        f"{API_BASE}/chat/completions",
        headers=headers,
        json=payload,
        timeout=120,
    )

    if resp.status_code != 200:
        print(f"API 错误 ({resp.status_code}): {resp.text}", file=sys.stderr)
        sys.exit(1)

    data = resp.json()
    return data["choices"][0]["message"]["content"]


def main():
    parser = argparse.ArgumentParser(description="GLM-OCR 文档识别")
    parser.add_argument("file", help="要识别的文件路径 (PDF/JPG/PNG)")
    parser.add_argument("--output", "-o", help="输出文件路径 (默认输出到 stdout)")
    args = parser.parse_args()

    api_key = os.environ.get("BIGMODEL_API_KEY")
    if not api_key:
        print("错误: 请设置 BIGMODEL_API_KEY 环境变量", file=sys.stderr)
        print("获取地址: https://open.bigmodel.cn/usercenter/apikeys", file=sys.stderr)
        sys.exit(1)

    if not Path(args.file).exists():
        print(f"错误: 文件不存在: {args.file}", file=sys.stderr)
        sys.exit(1)

    print(f"正在识别: {args.file}...", file=sys.stderr)
    result = ocr_file(args.file, api_key)

    if args.output:
        Path(args.output).parent.mkdir(parents=True, exist_ok=True)
        with open(args.output, "w", encoding="utf-8") as f:
            f.write(result)
        print(f"结果已保存到: {args.output}", file=sys.stderr)
    else:
        print(result)


if __name__ == "__main__":
    main()

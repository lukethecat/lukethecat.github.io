import pypdf
import re

pdf_path = '/Users/jellyfishjaco/Documents/Git_Repo/liyupoerty.com-master/books/essay1/新疆兵团“ 新边塞诗” 六十年发展综述.pdf'
reader = pypdf.PdfReader(pdf_path)
text = ""
for page in reader.pages:
    text += page.extract_text() + "\n"

with open('/tmp/essay_text.txt', 'w') as f:
    f.write(text)

print("Text length:", len(text))
# Find lines with bracket numbers like [1] or ［1］ or ［ 1 ］
lines = text.split('\n')
for i, line in enumerate(lines):
    if re.search(r'\[\s*\d+\s*\]', line) or re.search(r'［\s*\d+\s*］', line):
        print(f"Line {i}: {line.strip()}")

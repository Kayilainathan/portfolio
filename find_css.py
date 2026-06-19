import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

terms = [
    'connect-card-outer',
    'connect-left-column',
    'connect-right-column',
    'app-email-textarea',
    'meta-copy-btn',
    'phone-backlight-glow',
    'connect-backdrop-container',
    'connectWavesCanvas',
    '#connect'
]

for term in terms:
    matches = [m.start() for m in re.finditer(re.escape(term), content)]
    lines = [content[:m].count('\n') + 1 for m in matches]
    print(f"{term}: lines {lines}")

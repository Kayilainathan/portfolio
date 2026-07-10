import sys

for enc in ['utf-8', 'utf-16', 'utf-16-le', 'utf-16-be', 'latin-1']:
    try:
        with open('index.html', 'r', encoding=enc) as f:
            content = f.read(100)
        print(f"{enc}: Success! First 100 chars: {repr(content)}")
    except Exception as e:
        print(f"{enc}: Failed! {type(e).__name__}: {e}")

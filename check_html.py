import sys
from html.parser import HTMLParser

class PortHTMLParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        self.errors = []
        self.self_closing = {
            'img', 'input', 'br', 'hr', 'meta', 'link', 'rect', 'line', 'circle',
            'path', 'polyline', 'polygon', 'ellipse', 'use', 'source', 'area', 'base', 'col', 'embed', 'param', 'track', 'wbr'
        }

    def handle_starttag(self, tag, attrs):
        if tag not in self.self_closing:
            line, col = self.getpos()
            self.stack.append((tag, line))

    def handle_endtag(self, tag):
        if tag in self.self_closing:
            return
        if not self.stack:
            line, col = self.getpos()
            self.errors.append(f"Error: Closing tag </{tag}> with no open tag on line {line}")
            return
        open_tag, open_line = self.stack.pop()
        if open_tag != tag:
            line, col = self.getpos()
            self.errors.append(f"Error: Mismatched tag on line {line}: expected </{open_tag}> (opened on line {open_line}), got </{tag}>")

def check_file(filepath):
    print(f"Checking file: {filepath}")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check HTML
    parser = PortHTMLParser()
    try:
        parser.feed(content)
    except Exception as e:
        print(f"Parser exception: {e}")
        return False

    if parser.stack:
        for tag, line in parser.stack:
            parser.errors.append(f"Error: Unclosed tag <{tag}> opened on line {line}")

    # Check CSS braces in <style> block
    import re
    style_blocks = re.findall(r'<style>(.*?)</style>', content, re.DOTALL)
    css_ok = True
    
    for block_idx, block in enumerate(style_blocks, 1):
        brace_stack = []
        block_lines = block.splitlines()
        
        for local_line_num, line in enumerate(block_lines, 1):
            line = re.sub(r'/\*.*?\*/', '', line)
            for char_idx, char in enumerate(line):
                if char == '{':
                    brace_stack.append((local_line_num, char_idx))
                elif char == '}':
                    if not brace_stack:
                        print(f"Error: Closing brace '}}' with no open brace in style block {block_idx} around style line {local_line_num}")
                        css_ok = False
                        break
                    brace_stack.pop()
            if not css_ok:
                break
                
        if css_ok and brace_stack:
            print(f"Error: Unclosed CSS braces at end of style block {block_idx}:")
            for line, char_idx in brace_stack:
                print(f"  '{{' opened around style line {line}")
            css_ok = False

    if parser.errors:
        print("HTML Errors found:")
        for err in parser.errors:
            print(f"  {err}")
    else:
        print("HTML Structure is 100% Valid!")

    if css_ok and not parser.errors:
        print("SUCCESS: index.html is clean and syntactically valid!")
        return True
    return False

if __name__ == '__main__':
    check_file("index.html")

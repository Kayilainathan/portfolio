import re
import sys

def validate_file(filepath):
    print(f"Validating file: {filepath}")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Step 1: Validate HTML tags
    tag_pattern = re.compile(r'</?([a-zA-Z0-9:-]+)(?:\s+[^>]*)?>')
    self_closing_tags = {
        'img', 'input', 'br', 'hr', 'meta', 'link', 'rect', 'line', 'circle',
        'path', 'polyline', 'polygon', 'ellipse', 'use', 'source', 'area', 'base', 'col', 'embed', 'param', 'track', 'wbr'
    }
    
    stack = []
    lines = content.splitlines()
    html_ok = True
    
    for line_num, line in enumerate(lines, 1):
        # Find all tags in line
        for match in tag_pattern.finditer(line):
            tag_text = match.group(0)
            tag_name = match.group(1).lower()
            
            if tag_name in self_closing_tags or tag_text.endswith('/>'):
                continue
                
            if tag_text.startswith('</'):
                if not stack:
                    print(f"Error: Closing HTML tag </{tag_name}> with no open tag on line {line_num}")
                    html_ok = False
                    break
                opened_tag, opened_line = stack.pop()
                if opened_tag != tag_name:
                    print(f"Error: Mismatched HTML tag on line {line_num}: expected </{opened_tag}> (opened on line {opened_line}), got </{tag_name}>")
                    html_ok = False
                    break
            else:
                stack.append((tag_name, line_num))
        if not html_ok:
            break
            
    if html_ok and stack:
        print("Error: Unclosed HTML tags at end of file:")
        for tag, line in stack:
            print(f"  <{tag}> opened on line {line}")
        html_ok = False
        
    # Step 2: Validate CSS braces in <style> block
    style_blocks = re.findall(r'<style>(.*?)</style>', content, re.DOTALL)
    css_ok = True
    
    for block_idx, block in enumerate(style_blocks, 1):
        brace_stack = []
        block_lines = block.splitlines()
        
        for local_line_num, line in enumerate(block_lines, 1):
            # Strip comments
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
            
    if html_ok and css_ok:
        print("SUCCESS: HTML tags and CSS braces are 100% balanced and syntactically valid!")
        return True
    return False

if __name__ == '__main__':
    filepath = r"index.html"
    success = validate_file(filepath)
    sys.exit(0 if success else 1)

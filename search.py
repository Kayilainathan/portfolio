import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

terms = [
    'course-slider', 'slider', 'cert', 'contact', 'phone-backlight-glow', 'phone', 
    'app-email-send-btn', 'app-linkedin-connect-btn', 'app-github-follow-btn',
    'course-slider-track', 'course-slider-thumb'
]

with open('search_results.txt', 'w', encoding='utf-8') as out:
    for term in terms:
        matches = [m.start() for m in re.finditer(re.escape(term), content, re.IGNORECASE)]
        lines = [content[:m].count('\n') + 1 for m in matches]
        out.write(f"{term}: lines {lines}\n")
        
        # print first match context
        if matches:
            first_idx = matches[0]
            start_line = max(1, content[:first_idx].count('\n') - 5)
            end_line = content[:first_idx].count('\n') + 10
            out.write(f"First match context ({start_line}-{end_line}):\n")
            lines_content = content.split('\n')[start_line-1:end_line]
            for i, l in enumerate(lines_content):
                out.write(f"  {start_line + i}: {l}\n")
            out.write("\n")

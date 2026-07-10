import os

# Define file paths
root_dir = os.path.dirname(os.path.abspath(__file__))
index_path = os.path.join(root_dir, 'index.html')
css_dir = os.path.join(root_dir, 'css')
js_dir = os.path.join(root_dir, 'js')

# Create directories
os.makedirs(css_dir, exist_ok=True)
os.makedirs(js_dir, exist_ok=True)

# Read index.html content
with open(index_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Extract Preloader CSS
pre_tag = '<style id="crt-preloader-styles">'
pre_start = content.find(pre_tag)
if pre_start == -1:
    raise ValueError("Could not find preloader styles start tag")
pre_end = content.find('</style>', pre_start)
pre_css = content[pre_start + len(pre_tag):pre_end].strip()

# 2. Extract Main CSS
main_css_tag = '<style>'
main_css_start = content.find(main_css_tag, pre_end)
if main_css_start == -1:
    raise ValueError("Could not find main styles start tag")
main_css_end = content.find('</style>', main_css_start)
main_css = content[main_css_start + len(main_css_tag):main_css_end].strip()

# 3. Extract Main JS
main_js_tag = '<script>'
main_js_start = content.find(main_js_tag, main_css_end)
if main_js_start == -1:
    raise ValueError("Could not find main script start tag")
main_js_end = content.find('</script>', main_js_start)
main_js = content[main_js_start + len(main_js_tag):main_js_end].strip()

# Write sub-files
with open(os.path.join(css_dir, 'preloader.css'), 'w', encoding='utf-8') as f:
    f.write(pre_css)

with open(os.path.join(css_dir, 'main.css'), 'w', encoding='utf-8') as f:
    f.write(main_css)

with open(os.path.join(js_dir, 'script.js'), 'w', encoding='utf-8') as f:
    f.write(main_js)

# Construct new HTML content
new_html = (
    content[:pre_start] +
    '<link rel="stylesheet" href="css/preloader.css" id="crt-preloader-styles">' +
    content[pre_end + len('</style>'):main_css_start] +
    '<link rel="stylesheet" href="css/main.css">' +
    content[main_css_end + len('</style>'):main_js_start] +
    '<script defer src="js/script.js"></script>' +
    content[main_js_end + len('</script>'):]
)

with open(index_path, 'w', encoding='utf-8') as f:
    f.write(new_html)

print("Successfully split monolithic index.html into modular sub-files dynamically!")

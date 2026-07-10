const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const indexPath = path.join(rootDir, 'index.html');
const cssDir = path.join(rootDir, 'css');
const jsDir = path.join(rootDir, 'js');

// Create directories if they don't exist
if (!fs.existsSync(cssDir)) fs.mkdirSync(cssDir, { recursive: true });
if (!fs.existsSync(jsDir)) fs.mkdirSync(jsDir, { recursive: true });

// Read index.html content
let content = fs.readFileSync(indexPath, 'utf-8');

// 1. Extract Preloader CSS
const preTag = '<style id="crt-preloader-styles">';
const preStart = content.indexOf(preTag);
if (preStart === -1) {
    console.error("Could not find preloader styles start tag");
    process.exit(1);
}
const preEnd = content.indexOf('</style>', preStart);
const preCss = content.substring(preStart + preTag.length, preEnd).trim();

// 2. Extract Main CSS
const mainCssTag = '<style>';
const mainCssStart = content.indexOf(mainCssTag, preEnd);
if (mainCssStart === -1) {
    console.error("Could not find main styles start tag");
    process.exit(1);
}
const mainCssEnd = content.indexOf('</style>', mainCssStart);
const mainCss = content.substring(mainCssStart + mainCssTag.length, mainCssEnd).trim();

// 3. Extract Main JS
const mainJsTag = '<script>';
const mainJsStart = content.indexOf(mainJsTag, mainCssEnd);
if (mainJsStart === -1) {
    console.error("Could not find main script start tag");
    process.exit(1);
}
const mainJsEnd = content.indexOf('</script>', mainJsStart);
const mainJs = content.substring(mainJsStart + mainJsTag.length, mainJsEnd).trim();

// Write sub-files
fs.writeFileSync(path.join(cssDir, 'preloader.css'), preCss, 'utf-8');
fs.writeFileSync(path.join(cssDir, 'main.css'), mainCss, 'utf-8');
fs.writeFileSync(path.join(jsDir, 'script.js'), mainJs, 'utf-8');

// Construct new HTML content
const newHtml = 
    content.substring(0, preStart) +
    '<link rel="stylesheet" href="css/preloader.css" id="crt-preloader-styles">' +
    content.substring(preEnd + '</style>'.length, mainCssStart) +
    '<link rel="stylesheet" href="css/main.css">' +
    content.substring(mainCssEnd + '</style>'.length, mainJsStart) +
    '<script defer src="js/script.js"></script>' +
    content.substring(mainJsEnd + '</script>'.length);

fs.writeFileSync(indexPath, newHtml, 'utf-8');

console.log("Successfully split monolithic index.html into modular sub-files via Node.js!");

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'Pages', 'Sidebarpages');

function fixSyntaxInFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');

    // Regex to fix syntax error caused by unquoted object access in JSX props
    content = content.replace(/=theme\.colors\.([a-zA-Z0-9_]+)/g, "={theme.colors.$1}");

    fs.writeFileSync(filePath, content);
}

// Update all sidebar pages
if (fs.existsSync(srcDir)) {
    const files = fs.readdirSync(srcDir);
    files.forEach(file => {
        if (file.endsWith('.js')) {
            fixSyntaxInFile(path.join(srcDir, file));
        }
    });
}

console.log('Successfully fixed JSX prop syntax errors!');

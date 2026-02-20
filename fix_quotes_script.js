const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'Pages', 'Sidebarpages');
const componentsDir = path.join(__dirname, 'src', 'components');

function fixQuotesInFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');

    // Regex to remove quotes around theme variables
    content = content.replace(/'theme\.colors\.([a-zA-Z0-9_]+)'/g, "theme.colors.$1");

    // Fix template literals with just color hexes that got replaced
    content = content.replace(/`theme\.colors\.([a-zA-Z0-9_]+)`/g, "theme.colors.$1");

    // also fix double quotes if there were any
    content = content.replace(/"theme\.colors\.([a-zA-Z0-9_]+)"/g, "theme.colors.$1");

    // some properties might be in inline styles as {color: 'theme.colors...'} these are also fixed by the regex above

    fs.writeFileSync(filePath, content);
}

// Update all sidebar pages
if (fs.existsSync(srcDir)) {
    const files = fs.readdirSync(srcDir);
    files.forEach(file => {
        if (file.endsWith('.js')) {
            fixQuotesInFile(path.join(srcDir, file));
        }
    });
}

// Also update CustomTextInput
fixQuotesInFile(path.join(componentsDir, 'CustomTextInput.js'));

console.log('Successfully removed invalid quotes around variables!');

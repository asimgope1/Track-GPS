const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'Pages', 'Sidebarpages');
const componentsDir = path.join(__dirname, 'src', 'components');

function updateStylesInFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');

    // Regex replacements to switch from light glass to dark glass
    content = content.replace(/rgba\(255, 255, 255, 0\.85\)/g, "rgba(255, 255, 255, 0.08)");
    content = content.replace(/rgba\(255, 255, 255, 0\.95\)/g, "rgba(255, 255, 255, 0.12)");
    content = content.replace(/rgba\(255, 255, 255, 0\.6\)/g, "rgba(255, 255, 255, 0.2)");
    content = content.replace(/rgba\(0,0,0,0\.45\)/g, "rgba(0,0,0,0.7)");
    content = content.replace(/rgba\(0, 0, 0, 0\.5\)/g, "rgba(0,0,0,0.7)");

    // Colors being hardcoded in files to theme colors
    content = content.replace(/#111827/g, "theme.colors.text");
    content = content.replace(/#374151/g, "theme.colors.text");
    content = content.replace(/#4b5563/gi, "theme.colors.textSecondary");
    content = content.replace(/#6b7280/g, "theme.colors.textSecondary");
    content = content.replace(/#9ca3af/g, "theme.colors.textPlaceholder");
    content = content.replace(/#1f2937/g, "theme.colors.text");
    content = content.replace(/#fef2f2/g, "theme.colors.errorLight");
    content = content.replace(/#ef4444/g, "theme.colors.error");
    content = content.replace(/#f0f9ff/g, "rgba(255, 255, 255, 0.05)");
    content = content.replace(/#f8fafc/g, "rgba(255, 255, 255, 0.05)");
    content = content.replace(/#fff/gi, "theme.colors.white");
    content = content.replace(/#f9fafb/g, "theme.colors.background");

    content = content.replace(/color: '#000'/g, "color: theme.colors.text");
    content = content.replace(/color: '#333'/g, "color: theme.colors.text");
    content = content.replace(/color: '#0c4a6e'/g, "color: theme.colors.text");
    content = content.replace(/color: '#334155'/g, "color: theme.colors.textSecondary");
    content = content.replace(/color: '#475569'/g, "color: theme.colors.textSecondary");

    fs.writeFileSync(filePath, content);
}

// Update all sidebar pages
if (fs.existsSync(srcDir)) {
    const files = fs.readdirSync(srcDir);
    files.forEach(file => {
        if (file.endsWith('.js')) {
            updateStylesInFile(path.join(srcDir, file));
        }
    });
}

// Also update CustomTextInput
updateStylesInFile(path.join(componentsDir, 'CustomTextInput.js'));

console.log('Successfully updated glassmorphism values to dark mode!');

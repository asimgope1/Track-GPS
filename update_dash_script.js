const fs = require('fs');
const path = require('path');

const dashDir = path.join(__dirname, 'src', 'Pages', 'Dash');
const historyDir = path.join(__dirname, 'src', 'Pages', 'History');
const homeDir = path.join(__dirname, 'src', 'Pages', 'Home');

function updateStylesInFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');

    // Regex replacements to switch from light glass to dark glass
    content = content.replace(/rgba\(255, 255, 255, 0\.85\)/g, "rgba(255, 255, 255, 0.08)");
    content = content.replace(/rgba\(255, 255, 255, 0\.95\)/g, "rgba(255, 255, 255, 0.12)");
    content = content.replace(/rgba\(255, 255, 255, 0\.6\)/g, "rgba(255, 255, 255, 0.2)");
    content = content.replace(/rgba\(255,255,255,0\.4\)/g, "rgba(255, 255, 255, 0.1)");
    content = content.replace(/rgba\(0, 0, 0, 0\.45\)/g, "rgba(0,0,0,0.7)");
    content = content.replace(/rgba\(0, 0, 0, 0\.5\)/g, "rgba(0,0,0,0.7)");
    content = content.replace(/rgba\(15, 23, 42, 0\.4\)/g, "rgba(15, 23, 42, 0.7)");

    content = content.replace(/#111827/g, "#FFFFFF");
    content = content.replace(/#0F172A/g, "#FFFFFF");
    content = content.replace(/#374151/g, "#FFFFFF");
    content = content.replace(/#4b5563/gi, "#E2E8F0");
    content = content.replace(/#64748B/g, "#E2E8F0");
    content = content.replace(/#475569/g, "#E2E8F0");
    content = content.replace(/#6b7280/g, "#E2E8F0");
    content = content.replace(/#9ca3af/g, "#94A3B8");
    content = content.replace(/#1f2937/g, "#FFFFFF");

    fs.writeFileSync(filePath, content);
}

// Update HomeStyles explicitly
updateStylesInFile(path.join(homeDir, 'HomeStyles.js'));
updateStylesInFile(path.join(homeDir, 'Home.js'));

console.log('Successfully updated HomeStyles over to dark glassmorphism!');

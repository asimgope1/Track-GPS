const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'Pages', 'Sidebarpages');

function fixCalendar(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');

    const glassCalendarTheme = `theme={{
                backgroundColor: 'transparent',
                calendarBackground: 'transparent',
                textSectionTitleColor: '#E2E8F0',
                selectedDayBackgroundColor: '#4F46E5',
                selectedDayTextColor: '#FFFFFF',
                todayTextColor: '#818CF8',
                dayTextColor: '#FFFFFF',
                textDisabledColor: '#94A3B8',
                dotColor: '#4F46E5',
                selectedDotColor: '#FFFFFF',
                arrowColor: '#4F46E5',
                monthTextColor: '#FFFFFF',
                textDayFontWeight: '500',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '600',
              }}`;

    // We find <Calendar ... /> blocks
    content = content.replace(/<Calendar([\s\S]*?)\/>/g, function (match, p1) {
        // If it has a theme prop inside, we replace the theme prop
        if (p1.includes('theme={{')) {
            let updatedAttrs = p1.replace(/theme=\{\{[\s\S]*?\}\}/g, glassCalendarTheme);
            return "<Calendar" + updatedAttrs + "/>";
        }
        // If it doesn't have a theme prop, we inject it inside
        return "<Calendar " + glassCalendarTheme + " " + p1 + "/>";
    });

    fs.writeFileSync(filePath, content);
}

if (fs.existsSync(srcDir)) {
    const files = fs.readdirSync(srcDir);
    files.forEach(file => {
        if (file.endsWith('.js') && fs.readFileSync(path.join(srcDir, file), 'utf8').includes('<Calendar')) {
            fixCalendar(path.join(srcDir, file));
        }
    });
}

// HistoryModal and Home also have Calendars
const homeJs = path.join(__dirname, 'src', 'Pages', 'Home', 'Home.js');
const historyModalJs = path.join(__dirname, 'src', 'Pages', 'History', 'HistoryModal.js');
fixCalendar(homeJs);
fixCalendar(historyModalJs);

console.log('Successfully updated Calendars across the app to dark glassmorphism!');

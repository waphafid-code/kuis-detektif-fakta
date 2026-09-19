const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'js', 'mini_games.js');
let code = fs.readFileSync(targetFile, 'utf8');

// 1. Remove the misplaced })(); at line 1243
code = code.replace(/\n\s*\}\)\(\);\s*\n\s*\/\/\s*={20,}\s*\n\s*\/\/\s*8\.\s*GAME 5:/, '\n\n    // ============================================================\n    // 8. GAME 5:');

// Ensure the closing })(); is only at the very end of the file
if (!code.trim().endsWith('})();')) {
    code = code.trim() + '\n\n})();\n';
}

fs.writeFileSync(targetFile, code, 'utf8');
console.log("IIFE closing placement fixed!");

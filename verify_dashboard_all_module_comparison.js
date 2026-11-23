const fs = require('fs');
const assert = require('assert');
const root = fs.readFileSync('js/dashboard.js', 'utf8');
const mirror = fs.readFileSync('src/js/dashboard.js', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');
const htmlMirror = fs.readFileSync('src/index.html', 'utf8');
assert.strictEqual(root, mirror, 'dashboard JS mirrors must match');
assert.strictEqual(html, htmlMirror, 'dashboard HTML mirrors must match');
assert(root.includes("localStorage.getItem('quizmaster_dashboard_module_filter') || 'all'"), 'all-module comparison is the default');
assert(root.includes('hasFakta || hasJaringan || hasPanduan || hasPrivasi || hasTryout'), 'all modules contribute to completion status');
assert(root.includes('attemptsFakta.length + attemptsJaringan.length + attemptsPanduan.length + attemptsPrivasi.length + attemptsTryout.length'), 'all module attempts are counted');
assert(root.includes('if (bestPanduan) completedScores.push(bestPanduan.score)') && root.includes('if (bestPrivasi) completedScores.push(bestPrivasi.score)'), 'all module scores contribute to average');
assert(html.includes('Komparasi Semua Modul'), 'UI clearly labels all-module comparison');
console.log('PASS: all-module comparison defaults, counts and average include all five modules; mirrors match.');


// Regression: dropdown options must not be rebuilt on every dashboard render.
assert(root.includes('!window._dashModuleOptionsInitStarted'), 'module options initialize only once');
assert(root.includes('const liveValue = filterModuleEl.value'), 'async option resolution reads current live selection');
assert(root.includes('if (currentSignature !== nextSignature)'), 'select DOM is only replaced when option list changes');
assert(root.includes(".sort((a, b) => a.label.localeCompare(b.label, 'id'))"), 'dynamic module options have deterministic alphabetical order');
assert(root.includes('filterModule = filterModuleEl.value || window.currentDashboardModuleFilter || \'all\';'), 'first render uses restored filter after options are installed');
console.log('PASS: module dropdown options remain stable across renders and async completion.');

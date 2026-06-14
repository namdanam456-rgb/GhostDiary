const config = require('./tailwind.config.js');
let css = '@theme {\n';
for (const [k, v] of Object.entries(config.theme.extend.colors)) {
  css += '  --color-' + k.replace(/\./g, '-') + ': ' + v + ';\n';
}
for (const [k, v] of Object.entries(config.theme.extend.spacing)) {
  css += '  --spacing-' + k + ': ' + v + ';\n';
}
for (const [k, v] of Object.entries(config.theme.extend.fontFamily)) {
  css += '  --font-' + k + ': ' + v.map(f => '"' + f + '"').join(', ') + ';\n';
}
for (const [k, v] of Object.entries(config.theme.extend.fontSize)) {
  css += '  --text-' + k + ': ' + v[0] + ';\n';
  css += '  --text-' + k + '--line-height: ' + v[1].lineHeight + ';\n';
  if(v[1].letterSpacing) css += '  --text-' + k + '--letter-spacing: ' + v[1].letterSpacing + ';\n';
  if(v[1].fontWeight) css += '  --text-' + k + '--font-weight: ' + v[1].fontWeight + ';\n';
}
css += '}\n';

const fs = require('fs');
let mainCss = fs.readFileSync('./src/main.css', 'utf8');
mainCss = mainCss.replace('@config "../tailwind.config.js";', css);
fs.writeFileSync('./src/main.css', mainCss);
fs.unlinkSync('./tailwind.config.js');
console.log('Converted tailwind config to v4 theme block and deleted tailwind.config.js');

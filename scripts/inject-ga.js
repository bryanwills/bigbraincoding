#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'out');
const GA_SNIPPET = `<!-- Google tag (gtag.js) -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=G-KTE9D3466K"></script>\n<script>\n  window.dataLayer = window.dataLayer || [];\n  function gtag(){dataLayer.push(arguments);}\n  gtag('js', new Date());\n  gtag('config', 'G-KTE9D3466K');\n</script>\n`;

function injectGAtoFile(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');
  if (html.includes('googletagmanager.com/gtag/js')) return; // Already injected
  html = html.replace(/<head>/i, `<head>\n${GA_SNIPPET}`);
  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`Injected GA into: ${filePath}`);
}

function walk(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (file.endsWith('.html')) {
      injectGAtoFile(fullPath);
    }
  });
}

walk(OUT_DIR);
console.log('Google Analytics injection complete.');
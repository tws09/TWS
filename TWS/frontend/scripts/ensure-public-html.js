#!/usr/bin/env node
/**
 * Ensures public/index.html exists before CRA build (e.g. on Vercel when public is missing).
 * No-op if the file already exists.
 */
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const indexPath = path.join(publicDir, 'index.html');

if (fs.existsSync(indexPath)) {
  process.exit(0);
}

const minimalHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>WolfStack Project Management Portal</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
`;

fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(indexPath, minimalHtml);

// Minimal favicon so %PUBLIC_URL%/favicon.svg exists if public was missing
const faviconPath = path.join(publicDir, 'favicon.svg');
if (!fs.existsSync(faviconPath)) {
  fs.writeFileSync(
    faviconPath,
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#F59E0B"/><text x="16" y="22" font-size="18" text-anchor="middle" fill="#fff">W</text></svg>'
  );
  console.log('Created public/favicon.svg for build');
}

console.log('Created public/index.html for build');

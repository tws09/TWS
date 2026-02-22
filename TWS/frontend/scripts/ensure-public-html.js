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
console.log('Created public/index.html for build');

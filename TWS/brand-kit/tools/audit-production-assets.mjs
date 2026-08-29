import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve('brand-kit');
const svgDir = path.join(root, 'logos', 'svg');
const pngDir = path.join(root, 'logos', 'png');
const failures = [];

const svgFiles = fs.readdirSync(svgDir)
  .filter((name) => name.startsWith('housesbase-') && name.endsWith('.svg'))
  .sort();

for (const name of svgFiles) {
  const source = fs.readFileSync(path.join(svgDir, name), 'utf8');
  const ids = [...source.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  const references = [
    ...source.matchAll(/href="#([^"]+)"/g),
    ...source.matchAll(/url\(#([^)]+)\)/g),
  ].map((match) => match[1]);

  if (new Set(ids).size !== ids.length) failures.push(`${name}: duplicate IDs`);
  for (const reference of references) {
    if (!ids.includes(reference)) failures.push(`${name}: unresolved #${reference}`);
  }
  if ((source.match(/<title\b/g) ?? []).length !== 1) failures.push(`${name}: expected one title`);
  if (/<text\b|font-family|@font-face/.test(source)) failures.push(`${name}: contains live text or a font reference`);
}

const indexSource = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const localReferences = [...indexSource.matchAll(/(?:src|href)="(\.\/[^"#?]+)"/g)]
  .map((match) => match[1]);
for (const reference of new Set(localReferences)) {
  if (!fs.existsSync(path.join(root, reference.slice(2)))) failures.push(`index.html: missing ${reference}`);
}

const expectedPngWidths = new Map([
  ['housesbase-lockup-full-light-2048.png', 2048],
  ['housesbase-lockup-full-dark-2048.png', 2048],
  ['housesbase-lockup-signature-light-2048.png', 2048],
  ['housesbase-lockup-signature-dark-2048.png', 2048],
  ['housesbase-lockup-compact-light-1600.png', 1600],
  ['housesbase-lockup-compact-dark-1600.png', 1600],
  ['housesbase-lockup-signature-monochrome-1600.png', 1600],
  ['housesbase-lockup-signature-grayscale-1600.png', 1600],
  ['housesbase-mark-primary-512.png', 512],
  ['housesbase-mark-reversed-512.png', 512],
  ['housesbase-mark-monochrome-512.png', 512],
  ['housesbase-favicon-64.png', 64],
  ['housesbase-favicon-128.png', 128],
  ['housesbase-favicon-256.png', 256],
  ['housesbase-app-icon-1024.png', 1024],
]);

for (const [name, expectedWidth] of expectedPngWidths) {
  const file = path.join(pngDir, name);
  if (!fs.existsSync(file)) {
    failures.push(`${name}: missing PNG export`);
    continue;
  }
  const metadata = await sharp(file).metadata();
  if (metadata.format !== 'png') failures.push(`${name}: expected PNG format`);
  if (metadata.width !== expectedWidth) failures.push(`${name}: expected ${expectedWidth}px width, found ${metadata.width}px`);
}

for (const dir of [svgDir, pngDir]) {
  for (const name of fs.readdirSync(dir)) {
    if (name.startsWith('tws-')) failures.push(`${name}: legacy export remains`);
  }
}

const toRgb = (hex) => hex.match(/[a-f\d]{2}/gi).map((pair) => Number.parseInt(pair, 16) / 255);
const luminance = (hex) => {
  const channels = toRgb(hex).map((channel) => channel <= 0.04045
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
};
const contrast = (foreground, background) => {
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
};

const contrastChecks = [
  ['Text orange on white', '#b83515', '#ffffff', 4.5],
  ['Text orange on mist', '#b83515', '#f4f8fd', 4.5],
  ['White on primary navy', '#ffffff', '#103d67', 4.5],
  ['Info text on white', '#2449a8', '#ffffff', 4.5],
  ['Ink on artwork orange', '#0f172a', '#f04e25', 4.5],
  ['Ink on support blue', '#0f172a', '#4f7ef7', 4.5],
  ['Dark-mode orange text on deep navy', '#ff9b7f', '#081f3a', 4.5],
  ['Border on white', '#7b8ea5', '#ffffff', 3],
];
const contrastReport = [];
for (const [label, foreground, background, minimum] of contrastChecks) {
  const ratio = contrast(foreground, background);
  contrastReport.push(`${label}: ${ratio.toFixed(2)}:1`);
  if (ratio < minimum) failures.push(`${label}: ${ratio.toFixed(2)}:1 is below ${minimum}:1`);
}

JSON.parse(fs.readFileSync(path.join(root, 'colors', 'palette.json'), 'utf8'));

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`SVG audit passed: ${svgFiles.length} outlined assets with valid internal references and one title each.`);
console.log(`HTML audit passed: ${new Set(localReferences).size} local targets found.`);
console.log(`PNG audit passed: ${expectedPngWidths.size} exports have the expected format and width.`);
console.log('Legacy export audit passed: no TWS logo files remain.');
console.log(contrastReport.join('\n'));

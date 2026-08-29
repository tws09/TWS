import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve('brand-kit');
const svgDir = path.join(root, 'logos', 'svg');
const pngDir = path.join(root, 'logos', 'png');

fs.mkdirSync(pngDir, { recursive: true });

const exports = [
  ['housesbase-lockup-full-light.svg', 'housesbase-lockup-full-light-2048.png', 2048],
  ['housesbase-lockup-full-dark.svg', 'housesbase-lockup-full-dark-2048.png', 2048],
  ['housesbase-lockup-signature-light.svg', 'housesbase-lockup-signature-light-2048.png', 2048],
  ['housesbase-lockup-signature-dark.svg', 'housesbase-lockup-signature-dark-2048.png', 2048],
  ['housesbase-lockup-compact-light.svg', 'housesbase-lockup-compact-light-1600.png', 1600],
  ['housesbase-lockup-compact-dark.svg', 'housesbase-lockup-compact-dark-1600.png', 1600],
  ['housesbase-lockup-signature-monochrome.svg', 'housesbase-lockup-signature-monochrome-1600.png', 1600],
  ['housesbase-lockup-signature-grayscale.svg', 'housesbase-lockup-signature-grayscale-1600.png', 1600],
  ['housesbase-mark-primary.svg', 'housesbase-mark-primary-512.png', 512],
  ['housesbase-mark-reversed.svg', 'housesbase-mark-reversed-512.png', 512],
  ['housesbase-mark-monochrome.svg', 'housesbase-mark-monochrome-512.png', 512],
  ['housesbase-favicon.svg', 'housesbase-favicon-64.png', 64],
  ['housesbase-favicon.svg', 'housesbase-favicon-128.png', 128],
  ['housesbase-favicon.svg', 'housesbase-favicon-256.png', 256],
  ['housesbase-app-icon.svg', 'housesbase-app-icon-1024.png', 1024],
];

await Promise.all(exports.map(async ([source, output, width]) => {
  await sharp(path.join(svgDir, source))
    .resize({ width })
    .png()
    .toFile(path.join(pngDir, output));
}));

console.log(`Built ${exports.length} HousesBase PNG exports in ${pngDir}`);

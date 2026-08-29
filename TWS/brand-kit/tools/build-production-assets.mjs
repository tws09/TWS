import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('brand-kit');
const sourceDir = path.join(root, 'refinement', 'svg');
const outputDir = path.join(root, 'logos', 'svg');

fs.mkdirSync(outputDir, { recursive: true });

const read = (name) => fs.readFileSync(path.join(sourceDir, name), 'utf8');

function prefixIds(xml, prefix, knownIds) {
  const ids = knownIds ?? [...xml.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  return ids.reduce((result, id) => {
    const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return result
      .replace(new RegExp(`id="${escaped}"`, 'g'), `id="${prefix}${id}"`)
      .replace(new RegExp(`([:#])${escaped}(?=[)"'])`, 'g'), `$1${prefix}${id}`);
  }, xml);
}

function extractArtwork(svg, prefix) {
  const defs = svg.match(/<defs>([\s\S]*?)<\/defs>/)?.[1]?.trim();
  const body = svg.match(/<\/defs>\s*([\s\S]*?)<\/svg>/)?.[1]?.trim();
  if (!defs || !body) throw new Error(`Unable to extract outlined artwork for ${prefix}`);
  const ids = [...`${defs}\n${body}`.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  return {
    defs: prefixIds(defs, prefix, ids),
    body: prefixIds(body, prefix, ids),
  };
}

function withoutSignatureDetails(svg) {
  return svg
    .replace(/<path id="signature-hinge"[^>]*\/>\s*/g, '')
    .replace(/<circle id="signature-dot"[^>]*\/>\s*/g, '');
}

function recolor(svg, replacements) {
  return replacements.reduce((result, [from, to]) => result.split(from).join(to), svg);
}

function documentSvg({ title, description, viewBox, defs = '', body }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${viewBox}" role="img" aria-labelledby="title desc">
  <title id="title">${title}</title>
  <desc id="desc">${description}</desc>
  <!-- Self-contained production artwork. All visible lettering is outlined vector geometry. -->
  ${defs ? `<defs>\n${defs}\n  </defs>` : ''}
${body}
</svg>
`;
}

const refinedMark = {
  navy: '<path d="M260 64H1188V1024L984 918V264H824V406L624 512V264H464V918L260 1024Z" fill="#103D67"/>\n  <path d="M624 568L824 458V950L624 870Z" fill="#F04E25"/>',
  white: '<path d="M260 64H1188V1024L984 918V264H824V406L624 512V264H464V918L260 1024Z" fill="#FFFFFF"/>\n  <path d="M624 568L824 458V950L624 870Z" fill="#F04E25"/>',
  navyMono: '<path d="M260 64H1188V1024L984 918V264H824V406L624 512V264H464V918L260 1024Z" fill="#103D67"/>\n  <path d="M624 568L824 458V950L624 870Z" fill="#103D67"/>',
  gray: '<path d="M260 64H1188V1024L984 918V264H824V406L624 512V264H464V918L260 1024Z" fill="#2B2B2B"/>\n  <path d="M624 568L824 458V950L624 870Z" fill="#777777"/>',
};

const signatureLightSource = read('housesbase-signature-wordmark-light.svg');
const signatureDarkSource = read('housesbase-signature-wordmark-dark.svg');
const descriptorSource = read('housesbase-descriptor-outlined.svg');

const signatureLight = extractArtwork(signatureLightSource, 'wm-');
const signatureDark = extractArtwork(signatureDarkSource, 'wm-');
const compactLight = extractArtwork(withoutSignatureDetails(signatureLightSource), 'wm-');
const compactDark = extractArtwork(withoutSignatureDetails(signatureDarkSource), 'wm-');
const descriptorLight = extractArtwork(descriptorSource, 'descriptor-');
const descriptorDark = extractArtwork(
  recolor(descriptorSource, [
    ['rgb(39.215686%, 45.490196%, 54.509804%)', 'rgb(76.862745%, 86.666667%, 100%)'],
  ]),
  'descriptor-',
);

const signatureMono = extractArtwork(
  recolor(signatureLightSource, [
    ['rgb(6.27451%, 23.921569%, 40.392157%)', 'rgb(6.27451%, 23.921569%, 40.392157%)'],
    ['#F04E25', '#103D67'],
  ]),
  'wm-',
);

const signatureGray = extractArtwork(
  recolor(signatureLightSource, [
    ['rgb(6.27451%, 23.921569%, 40.392157%)', 'rgb(16.862745%, 16.862745%, 16.862745%)'],
    ['#F04E25', '#777777'],
  ]),
  'wm-',
);

const files = new Map();

files.set('housesbase-mark-primary.svg', documentSvg({
  title: 'HousesBase mark',
  description: 'Refined navy gateway with an orange center pane.',
  viewBox: '0 0 1448 1086',
  body: `  ${refinedMark.navy}`,
}));

files.set('housesbase-mark-reversed.svg', documentSvg({
  title: 'HousesBase mark',
  description: 'Refined white gateway with an orange center pane for dark backgrounds.',
  viewBox: '0 0 1448 1086',
  body: `  ${refinedMark.white}`,
}));

files.set('housesbase-mark-monochrome.svg', documentSvg({
  title: 'HousesBase monochrome mark',
  description: 'Single-color refined HousesBase gateway.',
  viewBox: '0 0 1448 1086',
  body: `  ${refinedMark.navyMono}`,
}));

files.set('housesbase-favicon.svg', documentSvg({
  title: 'HousesBase favicon',
  description: 'Refined HousesBase gateway centered in a square mist field.',
  viewBox: '0 0 64 64',
  body: `  <rect width="64" height="64" rx="14" fill="#F4F8FD"/>\n  <g aria-hidden="true" transform="translate(-5 5) scale(.052)">\n    ${refinedMark.navy}\n  </g>`,
}));

files.set('housesbase-app-icon.svg', documentSvg({
  title: 'HousesBase app icon',
  description: 'Refined reversed HousesBase gateway in a rounded navy app-icon field.',
  viewBox: '0 0 1024 1024',
  body: `  <rect width="1024" height="1024" rx="220" fill="#081F3A"/>\n  <g aria-hidden="true" transform="translate(-67 80) scale(.8)">\n    ${refinedMark.white}\n  </g>`,
}));

function lockup({ title, description, wordmark, mark, descriptor, monochrome = false, grayscale = false }) {
  const wordmarkTransform = descriptor ? 'translate(270 34) scale(1.12)' : 'translate(270 43) scale(1.12)';
  const viewBox = descriptor ? '0 0 1120 220' : '0 0 1120 205';
  const descriptorMarkup = descriptor
    ? `\n  <g aria-hidden="true" transform="translate(278 169) scale(1.04)">\n${descriptor.body}\n  </g>`
    : '';
  return documentSvg({
    title,
    description,
    viewBox,
    defs: `${wordmark.defs}${descriptor ? `\n${descriptor.defs}` : ''}`,
    body: `  <g aria-hidden="true" transform="translate(20 18) scale(.17)">\n    ${mark}\n  </g>\n  <g aria-hidden="true" transform="${wordmarkTransform}">\n${wordmark.body}\n  </g>${descriptorMarkup}`,
  });
}

files.set('housesbase-lockup-full-light.svg', lockup({
  title: 'HousesBase — Software House OS',
  description: 'Full HousesBase marketing lockup for light backgrounds.',
  wordmark: signatureLight,
  mark: refinedMark.navy,
  descriptor: descriptorLight,
}));

files.set('housesbase-lockup-full-dark.svg', lockup({
  title: 'HousesBase — Software House OS',
  description: 'Full reversed HousesBase marketing lockup for dark backgrounds.',
  wordmark: signatureDark,
  mark: refinedMark.white,
  descriptor: descriptorDark,
}));

files.set('housesbase-lockup-signature-light.svg', lockup({
  title: 'HousesBase',
  description: 'HousesBase signature lockup with the gateway, orange hinge, and terminal dot for light backgrounds.',
  wordmark: signatureLight,
  mark: refinedMark.navy,
}));

files.set('housesbase-lockup-signature-dark.svg', lockup({
  title: 'HousesBase',
  description: 'Reversed HousesBase signature lockup with the gateway, orange hinge, and terminal dot for dark backgrounds.',
  wordmark: signatureDark,
  mark: refinedMark.white,
}));

files.set('housesbase-lockup-compact-light.svg', lockup({
  title: 'HousesBase',
  description: 'Compact HousesBase lockup without the descriptor, hinge, or terminal dot for light backgrounds.',
  wordmark: compactLight,
  mark: refinedMark.navy,
}));

files.set('housesbase-lockup-compact-dark.svg', lockup({
  title: 'HousesBase',
  description: 'Compact reversed HousesBase lockup without the descriptor, hinge, or terminal dot for dark backgrounds.',
  wordmark: compactDark,
  mark: refinedMark.white,
}));

files.set('housesbase-lockup-signature-monochrome.svg', lockup({
  title: 'HousesBase',
  description: 'Single-color HousesBase signature lockup for reproduction testing.',
  wordmark: signatureMono,
  mark: refinedMark.navyMono,
  monochrome: true,
}));

files.set('housesbase-lockup-signature-grayscale.svg', lockup({
  title: 'HousesBase',
  description: 'Grayscale HousesBase signature lockup for print and reproduction testing.',
  wordmark: signatureGray,
  mark: refinedMark.gray,
  grayscale: true,
}));

for (const [name, contents] of files) {
  fs.writeFileSync(path.join(outputDir, name), contents);
}

console.log(`Built ${files.size} self-contained HousesBase SVG assets in ${outputDir}`);

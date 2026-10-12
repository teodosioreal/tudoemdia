// Gera ícones e a imagem OG padrão a partir dos SVGs. Uso: node scripts/build-icons.mjs
import sharp from 'sharp';

const fav = 'public/favicon.svg';
await sharp(fav, { density: 600 }).resize(180, 180).flatten({ background: '#ffffff' }).png().toFile('public/apple-touch-icon.png');
await sharp(fav, { density: 600 }).resize(512, 512).flatten({ background: '#ffffff' }).png().toFile('public/logo.png');
// PNGs em múltiplos de 48 px: o Google usa o favicon nos resultados de busca (mín. 48x48)
for (const s of [48, 96, 192, 512]) {
  await sharp(fav, { density: 600 }).resize(s, s).flatten({ background: '#ffffff' }).png().toFile(`public/icon-${s}.png`);
}
// favicon.ico com PNGs de 16, 32 e 48 px embutidos
const sizes = [16, 32, 48];
const pngs = await Promise.all(sizes.map((s) => sharp(fav, { density: 300 }).resize(s, s).png().toBuffer()));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((s, i) => {
  const o = 6 + 16 * i;
  header.writeUInt8(s, o); header.writeUInt8(s, o + 1); header.writeUInt8(0, o + 2); header.writeUInt8(0, o + 3);
  header.writeUInt16LE(1, o + 4); header.writeUInt16LE(32, o + 6);
  header.writeUInt32LE(pngs[i].length, o + 8); header.writeUInt32LE(offset, o + 12);
  offset += pngs[i].length;
});
const { writeFile } = await import('node:fs/promises');
await writeFile('public/favicon.ico', Buffer.concat([header, ...pngs]));
await sharp('scripts/og-default.svg').png().toFile('public/og-default.png');
console.log('Ícones e og-default gerados.');

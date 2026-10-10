// Gera ícones e a imagem OG padrão a partir dos SVGs. Uso: node scripts/build-icons.mjs
import sharp from 'sharp';

const fav = 'public/favicon.svg';
await sharp(fav, { density: 600 }).resize(180, 180).png().toFile('public/apple-touch-icon.png');
await sharp(fav, { density: 600 }).resize(512, 512).png().toFile('public/logo.png');
// favicon.ico com PNG embutido de 32x32 (formato aceito por todos os navegadores atuais)
const png32 = await sharp(fav, { density: 300 }).resize(32, 32).png().toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4);
header.writeUInt8(32, 6); header.writeUInt8(32, 7); header.writeUInt8(0, 8); header.writeUInt8(0, 9);
header.writeUInt16LE(1, 10); header.writeUInt16LE(32, 12);
header.writeUInt32LE(png32.length, 14); header.writeUInt32LE(22, 18);
const { writeFile } = await import('node:fs/promises');
await writeFile('public/favicon.ico', Buffer.concat([header, png32]));
await sharp('scripts/og-default.svg').png().toFile('public/og-default.png');
console.log('Ícones e og-default gerados.');

// Gera as capas dos artigos: SVG flat (fonte, em design/capas) + WebP 1200x630 (em src/assets/capas).
// Uso: node scripts/covers/generate-covers.mjs
import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const W = 1200;
const H = 630;
const C = {
  bg: '#0f4c5c',
  bg2: '#155b6c',
  bg3: '#1c6a7c',
  white: '#ffffff',
  paper: '#f3f6f9',
  line: '#c9d4de',
  amber: '#f4b740',
  teal: '#4fb3bf',
  red: '#e0614f',
  green: '#1f9d63',
  dark: '#0a3540',
};

// ---------- primitivas ----------
const rect = (x, y, w, h, fill, rx = 0, extra = '') =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${extra}/>`;
const circle = (cx, cy, r, fill, extra = '') => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${extra}/>`;
const path = (d, fill = 'none', stroke = 'none', sw = 0, extra = '') =>
  `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const g = (t, inner) => `<g transform="${t}">${inner}</g>`;

function background(seed) {
  // círculos decorativos em posições que variam por artigo
  const r = (n) => ((Math.sin(seed * 9301 + n * 49297) + 1) / 2);
  let deco = '';
  for (let i = 0; i < 5; i++) {
    deco += circle(Math.round(r(i) * W), Math.round(r(i + 10) * H), Math.round(60 + r(i + 20) * 140), i % 2 ? C.bg2 : C.bg3, 'opacity="0.55"');
  }
  return rect(0, 0, W, H, C.bg) + deco + rect(0, 540, W, 90, C.dark);
}

// documento com linhas
const doc = (x, y, w = 220, h = 290, lines = 6) => {
  let l = '';
  for (let i = 0; i < lines; i++) l += rect(x + 28, y + 50 + i * 34, w - 56 - (i % 3) * 30, 12, C.line, 6);
  return rect(x, y, w, h, C.paper, 16) + rect(x, y, w, 26, C.teal, 16) + rect(x, y + 14, w, 12, C.teal) + l;
};
// carro de perfil
const car = (x, y, s = 1, body = C.amber) =>
  g(`translate(${x} ${y}) scale(${s})`,
    path('M20 120 L60 60 Q70 45 95 45 L235 45 Q258 45 270 62 L310 120 Z', body) +
    rect(0, 110, 340, 60, body, 22) +
    path('M78 105 L104 62 L170 62 L170 105 Z', C.paper, 'none', 0, 'opacity="0.9"') +
    path('M185 105 L185 62 L240 62 Q252 62 258 72 L280 105 Z', C.paper, 'none', 0, 'opacity="0.9"') +
    circle(80, 172, 34, C.dark) + circle(80, 172, 15, C.line) +
    circle(262, 172, 34, C.dark) + circle(262, 172, 15, C.line) +
    rect(318, 128, 22, 14, C.paper, 4));
const shield = (x, y, s = 1, fill = C.teal) =>
  g(`translate(${x} ${y}) scale(${s})`,
    path('M110 0 L210 36 L210 120 Q210 210 110 250 Q10 210 10 120 L10 36 Z', fill) +
    path('M110 22 L190 50 L190 120 Q190 192 110 226 Z', C.white, 'none', 0, 'opacity="0.18"'));
const check = (x, y, s = 1, color = C.green) =>
  g(`translate(${x} ${y}) scale(${s})`, circle(40, 40, 40, color) + path('M20 42 L35 57 L62 28', 'none', C.white, 10));
const warn = (x, y, s = 1) =>
  g(`translate(${x} ${y}) scale(${s})`, path('M50 4 L96 88 L4 88 Z', C.amber, C.dark, 4) + rect(45, 30, 10, 32, C.dark, 4) + circle(50, 74, 6, C.dark));
const calendar = (x, y, s = 1, mark = C.red) => {
  let cells = '';
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) cells += rect(22 + c * 46, 92 + r * 40, 32, 26, r === 1 && c === 2 ? mark : C.line, 5);
  return g(`translate(${x} ${y}) scale(${s})`, rect(0, 20, 220, 230, C.paper, 16) + rect(0, 20, 220, 56, mark === C.red ? C.red : C.teal, 16) + rect(0, 60, 220, 16, mark === C.red ? C.red : C.teal) + rect(46, 0, 18, 46, C.dark, 8) + rect(156, 0, 18, 46, C.dark, 8) + cells);
};
const coin = (x, y, r = 40) => circle(x, y, r, C.amber) + circle(x, y, r * 0.72, 'none', `stroke="${C.dark}" stroke-width="5" opacity="0.35"`) + path(`M${x} ${y - r * 0.4} L${x} ${y + r * 0.4}`, 'none', C.dark, 7, 'opacity="0.5"');
const phone = (x, y, s = 1, screen = '') =>
  g(`translate(${x} ${y}) scale(${s})`, rect(0, 0, 170, 320, C.dark, 26) + rect(12, 30, 146, 250, C.paper, 10) + rect(62, 12, 46, 8, C.bg3, 4) + circle(85, 300, 10, C.bg3) + screen);
const qr = (x, y, size = 90) => {
  let q = rect(x, y, size, size, C.white, 6);
  const cell = size / 9;
  const pattern = [
    [1, 1, 1, 0, 1, 0, 1, 1, 1], [1, 0, 1, 0, 0, 1, 1, 0, 1], [1, 1, 1, 0, 1, 0, 1, 1, 1],
    [0, 0, 0, 1, 0, 1, 0, 0, 0], [1, 0, 1, 1, 1, 0, 1, 1, 0], [0, 1, 0, 0, 1, 1, 0, 1, 0],
    [1, 1, 1, 0, 0, 1, 1, 0, 1], [1, 0, 1, 1, 0, 0, 0, 1, 1], [1, 1, 1, 0, 1, 1, 0, 1, 0],
  ];
  pattern.forEach((row, r) => row.forEach((v, c) => { if (v) q += rect(x + c * cell, y + r * cell, cell, cell, C.dark); }));
  return q;
};
const arrow = (x1, y1, x2, y2, color = C.amber) => {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const hx1 = x2 - 26 * Math.cos(a - 0.5), hy1 = y2 - 26 * Math.sin(a - 0.5);
  const hx2 = x2 - 26 * Math.cos(a + 0.5), hy2 = y2 - 26 * Math.sin(a + 0.5);
  return path(`M${x1} ${y1} L${x2} ${y2} M${hx1} ${hy1} L${x2} ${y2} L${hx2} ${hy2}`, 'none', color, 12);
};
const gauge = (x, y, s = 1, level = 0.7, color = C.amber) => {
  const ang = Math.PI * (1 - level);
  const nx = 150 + 110 * Math.cos(ang), ny = 150 - 110 * Math.sin(ang);
  return g(`translate(${x} ${y}) scale(${s})`,
    path('M20 150 A130 130 0 0 1 280 150', 'none', C.bg3, 28) +
    path(`M20 150 A130 130 0 0 1 ${150 + 130 * Math.cos(ang)} ${150 - 130 * Math.sin(ang)}`, 'none', color, 28) +
    path(`M150 150 L${nx} ${ny}`, 'none', C.white, 12) + circle(150, 150, 18, C.white));
};
const person = (x, y, s = 1, color = C.teal) =>
  g(`translate(${x} ${y}) scale(${s})`, circle(50, 40, 36, color) + path('M0 170 Q0 90 50 90 Q100 90 100 170 Z', color));
const wrench = (x, y, s = 1, rot = -40, color = C.line) =>
  g(`translate(${x} ${y}) rotate(${rot}) scale(${s})`,
    rect(-14, 0, 28, 200, color, 12) +
    path('M-46 -30 A50 50 0 1 0 46 -30 L22 -8 L22 -46 L-22 -46 L-22 -8 Z', color));
const card = (x, y, s = 1) =>
  g(`translate(${x} ${y}) scale(${s})`,
    rect(0, 0, 320, 200, C.paper, 18) + rect(0, 0, 320, 44, C.green, 18) + rect(0, 26, 320, 18, C.green) +
    rect(24, 66, 90, 110, C.line, 10) + circle(69, 104, 22, C.bg3) + path('M36 168 Q69 120 102 168 Z', C.bg3) +
    rect(134, 74, 160, 14, C.line, 7) + rect(134, 104, 130, 14, C.line, 7) + rect(134, 134, 150, 14, C.line, 7));
const drop = (x, y, s = 1, color = C.amber) =>
  g(`translate(${x} ${y}) scale(${s})`, path('M80 0 Q80 0 140 110 A70 70 0 1 1 20 110 Q80 0 80 0 Z', color) + path('M52 130 A32 32 0 0 0 80 162', 'none', C.white, 10, 'opacity="0.6"'));
const tire = (x, y, r = 130) => {
  let tread = '';
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    tread += rect(x + (r - 12) * Math.cos(a) - 9, y + (r - 12) * Math.sin(a) - 22, 18, 44, C.bg3, 4, `transform="rotate(${(a * 180) / Math.PI + 90} ${x + (r - 12) * Math.cos(a)} ${y + (r - 12) * Math.sin(a)})"`);
  }
  return circle(x, y, r, C.dark) + tread + circle(x, y, r * 0.58, C.line) + circle(x, y, r * 0.2, C.bg3);
};
const clipboard = (x, y, s = 1, checks = 4) => {
  let items = '';
  for (let i = 0; i < checks; i++) {
    items += rect(30, 80 + i * 52, 30, 30, i < checks - 1 ? C.green : C.line, 6) +
      (i < checks - 1 ? path(`M36 ${96 + i * 52} L44 ${104 + i * 52} L56 ${88 + i * 52}`, 'none', C.white, 5) : '') +
      rect(76, 88 + i * 52, 120 - (i % 2) * 30, 14, C.line, 7);
  }
  return g(`translate(${x} ${y}) scale(${s})`, rect(0, 20, 230, 300, C.paper, 16) + rect(70, 0, 90, 44, C.bg3, 12) + items);
};
const stairs = (x, y, s = 1) => {
  let st = '';
  for (let i = 0; i < 5; i++) st += rect(i * 60, 240 - i * 48, 56, 48 + i * 48, i === 4 ? C.amber : C.teal, 6, `opacity="${0.55 + i * 0.1}"`);
  return g(`translate(${x} ${y}) scale(${s})`, st + path('M270 -20 L282 6 L310 8 L289 26 L296 54 L270 39 L244 54 L251 26 L230 8 L258 6 Z', C.amber));
};
const gavel = (x, y, s = 1) =>
  g(`translate(${x} ${y}) scale(${s})`,
    g('rotate(-35 120 80)', rect(60, 40, 120, 70, C.amber, 14) + rect(108, 100, 24, 160, C.line, 10)) +
    rect(10, 250, 220, 34, C.bg3, 10));
const envelope = (x, y, s = 1) =>
  g(`translate(${x} ${y}) scale(${s})`, rect(0, 0, 260, 170, C.paper, 14) + path('M6 10 L130 100 L254 10', 'none', C.line, 10));
const key = (x, y, s = 1) =>
  g(`translate(${x} ${y}) scale(${s})`, circle(40, 40, 38, C.amber) + circle(40, 40, 16, C.bg) + rect(70, 32, 150, 18, C.amber, 9) + rect(180, 50, 16, 30, C.amber, 4) + rect(150, 50, 16, 22, C.amber, 4));
const calc = (x, y, s = 1) => {
  let k = '';
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) k += rect(22 + c * 62, 120 + r * 50, 48, 36, r === 3 && c === 2 ? C.amber : C.bg3, 8);
  return g(`translate(${x} ${y}) scale(${s})`, rect(0, 0, 230, 330, C.dark, 22) + rect(20, 22, 190, 76, C.teal, 10) + rect(110, 50, 84, 20, C.dark, 5, 'opacity="0.5"') + k);
};

// ---------- composição por artigo ----------
const covers = {
  'como-transferir-carro-usado': (s) => s + car(90, 280, 1.15) + arrow(560, 330, 720, 330) + doc(900, 80, 200, 260, 5) + key(760, 400, 1.1),
  'atpv-e-o-que-e-como-assinar': (s) => s + doc(160, 70, 300, 400, 7) + path('M210 430 Q260 380 300 420 T400 410', 'none', C.bg3, 9) + phone(640, 120, 1.05, rect(30, 70, 110, 14, C.line, 7) + rect(30, 100, 90, 14, C.line, 7) + check(45, 150, 1)) + arrow(500, 300, 610, 300, C.teal),
  'crlv-digital-como-baixar': (s) => s + phone(250, 110, 1.25, rect(26, 44, 118, 30, C.green, 6) + qr(40, 100, 90) + rect(26, 210, 118, 12, C.line, 6) + rect(26, 232, 90, 12, C.line, 6)) + doc(640, 140, 260, 330, 6) + qr(780, 330, 100),
  'comunicacao-de-venda-de-veiculo': (s) => s + envelope(150, 200, 1.2) + arrow(500, 290, 650, 290) + car(700, 270, 0.95) + check(960, 150, 1.2),
  'quem-paga-ipva-na-venda-do-carro': (s) => s + person(140, 250, 1.4, C.teal) + person(920, 250, 1.4, C.amber) + coin(600, 300, 70) + coin(480, 380, 46) + coin(720, 380, 46) + arrow(330, 320, 420, 320, C.line) + arrow(870, 320, 780, 320, C.line),
  'como-e-calculado-o-ipva': (s) => s + calc(200, 110, 1.15) + car(560, 300, 0.85) + coin(950, 200, 60) + path('M520 200 L620 200 M570 150 L570 250', 'none', C.white, 14),
  'ipva-atrasado-o-que-acontece': (s) => s + calendar(200, 110, 1.4) + warn(620, 160, 2.2) + coin(930, 370, 56),
  'licenciamento-atrasado': (s) => s + calendar(140, 110, 1.3) + car(520, 290, 0.95) + warn(900, 130, 1.6),
  'como-recorrer-de-multa-de-transito': (s) => s + doc(170, 90, 260, 360, 7) + gavel(620, 130, 1.25) + check(960, 120, 1),
  'indicacao-de-condutor': (s) => s + person(200, 220, 1.5, C.teal) + person(860, 220, 1.5, C.amber) + arrow(420, 280, 780, 280) + doc(520, 330, 150, 190, 3),
  'limite-de-pontos-cnh': (s) => s + gauge(330, 130, 1.8, 0.82, C.red) + card(830, 330, 0.75),
  'validade-cnh-por-idade': (s) => s + card(170, 200, 1.35) + circle(860, 290, 150, C.paper) + path('M860 190 L860 290 L940 330', 'none', C.bg, 18) + circle(860, 290, 150, 'none', `stroke="${C.amber}" stroke-width="16"`),
  'franquia-seguro-auto': (s) => s + shield(170, 110, 1.6) + coin(700, 300, 90) + coin(860, 380, 56) + car(760, 140, 0.55, C.line),
  'perfil-do-condutor-seguro-auto': (s) => s + clipboard(200, 90, 1.3, 4) + person(700, 220, 1.6, C.amber) + shield(890, 200, 0.8),
  'classe-de-bonus-seguro-auto': (s) => s + stairs(220, 160, 1.4) + shield(800, 140, 1.3),
  'seguro-auto-ou-protecao-veicular': (s) => s + shield(150, 130, 1.4) + person(720, 270, 0.9, C.amber) + person(840, 230, 1.0, C.teal) + person(960, 270, 0.9, C.amber) + path('M560 160 L560 470', 'none', C.line, 8, 'stroke-dasharray="18 18"'),
  'o-que-e-feito-na-revisao-do-carro': (s) => s + clipboard(160, 90, 1.3, 5) + car(560, 300, 0.95) + wrench(990, 140, 1, 35),
  'quando-trocar-oleo-do-carro': (s) => s + drop(260, 100, 1.7) + rect(640, 170, 230, 300, C.teal, 26) + rect(690, 120, 130, 70, C.teal, 14) + rect(670, 260, 170, 90, C.paper, 12) + rect(690, 285, 130, 14, C.line, 7) + rect(690, 315, 100, 14, C.line, 7),
  'calibragem-pneu-pressao-correta': (s) => s + tire(390, 310, 190) + gauge(760, 150, 1.1, 0.6, C.green),
  'revisao-fora-da-concessionaria-perde-garantia': (s) => s + shield(180, 120, 1.5) + wrench(330, 230, 0.9, -30, C.amber) + doc(700, 110, 260, 340, 7) + check(900, 380, 1.1),
};

await mkdir('design/capas', { recursive: true });
await mkdir('src/assets/capas', { recursive: true });
let i = 0;
for (const [slug, fn] of Object.entries(covers)) {
  i++;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${fn(background(i))}</svg>`;
  await writeFile(`design/capas/${slug}.svg`, svg);
  await sharp(Buffer.from(svg)).resize(W, H).webp({ quality: 86 }).toFile(`src/assets/capas/${slug}.webp`);
}
console.log(`${i} capas geradas.`);

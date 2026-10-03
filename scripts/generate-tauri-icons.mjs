import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const iconsDir = path.resolve(__dirname, '../src-tauri/icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// PNGs base64 (azul índigo TasksAnywhere)
const png32 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAFElEQVRYR+3BAQ0AAADCoPdPbQ8HFAAA9wcD6QABG15N7QAAAABJRU5ErkJggg==',
  'base64'
);

const png128 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAAJElEQVR42u3BAQ0AAADCoPdPbQ8HFAAAAAAAAAAAAAAAAACeBv0rAAG+cWvAAAAAAElFTkSuQmCC',
  'base64'
);

const png256 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAAKUlEQVR42u3BAQ0AAADCoPdPbQ8HFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/AatgAABxGj9FAAAAABJRU5ErkJggg==',
  'base64'
);

// Cabeçalho ICO simples para empacotar o PNG 32x32
const icoHeader = Buffer.from([
  0x00, 0x00, // Reserved
  0x01, 0x00, // Type 1 (ICO)
  0x01, 0x00, // 1 image
  0x20,       // Width 32
  0x20,       // Height 32
  0x00,       // Colors
  0x00,       // Reserved
  0x01, 0x00, // Color planes
  0x20, 0x00, // Bits per pixel
  ...new Uint8Array(new Uint32Array([png32.length]).buffer), // Size of image data
  0x16, 0x00, 0x00, 0x00 // Offset (22 bytes)
]);
const icoFile = Buffer.concat([icoHeader, png32]);

fs.writeFileSync(path.join(iconsDir, '32x32.png'), png32);
fs.writeFileSync(path.join(iconsDir, '128x128.png'), png128);
fs.writeFileSync(path.join(iconsDir, '128x128@2x.png'), png256);
fs.writeFileSync(path.join(iconsDir, 'icon.png'), png256);
fs.writeFileSync(path.join(iconsDir, 'icon.ico'), icoFile);
fs.writeFileSync(path.join(iconsDir, 'icon.icns'), png256);

console.log('Ícones do Tauri gerados com sucesso em src-tauri/icons/');

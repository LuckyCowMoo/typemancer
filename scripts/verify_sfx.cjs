const fs = require('fs');
const path = require('path');

const publicSfx = path.join(__dirname, '..', 'public', 'assets', 'sfx');
const catalogFile = fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'soundCatalog.ts'), 'utf8');

const programmatic = new Set(['wheel_tick', 'typewriter', 'telegraph', 'quill', 'chalk', 'carriage_bell', 'spell_chime', 'heavy_stamp']);
const idRegex = /id:\s*['"]([^'"]+)['"]/g;
let match;
let missing = 0;
let total = 0;

while ((match = idRegex.exec(catalogFile)) !== null) {
  const id = match[1];
  if (programmatic.has(id)) continue;
  total++;
  const filePath = path.join(publicSfx, id);
  if (!fs.existsSync(filePath)) {
    console.error('Missing catalog sound:', id, '->', filePath);
    missing++;
  }
}

console.log(`Sound catalog file samples checked: ${total} entries. Missing: ${missing}`);

const cards = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'cards.json'), 'utf8'));
let cardMissing = 0;
for (const card of cards) {
  if (card.sfx) {
    const filePath = path.join(publicSfx, card.sfx);
    if (!fs.existsSync(filePath)) {
      console.error('Missing card sfx file:', card.id, card.sfx);
      cardMissing++;
    }
  }
}
console.log(`Cards checked: ${cards.length} cards. Missing: ${cardMissing}`);

const fs = require('fs');
const path = require('path');

const repoDir = path.resolve(__dirname, '..');
const tempDir = path.join(process.env.TEMP, 'game-icons');
const targetDir = path.join(repoDir, 'public', 'assets', 'entities');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const entityMap = {
  // Goblins
  goblin_skirmisher: { source: 'delapouite/goblin-head.svg', author: 'Delapouite', icon: 'goblin-head', flip: false },
  goblin_archer: { source: 'delapouite/archer.svg', author: 'Delapouite', icon: 'archer', flip: true },
  goblin_drummer: { source: 'delapouite/drum.svg', author: 'Delapouite', icon: 'drum', flip: false },
  goblin_brute: { source: 'skoll/troll.svg', author: 'Skoll', icon: 'troll', flip: false },
  goblin_shaman: { source: 'lorc/tribal-mask.svg', author: 'Lorc', icon: 'tribal-mask', flip: false },
  goblin_assassin: { source: 'darkzaitzev/hooded-assassin.svg', author: 'DarkZaitzev', icon: 'hooded-assassin', flip: true },
  goblin_warlord: { source: 'delapouite/barbarian.svg', author: 'Delapouite', icon: 'barbarian', flip: false },

  // Rock Monsters
  rock_pebble: { source: 'lorc/rock.svg', author: 'Lorc', icon: 'rock', flip: false },
  rock_roller: { source: 'delapouite/boulder-dash.svg', author: 'Delapouite', icon: 'boulder-dash', flip: true },
  rock_shield: { source: 'delapouite/stone-wall.svg', author: 'Delapouite', icon: 'stone-wall', flip: false },
  rock_crusher: { source: 'lorc/stone-block.svg', author: 'Lorc', icon: 'stone-block', flip: false },
  rock_golem: { source: 'delapouite/rock-golem.svg', author: 'Delapouite', icon: 'rock-golem', flip: false },
  rock_titan: { source: 'delapouite/ice-golem.svg', author: 'Delapouite', icon: 'ice-golem', flip: false },
  rock_elemental: { source: 'delapouite/golem-head.svg', author: 'Delapouite', icon: 'golem-head', flip: false },

  // Evil Plants
  evil_weed: { source: 'delapouite/tumbleweed.svg', author: 'Delapouite', icon: 'tumbleweed', flip: false },
  evil_spore: { source: 'delapouite/mushrooms-cluster.svg', author: 'Delapouite', icon: 'mushrooms-cluster', flip: false },
  evil_flower: { source: 'lorc/flower-twirl.svg', author: 'Lorc', icon: 'flower-twirl', flip: false },
  evil_tree: { source: 'lorc/evil-tree.svg', author: 'Lorc', icon: 'evil-tree', flip: false },
  evil_flytrap: { source: 'caro-asercion/venus-flytrap.svg', author: 'Caro Asercion', icon: 'venus-flytrap', flip: true },
  evil_treant: { source: 'cathelineau/tree-face.svg', author: 'Cathelineau', icon: 'tree-face', flip: false },
  evil_mandragora: { source: 'delapouite/carnivorous-plant.svg', author: 'Delapouite', icon: 'carnivorous-plant', flip: true },

  // Bosses
  boss_goblin_king: { source: 'lorc/crowned-skull.svg', author: 'Lorc', icon: 'crowned-skull', flip: false },
  boss_rock_mountain: { source: 'delapouite/smoking-volcano.svg', author: 'Delapouite', icon: 'smoking-volcano', flip: false },
  boss_evil_world_tree: { source: 'delapouite/tree-roots.svg', author: 'Delapouite', icon: 'tree-roots', flip: false },
  the_evil_wizard: { source: 'delapouite/wizard-face.svg', author: 'Delapouite', icon: 'wizard-face', flip: false },

  // Player
  player: { source: 'darkzaitzev/hooded-figure.svg', author: 'DarkZaitzev', icon: 'hooded-figure', flip: true }
};

// 1. Process & Copy SVGs
for (const [id, info] of Object.entries(entityMap)) {
  const srcPath = path.join(tempDir, info.source);
  if (!fs.existsSync(srcPath)) {
    throw new Error(`Source SVG not found: ${srcPath}`);
  }
  let raw = fs.readFileSync(srcPath, 'utf8');

  // Remove black background path (<path d="M0 0h512v512H0z"/>)
  raw = raw.replace(/<path[^>]*d="M0 0h512v512H0z"[^>]*\/>/gi, '');
  // Replace fill with #000
  raw = raw.replace(/fill="[^"]+"/gi, 'fill="#000"');
  // If no fill attribute is present on remaining elements, ensure root or paths have fill="#000"
  if (!raw.includes('fill="#000"')) {
    raw = raw.replace('<svg', '<svg fill="#000"');
  }

  const destPath = path.join(targetDir, `${id}.svg`);
  fs.writeFileSync(destPath, raw.trim() + '\n', 'utf8');
  console.log(`Saved: public/assets/entities/${id}.svg`);
}

// 2. Write CREDITS.md
let credits = `# Entity Art Credits

Icons from [game-icons.net](https://game-icons.net), licensed under [Creative Commons Attribution 3.0 Unported (CC BY 3.0)](https://creativecommons.org/licenses/by/3.0/).

## Asset List

| Entity File | Original Icon | Author | License |
| :--- | :--- | :--- | :--- |
`;

for (const [id, info] of Object.entries(entityMap)) {
  credits += `| \`${id}.svg\` | \`${info.icon}\` | ${info.author} | CC BY 3.0 |\n`;
}

credits += `\nSpecial thanks to all the contributing artists at game-icons.net: Lorc, Delapouite, Skoll, DarkZaitzev, Caro Asercion, and Cathelineau.\n`;

fs.writeFileSync(path.join(targetDir, 'CREDITS.md'), credits, 'utf8');
console.log('Saved: public/assets/entities/CREDITS.md');

// 3. Update src/data/enemies.json
const enemiesFile = path.join(repoDir, 'src', 'data', 'enemies.json');
const enemies = JSON.parse(fs.readFileSync(enemiesFile, 'utf8'));

const factionPalettes = {
  goblins: { primaryColor: '#3f6b2a', secondaryColor: '#7aa84f' },
  rock_monsters: { primaryColor: '#5b5248', secondaryColor: '#9a8f80' },
  evil_plants: { primaryColor: '#6b1f4a', secondaryColor: '#b0457e' },
  boss: { primaryColor: '#4a0d1f', secondaryColor: '#a3243f' }
};

for (const enemy of enemies) {
  const conf = entityMap[enemy.id];
  if (!conf) {
    console.warn(`No entity configuration for enemy: ${enemy.id}`);
    continue;
  }

  let pal;
  if (enemy.id === 'the_evil_wizard') {
    pal = { primaryColor: '#2d1b4e', secondaryColor: '#6d3fb0' };
  } else {
    pal = factionPalettes[enemy.faction] || factionPalettes.boss;
  }

  enemy.art = {
    primaryColor: pal.primaryColor,
    secondaryColor: pal.secondaryColor,
    shape: enemy.art?.shape || 'capsule',
    spriteUrl: `./assets/entities/${enemy.id}.svg`,
    ...(conf.flip ? { flip: true } : {})
  };
}

fs.writeFileSync(enemiesFile, JSON.stringify(enemies, null, 2) + '\n', 'utf8');
console.log('Updated: src/data/enemies.json');

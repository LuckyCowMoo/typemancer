const fs = require('fs');
const path = require('path');

const repoDir = path.resolve(__dirname, '..');
const baseDir = path.join(process.env.TEMP, 'dcss_full', 'Dungeon Crawl Stone Soup Full');
const targetDir = path.join(repoDir, 'public', 'assets', 'entities');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// 1. Delete all old SVGs in targetDir
const existingFiles = fs.readdirSync(targetDir);
for (const f of existingFiles) {
  if (f.endsWith('.svg')) {
    fs.unlinkSync(path.join(targetDir, f));
    console.log(`Deleted old SVG: ${f}`);
  }
}

const spriteMap = {
  // Goblins (7)
  goblin_skirmisher: { source: 'monster/goblin_new.png', original: 'goblin_new.png', flip: false },
  goblin_archer: { source: 'monster/big_kobold_new.png', original: 'big_kobold_new.png', flip: false },
  goblin_drummer: { source: 'monster/orc_priest_new.png', original: 'orc_priest_new.png', flip: false },
  goblin_brute: { source: 'monster/hobgoblin_new.png', original: 'hobgoblin_new.png', flip: false },
  goblin_shaman: { source: 'monster/orc_sorcerer_new.png', original: 'orc_sorcerer_new.png', flip: false },
  goblin_assassin: { source: 'monster/unique/sonja_new.png', original: 'sonja_new.png', flip: false },
  goblin_warlord: { source: 'monster/orc_knight_new.png', original: 'orc_knight_new.png', flip: false },

  // Rock Monsters (7)
  rock_pebble: { source: 'monster/nonliving/gargoyle.png', original: 'gargoyle.png', flip: false },
  rock_roller: { source: 'monster/animals/boulder_beetle.png', original: 'boulder_beetle.png', flip: false },
  rock_shield: { source: 'monster/stone_giant_new.png', original: 'stone_giant_new.png', flip: false },
  rock_crusher: { source: 'monster/nonliving/iron_golem.png', original: 'iron_golem.png', flip: false },
  rock_golem: { source: 'monster/nonliving/stone_golem.png', original: 'stone_golem.png', flip: false },
  rock_titan: { source: 'monster/nonliving/crystal_golem.png', original: 'crystal_golem.png', flip: false },
  rock_elemental: { source: 'monster/nonliving/earth_elemental.png', original: 'earth_elemental.png', flip: false },

  // Evil Plants (7)
  evil_weed: { source: 'monster/fungi_plants/plant.png', original: 'plant.png', flip: false },
  evil_spore: { source: 'monster/fungi_plants/wandering_mushroom_new.png', original: 'wandering_mushroom_new.png', flip: false },
  evil_flower: { source: 'monster/fungi_plants/oklob_plant.png', original: 'oklob_plant.png', flip: false },
  evil_tree: { source: 'monster/fungi_plants/thorn_hunter.png', original: 'thorn_hunter.png', flip: false },
  evil_flytrap: { source: 'monster/fungi_plants/vine_stalker.png', original: 'vine_stalker.png', flip: false },
  evil_treant: { source: 'monster/fungi_plants/treant.png', original: 'treant.png', flip: false },
  evil_mandragora: { source: 'monster/dryad.png', original: 'dryad.png', flip: false },

  // Bosses (4)
  boss_goblin_king: { source: 'monster/orc_warlord.png', original: 'orc_warlord.png', flip: false },
  boss_rock_mountain: { source: 'monster/unique/antaeus.png', original: 'antaeus.png', flip: false },
  boss_evil_world_tree: { source: 'dungeon/trees/mangrove_1.png', original: 'mangrove_1.png', flip: false },
  the_evil_wizard: { source: 'monster/unique/boris_new.png', original: 'boris_new.png', flip: false },

  // Player
  player: { source: 'monster/wizard.png', original: 'wizard.png', flip: false }
};

// 2. Copy PNGs
for (const [id, info] of Object.entries(spriteMap)) {
  const src = path.join(baseDir, info.source);
  if (!fs.existsSync(src)) {
    throw new Error(`Source PNG not found: ${src}`);
  }
  const dest = path.join(targetDir, `${id}.png`);
  fs.copyFileSync(src, dest);
  console.log(`Copied: ${info.source} -> public/assets/entities/${id}.png`);
}

// 3. Write CREDITS.md
let credits = `# Entity Art Credits

Sprites from the **Dungeon Crawl Stone Soup 32×32 Tileset**, hosted on [OpenGameArt.org](https://opengameart.org/content/dungeon-crawl-32x32-tiles) and licensed under [Creative Commons Zero (CC0 1.0 Universal - Public Domain Dedication)](https://creativecommons.org/publicdomain/zero/1.0/).

## Asset Mapping

| Entity ID | Output File | Original Tile | Source Path | License |
| :--- | :--- | :--- | :--- | :--- |
`;

for (const [id, info] of Object.entries(spriteMap)) {
  credits += `| \`${id}\` | \`${id}.png\` | \`${info.original}\` | \`${info.source}\` | CC0 Public Domain |\n`;
}

credits += `
All pixel-art sprites are 32×32 with black pixel outlines, matching the authentic classic roguelike visual style.
Special thanks to the Dungeon Crawl Stone Soup contributors and artists.
`;

fs.writeFileSync(path.join(targetDir, 'CREDITS.md'), credits, 'utf8');
console.log('Saved: public/assets/entities/CREDITS.md');

// 4. Update src/data/enemies.json
const enemiesFile = path.join(repoDir, 'src', 'data', 'enemies.json');
const enemies = JSON.parse(fs.readFileSync(enemiesFile, 'utf8'));

for (const enemy of enemies) {
  const conf = spriteMap[enemy.id];
  if (!conf) {
    console.warn(`No mapping for enemy: ${enemy.id}`);
    continue;
  }
  enemy.art = {
    ...enemy.art,
    spriteUrl: `./assets/entities/${enemy.id}.png`,
  };
  if (conf.flip) {
    enemy.art.flip = true;
  } else {
    delete enemy.art.flip;
  }
}

fs.writeFileSync(enemiesFile, JSON.stringify(enemies, null, 2) + '\n', 'utf8');
console.log('Updated: src/data/enemies.json');

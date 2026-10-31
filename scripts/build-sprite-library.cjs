const fs = require('fs');
const path = require('path');

const repoDir = path.resolve(__dirname, '..');
const spriteLibraryDir = path.join(repoDir, 'public', 'assets', 'sprite-library');

const dcssFull = path.join(process.env.TEMP, 'dcss_full', 'Dungeon Crawl Stone Soup Full');
const dcssTiles = path.join(process.env.TEMP, 'dcss_tiles', 'crawl-tiles Oct-5-2010');
const ravenmoreDir = 'C:\\Users\\lukea\\Downloads\\RavenmoreIconPack2023\\RavenmoreIconPack2023\\64';

const entitiesDir = path.join(repoDir, 'public', 'assets', 'entities');
const relicsDir = path.join(repoDir, 'public', 'assets', 'relics');

// Helper to format clean names
function formatName(filename) {
  return path.basename(filename, '.png')
    .replace(/[_-]+/g, ' ')
    .trim();
}

// Ensure destination directories
const subfolders = [
  'dcss-monsters',
  'dcss-uniques-bosses',
  'dcss-plants-golems',
  'dcss-heroes-wizards',
  'dcss-spells-env',
  'ravenmore'
];

for (const sub of subfolders) {
  const dir = path.join(spriteLibraryDir, sub);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Find a file across dcssFull or dcssTiles
function findSourceFile(relPath) {
  if (fs.existsSync(path.join(dcssFull, relPath))) {
    return path.join(dcssFull, relPath);
  }
  // Try alternative path mapping (e.g. monster -> dc-mon, dungeon -> dc-dngn)
  const mapped1 = relPath.replace(/^monster\//, 'dc-mon/').replace(/^dungeon\//, 'dc-dngn/');
  if (fs.existsSync(path.join(dcssTiles, mapped1))) {
    return path.join(dcssTiles, mapped1);
  }
  if (fs.existsSync(path.join(dcssTiles, relPath))) {
    return path.join(dcssTiles, relPath);
  }
  return null;
}

const manifest = [];

// Helper to copy and record to manifest
function addSprite(srcFullPath, subfolder, packName, customName) {
  if (!fs.existsSync(srcFullPath)) return false;
  const fileName = path.basename(srcFullPath);
  const destPath = path.join(spriteLibraryDir, subfolder, fileName);

  fs.copyFileSync(srcFullPath, destPath);

  const id = `${subfolder}/${fileName}`;
  const name = customName || formatName(fileName);
  const url = `./assets/sprite-library/${subfolder}/${fileName}`;

  manifest.push({ id, name, pack: packName, url });
  return true;
}

// -----------------------------------------------------------------------------
// 1. DCSS Monsters (~90-100)
// -----------------------------------------------------------------------------
console.log('Collecting DCSS Monsters...');
const monsterFiles = [
  // Goblins & Kobolds
  'monster/goblin_new.png', 'monster/hobgoblin_new.png', 'monster/kobold_new.png',
  'monster/big_kobold_new.png', 'monster/kobold_demonologist.png',
  // Orcs
  'monster/orc_new.png', 'monster/orc_warrior_new.png', 'monster/orc_knight_new.png',
  'monster/orc_priest_new.png', 'monster/orc_high_priest_new.png', 'monster/orc_sorcerer_new.png',
  'monster/orc_wizard_new.png', 'monster/vault/deformed_orc.png',
  // Trolls & Ogres
  'monster/troll.png', 'monster/deep_troll.png', 'monster/iron_troll.png', 'monster/rock_troll.png',
  'monster/deep_troll_berserker.png', 'monster/deep_troll_earth_mage.png', 'monster/deep_troll_shaman.png',
  'monster/ogre_new.png', 'monster/ogre_mage_new.png', 'monster/two_headed_ogre_new.png',
  // Gnolls & Beastkin
  'monster/gnoll_new.png', 'monster/gnoll_sergeant.png', 'monster/gnoll_shaman.png',
  'monster/minotaur.png', 'monster/centaur.png', 'monster/centaur_warrior.png',
  'monster/yaktaur_new.png', 'monster/yaktaur_captain_new.png',
  // Nagas & Reptilian
  'monster/naga.png', 'monster/greater_naga.png', 'monster/guardian_naga.png',
  'monster/salamander.png', 'monster/salamander_stormcaller.png',
  // Giants
  'monster/hill_giant_new.png', 'monster/fire_giant_new.png', 'monster/frost_giant_new.png',
  'monster/stone_giant_new.png', 'monster/titan_new.png', 'monster/cyclops_new.png', 'monster/ettin_new.png',
  // Dragons & Drakes
  'monster/golden_dragon.png', 'monster/death_drake.png', 'monster/fire_drake.png',
  'monster/forest_drake.png', 'monster/swamp_drake.png', 'monster/lindwurm.png',
  // Beasts & Creatures
  'monster/animals/warg.png', 'monster/animals/wolf.png', 'monster/animals/hell_hound.png',
  'monster/animals/grizzly_bear.png', 'monster/animals/polar_bear.png', 'monster/animals/black_bear.png',
  'monster/animals/manticore.png', 'monster/griffon.png', 'monster/harpy.png',
  'monster/sphinx_new.png', 'monster/hippogriff_new.png', 'monster/ice_beast.png',
  'monster/animals/boulder_beetle.png', 'monster/animals/boring_beetle.png', 'monster/animals/giant_beetle.png',
  'monster/animals/queen_bee.png', 'monster/animals/killer_bee.png', 'monster/animals/red_wasp.png',
  'monster/animals/yellow_wasp.png', 'monster/animals/giant_spider.png', 'monster/animals/wolf_spider.png',
  'monster/animals/tarantella.png', 'monster/animals/jumping_spider.png', 'monster/animals/redback.png',
  'monster/animals/giant_scorpion.png', 'monster/animals/black_mamba.png', 'monster/animals/viper.png',
  'monster/animals/anaconda.png', 'monster/animals/crocodile.png', 'monster/animals/alligator.png',
  'monster/animals/snapping_turtle.png', 'monster/animals/spiny_frog.png', 'monster/animals/blink_frog.png',
  'monster/animals/elephant.png', 'monster/animals/death_yak.png',
  // Undead & Demons
  'monster/undead/ancient_lich_new.png', 'monster/undead/lich.png', 'monster/undead/vampire.png',
  'monster/undead/vampire_knight.png', 'monster/undead/vampire_mage.png', 'monster/undead/skeletal_warrior.png',
  'monster/undead/mummy.png', 'monster/undead/mummy_priest.png', 'monster/undead/ghoul.png',
  'monster/demons/balrug.png', 'monster/demons/cacodemon.png', 'monster/demons/executioner.png',
  'monster/demons/hellion.png', 'monster/demons/lorocyproca.png', 'monster/demons/neeqecor.png',
  'monster/demons/orange_demon.png', 'monster/demons/reaper.png', 'monster/demons/rust_devil.png',
  'monster/demons/shadow_demon.png', 'monster/demons/sun_demon.png', 'monster/demons/tormentor.png',
  'monster/demons/tzitzimitl.png', 'monster/demons/white_imp.png', 'monster/demons/iron_imp.png',
  'monster/shadow_imp.png', 'monster/quasit.png'
];

for (const rel of monsterFiles) {
  const full = findSourceFile(rel);
  if (full) addSprite(full, 'dcss-monsters', 'DCSS Monsters');
}

// -----------------------------------------------------------------------------
// 2. DCSS Uniques & Bosses (~60-70)
// -----------------------------------------------------------------------------
console.log('Collecting DCSS Uniques & Bosses...');
const uniqueFiles = [
  'monster/orc_warlord.png',
  'monster/unique/antaeus.png',
  'monster/unique/boris_new.png',
  'monster/unique/saint_roka_new.png',
  'monster/unique/roxanne_new.png',
  'monster/unique/menkaure.png',
  'monster/unique/asmodeus.png',
  'monster/unique/cerebov.png',
  'monster/unique/dispater.png',
  'monster/unique/ereshkigal.png',
  'monster/unique/iron_giant.png',
  'monster/unique/lernaean_hydra.png',
  'monster/unique/royal_jelly.png',
  'monster/unique/leshy.png',
  'monster/unique/sonja_new.png',
  'monster/unique/urug_new.png',
  'monster/unique/blork_the_orc_new.png',
  'monster/unique/sigmund_new.png',
  'monster/unique/edmund_new.png',
  'monster/unique/jessica_new.png',
  'monster/unique/agnes_new.png',
  'monster/unique/aizul_new.png',
  'monster/unique/azrael.png',
  'monster/unique/crazy_yiuf.png',
  'monster/unique/dissolution_new.png',
  'monster/unique/donald_new.png',
  'monster/unique/duane.png',
  'monster/unique/enchantress.png',
  'monster/unique/erica_new.png',
  'monster/unique/erolcha_new.png',
  'monster/unique/eustachio_new.png',
  'monster/unique/fannar.png',
  'monster/unique/frances.png',
  'monster/unique/francis.png',
  'monster/unique/frederick_new.png',
  'monster/unique/gastronok_new.png',
  'monster/unique/geryon_new.png',
  'monster/unique/gloorx_vloq.png',
  'monster/unique/grinder_new.png',
  'monster/unique/grum.png',
  'monster/unique/harold.png',
  'monster/unique/ignacio.png',
  'monster/unique/ijyb_new.png',
  'monster/unique/ilsuiw_new.png',
  'monster/unique/jessica_new.png',
  'monster/unique/jorgrun.png',
  'monster/unique/jormungandr.png',
  'monster/unique/jory.png',
  'monster/unique/joseph_new.png',
  'monster/unique/josephine_new.png',
  'monster/unique/jozef.png',
  'monster/unique/kirke_new.png',
  'monster/unique/lamia.png',
  'monster/unique/lom_lobon.png',
  'monster/unique/louise.png',
  'monster/unique/mara.png',
  'monster/unique/margery_new.png',
  'monster/unique/maud_new.png',
  'monster/unique/maurice_new.png',
  'monster/unique/mennas.png',
  'monster/unique/michael.png',
  'monster/unique/mnoleg.png',
  'monster/unique/murray.png',
  'monster/unique/natasha.png',
  'monster/unique/nellie_new.png',
  'monster/unique/nergalle_new.png',
  'monster/unique/nessos_new.png',
  'monster/unique/norbert.png',
  'monster/unique/norris.png',
  'monster/unique/polyphemus_new.png',
  'monster/unique/prince_ribbit.png',
  'monster/unique/psyche_new.png',
  'monster/unique/purgy_new.png',
  'monster/unique/robin.png',
  'monster/unique/rupert_new.png',
  'monster/unique/serpent_of_hell.png',
  'monster/unique/snorg_new.png',
  'monster/unique/sojobo.png',
  'monster/unique/terence_new.png',
  'monster/unique/tiamat.png',
  'monster/unique/vashnia.png',
  'monster/unique/wiglaf_new.png',
  'monster/unique/xtahua_new.png'
];

for (const rel of uniqueFiles) {
  const full = findSourceFile(rel);
  if (full) addSprite(full, 'dcss-uniques-bosses', 'DCSS Uniques & Bosses');
}

// -----------------------------------------------------------------------------
// 3. DCSS Plants & Golems (~40-50)
// -----------------------------------------------------------------------------
console.log('Collecting DCSS Plants & Golems...');
const plantGolemFiles = [
  // Fungi & Plants
  'monster/fungi_plants/plant.png',
  'monster/fungi_plants/plant_crypt.png',
  'monster/fungi_plants/plant_demonic.png',
  'monster/fungi_plants/briar_patch.png',
  'monster/fungi_plants/bush_2.png',
  'monster/fungi_plants/bush_3.png',
  'monster/fungi_plants/bush_4.png',
  'monster/fungi_plants/deathcap.png',
  'monster/fungi_plants/giant_spore.png',
  'monster/fungi_plants/hyperactive_ballistomycete.png',
  'monster/fungi_plants/oklob_plant.png',
  'monster/fungi_plants/thorn_hunter.png',
  'monster/fungi_plants/thorn_lotus.png',
  'monster/fungi_plants/treant.png',
  'monster/fungi_plants/vine_stalker.png',
  'monster/fungi_plants/wandering_mushroom_new.png',
  // Golems & Nonliving
  'monster/nonliving/stone_golem.png',
  'monster/nonliving/iron_golem.png',
  'monster/nonliving/clay_golem.png',
  'monster/nonliving/crystal_golem.png',
  'monster/nonliving/earth_elemental.png',
  'monster/nonliving/electric_golem.png',
  'monster/nonliving/fire_elemental.png',
  'monster/nonliving/water_elemental.png',
  'monster/nonliving/air_elemental.png',
  'monster/nonliving/iron_elemental.png',
  'monster/nonliving/gargoyle.png',
  'monster/nonliving/metal_gargoyle.png',
  'monster/nonliving/molten_gargoyle.png',
  'monster/nonliving/guardian_golem.png',
  'monster/nonliving/flesh_golem.png',
  'monster/nonliving/toenail_golem.png',
  'monster/nonliving/wood_golem.png',
  'monster/nonliving/orb_of_fire.png',
  'monster/nonliving/ball_lightning.png',
  // Statues
  'monster/statues/statue_base.png',
  'monster/statues/ice_statue.png',
  'monster/statues/orange_crystal_statue.png',
  'monster/statues/silver_statue.png',
  'monster/statues/firespitter_statue.png',
  'monster/statues/wucad_mu_statue.png',
  'monster/statues/training_dummy.png'
];

for (const rel of plantGolemFiles) {
  const full = findSourceFile(rel);
  if (full) addSprite(full, 'dcss-plants-golems', 'DCSS Plants & Golems');
}

// -----------------------------------------------------------------------------
// 4. DCSS Heroes & Wizards (~50-60)
// -----------------------------------------------------------------------------
console.log('Collecting DCSS Heroes & Wizards...');
const heroWizardFiles = [
  'monster/wizard.png',
  'monster/human_new.png',
  'monster/elf_new.png',
  'monster/dwarf_new.png',
  'monster/halfling_new.png',
  'monster/gnome.png',
  'monster/deep_dwarf.png',
  'monster/deep_dwarf_artificer.png',
  'monster/deep_dwarf_berserker.png',
  'monster/deep_dwarf_death_knight.png',
  'monster/deep_elf_annihilator.png',
  'monster/deep_elf_blademaster.png',
  'monster/deep_elf_conjurer.png',
  'monster/deep_elf_death_mage.png',
  'monster/deep_elf_demonologist.png',
  'monster/deep_elf_fighter_new.png',
  'monster/deep_elf_high_priest.png',
  'monster/deep_elf_knight_new.png',
  'monster/deep_elf_mage.png',
  'monster/deep_elf_master_archer.png',
  'monster/deep_elf_priest.png',
  'monster/deep_elf_soldier.png',
  'monster/deep_elf_sorcerer.png',
  'monster/deep_elf_summoner.png',
  'monster/necromancer_new.png',
  'monster/death_knight.png',
  'monster/hell_knight_new.png',
  'monster/ironbrand_convoker.png',
  'monster/ironheart_preserver.png',
  'monster/merfolk.png',
  'monster/merfolk_aquamancer_new.png',
  'monster/merfolk_avatar.png',
  'monster/merfolk_fighter.png',
  'monster/merfolk_impaler_new.png',
  'monster/merfolk_javelineer_new.png',
  'monster/naga_mage.png',
  'monster/naga_ritualist.png',
  'monster/naga_sharpshooter.png',
  'monster/naga_warrior.png',
  'monster/salamander_firebrand.png',
  'monster/salamander_mystic.png',
  'monster/spriggan_berserker.png',
  'monster/spriggan_enchanter.png',
  'monster/spriggan_rider.png',
  'monster/tengu.png',
  'monster/tengu_conjurer.png',
  'monster/tengu_reaver.png',
  'monster/tengu_warrior.png',
  'monster/water_nymph.png',
  'monster/dryad.png',
  'monster/satyr.png',
  'monster/faun.png',
  'monster/slave_freed.png',
  'monster/angel.png',
  'monster/daeva.png',
  'monster/grand_avatar.png'
];

for (const rel of heroWizardFiles) {
  const full = findSourceFile(rel);
  if (full) addSprite(full, 'dcss-heroes-wizards', 'DCSS Heroes & Wizards');
}

// -----------------------------------------------------------------------------
// 5. DCSS Spells & Environment (~50-60)
// -----------------------------------------------------------------------------
console.log('Collecting DCSS Spells & Environment...');
const spellsEnvFiles = [
  // Trees & Environment
  'dungeon/trees/mangrove_1.png',
  'dungeon/trees/mangrove_2.png',
  'dungeon/trees/mangrove_3.png',
  'dungeon/trees/tree_1_lightred.png',
  'dungeon/trees/tree_1_red.png',
  'dungeon/trees/tree_1_yellow.png',
  'dungeon/trees/tree_2_lightred.png',
  'dungeon/trees/tree_2_red.png',
  'dungeon/trees/tree_2_yellow.png',
  'dungeon/gateways/dngn_stone_arch.png',
  'dungeon/gateways/stone_stairs_down.png',
  'dungeon/gateways/stone_stairs_up.png',
  'dungeon/altars/dngn_altar_vehumet.png',
  'dungeon/altars/dngn_altar_sif_muna.png',
  'dungeon/altars/dngn_altar_xom.png',
  'dungeon/altars/dngn_altar_nemelex_xobeh.png',
  'dungeon/water/deep_water.png',
  'dungeon/water/shallow_water.png',
  'dungeon/statues/statue_ancient_hero.png',
  'dungeon/statues/statue_dragon.png',
  // Books & Magical Items
  'item/book/book_blue.png',
  'item/book/book_cyan.png',
  'item/book/book_gold.png',
  'item/book/book_green.png',
  'item/book/book_grey.png',
  'item/book/book_lightcyan.png',
  'item/book/book_lightgreen.png',
  'item/book/book_lightred.png',
  'item/book/book_magenta.png',
  'item/book/book_red.png',
  'item/book/book_white.png',
  'item/book/tome.png',
  'item/staff/staff_fire.png',
  'item/staff/staff_cold.png',
  'item/staff/staff_air.png',
  'item/staff/staff_earth.png',
  'item/staff/staff_death.png',
  'item/staff/staff_energy.png',
  'item/staff/staff_poison.png',
  'item/staff/staff_wizardry.png',
  'item/scroll/scroll.png',
  'item/scroll/scroll_magic.png',
  'item/potion/potion_brilliant_blue.png',
  'item/potion/potion_clear.png',
  'item/potion/potion_gold.png',
  'item/potion/potion_magenta.png',
  'item/potion/potion_ruby.png',
  // Spells
  'spells/air/chain_lightning.png',
  'spells/air/lightning_bolt.png',
  'spells/air/airstrike.png',
  'spells/air/shock.png',
  'spells/fire/fireball.png',
  'spells/fire/fire_storm.png',
  'spells/fire/bolt_of_fire.png',
  'spells/fire/ring_of_flames.png',
  'spells/fire/ignite_poison.png',
  'spells/ice/bolt_of_cold.png',
  'spells/ice/freeze.png',
  'spells/ice/freezing_cloud.png',
  'spells/ice/ice_storm.png',
  'spells/ice/ozocubus_armour.png',
  'spells/earth/shatter.png',
  'spells/earth/iron_shot.png',
  'spells/earth/stone_arrow.png',
  'spells/earth/stoneskin.png',
  'spells/translocation/blink.png',
  'spells/translocation/controlled_blink.png',
  'spells/translocation/controlled_teleport.png',
  'spells/translocation/portal.png',
  'spells/necromancy/animate_dead.png',
  'spells/necromancy/vampiric_draining.png',
  'spells/necromancy/deaths_door.png',
  'spells/summoning/summon_demon.png',
  'spells/summoning/summon_elemental.png',
  'spells/summoning/call_imp.png',
  'spells/conjuration/magic_dart.png',
  'spells/conjuration/orb_of_destruction.png'
];

for (const rel of spellsEnvFiles) {
  const full = findSourceFile(rel);
  if (full) addSprite(full, 'dcss-spells-env', 'DCSS Spells & Environment');
}

// -----------------------------------------------------------------------------
// 6. Ravenmore 64x64 Icons (48)
// -----------------------------------------------------------------------------
console.log('Collecting Ravenmore 64x64...');
if (fs.existsSync(ravenmoreDir)) {
  const files = fs.readdirSync(ravenmoreDir).filter(f => f.endsWith('.png'));
  for (const f of files) {
    const src = path.join(ravenmoreDir, f);
    addSprite(src, 'ravenmore', 'Ravenmore 64x64');
  }
} else {
  console.warn(`Ravenmore directory not found at: ${ravenmoreDir}`);
}

// -----------------------------------------------------------------------------
// 7. Entities (26)
// -----------------------------------------------------------------------------
console.log('Indexing existing Entities...');
if (fs.existsSync(entitiesDir)) {
  const files = fs.readdirSync(entitiesDir).filter(f => f.endsWith('.png'));
  for (const f of files) {
    manifest.push({
      id: `entities/${f}`,
      name: formatName(f),
      pack: 'Current Entities',
      url: `./assets/entities/${f}`
    });
  }
}

// -----------------------------------------------------------------------------
// 8. Relics (496)
// -----------------------------------------------------------------------------
console.log('Indexing existing Relics...');
if (fs.existsSync(relicsDir)) {
  const files = fs.readdirSync(relicsDir).filter(f => f.endsWith('.png'));
  for (const f of files) {
    manifest.push({
      id: `relics/${f}`,
      name: formatName(f),
      pack: 'Relics',
      url: `./assets/relics/${f}`
    });
  }
}

// Write manifest.json
const manifestPath = path.join(spriteLibraryDir, 'manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

console.log(`\nSuccess! Sprite library built with ${manifest.length} total sprites indexed.`);

// Summary by pack
const summary = manifest.reduce((acc, item) => {
  acc[item.pack] = (acc[item.pack] || 0) + 1;
  return acc;
}, {});

console.table(summary);

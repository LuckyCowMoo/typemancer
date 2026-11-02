export interface SoundCatalogItem {
  id: string; // File path relative to public/assets/sfx/
  label: string;
  category: 'Blades & Weapons' | 'Magic & Spells' | 'Heavy & Explosive' | 'Armor & Defense' | 'Books & Paper' | 'Beasts & Slime' | 'Environment & Items' | 'UI & Combat Global';
  description: string;
  recommendedTypes?: ('attack' | 'defence' | 'skill' | 'power' | 'debuff')[];
}

export const SOUND_CATALOG: SoundCatalogItem[] = [
  // Blades & Weapons
  { id: 'cards/blade_01.ogg', label: 'Blade Slash 1', category: 'Blades & Weapons', description: 'Crisp medium sword slash', recommendedTypes: ['attack'] },
  { id: 'cards/blade_02.ogg', label: 'Blade Slash 2', category: 'Blades & Weapons', description: 'Heavy slicing sword strike', recommendedTypes: ['attack'] },
  { id: 'cards/blade_03.ogg', label: 'Defensive Blade', category: 'Blades & Weapons', description: 'Quick parrying blade deflection', recommendedTypes: ['attack', 'defence'] },
  { id: 'cards/drawKnife1.ogg', label: 'Draw Knife', category: 'Blades & Weapons', description: 'Swift dagger draw and slice', recommendedTypes: ['attack', 'skill'] },
  { id: 'cards/knifeSlice.ogg', label: 'Knife Slice 1', category: 'Blades & Weapons', description: 'Sharp piercing dagger cut', recommendedTypes: ['attack'] },
  { id: 'cards/knifeSlice2.ogg', label: 'Knife Slice 2', category: 'Blades & Weapons', description: 'Fleshy lacerating cut', recommendedTypes: ['attack'] },
  { id: 'cards/sword_unsheathe.wav', label: 'Sword Unsheathe', category: 'Blades & Weapons', description: 'Clean steel sword draw', recommendedTypes: ['attack', 'skill'] },
  { id: 'cards/swing.wav', label: 'Heavy Swing 1', category: 'Blades & Weapons', description: 'Wide cleaving weapon swoosh', recommendedTypes: ['attack'] },
  { id: 'cards/swing2.wav', label: 'Twin Swing 2', category: 'Blades & Weapons', description: 'Fast double swing strike', recommendedTypes: ['attack'] },
  { id: 'cards/swing3.wav', label: 'Flurry Swing 3', category: 'Blades & Weapons', description: 'Rapid series weapon swing', recommendedTypes: ['attack'] },
  { id: 'cards/chop.ogg', label: 'Axe Chop', category: 'Blades & Weapons', description: 'Heavy forceful wood/bone chop', recommendedTypes: ['attack'] },

  // Magic & Spells
  { id: 'cards/spell_01.ogg', label: 'Arcane Deflect', category: 'Magic & Spells', description: 'Mystic magical deflection ping', recommendedTypes: ['skill', 'defence'] },
  { id: 'cards/spell_fire_01.ogg', label: 'Fire Spell 1', category: 'Magic & Spells', description: 'Crackling flame burst', recommendedTypes: ['attack', 'power'] },
  { id: 'cards/spell_fire_02.ogg', label: 'Fire Spell 2', category: 'Magic & Spells', description: 'Blazing fiery sweep', recommendedTypes: ['attack'] },
  { id: 'cards/spell_fire_03.ogg', label: 'Fire Spell 3', category: 'Magic & Spells', description: 'Intense fiery eruption', recommendedTypes: ['attack', 'skill'] },
  { id: 'cards/flamethrower.ogg', label: 'Flamethrower', category: 'Magic & Spells', description: 'Sustained roaring torrent of flame', recommendedTypes: ['power', 'attack'] },
  { id: 'cards/zap.ogg', label: 'Lightning Zap', category: 'Magic & Spells', description: 'Sudden electric shock zap', recommendedTypes: ['attack'] },
  { id: 'cards/enchant.ogg', label: 'Enchantment Chime', category: 'Magic & Spells', description: 'Mystical evolving chime', recommendedTypes: ['power', 'skill'] },
  { id: 'cards/magicshield.ogg', label: 'Magic Shield', category: 'Magic & Spells', description: 'Resonant barrier activation', recommendedTypes: ['defence', 'power'] },
  { id: 'cards/magicerase.ogg', label: 'Magic Erase', category: 'Magic & Spells', description: 'Whirlwind vanishing sweep', recommendedTypes: ['skill', 'debuff'] },
  { id: 'cards/magicdrop.ogg', label: 'Magic Orb Drop', category: 'Magic & Spells', description: 'Arcane liquid drop ripple', recommendedTypes: ['skill'] },
  { id: 'cards/forcepulse.ogg', label: 'Force Pulse', category: 'Magic & Spells', description: 'Deep telekinetic echoing pulse', recommendedTypes: ['power', 'attack'] },
  { id: 'cards/forcepush.ogg', label: 'Force Push', category: 'Magic & Spells', description: 'Violent kinetic shockwave', recommendedTypes: ['attack', 'skill'] },
  { id: 'cards/heal.ogg', label: 'Restorative Heal', category: 'Magic & Spells', description: 'Warm soothing recovery chime', recommendedTypes: ['skill', 'power'] },
  { id: 'cards/blessing.ogg', label: 'Divine Blessing 1', category: 'Magic & Spells', description: 'Harmonic uplifting choir tone', recommendedTypes: ['skill', 'power'] },
  { id: 'cards/blessing2.ogg', label: 'Divine Blessing 2', category: 'Magic & Spells', description: 'Gentle meditation chime', recommendedTypes: ['skill'] },
  { id: 'cards/blessing3.ogg', label: 'Sanctuary Blessing 3', category: 'Magic & Spells', description: 'Radiant peaceful holy chime', recommendedTypes: ['skill', 'power'] },
  { id: 'cards/curse.ogg', label: 'Dark Curse 1', category: 'Magic & Spells', description: 'Eerie sinister hex whisper', recommendedTypes: ['debuff', 'power'] },
  { id: 'cards/curse2.ogg', label: 'Dark Curse 2', category: 'Magic & Spells', description: 'Haunting vampiric drain', recommendedTypes: ['attack', 'debuff'] },
  { id: 'cards/curse3.ogg', label: 'Dark Curse 3', category: 'Magic & Spells', description: 'Draining shadowy whisper', recommendedTypes: ['attack', 'debuff'] },
  { id: 'spell_cast.ogg', label: 'Global Spell Cast', category: 'Magic & Spells', description: 'Universal wizard spell resonance', recommendedTypes: ['skill'] },

  // Heavy & Explosive
  { id: 'cards/explode.ogg', label: 'Meteor Explosion', category: 'Heavy & Explosive', description: 'Tremendous booming blast', recommendedTypes: ['attack'] },
  { id: 'cards/explode1.ogg', label: 'Final Draft Blast', category: 'Heavy & Explosive', description: 'Concussive dynamite blast', recommendedTypes: ['attack'] },
  { id: 'cards/stones_01.ogg', label: 'Boulder Smash', category: 'Heavy & Explosive', description: 'Crushing rock and stone barrage', recommendedTypes: ['attack'] },
  { id: 'cards/doorClose_1.ogg', label: 'Heavy Slam', category: 'Heavy & Explosive', description: 'Massive blunt impact thud', recommendedTypes: ['attack'] },
  { id: 'attack_hit.ogg', label: 'Combat Direct Hit', category: 'Heavy & Explosive', description: 'Direct melee body impact', recommendedTypes: ['attack'] },

  // Armor & Defense
  { id: 'ward_block.ogg', label: 'Ward Rune Block', category: 'Armor & Defense', description: 'Arcane parchment ward deflect', recommendedTypes: ['defence'] },
  { id: 'cards/metal_01.ogg', label: 'Metallicize Clank', category: 'Armor & Defense', description: 'Hard iron plate impact', recommendedTypes: ['power', 'defence'] },
  { id: 'cards/metal_small1.wav', label: 'Metal Caltrops', category: 'Armor & Defense', description: 'Scattered iron caltrop clink', recommendedTypes: ['power', 'skill'] },
  { id: 'cards/metal_ringing.wav', label: 'Metal Ringing', category: 'Armor & Defense', description: 'Resonating steel echo', recommendedTypes: ['power', 'attack'] },
  { id: 'cards/metalClick.ogg', label: 'Metal Tool Click', category: 'Armor & Defense', description: 'Precision mechanical ratchet', recommendedTypes: ['power', 'skill'] },
  { id: 'cards/metalLatch.ogg', label: 'Metal Latch', category: 'Armor & Defense', description: 'Locking iron bolt latch', recommendedTypes: ['power', 'skill'] },
  { id: 'cards/metalPot1.ogg', label: 'Heavy Metal Anvil 1', category: 'Armor & Defense', description: 'Solid metallic gong strike', recommendedTypes: ['power', 'attack'] },
  { id: 'cards/metalPot2.ogg', label: 'Heavy Metal Anvil 2', category: 'Armor & Defense', description: 'Defensive emergency clank', recommendedTypes: ['defence', 'skill'] },
  { id: 'cards/metalPot3.ogg', label: 'Heavy Metal Anvil 3', category: 'Armor & Defense', description: 'Ringing iron collision', recommendedTypes: ['attack'] },
  { id: 'cards/chain_01.ogg', label: 'Chain Link 1', category: 'Armor & Defense', description: 'Rattling iron chains', recommendedTypes: ['defence', 'skill'] },
  { id: 'cards/chain_02.ogg', label: 'Heavy Chains 2', category: 'Armor & Defense', description: 'Taut barricaded chains', recommendedTypes: ['defence'] },
  { id: 'cards/chainmail1.wav', label: 'Chainmail Armor', category: 'Armor & Defense', description: 'Flexible woven mail rustle', recommendedTypes: ['defence', 'power'] },

  // Books & Paper
  { id: 'cards/bookClose.ogg', label: 'Tome Slam Close', category: 'Books & Paper', description: 'Firm heavy leather tome closure', recommendedTypes: ['defence', 'skill'] },
  { id: 'cards/bookFlip1.ogg', label: 'Page Flip 1 (Bookmark)', category: 'Books & Paper', description: 'Crisp single vellum page flip', recommendedTypes: ['skill'] },
  { id: 'cards/bookFlip2.ogg', label: 'Page Flip 2 (Dog Ear)', category: 'Books & Paper', description: 'Tactile paper fold and turn', recommendedTypes: ['skill'] },
  { id: 'cards/bookFlip3.ogg', label: 'Page Flip 3 (Shuffle)', category: 'Books & Paper', description: 'Quick multiple page riffle', recommendedTypes: ['skill'] },
  { id: 'cards/bookPlace1.ogg', label: 'Heavy Book Thud 1', category: 'Books & Paper', description: 'Solid desk tome drop', recommendedTypes: ['attack', 'defence'] },
  { id: 'cards/bookPlace2.ogg', label: 'Heavy Book Thud 2', category: 'Books & Paper', description: 'Blunt manuscript impact', recommendedTypes: ['attack'] },
  { id: 'cards/book_01.ogg', label: 'Scholarly Book 1', category: 'Books & Paper', description: 'Quiet parchment leaf study', recommendedTypes: ['power', 'skill'] },
  { id: 'cards/book_02.ogg', label: 'Scholarly Book 2', category: 'Books & Paper', description: 'Expert tome consultation', recommendedTypes: ['skill'] },
  { id: 'cards/book_03.ogg', label: 'Scholarly Book 3', category: 'Books & Paper', description: 'Rapid library page rustle', recommendedTypes: ['skill'] },
  { id: 'page_turn.mp3', label: 'Soft Page Turn', category: 'Books & Paper', description: 'Whisper-quiet codex page turn', recommendedTypes: ['skill'] },
  { id: 'draw.wav', label: 'Card Draw', category: 'Books & Paper', description: 'Snappy single card draw', recommendedTypes: ['skill'] },
  { id: 'play_card.wav', label: 'Card Cast Flick', category: 'Books & Paper', description: 'Tactile card flick on table', recommendedTypes: ['skill'] },
  { id: 'shuffle.wav', label: 'Deck Shuffle', category: 'Books & Paper', description: 'Full library deck riffle', recommendedTypes: ['skill'] },
  { id: 'burn_card.mp3', label: 'Card Burn / Ash', category: 'Books & Paper', description: 'Singing fire ash consume', recommendedTypes: ['skill'] },

  // Beasts & Slime
  { id: 'cards/creature_roar_01.ogg', label: 'Demon Beast Roar 1', category: 'Beasts & Slime', description: 'Deep primal demonic growl', recommendedTypes: ['power', 'attack'] },
  { id: 'cards/creature_roar_02.ogg', label: 'Berserk Beast Roar 2', category: 'Beasts & Slime', description: 'Frenzied raging roar', recommendedTypes: ['power', 'attack'] },
  { id: 'cards/creature_monster_01.ogg', label: 'Monster Warcry', category: 'Beasts & Slime', description: 'Echoing battlefield bellow', recommendedTypes: ['skill', 'attack'] },
  { id: 'cards/creature_slime_01.ogg', label: 'Corrosive Slime 1', category: 'Beasts & Slime', description: 'Wet acidic spit splash', recommendedTypes: ['debuff', 'attack'] },
  { id: 'cards/creature_slime_02.ogg', label: 'Ink Spill Slime 2', category: 'Beasts & Slime', description: 'Squelching dark slime splatter', recommendedTypes: ['debuff', 'attack'] },
  { id: 'cards/bite_small.wav', label: 'Viper Bite', category: 'Beasts & Slime', description: 'Snapping sharp fanged bite', recommendedTypes: ['attack', 'debuff'] },

  // Environment & Items
  { id: 'cards/wind.ogg', label: 'Flowing Breeze', category: 'Environment & Items', description: 'Gentle airy rush', recommendedTypes: ['skill', 'power'] },
  { id: 'cards/wind2.ogg', label: 'Rushing Gale', category: 'Environment & Items', description: 'Swift blurred wind gust', recommendedTypes: ['skill', 'defence'] },
  { id: 'cards/steam.ogg', label: 'Hissing Steam', category: 'Environment & Items', description: 'Sizzling noxious cloud vent', recommendedTypes: ['power', 'debuff'] },
  { id: 'cards/item_wood_01.ogg', label: 'Steady Wood Frame', category: 'Environment & Items', description: 'Sturdy wooden desk tap', recommendedTypes: ['power', 'defence'] },
  { id: 'cards/cloth1.ogg', label: 'Cloth Flutter', category: 'Environment & Items', description: 'Agile cloak dodge swoosh', recommendedTypes: ['defence', 'skill'] },
  { id: 'cards/cloth4.ogg', label: 'Cloth Whip', category: 'Environment & Items', description: 'Snapping heavy shroud strike', recommendedTypes: ['attack'] },
  { id: 'cards/clothBelt.ogg', label: 'Leather Belt 1', category: 'Environment & Items', description: 'Supple leather tactical buckle', recommendedTypes: ['skill'] },
  { id: 'cards/clothBelt2.ogg', label: 'Leather Belt 2', category: 'Environment & Items', description: 'Heavy swinging leather strap', recommendedTypes: ['attack'] },
  { id: 'cards/beltHandle1.ogg', label: 'Belt Buckle Click', category: 'Environment & Items', description: 'Secure buckle cinch', recommendedTypes: ['skill'] },
  { id: 'cards/bottle.wav', label: 'Catalyst Bottle', category: 'Environment & Items', description: 'Clinking alchemical glass vial', recommendedTypes: ['skill', 'power'] },
  { id: 'cards/bubble.wav', label: 'Alchemical Bubble', category: 'Environment & Items', description: 'Rising effervescent tonic bubble', recommendedTypes: ['skill'] },
  { id: 'cards/shot.ogg', label: 'Toxic Dart Shot', category: 'Environment & Items', description: 'Snappy blowpipe dart release', recommendedTypes: ['attack', 'debuff'] },
  { id: 'map_open.mp3', label: 'Map Parchment Unroll', category: 'Environment & Items', description: 'Stiff world map unrolling', recommendedTypes: ['skill'] },
  { id: 'road_choose.mp3', label: 'Road Step / Footsteps', category: 'Environment & Items', description: 'Dungeon travel footsteps', recommendedTypes: ['skill'] },

  // UI & Combat Global
  { id: 'wheel_tick', label: 'Wheel Knob Flapper Tick', category: 'UI & Combat Global', description: 'Synthesized crisp mechanical flapper click' },
  { id: 'typewriter', label: 'Mechanical Typewriter Strike', category: 'UI & Combat Global', description: 'Synthesized typewriter striker hit' },
  { id: 'telegraph', label: 'Vintage Telegraph Pulse', category: 'UI & Combat Global', description: 'Synthesized high-frequency telegraph click' },
  { id: 'quill', label: 'Arcane Quill Scrape', category: 'UI & Combat Global', description: 'Synthesized parchment nib scratching' },
  { id: 'chalk', label: 'Soft Chalk Tap', category: 'UI & Combat Global', description: 'Synthesized slate chalkboard tap' },
  { id: 'carriage_bell', label: 'Typewriter Carriage Bell', category: 'UI & Combat Global', description: 'Synthesized cheerful return bell chime' },
  { id: 'spell_chime', label: 'Spell Harmonizer Chime', category: 'UI & Combat Global', description: 'Synthesized resonant magic bell' },
  { id: 'heavy_stamp', label: 'Wax Seal Heavy Stamp', category: 'UI & Combat Global', description: 'Synthesized booming wax seal impact' },
];

export const SOUND_CATEGORIES = Array.from(
  new Set(SOUND_CATALOG.map((s) => s.category))
);

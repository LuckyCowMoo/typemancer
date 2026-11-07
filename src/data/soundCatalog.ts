export interface SoundCatalogItem {
  id: string; // File path relative to public/assets/sfx/ or procedural sound key
  label: string;
  category:
    | 'Blades & Weapons'
    | 'Magic & Spells'
    | 'Heavy & Explosive'
    | 'Armor & Defense'
    | 'Books & Paper'
    | 'Beasts & Slime'
    | 'Environment & Items'
    | 'UI & Combat Global'
    | 'Ambiance';
  description: string;
  recommendedTypes?: ('attack' | 'defence' | 'skill' | 'power' | 'debuff')[];
}

export const SOUND_CATALOG: SoundCatalogItem[] = [
  // Blades & Weapons
  { id: 'cards/blade_01.wav', label: 'Blade Slash 1', category: 'Blades & Weapons', description: 'Crisp medium sword slash with singing steel edge', recommendedTypes: ['attack'] },
  { id: 'cards/blade_02.wav', label: 'Blade Slash 2', category: 'Blades & Weapons', description: 'Heavy slicing sword strike', recommendedTypes: ['attack'] },
  { id: 'cards/blade_03.wav', label: 'Defensive Blade', category: 'Blades & Weapons', description: 'Quick steel-on-steel parry deflection', recommendedTypes: ['attack', 'defence'] },
  { id: 'cards/blade_guillotine.wav', label: 'Guillotine Chop', category: 'Blades & Weapons', description: 'Lethal sliding guillotine drop and sharp cutting cleave', recommendedTypes: ['attack'] },
  { id: 'cards/knifeSlice.wav', label: 'Knife Slice 1', category: 'Blades & Weapons', description: 'Smooth, sharp razor blade cut', recommendedTypes: ['attack'] },
  { id: 'cards/knifeSlice2.wav', label: 'Knife Slice 2', category: 'Blades & Weapons', description: 'Swift deep razor laceration', recommendedTypes: ['attack'] },
  { id: 'cards/quick_slash.wav', label: 'Quick Dagger Slice', category: 'Blades & Weapons', description: 'Nimble razor draw and slash', recommendedTypes: ['attack', 'skill'] },
  { id: 'cards/drawKnife1.ogg', label: 'Draw Knife (Codex UI)', category: 'Blades & Weapons', description: 'Tactile leather blade draw for Codex navigation', recommendedTypes: ['skill'] },
  { id: 'cards/sword_unsheathe.wav', label: 'Sword Unsheathe (Upgrade)', category: 'Blades & Weapons', description: 'Resonant steel draw for Strike card upgrades', recommendedTypes: ['skill', 'attack'] },
  { id: 'cards/swing.wav', label: 'Heavy Swing 1', category: 'Blades & Weapons', description: 'Wide cleaving weapon swoosh', recommendedTypes: ['attack'] },
  { id: 'cards/swing2.wav', label: 'Twin Swing 2 (Double Tap)', category: 'Blades & Weapons', description: 'Fast double swing strike with dual offset hits', recommendedTypes: ['attack'] },
  { id: 'cards/swing3.wav', label: 'Flurry Swing 3 (Rapid)', category: 'Blades & Weapons', description: 'Rapid series multi-swing flurry', recommendedTypes: ['attack'] },
  { id: 'cards/chop.ogg', label: 'Axe Chop', category: 'Blades & Weapons', description: 'Heavy forceful wood/bone chop', recommendedTypes: ['attack'] },

  // Magic & Spells
  { id: 'cards/spell_01.ogg', label: 'Arcane Deflect', category: 'Magic & Spells', description: 'Mystic magical deflection ping', recommendedTypes: ['skill', 'defence'] },
  { id: 'cards/spell_fire_01.ogg', label: 'Fire Spell 1', category: 'Magic & Spells', description: 'Crackling flame burst', recommendedTypes: ['attack', 'power'] },
  { id: 'cards/spell_fire_02.ogg', label: 'Fire Spell 2', category: 'Magic & Spells', description: 'Blazing fiery sweep', recommendedTypes: ['attack'] },
  { id: 'cards/spell_fire_03.ogg', label: 'Fire Spell 3', category: 'Magic & Spells', description: 'Intense fiery eruption', recommendedTypes: ['attack', 'skill'] },
  { id: 'cards/flamethrower.ogg', label: 'Flamethrower', category: 'Magic & Spells', description: 'Sustained roaring torrent of flame', recommendedTypes: ['power', 'attack'] },
  { id: 'cards/zap.wav', label: 'Arcane Spark Crackle', category: 'Magic & Spells', description: 'Earthy mystical spark discharge on parchment', recommendedTypes: ['attack'] },
  { id: 'cards/enchant.ogg', label: 'Enchantment Chime', category: 'Magic & Spells', description: 'Mystical evolving chime', recommendedTypes: ['power', 'skill'] },
  { id: 'cards/magicshield.wav', label: 'Rune Ward Shield', category: 'Magic & Spells', description: 'Ancient parchment glyph protective hum', recommendedTypes: ['defence', 'power'] },
  { id: 'cards/magicerase.wav', label: 'Magic Ink Erase', category: 'Magic & Spells', description: 'Ethereal ink sublimation and vanishing whisper', recommendedTypes: ['skill', 'debuff'] },
  { id: 'cards/magicdrop.wav', label: 'Mystic Mist Smoke', category: 'Magic & Spells', description: 'Arcane smoke puff and gentle dispersal', recommendedTypes: ['skill'] },
  { id: 'cards/forcepulse.ogg', label: 'Force Pulse', category: 'Magic & Spells', description: 'Deep telekinetic echoing pulse', recommendedTypes: ['power', 'attack'] },
  { id: 'cards/forcepush.ogg', label: 'Force Push', category: 'Magic & Spells', description: 'Violent kinetic shockwave', recommendedTypes: ['attack', 'skill'] },
  { id: 'cards/heal.wav', label: 'Gentle Restorative Balm', category: 'Magic & Spells', description: 'Warm soothing recovery chime', recommendedTypes: ['skill', 'power'] },
  { id: 'cards/blessing.ogg', label: 'Divine Blessing 1 (Shop)', category: 'Magic & Spells', description: 'Harmonic uplifting choir tone for Merchant arrival', recommendedTypes: ['skill', 'power'] },
  { id: 'cards/blessing2.ogg', label: 'Divine Blessing 2 (Campfire)', category: 'Magic & Spells', description: 'Peaceful meditation chime for Campfire rest', recommendedTypes: ['skill'] },
  { id: 'cards/blessing3.wav', label: 'Sanctuary Blessing 3', category: 'Magic & Spells', description: 'Radiant peaceful holy chime', recommendedTypes: ['skill', 'power'] },
  { id: 'cards/curse.ogg', label: 'Dark Curse 1 (Boss Omen)', category: 'Magic & Spells', description: 'Eerie sinister hex whisper for Elite and Boss battles', recommendedTypes: ['debuff', 'power'] },
  { id: 'cards/curse2.wav', label: 'Vampiric Drain', category: 'Magic & Spells', description: 'Sinister life-siphon whisper', recommendedTypes: ['attack', 'debuff'] },
  { id: 'cards/curse3.ogg', label: 'Dark Curse 3', category: 'Magic & Spells', description: 'Draining shadowy whisper', recommendedTypes: ['attack', 'debuff'] },
  { id: 'spell_cast.ogg', label: 'Global Spell Cast (Blot)', category: 'Magic & Spells', description: 'Universal wizard spell resonance for Blotting Cloud', recommendedTypes: ['skill'] },

  // Heavy & Explosive
  { id: 'cards/explode.ogg', label: 'Meteor Explosion', category: 'Heavy & Explosive', description: 'Tremendous booming blast', recommendedTypes: ['attack'] },
  { id: 'cards/explode1.ogg', label: 'Final Draft Blast (Rock Defeat)', category: 'Heavy & Explosive', description: 'Concussive blast for Final Draft and high-tier rock enemy defeat', recommendedTypes: ['attack'] },
  { id: 'cards/boulder_smash.wav', label: 'Boulder Smash (Granite Crush)', category: 'Heavy & Explosive', description: 'Crushing heavy rock and granite boulder fracture', recommendedTypes: ['attack'] },
  { id: 'cards/stones_01.ogg', label: 'Counter Pebbles (Shop Clink)', category: 'Heavy & Explosive', description: 'Merchant counter pebbles and coin rattle', recommendedTypes: ['skill'] },
  { id: 'cards/doorClose_1.wav', label: 'Heavy Blunt Slam', category: 'Heavy & Explosive', description: 'Massive blunt impact thud with ground tremor', recommendedTypes: ['attack'] },
  { id: 'attack_hit.wav', label: 'Combat Direct Hit', category: 'Heavy & Explosive', description: 'Punchy visceral fantasy melee combat impact', recommendedTypes: ['attack'] },

  // Armor & Defense
  { id: 'ward_block.ogg', label: 'Ward Rune Block', category: 'Armor & Defense', description: 'Arcane parchment ward deflect', recommendedTypes: ['defence'] },
  { id: 'cards/ward_break.wav', label: 'Ward Barrier Shatter', category: 'Armor & Defense', description: 'Crisp crystalline rupture when ward breaks from attack', recommendedTypes: ['defence', 'attack'] },
  { id: 'cards/metal_01.wav', label: 'Metallicize Plate Clank', category: 'Armor & Defense', description: 'Distinct heavy iron armor plate hardening clank', recommendedTypes: ['power', 'defence'] },
  { id: 'cards/metal_small1.wav', label: 'Metal Caltrops', category: 'Armor & Defense', description: 'Scattered iron caltrop clink', recommendedTypes: ['power', 'skill'] },
  { id: 'cards/metal_ringing.wav', label: 'Metal Ringing (Echo)', category: 'Armor & Defense', description: 'Resonating steel echo with multi-tap delay processing', recommendedTypes: ['power', 'attack'] },
  { id: 'cards/metalClick.ogg', label: 'Metal Tool Click', category: 'Armor & Defense', description: 'Precision mechanical ratchet', recommendedTypes: ['power', 'skill'] },
  { id: 'cards/metalLatch.ogg', label: 'Metal Latch', category: 'Armor & Defense', description: 'Locking iron bolt latch', recommendedTypes: ['power', 'skill'] },
  { id: 'cards/metalPot1.wav', label: 'Forge Anvil 1', category: 'Armor & Defense', description: 'Solid musical anvil strike', recommendedTypes: ['power', 'attack'] },
  { id: 'cards/metalPot2.wav', label: 'Forge Anvil 2', category: 'Armor & Defense', description: 'Defensive tempered anvil block', recommendedTypes: ['defence', 'skill'] },
  { id: 'cards/metalPot3.wav', label: 'Forge Anvil 3', category: 'Armor & Defense', description: 'Ringing iron forge collision', recommendedTypes: ['attack'] },
  { id: 'cards/chain_01.ogg', label: 'Merchant Gold Coins 1', category: 'Armor & Defense', description: 'Clinking purse coins for transactions', recommendedTypes: ['skill'] },
  { id: 'cards/chain_02.ogg', label: 'Merchant Gold Coins 2', category: 'Armor & Defense', description: 'Heavy gold coin purse movement', recommendedTypes: ['skill'] },
  { id: 'cards/chainmail1.wav', label: 'Chainmail Armor', category: 'Armor & Defense', description: 'Flexible woven mail rustle for Fortify and blocking', recommendedTypes: ['defence', 'power'] },

  // Books & Paper
  { id: 'cards/bookClose.ogg', label: 'Tome Slam Close (Entrench)', category: 'Books & Paper', description: 'Firm heavy leather tome closure for Barricade and Entrench', recommendedTypes: ['defence', 'skill'] },
  { id: 'cards/bookFlip1.ogg', label: 'Page Flip 1 (Bookmark)', category: 'Books & Paper', description: 'Crisp single vellum page flip', recommendedTypes: ['skill'] },
  { id: 'cards/bookFlip2.ogg', label: 'Page Flip 2 (Dog Ear)', category: 'Books & Paper', description: 'Tactile paper fold and turn', recommendedTypes: ['skill'] },
  { id: 'cards/bookFlip3.ogg', label: 'Page Flip 3 (Shuffle)', category: 'Books & Paper', description: 'Quick multiple page riffle', recommendedTypes: ['skill'] },
  { id: 'cards/bookPlace1.ogg', label: 'Heavy Book Thud 1', category: 'Books & Paper', description: 'Solid desk tome drop', recommendedTypes: ['attack', 'defence'] },
  { id: 'cards/bookPlace2.ogg', label: 'Heavy Book Thud 2', category: 'Books & Paper', description: 'Blunt manuscript impact', recommendedTypes: ['attack'] },
  { id: 'cards/book_01.ogg', label: 'Scholarly Book 1', category: 'Books & Paper', description: 'Quiet parchment leaf study', recommendedTypes: ['power', 'skill'] },
  { id: 'cards/book_02.ogg', label: 'Scholarly Book 2', category: 'Books & Paper', description: 'Expert tome consultation', recommendedTypes: ['skill'] },
  { id: 'cards/book_03.ogg', label: 'Scholarly Book 3', category: 'Books & Paper', description: 'Rapid library page rustle', recommendedTypes: ['skill'] },
  { id: 'page_turn.mp3', label: 'Soft Page Turn', category: 'Books & Paper', description: 'Whisper-quiet codex page turn', recommendedTypes: ['skill'] },
  { id: 'draw.wav', label: 'Card Draw (Tactile)', category: 'Books & Paper', description: 'Snappy single card draw with multi-draw stagger', recommendedTypes: ['skill'] },
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
  { id: 'cards/wind_trimmed.wav', label: 'Flowing Breeze (Trimmed)', category: 'Environment & Items', description: 'Gentle airy rush trimmed to smooth fade', recommendedTypes: ['skill', 'power'] },
  { id: 'cards/pencil_speedwrite.wav', label: 'Pencil Speedwrite', category: 'Environment & Items', description: 'Rapid graphite pencil sketching and fast drafting', recommendedTypes: ['skill', 'defence'] },
  { id: 'cards/paper_tear.wav', label: 'Paper Tear (Tear in Two)', category: 'Environment & Items', description: 'Vicious, violent parchment and vellum tearing sound', recommendedTypes: ['attack'] },
  { id: 'cards/steam.ogg', label: 'Hissing Steam', category: 'Environment & Items', description: 'Sizzling noxious cloud vent', recommendedTypes: ['power', 'debuff'] },
  { id: 'cards/item_wood_01.wav', label: 'Steady Wood Frame', category: 'Environment & Items', description: 'Warm solid mahogany desk tap', recommendedTypes: ['power', 'defence'] },
  { id: 'cards/cloth1.ogg', label: 'Cloth Flutter', category: 'Environment & Items', description: 'Agile cloak dodge swoosh', recommendedTypes: ['defence', 'skill'] },
  { id: 'cards/cloth4.ogg', label: 'Cloth Whip', category: 'Environment & Items', description: 'Snapping heavy shroud strike', recommendedTypes: ['attack'] },
  { id: 'cards/clothBelt.ogg', label: 'Leather Belt 1', category: 'Environment & Items', description: 'Supple leather tactical buckle', recommendedTypes: ['skill'] },
  { id: 'cards/clothBelt2.ogg', label: 'Leather Belt 2', category: 'Environment & Items', description: 'Heavy swinging leather strap', recommendedTypes: ['attack'] },
  { id: 'cards/beltHandle1.ogg', label: 'Belt Buckle Click', category: 'Environment & Items', description: 'Secure buckle cinch', recommendedTypes: ['skill'] },
  { id: 'cards/bottle.wav', label: 'Catalyst Bottle', category: 'Environment & Items', description: 'Clinking alchemical glass vial for rare elixirs', recommendedTypes: ['skill', 'power'] },
  { id: 'cards/bubble.wav', label: 'Alchemical Bubble', category: 'Environment & Items', description: 'Rising effervescent tonic bubble', recommendedTypes: ['skill'] },
  { id: 'cards/shot.wav', label: 'Toxic Blowpipe Dart', category: 'Environment & Items', description: 'Fantasy wooden blowpipe puff and whistling dart', recommendedTypes: ['attack', 'debuff'] },
  { id: 'map_open.mp3', label: 'Map Parchment Unroll', category: 'Environment & Items', description: 'Stiff world map unrolling', recommendedTypes: ['skill'] },
  { id: 'road_choose.mp3', label: 'Road Step / Footsteps', category: 'Environment & Items', description: 'Dungeon travel footsteps', recommendedTypes: ['skill'] },
  { id: 'cards/chest_open.wav', label: 'Antique Chest Latch Open', category: 'Environment & Items', description: 'Heavy iron latch unlatch and creaking chest lid', recommendedTypes: ['skill'] },
  { id: 'cards/campfire_rest.wav', label: 'Warm Hearth Restoration', category: 'Environment & Items', description: 'Soothing celesta chord and crackling embers', recommendedTypes: ['skill', 'power'] },

  // UI & Combat Global
  { id: 'wheel_tick', label: 'Wheel Knob Flapper Tick', category: 'UI & Combat Global', description: 'Synthesized crisp mechanical flapper click' },
  { id: 'typewriter', label: 'Acoustic Mechanical Typewriter', category: 'UI & Combat Global', description: 'Realistic Remington/Underwood striker crack, linkage & platen roller' },
  { id: 'telegraph', label: 'Tactile Mechanical Keyboard', category: 'UI & Combat Global', description: 'Deep switch click and solid keycap bottom-out thock' },
  { id: 'quill', label: 'Arcane Feather Quill', category: 'UI & Combat Global', description: 'Authentic nib iron gall ink friction on fibrous vellum' },
  { id: 'chalk', label: 'Soft Chalk Tap', category: 'UI & Combat Global', description: 'Powdery mineral chalk tap and drag on slate blackboard' },
  { id: 'carriage_bell', label: 'Typewriter Carriage Bell', category: 'UI & Combat Global', description: 'Authentic brass carriage return bell ding & lever slide' },
  { id: 'spell_chime', label: 'Spell Harmonizer Chime', category: 'UI & Combat Global', description: 'Resonant harmonic enchantment chime' },
  { id: 'heavy_stamp', label: 'Wax Seal Heavy Stamp', category: 'UI & Combat Global', description: 'Deep booming tome slam wax seal impact' },
  { id: 'cards/relic_gain.wav', label: 'Ancient Relic Discovery', category: 'UI & Combat Global', description: 'Ascending celestial bell arpeggio upon relic claim' },
  { id: 'cards/mystery_win.wav', label: 'Wheel of Fate Fortune Chime', category: 'UI & Combat Global', description: 'Lively uplifting fortune major triad chime' },
  { id: 'cards/mystery_fail.wav', label: 'Wheel of Fate Dissonant Drop', category: 'UI & Combat Global', description: 'Suspenseful low hollow drop and dark tritone' },
  { id: 'cards/victory.wav', label: 'Run Victory Fanfare', category: 'UI & Combat Global', description: 'Triumphant celebratory fanfare chords and high bell' },
  { id: 'cards/game_over.wav', label: 'Defeat Dirge & Bell Toll', category: 'UI & Combat Global', description: 'Deep ominous earthquake sub-bass and funeral bell toll' },

  // Ambiance (Procedural Soundscapes for Biomes and Encounters)
  {
    id: 'ambiance:rocky_desert',
    label: 'Rocky Desert Canyon Ambiance',
    category: 'Ambiance',
    description: 'Dry howling canyon wind, shifting sandstone rumble, and swirling dust grains.',
  },
  {
    id: 'ambiance:flowing_riverbank',
    label: 'Flowing Riverbank Ambiance',
    category: 'Ambiance',
    description: 'Continuous rushing water rumble, bubbling current ripples, and crisp water froth.',
  },
  {
    id: 'ambiance:magical_forest_clearing',
    label: 'Magical Forest Clearing Ambiance',
    category: 'Ambiance',
    description: 'Gentle canopy rustle breeze, 432Hz & 648Hz ethereal leyline harmonic drones, and shimmering air.',
  },
  {
    id: 'ambiance:volcanic_caldera',
    label: 'Volcanic Caldera Ambiance',
    category: 'Ambiance',
    description: 'Deep subterranean magma drone (48Hz & 73Hz), low seismic rumble, and warm thermal steam vents.',
  },
  {
    id: 'ambiance:crystal_bastion',
    label: 'Crystal Bastion Ambiance',
    category: 'Ambiance',
    description: '528Hz Solfeggio & 792Hz quartz singing drones, resonant bandpass air, and procedural crystal ping chimes.',
  },
  {
    id: 'ambiance:fuming_ink_marsh',
    label: 'Fuming Ink Marsh Ambiance',
    category: 'Ambiance',
    description: 'Murky swamp bottom drone, fuming toxic vapor hiss, and simmering fluid bubble pops.',
  },
  {
    id: 'ambiance:sunlit_sanctuary',
    label: 'Sunlit Sanctuary Ambiance',
    category: 'Ambiance',
    description: 'Celestial A-major chord drone (220Hz, 277Hz, 329Hz, 440Hz) and radiant 25-second breathing breeze.',
  },
  {
    id: 'ambiance:whispering_library_ruins',
    label: 'Whispering Library Ruins Ambiance',
    category: 'Ambiance',
    description: 'Vaulted stone hall resonance, high arched draft whistle, and distant procedural paper flutter.',
  },
  {
    id: 'ambiance:calm_parchment_meadow',
    label: 'Calm Parchment Meadow Ambiance',
    category: 'Ambiance',
    description: 'Minimalist peaceful pastoral open field breeze through dual-band filters.',
  },
  {
    id: 'ambiance:campfire',
    label: 'Campfire Rest Site Ambiance',
    category: 'Ambiance',
    description: 'Intimate crackling hearth fire, warm combustion roar, and organic popping ember bursts.',
  },
  {
    id: 'ambiance:merchant',
    label: 'Merchant Curiosity Shop Ambiance',
    category: 'Ambiance',
    description: 'Polished mahogany room tone, steady 1.0s pendulum clock tick/tock, and occasional distant coin chime.',
  },
  {
    id: 'ambiance:treasure',
    label: 'Subterranean Treasure Vault Ambiance',
    category: 'Ambiance',
    description: 'Deep hollow vault tone (65.4Hz sub) and procedural echoing water droplets with delayed cavern reflections.',
  },
  {
    id: 'ambiance:mystery',
    label: 'Mystery / Event Chamber Ambiance',
    category: 'Ambiance',
    description: 'Cryptic tritone suspense drone (98Hz G2 & 138.6Hz C#3) and eerie swirling draft.',
  },
  {
    id: 'ambiance:map',
    label: 'Parchment Dungeon Map Ambiance',
    category: 'Ambiance',
    description: 'Open exploration road breeze and warm adventurous harmonic fifth drone (130.8Hz C3 & 196Hz G3).',
  },
  {
    id: 'ambiance:main_menu',
    label: 'Main Menu / Sunlit Sanctuary Ambiance',
    category: 'Ambiance',
    description: 'Serene cathedral air presence and radiant celestial chord progressions that gently billow in and out.',
  },

  // Mystery Event Ambiances (48 Bespoke Narrative Soundscapes)
  {
    id: 'ambiance:event:glowing_inkwell',
    label: 'Mystery: The Whispering Inkwell',
    category: 'Ambiance',
    description: 'Swirling violet fluid bed, arcane whisper drafts, viscous ink bubble bursts.',
  },
  {
    id: 'ambiance:event:silent_choir',
    label: 'Mystery: The Silent Choir',
    category: 'Ambiance',
    description: 'Cold marble cathedral air tone with breathless choir vowel formants (600Hz / 1040Hz) and stone echoes.',
  },
  {
    id: 'ambiance:event:burning_library',
    label: 'Mystery: Pyre of Words',
    category: 'Ambiance',
    description: 'Roaring fire combustion bed, thermal wood snaps, curling parchment crinkles.',
  },
  {
    id: 'ambiance:event:smuggler_of_words',
    label: 'Mystery: The Synonym Smuggler',
    category: 'Ambiance',
    description: 'Rainy midnight alleyway breeze, wool coat movement, muffled brass coin clinks.',
  },
  {
    id: 'ambiance:event:cursed_gramophone',
    label: 'Mystery: The Last Gramophone',
    category: 'Ambiance',
    description: '78 RPM vinyl needle surface noise, periodic rotation bump (0.77s), filtered horn waltz melody.',
  },
  {
    id: 'ambiance:event:graffiti_wall',
    label: 'Mystery: The Wall of Defiance',
    category: 'Ambiance',
    description: 'High-voltage surveillance hum, aerosol canister ball clack, pressurized ink spray hiss.',
  },
  {
    id: 'ambiance:event:torn_pages_wind',
    label: 'Mystery: Flock of Pages',
    category: 'Ambiance',
    description: 'Violent canyon gale with rapid rhythmic paper wing flaps passing across the stereo field.',
  },
  {
    id: 'ambiance:event:miming_beggar',
    label: 'Mystery: The Desperate Mime',
    category: 'Ambiance',
    description: 'Melancholic cobblestone stillness, burlap friction, wooden beggar bowl token rattle.',
  },
  {
    id: 'ambiance:event:broken_instrument',
    label: 'Mystery: The Ink-String Lute',
    category: 'Ambiance',
    description: 'Hollow wooden lute body resonance (110Hz), discordant ink-string plucks, soundhole breeze.',
  },
  {
    id: 'ambiance:event:whispering_echo_cave',
    label: 'Mystery: Cave of Echoes',
    category: 'Ambiance',
    description: 'Deep limestone cave sub-drone (44Hz), multi-tap delayed water drops, crystal singing tones.',
  },
  {
    id: 'ambiance:event:gagged_statue',
    label: 'Mystery: The Gagged Idol',
    category: 'Ambiance',
    description: 'Subterranean marble courtyard tone, rattling iron chains, muffled opera humming behind iron gag.',
  },
  {
    id: 'ambiance:event:ink_blood_fountain',
    label: 'Mystery: The Obsidian Fountain',
    category: 'Ambiance',
    description: 'Heavy dark viscous fluid rush, syrupy ink bubbling plops, heavy fountain cascades.',
  },
  {
    id: 'ambiance:event:lost_love_letters',
    label: 'Mystery: The Hollow Tree',
    category: 'Ambiance',
    description: 'Ancient oak canopy wind, fragile parchment envelope cracking, wood borer clicks in hollow trunk.',
  },
  {
    id: 'ambiance:event:wizard_proclamation',
    label: 'Mystery: The Floating Edict',
    category: 'Ambiance',
    description: 'Arcane electrostatic power hum, electrostatic sparks, royal sigil resonance chime.',
  },
  {
    id: 'ambiance:event:stolen_vocal_cords',
    label: 'Mystery: The Glowing Jar',
    category: 'Ambiance',
    description: 'Resonant glass cavity tone (820Hz), singing trapped vocal cords vibrating through curved glass.',
  },
  {
    id: 'ambiance:event:mechanical_typesetter',
    label: 'Mystery: The Clockwork Typesetter',
    category: 'Ambiance',
    description: 'Steam linotype boiler hum, heavy key lever thuds, brass matrix chute drops.',
  },
  {
    id: 'ambiance:event:phantom_proofreader',
    label: 'Mystery: The Spectral Editor',
    category: 'Ambiance',
    description: 'Frosty ethereal room tone, rapid phantom quill scratching, ghostly sigh.',
  },
  {
    id: 'ambiance:event:origami_bridge',
    label: 'Mystery: The Origami Chasm',
    category: 'Ambiance',
    description: 'Bottomless chasm updraft, creaking parchment tension folds, whistling paper lattices.',
  },
  {
    id: 'ambiance:event:forbidden_printing_press',
    label: 'Mystery: The Underground Press',
    category: 'Ambiance',
    description: 'Secret cellar dampness, heavy iron screw press groan, squelching ink roller.',
  },
  {
    id: 'ambiance:event:wax_seal_altar',
    label: 'Mystery: Shrine of the Crimson Seal',
    category: 'Ambiance',
    description: 'Sacred altar hush, dripping scarlet sealing wax, heavy brass seal stamp strikes.',
  },
  {
    id: 'ambiance:event:censored_cartographer',
    label: 'Mystery: The Censored Cartographer',
    category: 'Ambiance',
    description: 'Crossroads desolate wind, sharp brass divider calipers scratching vellum.',
  },
  {
    id: 'ambiance:event:vowel_tax_collector',
    label: 'Mystery: The Vowel Tax Collector',
    category: 'Ambiance',
    description: 'Carriage cabin interior, iron lockbox key turning, vigorous tax ledger quill scratches.',
  },
  {
    id: 'ambiance:event:mirror_script_wall',
    label: 'Mystery: The Mirror-Script Wall',
    category: 'Ambiance',
    description: 'Polished obsidian stone drone, singing wineglass harmonics, backward acoustic breath.',
  },
  {
    id: 'ambiance:event:gilded_palimpsest',
    label: 'Mystery: The Gilded Palimpsest',
    category: 'Ambiance',
    description: 'Quiet scriptorium silence, bone scraper shaving dried ink, gold leaf foil fluttering.',
  },
  {
    id: 'ambiance:event:iron_bookbinder',
    label: 'Mystery: The Iron Bookbinder\'s Vise',
    category: 'Ambiance',
    description: 'Workshop iron enclosure, squeaking cast-iron screw press, linen thread whip.',
  },
  {
    id: 'ambiance:event:weeping_apostrophe',
    label: 'Mystery: The Weeping Apostrophe',
    category: 'Ambiance',
    description: 'Ancient mossy glade tone, heavy dewdrop bloops into moss, singing stone chime.',
  },
  {
    id: 'ambiance:event:carrier_pigeon_loft',
    label: 'Mystery: The Carrier Pigeon Loft',
    category: 'Ambiance',
    description: 'Watchtower timber wind, mechanical pigeon cooing, brass message cylinder clicks.',
  },
  {
    id: 'ambiance:event:blindfolded_scrivener',
    label: 'Mystery: The Blindfolded Scrivener',
    category: 'Ambiance',
    description: 'Sensory deprivation cell, mathematical wooden stylus tapping, deliberate monk breath.',
  },
  {
    id: 'ambiance:event:suffix_bazaar',
    label: 'Mystery: The Suffix Bazaar',
    category: 'Ambiance',
    description: 'Exotic night bazaar tent murmur, clinking glass potion vials, effervescent suffix tinctures.',
  },
  {
    id: 'ambiance:event:petrified_reading_room',
    label: 'Mystery: The Library of Dust',
    category: 'Ambiance',
    description: 'Cathedral-scale vaulted stone stillness, stone dust avalanche trickles, chipped petrified pages.',
  },
  {
    id: 'ambiance:event:thesaurus_wyrm',
    label: 'Mystery: The Thesaurus Wyrm',
    category: 'Ambiance',
    description: 'Heavy iron snare tension, thousand leather dictionary scales sliding, reptilian papery hiss.',
  },
  {
    id: 'ambiance:event:sunken_scriptorium',
    label: 'Mystery: The Sunken Scriptorium',
    category: 'Ambiance',
    description: 'Flooded basement water lapping, floating leather manuscripts bumping stone, submerged bubble plops.',
  },
  {
    id: 'ambiance:event:ink_bleach_vat',
    label: 'Mystery: The Ink Bleach Vat',
    category: 'Ambiance',
    description: 'Simmering cauldron of boiling lye, wooden paddle stirring paper pulp, caustic steam sizzles.',
  },
  {
    id: 'ambiance:event:tree_of_confession',
    label: 'Mystery: The Tree of Confession',
    category: 'Ambiance',
    description: 'Weeping willow canopy wind, hundreds of silk confession ribbons fluttering, whispered secrets.',
  },
  {
    id: 'ambiance:event:vowel_black_market',
    label: 'Mystery: The Vowel Black Market',
    category: 'Ambiance',
    description: 'Damp sewer brick tone, goblin counting illicit brass letter stamps, coin purse jingling.',
  },
  {
    id: 'ambiance:event:living_footnote',
    label: 'Mystery: The Living Footnote',
    category: 'Ambiance',
    description: 'Cozy study room tone, high-pitched animated asterisk ink-feet scurrying across books.',
  },
  {
    id: 'ambiance:event:anagram_crucible',
    label: 'Mystery: The Anagram Crucible',
    category: 'Ambiance',
    description: 'Foundry furnace roar, molten lead bubbling in iron crucible, red-hot font blocks quenched.',
  },
  {
    id: 'ambiance:event:leyline_astrolabe',
    label: 'Mystery: The Astrolabe of Leylines',
    category: 'Ambiance',
    description: 'Celestial observatory resonance, rotating brass gimbal gears meshing, cosmic alignment ring.',
  },
  {
    id: 'ambiance:event:stuttering_echo_cavern',
    label: 'Mystery: The Echo Cavern',
    category: 'Ambiance',
    description: 'Acoustic crystal cave body (196Hz G3), stuttering multi-bounce stereo echoes, crystal singing rings.',
  },
  {
    id: 'ambiance:event:blacklist_bounty_hunter',
    label: 'Mystery: The Blacklist Bounty Hunter',
    category: 'Ambiance',
    description: 'Mountain pass wind, coarse whetstone sharpening steel nib dagger, Wanted poster flapping.',
  },
  {
    id: 'ambiance:event:origami_master_workshop',
    label: 'Mystery: The Origami Master\'s Workshop',
    category: 'Ambiance',
    description: 'Peaceful tatami room quiet, boxwood folding bone creasing mulberry paper, bamboo clack.',
  },
  {
    id: 'ambiance:event:red_ink_audit',
    label: 'Mystery: The Red Ink Audit Bureau',
    category: 'Ambiance',
    description: 'Cold imperial audit room tone, heavy bureaucratic iron seal stamps, aggressive crimson nib scratches.',
  },
  {
    id: 'ambiance:event:clockwork_metronome',
    label: 'Mystery: The Clockwork Metronome',
    category: 'Ambiance',
    description: 'Abandoned conservatory space, colossal swinging brass pendulum swoosh, strict alternating tick-tock.',
  },
  {
    id: 'ambiance:event:two_sentries_portal',
    label: 'Mystery: The Two Sentry Sphinxes',
    category: 'Ambiance',
    description: 'Desert portal wind, twin sapphire and amber magical drone, stone eyelid grinding.',
  },
  {
    id: 'ambiance:event:sphinx_silent_vowel',
    label: 'Mystery: The Sphinx of the Silent Vowel',
    category: 'Ambiance',
    description: 'Granite crypt air, deep feline granite throat purr, stone claw scrapes.',
  },
  {
    id: 'ambiance:event:three_alchemist_flasks',
    label: 'Mystery: The Three Alchemical Flasks',
    category: 'Ambiance',
    description: 'Apothecary lab simmer, crystal stopper squeak, bubbling glass alembic.',
  },
  {
    id: 'ambiance:event:palindrome_vault',
    label: 'Mystery: The Palindrome Vault Door',
    category: 'Ambiance',
    description: 'Subterranean bank vault hum, bilateral brass tumblers clacking, symmetry chime.',
  },
  {
    id: 'ambiance:event:scales_of_the_censor',
    label: 'Mystery: The Weighing of the Sins',
    category: 'Ambiance',
    description: 'Solemn court chamber hush, brass balance beam pivot creaks, lead-pan clangs, wax seal crack.',
  },
];

export const SOUND_CATEGORIES = Array.from(
  new Set(SOUND_CATALOG.map((s) => s.category))
);

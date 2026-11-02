const fs = require('fs');
const path = require('path');

const enemiesPath = path.join(__dirname, '..', 'src', 'data', 'enemies.json');
const enemies = JSON.parse(fs.readFileSync(enemiesPath, 'utf8'));

// Helper to create a move
function makeMove(id, name, intent, weight, opts = {}) {
  const move = { id, name, intent, weight };
  if (opts.damage) move.damage = opts.damage;
  if (opts.hits) move.hits = opts.hits;
  if (opts.ward) move.ward = opts.ward;
  if (opts.heal) move.heal = opts.heal;
  if (opts.statusEffects) move.statusEffects = opts.statusEffects;
  if (opts.summonPool) move.summonPool = opts.summonPool;
  if (opts.summonCount) move.summonCount = opts.summonCount;

  // Synthesize unified effects array
  const effects = [];
  if (opts.damage) {
    effects.push({
      type: 'damage',
      amount: opts.damage,
      target: opts.target || 'player',
      hits: opts.hits || 1
    });
  }
  if (opts.ward) {
    effects.push({
      type: 'ward',
      amount: opts.ward,
      target: 'self'
    });
  }
  if (opts.heal) {
    effects.push({
      type: 'heal',
      amount: opts.heal,
      target: 'self'
    });
  }
  if (opts.statusEffects) {
    for (const se of opts.statusEffects) {
      effects.push({
        type: se.status,
        amount: se.amount,
        target: se.target || 'player'
      });
    }
  }
  if (opts.summonPool) {
    effects.push({
      type: 'summon',
      amount: opts.summonCount || 1,
      target: 'self'
    });
  }
  if (effects.length > 0) {
    move.effects = effects;
  }
  return move;
}

// Map of behaviors to attach for each enemy id
const newBehaviors = {
  goblin_archer: [
    {
      id: 'below_half_hp',
      name: 'Panicked Hail (< 50% HP)',
      condition: 'below_half_hp',
      moves: [
        makeMove('arrow_storm', 'Arrow Storm', 'multi_attack', 60, { damage: 2, hits: 4 }),
        makeMove('snap_shot', 'Desperate Snap-Shot', 'multi_attack', 40, { damage: 3, hits: 3 })
      ]
    },
    {
      id: 'last_standing',
      name: 'Cornered Archer',
      condition: 'last_standing',
      moves: [
        makeMove('point_blank_jab', 'Point-Blank Bayonet', 'attack', 50, { damage: 8 }),
        makeMove('rapid_needle_shot', 'Rapid Needle Shot', 'multi_attack', 50, { damage: 3, hits: 3 })
      ]
    }
  ],

  goblin_drummer: [
    {
      id: 'below_half_hp',
      name: 'Desperate Rhythm (< 50% HP)',
      condition: 'below_half_hp',
      moves: [
        makeMove('drumstick_frenzy', 'Drumstick Frenzy', 'multi_attack', 60, { damage: 3, hits: 3 }),
        makeMove('heavy_drum_slam', 'Heavy Drum Slam', 'attack', 40, { damage: 8 })
      ]
    },
    {
      id: 'last_standing',
      name: 'Vengeful Drummer',
      condition: 'last_standing',
      moves: [
        makeMove('furious_beatdown', 'Furious Beatdown', 'multi_attack', 60, { damage: 2, hits: 4 }),
        makeMove('cymbal_crash', 'Cymbal Crash', 'attack', 40, { damage: 7 })
      ]
    }
  ],

  goblin_brute: [
    {
      id: 'below_half_hp',
      name: 'Berserk Rampage (< 50% HP)',
      condition: 'below_half_hp',
      moves: [
        makeMove('wild_flailing', 'Wild Flailing', 'multi_attack', 60, { damage: 3, hits: 5 }),
        makeMove('blind_tantrum', 'Blind Tantrum', 'multi_attack', 40, { damage: 2, hits: 6 })
      ]
    },
    {
      id: 'last_standing',
      name: 'Unchecked Rage',
      condition: 'last_standing',
      moves: [
        makeMove('frenzied_charge', 'Frenzied Charge', 'multi_attack', 60, { damage: 3, hits: 4 }),
        makeMove('desperate_club', 'Desperate Club Slam', 'attack', 40, { damage: 14 })
      ]
    }
  ],

  goblin_shaman: [
    {
      id: 'below_half_hp',
      name: 'Cornered Witchcraft (< 50% HP)',
      condition: 'below_half_hp',
      moves: [
        makeMove('caustic_brew_throw', 'Caustic Brew Throw', 'attack_debuff', 55, { damage: 8, statusEffects: [{ status: 'ink_burn', amount: 3, target: 'player' }] }),
        makeMove('hex_lightning', 'Hex Lightning', 'attack', 45, { damage: 12 })
      ]
    },
    {
      id: 'last_standing',
      name: 'Wrath of the Spirits',
      condition: 'last_standing',
      moves: [
        makeMove('spirit_dagger', 'Spirit Dagger', 'attack_debuff', 50, { damage: 8, statusEffects: [{ status: 'exposed', amount: 2, target: 'player' }] }),
        makeMove('ancestral_hex_bolt', 'Ancestral Hex Bolt', 'attack', 50, { damage: 13 })
      ]
    }
  ],

  goblin_assassin: [
    {
      id: 'below_half_hp',
      name: 'Maddened Bloodlust (< 50% HP)',
      condition: 'below_half_hp',
      moves: [
        makeMove('frenzied_thousand_cuts', 'Frenzied Thousand Cuts', 'multi_attack', 65, { damage: 2, hits: 8 }),
        makeMove('dagger_storm', 'Dagger Storm', 'multi_attack', 35, { damage: 3, hits: 5 })
      ]
    },
    {
      id: 'last_standing',
      name: 'Cornered Assassin',
      condition: 'last_standing',
      moves: [
        makeMove('death_dance', 'Death Dance', 'multi_attack', 60, { damage: 2, hits: 7 }),
        makeMove('poisoned_kunai_flurry', 'Poisoned Kunai Flurry', 'attack_debuff', 40, { damage: 2, hits: 4, statusEffects: [{ status: 'ink_burn', amount: 3, target: 'player' }] })
      ]
    }
  ],

  goblin_warlord: [
    {
      id: 'below_half_hp',
      name: "Warlord's Berserk Fury (< 50% HP)",
      condition: 'below_half_hp',
      moves: [
        makeMove('blood_frenzy_flurry', 'Blood Frenzy Flurry', 'multi_attack', 55, { damage: 4, hits: 5 }),
        makeMove('decapitating_cleave', 'Decapitating Cleave', 'attack', 45, { damage: 22 })
      ]
    },
    {
      id: 'last_standing',
      name: "Warlord's Last Stand",
      condition: 'last_standing',
      moves: [
        makeMove('vengeful_onslaught', 'Vengeful Onslaught', 'multi_attack', 60, { damage: 4, hits: 4 }),
        makeMove('iron_bulwark', 'Iron Bulwark', 'defend', 40, { ward: 22 })
      ]
    }
  ],

  rock_pebble: [
    {
      id: 'below_half_hp',
      name: 'Hunker Down (< 50% HP)',
      condition: 'below_half_hp',
      moves: [
        makeMove('pebble_bunker', 'Pebble Bunker', 'defend', 60, { ward: 14 }),
        makeMove('mineral_stitching', 'Mineral Stitching', 'heal', 40, { heal: 6, ward: 4 })
      ]
    },
    {
      id: 'last_standing',
      name: 'Stubborn Pebble',
      condition: 'last_standing',
      moves: [
        makeMove('stubborn_guard', 'Stubborn Guard', 'attack_defend', 60, { damage: 4, ward: 10 }),
        makeMove('tuck_and_roll', 'Tuck and Roll', 'defend', 40, { ward: 12 })
      ]
    }
  ],

  rock_roller: [
    {
      id: 'below_half_hp',
      name: 'Pinball Frenzy (< 50% HP)',
      condition: 'below_half_hp',
      moves: [
        makeMove('spinning_pinball', 'Spinning Pinball', 'multi_attack', 60, { damage: 2, hits: 5 }),
        makeMove('hardened_shell', 'Hardened Shell', 'defend', 40, { ward: 10, heal: 4 })
      ]
    },
    {
      id: 'last_standing',
      name: 'Momentum Roll',
      condition: 'last_standing',
      moves: [
        makeMove('desperate_trample', 'Desperate Trample', 'attack', 60, { damage: 10 }),
        makeMove('roll_barrier', 'Roll Barrier', 'attack_defend', 40, { damage: 5, ward: 8 })
      ]
    }
  ],

  rock_shield: [
    {
      id: 'below_half_hp',
      name: 'Granite Bulwark (< 50% HP)',
      condition: 'below_half_hp',
      moves: [
        makeMove('aegis_wall', 'Aegis Wall', 'defend', 55, { ward: 18 }),
        makeMove('stone_mending', 'Stone Mending', 'heal', 45, { heal: 8, ward: 6 })
      ]
    },
    {
      id: 'last_standing',
      name: 'Impenetrable Wall',
      condition: 'last_standing',
      moves: [
        makeMove('fortress_stance', 'Fortress Stance', 'defend', 60, { ward: 20 }),
        makeMove('desperate_slam', 'Desperate Slam', 'attack_defend', 40, { damage: 8, ward: 8 })
      ]
    }
  ],

  rock_crusher: [
    {
      id: 'below_half_hp',
      name: 'Compacted Monolith (< 50% HP)',
      condition: 'below_half_hp',
      moves: [
        makeMove('titan_bastion', 'Titan Bastion', 'defend', 50, { ward: 24 }),
        makeMove('geological_repair', 'Geological Repair', 'heal', 50, { heal: 14, ward: 10 })
      ]
    },
    {
      id: 'last_standing',
      name: 'Lone Monolith',
      condition: 'last_standing',
      moves: [
        makeMove('heavy_barrier', 'Heavy Barrier', 'defend', 50, { ward: 22 }),
        makeMove('vengeful_pulverize', 'Vengeful Pulverize', 'attack', 50, { damage: 16 })
      ]
    }
  ],

  rock_golem: [
    {
      id: 'below_half_hp',
      name: 'Earthen Reconstruction (< 50% HP)',
      condition: 'below_half_hp',
      moves: [
        makeMove('granite_shell', 'Granite Shell', 'defend', 50, { ward: 25 }),
        makeMove('rebuild_limbs', 'Rebuild Limbs', 'heal', 50, { heal: 15, ward: 10 })
      ]
    },
    {
      id: 'last_standing',
      name: 'Rampaging Golem',
      condition: 'last_standing',
      moves: [
        makeMove('stone_rampage', 'Stone Rampage', 'multi_attack', 50, { damage: 5, hits: 3 }),
        makeMove('fortified_fist', 'Fortified Fist', 'attack_defend', 50, { damage: 10, ward: 15 })
      ]
    }
  ],

  rock_titan: [
    {
      id: 'below_half_hp',
      name: 'Mountain Bulwark (< 50% HP)',
      condition: 'below_half_hp',
      moves: [
        makeMove('colossal_citadel', 'Colossal Citadel', 'defend', 50, { ward: 40 }),
        makeMove('tectonic_reconstitution', 'Tectonic Reconstitution', 'heal', 50, { heal: 22, ward: 18 })
      ]
    },
    {
      id: 'last_standing',
      name: 'Wrath of the Titan',
      condition: 'last_standing',
      moves: [
        makeMove('earthshaker', 'Earthshaker', 'attack', 60, { damage: 26 }),
        makeMove('granite_aegis', 'Granite Aegis', 'defend', 40, { ward: 35 })
      ]
    }
  ],

  rock_elemental: [
    {
      id: 'below_half_hp',
      name: 'Granite Shard Storm (< 50% HP)',
      condition: 'below_half_hp',
      moves: [
        makeMove('razor_shard_hail', 'Razor Shard Hail', 'multi_attack', 60, { damage: 2, hits: 7 }),
        makeMove('splinter_spray', 'Splinter Spray', 'multi_attack', 40, { damage: 3, hits: 5 })
      ]
    },
    {
      id: 'last_standing',
      name: 'Core Resonance',
      condition: 'last_standing',
      moves: [
        makeMove('seismic_pulse', 'Seismic Pulse', 'attack', 50, { damage: 20 }),
        makeMove('crystalline_ward', 'Crystalline Ward', 'defend', 50, { ward: 25 })
      ]
    }
  ],

  evil_weed: [
    {
      id: 'below_half_hp',
      name: 'Thorny Retaliation (< 50% HP)',
      condition: 'below_half_hp',
      moves: [
        makeMove('briar_thorn_volley', 'Briar Thorn Volley', 'multi_attack', 50, { damage: 3, hits: 3 }),
        makeMove('thorny_retaliation', 'Thorny Retaliation', 'attack_defend', 50, { damage: 6, ward: 6 })
      ]
    },
    {
      id: 'last_standing',
      name: 'Constricting Briar',
      condition: 'last_standing',
      moves: [
        makeMove('strangling_bind', 'Strangling Bind', 'attack', 60, { damage: 8 }),
        makeMove('wild_vine_slap', 'Wild Vine Slap', 'multi_attack', 40, { damage: 3, hits: 3 })
      ]
    }
  ],

  evil_spore: [
    {
      id: 'below_half_hp',
      name: 'Spore Needle Burst (< 50% HP)',
      condition: 'below_half_hp',
      moves: [
        makeMove('needle_cloud', 'Needle Cloud', 'multi_attack', 60, { damage: 2, hits: 5 }),
        makeMove('toxic_discharge', 'Toxic Discharge', 'attack_debuff', 40, { damage: 4, statusEffects: [{ status: 'ink_burn', amount: 3, target: 'player' }] })
      ]
    },
    {
      id: 'last_standing',
      name: 'Furious Spore',
      condition: 'last_standing',
      moves: [
        makeMove('stinging_volley', 'Stinging Volley', 'multi_attack', 60, { damage: 2, hits: 4 }),
        makeMove('acid_rupture', 'Acid Rupture', 'attack', 40, { damage: 8 })
      ]
    }
  ],

  evil_flower: [
    {
      id: 'below_half_hp',
      name: 'Venomous Bloom (< 50% HP)',
      condition: 'below_half_hp',
      moves: [
        makeMove('stinging_petals', 'Stinging Petals', 'multi_attack', 50, { damage: 2, hits: 4 }),
        makeMove('nectar_lash', 'Nectar Lash', 'attack', 50, { damage: 8 })
      ]
    },
    {
      id: 'last_standing',
      name: 'Carnivorous Mutation',
      condition: 'last_standing',
      moves: [
        makeMove('corrosive_acid_spray', 'Corrosive Acid Spray', 'attack_debuff', 60, { damage: 7, statusEffects: [{ status: 'ink_burn', amount: 3, target: 'player' }] }),
        makeMove('thorn_dart', 'Thorn Dart', 'attack', 40, { damage: 8 })
      ]
    }
  ],

  evil_tree: [
    {
      id: 'below_half_hp',
      name: 'Deep Root Recovery (< 50% HP)',
      condition: 'below_half_hp',
      moves: [
        makeMove('bark_bastion', 'Bark Bastion', 'defend', 50, { ward: 22 }),
        makeMove('ancient_earth_siphon', 'Ancient Earth Siphon', 'heal', 50, { heal: 16, ward: 8 })
      ]
    },
    {
      id: 'last_standing',
      name: 'Ancient Ironbark',
      condition: 'last_standing',
      moves: [
        makeMove('colossal_bough_slam', 'Colossal Bough Slam', 'attack', 60, { damage: 16 }),
        makeMove('root_fortress', 'Root Fortress', 'defend', 40, { ward: 20 })
      ]
    }
  ],

  evil_flytrap: [
    {
      id: 'below_half_hp',
      name: 'Frenzied Chomping (< 50% HP)',
      condition: 'below_half_hp',
      moves: [
        makeMove('rapid_snapping_spree', 'Rapid Snapping Spree', 'multi_attack', 60, { damage: 2, hits: 6 }),
        makeMove('savage_gnawing', 'Savage Gnawing', 'multi_attack', 40, { damage: 3, hits: 4 })
      ]
    },
    {
      id: 'last_standing',
      name: 'Ravenous Appetite',
      condition: 'last_standing',
      moves: [
        makeMove('chomp_flurry', 'Chomp Flurry', 'multi_attack', 60, { damage: 2, hits: 5 }),
        makeMove('acid_gush', 'Acid Gush', 'attack_debuff', 40, { damage: 6, statusEffects: [{ status: 'ink_burn', amount: 4, target: 'player' }] })
      ]
    }
  ],

  evil_treant: [
    {
      id: 'below_half_hp',
      name: 'Heartwood Fortification (< 50% HP)',
      condition: 'below_half_hp',
      moves: [
        makeMove('ironwood_aegis', 'Ironwood Aegis', 'defend', 50, { ward: 32 }),
        makeMove('primeval_sap_regen', 'Primeval Sap Regeneration', 'heal', 50, { heal: 22, ward: 12 })
      ]
    },
    {
      id: 'last_standing',
      name: 'Wrath of the Ancient Woods',
      condition: 'last_standing',
      moves: [
        makeMove('ancient_crushing_roots', 'Ancient Crushing Roots', 'attack', 60, { damage: 22 }),
        makeMove('bramble_shield', 'Bramble Shield', 'defend', 40, { ward: 30 })
      ]
    }
  ],

  evil_mandragora: [
    {
      id: 'below_half_hp',
      name: 'Hysterical Screaming Frenzy (< 50% HP)',
      condition: 'below_half_hp',
      moves: [
        makeMove('sonic_screeches', 'Sonic Piercing Screeches', 'multi_attack', 60, { damage: 2, hits: 7 }),
        makeMove('convulsive_thrashing', 'Convulsive Thrashing', 'multi_attack', 40, { damage: 3, hits: 5 })
      ]
    },
    {
      id: 'last_standing',
      name: 'Maddened Wail',
      condition: 'last_standing',
      moves: [
        makeMove('deafening_shriek', 'Deafening Shriek', 'attack_debuff', 60, { damage: 12, statusEffects: [{ status: 'exposed', amount: 2, target: 'player' }] }),
        makeMove('spastic_root_whip', 'Spastic Root Whip', 'multi_attack', 40, { damage: 3, hits: 4 })
      ]
    }
  ],

  boss_goblin_king: [
    {
      id: 'below_half_hp',
      name: 'Royal Temper Tantrum (< 50% HP)',
      condition: 'below_half_hp',
      moves: [
        makeMove('royal_flailing_frenzy', 'Royal Flailing Frenzy', 'multi_attack', 45, { damage: 3, hits: 8 }),
        makeMove('scepter_whirlwind', 'Scepter Whirlwind', 'multi_attack', 35, { damage: 4, hits: 5 }),
        makeMove('desperate_royal_cleave', 'Desperate Royal Cleave', 'attack_defend', 20, { damage: 18, ward: 15 })
      ]
    }
  ],

  boss_rock_mountain: [
    {
      id: 'below_half_hp',
      name: 'Continental Slumber Barrier (< 50% HP)',
      condition: 'below_half_hp',
      moves: [
        makeMove('seismic_megalith_barrier', 'Seismic Megalith Barrier', 'defend', 45, { ward: 60 }),
        makeMove('magma_core_mending', 'Magma Core Mending', 'heal', 35, { heal: 30, ward: 25 }),
        makeMove('volcanic_tremor', 'Volcanic Tremor', 'multi_attack', 20, { damage: 4, hits: 5 })
      ]
    }
  ],

  boss_evil_world_tree: [
    {
      id: 'below_half_hp',
      name: 'World Tree Rejuvenation (< 50% HP)',
      condition: 'below_half_hp',
      moves: [
        makeMove('yggdrasil_sanctuary', 'Yggdrasil Sanctuary', 'defend', 40, { ward: 50 }),
        makeMove('photosynthetic_rebirth', 'Photosynthetic Rebirth', 'heal', 40, { heal: 32, ward: 15 }),
        makeMove('thorn_bramble_storm', 'Thorn Bramble Storm', 'multi_attack', 20, { damage: 3, hits: 6 })
      ]
    }
  ],

  origami_cat: [
    {
      id: 'below_half_hp',
      name: 'Feral Scratching (< 50% HP)',
      condition: 'below_half_hp',
      moves: [
        makeMove('frenzied_paws', 'Frenzied Paws', 'multi_attack', 60, { damage: 2, hits: 4 }),
        makeMove('cardboard_box_bunker', 'Cardboard Box Bunker', 'defend', 40, { ward: 12 })
      ]
    }
  ],

  origami_tiger: [
    {
      id: 'below_half_hp',
      name: 'Cornered Apex (< 50% HP)',
      condition: 'below_half_hp',
      moves: [
        makeMove('paper_shred_flurry', 'Paper Shred Flurry', 'multi_attack', 60, { damage: 3, hits: 4 }),
        makeMove('folded_iron_barrier', 'Folded Iron Barrier', 'defend', 40, { ward: 18 })
      ]
    }
  ]
};

// Update enemies
enemies.forEach((enemy) => {
  const extraSets = newBehaviors[enemy.id];
  if (!extraSets) return;

  // Build normal behavior from existing moves if not already present
  const normalSet = {
    id: 'normal',
    name: 'Normal Behaviour',
    condition: 'normal',
    moves: enemy.moves || []
  };

  enemy.behaviors = [
    normalSet,
    ...extraSets
  ];
});

fs.writeFileSync(enemiesPath, JSON.stringify(enemies, null, 2) + '\n', 'utf8');
console.log('Successfully updated enemy behaviors in enemies.json!');

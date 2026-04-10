// 24 Level-Up Perks - Separate from skill tree, shown as 4 random choices at level-up
export const LEVEL_UP_PERKS = {
  // HP Perks
  hardened: {
    id: 'hardened',
    name: 'Hardened',
    icon: '🛡️',
    tier: 1,
    description: '+25 max HP',
    effects: { maxHP: 25 }
  },
  ironBody: {
    id: 'ironBody',
    name: 'Iron Body',
    icon: '🏋️',
    tier: 2,
    description: '+50 max HP',
    effects: { maxHP: 50 }
  },
  titanBody: {
    id: 'titanBody',
    name: 'Titan Body',
    icon: '🗿',
    tier: 3,
    description: '+70 max HP',
    effects: { maxHP: 70 }
  },
  // AP Perks
  combatReflexes: {
    id: 'combatReflexes',
    name: 'Combat Reflexes',
    icon: '⚡',
    tier: 2,
    description: '+1 permanent max AP',
    effects: { maxAP: 1 }
  },
  // Stat Perks
  rawPower: {
    id: 'rawPower',
    name: 'Raw Power',
    icon: '💪',
    tier: 1,
    description: '+3 STR',
    effects: { STR: 3 }
  },
  wastelandSpeed: {
    id: 'wastelandSpeed',
    name: 'Wasteland Speed',
    icon: '🏃',
    tier: 1,
    description: '+3 AGI',
    effects: { AGI: 3 }
  },
  sharpMind: {
    id: 'sharpMind',
    name: 'Sharp Mind',
    icon: '🧠',
    tier: 1,
    description: '+3 INT',
    effects: { INT: 3 }
  },
  ironEndurance: {
    id: 'ironEndurance',
    name: 'Iron Endurance',
    icon: '❤️',
    tier: 1,
    description: '+3 END, +15 HP',
    effects: { END: 3, maxHP: 15 }
  },
  bornLucky: {
    id: 'bornLucky',
    name: 'Born Lucky',
    icon: '🍀',
    tier: 1,
    description: '+3 LCK',
    effects: { LCK: 3 }
  },
  wellRounded: {
    id: 'wellRounded',
    name: 'Well Rounded',
    icon: '⭐',
    tier: 2,
    description: '+1 to every stat',
    effects: { STR: 1, AGI: 1, INT: 1, END: 1, LCK: 1 }
  },
  apotheosis: {
    id: 'apotheosis',
    name: 'Apotheosis',
    icon: '👑',
    tier: 3,
    description: '+2 all stats, +20 HP',
    effects: { STR: 2, AGI: 2, INT: 2, END: 2, LCK: 2, maxHP: 20 }
  },
  // Damage Perks
  weaponTraining: {
    id: 'weaponTraining',
    name: 'Weapon Training',
    icon: '🗡️',
    tier: 1,
    description: '+5 flat ATK damage',
    effects: { flatDamage: 5 }
  },
  weaponMastery: {
    id: 'weaponMastery',
    name: 'Weapon Mastery',
    icon: '⚔️',
    tier: 2,
    description: '+10 flat ATK damage',
    effects: { flatDamage: 10 }
  },
  criticalEye: {
    id: 'criticalEye',
    name: 'Critical Eye',
    icon: '👁️',
    tier: 2,
    description: '+10% crit chance',
    effects: { critChance: 0.1 }
  },
  deadlyPrecision: {
    id: 'deadlyPrecision',
    name: 'Deadly Precision',
    icon: '🎯',
    tier: 3,
    description: '+25% crit damage',
    effects: { critDamage: 0.25 }
  },
  // Economy Perks
  quickLearner: {
    id: 'quickLearner',
    name: 'Quick Learner',
    icon: '📖',
    tier: 2,
    description: '+2 bonus skill points immediately',
    effects: { skillPoints: 2 }
  },
  warHaul: {
    id: 'warHaul',
    name: 'War Haul',
    icon: '💰',
    tier: 1,
    description: '+250 caps immediately',
    effects: { caps: 250 }
  },
  scavengerEyePerk: {
    id: 'scavengerEyePerk',
    name: 'Scavenger Eye',
    icon: '🔍',
    tier: 1,
    description: '+2 loot luck permanently',
    effects: { lootLuck: 2 }
  },
  // Defense Perks
  thickSkin: {
    id: 'thickSkin',
    name: 'Thick Skin',
    icon: '🦎',
    tier: 1,
    description: '-5% damage taken',
    effects: { damageReduction: 0.05 }
  },
  armoredCore: {
    id: 'armoredCore',
    name: 'Armored Core',
    icon: '🔩',
    tier: 2,
    description: '-10% damage taken',
    effects: { damageReduction: 0.1 }
  },
  radTolerance: {
    id: 'radTolerance',
    name: 'Rad Tolerance',
    icon: '☢️',
    tier: 1,
    description: '+25% radiation resistance',
    effects: { radResist: 0.25 }
  },
  // Combo Perks
  battleMedic: {
    id: 'battleMedic',
    name: 'Battle Medic',
    icon: '⚕️',
    tier: 2,
    description: '+2 INT, healing items +20% effective',
    effects: { INT: 2, healingBonus: 0.2 }
  },
  berserkerBlood: {
    id: 'berserkerBlood',
    name: 'Berserker Blood',
    icon: '🩸',
    tier: 3,
    description: '+4 STR, +25% damage when below 40% HP',
    effects: { STR: 4, lowHPDamageBonus: 0.25 }
  },
  shadowStep: {
    id: 'shadowStep',
    name: 'Shadow Step',
    icon: '👤',
    tier: 2,
    description: '+3 AGI, +10% dodge chance',
    effects: { AGI: 3, dodgeChance: 0.1 }
  }
};

export const PERK_LIST = Object.values(LEVEL_UP_PERKS);

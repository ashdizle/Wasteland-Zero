// 10 Character Traits - Player picks 2 during character creation
export const TRAITS = {
  glassCannon: {
    id: 'glassCannon',
    name: 'Glass Cannon',
    icon: '💥',
    description: '+40% damage dealt, but +25% damage taken.',
    effects: { damageDealt: 0.4, damageTaken: 0.25 }
  },
  luckyDevil: {
    id: 'luckyDevil',
    name: 'Lucky Devil',
    icon: '🍀',
    description: '+5 LCK, but -1 to all other stats.',
    effects: { LCK: 5, STR: -1, AGI: -1, INT: -1, END: -1 }
  },
  ironSkin: {
    id: 'ironSkin',
    name: 'Iron Skin',
    icon: '🛡️',
    description: '-15% damage taken, +30 max HP.',
    effects: { damageTaken: -0.15, maxHP: 30 }
  },
  quickDraw: {
    id: 'quickDraw',
    name: 'Quick Draw',
    icon: '⚡',
    description: '+1 starting AP, +3 AGI.',
    effects: { maxAP: 1, AGI: 3 }
  },
  scrounger: {
    id: 'scrounger',
    name: 'Scrounger',
    icon: '🎒',
    description: '+50% caps from all sources, +30% loot luck.',
    effects: { capsMultiplier: 0.5, lootLuck: 0.3 }
  },
  bloodthirsty: {
    id: 'bloodthirsty',
    name: 'Bloodthirsty',
    icon: '🩸',
    description: 'Heal 10% of damage dealt. -10% max HP.',
    effects: { lifesteal: 0.1, maxHP: -10 }
  },
  educated: {
    id: 'educated',
    name: 'Educated',
    icon: '📚',
    description: '+1 skill point per level, +4 INT.',
    effects: { bonusSkillPoints: 1, INT: 4 }
  },
  heavyHitter: {
    id: 'heavyHitter',
    name: 'Heavy Hitter',
    icon: '🔨',
    description: '+25% melee damage, +4 STR.',
    effects: { meleeDamage: 0.25, STR: 4 }
  },
  sharpshooter: {
    id: 'sharpshooter',
    name: 'Sharpshooter',
    icon: '🎯',
    description: '+25% ranged damage, +15% crit chance.',
    effects: { rangedDamage: 0.25, critChance: 0.15 }
  },
  resilient: {
    id: 'resilient',
    name: 'Resilient',
    icon: '❤️‍🔥',
    description: 'Revive once per combat at 25% HP. +20 max HP.',
    effects: { autoRevive: true, maxHP: 20 }
  }
};

export const TRAIT_LIST = Object.values(TRAITS);

// Skill Tree - Unlockable active abilities using skill points
export const SKILL_TREE = {
  // Combat Skills
  fragGrenade: {
    id: 'fragGrenade',
    name: 'Frag Grenade',
    category: 'combat',
    icon: '💣',
    cost: 2,
    apCost: 3,
    usesPerCombat: 1,
    description: 'Throw a grenade dealing 25-40 damage to ALL enemies.',
    effect: { type: 'aoe_damage', min: 25, max: 40 },
    requires: []
  },
  executioner: {
    id: 'executioner',
    name: 'Executioner',
    category: 'combat',
    icon: '⚰️',
    cost: 3,
    apCost: 0,
    usesPerCombat: -1, // passive
    description: 'Deal +30% damage to enemies below 30% HP.',
    effect: { type: 'passive_damage_boost', threshold: 0.3, bonus: 0.3 },
    requires: []
  },
  vampiricStrike: {
    id: 'vampiricStrike',
    name: 'Vampiric Strike',
    category: 'combat',
    icon: '🧛',
    cost: 4,
    apCost: 3,
    usesPerCombat: 2,
    description: 'Attack dealing 120% damage and heal for 50% of damage dealt.',
    effect: { type: 'attack_lifesteal', damageMultiplier: 1.2, healPercent: 0.5 },
    requires: ['fragGrenade']
  },
  berserkerRage: {
    id: 'berserkerRage',
    name: 'Berserker Rage',
    category: 'combat',
    icon: '😡',
    cost: 5,
    apCost: 2,
    usesPerCombat: 1,
    description: 'For 3 turns: +50% damage, -25% defense.',
    effect: { type: 'buff', duration: 3, damageBoost: 0.5, defenseReduction: 0.25 },
    requires: ['executioner']
  },
  snipersmark: {
    id: 'snipersmark',
    name: "Sniper's Mark",
    category: 'combat',
    icon: '🎯',
    cost: 4,
    apCost: 1,
    usesPerCombat: 2,
    description: 'Mark enemy for +40% damage from all attacks for 2 turns.',
    effect: { type: 'debuff_enemy', duration: 2, damageTakenBoost: 0.4 },
    requires: []
  },
  // Defense Skills
  ironWall: {
    id: 'ironWall',
    name: 'Iron Wall',
    category: 'defense',
    icon: '🧱',
    cost: 2,
    apCost: 0,
    usesPerCombat: -1,
    description: 'Brace reduces incoming damage by an additional 20%.',
    effect: { type: 'passive_brace_boost', bonus: 0.2 },
    requires: []
  },
  braceCounter: {
    id: 'braceCounter',
    name: 'Brace Counter',
    category: 'defense',
    icon: '↩️',
    cost: 3,
    apCost: 0,
    usesPerCombat: -1,
    description: 'When bracing, counter-attack for 50% weapon damage.',
    effect: { type: 'passive_counter', damagePercent: 0.5 },
    requires: ['ironWall']
  },
  phoenixProtocol: {
    id: 'phoenixProtocol',
    name: 'Phoenix Protocol',
    category: 'defense',
    icon: '🔥',
    cost: 6,
    apCost: 0,
    usesPerCombat: 1,
    description: 'Revive once per combat at 40% HP when killed.',
    effect: { type: 'passive_revive', hpPercent: 0.4 },
    requires: ['braceCounter']
  },
  // Healing Skills
  triage: {
    id: 'triage',
    name: 'Triage',
    category: 'healing',
    icon: '🩹',
    cost: 2,
    apCost: 0,
    usesPerCombat: -1,
    description: 'Heal 12% of max HP before each combat automatically.',
    effect: { type: 'passive_pre_heal', percent: 0.12 },
    requires: []
  },
  regenField: {
    id: 'regenField',
    name: 'Regen Field',
    category: 'healing',
    icon: '💚',
    cost: 3,
    apCost: 0,
    usesPerCombat: -1,
    description: 'Regenerate 3 HP at the end of each combat turn.',
    effect: { type: 'passive_regen', hpPerTurn: 3 },
    requires: ['triage']
  },
  antiHeal: {
    id: 'antiHeal',
    name: 'Anti-Heal',
    category: 'healing',
    icon: '🚫',
    cost: 3,
    apCost: 0,
    usesPerCombat: -1,
    description: 'Enemy healers are 70% less effective.',
    effect: { type: 'passive_anti_heal', reduction: 0.7 },
    requires: []
  },
  combatMedic: {
    id: 'combatMedic',
    name: 'Combat Medic',
    category: 'healing',
    icon: '💉',
    cost: 4,
    apCost: 2,
    usesPerCombat: 3,
    description: 'Heal for 20% of max HP instantly.',
    effect: { type: 'active_heal', percent: 0.2 },
    requires: ['regenField']
  },
  lifeTap: {
    id: 'lifeTap',
    name: 'Life Tap',
    category: 'healing',
    icon: '💀',
    cost: 5,
    apCost: 1,
    usesPerCombat: 2,
    description: 'Sacrifice 15% HP to gain +2 AP this turn.',
    effect: { type: 'hp_to_ap', hpCost: 0.15, apGain: 2 },
    requires: ['combatMedic']
  },
  // Economy Skills
  scavengersEye: {
    id: 'scavengersEye',
    name: "Scavenger's Eye",
    category: 'economy',
    icon: '👁️',
    cost: 2,
    apCost: 0,
    usesPerCombat: -1,
    description: '+20% loot luck and +15% caps from enemies.',
    effect: { type: 'passive_loot', lootLuck: 0.2, capsBonus: 0.15 },
    requires: []
  },
  blackMarket: {
    id: 'blackMarket',
    name: 'Black Market',
    category: 'economy',
    icon: '🏴',
    cost: 4,
    apCost: 0,
    usesPerCombat: -1,
    description: 'Unlock rare items in shops. -10% shop prices.',
    effect: { type: 'passive_shop', discount: 0.1, unlockRare: true },
    requires: ['scavengersEye']
  }
};

export const SKILL_LIST = Object.values(SKILL_TREE);
export const SKILL_CATEGORIES = ['combat', 'defense', 'healing', 'economy'];

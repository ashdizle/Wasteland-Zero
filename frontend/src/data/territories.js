// 6 Territories with enemies, bosses, and progression
export const TERRITORIES = {
  ashPlains: {
    id: 'ashPlains',
    name: 'Ash Plains',
    order: 1,
    theme: 'Dusty desert ruins',
    description: 'A scorched wasteland of dust and despair. Raiders rule here.',
    bgColor: '#3d2914',
    enemies: ['raider', 'radScorpion', 'wastelandDog', 'raiderGunner'],
    elites: ['raiderCaptain', 'mutatedBear'],
    boss: 'raiderKing',
    minLevel: 1,
    maxLevel: 15,
    lootTier: [0.6, 0.3, 0.08, 0.02, 0, 0, 0], // common, uncommon, rare, epic, legendary, exotic, celestial
    capsMultiplier: 1.0
  },
  toxicSwamp: {
    id: 'toxicSwamp',
    name: 'Toxic Swamp',
    order: 2,
    theme: 'Poisonous wetlands',
    description: 'Murky waters hide unspeakable horrors. Beware the poison.',
    bgColor: '#1a3d1a',
    enemies: ['swampLurker', 'toxicGhoul', 'mutatedFrog', 'swampBandit'],
    elites: ['venomSpitter', 'swampShaman'],
    boss: 'swampBehemoth',
    minLevel: 12,
    maxLevel: 28,
    lootTier: [0.45, 0.35, 0.15, 0.04, 0.01, 0, 0],
    capsMultiplier: 1.3
  },
  scorchedCity: {
    id: 'scorchedCity',
    name: 'Scorched City',
    order: 3,
    theme: 'Urban ruins, fire',
    description: 'The burning remnants of civilization. Fire rules supreme.',
    bgColor: '#4d2600',
    enemies: ['charredGhoul', 'pyromaniac', 'fireAnt', 'scorchedRaider'],
    elites: ['flameWarden', 'infernoBot'],
    boss: 'infernoTitan',
    minLevel: 25,
    maxLevel: 42,
    lootTier: [0.3, 0.35, 0.2, 0.1, 0.04, 0.01, 0],
    capsMultiplier: 1.6
  },
  frozenWastes: {
    id: 'frozenWastes',
    name: 'Frozen Wastes',
    order: 4,
    theme: 'Tundra, ice',
    description: 'Endless frozen plains. The cold kills as surely as any blade.',
    bgColor: '#1a2d3d',
    enemies: ['frostGhoul', 'iceStalker', 'frozenRaider', 'snowBeast'],
    elites: ['cryoMancer', 'frostGolem'],
    boss: 'cryoWarlord',
    minLevel: 38,
    maxLevel: 58,
    lootTier: [0.2, 0.3, 0.25, 0.15, 0.07, 0.03, 0],
    capsMultiplier: 2.0
  },
  volcanicRift: {
    id: 'volcanicRift',
    name: 'Volcanic Rift',
    order: 5,
    theme: 'Lava fields',
    description: 'Rivers of molten rock and ash. Only the strongest survive.',
    bgColor: '#4d1a00',
    enemies: ['lavaBrute', 'magmaSpider', 'ashWraith', 'volcanicCultist'],
    elites: ['magmaBoss', 'obsidianGuard'],
    boss: 'magmaOverlord',
    minLevel: 55,
    maxLevel: 78,
    lootTier: [0.1, 0.2, 0.3, 0.2, 0.12, 0.06, 0.02],
    capsMultiplier: 2.5
  },
  theVoid: {
    id: 'theVoid',
    name: 'The Void',
    order: 6,
    theme: 'Corrupted reality',
    description: 'The final frontier. Reality itself is fractured here.',
    bgColor: '#1a0a2e',
    enemies: ['voidSpawn', 'realityTwister', 'shadowFiend', 'voidCultist'],
    elites: ['dimensionRipper', 'voidPriest'],
    boss: 'voidStalker',
    minLevel: 75,
    maxLevel: 100,
    lootTier: [0.05, 0.1, 0.25, 0.25, 0.2, 0.1, 0.05],
    capsMultiplier: 3.0
  }
};

export const TERRITORY_LIST = Object.values(TERRITORIES).sort((a, b) => a.order - b.order);
export const TERRITORY_ORDER = ['ashPlains', 'toxicSwamp', 'scorchedCity', 'frozenWastes', 'volcanicRift', 'theVoid'];

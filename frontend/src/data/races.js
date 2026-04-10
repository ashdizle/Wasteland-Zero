// 5 Playable Races with permanent stat bonuses/penalties
export const RACES = {
  human: {
    id: 'human',
    name: 'Human',
    icon: '👤',
    description: 'Balanced survivors. Adaptable and resourceful.',
    bonuses: { STR: 2, AGI: 2, INT: 2, END: 2, LCK: 2 },
    penalties: {},
    hpBonus: 15,
    capsBonus: 50,
    special: 'Bonus skill point at levels 10, 20, 30, 40, 50',
    radResist: 0,
    toxinImmune: false
  },
  ghoul: {
    id: 'ghoul',
    name: 'Ghoul',
    icon: '💀',
    description: 'Irradiated survivors. Tough and resilient.',
    bonuses: { STR: 3, END: 4 },
    penalties: { INT: -2 },
    hpBonus: 50,
    capsBonus: 0,
    special: '75% radiation resistance',
    radResist: 0.75,
    toxinImmune: false
  },
  mutant: {
    id: 'mutant',
    name: 'Mutant',
    icon: '👹',
    description: 'Hulking brutes. Raw power incarnate.',
    bonuses: { STR: 6, END: 5 },
    penalties: { AGI: -2, INT: -2 },
    hpBonus: 80,
    capsBonus: 0,
    special: 'Crushing blows deal 20% bonus damage',
    radResist: 0.25,
    toxinImmune: false
  },
  android: {
    id: 'android',
    name: 'Android',
    icon: '🤖',
    description: 'Synthetic beings. Precise and calculating.',
    bonuses: { INT: 4, AGI: 3, LCK: 2 },
    penalties: { STR: -1 },
    hpBonus: 0,
    capsBonus: 25,
    special: 'Immune to toxins and poison',
    radResist: 0.5,
    toxinImmune: true
  },
  psyker: {
    id: 'psyker',
    name: 'Psyker',
    icon: '🔮',
    description: 'Mind-touched. Fragile but devastating.',
    bonuses: { INT: 5, LCK: 4 },
    penalties: { STR: -1, END: -1 },
    hpBonus: -10,
    capsBonus: 0,
    special: 'Critical hits deal 50% bonus damage',
    radResist: 0,
    toxinImmune: false
  }
};

export const RACE_LIST = Object.values(RACES);

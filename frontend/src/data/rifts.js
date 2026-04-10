// Reality Rift Encounters - D20-based skill checks
export const RIFT_ENCOUNTERS = {
  voidGaze: {
    id: 'voidGaze',
    name: 'Void Gaze',
    description: 'Infinite darkness stares back at you. The void hungers for your essence.',
    icon: '🌑',
    hpCost: 100,
    inventorySlotRequired: true,
    options: [
      {
        id: 'endure',
        name: 'ENDURE THE VOID',
        stat: 'END',
        dc: 10,
        difficulty: 'normal',
        successReward: { caps: 200, xp: 150 },
        failurePenalty: { hpLoss: 80, status: 'weakened' }
      },
      {
        id: 'focus',
        name: 'MENTAL FOCUS',
        stat: 'INT',
        dc: 13,
        difficulty: 'hard',
        successReward: { caps: 300, xp: 200, skill: 'perception' },
        failurePenalty: { hpLoss: 60, status: 'confused' }
      },
      {
        id: 'trust',
        name: 'TRUST YOUR LUCK',
        stat: 'LCK',
        dc: 7,
        difficulty: 'easy',
        successReward: { caps: 250, xp: 100 },
        failurePenalty: { hpLoss: 100 }
      }
    ]
  },
  
  realityTear: {
    id: 'realityTear',
    name: 'Reality Rift',
    description: 'A tear in spacetime crackles before you. Reality bends and howls. Three paths through the chaos — choose wisely.',
    icon: '🌀',
    hpCost: 148,
    inventorySlotRequired: true,
    options: [
      {
        id: 'brawn',
        name: 'BRAWN TEST',
        stat: 'STR',
        dc: 12,
        difficulty: 'normal',
        description: "Force your way through the rift's crushing energy field.",
        successReward: { caps: 400, xp: 250, item: 'rare' },
        failurePenalty: { hpLoss: 120, status: 'broken' }
      },
      {
        id: 'mindMeld',
        name: 'MIND MELD',
        stat: 'INT',
        dc: 15,
        difficulty: 'hard',
        description: "Attune your mind to the rift's impossible frequency.",
        successReward: { caps: 600, xp: 350, item: 'epic' },
        failurePenalty: { hpLoss: 90, status: 'psychic_damage' }
      },
      {
        id: 'luck',
        name: 'LUCK OF THE DRAW',
        stat: 'LCK',
        dc: 8,
        difficulty: 'easy',
        description: 'Let the rift itself decide your fate. Wild outcomes guaranteed.',
        successReward: { caps: 300, xp: 200, item: 'random' },
        failurePenalty: { hpLoss: 150, caps: -100 }
      }
    ]
  },
  
  cosmicWhispers: {
    id: 'cosmicWhispers',
    name: 'Cosmic Whispers',
    description: 'Voices from beyond speak in tongues unknown. They offer knowledge... for a price.',
    icon: '👁️',
    hpCost: 75,
    inventorySlotRequired: false,
    options: [
      {
        id: 'listen',
        name: 'LISTEN CLOSELY',
        stat: 'INT',
        dc: 11,
        difficulty: 'normal',
        successReward: { xp: 300, skill: 'wisdom' },
        failurePenalty: { hpLoss: 50, status: 'madness' }
      },
      {
        id: 'resist',
        name: 'RESIST THE CALL',
        stat: 'END',
        dc: 14,
        difficulty: 'hard',
        successReward: { caps: 150, hpHeal: 50 },
        failurePenalty: { hpLoss: 60 }
      },
      {
        id: 'embrace',
        name: 'EMBRACE CHAOS',
        stat: 'LCK',
        dc: 9,
        difficulty: 'easy',
        successReward: { caps: 500, item: 'legendary' },
        failurePenalty: { hpLoss: 100, capsLoss: 200 }
      }
    ]
  },
  
  timeFracture: {
    id: 'timeFracture',
    name: 'Time Fracture',
    description: 'Past, present, and future collide. A glimpse of what was and what could be.',
    icon: '⏳',
    hpCost: 120,
    inventorySlotRequired: true,
    options: [
      {
        id: 'navigate',
        name: 'NAVIGATE TIME',
        stat: 'AGI',
        dc: 13,
        difficulty: 'hard',
        successReward: { caps: 350, xp: 250, item: 'epic' },
        failurePenalty: { hpLoss: 100, status: 'time_sickness' }
      },
      {
        id: 'observe',
        name: 'OBSERVE & LEARN',
        stat: 'INT',
        dc: 10,
        difficulty: 'normal',
        successReward: { xp: 400, skill: 'foresight' },
        failurePenalty: { hpLoss: 70 }
      },
      {
        id: 'gamble',
        name: 'GAMBLE WITH FATE',
        stat: 'LCK',
        dc: 6,
        difficulty: 'easy',
        successReward: { caps: 800, item: 'exotic' },
        failurePenalty: { hpLoss: 150, xpLoss: 100 }
      }
    ]
  },
  
  aberrantPortal: {
    id: 'aberrantPortal',
    name: 'Aberrant Portal',
    description: 'A gateway to somewhere... else. Strange energies pulse from within.',
    icon: '🚪',
    hpCost: 90,
    inventorySlotRequired: true,
    options: [
      {
        id: 'charge',
        name: 'CHARGE THROUGH',
        stat: 'STR',
        dc: 11,
        difficulty: 'normal',
        successReward: { caps: 300, xp: 200 },
        failurePenalty: { hpLoss: 80, status: 'teleported' }
      },
      {
        id: 'sneak',
        name: 'STEALTH APPROACH',
        stat: 'AGI',
        dc: 14,
        difficulty: 'hard',
        successReward: { caps: 450, item: 'rare' },
        failurePenalty: { hpLoss: 60 }
      },
      {
        id: 'chance',
        name: 'TAKE YOUR CHANCES',
        stat: 'LCK',
        dc: 8,
        difficulty: 'easy',
        successReward: { caps: 400, xp: 150 },
        failurePenalty: { hpLoss: 120 }
      }
    ]
  }
};

// Get random rift encounter
export const getRandomRift = () => {
  const riftIds = Object.keys(RIFT_ENCOUNTERS);
  const randomId = riftIds[Math.floor(Math.random() * riftIds.length)];
  return RIFT_ENCOUNTERS[randomId];
};

// D20 roll mechanics
export const rollD20 = () => Math.floor(Math.random() * 20) + 1;

export const performSkillCheck = (stat, statValue, dc) => {
  const roll = rollD20();
  const total = roll + statValue;
  const success = total >= dc;
  
  return {
    roll,
    modifier: statValue,
    total,
    dc,
    success,
    isCrit: roll === 20,
    isCritFail: roll === 1
  };
};

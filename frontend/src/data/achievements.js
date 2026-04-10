// 40+ Achievements with Bronze, Gold, Diamond tiers
export const ACHIEVEMENTS = {
  // Bronze Achievements - Basic milestones
  firstBlood: {
    id: 'firstBlood',
    name: 'First Blood',
    tier: 'bronze',
    description: 'Defeat your first enemy',
    requirement: { type: 'kills', value: 1 },
    reward: { caps: 25, xp: 50 }
  },
  lootGoblin: {
    id: 'lootGoblin',
    name: 'Loot Goblin',
    tier: 'bronze',
    description: 'Pick up your first item',
    requirement: { type: 'itemsLooted', value: 1 },
    reward: { caps: 20, xp: 30 }
  },
  survivor: {
    id: 'survivor',
    name: 'Survivor',
    tier: 'bronze',
    description: 'Win your first combat encounter',
    requirement: { type: 'combatsWon', value: 1 },
    reward: { caps: 30, xp: 60 }
  },
  explorer: {
    id: 'explorer',
    name: 'Explorer',
    tier: 'bronze',
    description: 'Explore 10 map tiles',
    requirement: { type: 'tilesExplored', value: 10 },
    reward: { caps: 40, xp: 80 }
  },
  shopper: {
    id: 'shopper',
    name: 'Shopper',
    tier: 'bronze',
    description: 'Buy something from a shop',
    requirement: { type: 'itemsBought', value: 1 },
    reward: { caps: 25, xp: 40 }
  },
  levelUp: {
    id: 'levelUp',
    name: 'Level Up!',
    tier: 'bronze',
    description: 'Reach level 5',
    requirement: { type: 'level', value: 5 },
    reward: { caps: 50, xp: 100 }
  },
  bossSlayer: {
    id: 'bossSlayer',
    name: 'Boss Slayer',
    tier: 'bronze',
    description: 'Defeat your first boss',
    requirement: { type: 'bossKills', value: 1 },
    reward: { caps: 100, xp: 200 }
  },
  healer: {
    id: 'healer',
    name: 'Healer',
    tier: 'bronze',
    description: 'Use 5 healing items',
    requirement: { type: 'healingItemsUsed', value: 5 },
    reward: { caps: 35, xp: 70 }
  },
  skillful: {
    id: 'skillful',
    name: 'Skillful',
    tier: 'bronze',
    description: 'Unlock your first skill',
    requirement: { type: 'skillsUnlocked', value: 1 },
    reward: { caps: 40, xp: 80 }
  },
  wealthy: {
    id: 'wealthy',
    name: 'Wealthy',
    tier: 'bronze',
    description: 'Accumulate 500 caps',
    requirement: { type: 'capsTotal', value: 500 },
    reward: { xp: 100 }
  },
  // Gold Achievements - Difficult feats
  centurion: {
    id: 'centurion',
    name: 'Centurion',
    tier: 'gold',
    description: 'Kill 100 enemies',
    requirement: { type: 'kills', value: 100 },
    reward: { caps: 250, xp: 500, item: 'rare' }
  },
  veteranExplorer: {
    id: 'veteranExplorer',
    name: 'Veteran Explorer',
    tier: 'gold',
    description: 'Explore 100 map tiles',
    requirement: { type: 'tilesExplored', value: 100 },
    reward: { caps: 200, xp: 400 }
  },
  levelTwenty: {
    id: 'levelTwenty',
    name: 'Seasoned Warrior',
    tier: 'gold',
    description: 'Reach level 20',
    requirement: { type: 'level', value: 20 },
    reward: { caps: 300, xp: 600, item: 'rare' }
  },
  criticalMaster: {
    id: 'criticalMaster',
    name: 'Critical Master',
    tier: 'gold',
    description: 'Land 50 critical hits',
    requirement: { type: 'criticalHits', value: 50 },
    reward: { caps: 200, xp: 400 }
  },
  heavyHitter: {
    id: 'heavyHitter',
    name: 'Heavy Hitter',
    tier: 'gold',
    description: 'Deal 150+ damage in a single hit',
    requirement: { type: 'maxDamage', value: 150 },
    reward: { caps: 250, xp: 500 }
  },
  celestialFinder: {
    id: 'celestialFinder',
    name: 'Celestial Finder',
    tier: 'gold',
    description: 'Obtain a Celestial tier item',
    requirement: { type: 'celestialItems', value: 1 },
    reward: { caps: 500, xp: 1000 }
  },
  bountyHunter: {
    id: 'bountyHunter',
    name: 'Bounty Hunter',
    tier: 'gold',
    description: 'Complete 10 bounties',
    requirement: { type: 'bountiesCompleted', value: 10 },
    reward: { caps: 300, xp: 600 }
  },
  dungeonDiver: {
    id: 'dungeonDiver',
    name: 'Dungeon Diver',
    tier: 'gold',
    description: 'Complete 5 dungeons',
    requirement: { type: 'dungeonsCompleted', value: 5 },
    reward: { caps: 350, xp: 700, item: 'epic' }
  },
  territoryConqueror: {
    id: 'territoryConqueror',
    name: 'Territory Conqueror',
    tier: 'gold',
    description: 'Clear 3 territories',
    requirement: { type: 'territoriesCleared', value: 3 },
    reward: { caps: 400, xp: 800 }
  },
  skillMaster: {
    id: 'skillMaster',
    name: 'Skill Master',
    tier: 'gold',
    description: 'Unlock 10 skills',
    requirement: { type: 'skillsUnlocked', value: 10 },
    reward: { caps: 250, xp: 500, skillPoints: 2 }
  },
  // Diamond Achievements - Pinnacle runs
  prestigeOne: {
    id: 'prestigeOne',
    name: 'Prestige I',
    tier: 'diamond',
    description: 'Complete the game and Prestige',
    requirement: { type: 'prestige', value: 1 },
    reward: { caps: 1000, xp: 2000, item: 'legendary' }
  },
  hardcoreVictor: {
    id: 'hardcoreVictor',
    name: 'Hardcore Victor',
    tier: 'diamond',
    description: 'Beat the game in Hardcore mode',
    requirement: { type: 'hardcoreWin', value: 1 },
    reward: { caps: 2000, xp: 5000, item: 'exotic' }
  },
  maxLevel: {
    id: 'maxLevel',
    name: 'Wasteland Legend',
    tier: 'diamond',
    description: 'Reach level 50',
    requirement: { type: 'level', value: 50 },
    reward: { caps: 1500, xp: 3000, item: 'legendary' }
  },
  ultimateWarrior: {
    id: 'ultimateWarrior',
    name: 'Ultimate Warrior',
    tier: 'diamond',
    description: 'Reach level 100',
    requirement: { type: 'level', value: 100 },
    reward: { caps: 5000, xp: 10000, item: 'celestial' }
  },
  allBosses: {
    id: 'allBosses',
    name: 'Boss Annihilator',
    tier: 'diamond',
    description: 'Defeat all 6 territory bosses',
    requirement: { type: 'bossKills', value: 6 },
    reward: { caps: 1200, xp: 2500, item: 'legendary' }
  },
  thousandKills: {
    id: 'thousandKills',
    name: 'Wasteland Reaper',
    tier: 'diamond',
    description: 'Kill 1000 enemies',
    requirement: { type: 'kills', value: 1000 },
    reward: { caps: 2500, xp: 5000 }
  },
  completionist: {
    id: 'completionist',
    name: 'Completionist',
    tier: 'diamond',
    description: 'Unlock all skills',
    requirement: { type: 'allSkills', value: 1 },
    reward: { caps: 1500, xp: 3000 }
  },
  millionaire: {
    id: 'millionaire',
    name: 'Cap Millionaire',
    tier: 'diamond',
    description: 'Have 10,000 caps at once',
    requirement: { type: 'capsTotal', value: 10000 },
    reward: { xp: 2000, item: 'exotic' }
  },
  perfectRun: {
    id: 'perfectRun',
    name: 'Perfect Run',
    tier: 'diamond',
    description: 'Clear a territory without taking damage',
    requirement: { type: 'perfectTerritory', value: 1 },
    reward: { caps: 1000, xp: 2000 }
  },
  voidConqueror: {
    id: 'voidConqueror',
    name: 'Void Conqueror',
    tier: 'diamond',
    description: 'Defeat the Void Stalker',
    requirement: { type: 'finalBoss', value: 1 },
    reward: { caps: 3000, xp: 6000, item: 'celestial' }
  }
};

export const ACHIEVEMENT_LIST = Object.values(ACHIEVEMENTS);
export const ACHIEVEMENT_TIERS = ['bronze', 'gold', 'diamond'];

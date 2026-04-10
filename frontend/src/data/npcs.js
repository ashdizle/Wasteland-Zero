// NPC Quest System - Multi-stage quest chains
export const NPC_QUESTS = {
  oldMiner: {
    id: 'oldMiner',
    name: 'Old Miner Pete',
    territory: 'ashPlains',
    icon: '⛏️',
    portrait: 'miner',
    questChain: [
      {
        stage: 1,
        title: 'Lost Pickaxe',
        dialogue: [
          "Hey there, stranger! Name's Pete. Been mining these wastes for 30 years.",
          "Lost my lucky pickaxe to some raiders. Would you get it back for me?",
          "They're holed up somewhere in the east. Kill their captain, and it should be on him."
        ],
        objective: { type: 'killEnemy', target: 'raiderCaptain', count: 1 },
        reward: { caps: 150, xp: 200, item: 'uncommon' }
      },
      {
        stage: 2,
        title: 'The Hidden Vein',
        dialogue: [
          "You're a true friend! That pickaxe means the world to me.",
          "Say, I know where there's a rich vein of pre-war tech. Interested?",
          "Clear out the critters in the old mine shaft, and we'll split the loot."
        ],
        objective: { type: 'clearDungeon', dungeon: 'abandonedMine' },
        reward: { caps: 300, xp: 400, item: 'rare' }
      },
      {
        stage: 3,
        title: 'Pete\'s Revenge',
        dialogue: [
          "Those raiders... they killed my son years ago.",
          "The Raider King himself gave the order. I'm too old to fight.",
          "Will you avenge my boy? End the Raider King."
        ],
        objective: { type: 'killBoss', target: 'raiderKing' },
        reward: { caps: 500, xp: 800, item: 'epic', special: 'petesBlessingTrait' }
      }
    ]
  },
  wanderingMerchant: {
    id: 'wanderingMerchant',
    name: 'Carla the Trader',
    territory: 'toxicSwamp',
    icon: '💼',
    portrait: 'merchant',
    questChain: [
      {
        stage: 1,
        title: 'Escort Mission',
        dialogue: [
          "Well met, traveler! I'm Carla, purveyor of fine wasteland goods.",
          "I need to get through this swamp, but it's crawling with lurkers.",
          "Clear the path ahead, and I'll make it worth your while."
        ],
        objective: { type: 'killEnemy', target: 'swampLurker', count: 5 },
        reward: { caps: 200, xp: 250, shopDiscount: 0.1 }
      },
      {
        stage: 2,
        title: 'Rare Ingredients',
        dialogue: [
          "Thanks for the help! Business has been good thanks to you.",
          "I'm working on a special brew, but I need toxic glands.",
          "Kill some Venom Spitters and bring me what's left of them."
        ],
        objective: { type: 'killEnemy', target: 'venomSpitter', count: 3 },
        reward: { caps: 350, xp: 450, item: 'antidoteRecipe' }
      },
      {
        stage: 3,
        title: 'The Big Score',
        dialogue: [
          "I've heard rumors of a massive treasure in the Behemoth's lair.",
          "No one's ever come back from facing that monster.",
          "But you... you might just be crazy enough to try."
        ],
        objective: { type: 'killBoss', target: 'swampBehemoth' },
        reward: { caps: 600, xp: 1000, item: 'legendary', special: 'carlasSupplierStatus' }
      }
    ]
  },
  mysteriousStranger: {
    id: 'mysteriousStranger',
    name: 'The Stranger',
    territory: 'theVoid',
    icon: '❓',
    portrait: 'stranger',
    questChain: [
      {
        stage: 1,
        title: 'Into the Unknown',
        dialogue: [
          "...",
          "You've come far, survivor. The Void calls to you.",
          "Prove your worth. Destroy 10 Void Spawn."
        ],
        objective: { type: 'killEnemy', target: 'voidSpawn', count: 10 },
        reward: { caps: 500, xp: 800, item: 'exotic' }
      },
      {
        stage: 2,
        title: 'The Truth',
        dialogue: [
          "You begin to understand. Reality is... fragile.",
          "The Void Stalker seeks to unmake everything.",
          "Only by defeating the Dimension Ripper can you learn how to stop it."
        ],
        objective: { type: 'killEnemy', target: 'dimensionRipper', count: 1 },
        reward: { caps: 800, xp: 1200, item: 'voidFragment' }
      },
      {
        stage: 3,
        title: 'End of All Things',
        dialogue: [
          "The time has come. You are ready.",
          "Face the Void Stalker. End this nightmare.",
          "The fate of reality rests on your shoulders."
        ],
        objective: { type: 'killBoss', target: 'voidStalker' },
        reward: { caps: 2000, xp: 5000, item: 'celestial', special: 'voidWalkerTitle' }
      }
    ]
  }
};

export const NPC_LIST = Object.values(NPC_QUESTS);

// Bounty System
export const BOUNTIES = {
  // Bronze Bounties
  raiderHunt: { id: 'raiderHunt', tier: 'bronze', name: 'Raider Hunt', target: 'raider', count: 5, reward: { caps: 75, xp: 100 } },
  scorpionExtermination: { id: 'scorpionExtermination', tier: 'bronze', name: 'Scorpion Problem', target: 'radScorpion', count: 3, reward: { caps: 60, xp: 80 } },
  dogCatcher: { id: 'dogCatcher', tier: 'bronze', name: 'Wild Dogs', target: 'wastelandDog', count: 5, reward: { caps: 50, xp: 70 } },
  // Silver Bounties  
  captainBounty: { id: 'captainBounty', tier: 'silver', name: 'Captain Wanted', target: 'raiderCaptain', count: 1, reward: { caps: 200, xp: 300 } },
  bearHunter: { id: 'bearHunter', tier: 'silver', name: 'Bear Hunter', target: 'mutatedBear', count: 1, reward: { caps: 250, xp: 350 } },
  eliteKiller: { id: 'eliteKiller', tier: 'silver', name: 'Elite Slayer', target: 'elite', count: 3, reward: { caps: 300, xp: 400, item: 'rare' } },
  // Gold Bounties
  kingSlayer: { id: 'kingSlayer', tier: 'gold', name: 'Regicide', target: 'raiderKing', count: 1, reward: { caps: 500, xp: 800, item: 'epic' } },
  bossHunter: { id: 'bossHunter', tier: 'gold', name: 'Boss Hunter', target: 'boss', count: 2, reward: { caps: 800, xp: 1200, item: 'legendary' } },
  voidBounty: { id: 'voidBounty', tier: 'gold', name: 'Void Cleansing', target: 'voidSpawn', count: 20, reward: { caps: 1000, xp: 1500, item: 'exotic' } }
};

export const BOUNTY_LIST = Object.values(BOUNTIES);

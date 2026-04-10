// 7 Loot Tiers and Item Definitions
export const LOOT_TIERS = {
  common: { id: 'common', name: 'Common', color: 'text-gray-400', borderColor: 'border-gray-400', order: 0 },
  uncommon: { id: 'uncommon', name: 'Uncommon', color: 'text-lime-500', borderColor: 'border-lime-500', order: 1 },
  rare: { id: 'rare', name: 'Rare', color: 'text-blue-500', borderColor: 'border-blue-500', order: 2 },
  epic: { id: 'epic', name: 'Epic', color: 'text-purple-500', borderColor: 'border-purple-500', order: 3 },
  legendary: { id: 'legendary', name: 'Legendary', color: 'text-amber-500', borderColor: 'border-amber-500', order: 4 },
  exotic: { id: 'exotic', name: 'Exotic', color: 'text-red-500', borderColor: 'border-red-500', order: 5 },
  celestial: { id: 'celestial', name: 'Celestial', color: 'celestial-rainbow', borderColor: 'border-pink-500', order: 6 }
};

export const CELESTIAL_PERKS = [
  { id: 'godslayer', name: 'Godslayer', effect: 'Deals double damage to bosses' },
  { id: 'infiniteEdge', name: 'Infinite Edge', effect: 'Crits deal triple damage' },
  { id: 'soulDrinker', name: 'Soul Drinker', effect: 'Heal 25% of all damage dealt' },
  { id: 'timeBender', name: 'Time Bender', effect: '+2 AP per turn' },
  { id: 'voidTouch', name: 'Void Touch', effect: '20% chance to instantly kill non-boss enemies' },
  { id: 'immortalFlame', name: 'Immortal Flame', effect: 'Revive at full HP once per combat' },
  { id: 'cosmicShield', name: 'Cosmic Shield', effect: 'Take 40% less damage' },
  { id: 'realityAnchor', name: 'Reality Anchor', effect: 'Immune to all status effects' }
];

export const WEAPONS = {
  // Common Weapons
  rustyPipe: { id: 'rustyPipe', name: 'Rusty Pipe', type: 'weapon', weaponType: 'melee', tier: 'common', damage: [4, 8], element: null, value: 25 },
  brokenPistol: { id: 'brokenPistol', name: 'Broken Pistol', type: 'weapon', weaponType: 'ranged', tier: 'common', damage: [5, 10], element: null, value: 35 },
  sharpStick: { id: 'sharpStick', name: 'Sharp Stick', type: 'weapon', weaponType: 'melee', tier: 'common', damage: [3, 7], element: null, value: 15 },
  // Uncommon Weapons
  machete: { id: 'machete', name: 'Machete', type: 'weapon', weaponType: 'melee', tier: 'uncommon', damage: [8, 14], element: null, value: 80 },
  huntingRifle: { id: 'huntingRifle', name: 'Hunting Rifle', type: 'weapon', weaponType: 'ranged', tier: 'uncommon', damage: [10, 18], element: null, critBonus: 0.1, value: 120 },
  spikedBat: { id: 'spikedBat', name: 'Spiked Bat', type: 'weapon', weaponType: 'melee', tier: 'uncommon', damage: [9, 15], element: 'bleed', bleedChance: 0.2, value: 95 },
  // Rare Weapons
  combatShotgun: { id: 'combatShotgun', name: 'Combat Shotgun', type: 'weapon', weaponType: 'ranged', tier: 'rare', damage: [14, 24], element: null, value: 250 },
  plasmaPistol: { id: 'plasmaPistol', name: 'Plasma Pistol', type: 'weapon', weaponType: 'ranged', tier: 'rare', damage: [12, 20], element: 'energy', value: 280 },
  superSledge: { id: 'superSledge', name: 'Super Sledge', type: 'weapon', weaponType: 'melee', tier: 'rare', damage: [18, 30], element: null, value: 300 },
  toxicBlade: { id: 'toxicBlade', name: 'Toxic Blade', type: 'weapon', weaponType: 'melee', tier: 'rare', damage: [12, 20], element: 'poison', poisonChance: 0.35, value: 270 },
  // Epic Weapons
  gaussRifle: { id: 'gaussRifle', name: 'Gauss Rifle', type: 'weapon', weaponType: 'ranged', tier: 'epic', damage: [22, 38], element: 'energy', critBonus: 0.15, value: 600 },
  powerFist: { id: 'powerFist', name: 'Power Fist', type: 'weapon', weaponType: 'melee', tier: 'epic', damage: [25, 40], element: null, value: 550 },
  cryolator: { id: 'cryolator', name: 'Cryolator', type: 'weapon', weaponType: 'ranged', tier: 'epic', damage: [18, 32], element: 'ice', freezeChance: 0.25, value: 620 },
  // Legendary Weapons
  fatMan: { id: 'fatMan', name: 'Fat Man', type: 'weapon', weaponType: 'ranged', tier: 'legendary', damage: [40, 70], element: 'radiation', value: 1500 },
  shishkebab: { id: 'shishkebab', name: 'Shishkebab', type: 'weapon', weaponType: 'melee', tier: 'legendary', damage: [28, 45], element: 'fire', burnChance: 0.45, value: 1200 },
  alienBlaster: { id: 'alienBlaster', name: 'Alien Blaster', type: 'weapon', weaponType: 'ranged', tier: 'legendary', damage: [35, 55], element: 'energy', critBonus: 0.25, value: 1800 },
  // Exotic Weapons
  voidReaper: { id: 'voidReaper', name: 'Void Reaper', type: 'weapon', weaponType: 'melee', tier: 'exotic', damage: [45, 70], element: 'void', value: 3500 },
  cosmicCannon: { id: 'cosmicCannon', name: 'Cosmic Cannon', type: 'weapon', weaponType: 'ranged', tier: 'exotic', damage: [50, 80], element: 'void', critBonus: 0.2, value: 4000 }
};

export const ARMOR = {
  // Common
  raggedCloth: { id: 'raggedCloth', name: 'Ragged Cloth', type: 'armor', slot: 'chest', tier: 'common', defense: 2, value: 20 },
  leatherCap: { id: 'leatherCap', name: 'Leather Cap', type: 'armor', slot: 'head', tier: 'common', defense: 1, value: 15 },
  // Uncommon
  leatherArmor: { id: 'leatherArmor', name: 'Leather Armor', type: 'armor', slot: 'chest', tier: 'uncommon', defense: 5, value: 80 },
  combatHelmet: { id: 'combatHelmet', name: 'Combat Helmet', type: 'armor', slot: 'head', tier: 'uncommon', defense: 4, value: 70 },
  reinforcedGloves: { id: 'reinforcedGloves', name: 'Reinforced Gloves', type: 'armor', slot: 'arms', tier: 'uncommon', defense: 3, value: 55 },
  // Rare
  metalArmor: { id: 'metalArmor', name: 'Metal Armor', type: 'armor', slot: 'chest', tier: 'rare', defense: 10, value: 250 },
  combatArmor: { id: 'combatArmor', name: 'Combat Armor', type: 'armor', slot: 'chest', tier: 'rare', defense: 12, value: 300 },
  assaultHelmet: { id: 'assaultHelmet', name: 'Assault Helmet', type: 'armor', slot: 'head', tier: 'rare', defense: 8, value: 220 },
  // Epic
  powerArmorChest: { id: 'powerArmorChest', name: 'Power Armor Chest', type: 'armor', slot: 'chest', tier: 'epic', defense: 20, bonusHP: 30, value: 800 },
  powerArmorHelmet: { id: 'powerArmorHelmet', name: 'Power Armor Helmet', type: 'armor', slot: 'head', tier: 'epic', defense: 15, value: 650 },
  // Legendary
  t60PowerArmor: { id: 't60PowerArmor', name: 'T-60 Power Armor', type: 'armor', slot: 'chest', tier: 'legendary', defense: 30, bonusHP: 50, value: 2000 },
  x01Helmet: { id: 'x01Helmet', name: 'X-01 Helmet', type: 'armor', slot: 'head', tier: 'legendary', defense: 22, bonusSTR: 2, value: 1500 }
};

export const CONSUMABLES = {
  stimpack: { id: 'stimpack', name: 'Stimpack', type: 'consumable', effect: 'heal', value: 50, price: 40, description: 'Restore 50 HP' },
  superStimpack: { id: 'superStimpack', name: 'Super Stimpack', type: 'consumable', effect: 'heal', value: 120, price: 120, description: 'Restore 120 HP' },
  radAway: { id: 'radAway', name: 'Rad-Away', type: 'consumable', effect: 'radCure', value: 50, price: 35, description: 'Remove 50 RAD' },
  radX: { id: 'radX', name: 'Rad-X', type: 'consumable', effect: 'radResist', value: 0.5, duration: 3, price: 50, description: '+50% rad resist for 3 turns' },
  med_X: { id: 'med_X', name: 'Med-X', type: 'consumable', effect: 'damageResist', value: 0.25, duration: 3, price: 65, description: '-25% damage taken for 3 turns' },
  psycho: { id: 'psycho', name: 'Psycho', type: 'consumable', effect: 'damageBoost', value: 0.25, duration: 3, price: 75, description: '+25% damage for 3 turns' },
  buffout: { id: 'buffout', name: 'Buffout', type: 'consumable', effect: 'statBoost', stats: { STR: 3, END: 3 }, duration: 3, price: 60, description: '+3 STR/END for 3 turns' },
  mentats: { id: 'mentats', name: 'Mentats', type: 'consumable', effect: 'statBoost', stats: { INT: 3, LCK: 2 }, duration: 3, price: 55, description: '+3 INT/+2 LCK for 3 turns' },
  jet: { id: 'jet', name: 'Jet', type: 'consumable', effect: 'apBoost', value: 2, duration: 2, price: 80, description: '+2 AP for 2 turns' },
  nukaCola: { id: 'nukaCola', name: 'Nuka-Cola', type: 'consumable', effect: 'heal', value: 25, price: 15, description: 'Restore 25 HP' },
  nukaQuantum: { id: 'nukaQuantum', name: 'Nuka Quantum', type: 'consumable', effect: 'apHeal', healValue: 35, apValue: 1, price: 100, description: 'Restore 35 HP and +1 AP' },
  fragGrenade: { id: 'fragGrenade', name: 'Frag Grenade', type: 'consumable', effect: 'aoeDamage', damage: [25, 40], price: 150, description: 'Deal 25-40 damage to all enemies' },
  pulseGrenade: { id: 'pulseGrenade', name: 'Pulse Grenade', type: 'consumable', effect: 'aoeDamage', damage: [35, 55], bonusVsRobot: 2, price: 200, description: 'Deal 35-55 damage, x2 vs robots' },
  antidote: { id: 'antidote', name: 'Antidote', type: 'consumable', effect: 'cureStatus', cures: ['poison', 'toxin'], price: 30, description: 'Cure poison and toxin' }
};

export const ACCESSORIES = {
  luckyRing: { id: 'luckyRing', name: 'Lucky Ring', type: 'accessory', slot: 'ring', tier: 'uncommon', bonusLCK: 2, value: 100 },
  powerAmulet: { id: 'powerAmulet', name: 'Power Amulet', type: 'accessory', slot: 'amulet', tier: 'uncommon', bonusSTR: 2, value: 100 },
  vitalityBelt: { id: 'vitalityBelt', name: 'Vitality Belt', type: 'accessory', slot: 'belt', tier: 'rare', bonusHP: 25, value: 250 },
  critRing: { id: 'critRing', name: 'Critical Ring', type: 'accessory', slot: 'ring', tier: 'rare', critBonus: 0.1, value: 300 },
  championAmulet: { id: 'championAmulet', name: 'Champion Amulet', type: 'accessory', slot: 'amulet', tier: 'epic', bonusSTR: 3, bonusEND: 3, value: 700 },
  voidstoneRing: { id: 'voidstoneRing', name: 'Voidstone Ring', type: 'accessory', slot: 'ring', tier: 'legendary', bonusINT: 5, bonusLCK: 5, value: 1500 }
};

export const ITEM_LIST = [
  ...Object.values(WEAPONS),
  ...Object.values(ARMOR),
  ...Object.values(CONSUMABLES),
  ...Object.values(ACCESSORIES)
];

// Loot generation system
import { WEAPONS, ARMOR, CONSUMABLES, ACCESSORIES, LOOT_TIERS, CELESTIAL_PERKS } from '../data/items';
import { weightedRandom, shuffleArray } from './combat';

// Get tier based on territory loot table and luck
export const rollLootTier = (lootTable, luckBonus = 0) => {
  // Adjust weights based on luck
  const adjustedWeights = lootTable.map((weight, index) => {
    // Higher tiers get boosted by luck
    const luckMultiplier = 1 + (index * luckBonus * 0.1);
    return weight * luckMultiplier;
  });
  
  const tierIndex = weightedRandom(adjustedWeights);
  const tiers = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'exotic', 'celestial'];
  return tiers[tierIndex];
};

// Get all items of a specific tier
export const getItemsByTier = (tier) => {
  const allItems = [
    ...Object.values(WEAPONS),
    ...Object.values(ARMOR),
    ...Object.values(ACCESSORIES)
  ];
  return allItems.filter(item => item.tier === tier);
};

// Generate a random item drop
export const generateLoot = (lootTable, luckBonus = 0, guaranteedTier = null) => {
  const tier = guaranteedTier || rollLootTier(lootTable, luckBonus);
  const items = getItemsByTier(tier);
  
  if (items.length === 0) {
    // Fallback to common if no items of that tier
    return generateLoot(lootTable, luckBonus, 'common');
  }
  
  const item = { ...items[Math.floor(Math.random() * items.length)] };
  
  // Add unique ID
  item.uid = `${item.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Celestial items get a unique perk
  if (tier === 'celestial') {
    item.celestialPerk = CELESTIAL_PERKS[Math.floor(Math.random() * CELESTIAL_PERKS.length)];
  }
  
  return item;
};

// Generate multiple loot drops
export const generateLootDrops = (count, lootTable, luckBonus = 0) => {
  const drops = [];
  for (let i = 0; i < count; i++) {
    drops.push(generateLoot(lootTable, luckBonus));
  }
  return drops;
};

// Generate caps drop
export const generateCapsDrop = (minCaps, maxCaps, capsMultiplier = 1, bonuses = {}) => {
  const base = Math.floor(Math.random() * (maxCaps - minCaps + 1)) + minCaps;
  const multiplier = capsMultiplier * (1 + (bonuses.capsMultiplier || 0) + (bonuses.caps || 0));
  return Math.round(base * multiplier);
};

// Generate shop inventory
export const generateShopInventory = (territory, hasBlackMarket = false) => {
  const inventory = [];
  
  // Always stock consumables
  const consumables = Object.values(CONSUMABLES);
  const shuffledConsumables = shuffleArray(consumables);
  inventory.push(...shuffledConsumables.slice(0, 6).map(item => ({
    ...item,
    uid: `shop_${item.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    quantity: Math.floor(Math.random() * 3) + 1
  })));
  
  // Stock weapons based on territory
  const weapons = Object.values(WEAPONS).filter(w => {
    const tierOrder = LOOT_TIERS[w.tier]?.order || 0;
    const maxTier = hasBlackMarket ? 5 : Math.min(territory.order + 1, 4);
    return tierOrder <= maxTier;
  });
  const shuffledWeapons = shuffleArray(weapons);
  inventory.push(...shuffledWeapons.slice(0, 3).map(item => ({
    ...item,
    uid: `shop_${item.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  })));
  
  // Stock armor
  const armor = Object.values(ARMOR).filter(a => {
    const tierOrder = LOOT_TIERS[a.tier]?.order || 0;
    const maxTier = hasBlackMarket ? 5 : Math.min(territory.order + 1, 4);
    return tierOrder <= maxTier;
  });
  const shuffledArmor = shuffleArray(armor);
  inventory.push(...shuffledArmor.slice(0, 3).map(item => ({
    ...item,
    uid: `shop_${item.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  })));
  
  return inventory;
};

// Get item sell price
export const getItemSellPrice = (item) => {
  const basePrice = item.value || item.price || 10;
  return Math.floor(basePrice * 0.4); // 40% of value
};

// Get item buy price with discounts
export const getItemBuyPrice = (item, discount = 0) => {
  const basePrice = item.value || item.price || 10;
  return Math.floor(basePrice * (1 - discount));
};

// Salvage item for materials
export const salvageItem = (item) => {
  const tierMultiplier = {
    common: 1,
    uncommon: 2,
    rare: 4,
    epic: 8,
    legendary: 16,
    exotic: 32,
    celestial: 64
  };
  
  const mult = tierMultiplier[item.tier] || 1;
  return {
    caps: Math.floor((item.value || 10) * 0.25),
    scrap: mult,
    techParts: item.type === 'weapon' ? Math.floor(mult / 2) : 0
  };
};

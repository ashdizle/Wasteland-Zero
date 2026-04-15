/**
 * Prestige & Cosmetics Integration Guide for main.js
 * 
 * Add these hooks to your existing main.js file at the appropriate locations
 */

// ═══════════════════════════════════════════════════════════════
// 1. ADD AT TOP OF FILE (after const G = {)
// ═══════════════════════════════════════════════════════════════

// Meta-progression systems
let prestigeReady = false;
let cosmeticsReady = false;
let prestigeBonuses = {};
let cosmeticBonuses = {};

// Initialize meta systems
(async function initMetaSystems() {
  try {
    console.log('Loading meta-progression systems...');
    
    // Wait for systems to be available
    const waitForSystems = setInterval(async () => {
      if (window.Prestige && window.Cosmetics) {
        clearInterval(waitForSystems);
        
        await Prestige.init();
        await Cosmetics.init();
        
        // Load bonuses
        const prestigeData = await fetch(`${window.BACKEND_URL}/api/prestige/bonuses?player_id=default`);
        prestigeBonuses = await prestigeData.json();
        
        const cosmeticData = await Cosmetics.getActiveBonuses();
        cosmeticBonuses = cosmeticData.bonuses || {};
        
        prestigeReady = true;
        cosmeticsReady = true;
        
        console.log('✓ Meta-progression systems loaded');
        console.log('Prestige bonuses:', prestigeBonuses);
        console.log('Cosmetic bonuses:', cosmeticBonuses);
        
        // Update gem display
        Cosmetics.updateGemDisplay();
      }
    }, 100);
  } catch (error) {
    console.error('Failed to load meta systems:', error);
  }
})();

// ═══════════════════════════════════════════════════════════════
// 2. MODIFY CHARACTER CREATION (find where base stats are set)
// ═══════════════════════════════════════════════════════════════

// FIND THIS: (around line 800-900, where character is created)
// s = {
//   hp: ...,
//   maxHP: ...,
//   ...
// }

// REPLACE WITH:
function applyMetaBonuses(baseStats) {
  let stats = { ...baseStats };
  
  // Apply prestige bonuses
  if (prestigeReady && prestigeBonuses && prestigeBonuses.bonuses) {
    const pb = prestigeBonuses.bonuses;
    
    if (pb.max_hp) stats.maxHP = (stats.maxHP || 100) + pb.max_hp;
    if (pb.armor) stats.armor = (stats.armor || 0) + pb.armor;
    if (pb.crit_chance) stats.critChance = (stats.critChance || 0) + pb.crit_chance;
    if (pb.starting_caps) stats.caps = (stats.caps || 0) + pb.starting_caps;
    if (pb.vendor_discount) stats.vendorDiscount = pb.vendor_discount;
    if (pb.rift_preview) stats.riftPreview = pb.rift_preview;
    
    // Class-specific
    if (pb.melee_damage) stats.meleeDamageBonus = (stats.meleeDamageBonus || 1) * pb.melee_damage;
    if (pb.ranged_accuracy) stats.rangedAccuracy = (stats.rangedAccuracy || 0) + pb.ranged_accuracy;
    if (pb.max_energy) stats.maxEnergy = (stats.maxEnergy || 0) + pb.max_energy;
    
    console.log('Applied prestige bonuses:', pb);
  }
  
  // Apply cosmetic bonuses
  if (cosmeticsReady && cosmeticBonuses) {
    if (cosmeticBonuses.max_hp) stats.maxHP = (stats.maxHP || 100) + cosmeticBonuses.max_hp;
    if (cosmeticBonuses.revival_chance) stats.revivalChance = cosmeticBonuses.revival_chance;
    if (cosmeticBonuses.rift_luck) stats.riftLuck = cosmeticBonuses.rift_luck;
    
    console.log('Applied cosmetic bonuses:', cosmeticBonuses);
  }
  
  return stats;
}

// THEN CALL IT:
// s = applyMetaBonuses(baseStats);

// ═══════════════════════════════════════════════════════════════
// 3. ADD MULTIPLIERS FOR XP/CAPS EARNING
// ═══════════════════════════════════════════════════════════════

// FIND WHERE XP IS AWARDED (search for "xp += " or similar)
// ADD THIS WRAPPER:
function applyXPMultiplier(baseXP) {
  let xp = baseXP;
  
  if (prestigeBonuses?.bonuses?.xp_multiplier) {
    xp *= prestigeBonuses.bonuses.xp_multiplier;
  }
  
  if (cosmeticBonuses?.xp_multiplier) {
    xp *= cosmeticBonuses.xp_multiplier;
  }
  
  return Math.floor(xp);
}

// FIND WHERE CAPS ARE AWARDED
function applyGoldMultiplier(baseCaps) {
  let caps = baseCaps;
  
  if (prestigeBonuses?.bonuses?.caps_multiplier) {
    caps *= prestigeBonuses.bonuses.caps_multiplier;
  }
  
  if (cosmeticBonuses?.caps_multiplier) {
    caps *= cosmeticBonuses.caps_multiplier;
  }
  
  return Math.floor(caps);
}

// ═══════════════════════════════════════════════════════════════
// 4. BOSS DEFEAT - EARN GEMS
// ═══════════════════════════════════════════════════════════════

// FIND WHERE BOSS IS DEFEATED (search for "boss" and "killed" or "defeated")
// ADD AFTER VICTORY:
async function onBossDefeated(bossName) {
  console.log(`Boss defeated: ${bossName}`);
  
  // Award gems
  if (cosmeticsReady && Cosmetics) {
    const gems = await Cosmetics.earnGems('boss_kill');
    if (gems > 0) {
      Cosmetics.showNotification(`+${gems} 💎 for defeating ${bossName}!`);
    }
  }
  
  // Check if it's the final boss (Void Lord)
  if (bossName === 'Void Lord' && prestigeReady && Prestige) {
    // Offer rebirth
    setTimeout(() => {
      const maxLevel = G.state?.level || 1;
      const bossesKilled = G.state?.bossesKilled || 1;
      const xpEarned = G.state?.xp || 0;
      
      Prestige.offerRebirth(maxLevel, bossesKilled, xpEarned);
    }, 2000); // Wait 2 seconds after victory
  }
}

// CALL IT: onBossDefeated(bossName);

// ═══════════════════════════════════════════════════════════════
// 5. REALITY RIFT COMPLETE - EARN GEMS
// ═══════════════════════════════════════════════════════════════

// FIND WHERE RIFT IS COMPLETED (search for "rift" and "outcome" or "resolved")
// ADD AFTER RIFT:
async function onRiftCompleted() {
  if (cosmeticsReady && Cosmetics) {
    const gems = await Cosmetics.earnGems('rift_complete');
    if (gems > 0) {
      Cosmetics.showNotification(`+${gems} 💎 for completing Reality Rift!`);
    }
  }
}

// CALL IT: onRiftCompleted();

// ═══════════════════════════════════════════════════════════════
// 6. VENDOR DISCOUNT (if applicable)
// ═══════════════════════════════════════════════════════════════

// FIND WHERE SHOP PRICES ARE CALCULATED
function applyVendorDiscount(basePrice) {
  let price = basePrice;
  
  if (prestigeBonuses?.bonuses?.vendor_discount) {
    price *= (1 - prestigeBonuses.bonuses.vendor_discount);
  }
  
  return Math.floor(price);
}

// ═══════════════════════════════════════════════════════════════
// 7. UPDATE GEM DISPLAY ON STATE CHANGES
// ═══════════════════════════════════════════════════════════════

// ADD TO ANY save() FUNCTION OR STATE UPDATE:
function updateMetaUI() {
  if (cosmeticsReady && Cosmetics) {
    Cosmetics.updateGemDisplay();
  }
}

// ═══════════════════════════════════════════════════════════════
// MANUAL TESTING (Console Commands)
// ═══════════════════════════════════════════════════════════════

// Test in browser console:
// Prestige.openPrestigeScreen()  - Open prestige UI
// Cosmetics.openShop()           - Open shop
// Cosmetics.earnGems('prestige') - Award 10 gems
// Prestige.offerRebirth(30, 4, 10000) - Trigger rebirth offer

// ═══════════════════════════════════════════════════════════════
// EXAMPLE: Simplified Integration Points
// ═══════════════════════════════════════════════════════════════

/*
// 1. Character Creation (line ~800)
createNewGame(archetype) {
  const baseStats = {
    hp: 100,
    maxHP: 100,
    level: 1,
    xp: 0,
    caps: 50,
    // ... other stats
  };
  
  // Apply meta bonuses
  const finalStats = applyMetaBonuses(baseStats);
  
  this.state = finalStats;
  this.save();
}

// 2. XP Gain (line ~1500-2000)
gainXP(amount) {
  const finalXP = applyXPMultiplier(amount);
  this.state.xp += finalXP;
  this.checkLevelUp();
}

// 3. Gold/Caps Gain
gainCaps(amount) {
  const finalCaps = applyGoldMultiplier(amount);
  this.state.caps += finalCaps;
}

// 4. Boss Defeated (line ~3000-4000)
combatWin() {
  if (this.combat.enemy.isBoss) {
    onBossDefeated(this.combat.enemy.name);
  }
  // ... rest of victory logic
}

// 5. Rift Completed (line ~2000-3000)
resolveRift(choice) {
  // ... apply rift effects
  onRiftCompleted();
}
*/

console.log('Prestige & Cosmetics integration template loaded');
console.log('See comments above for integration instructions');

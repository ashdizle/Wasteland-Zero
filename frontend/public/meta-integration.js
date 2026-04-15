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

// ═══════════════════════════════════════════════════════════════
// BATTLE ANIMATION HELPERS
// ═══════════════════════════════════════════════════════════════

const BattleAnimations = {
  // Show floating damage number
  showDamage(amount, isCrit = false, isHeal = false, targetElement = null) {
    const damageNum = document.createElement('div');
    damageNum.className = 'damage-number';
    if (isCrit) damageNum.classList.add('crit');
    if (isHeal) damageNum.classList.add('heal');
    
    damageNum.textContent = (isHeal ? '+' : '-') + amount;
    
    // Position near target or center
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      damageNum.style.left = rect.left + (rect.width / 2) + 'px';
      damageNum.style.top = rect.top + 'px';
    } else {
      damageNum.style.left = '50%';
      damageNum.style.top = '40%';
    }
    
    document.body.appendChild(damageNum);
    
    setTimeout(() => damageNum.remove(), 1000);
  },
  
  // Screen shake effect
  screenShake() {
    const gameScreen = document.querySelector('.screen.active') || document.body;
    gameScreen.classList.add('screen-shake');
    setTimeout(() => gameScreen.classList.remove('screen-shake'), 500);
  },
  
  // Hit flash effect
  hitFlash(element) {
    if (!element) element = document.querySelector('.screen.active');
    element.classList.add('hit-flash');
    setTimeout(() => element.classList.remove('hit-flash'), 300);
  },
  
  // Slash effect
  slashEffect(targetElement) {
    const slash = document.createElement('div');
    slash.className = 'slash-effect';
    
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      slash.style.left = rect.left + 'px';
      slash.style.top = rect.top + (rect.height / 2) + 'px';
    } else {
      slash.style.left = '50%';
      slash.style.top = '50%';
    }
    
    document.body.appendChild(slash);
    setTimeout(() => slash.remove(), 400);
  },
  
  // Impact effect
  impactEffect(targetElement) {
    const impact = document.createElement('div');
    impact.className = 'impact-effect';
    
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      impact.style.left = rect.left + (rect.width / 2) - 50 + 'px';
      impact.style.top = rect.top + (rect.height / 2) - 50 + 'px';
    } else {
      impact.style.left = 'calc(50% - 50px)';
      impact.style.top = 'calc(50% - 50px)';
    }
    
    document.body.appendChild(impact);
    setTimeout(() => impact.remove(), 500);
  },
  
  // Blood splatter
  bloodEffect(targetElement, count = 3) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const blood = document.createElement('div');
        blood.className = 'blood-effect';
        
        if (targetElement) {
          const rect = targetElement.getBoundingClientRect();
          const randomX = rect.left + Math.random() * rect.width;
          const randomY = rect.top + Math.random() * rect.height;
          blood.style.left = randomX + 'px';
          blood.style.top = randomY + 'px';
        }
        
        document.body.appendChild(blood);
        setTimeout(() => blood.remove(), 800);
      }, i * 100);
    }
  },
  
  // Miss/Dodge text
  showMiss(targetElement) {
    const miss = document.createElement('div');
    miss.className = 'miss-text';
    miss.textContent = 'MISS!';
    
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      miss.style.left = rect.left + (rect.width / 2) + 'px';
      miss.style.top = rect.top + 'px';
    } else {
      miss.style.left = '50%';
      miss.style.top = '40%';
    }
    
    document.body.appendChild(miss);
    setTimeout(() => miss.remove(), 1000);
  },
  
  // Level up effect
  levelUp() {
    const burst = document.createElement('div');
    burst.className = 'level-up-effect';
    document.body.appendChild(burst);
    setTimeout(() => burst.remove(), 1000);
  },
  
  // Combo: Full attack animation
  attackCombo(damage, isCrit, targetElement) {
    this.slashEffect(targetElement);
    setTimeout(() => {
      this.impactEffect(targetElement);
      this.hitFlash(targetElement);
      this.screenShake();
      this.showDamage(damage, isCrit, false, targetElement);
      if (damage > 10) this.bloodEffect(targetElement, 3);
    }, 200);
  }
};

// Make globally available
window.BattleAnimations = BattleAnimations;

// ═══════════════════════════════════════════════════════════════
// EXAMPLE USAGE IN COMBAT
// ═══════════════════════════════════════════════════════════════

/*
// When player attacks enemy:
BattleAnimations.attackCombo(15, false, enemyElement);

// When enemy takes critical hit:
BattleAnimations.attackCombo(30, true, enemyElement);

// When attack misses:
BattleAnimations.showMiss(enemyElement);

// When player heals:
BattleAnimations.showDamage(20, false, true, playerElement);

// When player levels up:
BattleAnimations.levelUp();

// Simple damage without full combo:
BattleAnimations.showDamage(12, false, false, enemyElement);
BattleAnimations.screenShake();
*/

console.log('Battle Animations system loaded');
console.log('Use window.BattleAnimations to trigger effects');

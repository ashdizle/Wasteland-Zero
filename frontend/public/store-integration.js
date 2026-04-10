/**
 * Store Integration for Wasteland Zero
 * Add this code to main.js to integrate the premium store
 */

// Add to G object initialization
G.showStore = function() {
  const storeHTML = `
    <div id="store-screen" class="screen" style="display:block">
      <button id="store-back-btn" onclick="G.closeStore()">← BACK</button>
      <h2>🏪 PREMIUM STORE</h2>
      ${Store.renderStore()}
      
      <div style="margin-top:24px; padding:16px; background:rgba(61,41,20,0.3); border-radius:8px; border:1px solid #5d4428;">
        <p style="font-family:'Share Tech Mono',monospace; font-size:0.75rem; color:#a8c4d4; text-align:center; line-height:1.5; margin:0;">
          All purchases are secure via Stripe.<br>
          Support development & unlock exclusive content!
        </p>
      </div>
    </div>
  `;
  
  document.getElementById('app').insertAdjacentHTML('beforeend', storeHTML);
  this.hideAllScreens();
  document.getElementById('store-screen').style.display = 'block';
  AudioEngine.sfx.click();
};

G.closeStore = function() {
  const storeScreen = document.getElementById('store-screen');
  if (storeScreen) storeScreen.remove();
  this.show('title'); // Or whatever screen user came from
  AudioEngine.sfx.click();
};

// Add store button to title screen
// Find the title screen buttons section and add this:
/*
<button class="btn gold" onclick="G.showStore()">🏪 STORE</button>
*/

// XP Boost modifier (add to gainXP function)
G._originalGainXP = G.gainXP;
G.gainXP = function(amount, reason = '') {
  let finalAmount = amount;
  
  if (Store.hasActiveBenefit('xp_boost_24h')) {
    finalAmount = Math.floor(amount * 1.5);
    if (reason) reason += ' (+50% BOOST)';
  }
  
  return this._originalGainXP.call(this, finalAmount, reason);
};

// Caps Boost modifier (add to addCaps/loot functions)
G._originalAddCaps = G.addCaps || function(amount) {
  this.state.caps += amount;
};

G.addCaps = function(amount) {
  let finalAmount = amount;
  
  if (Store.hasActiveBenefit('caps_boost_24h')) {
    finalAmount = Math.floor(amount * 1.5);
  }
  
  return this._originalAddCaps.call(this, finalAmount);
};

// Loot Boost modifier (add to loot generation)
G._originalGenerateLoot = G.generateLoot;
G.generateLoot = function(...args) {
  const item = this._originalGenerateLoot.apply(this, args);
  
  if (Store.hasActiveBenefit('loot_boost_24h') && item) {
    // 25% chance to upgrade rarity
    if (Math.random() < 0.25) {
      const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
      const currentIndex = rarities.indexOf(item.rarity || 'common');
      if (currentIndex < rarities.length - 1) {
        item.rarity = rarities[currentIndex + 1];
      }
    }
  }
  
  return item;
};

// Show active boosts indicator
G.updateBoostIndicator = function() {
  let boostHTML = '';
  const boosts = [];
  
  if (Store.hasActiveBenefit('xp_boost_24h')) boosts.push('⚡ XP +50%');
  if (Store.hasActiveBenefit('loot_boost_24h')) boosts.push('💎 LOOT +25%');
  if (Store.hasActiveBenefit('caps_boost_24h')) boosts.push('💰 CAPS +50%');
  
  if (boosts.length > 0) {
    boostHTML = `<div class="boost-active-indicator">${boosts.join(' · ')}</div>`;
  }
  
  const existing = document.querySelector('.boost-active-indicator');
  if (existing) existing.remove();
  
  if (boostHTML) {
    document.getElementById('app').insertAdjacentHTML('beforeend', boostHTML);
  }
};

// Call updateBoostIndicator when showing map/combat screens
setInterval(() => {
  if (typeof Store !== 'undefined') {
    G.updateBoostIndicator();
  }
}, 5000);

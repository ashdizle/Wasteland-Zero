/* Prestige/Rebirth System UI */

const Prestige = {
  data: null,
  masteries: null,
  bonuses: null,

  async init() {
    await this.loadData();
    this.setupEventListeners();
  },

  async loadData() {
    try {
      // Load prestige data
      const prestigeRes = await fetch(`${window.BACKEND_URL}/api/prestige/data?player_id=default`);
      this.data = await prestigeRes.json();

      // Load bonuses
      const bonusRes = await fetch(`${window.BACKEND_URL}/api/prestige/bonuses?player_id=default`);
      this.bonuses = await bonusRes.json();

      console.log('Prestige data loaded:', this.data);
    } catch (error) {
      console.error('Failed to load prestige data:', error);
    }
  },

  async loadMasteries(playerClass) {
    try {
      const res = await fetch(`${window.BACKEND_URL}/api/prestige/masteries?player_class=${playerClass}`);
      this.masteries = await res.json();
      console.log('Masteries loaded for', playerClass);
    } catch (error) {
      console.error('Failed to load masteries:', error);
    }
  },

  setupEventListeners() {
    // Prestige button in main menu
    const prestigeBtn = document.getElementById('prestige-btn');
    if (prestigeBtn) {
      prestigeBtn.addEventListener('click', () => this.openPrestigeScreen());
    }
  },

  openPrestigeScreen() {
    const modal = document.getElementById('prestige-modal');
    if (modal) {
      modal.style.display = 'flex';
      this.renderPrestigeScreen();
    }
  },

  closePrestigeScreen() {
    const modal = document.getElementById('prestige-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  },

  async renderPrestigeScreen() {
    const content = document.getElementById('prestige-content');
    if (!content) return;

    const availablePoints = this.data.total_mastery_points - this.data.spent_mastery_points;

    content.innerHTML = `
      <div class="prestige-header">
        <h2>🏆 PRESTIGE SYSTEM</h2>
        <div class="prestige-level">Prestige Level: <span class="highlight">P${this.data.prestige_level}</span></div>
        <div class="mastery-points">
          <span class="points-available">${availablePoints}</span> Mastery Points Available
        </div>
      </div>

      <div class="prestige-tabs">
        <button class="tab-btn active" data-tab="universal">Universal Masteries</button>
        <button class="tab-btn" data-tab="class">Class Masteries</button>
        <button class="tab-btn" data-tab="legendaries">Legendary Weapons</button>
        <button class="tab-btn" data-tab="stats">Current Bonuses</button>
      </div>

      <div class="prestige-tab-content">
        <div class="tab-pane active" id="universal-tab">
          <h3>Universal Masteries (All Classes)</h3>
          <div class="mastery-grid" id="universal-masteries"></div>
        </div>

        <div class="tab-pane" id="class-tab">
          <h3>Class-Specific Masteries</h3>
          <p class="info-text">Select your class to view masteries:</p>
          <div class="class-selector">
            <button class="class-btn" data-class="warrior">Warrior</button>
            <button class="class-btn" data-class="ranger">Ranger</button>
            <button class="class-btn" data-class="scavenger">Scavenger</button>
            <button class="class-btn" data-class="psyker">Psyker</button>
          </div>
          <div class="mastery-grid" id="class-masteries"></div>
        </div>

        <div class="tab-pane" id="legendaries-tab">
          <h3>Legendary Weapons Unlocked</h3>
          <div class="legendary-list" id="legendary-weapons"></div>
        </div>

        <div class="tab-pane" id="stats-tab">
          <h3>Active Bonuses</h3>
          <div class="bonus-list" id="active-bonuses"></div>
        </div>
      </div>
    `;

    // Setup tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        e.target.classList.add('active');
        document.getElementById(`${e.target.dataset.tab}-tab`).classList.add('active');
      });
    });

    // Setup class selector
    document.querySelectorAll('.class-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const className = e.target.dataset.class;
        await this.loadMasteries(className);
        this.renderClassMasteries(className);
      });
    });

    // Render initial content
    await this.loadMasteries('warrior');
    this.renderUniversalMasteries();
    this.renderLegendaryWeapons();
    this.renderActiveBonuses();
  },

  renderUniversalMasteries() {
    const container = document.getElementById('universal-masteries');
    if (!container || !this.masteries) return;

    const universal = this.masteries.universal;
    container.innerHTML = '';

    for (const [id, mastery] of Object.entries(universal)) {
      const isUnlocked = this.data.unlocked_masteries.includes(id);
      const canAfford = (this.data.total_mastery_points - this.data.spent_mastery_points) >= mastery.cost;
      const requirementMet = !mastery.requires || this.data.unlocked_masteries.includes(mastery.requires);

      const card = document.createElement('div');
      card.className = `mastery-card ${isUnlocked ? 'unlocked' : ''} ${!canAfford || !requirementMet ? 'locked' : ''}`;
      card.innerHTML = `
        <div class="mastery-name">${mastery.name}</div>
        <div class="mastery-desc">${mastery.description}</div>
        <div class="mastery-cost">Cost: ${mastery.cost} MP</div>
        ${mastery.requires ? `<div class="mastery-req">Requires: ${universal[mastery.requires]?.name || mastery.requires}</div>` : ''}
        ${isUnlocked ? '<div class="unlocked-badge">✓ UNLOCKED</div>' : 
          `<button class="purchase-btn" ${!canAfford || !requirementMet ? 'disabled' : ''} 
            data-id="${id}" data-type="universal">Purchase</button>`}
      `;

      if (!isUnlocked) {
        card.querySelector('.purchase-btn')?.addEventListener('click', () => {
          this.purchaseMastery(id, 'universal');
        });
      }

      container.appendChild(card);
    }
  },

  renderClassMasteries(className) {
    const container = document.getElementById('class-masteries');
    if (!container || !this.masteries) return;

    const classMasteries = this.masteries.class_specific;
    container.innerHTML = '';

    for (const [id, mastery] of Object.entries(classMasteries)) {
      const isUnlocked = this.data.unlocked_masteries.includes(id);
      const canAfford = (this.data.total_mastery_points - this.data.spent_mastery_points) >= mastery.cost;

      const card = document.createElement('div');
      card.className = `mastery-card ${isUnlocked ? 'unlocked' : ''} ${!canAfford ? 'locked' : ''}`;
      card.innerHTML = `
        <div class="mastery-name">${mastery.name}</div>
        <div class="mastery-desc">${mastery.description}</div>
        <div class="mastery-cost">Cost: ${mastery.cost} MP</div>
        ${isUnlocked ? '<div class="unlocked-badge">✓ UNLOCKED</div>' : 
          `<button class="purchase-btn" ${!canAfford ? 'disabled' : ''} 
            data-id="${id}" data-type="${className}">Purchase</button>`}
      `;

      if (!isUnlocked) {
        card.querySelector('.purchase-btn')?.addEventListener('click', () => {
          this.purchaseMastery(id, className);
        });
      }

      container.appendChild(card);
    }
  },

  renderLegendaryWeapons() {
    const container = document.getElementById('legendary-weapons');
    if (!container) return;

    if (!this.data.unlocked_legendaries || this.data.unlocked_legendaries.length === 0) {
      container.innerHTML = '<p class="info-text">No legendary weapons unlocked yet. Prestige to unlock!</p>';
      return;
    }

    container.innerHTML = this.data.unlocked_legendaries.map(weapon => `
      <div class="legendary-card">
        <div class="legendary-name">⚔️ ${weapon}</div>
        <p class="legendary-desc">Unlocked at Prestige ${this.data.unlocked_legendaries.indexOf(weapon) + 1}</p>
      </div>
    `).join('');
  },

  renderActiveBonuses() {
    const container = document.getElementById('active-bonuses');
    if (!container || !this.bonuses) return;

    const bonuses = this.bonuses.bonuses;
    
    if (Object.keys(bonuses).length === 0) {
      container.innerHTML = '<p class="info-text">No bonuses active yet. Purchase masteries to gain bonuses!</p>';
      return;
    }

    container.innerHTML = '<div class="bonus-grid">' + Object.entries(bonuses).map(([key, value]) => {
      let displayValue = value;
      let label = key.replace(/_/g, ' ').toUpperCase();

      // Format multipliers as percentages
      if (key.includes('multiplier') && typeof value === 'number') {
        displayValue = `+${Math.round((value - 1) * 100)}%`;
      } else if (typeof value === 'number') {
        displayValue = `+${value}`;
      }

      return `
        <div class="bonus-item">
          <span class="bonus-label">${label}</span>
          <span class="bonus-value">${displayValue}</span>
        </div>
      `;
    }).join('') + '</div>';
  },

  async purchaseMastery(masteryId, masteryType) {
    try {
      const res = await fetch(`${window.BACKEND_URL}/api/prestige/purchase-mastery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: 'default',
          mastery_id: masteryId,
          mastery_type: masteryType
        })
      });

      const result = await res.json();

      if (result.success) {
        alert(`✓ Mastery Unlocked: ${masteryId}\nRemaining Points: ${result.remaining_points}`);
        await this.loadData();
        this.renderPrestigeScreen();
      } else {
        alert('Purchase failed: ' + result.detail);
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Failed to purchase mastery');
    }
  },

  // Called when player defeats Void Lord
  async offerRebirth(maxLevel, bossesKilled, xpEarned) {
    const confirm = window.confirm(
      `🏆 VICTORY! You defeated the Void Lord!\n\n` +
      `Would you like to REBIRTH and become stronger?\n\n` +
      `You will:\n` +
      `• Reset your character (level, items, progress)\n` +
      `• Gain Mastery Points for permanent upgrades\n` +
      `• Increase Prestige Level\n` +
      `• Unlock a Legendary Weapon\n` +
      `• Keep all cosmetics and unlocks\n\n` +
      `Rebirth now?`
    );

    if (confirm) {
      await this.performRebirth(maxLevel, bossesKilled, xpEarned);
    }
  },

  async performRebirth(maxLevel, bossesKilled, xpEarned) {
    try {
      const res = await fetch(`${window.BACKEND_URL}/api/prestige/rebirth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: 'default',
          max_level_reached: maxLevel,
          bosses_killed: bossesKilled,
          xp_earned: xpEarned
        })
      });

      const result = await res.json();

      if (result.success) {
        // Show rebirth summary
        alert(
          `🎉 ${result.message}\n\n` +
          `Mastery Points Earned: ${result.mastery_points_earned}\n` +
          `Total Mastery Points: ${result.total_mastery_points}\n` +
          `Available to Spend: ${result.available_points}\n` +
          (result.legendary_unlocked ? `\n⚔️ Legendary Weapon Unlocked: ${result.legendary_unlocked.name}` : '')
        );

        // Reset game state
        this.resetGameState();

        // Award gems for prestige
        await Cosmetics.earnGems('prestige');

        // Reload data
        await this.loadData();

        // Show prestige screen
        this.openPrestigeScreen();
      }
    } catch (error) {
      console.error('Rebirth failed:', error);
      alert('Rebirth failed. Please try again.');
    }
  },

  resetGameState() {
    // This should be called by main game logic
    // Reset character, clear save, return to menu
    if (window.Game && window.Game.resetForRebirth) {
      window.Game.resetForRebirth();
    }
  },

  // Apply prestige bonuses to gameplay
  applyBonuses(baseStats) {
    if (!this.bonuses || !this.bonuses.bonuses) return baseStats;

    const bonuses = this.bonuses.bonuses;
    const modified = { ...baseStats };

    // Apply bonuses
    if (bonuses.max_hp) modified.maxHP += bonuses.max_hp;
    if (bonuses.armor) modified.armor += bonuses.armor;
    if (bonuses.crit_chance) modified.critChance += bonuses.crit_chance;
    if (bonuses.xp_multiplier) modified.xpGain *= bonuses.xp_multiplier;
    if (bonuses.caps_multiplier) modified.capsGain *= bonuses.caps_multiplier;
    if (bonuses.starting_caps) modified.startingCaps = bonuses.starting_caps;
    if (bonuses.vendor_discount) modified.vendorDiscount = bonuses.vendor_discount;

    // Class-specific bonuses
    if (bonuses.melee_damage) modified.meleeDamage *= bonuses.melee_damage;
    if (bonuses.ranged_accuracy) modified.rangedAccuracy += bonuses.ranged_accuracy;
    if (bonuses.psionic_damage) modified.psionicDamage *= bonuses.psionic_damage;

    return modified;
  }
};

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Prestige.init());
} else {
  Prestige.init();
}

console.log('Prestige system initialized');

/* Cosmetic Shop & Gem System UI */

const Cosmetics = {
  data: null,
  catalog: null,
  currentFilter: 'all',

  async init() {
    await this.loadData();
    await this.loadCatalog();
    this.setupEventListeners();
    this.checkDailyLogin();
  },

  async loadData() {
    try {
      const res = await fetch(`${window.BACKEND_URL}/api/cosmetics/player-data?player_id=default`);
      this.data = await res.json();
      console.log('Cosmetics data loaded:', this.data);
    } catch (error) {
      console.error('Failed to load cosmetics data:', error);
    }
  },

  async loadCatalog() {
    try {
      const res = await fetch(`${window.BACKEND_URL}/api/cosmetics/catalog`);
      this.catalog = await res.json();
      console.log('Cosmetics catalog loaded:', this.catalog);
    } catch (error) {
      console.error('Failed to load catalog:', error);
    }
  },

  setupEventListeners() {
    // Shop button
    const shopBtn = document.getElementById('cosmetics-btn');
    if (shopBtn) {
      shopBtn.addEventListener('click', () => this.openShop());
    }

    // Update gem display in header if exists
    this.updateGemDisplay();
  },

  async checkDailyLogin() {
    try {
      const today = new Date().toISOString().split('T')[0];
      if (this.data?.last_daily_login !== today) {
        const res = await fetch(`${window.BACKEND_URL}/api/cosmetics/earn-gems`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            player_id: 'default',
            source: 'daily_login'
          })
        });

        const result = await res.json();
        if (result.success) {
          console.log(`Daily login: +${result.gems_earned} gems!`);
          await this.loadData();
          this.showNotification(`Daily Login Bonus: +${result.gems_earned} 💎`);
        }
      }
    } catch (error) {
      console.error('Daily login check failed:', error);
    }
  },

  updateGemDisplay() {
    // Update in main menu
    const gemDisplay = document.getElementById('gem-count');
    if (gemDisplay && this.data) {
      const gemAmount = document.getElementById('gem-amount');
      if (gemAmount) {
        gemAmount.textContent = this.data.total_gems;
      }
    }
    
    // Update floating in-game button
    const floatingGemCount = document.getElementById('floating-gem-count');
    if (floatingGemCount && this.data) {
      floatingGemCount.textContent = this.data.total_gems;
    }
    
    // Update in shop modal if open
    const shopGemAmount = document.querySelector('.gem-balance .gem-amount');
    if (shopGemAmount && this.data) {
      shopGemAmount.textContent = this.data.total_gems;
    }
  },

  openShop() {
    const modal = document.getElementById('cosmetics-modal');
    if (modal) {
      modal.style.display = 'flex';
      this.renderShop();
    }
  },

  closeShop() {
    const modal = document.getElementById('cosmetics-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  },

  renderShop() {
    const content = document.getElementById('cosmetics-content');
    if (!content) return;

    content.innerHTML = `
      <div class="shop-header">
        <h2>💎 COSMETIC SHOP</h2>
        <div class="gem-balance">
          <span class="gem-icon">💎</span>
          <span class="gem-amount">${this.data.total_gems}</span> Gems
        </div>
      </div>

      <div class="shop-tabs">
        <button class="shop-tab active" data-filter="all">All Items</button>
        <button class="shop-tab" data-filter="character_skin">Character Skins</button>
        <button class="shop-tab" data-filter="dice_skin">Dice Skins</button>
        <button class="shop-tab" data-filter="ui_theme">UI Themes</button>
        <button class="shop-tab" data-filter="legendary">Legendary</button>
        <button class="shop-tab" data-filter="gems">Buy Gems</button>
      </div>

      <div class="shop-content">
        <div id="items-grid" class="items-grid"></div>
        <div id="gems-packages" class="gems-packages" style="display: none;"></div>
      </div>

      <div class="shop-footer">
        <button class="ad-btn" id="watch-ad-btn">
          📺 Watch Ad for 5 Gems
          <span class="ad-count">(${this.data.ads_watched_today || 0}/10 today)</span>
        </button>
      </div>
    `;

    // Setup tab switching
    document.querySelectorAll('.shop-tab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.shop-tab').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.currentFilter = e.target.dataset.filter;
        this.renderItems();
      });
    });

    // Setup ad button
    document.getElementById('watch-ad-btn')?.addEventListener('click', () => {
      this.watchAdForGems();
    });

    this.renderItems();
  },

  renderItems() {
    const filter = this.currentFilter;
    const itemsGrid = document.getElementById('items-grid');
    const gemsPackages = document.getElementById('gems-packages');

    if (filter === 'gems') {
      itemsGrid.style.display = 'none';
      gemsPackages.style.display = 'grid';
      this.renderGemPackages();
      return;
    }

    itemsGrid.style.display = 'grid';
    gemsPackages.style.display = 'none';

    if (!this.catalog?.items) return;

    const items = Object.entries(this.catalog.items)
      .filter(([id, item]) => filter === 'all' || item.type === filter);

    itemsGrid.innerHTML = items.map(([id, item]) => {
      const isOwned = this.data.owned_cosmetics?.includes(id);
      const isEquipped = Object.values(this.data.equipped_cosmetics || {}).includes(id);
      
      let rarityClass = item.rarity || 'common';
      let rarityEmoji = {
        common: '⚪',
        uncommon: '🟢',
        rare: '🔵',
        legendary: '🟡'
      }[item.rarity] || '⚪';

      return `
        <div class="cosmetic-card ${rarityClass} ${isOwned ? 'owned' : ''} ${isEquipped ? 'equipped' : ''}">
          <div class="rarity-badge">${rarityEmoji} ${item.rarity?.toUpperCase()}</div>
          ${isEquipped ? '<div class="equipped-badge">✓ EQUIPPED</div>' : ''}
          
          <div class="item-icon">${this.getItemIcon(item.type)}</div>
          <div class="item-name">${item.name}</div>
          <div class="item-desc">${item.description}</div>
          
          ${item.bonus ? `
            <div class="item-bonus">
              <span class="bonus-label">Bonus:</span>
              ${this.formatBonus(item.bonus)}
            </div>
          ` : ''}
          
          <div class="item-price">
            <span class="gem-icon">💎</span> ${item.price_gems}
          </div>
          
          ${isOwned ? 
            (isEquipped ? 
              '<button class="unequip-btn" data-id="' + id + '">Unequip</button>' :
              '<button class="equip-btn" data-id="' + id + '">Equip</button>'
            ) :
            '<button class="buy-btn" data-id="' + id + '" data-price="' + item.price_gems + '">Purchase</button>'
          }
        </div>
      `;
    }).join('');

    // Setup buttons
    itemsGrid.querySelectorAll('.buy-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        const price = parseInt(e.target.dataset.price);
        this.purchaseCosmetic(id, price);
      });
    });

    itemsGrid.querySelectorAll('.equip-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.equipCosmetic(e.target.dataset.id);
      });
    });

    itemsGrid.querySelectorAll('.unequip-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.unequipCosmetic(e.target.dataset.id);
      });
    });
  },

  renderGemPackages() {
    const container = document.getElementById('gems-packages');
    if (!container || !this.catalog?.gem_packages) return;

    const packages = Object.entries(this.catalog.gem_packages);

    container.innerHTML = packages.map(([id, pkg]) => {
      const isFirstPurchase = id === 'starter_deal' && !this.data.first_purchase_claimed;
      
      return `
        <div class="gem-package ${isFirstPurchase ? 'special-deal' : ''}">
          ${isFirstPurchase ? '<div class="special-badge">⭐ FIRST PURCHASE BONUS</div>' : ''}
          
          <div class="package-name">${pkg.name}</div>
          <div class="gem-amount">💎 ${pkg.gems}${pkg.bonus_gems ? ` +${pkg.bonus_gems}` : ''}</div>
          ${isFirstPurchase ? '<div class="bonus-text">+20 bonus gems!</div>' : ''}
          
          <div class="package-price">$${pkg.price_usd}</div>
          <button class="purchase-package-btn" data-id="${id}" data-price="${pkg.price_usd}">
            Purchase
          </button>
        </div>
      `;
    }).join('');

    // Setup purchase buttons
    container.querySelectorAll('.purchase-package-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        const price = e.target.dataset.price;
        this.purchaseGemPackage(id, price);
      });
    });
  },

  getItemIcon(type) {
    const icons = {
      character_skin: '👤',
      dice_skin: '🎲',
      ui_theme: '🎨',
      death_animation: '💀',
      victory_pose: '🏆',
      accessory: '✨'
    };
    return icons[type] || '📦';
  },

  formatBonus(bonus) {
    return Object.entries(bonus).map(([key, value]) => {
      let display = key.replace(/_/g, ' ');
      if (key.includes('multiplier')) {
        return `+${Math.round((value - 1) * 100)}% ${display}`;
      }
      return `+${value} ${display}`;
    }).join(', ');
  },

  async purchaseCosmetic(itemId, price) {
    if (this.data.total_gems < price) {
      alert('Not enough gems! Watch ads or purchase gem packages.');
      return;
    }

    if (!confirm(`Purchase this item for ${price} gems?`)) return;

    try {
      const res = await fetch(`${window.BACKEND_URL}/api/cosmetics/purchase-cosmetic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: 'default',
          item_id: itemId
        })
      });

      const result = await res.json();

      if (result.success) {
        this.showNotification(`✓ Item purchased! Remaining: ${result.remaining_gems} 💎`);
        await this.loadData();
        this.renderShop();
        this.updateGemDisplay();
      } else {
        alert('Purchase failed: ' + (result.detail || 'Unknown error'));
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Failed to purchase item');
    }
  },

  async equipCosmetic(itemId) {
    try {
      const res = await fetch(`${window.BACKEND_URL}/api/cosmetics/equip?player_id=default&item_id=${itemId}`, {
        method: 'POST'
      });

      const result = await res.json();

      if (result.success) {
        this.showNotification('✓ Item equipped!');
        await this.loadData();
        this.renderItems();
        
        // Apply visual changes
        this.applyVisualCosmetics();
      }
    } catch (error) {
      console.error('Equip failed:', error);
    }
  },

  async unequipCosmetic(itemId) {
    // Implementation would remove from equipped_cosmetics
    this.showNotification('Unequip feature coming soon!');
  },

  async purchaseGemPackage(packageId, price) {
    alert(
      `💎 Purchase ${this.catalog.gem_packages[packageId].name}\n\n` +
      `Price: $${price}\n\n` +
      `This will redirect to payment provider.\n` +
      `(IAP integration required for actual purchase)`
    );

    // For iOS: Use Apple IAP
    // For web: Use Stripe
    // Mock purchase for demo:
    if (confirm('Mock purchase for demo?')) {
      await this.mockGemPurchase(packageId);
    }
  },

  async mockGemPurchase(packageId) {
    try {
      const res = await fetch(`${window.BACKEND_URL}/api/cosmetics/purchase-gems`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: 'default',
          package_id: packageId,
          transaction_id: 'mock_' + Date.now()
        })
      });

      const result = await res.json();

      if (result.success) {
        this.showNotification(`✓ Received ${result.gems_awarded} gems!`);
        await this.loadData();
        this.renderShop();
        this.updateGemDisplay();
      }
    } catch (error) {
      console.error('Mock purchase failed:', error);
    }
  },

  async watchAdForGems() {
    if ((this.data.ads_watched_today || 0) >= 10) {
      alert('Daily ad limit reached (10/day). Come back tomorrow!');
      return;
    }

    // Mock ad watching (in production, integrate AdMob)
    alert('📺 Ad would play here\n\n(AdMob integration required)\n\nFor demo, awarding 5 gems...');

    try {
      const res = await fetch(`${window.BACKEND_URL}/api/cosmetics/earn-gems`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: 'default',
          source: 'watch_ad'
        })
      });

      const result = await res.json();

      if (result.success) {
        this.showNotification(`✓ Ad watched! +${result.gems_earned} 💎`);
        await this.loadData();
        this.renderShop();
        this.updateGemDisplay();
      } else {
        alert(result.message || 'Failed to earn gems');
      }
    } catch (error) {
      console.error('Ad reward failed:', error);
    }
  },

  async earnGems(source) {
    try {
      const res = await fetch(`${window.BACKEND_URL}/api/cosmetics/earn-gems`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: 'default',
          source: source
        })
      });

      const result = await res.json();

      if (result.success) {
        console.log(`Earned ${result.gems_earned} gems from ${source}`);
        await this.loadData();
        this.updateGemDisplay();
        return result.gems_earned;
      }
    } catch (error) {
      console.error('Earn gems failed:', error);
    }
    return 0;
  },

  applyVisualCosmetics() {
    // Apply visual changes based on equipped cosmetics
    const equipped = this.data.equipped_cosmetics || {};

    // Apply character skin
    if (equipped.character_skin) {
      console.log('Applying character skin:', equipped.character_skin);
      // Change character sprite/appearance
    }

    // Apply dice skin
    if (equipped.dice_skin) {
      console.log('Applying dice skin:', equipped.dice_skin);
      // Change dice appearance
    }

    // Apply UI theme
    if (equipped.ui_theme) {
      console.log('Applying UI theme:', equipped.ui_theme);
      // Change UI colors/theme
    }
  },

  async getActiveBonuses() {
    try {
      const res = await fetch(`${window.BACKEND_URL}/api/cosmetics/active-bonuses?player_id=default`);
      return await res.json();
    } catch (error) {
      console.error('Failed to get bonuses:', error);
      return { bonuses: {} };
    }
  },

  applyBonuses(stats, cosmeticBonuses) {
    if (!cosmeticBonuses || !cosmeticBonuses.bonuses) return stats;

    const bonuses = cosmeticBonuses.bonuses;
    const modified = { ...stats };

    // Apply cosmetic bonuses
    if (bonuses.xp_multiplier) modified.xpGain = (modified.xpGain || 1) * bonuses.xp_multiplier;
    if (bonuses.caps_multiplier) modified.capsGain = (modified.capsGain || 1) * bonuses.caps_multiplier;
    if (bonuses.max_hp) modified.maxHP = (modified.maxHP || 100) + bonuses.max_hp;
    if (bonuses.revival_chance) modified.revivalChance = bonuses.revival_chance;
    if (bonuses.rift_preview) modified.riftPreview = bonuses.rift_preview;
    if (bonuses.rift_luck) modified.riftLuck = bonuses.rift_luck;

    return modified;
  },

  showNotification(message) {
    // Simple notification (could be improved with toast library)
    const notification = document.createElement('div');
    notification.className = 'gem-notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
};

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Cosmetics.init());
} else {
  Cosmetics.init();
}

console.log('Cosmetics system initialized');

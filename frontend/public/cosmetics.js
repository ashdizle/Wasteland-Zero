/* Cosmetic Shop & Gem System UI */

const Cosmetics = {
  data: null,
  catalog: null,
  currentFilter: 'all',
  currentMainTab: 'cosmetics', // 'cosmetics' or 'store'

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
    
    // Update nav tab gem counter
    const navGemCount = document.getElementById('nav-gem-count');
    if (navGemCount && this.data) {
      navGemCount.textContent = this.data.total_gems;
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
      
      // Setup scroll detection for back-to-top button
      const container = document.getElementById('cosmetics-container');
      const backToTopBtn = document.getElementById('back-to-top');
      
      if (container && backToTopBtn) {
        container.addEventListener('scroll', () => {
          if (container.scrollTop > 300) {
            backToTopBtn.classList.add('show');
          } else {
            backToTopBtn.classList.remove('show');
          }
        });
      }
    }
    
    // Initialize Stripe if needed
    this.initializeStripe();
  },
  
  initializeStripe() {
    if (!window.Stripe) {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.onload = () => {
        window.stripe = Stripe('pk_live_51TKimHGz3LGNY9vIPyp45wik3GQSBGYHZvr2MtHuRK6n5yfnIoR0FDchARA1yoigv4fWOXITQUASyMWww7M7fCdw00UzT6EWXf');
      };
      document.head.appendChild(script);
    } else if (!window.stripe) {
      window.stripe = Stripe('pk_live_51TKimHGz3LGNY9vIPyp45wik3GQSBGYHZvr2MtHuRK6n5yfnIoR0FDchARA1yoigv4fWOXITQUASyMWww7M7fCdw00UzT6EWXf');
    }
  },
  
  switchMainTab(tab) {
    this.currentMainTab = tab;
    this.renderShop();
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

    const mainTabsHTML = `
      <div class="main-shop-tabs" style="display:flex;gap:8px;margin-bottom:20px;border-bottom:3px solid rgba(212,164,74,0.3);padding-bottom:10px;align-items:center">
        <button class="main-shop-tab ${this.currentMainTab === 'cosmetics' ? 'active' : ''}" onclick="Cosmetics.switchMainTab('cosmetics')" style="flex:1;font-family:var(--font-title);font-size:1.1rem;padding:12px;background:${this.currentMainTab === 'cosmetics' ? 'rgba(74,222,128,0.2)' : 'rgba(212,164,74,0.1)'};border:2px solid ${this.currentMainTab === 'cosmetics' ? '#4ade80' : '#d4a44a'};color:${this.currentMainTab === 'cosmetics' ? '#4ade80' : '#d4a44a'};border-radius:8px;cursor:pointer;text-transform:uppercase;letter-spacing:0.05em;transition:all 0.2s">
          💎 COSMETICS
        </button>
        <button class="main-shop-tab ${this.currentMainTab === 'store' ? 'active' : ''}" onclick="Cosmetics.switchMainTab('store')" style="flex:1;font-family:var(--font-title);font-size:1.1rem;padding:12px;background:${this.currentMainTab === 'store' ? 'rgba(245,164,66,0.2)' : 'rgba(212,164,74,0.1)'};border:2px solid ${this.currentMainTab === 'store' ? '#f5a442' : '#d4a44a'};color:${this.currentMainTab === 'store' ? '#f5a442' : '#d4a44a'};border-radius:8px;cursor:pointer;text-transform:uppercase;letter-spacing:0.05em;transition:all 0.2s">
          🏪 STORE
        </button>
        <button onclick="Cosmetics.closeShop()" style="font-family:var(--font-title);font-size:1.8rem;padding:8px 16px;background:rgba(255,59,48,1);border:3px solid #ff3b30;color:white;border-radius:8px;cursor:pointer;font-weight:900;line-height:1;box-shadow:0 4px 12px rgba(255,59,48,0.6);transition:all 0.2s;min-width:60px" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">×</button>
      </div>
    `;

    if (this.currentMainTab === 'cosmetics') {
      content.innerHTML = mainTabsHTML + `
        <div class="shop-header">
          <h2>💎 COSMETIC SHOP</h2>
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
      
    } else if (this.currentMainTab === 'store') {
      content.innerHTML = mainTabsHTML + this.renderStripeStore();
    }
  },

  renderStripeStore() {
    return `
      <div class="stripe-store-content">
        <h2 style="font-family:var(--font-title);font-size:2rem;color:#f5a442;text-align:center;margin:0 0 24px;letter-spacing:.08em;text-shadow:2px 2px 0 #000,0 0 10px rgba(245,164,66,0.5)">🏪 PREMIUM STORE</h2>
        
        <div style="display:flex;flex-direction:column;gap:24px">
          <!-- Premium Category -->
          <div>
            <h3 style="font-family:var(--font-title);font-size:1.3rem;color:#f5a442;margin-bottom:12px;padding-bottom:6px;border-bottom:2px solid rgba(245,164,66,0.3);letter-spacing:.05em">💎 Premium</h3>
            <div style="background:linear-gradient(145deg,rgba(76,29,149,0.2) 0%,rgba(30,27,75,0.3) 100%);border:2px solid #d4a44a;border-radius:8px;padding:16px">
              <h4 style="font-family:var(--font-mono);font-size:1rem;color:#f5d742;margin:0 0 8px">Wasteland Zero Premium</h4>
              <p style="font-family:var(--font-mono);font-size:.8rem;color:#a8c4d4;line-height:1.4;margin:0 0 12px">Remove branding, exclusive title screen, priority support</p>
              <button onclick="Cosmetics.purchaseProduct('premium_unlock', 499)" style="font-family:var(--font-title);font-size:1.1rem;width:100%;padding:10px;background:linear-gradient(180deg,#d4a44a 0%,#b38838 100%);border:2px solid #f5d742;border-radius:6px;color:#1a1410;text-shadow:1px 1px 0 rgba(255,255,255,0.3);box-shadow:0 3px 0 #8b6b2c;cursor:pointer;letter-spacing:.05em">$4.99</button>
            </div>
          </div>
          
          <!-- Boosts Category -->
          <div>
            <h3 style="font-family:var(--font-title);font-size:1.3rem;color:#f5a442;margin-bottom:12px;padding-bottom:6px;border-bottom:2px solid rgba(245,164,66,0.3);letter-spacing:.05em">⚡ Boosts</h3>
            
            <div style="display:flex;flex-direction:column;gap:12px">
              <div style="background:linear-gradient(145deg,rgba(76,29,149,0.2) 0%,rgba(30,27,75,0.3) 100%);border:2px solid rgba(167,139,250,0.4);border-radius:8px;padding:14px">
                <h4 style="font-family:var(--font-mono);font-size:1rem;color:#f5d742;margin:0 0 6px">⭐ 24h XP Boost</h4>
                <p style="font-family:var(--font-mono);font-size:.8rem;color:#a8c4d4;line-height:1.4;margin:0 0 10px">+50% XP gain for 24 hours</p>
                <button onclick="Cosmetics.purchaseProduct('xp_boost_24h', 99)" style="font-family:var(--font-title);font-size:1.1rem;width:100%;padding:10px;background:linear-gradient(180deg,#d4a44a 0%,#b38838 100%);border:2px solid #f5d742;border-radius:6px;color:#1a1410;cursor:pointer">$0.99</button>
              </div>
              
              <div style="background:linear-gradient(145deg,rgba(76,29,149,0.2) 0%,rgba(30,27,75,0.3) 100%);border:2px solid rgba(167,139,250,0.4);border-radius:8px;padding:14px">
                <h4 style="font-family:var(--font-mono);font-size:1rem;color:#f5d742;margin:0 0 6px">💰 24h Caps Boost</h4>
                <p style="font-family:var(--font-mono);font-size:.8rem;color:#a8c4d4;line-height:1.4;margin:0 0 10px">+50% currency drops for 24 hours</p>
                <button onclick="Cosmetics.purchaseProduct('caps_boost_24h', 99)" style="font-family:var(--font-title);font-size:1.1rem;width:100%;padding:10px;background:linear-gradient(180deg,#d4a44a 0%,#b38838 100%);border:2px solid #f5d742;border-radius:6px;color:#1a1410;cursor:pointer">$0.99</button>
              </div>
              
              <div style="background:linear-gradient(145deg,rgba(76,29,149,0.2) 0%,rgba(30,27,75,0.3) 100%);border:2px solid rgba(167,139,250,0.4);border-radius:8px;padding:14px">
                <h4 style="font-family:var(--font-mono);font-size:1rem;color:#f5d742;margin:0 0 6px">✨ 24h Loot Boost</h4>
                <p style="font-family:var(--font-mono);font-size:.8rem;color:#a8c4d4;line-height:1.4;margin:0 0 10px">+25% loot quality for 24 hours</p>
                <button onclick="Cosmetics.purchaseProduct('loot_boost_24h', 99)" style="font-family:var(--font-title);font-size:1.1rem;width:100%;padding:10px;background:linear-gradient(180deg,#d4a44a 0%,#b38838 100%);border:2px solid #f5d742;border-radius:6px;color:#1a1410;cursor:pointer">$0.99</button>
              </div>
              
              <div style="background:linear-gradient(145deg,rgba(139,92,246,0.3) 0%,rgba(59,130,246,0.2) 100%);border:3px solid #a78bfa;border-radius:8px;padding:14px;position:relative;overflow:hidden">
                <div style="position:absolute;top:-50%;right:-20%;width:100px;height:200px;background:linear-gradient(45deg,transparent,rgba(255,255,255,0.1),transparent);transform:rotate(45deg);animation:shine 3s infinite"></div>
                <div style="position:absolute;top:8px;right:8px;background:#ef4444;color:white;font-family:var(--font-title);font-size:.65rem;padding:3px 8px;border-radius:4px;letter-spacing:.05em">SAVE 33%</div>
                <h4 style="font-family:var(--font-mono);font-size:1.1rem;color:#fbbf24;margin:0 0 6px">🚀 Mega Boost Bundle</h4>
                <p style="font-family:var(--font-mono);font-size:.8rem;color:#e0e7ff;line-height:1.4;margin:0 0 10px">All 3 boosts (XP, Loot, Caps) for 24h - Best value!</p>
                <button onclick="Cosmetics.purchaseProduct('mega_boost_bundle', 199)" style="font-family:var(--font-title);font-size:1.1rem;width:100%;padding:10px;background:linear-gradient(180deg,#fbbf24 0%,#d97706 100%);border:2px solid #fcd34d;border-radius:6px;color:#1a1410;cursor:pointer;font-weight:900;box-shadow:0 4px 0 #92400e">$1.99</button>
              </div>
            </div>
          </div>
          
          <!-- Info -->
          <div style="margin-top:12px;padding:16px;background:rgba(61,41,20,0.3);border-radius:8px;border:1px solid #5d4428">
            <p style="font-family:var(--font-mono);font-size:.75rem;color:#a8c4d4;text-align:center;line-height:1.5;margin:0">
              💳 All purchases are secure via Stripe<br>
              💰 <strong style="color:#4ade80">LIVE MODE</strong> - Real payments enabled!<br>
              🚀 Support development & unlock exclusive content!
            </p>
          </div>
        </div>
      </div>
    `;
  },
  
  async purchaseProduct(productId, priceInCents) {
    const userId = `slot_${G.currentSlot || 1}`;
    const apiUrl = window.location.origin;
    
    if (!window.stripe) {
      G.toast('Loading payment system...', 2000);
      this.initializeStripe();
      setTimeout(() => this.purchaseProduct(productId, priceInCents), 1000);
      return;
    }
    
    G.toast('Opening checkout...', 2000);
    
    try {
      const response = await fetch(`${apiUrl}/api/payments/create-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          user_id: userId,
          success_url: `${window.location.origin}/game.html?purchase=success`,
          cancel_url: `${window.location.origin}/game.html?purchase=cancelled`
        })
      });
      
      const data = await response.json();
      
      if (data.session_id && window.stripe) {
        const result = await window.stripe.redirectToCheckout({
          sessionId: data.session_id
        });
        
        if (result.error) {
          G.toast(`Error: ${result.error.message}`, 3000);
        }
      } else {
        G.toast('Failed to create checkout session', 3000);
      }
    } catch (error) {
      console.error('Purchase error:', error);
      G.toast('Purchase failed - please try again', 3000);
    }
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
          
          <div class="item-icon">${item.image_url ? 
            `<img src="${item.image_url}" style="width:120px;height:120px;object-fit:cover;border-radius:12px" alt="${item.name}">` : 
            this.getItemIcon(item.type)
          }</div>
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

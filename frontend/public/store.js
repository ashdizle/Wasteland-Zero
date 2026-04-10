/**
 * Wasteland Zero - Premium Store
 * Stripe integration for in-game purchases
 */

const Store = {
  apiUrl: window.location.origin,
  stripeKey: 'pk_test_51QdVWAP3rrj0l7HBr3FgMLgvvyR8EcJBXoL4kI2lN8N6d5bU5wQwDaR9K0v3VxEqJpbVYHrKtPXJQJQfPGXAQhT500xYgxUYvF',
  
  products: null,
  userPurchases: [],
  
  async init() {
    // Load Stripe.js
    if (!window.Stripe) {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.onload = () => {
        this.stripe = Stripe(this.stripeKey);
      };
      document.head.appendChild(script);
    } else {
      this.stripe = Stripe(this.stripeKey);
    }
    
    // Load products
    await this.loadProducts();
    
    // Load user purchases from localStorage
    this.loadUserPurchases();
  },
  
  async loadProducts() {
    try {
      const response = await fetch(`${this.apiUrl}/api/payments/products`);
      this.products = await response.json();
    } catch (error) {
      console.error('Failed to load products:', error);
      this.products = {};
    }
  },
  
  loadUserPurchases() {
    const saved = localStorage.getItem('wasteland_purchases');
    this.userPurchases = saved ? JSON.parse(saved) : [];
  },
  
  saveUserPurchases() {
    localStorage.setItem('wasteland_purchases', JSON.stringify(this.userPurchases));
  },
  
  hasPurchased(productId) {
    return this.userPurchases.some(p => p.product_id === productId);
  },
  
  hasActiveBenefit(benefit) {
    // Check for one-time purchases
    if (this.userPurchases.some(p => p.benefits.includes(benefit) && p.type !== 'boost')) {
      return true;
    }
    
    // Check for active boosts (24h expiry)
    const activeBoostedPurchases = this.userPurchases.filter(p => {
      if (!p.benefits.includes(benefit)) return false;
      if (p.type !== 'boost' && p.type !== 'bundle') return false;
      
      const purchaseTime = new Date(p.purchase_time);
      const expiryTime = new Date(purchaseTime.getTime() + 24 * 60 * 60 * 1000);
      return new Date() < expiryTime;
    });
    
    return activeBoostedPurchases.length > 0;
  },
  
  async purchase(productId) {
    if (!this.products || !this.products[productId]) {
      G.toast('❌ Product not found', 2000);
      return;
    }
    
    const product = this.products[productId];
    const userId = `slot_${G.currentSlot || 1}`;
    
    // Check if already purchased (for one-time items)
    if (product.type === 'one_time' && this.hasPurchased(productId)) {
      G.toast('✅ You already own this!', 2000);
      return;
    }
    
    try {
      G.toast('🔄 Opening checkout...', 2000);
      
      const response = await fetch(`${this.apiUrl}/api/payments/create-checkout`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          product_id: productId,
          user_id: userId,
          success_url: `${window.location.origin}/game.html?purchase=success`,
          cancel_url: `${window.location.origin}/game.html?purchase=cancelled`
        })
      });
      
      const data = await response.json();
      
      if (data.session_id) {
        // Redirect to Stripe checkout
        const result = await this.stripe.redirectToCheckout({
          sessionId: data.session_id
        });
        
        if (result.error) {
          G.toast(`❌ ${result.error.message}`, 3000);
        }
      }
    } catch (error) {
      console.error('Purchase error:', error);
      G.toast('❌ Purchase failed - please try again', 3000);
    }
  },
  
  async verifyPurchase(sessionId) {
    const userId = `slot_${G.currentSlot || 1}`;
    
    try {
      const response = await fetch(`${this.apiUrl}/api/payments/verify-purchase`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          user_id: userId,
          session_id: sessionId
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Add to user purchases
        const purchase = {
          product_id: data.product_id,
          benefits: data.benefits,
          purchase_time: new Date().toISOString(),
          amount_paid: data.amount_paid,
          type: this.products[data.product_id].type
        };
        
        this.userPurchases.push(purchase);
        this.saveUserPurchases();
        
        // Apply benefits immediately
        this.applyBenefits(data.benefits);
        
        G.toast(`✅ Purchase complete! Thank you!`, 3000);
        AudioEngine.sfx.victory();
        
        return true;
      } else {
        G.toast('❌ Purchase verification failed', 3000);
        return false;
      }
    } catch (error) {
      console.error('Verification error:', error);
      return false;
    }
  },
  
  applyBenefits(benefits) {
    benefits.forEach(benefit => {
      switch(benefit) {
        case 'no_branding':
          // Hide "Made with Emergent" badge if present
          const badge = document.getElementById('emergent-badge');
          if (badge) badge.style.display = 'none';
          break;
          
        case 'cyber_portraits':
        case 'neon_portraits':
          // Portrait packs - mark as unlocked
          G.state.unlockedPortraits = G.state.unlockedPortraits || [];
          if (!G.state.unlockedPortraits.includes(benefit)) {
            G.state.unlockedPortraits.push(benefit);
          }
          break;
          
        case 'xp_boost_24h':
        case 'loot_boost_24h':
        case 'caps_boost_24h':
          // Boosts are checked via hasActiveBenefit()
          G.toast(`⚡ ${benefit.replace('_', ' ').toUpperCase()} ACTIVE!`, 2000);
          break;
          
        case 'extra_slots':
          G.maxSaveSlots = 6;
          break;
          
        case 'season_1_rewards':
          G.state.seasonPass = 1;
          break;
      }
    });
    
    G.save();
  },
  
  renderStore() {
    if (!this.products) {
      return '<div class="loading">Loading store...</div>';
    }
    
    const categories = {
      'Premium': ['premium_unlock'],
      'Cosmetics': ['cyber_portraits', 'neon_portraits'],
      'Boosts': ['xp_boost_24h', 'loot_boost_24h', 'caps_boost_24h', 'mega_boost_bundle'],
      'Extras': ['extra_save_slots', 'season_pass_1']
    };
    
    let html = '<div id="store-container">';
    
    for (const [categoryName, productIds] of Object.entries(categories)) {
      html += `<div class="store-category">
        <h3 class="store-category-title">${categoryName}</h3>
        <div class="store-items">`;
      
      productIds.forEach(productId => {
        const product = this.products[productId];
        if (!product) return;
        
        const owned = this.hasPurchased(productId);
        const price = (product.price / 100).toFixed(2);
        
        html += `
          <div class="store-item ${owned ? 'owned' : ''}">
            <div class="store-item-header">
              <h4>${product.name}</h4>
              ${owned ? '<span class="owned-badge">✓ OWNED</span>' : ''}
            </div>
            <p class="store-item-desc">${product.description}</p>
            <button 
              class="store-buy-btn ${owned && product.type === 'one_time' ? 'disabled' : ''}"
              onclick="Store.purchase('${productId}')"
              ${owned && product.type === 'one_time' ? 'disabled' : ''}
            >
              ${owned && product.type === 'one_time' ? 'OWNED' : `$${price}`}
            </button>
          </div>
        `;
      });
      
      html += '</div></div>';
    }
    
    html += '</div>';
    return html;
  }
};

// Initialize store on page load
document.addEventListener('DOMContentLoaded', () => {
  Store.init();
  
  // Check for purchase completion
  const urlParams = new URLSearchParams(window.location.search);
  const purchaseStatus = urlParams.get('purchase');
  const sessionId = urlParams.get('session_id');
  
  if (purchaseStatus === 'success' && sessionId) {
    setTimeout(() => {
      Store.verifyPurchase(sessionId);
      // Clean URL
      window.history.replaceState({}, document.title, '/game.html');
    }, 1000);
  } else if (purchaseStatus === 'cancelled') {
    setTimeout(() => {
      G.toast('❌ Purchase cancelled', 2000);
      window.history.replaceState({}, document.title, '/game.html');
    }, 500);
  }
});

// Export for global access
window.Store = Store;

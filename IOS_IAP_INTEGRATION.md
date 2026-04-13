# 🍎 Apple In-App Purchase Integration Guide

## Overview

This guide shows how to integrate Apple IAP into your iOS version of Wasteland Zero, replacing Stripe payments.

---

## 📦 Backend Setup (Already Done ✅)

The following endpoints are already created:

1. **`GET /api/iap/products`** - Get product list
2. **`POST /api/iap/verify`** - Verify Apple receipt
3. **`POST /api/iap/consume`** - Grant items to player

---

## 📱 iOS Frontend Integration

### Step 1: Install Capacitor IAP Plugin

```bash
cd /app/frontend
npm install @capacitor-community/in-app-purchases
npx cap sync ios
```

### Step 2: Update store.js for iOS

Add this at the top of `/app/frontend/public/store.js`:

```javascript
// Detect if running on iOS via Capacitor
const isIOS = () => {
  return window.Capacitor && Capacitor.getPlatform() === 'ios';
};

// Apple IAP Product IDs (must match App Store Connect)
const IAP_PRODUCTS = {
  radiation_pack: 'com.wastelandzero.app.radiation_pack',
  survival_kit: 'com.wastelandzero.app.survival_kit',
  boss_slayer: 'com.wastelandzero.app.boss_slayer',
  ultimate_pack: 'com.wastelandzero.app.ultimate_pack'
};
```

### Step 3: Replace Stripe Checkout with Apple IAP

Find the `Store.checkout()` function in store.js and replace with:

```javascript
Store.checkout = async function(productId) {
  if (isIOS()) {
    // Use Apple IAP
    await Store.buyAppleIAP(productId);
  } else {
    // Use Stripe (web version)
    await Store.buyStripe(productId);
  }
};

// New function: Apple IAP purchase flow
Store.buyAppleIAP = async function(productId) {
  try {
    const { InAppPurchases } = Capacitor.Plugins;
    
    // Map internal product ID to Apple product ID
    const appleProductId = IAP_PRODUCTS[productId];
    
    if (!appleProductId) {
      alert('Product not found');
      return;
    }
    
    // Show loading
    console.log(`Purchasing: ${appleProductId}`);
    
    // Purchase the product
    const result = await InAppPurchases.purchaseProduct({
      productIdentifier: appleProductId
    });
    
    if (result.success) {
      // Get receipt data
      const receiptData = result.receipt;
      const transactionId = result.transactionId;
      
      // Verify with backend
      const verifyRes = await fetch(`${window.BACKEND_URL}/api/iap/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receipt_data: receiptData,
          product_id: appleProductId,
          transaction_id: transactionId
        })
      });
      
      const verifyData = await verifyRes.json();
      
      if (verifyData.success) {
        // Consume purchase (grant items)
        const consumeRes = await fetch(`${window.BACKEND_URL}/api/iap/consume`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            receipt_data: receiptData,
            product_id: appleProductId,
            transaction_id: transactionId
          })
        });
        
        const consumeData = await consumeRes.json();
        
        if (consumeData.success) {
          alert(`✅ Purchase complete! You received: ${consumeData.granted.caps} Caps`);
          
          // Finish transaction
          await InAppPurchases.finishTransaction({
            transactionIdentifier: transactionId
          });
        }
      } else {
        alert('❌ Purchase verification failed');
      }
    }
  } catch (error) {
    console.error('IAP Error:', error);
    alert('Purchase failed. Please try again.');
  }
};

// Keep existing Stripe function for web
Store.buyStripe = async function(productId) {
  // Existing Stripe Checkout code...
  // (Keep current implementation)
};
```

### Step 4: Load Products from Apple

Add this initialization in store.js:

```javascript
// Initialize IAP
if (isIOS()) {
  (async () => {
    try {
      const { InAppPurchases } = Capacitor.Plugins;
      
      // Get product list from Apple
      const productIds = Object.values(IAP_PRODUCTS);
      const result = await InAppPurchases.getProducts({
        productIdentifiers: productIds
      });
      
      console.log('Available products:', result.products);
      
      // Update UI with Apple prices
      Store.updatePricesFromApple(result.products);
    } catch (error) {
      console.error('Failed to load IAP products:', error);
    }
  })();
}

Store.updatePricesFromApple = function(products) {
  // Update store UI to show Apple's localized prices
  products.forEach(product => {
    const priceString = product.localizedPrice; // e.g., "$4.99"
    console.log(`${product.productIdentifier}: ${priceString}`);
    
    // Update DOM elements showing prices
    // Example: document.querySelector(`[data-product="${product.productIdentifier}"]`).textContent = priceString;
  });
};
```

---

## 🔧 Xcode Configuration

### Step 1: Enable In-App Purchase Capability

1. Open Xcode: `npx cap open ios`
2. Select **App** target
3. Go to **Signing & Capabilities** tab
4. Click **+ Capability**
5. Add **In-App Purchase**

### Step 2: Test in Sandbox

**Create Sandbox Tester Account:**

1. Go to: https://appstoreconnect.apple.com
2. **Users and Access** → **Sandbox Testers**
3. Click **+** to add tester
4. Email: Use UNIQUE email (e.g., `test+ios1@yourdomain.com`)
5. Password: Create strong password
6. Country: Select your country
7. Save

**Test on Device:**

1. iPhone Settings → App Store → **Sandbox Account**
2. Sign in with sandbox tester account
3. Run app from Xcode
4. Attempt purchase
5. Sign in with sandbox account when prompted
6. Purchase completes instantly (no real charge)

---

## 🛠️ Debugging IAP

### Common Issues:

**1. "Cannot connect to iTunes Store"**
- Ensure you're signed into sandbox account
- Device must have internet connection
- Try signing out/in of sandbox account

**2. "Product IDs not found"**
- Verify product IDs exactly match App Store Connect
- Products must be "Ready to Submit" status
- Wait 2-3 hours after creating products

**3. "Receipt verification failed"**
- Check backend logs for Apple's error response
- Ensure using sandbox URL for testing
- Receipt format might be incorrect

**4. "Purchase stuck in pending"**
- Call `finishTransaction()` after consuming purchase
- Old transactions might need to be finished

### Enable Logging:

Add to store.js:

```javascript
// Debug logging
const logIAP = (message, data) => {
  console.log(`[IAP] ${message}`, data);
};

// Use throughout IAP flow
logIAP('Purchasing product', productId);
logIAP('Receipt received', receiptData);
logIAP('Verification response', verifyData);
```

---

## 📊 Testing Checklist

Before submitting to App Store:

- [ ] All 4 products load correctly
- [ ] Prices show in correct currency
- [ ] Purchase flow completes successfully
- [ ] Items granted after purchase
- [ ] Transaction marked as finished
- [ ] Restore purchases works (if applicable)
- [ ] Handles network errors gracefully
- [ ] Shows loading states during purchase
- [ ] Tested in sandbox with test account
- [ ] Tested on physical device (not simulator)

---

## 🔄 Restore Purchases (Optional)

If you want users to restore previous purchases:

```javascript
Store.restorePurchases = async function() {
  if (!isIOS()) return;
  
  try {
    const { InAppPurchases } = Capacitor.Plugins;
    const result = await InAppPurchases.restoreTransactions();
    
    if (result.transactions && result.transactions.length > 0) {
      alert(`Restored ${result.transactions.length} purchases`);
      
      // Process each transaction
      for (const transaction of result.transactions) {
        await Store.processRestoredTransaction(transaction);
      }
    } else {
      alert('No purchases to restore');
    }
  } catch (error) {
    console.error('Restore failed:', error);
    alert('Failed to restore purchases');
  }
};
```

Add a "Restore Purchases" button in your store UI.

---

## 💰 Revenue Tracking

Apple provides analytics in App Store Connect:

**Go to:** App Store Connect → **Analytics** → **App Store** → **In-App Purchases**

**You can see:**
- Total revenue
- Units sold per product
- Conversion rate
- Refund rate
- Proceeds (after Apple's 30% cut)

---

## 🚀 Going Live

**Before production launch:**

1. Test thoroughly with sandbox account
2. Verify all products in App Store Connect are "Ready to Submit"
3. Ensure backend receipt validation uses **production** URL first
4. Add proper error handling for all IAP flows
5. Test on multiple devices (iPhone + iPad)
6. Submit app for review with working IAP

**After approval:**

1. **Test real purchase immediately** (buy your own product)
2. Verify items are granted correctly
3. Check transaction appears in App Store Connect
4. Monitor for crash reports related to IAP
5. Respond to user issues quickly

---

## 📞 Support

**Apple IAP Resources:**
- Documentation: https://developer.apple.com/in-app-purchase/
- Testing Guide: https://developer.apple.com/documentation/storekit/in-app_purchase/testing_in-app_purchases_with_sandbox
- Receipt Validation: https://developer.apple.com/documentation/appstorereceipts

**Capacitor IAP Plugin:**
- GitHub: https://github.com/capacitor-community/in-app-purchases
- Issues: https://github.com/capacitor-community/in-app-purchases/issues

---

**Your IAP backend is ready! Complete frontend integration on Mac with Xcode. 🚀**

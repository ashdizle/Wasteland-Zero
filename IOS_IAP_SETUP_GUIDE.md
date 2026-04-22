# 📱 iOS In-App Purchase Setup Guide

## Product IDs (Must Match Exactly in App Store Connect)

### 1. Wasteland Zero Premium - $4.99
```
Product ID: com.wastelandzero.premium
Type: Non-Consumable
Price: $4.99 (USD Tier 5)
Description: Remove branding, exclusive title screen, and priority support
```

### 2. 24h XP Boost - $0.99
```
Product ID: com.wastelandzero.xp_boost  
Type: Consumable
Price: $0.99 (USD Tier 1)
Description: +50% XP gain for 24 hours
```

### 3. 24h Caps Boost - $0.99
```
Product ID: com.wastelandzero.caps_boost
Type: Consumable
Price: $0.99 (USD Tier 1)
Description: +50% currency drops for 24 hours
```

### 4. 24h Loot Boost - $0.99
```
Product ID: com.wastelandzero.loot_boost
Type: Consumable
Price: $0.99 (USD Tier 1)
Description: +25% loot quality for 24 hours
```

### 5. Mega Boost Bundle - $1.99
```
Product ID: com.wastelandzero.mega_bundle
Type: Consumable
Price: $1.99 (USD Tier 2)
Description: All 3 boosts (XP, Loot, Caps) for 24 hours - Save 33%!
```

---

## How to Add IAP Products in App Store Connect

### Step 1: Go to IAP Section
1. Open: https://appstoreconnect.apple.com/
2. My Apps → Wasteland Zero
3. Click **"Features"** tab (top)
4. Click **"In-App Purchases"** (left sidebar)

### Step 2: Add Each Product

**For Premium (Non-Consumable):**
1. Click **"+"** button
2. Select: **Non-Consumable**
3. Fill in:
   - **Reference Name**: Premium Unlock
   - **Product ID**: `com.wastelandzero.premium`
   - **Price**: $4.99 (Tier 5)
4. Click **"Create"**
5. Add **Localization** (English - US):
   - **Display Name**: Wasteland Zero Premium
   - **Description**: Remove branding, unlock exclusive title screen, and get priority support. One-time purchase, yours forever!
6. Upload a **Review Screenshot** (640x920 or 1280x1920)
7. Click **"Save"**

**For Boosts (Consumable):**
1. Click **"+"** button
2. Select: **Consumable**
3. Fill in Product ID (e.g., `com.wastelandzero.xp_boost`)
4. Set Price to $0.99 (Tier 1) or $1.99 (Tier 2 for bundle)
5. Add Localization with descriptions
6. Upload screenshot
7. **Save**

Repeat for all 5 products!

---

## IAP Review Screenshots

Apple requires a screenshot showing each IAP in your app. Use these:

**What to show:**
- The store screen with the product visible
- Price displayed clearly
- Product description visible

**How to capture:**
1. Open game on TestFlight
2. Navigate to SHOP → STORE tab
3. Take screenshot (Side + Volume Up button)
4. Upload in App Store Connect for each product

---

## Testing IAPs

### Sandbox Testing:
1. **Create Sandbox Tester**:
   - App Store Connect → Users and Access → Sandbox Testers
   - Click "+" and create test account
   - Email: test1@wastelandzero.test
   - Password: [create secure password]

2. **On Your iPhone**:
   - Settings → App Store → Sandbox Account
   - Sign in with test account
   - Install app via TestFlight
   - Test purchases (won't charge real money!)

3. **Testing Flow**:
   - Tap a product → Apple payment sheet appears
   - Confirm purchase with sandbox account
   - Receipt sent to backend for verification
   - Benefits granted to player

---

## Backend IAP Verification

Your backend is already set up at `/api/iap/verify`:

```
1. iOS app makes purchase
2. Apple returns receipt
3. App sends receipt to your backend
4. Backend verifies with Apple servers
5. Backend grants benefits
6. App updates UI
```

**Important:** Receipts are verified with Apple's servers to prevent fraud.

---

## Common Issues & Solutions

### Issue: "Invalid Product ID"
**Fix:** Product IDs must match EXACTLY (case-sensitive) between:
- App Store Connect
- Your backend (`/app/backend/routes/iap.py`)
- Your iOS app code

### Issue: "Products not loading in app"
**Fix:**
- Products must be in "Ready to Submit" status
- Wait 2-4 hours after creating products
- App must be signed with correct provisioning profile

### Issue: "Purchase completes but benefits not granted"
**Fix:** Check backend logs for receipt verification errors

---

## Checklist Before Submission

- [ ] All 5 IAP products created in App Store Connect
- [ ] Product IDs match backend exactly
- [ ] All products have localizations (English-US minimum)
- [ ] Screenshots uploaded for each product
- [ ] Tested with sandbox account
- [ ] Backend verification working
- [ ] Benefits granted correctly after purchase

---

**Once IAPs are configured, submit your app for review!** Apple will test the purchase flow during review.

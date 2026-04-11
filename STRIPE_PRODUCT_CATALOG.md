# Wasteland Zero - Stripe Product Catalog
## For Creating Products & Sending Invoices

---

## 📋 PRODUCT CATALOG

### Product 1: Wasteland Zero Premium
- **SKU:** `premium_unlock`
- **Price:** $4.99 USD
- **Type:** One-time purchase
- **Description:** Remove branding, exclusive title screen, and priority support
- **Benefits:** 
  - Ad-free experience
  - Exclusive premium title screen
  - Priority customer support
  - Permanent unlock

---

### Product 2: Cyberpunk Portrait Pack
- **SKU:** `cyber_portraits`
- **Price:** $2.99 USD
- **Type:** Cosmetic DLC
- **Description:** Alternative character portraits with cyberpunk aesthetic
- **Benefits:**
  - 8+ unique character portraits
  - Futuristic neon art style
  - Permanent unlock

---

### Product 3: Neon Apocalypse Portrait Pack
- **SKU:** `neon_portraits`
- **Price:** $2.99 USD
- **Type:** Cosmetic DLC
- **Description:** Glowing neon-style character portraits
- **Benefits:**
  - 8+ unique character portraits
  - Vibrant neon color scheme
  - Permanent unlock

---

### Product 4: 24h XP Boost
- **SKU:** `xp_boost_24h`
- **Price:** $0.99 USD
- **Type:** Consumable boost
- **Description:** +50% XP gain for 24 hours
- **Benefits:**
  - 50% faster leveling
  - 24-hour duration
  - Stacks with other boosts

---

### Product 5: 24h Loot Boost
- **SKU:** `loot_boost_24h`
- **Price:** $0.99 USD
- **Type:** Consumable boost
- **Description:** +25% better item drops for 24 hours
- **Benefits:**
  - 25% increased drop quality
  - Higher chance for rare/legendary items
  - 24-hour duration

---

### Product 6: 24h Caps Boost
- **SKU:** `caps_boost_24h`
- **Price:** $0.99 USD
- **Type:** Consumable boost
- **Description:** +50% caps (currency) from all sources for 24 hours
- **Benefits:**
  - 50% more in-game currency
  - Works on all caps sources
  - 24-hour duration

---

### Product 7: Mega Boost Bundle ⭐ BEST VALUE
- **SKU:** `mega_boost_bundle`
- **Price:** $1.99 USD (Save 33%!)
- **Type:** Bundle
- **Description:** All 3 boosts (XP + Loot + Caps) for 24 hours
- **Regular Price:** $2.97
- **You Save:** $0.98
- **Benefits:**
  - XP Boost: +50% XP
  - Loot Boost: +25% drop quality
  - Caps Boost: +50% currency
  - All active for 24 hours

---

### Product 8: Extra Save Slots
- **SKU:** `extra_save_slots`
- **Price:** $1.99 USD
- **Type:** One-time unlock
- **Description:** Unlock save slots 4, 5, and 6
- **Benefits:**
  - 3 additional save slots (total 6)
  - Try multiple builds simultaneously
  - Permanent unlock

---

### Product 9: Season Pass - Season 1
- **SKU:** `season_pass_1`
- **Price:** $9.99 USD
- **Type:** Season Pass
- **Description:** 50 tiers of exclusive rewards over 3 months
- **Benefits:**
  - 50 reward tiers
  - Exclusive cosmetics
  - Bonus XP throughout season
  - Special season-only items
  - 3-month duration

---

## 📊 PRICING SUMMARY

| Product Name | Price | Type | Best For |
|-------------|-------|------|----------|
| Premium Unlock | $4.99 | One-time | Dedicated players |
| Cyber Portraits | $2.99 | Cosmetic | Customization fans |
| Neon Portraits | $2.99 | Cosmetic | Customization fans |
| XP Boost 24h | $0.99 | Boost | Fast leveling |
| Loot Boost 24h | $0.99 | Boost | Gear farming |
| Caps Boost 24h | $0.99 | Boost | Currency farming |
| **Mega Bundle** | **$1.99** | **Bundle** | **Best value** |
| Extra Save Slots | $1.99 | Unlock | Alt characters |
| Season Pass S1 | $9.99 | Pass | Hardcore fans |

**Total Catalog Value:** $29.85

---

## 🛠️ HOW TO CREATE PRODUCTS IN STRIPE

### Step 1: Go to Stripe Dashboard
1. Log in to https://dashboard.stripe.com
2. Make sure you're in **Live mode** (toggle in top left)
3. Click **Products** in the left sidebar
4. Click **+ Add product**

---

### Step 2: Create Each Product

For each product above, fill in:

**Product information:**
- **Name:** [Product Name from catalog]
- **Description:** [Description from catalog]
- **Image:** Upload game screenshot or product icon (optional but recommended)

**Pricing:**
- **Price:** [Price from catalog]
- **Billing:** One time
- **Currency:** USD

**Additional options:**
- **Statement descriptor:** "Wasteland Zero" (what appears on customer's credit card)
- **Unit label:** Leave blank
- **Tax code:** "Digital goods" or "Software as a service"

Click **Save product**

---

### Step 3: Create Products (Quick Template)

**Copy-paste this for each product:**

#### Product 1
```
Name: Wasteland Zero Premium
Description: Remove branding, exclusive title screen, and priority support. Permanent unlock for dedicated survivors.
Price: $4.99 USD (one-time)
Statement descriptor: Wasteland Zero
```

#### Product 2
```
Name: Cyberpunk Portrait Pack
Description: Alternative character portraits with cyberpunk aesthetic. 8+ unique portraits with futuristic neon art style.
Price: $2.99 USD (one-time)
Statement descriptor: Wasteland Zero
```

#### Product 3
```
Name: Neon Apocalypse Portrait Pack
Description: Glowing neon-style character portraits. 8+ unique portraits with vibrant neon colors.
Price: $2.99 USD (one-time)
Statement descriptor: Wasteland Zero
```

#### Product 4
```
Name: 24h XP Boost
Description: +50% XP gain for 24 hours. Level up faster and unlock perks quicker.
Price: $0.99 USD (one-time)
Statement descriptor: Wasteland Zero
```

#### Product 5
```
Name: 24h Loot Boost
Description: +25% better item drops for 24 hours. Higher chance for rare and legendary gear.
Price: $0.99 USD (one-time)
Statement descriptor: Wasteland Zero
```

#### Product 6
```
Name: 24h Caps Boost
Description: +50% caps (in-game currency) from all sources for 24 hours.
Price: $0.99 USD (one-time)
Statement descriptor: Wasteland Zero
```

#### Product 7 (Highlight as Bundle)
```
Name: Mega Boost Bundle (SAVE 33%)
Description: All 3 boosts (XP + Loot + Caps) for 24 hours. Regular price $2.97, bundle saves you $0.98!
Price: $1.99 USD (one-time)
Statement descriptor: Wasteland Zero
```

#### Product 8
```
Name: Extra Save Slots
Description: Unlock save slots 4, 5, and 6. Try multiple character builds simultaneously. Permanent unlock.
Price: $1.99 USD (one-time)
Statement descriptor: Wasteland Zero
```

#### Product 9
```
Name: Season Pass - Season 1
Description: 50 tiers of exclusive rewards over 3 months. Includes exclusive cosmetics, bonus XP, and season-only items.
Price: $9.99 USD (one-time)
Statement descriptor: Wasteland Zero
```

---

## 📧 HOW TO SEND INVOICES

### Option A: Send Invoice via Stripe Dashboard

1. Go to https://dashboard.stripe.com/invoices
2. Click **+ New invoice**
3. Fill in:
   - **Customer:** Enter customer's email
   - **Items:** Select products from your catalog
   - **Due date:** Set payment due date (or "Due on receipt")
   - **Memo:** Add personal note (optional)
4. Click **Review invoice**
5. Click **Finalize and send**

Customer receives email with payment link.

---

### Option B: Send Payment Link (Faster)

1. Go to **Products** in Stripe Dashboard
2. Click on the product
3. Scroll down to **Payment links**
4. Click **Create payment link**
5. Copy the link and send it to customer via email, Discord, Twitter DM, etc.

Example link format:
```
https://buy.stripe.com/test_XXXXXXXXXXXXX
```

---

### Option C: Bulk Invoice Template (Email)

**Subject:** Wasteland Zero - Premium Unlock Invoice

**Body:**
```
Hey [Customer Name],

Thanks for supporting Wasteland Zero! 🎮

Your order:
• [Product Name] - $[Price] USD

Total: $[Total] USD

Pay now: [Stripe Payment Link]

Questions? Reply to this email.

Survive the wasteland,
[Your Name]
Wasteland Zero Dev
```

---

## 💡 PRICING BUNDLES FOR INVOICES

### Bundle 1: Complete Cosmetics Pack
**Items:**
- Cyber Portraits ($2.99)
- Neon Portraits ($2.99)

**Total:** $5.98
**Bundle Price:** $4.99 (Save $0.99)

---

### Bundle 2: Power Player Pack
**Items:**
- Premium Unlock ($4.99)
- Extra Save Slots ($1.99)
- Mega Boost Bundle ($1.99)

**Total:** $8.97
**Bundle Price:** $7.99 (Save $0.98)

---

### Bundle 3: Ultimate Wasteland Pack 🔥
**Items:**
- Everything except Season Pass

**Total:** $19.86
**Bundle Price:** $14.99 (Save $4.87)

---

## 📄 CSV FORMAT (For Import/Reference)

```csv
SKU,Product Name,Price (USD),Type,Description
premium_unlock,Wasteland Zero Premium,4.99,One-time,Remove branding and exclusive title screen
cyber_portraits,Cyberpunk Portrait Pack,2.99,Cosmetic,Alternative portraits with cyberpunk aesthetic
neon_portraits,Neon Apocalypse Portrait Pack,2.99,Cosmetic,Glowing neon-style character portraits
xp_boost_24h,24h XP Boost,0.99,Boost,+50% XP gain for 24 hours
loot_boost_24h,24h Loot Boost,0.99,Boost,+25% better drops for 24 hours
caps_boost_24h,24h Caps Boost,0.99,Boost,+50% caps from all sources for 24 hours
mega_boost_bundle,Mega Boost Bundle,1.99,Bundle,All 3 boosts for 24 hours - Save 33%
extra_save_slots,Extra Save Slots,1.99,Unlock,Unlock save slots 4 5 and 6
season_pass_1,Season Pass - Season 1,9.99,Pass,50 tiers of exclusive rewards over 3 months
```

---

## 🎯 RECOMMENDED PRICING STRATEGY

**For Individual Customers:**
- Send payment links for single products
- Offer bundles for repeat customers

**For Influencers/Streamers:**
- Offer "Complete Pack" at discount
- Invoice for custom amounts

**For Bulk Orders (Giveaways):**
- Create custom invoice with quantity discount
- Example: 10x Premium Unlock = $39.90 (save $10)

---

## 🔗 AFTER SETUP - PAYMENT LINK EXAMPLES

Once products are created, your payment links will look like:

```
Premium Unlock:
https://buy.stripe.com/live_XXXXXXXXXXXXX

Mega Boost Bundle:
https://buy.stripe.com/live_YYYYYYYYYYYYY

Season Pass:
https://buy.stripe.com/live_ZZZZZZZZZZZZZ
```

**Save these links** and use them to:
- Send direct payment links via email/DM
- Post on social media
- Add to your website
- Share in Discord

---

## ✅ SETUP CHECKLIST

- [ ] Log in to Stripe Dashboard (Live mode)
- [ ] Create all 9 products from catalog
- [ ] Test each product with a $0.50 test charge
- [ ] Create payment links for each product
- [ ] Save payment links in a spreadsheet
- [ ] Set up invoice template (if needed)
- [ ] Add products to your game store (already done!)

---

## 📞 SUPPORT

**Stripe Questions:**
- Help: https://support.stripe.com
- Chat: Available in dashboard

**Product/Game Questions:**
- Email: [Your support email]

---

**Your product catalog is ready! Create these in Stripe and start invoicing! 💰**

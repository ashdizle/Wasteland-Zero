# 🍎 Wasteland Zero - iOS App Store Launch Guide

## ✅ What's Been Prepared

Your game is now configured for iOS App Store submission with:
- ✅ Capacitor iOS project initialized
- ✅ Universal app (iPhone + iPad support)
- ✅ Portrait + Landscape orientation support
- ✅ App configuration complete
- ✅ Bundle ID: `com.wastelandzero.app`
- ✅ Version: 1.0.0

---

## 🚨 IMPORTANT: Apple In-App Purchase Required

**Stripe payments have been DISABLED for iOS version.** Apple requires all digital goods to use Apple IAP.

**What you need to do:**
1. Set up products in App Store Connect
2. Integrate Apple IAP SDK (instructions below)
3. Backend will handle IAP receipt validation

**Products to create in App Store Connect:**
- Radiation Pack ($4.99)
- Survival Kit ($9.99)
- Boss Slayer Bundle ($14.99)
- Ultimate Wasteland Pack ($24.99)

---

## 📋 Prerequisites

### Required:
1. ✅ **Apple Developer Account** ($99/year) - You have this
2. **Mac with Xcode** (latest version)
   - Xcode 15+ (free from App Store)
   - macOS Ventura 13+ or Sonoma 14+
3. **Physical iPhone/iPad** (for final testing)

### Don't Have a Mac? Options:

**Option A: Borrow/Rent a Mac**
- Friend's Mac (easiest)
- Apple Store "test drive"
- Mac rental services:
  - MacStadium ($79-200/month)
  - MacinCloud ($30-99/month)
  - AWS Mac instances ($120+/month)

**Option B: Cloud Build (Automated)**
- **Expo EAS** (Recommended for Capacitor)
  - $29/month
  - Builds in cloud
  - No Mac needed
  - Instructions: https://capacitorjs.com/docs/guides/deploying-updates

**Option C: GitHub Actions** (Advanced, FREE)
- Use GitHub's macOS runners
- Automated build on every push
- Requires GitHub Pro ($4/month) or use free tier (slower)

---

## 🛠️ Build Instructions (On Mac)

### Step 1: Transfer Project to Mac

**Method A: Git (Recommended)**
```bash
# On your current machine
cd /app/frontend
git add .
git commit -m "iOS build ready"
git push origin main

# On Mac
git clone YOUR_REPO_URL
cd YOUR_PROJECT/frontend
```

**Method B: ZIP File**
```bash
# On your current machine
cd /app
tar -czf wasteland-zero-ios.tar.gz frontend/

# Transfer to Mac via:
# - Email (if < 25MB)
# - Google Drive / Dropbox
# - USB drive
# - AirDrop (if nearby)

# On Mac
tar -xzf wasteland-zero-ios.tar.gz
cd frontend/
```

---

### Step 2: Install Dependencies on Mac

```bash
# Install Node.js (if not already)
brew install node

# Install Yarn
npm install -g yarn

# Install project dependencies
cd /path/to/frontend
yarn install

# Install CocoaPods (iOS dependency manager)
sudo gem install cocoapods

# Install iOS dependencies
cd ios/App
pod install
cd ../..
```

---

### Step 3: Open in Xcode

```bash
cd /path/to/frontend
npx cap open ios
```

This opens Xcode with your iOS project.

---

### Step 4: Configure Xcode Project

**In Xcode:**

1. **Select "App" target** (left sidebar)

2. **General Tab:**
   - Display Name: `Wasteland Zero`
   - Bundle Identifier: `com.wastelandzero.app`
   - Version: `1.0.0`
   - Build: `1`
   - Deployment Target: `iOS 13.0` or higher
   - Devices: **Universal** (iPhone + iPad)

3. **Signing & Capabilities Tab:**
   - ✅ Automatically manage signing
   - Team: Select your Apple Developer account
   - Provisioning Profile: Automatic

4. **Info Tab:**
   - Check orientations are set (already done)

---

### Step 5: Add App Icons

**Icon Requirements:**
- Size: 1024x1024 pixels
- Format: PNG (no transparency)
- No rounded corners (Apple adds them)

**How to add:**
1. In Xcode, open `Assets.xcassets`
2. Click "AppIcon"
3. Drag your 1024x1024 icon to "App Store iOS 1024pt" slot

**Don't have icons?** Use a tool:
- https://appicon.co (free, upload 1024x1024 image)
- https://makeappicon.com

**Temporary solution:** I can help you generate an app icon if you provide a design concept.

---

### Step 6: Build for Testing

**Test on Simulator:**
```
1. Select "iPhone 15 Pro" simulator (top bar)
2. Click ▶ Run button (or Cmd+R)
3. Game should launch in simulator
```

**Test on Physical Device:**
```
1. Connect iPhone/iPad via USB
2. Select your device from top bar
3. Click ▶ Run
4. First time: "Untrusted Developer" error
   → Settings > General > VPN & Device Management
   → Trust your Apple Developer certificate
5. Launch game again
```

---

### Step 7: Create Archive for App Store

**In Xcode:**

1. **Select "Any iOS Device" target** (top bar)
2. **Menu: Product → Archive**
3. Wait for build to complete (5-10 minutes)
4. **Organizer window** opens showing your archive

---

### Step 8: Upload to App Store Connect

**In Organizer:**

1. **Select your archive**
2. **Click "Distribute App"**
3. Select **"App Store Connect"**
4. Click **"Upload"**
5. Select **"Automatically manage signing"**
6. Click **"Upload"**
7. Wait (10-30 minutes)

---

## 📱 App Store Connect Setup

### Step 1: Create App Listing

1. Go to: https://appstoreconnect.apple.com
2. Click **"My Apps"** → **"+"** → **"New App"**

**Fill in:**
- Platform: **iOS**
- Name: **Wasteland Zero**
- Primary Language: **English (U.S.)**
- Bundle ID: Select **com.wastelandzero.app**
- SKU: **wasteland-zero-001** (unique identifier)
- User Access: **Full Access**

---

### Step 2: App Information

**Required:**

1. **Name:** Wasteland Zero
2. **Subtitle:** Post-Apocalyptic Roguelite RPG
3. **Category:** Games → Role-Playing
4. **Secondary Category:** Games → Strategy
5. **Content Rights:** Check if you own rights
6. **Age Rating:**
   - Infrequent/Mild Cartoon or Fantasy Violence: ✅
   - Result: **12+**

---

### Step 3: Pricing & Availability

- **Price:** Free (with In-App Purchases)
- **Availability:** All countries
- **Release:** Manually release this version

---

### Step 4: In-App Purchases (CRITICAL)

**Create 4 IAP products:**

1. **Radiation Pack**
   - Product ID: `com.wastelandzero.app.radiation_pack`
   - Type: Consumable
   - Price: $4.99 (Tier 5)
   - Display Name: "Radiation Pack"
   - Description: "☢️ 250 Radiation Protection + 5 RadAway"

2. **Survival Kit**
   - Product ID: `com.wastelandzero.app.survival_kit`
   - Type: Consumable
   - Price: $9.99 (Tier 10)
   - Display Name: "Survival Kit"
   - Description: "🎒 1000 Caps + 10 Stimpaks + 500 Ammo"

3. **Boss Slayer Bundle**
   - Product ID: `com.wastelandzero.app.boss_slayer`
   - Type: Consumable
   - Price: $14.99 (Tier 15)
   - Display Name: "Boss Slayer Bundle"
   - Description: "💀 Legendary Weapon + 2000 Caps + Boss Tracker"

4. **Ultimate Wasteland Pack**
   - Product ID: `com.wastelandzero.app.ultimate_pack`
   - Type: Consumable
   - Price: $24.99 (Tier 25)
   - Display Name: "Ultimate Wasteland Pack"
   - Description: "🔥 Everything + 5000 Caps + Exclusive Skin"

**Screenshot each product ID** - you'll need them for backend integration.

---

### Step 5: App Preview & Screenshots

**Required Sizes:**

**iPhone:**
- 6.7" (iPhone 15 Pro Max): 1290 x 2796 pixels
- 6.5" (iPhone 14 Plus): 1284 x 2778 pixels
- 5.5" (iPhone 8 Plus): 1242 x 2208 pixels

**iPad:**
- 12.9" (iPad Pro): 2048 x 2732 pixels

**How to capture:**

1. Run app in Xcode simulator
2. Menu: **Device → Screenshot**
3. Repeat for each required device size

**Minimum: 3 screenshots per device type**

**Need help?** Tools:
- https://screenshots.pro (automated)
- https://hotpot.ai/mockups

---

### Step 6: App Description

**Copy-paste this:**

```
🎲💀 WASTELAND ZERO - Survive the Post-Apocalypse

Every fight is a dice roll. Every death matters. Every rift changes everything.

⚔️ FEATURES:
• D20 Combat System - Roll for your life
• 4 Unique Classes + Race Selection
• 50+ Reality Rift Outcomes
• 4 Epic Boss Fights
• Global Leaderboards
• Permanent Death (Hardcore Mode)
• 100+ Items & Weapons

🌍 EXPLORE THE WASTELAND:
Navigate through dangerous territories, encounter NPCs, discover hidden loot, and face increasingly deadly enemies. Every run is unique.

🎯 ROGUELITE PROGRESSION:
Unlock new skills, upgrade your character, and climb the leaderboards. Die, learn, return stronger.

💀 BOSS BATTLES:
Face Irradiated Colossus, Rift Stalker, Cyber Tyrant, and Void Lord in epic encounters.

📊 COMPETE GLOBALLY:
Submit your best runs to worldwide leaderboards across 5 categories.

🔥 REALITY RIFTS:
Encounter dimensional tears that offer risky choices with game-changing rewards.

No ads. No subscriptions. Pure roguelite action.

Download now and conquer the wasteland!
```

**Keywords (100 chars max):**
`roguelike,rpg,dice,post-apocalyptic,survival,strategy,turn-based,dungeon,permadeath,adventure`

---

### Step 7: App Review Information

**Contact Info:**
- First Name: Your name
- Last Name: Your name
- Phone: Your phone
- Email: Your email

**Demo Account (CRITICAL):**
- Username: `demo@wastelandzero.com`
- Password: `DemoPass123!`
- Notes: "No login required. Game works immediately."

**Notes to Reviewer:**
```
Wasteland Zero is a post-apocalyptic roguelite RPG with D20 dice-based combat.

HOW TO TEST:
1. Launch app
2. Tap "NEW GAME" on any slot
3. Select race → archetype → traits
4. Play through combat tutorial
5. Test In-App Purchase: Tap "STORE" button

FEATURES TO TEST:
- Character creation flow
- Combat system
- In-App Purchases
- Leaderboards
- Reality Rifts

Game requires internet for leaderboards and IAP only.

Thank you!
```

---

### Step 8: Submit for Review

1. **Version Information**
   - Version: 1.0.0
   - Copyright: 2025 Your Name/Company
   - Privacy Policy URL: (You need to create one - see below)

2. **Build:** Select the build you uploaded

3. **App Review Information:** Fill in contact details

4. **Click "Submit for Review"**

---

## 🔒 Privacy Policy (REQUIRED)

Apple requires a privacy policy. Here's a template:

**Create a page at:** `https://your-domain.com/privacy-policy`

**Template:**
```markdown
# Privacy Policy for Wasteland Zero

Last updated: [Date]

## Information We Collect
- Game progress (stored locally on device)
- Leaderboard submissions (name, score, optional email)
- Google Analytics data (usage statistics)

## How We Use Information
- Improve game experience
- Display global leaderboards
- Track app performance

## Third-Party Services
- Google Analytics
- Apple In-App Purchase

## Data Storage
- Game saves stored locally on your device
- Leaderboard data stored on secure servers

## Your Rights
- Delete your leaderboard entry by contacting us
- Opt out of analytics by disabling in device settings

## Contact
Email: your-email@example.com

## Changes
We may update this policy. Check this page periodically.
```

**Quick hosting:** Use GitHub Pages (free) or Notion (free).

---

## 📊 Apple IAP Backend Integration

I've prepared the backend structure, but **you need to integrate StoreKit** in iOS.

### Backend Endpoints Created:

1. **`POST /api/iap/verify`** - Verify Apple IAP receipt
2. **`POST /api/iap/consume`** - Mark purchase as consumed
3. **`GET /api/iap/products`** - Get product list

### iOS Integration Steps:

**Install StoreKit plugin:**
```bash
npm install @capacitor-community/in-app-purchases
npx cap sync
```

**In your game code (store.js), replace Stripe with:**
```javascript
// For iOS, use Apple IAP
if (Capacitor.getPlatform() === 'ios') {
  // Use @capacitor-community/in-app-purchases
  // Full code provided in IOS_IAP_INTEGRATION.md
} else {
  // Use Stripe (web version)
}
```

**Full IAP code provided in:** `/app/IOS_IAP_INTEGRATION.md`

---

## ⏱️ Timeline & Review Process

**Typical Timeline:**
1. First submission: Build upload → 1-2 hours processing
2. Review submission → Queue (1-2 days)
3. In Review → 24-48 hours
4. Approved/Rejected

**Total: 3-5 days on average**

**Rejection Reasons (Common):**
1. Missing screenshots
2. App crashes on launch
3. IAP not working
4. Missing privacy policy
5. Metadata issues (description/keywords)

**If rejected:** Fix issue, resubmit (faster review ~24h)

---

## 🚀 Launch Checklist

**Before Submission:**
- [ ] App builds successfully in Xcode
- [ ] Tested on physical iPhone
- [ ] Tested on physical iPad
- [ ] All 4 IAP products created in App Store Connect
- [ ] Screenshots captured (iPhone + iPad)
- [ ] App icon (1024x1024) added
- [ ] Privacy policy published online
- [ ] Demo account info added
- [ ] App description finalized

**After Approval:**
- [ ] Test IAP in production (buy your own product!)
- [ ] Share with beta testers
- [ ] Promote on social media
- [ ] Monitor crash reports in App Store Connect
- [ ] Respond to user reviews

---

## 📞 Need Help?

**Common Issues:**

1. **"Provisioning profile error"**
   - Fix: Xcode → Preferences → Accounts → Download Manual Profiles

2. **"Code signing failed"**
   - Fix: Select your team in Signing & Capabilities

3. **"Build failed"**
   - Fix: Clean build folder (Cmd+Shift+K), then rebuild

4. **"Can't find device"**
   - Fix: Trust computer on iPhone (popup appears when connected)

---

## 🎯 Post-Launch Strategy

**Week 1:**
- Monitor crash reports daily
- Respond to all reviews
- Fix critical bugs (release 1.0.1)

**Week 2-4:**
- Add App Store Optimization (ASO)
- Run promo campaigns
- Collect user feedback
- Plan v1.1 update

**Month 2+:**
- Add new content (Season 2 from GDD)
- Implement user-requested features
- Expand to Android (easier after iOS!)

---

## 💰 Revenue Expectations

**Apple takes 30% of IAP** (15% after year 1 per subscriber)

**Your cut:**
- $4.99 Radiation Pack → You get $3.49
- $9.99 Survival Kit → You get $6.99
- $14.99 Boss Slayer → You get $10.49
- $24.99 Ultimate Pack → You get $17.49

**If you sell 100 Ultimate Packs/month:**
- Gross: $2,499
- Your cut: $1,749/month
- Apple's cut: $750

---

## 🔄 Updating Your App

**For future updates:**

1. Make changes to your code
2. Increment version (1.0.0 → 1.0.1)
3. Build archive in Xcode
4. Upload to App Store Connect
5. Submit for review (faster ~24h)

**No review needed for:**
- Server-side changes
- Backend updates
- Content updates (if dynamic)

---

**Your iOS project is ready! Follow this guide step-by-step on a Mac to launch. 🚀**

**Questions? Check:**
- Apple Developer Docs: https://developer.apple.com/documentation/
- Capacitor iOS Guide: https://capacitorjs.com/docs/ios
- App Store Review Guidelines: https://developer.apple.com/app-store/review/guidelines/

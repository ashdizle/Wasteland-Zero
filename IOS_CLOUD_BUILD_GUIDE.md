# 🚀 Wasteland Zero - iOS Cloud Build Guide (No Mac Required!)

## ✅ What You Have Ready
- ✅ Capacitor iOS project configured
- ✅ Bundle ID: `com.wastelandzero.app`
- ✅ App icon ready
- ✅ Game fully functional and tested

---

## 🎯 Best Option: Ionic Appflow (Cloud Build)

**Why Appflow:**
- ✅ No Mac required
- ✅ Automated builds in cloud
- ✅ Direct TestFlight upload
- ✅ $29/month (cancel anytime)
- ✅ Built specifically for Capacitor apps

---

## 📋 Step-by-Step: Appflow Setup

### Step 1: Sign Up for Ionic Appflow

1. Go to: https://ionic.io/appflow
2. Click "Start Free Trial" (14 days free)
3. Sign up with your email
4. Choose "Hobby" plan ($29/month after trial)

### Step 2: Connect Your GitHub Repository

Your repo: `ashdizle/Wasteland-Zero`

1. In Appflow dashboard, click "New App"
2. Choose "Connect Git"
3. Select "GitHub"
4. Authorize Ionic to access your repo
5. Select `ashdizle/Wasteland-Zero`
6. Set build directory to `/frontend`

### Step 3: Configure iOS Build

1. In Appflow, go to "Settings" → "Build"
2. Set these values:
   ```
   App ID: com.wastelandzero.app
   App Name: Wasteland Zero
   Platform: iOS
   Build Type: Release
   ```

### Step 4: Add Your Apple Certificates

**You need from Apple Developer:**
1. **Distribution Certificate** (.p12 file + password)
2. **Provisioning Profile** (.mobileprovision)

**How to get these:**

#### A. Using Appflow's Certificate Assistant (EASIEST)
1. In Appflow → "Settings" → "Certificates"
2. Click "Generate Certificate"
3. Appflow will guide you through:
   - Connecting your Apple Developer account
   - Auto-generating certificates
   - Auto-creating provisioning profiles

#### B. Manual Method (if Assistant doesn't work)
1. Go to: https://developer.apple.com/account/
2. Navigate to "Certificates, IDs & Profiles"
3. **Create App ID:**
   - Click "Identifiers" → "+"
   - Bundle ID: `com.wastelandzero.app`
   - Description: "Wasteland Zero Game"
4. **Create Distribution Certificate:**
   - Click "Certificates" → "+"
   - Choose "iOS Distribution (App Store and Ad Hoc)"
   - Follow prompts to download `.cer` file
5. **Create Provisioning Profile:**
   - Click "Profiles" → "+"
   - Choose "App Store"
   - Select your App ID
   - Select your Distribution Certificate
   - Download `.mobileprovision` file

Upload both to Appflow.

### Step 5: Trigger Your First Build

1. In Appflow dashboard, click "Build"
2. Select "iOS"
3. Choose "Release" type
4. Click "Build"
5. Wait 10-15 minutes for cloud build

### Step 6: Download IPA File

1. Once build completes, click "Download"
2. You'll get a `.ipa` file
3. This is your iOS app package!

---

## 📱 Upload to App Store Connect

### Step 1: Create App in App Store Connect

1. Go to: https://appstoreconnect.apple.com/
2. Click "My Apps" → "+"
3. Fill in:
   ```
   Name: Wasteland Zero
   Bundle ID: com.wastelandzero.app
   SKU: WASTELAND001
   ```

### Step 2: Upload IPA via Appflow

**Option A: Direct Upload from Appflow**
1. In Appflow, after build completes
2. Click "Deploy" → "App Store Connect"
3. Enter your Apple credentials
4. Appflow uploads directly!

**Option B: Upload via Transporter**
1. Download Apple Transporter (Windows/Mac): https://apps.apple.com/app/transporter/id1450874784
2. Open Transporter
3. Sign in with Apple ID
4. Drag your `.ipa` file
5. Click "Deliver"

### Step 3: Fill Out App Store Listing

In App Store Connect:

**Required Info:**
- **App Description**: (Write compelling description of your game)
- **Keywords**: wasteland, rpg, roguelite, survival, post-apocalyptic
- **Screenshots**: (Take 6.5" iPhone screenshots)
- **App Icon**: (Upload your 1024x1024 icon)
- **Age Rating**: 12+ (fantasy violence)
- **Price**: Free (or $4.99)

**Screenshots Needed:**
- 6.5" iPhone (1242 x 2688): 4-10 screenshots
- 12.9" iPad Pro (2048 x 2732): 4-10 screenshots

### Step 4: Submit for Review

1. Set app pricing
2. Add privacy policy URL (required)
3. Click "Submit for Review"
4. Apple reviews in 1-3 days

---

## 🔧 Alternative: GitHub Actions (FREE!)

If you don't want to pay for Appflow, you can use GitHub Actions:

### Setup GitHub Actions iOS Build

1. Create `.github/workflows/ios-build.yml`:

```yaml
name: iOS Build

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build:
    runs-on: macos-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: 18
    
    - name: Install dependencies
      working-directory: ./frontend
      run: |
        yarn install
        npx cap sync ios
    
    - name: Build iOS
      working-directory: ./frontend/ios/App
      run: |
        xcodebuild -workspace App.xcworkspace \
          -scheme App \
          -configuration Release \
          -archivePath App.xcarchive \
          archive
    
    - name: Upload IPA
      uses: actions/upload-artifact@v3
      with:
        name: ios-app
        path: frontend/ios/App/App.xcarchive
```

2. Add Apple certificates as GitHub Secrets
3. Push to trigger build
4. Download IPA from Actions artifacts

**Pros:** FREE  
**Cons:** More complex setup, need to manage certificates

---

## 🎮 Testing Your iOS Build

### TestFlight (Beta Testing)

1. In App Store Connect → "TestFlight"
2. Click "+" to add testers
3. Enter email addresses
4. Testers get invite via email
5. They download TestFlight app
6. Install your game for testing

**Free beta testing for up to 10,000 testers!**

---

## 💰 In-App Purchases Setup

**REQUIRED by Apple:** You must use Apple IAP for digital goods.

### Step 1: Create IAP Products

In App Store Connect → Your App → "In-App Purchases":

1. Click "+" → "Consumable"
2. Create these products:

```
Product ID: com.wastelandzero.gems.small
Name: Gem Pack (Small)
Price: $0.99
Description: 100 Gems for cosmetic items

Product ID: com.wastelandzero.gems.medium
Name: Gem Pack (Medium)
Price: $4.99
Description: 600 Gems for cosmetic items

Product ID: com.wastelandzero.gems.large
Name: Gem Pack (Large)
Price: $9.99
Description: 1,500 Gems for cosmetic items

Product ID: com.wastelandzero.boost.xp
Name: 24h XP Boost
Price: $0.99
Description: +50% XP gain for 24 hours
```

### Step 2: Update Game Code

Your IAP backend routes are already set up at `/app/backend/routes/iap.py`!

Just need to integrate Apple StoreKit in frontend:
```javascript
// In game.html, add:
import { InAppPurchase2 } from '@ionic-native/in-app-purchase-2';
```

---

## 📊 Recommended Plan

### Phase 1: Initial Upload (Week 1)
- ✅ Set up Appflow account
- ✅ Configure certificates
- ✅ First cloud build
- ✅ Upload to TestFlight
- ✅ Internal testing (you + friends)

### Phase 2: Beta Testing (Week 2-3)
- ✅ Add 10-20 beta testers
- ✅ Collect feedback
- ✅ Fix any iOS-specific bugs
- ✅ Test IAP purchases

### Phase 3: App Store Submission (Week 4)
- ✅ Finalize screenshots
- ✅ Write app description
- ✅ Submit for review
- ✅ Go live!

---

## 💡 Cost Breakdown

**One-Time:**
- Apple Developer: $99/year (you have this)

**Monthly (while building):**
- Ionic Appflow: $29/month (or use GitHub Actions FREE)

**Optional:**
- TestFlight: FREE
- App Analytics: FREE

**Total: $99/year + $29/month (or $99/year only with GitHub Actions)**

---

## 🆘 Troubleshooting

### "Build Failed" in Appflow
- Check build logs in Appflow dashboard
- Ensure capacitor.config.json is correct
- Verify Bundle ID matches Apple Developer

### "Invalid Provisioning Profile"
- Re-download from Apple Developer
- Make sure it matches your Bundle ID
- Check expiration date

### "Missing Icon"
- Ensure icon is 1024x1024 PNG
- No transparency
- Upload to App Store Connect

---

## 📞 Support

**Ionic Appflow Support:**
- Docs: https://ionic.io/docs/appflow
- Chat: In Appflow dashboard
- Forum: https://forum.ionicframework.com/

**Apple Developer Support:**
- https://developer.apple.com/support/

---

## ✅ Next Steps for YOU

1. **Sign up for Ionic Appflow** (14-day free trial): https://ionic.io/appflow
2. **Connect your GitHub repo**: `ashdizle/Wasteland-Zero`
3. **Set up Apple certificates** (use Appflow's assistant)
4. **Trigger your first build**
5. **Upload icon** (you have it ready!)
6. **Submit to TestFlight** for testing

**Estimated Time to First Build: 2-3 hours**  
**Estimated Time to App Store: 1-2 weeks**

---

## 🎯 Ready to Start?

I can help you with:
- Setting up Appflow integration
- Creating the GitHub Actions workflow (free option)
- Writing your App Store description
- Preparing screenshots
- Configuring IAP products

**Let me know which build method you prefer!**
- 💳 **Option A**: Ionic Appflow ($29/month, easiest)
- 🆓 **Option B**: GitHub Actions (FREE, more complex)

# 🔧 Ionic Appflow Certificate Troubleshooting Guide

## Issue: Certificate Assistant Not Working

If the Appflow Certificate Assistant is giving you trouble, here are **3 alternative methods** to get your iOS certificates and provisioning profiles:

---

## ✅ METHOD 1: Manual Apple Developer Portal (Most Reliable)

### Step 1: Create Certificate Signing Request (CSR)

**On Windows:**
1. Download OpenSSL for Windows: https://slproweb.com/products/Win32OpenSSL.html
2. Install and open Command Prompt
3. Run these commands:
```bash
cd C:\OpenSSL-Win64\bin
openssl req -nodes -newkey rsa:2048 -keyout ios_distribution.key -out CertificateSigningRequest.certSigningRequest
```
4. Fill in the prompts:
   - Country: US
   - State: Your State
   - City: Your City
   - Organization: Wasteland Zero
   - Common Name: Your Name
   - Email: ashdizle@gmail.com

**On Mac (if you have access to one):**
1. Open Keychain Access
2. Menu: Keychain Access → Certificate Assistant → Request a Certificate from a Certificate Authority
3. Enter email: ashdizle@gmail.com
4. Common Name: Wasteland Zero
5. Select "Saved to disk"
6. Save the CSR file

### Step 2: Create Distribution Certificate

1. Go to: https://developer.apple.com/account/resources/certificates/list
2. Click the "+" button
3. Select **"Apple Distribution"** (for App Store)
4. Click "Continue"
5. Upload your `CertificateSigningRequest.certSigningRequest`
6. Click "Continue"
7. **Download** the certificate (`.cer` file)

### Step 3: Convert Certificate to .p12 Format

**On Windows with OpenSSL:**
```bash
# First, convert .cer to .pem
openssl x509 -in distribution.cer -inform DER -out distribution.pem -outform PEM

# Then, combine with your private key to create .p12
openssl pkcs12 -export -out distribution.p12 -inkey ios_distribution.key -in distribution.pem
```
- Enter a password when prompted (remember this!)
- This is the `.p12` file Appflow needs

**On Mac:**
1. Double-click the downloaded `.cer` file (installs in Keychain)
2. Open Keychain Access
3. Find your certificate under "My Certificates"
4. Right-click → Export
5. Save as `.p12` format
6. Set a password (remember this!)

### Step 4: Create App ID

1. Go to: https://developer.apple.com/account/resources/identifiers/list
2. Click "+" button
3. Select "App IDs" → Continue
4. Select "App" → Continue
5. Fill in:
   - Description: `Wasteland Zero`
   - Bundle ID: `com.wastelandzero.app` (Explicit)
   - Capabilities: Check "In-App Purchase" if needed
6. Click "Continue" → "Register"

### Step 5: Create Provisioning Profile

1. Go to: https://developer.apple.com/account/resources/profiles/list
2. Click "+" button
3. Select **"App Store"** distribution
4. Click "Continue"
5. Select your App ID: `com.wastelandzero.app`
6. Click "Continue"
7. Select your Distribution Certificate
8. Click "Continue"
9. Name: `Wasteland Zero App Store`
10. Click "Generate"
11. **Download** the `.mobileprovision` file

### Step 6: Upload to Appflow

1. In Appflow dashboard → "Settings" → "Certificates"
2. Click "Add Certificate"
3. Upload:
   - **Certificate**: `distribution.p12` file
   - **Password**: The password you set earlier
   - **Provisioning Profile**: `Wasteland_Zero_App_Store.mobileprovision`
4. Click "Save"

---

## ✅ METHOD 2: Use Fastlane Match (Advanced)

Fastlane can automate certificate management:

### Install Fastlane
```bash
# On Mac
brew install fastlane

# On Windows
gem install fastlane
```

### Initialize Match
```bash
cd /app/frontend
fastlane match init
```

### Generate Certificates
```bash
fastlane match appstore --app_identifier com.wastelandzero.app
```

Fastlane will:
- Create certificates and provisioning profiles
- Store them in a private Git repo
- Automatically sync them

---

## ✅ METHOD 3: Use GitHub Actions (FREE Alternative)

If Appflow is too expensive, use GitHub Actions with Fastlane:

### Create `.github/workflows/ios-build.yml`:

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
    
    - name: Setup Ruby
      uses: ruby/setup-ruby@v1
      with:
        ruby-version: '3.0'
    
    - name: Install Fastlane
      run: gem install fastlane
    
    - name: Build iOS
      working-directory: ./frontend/ios
      env:
        MATCH_PASSWORD: ${{ secrets.MATCH_PASSWORD }}
        FASTLANE_APPLE_ID: ${{ secrets.APPLE_ID }}
        FASTLANE_PASSWORD: ${{ secrets.APPLE_PASSWORD }}
      run: |
        fastlane build
    
    - name: Upload to TestFlight
      working-directory: ./frontend/ios
      run: fastlane upload_testflight
    
    - name: Upload IPA
      uses: actions/upload-artifact@v3
      with:
        name: ios-app
        path: frontend/ios/build/Wasteland-Zero.ipa
```

**Add GitHub Secrets:**
1. Go to your GitHub repo → Settings → Secrets
2. Add these secrets:
   - `APPLE_ID`: Your Apple Developer email
   - `APPLE_PASSWORD`: App-specific password (generate at appleid.apple.com)
   - `MATCH_PASSWORD`: Password for certificate storage

---

## 🆘 Common Issues & Solutions

### Issue: "Certificate not trusted"
**Solution:** Make sure you're creating an **Apple Distribution** certificate (not Development)

### Issue: "Provisioning profile doesn't match Bundle ID"
**Solution:** Double-check that your Bundle ID matches exactly: `com.wastelandzero.app`

### Issue: "Certificate expired"
**Solution:** Certificates last 1 year. Create a new one using the same steps.

### Issue: "Invalid .p12 file"
**Solution:** 
- Make sure you exported with the private key included
- Password must be set (even if blank)
- Try exporting again from Keychain Access

### Issue: "Can't sign in to Apple Developer"
**Solution:** Enable 2FA on your Apple ID, then create an App-Specific Password at https://appleid.apple.com

---

## 💡 Recommended Approach

**For Quick Testing:**
→ Use METHOD 1 (Manual) to get your first build up

**For Production:**
→ Use METHOD 3 (GitHub Actions) to automate future builds and save $29/month

---

## 📞 Need More Help?

**Apple Developer Support:**
- https://developer.apple.com/support/
- Phone: 1-800-633-2152 (US)

**Ionic Appflow Support:**
- Chat in Appflow dashboard (bottom-right)
- Forum: https://forum.ionicframework.com/

**Fastlane Docs:**
- https://docs.fastlane.tools/

---

## ✅ Checklist Before Building

- [ ] Apple Developer account active ($99/year paid)
- [ ] Distribution Certificate created
- [ ] App ID registered: `com.wastelandzero.app`
- [ ] Provisioning Profile downloaded
- [ ] Certificate converted to .p12 with password
- [ ] All files uploaded to Appflow OR GitHub Secrets configured

---

**Once you have the certificates, trigger a build in Appflow and it should work!**

Let me know which method you want to try, and I can guide you through it step-by-step.

# 🎨 Wasteland Zero - App Icon Design Specification

## Icon Concept

**Main Theme:** Post-apocalyptic roguelite with D20 dice mechanics

---

## Design Specifications

### Primary Element: D20 Dice
- **Position:** Center of icon
- **Style:** 3D rendered or illustrated
- **Color:** Glowing orange (#FF6B35) with bright highlights
- **Details:** 
  - Show the "20" face prominently
  - Add subtle inner glow effect
  - Cast shadow on background
  - Weathered/worn texture (post-apocalyptic)

### Secondary Element: Radiation Symbol
- **Position:** Behind or overlapping the dice
- **Style:** Hazard symbol (☢️)
- **Color:** Teal/cyan (#4ECDC4) for contrast
- **Opacity:** 40-60% to not overpower dice
- **Effect:** Subtle glow or neon effect

### Background
- **Base Color:** Dark brown/charcoal (#1a1410)
- **Gradient:** Subtle radial gradient from center
- **Texture:** Grunge/distressed texture overlay (optional)
- **Skyline:** Silhouette of destroyed city buildings at bottom
  - Very subtle, low opacity (20-30%)
  - Orange glow on horizon

---

## Color Palette

```
Primary Colors:
• Dice: #FF6B35 (Burnt Orange)
• Glow: #FFE066 (Golden Yellow)
• Radiation: #4ECDC4 (Turquoise)

Background:
• Dark Brown: #1a1410
• Accent Brown: #2d1810
• Horizon Glow: #d4a44a (Golden Amber)

Accents:
• Shadow: #000000 at 60% opacity
• Highlights: #FFFFFF at 40% opacity
```

---

## Technical Requirements

### For iOS App Store:
- **Size:** 1024x1024 pixels
- **Format:** PNG (no transparency allowed)
- **Color Space:** sRGB
- **No rounded corners** (iOS adds them automatically)
- **Safe zone:** Keep important elements 10% from edges

### Additional Sizes Needed:
All generated automatically by tools, but good to have:
- 180x180 (iPhone)
- 167x167 (iPad Pro)
- 152x152 (iPad)
- 120x120 (iPhone)
- 76x76 (iPad)

---

## Design Options

### Option A: Glowing Dice (Recommended)
```
[Centered large D20 dice]
- Front-facing, showing "20"
- Strong orange glow
- Radiation symbol subtly behind
- Dark wasteland background
- City ruins silhouette at bottom
```

### Option B: Dice + Skull
```
[D20 dice with skull overlay]
- Dice at center
- Stylized skull emerging from behind
- Radiation hazard incorporated into skull design
- More "death/roguelike" vibe
```

### Option C: Reality Rift Portal
```
[Swirling portal with dice]
- Circular rift/vortex effect
- Dice floating in center
- Teal/purple cosmic energy
- Post-apocalyptic elements around edges
```

---

## Quick Creation Methods

### Method 1: Use AppIcon.co (5 minutes)
1. Go to: https://appicon.co
2. Upload a 1024x1024 source image
3. Automatically generates all required sizes
4. Download and add to Xcode

**Source Image Options:**
- Find on Unsplash/Pexels
- Commission on Fiverr ($5-20)
- Create in Canva (free)

### Method 2: Canva Template (15 minutes)
1. Go to: https://canva.com
2. Create design → Custom size 1024x1024
3. Search templates: "game app icon"
4. Customize:
   - Add D20 dice graphic
   - Add text "W0" or radiation symbol
   - Use dark brown background
   - Apply orange/teal color scheme
5. Download as PNG

### Method 3: Hire Designer (1-2 days)
**Fiverr ($5-50):**
- Search: "app icon design"
- Share this document with designer
- Turnaround: 24-48 hours
- Budget options: $5 (basic), $20 (professional), $50 (premium)

**Recommended sellers:**
- Look for 5-star reviews
- Check portfolio for gaming icons
- Request iOS-specific sizing

### Method 4: AI Image Generators (When quota resets)
**Midjourney:** `/imagine app icon, glowing orange D20 dice, radiation symbol, dark wasteland background, high detail, no text`

**DALL-E:** "iOS app icon for post-apocalyptic dice game, featuring glowing D20 dice in center, radiation symbol, destroyed city silhouette, orange and teal colors, square format, no text"

**Stable Diffusion:** Use same prompt as DALL-E

---

## Icon Do's and Don'ts

### ✅ DO:
- Keep design simple and recognizable
- Use high contrast colors
- Make dice the clear focal point
- Ensure icon looks good at small sizes (check at 60x60)
- Use square format (no rounded corners)
- Apply consistent lighting/shadows

### ❌ DON'T:
- Add small text (unreadable at small sizes)
- Use too many elements (cluttered)
- Use photos (illustrated/rendered works better)
- Make it too dark (needs to pop on screen)
- Use gradients that are too subtle
- Forget to test at small sizes

---

## Testing Your Icon

**Before submitting to App Store:**

1. **Small Size Test:** View at 60x60 pixels
   - Is the dice still recognizable?
   - Are colors distinct?
   - Does it stand out?

2. **Context Test:** Place on home screen mockup
   - Does it look good next to other apps?
   - Is it visually distinct?
   - Does it represent the game well?

3. **Different Backgrounds:** Test on:
   - White background
   - Black background
   - Colorful wallpaper

4. **Device Test:** View on actual iPhone/iPad
   - Take screenshot of home screen
   - Does it catch your eye?

---

## Reference Images to Find

Search for inspiration:
- "D20 dice icon"
- "post-apocalyptic game icon"
- "roguelike RPG app icon"
- "dice game logo"
- "wasteland game icon"

**Games with similar icons:**
- Slay the Spire
- Dicey Dungeons
- Hades
- Dead Cells
- Fallout Shelter

---

## Temporary Placeholder

If you need to build NOW and don't have icon yet:

**Quick Placeholder:**
1. Create 1024x1024 solid dark brown square
2. Add large white "W0" text in center (Bangers font)
3. Add small "🎲💀" emojis below text
4. Use this to test build
5. Replace before App Store submission

---

## Once You Have the Icon

**Add to Xcode:**
1. Open Xcode
2. Navigate to: `ios/App/App/Assets.xcassets/AppIcon.appiconset`
3. Drag your 1024x1024 PNG into "App Store iOS 1024pt" slot
4. Xcode automatically resizes for all needed sizes
5. Build and test on device

**Verify:**
- Icon appears on home screen
- No pixelation or distortion
- Colors look correct
- Edges are clean (no weird borders)

---

## Budget Breakdown

**Free Options:**
- Canva (DIY) - $0, 30 mins
- AppIcon.co (with existing image) - $0, 5 mins
- Use game screenshot + filter - $0, 10 mins

**Paid Options:**
- Fiverr basic - $5, 24-48 hours
- Fiverr premium - $20-50, 24-48 hours
- Professional designer - $100-500, 3-7 days

**Recommended for indie game:** 
Fiverr $20 option = Good quality, fast turnaround

---

## Contact a Designer Template

**Message to send on Fiverr:**

```
Hi! I need an iOS app icon (1024x1024 PNG) for my mobile game.

Game: Wasteland Zero - Post-apocalyptic roguelite RPG
Style: Dark, gritty, gaming aesthetic

Requirements:
- Main element: Glowing orange D20 dice (showing "20")
- Secondary: Subtle radiation symbol (teal/cyan)
- Background: Dark brown/black with destroyed city silhouette
- Color scheme: Orange (#FF6B35), Teal (#4ECDC4), Dark brown (#1a1410)
- No text on icon
- Must look good at small sizes
- Square format, no rounded corners

Budget: $20
Timeline: 48 hours

Can you do this? Please share similar work if you have it.

Thanks!
```

---

## Icon Checklist

Before submission:
- [ ] 1024x1024 PNG format
- [ ] sRGB color space
- [ ] No transparency
- [ ] No rounded corners
- [ ] Recognizable at 60x60
- [ ] High contrast colors
- [ ] Represents game theme
- [ ] Tested on actual device
- [ ] Looks good on various backgrounds
- [ ] No copyright issues (if using external assets)

---

**I recommend: Use Canva's free templates or hire on Fiverr for $20. Should take 1-2 days max!**

**Alternative:** If you're in a rush, create a simple geometric version yourself:
1. Dark brown square
2. Large orange circle (dice face)
3. White "20" in center
4. Teal radiation symbol behind
5. Done in 10 minutes!

# 🐛 Combat Damage Investigation - Level 1 Issue

## User Report
- **Issue:** Player dealing 500+ damage at Level 1
- **Expected:** ~20-30 damage at Level 1
- **Status:** NEEDS INVESTIGATION

## Current Damage Formula (Line 2128)
```javascript
let dmg = Math.round((this.getWeaponAtk() + s[offStat.key] * 1.5) * (0.8 + Math.random() * 0.4) * advantageMult * hitMult);
```

## Expected Level 1 Damage (Warrior Example)
- **Weapon ATK:** 12 (Iron Fist)
- **STR:** 8
- **Calculation:** (12 + 8×1.5) × 0.8-1.2 = 24 × 0.8-1.2 = **19-29 damage**
- **With crit (×2):** **38-58 damage**

## Possible Causes of 500+ Damage

### 1. Gear Multipliers (Most Likely)
- User may have high-tier gear equipped
- Celestial gear (+ATK bonuses)
- Multiple ATK stacking items
- **Check:** `getWeaponAtk()` function (line 1383)

### 2. Advanced Class Bonuses
- Damage multipliers from advanced classes
- Flat ATK bonuses (+4, +6 from skills)
- **Check:** Lines 1392-1397

### 3. Advantage Multiplier Bug
- `_getAdvantageMultiplier()` may be returning inflated values
- **Check:** This function's implementation

### 4. Status/Buff Stacking
- Burn damage bonus (×1.25)
- Void Touched bonus (×1.6)
- Multiple effects stacking multiplicatively
- **Check:** Lines 2131-2155

### 5. Trait/Perk Amplification
- "Slippery" trait (flee always succeeds, no dice check needed)
- "Iron Nerves" (Nat 1 fumbles 55% vs 30%)
- Other perks may have unintended damage scaling

## Debug Steps

### Step 1: Check User's Gear
```bash
# View player's equipped gear in console
console.log(G.state.equip);
console.log('Weapon ATK:', G.getWeaponAtk());
```

### Step 2: Check Advantage Multiplier
```bash
# During combat
console.log('Advantage Mult:', G._getAdvantageMultiplier());
```

### Step 3: Check Advanced Class Effects
```bash
console.log('Flat ATK:', G.state.flatAtk);
console.log('Advanced Classes:', G.state.advancedClasses);
```

### Step 4: Test Fresh Level 1 Character
- Start completely new game
- Select Warrior (base STR:8, weapon ATK:12)
- Enter first combat
- Record actual damage dealt

## Temporary Workaround
If the issue is confirmed to be gear-based:
- Check if user has legacy save with overpowered gear
- May need to implement gear tier scaling caps
- Or add damage normalization at low levels

## Follow-Up Required
- [ ] User needs to test a **brand new Level 1 character**
- [ ] Report exact damage numbers + combat log
- [ ] Check if issue persists on fresh save
- [ ] Provide screenshot of equipped gear if issue continues

---

**Note:** The enemy scaling buff (0.12 → 0.25) is working correctly. The issue is player damage output, not enemy weakness.

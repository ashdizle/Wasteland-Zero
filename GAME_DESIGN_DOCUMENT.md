# WASTELAND ZERO
## Game Design Document (GDD)
### Version 26 | Post-Apocalyptic Roguelite RPG

---

## 📋 DOCUMENT INFORMATION

**Game Title:** Wasteland Zero  
**Genre:** Roguelite RPG, Turn-Based Combat  
**Platform:** Web Browser (Desktop & Mobile)  
**Target Audience:** Ages 13+, Roguelike fans, Tabletop RPG players  
**Monetization:** Free-to-play with optional cosmetic purchases  
**Development Status:** LIVE  
**Version:** v26  
**Last Updated:** January 2025  

---

## 🎮 EXECUTIVE SUMMARY

Wasteland Zero is a post-apocalyptic roguelite RPG that combines classic tabletop D20 combat mechanics with modern roguelike progression systems. Players navigate a procedurally-generated wasteland, fight mutants and raiders, discover Reality Rifts, and compete on global leaderboards. The game features permadeath with meta-progression, ensuring each death contributes to future runs.

**Core Hook:** "Every fight is a dice roll. Every death matters. Every rift changes everything."

---

## 🎯 GAME PILLARS

### 1. Strategic Risk Management
Players must weigh risks vs rewards in every decision:
- Engage enemies or flee?
- Enter Reality Rifts or play safe?
- Spend caps on gear or save for later?

### 2. Tabletop Meets Digital
D20 combat brings tabletop RPG feel to browser gaming:
- Roll for attacks, dodges, and critical hits
- Stats modify dice rolls
- Luck matters, but skill wins

### 3. Meaningful Progression
Death is permanent, but progress carries over:
- Unlock new character classes
- Discover permanent stat boosts
- Expand the loot pool

### 4. Competitive Replayability
Global leaderboards drive engagement:
- Track XP, Caps, Rifts, and Boss kills
- Compete for #1 position
- Share achievements socially

---

## 🌍 SETTING & STORY

### World
The year is unknown. Civilization collapsed decades ago after [THE EVENT]. What remains is a radioactive wasteland where survivors scavenge ruins, mutants roam freely, and reality itself is unstable.

**Territories:**
1. **Rust Belt** - Decaying industrial zones with scrap and machinery
2. **Dead City** - Urban ruins overrun by mutants
3. **The Wastes** - Endless radioactive desert
4. **Crater Zone** - Ground zero, where reality is thin

### Narrative Approach
**Emergent Storytelling:** No linear plot. Stories emerge from:
- Player decisions
- Random Reality Rift events
- Boss encounters
- Survival achievements

Each run is unique. Players create their own legend.

---

## 🎲 CORE MECHANICS

### 1. D20 Combat System

**Turn-Based Combat:**
- Player acts first (unless ambushed)
- Actions: Attack, Power Attack, Brace, VATS, Flee

**Dice Rolling:**
```
Attack Roll = D20 + Attack Stat + Weapon Bonus
Hit if: Attack Roll > Enemy Defense

Damage = Base Damage + (D20 * Damage Multiplier)
Critical Hit (Roll 20): 2x damage
Critical Fail (Roll 1): Fumble, lose turn
```

**Combat Actions:**

| Action | Effect | Cost |
|--------|--------|------|
| **Attack** | Standard attack | Free |
| **Power Attack** | High risk/reward (+50% damage, -2 accuracy) | Free |
| **Brace** | +Defense, skip attack | Free |
| **VATS** | Target specific body parts | 25 AP |
| **Flee** | 50% chance to escape | End turn |

**VATS Targeting:**
- Head: +Critical chance, -Accuracy
- Torso: Balanced
- Legs: Lower damage, +Accuracy
- Arms: Disarm enemy

---

### 2. Reality Rifts

**What Are They?**
Mysterious tears in spacetime that appear randomly on the map. Stepping through offers 3 choices with random outcomes.

**Mechanics:**
- Cost: 50-100 Caps to enter
- Choose 1 of 3 paths (randomly generated)
- Outcomes: Powerful boons OR devastating curses
- Never the same twice

**Example Rift Choices:**
```
PATH 1: "The Healing Light"
→ Gain +50 HP OR Lose all armor

PATH 2: "The Whisper of Power"  
→ +5 Attack permanently OR Take 30 damage

PATH 3: "The Gambler's Bargain"
→ Double your Caps OR Lose half your Caps
```

**Strategic Depth:**
- High risk = high reward
- Low HP? Avoid rifts
- Desperate? Risk it all

---

### 3. Character Progression

**Leveling:**
- Gain XP from kills, exploration, quests
- Level cap: 20
- Each level: Choose 1 perk + stat increase

**XP Curve (Slowed):**
```
Level 1→2: 100 XP
Level 2→3: 220 XP
Level 3→4: 363 XP
Level 4→5: 533 XP
...
Level 19→20: 5,700 XP
```

**Stat Growth:**
- HP: +10 per level
- Attack: +1 per level
- Defense: +1 per level

**Perks (Examples):**
- **Iron Skin:** +10% Defense
- **Critical Eye:** +5% Crit chance
- **Scavenger:** +25% Caps from enemies
- **Rad Resistant:** -50% radiation damage
- **Quick Draw:** +10% Flee chance

---

### 4. Loot System

**Rarity Tiers:**
1. **Common** (Gray) - Basic gear
2. **Uncommon** (Green) - +10-20% stats
3. **Rare** (Blue) - +25-40% stats, special effects
4. **Epic** (Purple) - +50-75% stats, powerful effects
5. **Legendary** (Gold) - +100%+ stats, game-changing

**Loot Sources:**
- Enemy drops (scaled to level)
- Chests (hidden on map)
- Merchant shops
- Boss kills (guaranteed Rare+)
- Reality Rifts (random)

**Item Types:**
- Weapons (Melee, Ranged, Energy)
- Armor (Head, Chest, Legs)
- Accessories (Rings, Amulets)
- Consumables (Stimpaks, Rad-X, Buffs)

---

### 5. Economy

**Currency: Caps** (Bottle caps, post-apocalypse standard)

**Earning Caps:**
- Kill enemies: 5-50 Caps
- Loot chests: 10-100 Caps
- Complete quests: 50-200 Caps
- Sell items: 50% of value

**Spending Caps:**
- Merchants: Buy gear (50-500 Caps)
- Reality Rifts: Entry fee (50-100 Caps)
- Healing: Stimpaks (25 Caps)
- Upgrades: Stat boosts (100-500 Caps)

**Balance Goal:** Scarcity early, abundance late

---

## 👥 CHARACTER ARCHETYPES (Classes)

### 1. Wasteland Warrior
**Role:** Tank / Melee DPS  
**Starting Stats:**
- HP: 120
- Attack: 12
- Defense: 10

**Special Ability:** "Berserker Rage"  
- +50% damage when HP < 30%

**Playstyle:** Frontline brawler, high survivability

---

### 2. Scrap Engineer
**Role:** Tech Specialist / Crafter  
**Starting Stats:**
- HP: 80
- Attack: 8
- Defense: 8

**Special Ability:** "Salvage Master"  
- +50% Caps from loot
- +25% better crafting

**Playstyle:** Economic advantage, gear upgrades

---

### 3. Shadow Runner
**Role:** Stealth / Critical Striker  
**Starting Stats:**
- HP: 90
- Attack: 14
- Defense: 6

**Special Ability:** "Backstab"  
- First attack: Auto-crit

**Playstyle:** High damage, glass cannon

---

### 4. Rad Shaman
**Role:** Support / Radiation Mage  
**Starting Stats:**
- HP: 70
- Attack: 10
- Defense: 7

**Special Ability:** "Rad Heal"  
- Convert radiation to HP

**Playstyle:** Sustain, DoT damage

---

### 5. Bounty Hunter
**Role:** DPS / Gold Farmer  
**Starting Stats:**
- HP: 100
- Attack: 11
- Defense: 8

**Special Ability:** "Trophy Hunter"  
- +100% Caps from boss kills
- +10% damage vs bosses

**Playstyle:** Boss specialist, economy

---

## 👾 ENEMIES & BOSSES

### Enemy Types

**Tier 1: Early Game (Levels 1-5)**
- **Radroach:** 20 HP, 5 ATK - Weak insect
- **Feral Dog:** 30 HP, 8 ATK - Fast, low defense
- **Raider Scum:** 40 HP, 10 ATK - Basic humanoid

**Tier 2: Mid Game (Levels 6-12)**
- **Mutant Brute:** 80 HP, 15 ATK - Heavy hitter
- **Glowing One:** 60 HP, 12 ATK - Radiation damage
- **Raider Veteran:** 70 HP, 18 ATK - Armored

**Tier 3: Late Game (Levels 13-20)**
- **Deathclaw:** 150 HP, 25 ATK - Elite predator
- **Synth Assassin:** 120 HP, 30 ATK - High crit
- **Warlord:** 200 HP, 35 ATK - Boss-tier enemy

---

### Boss Fights

#### Boss 1: The Bloated King
**Location:** Dead City sewers  
**HP:** 300  
**Mechanics:**
- Summons 2 Radroaches every 3 turns
- Poison attack: 10 damage/turn for 3 turns
- Enrage at 50% HP: +50% attack

**Rewards:**
- 200 Caps
- 1 Epic weapon
- 500 XP

---

#### Boss 2: Razorclaw
**Location:** The Wastes  
**HP:** 400  
**Mechanics:**
- Bleed attack: 15 damage/turn
- Pounce: 2x damage, ignore defense
- Regenerates 20 HP/turn when HP < 25%

**Rewards:**
- 300 Caps
- 1 Legendary armor
- 800 XP

---

#### Boss 3: Scrap Titan
**Location:** Rust Belt factory  
**HP:** 500  
**Mechanics:**
- Armor plating: -50% damage until destroyed
- Laser barrage: 3 attacks in 1 turn
- Self-repair: +100 HP at 30% HP (once)

**Rewards:**
- 500 Caps
- 1 Legendary weapon
- 1200 XP

---

#### Boss 4: Neon Phantom
**Location:** Crater Zone  
**HP:** 350  
**Mechanics:**
- Phase shift: 50% dodge chance
- Reality warp: Random status effect each turn
- Summons Reality Rift mid-fight

**Rewards:**
- 400 Caps
- 1 Legendary accessory
- 1000 XP

---

## 🗺️ MAP & EXPLORATION

### Map Generation
**Procedural Grid:** 10x10 tiles per zone

**Tile Types:**
- **Empty:** Safe, nothing happens
- **Enemy:** Combat encounter
- **Chest:** Loot container
- **Merchant:** Buy/sell items
- **NPC:** Quest giver
- **Rift:** Reality Rift entrance
- **Boss:** Boss fight (1 per zone)

**Fog of War:** Tiles reveal as player moves

---

## 🏆 META-PROGRESSION

### Permanent Unlocks

**Character Classes:**
- Start: 3 classes unlocked
- Unlock 5 more via achievements

**Perks:**
- Discover new perks through gameplay
- Carry over to future runs

**Loot Pool:**
- New items added to pool as you progress
- Legendary items unlock via boss kills

**Starting Bonuses:**
- Unlock better starting gear
- Begin with extra Caps
- Higher base stats

---

## 🎮 MONETIZATION

### Free-to-Play Core
**100% of gameplay is free:**
- All classes (after unlock)
- All content (bosses, zones, items)
- 3 save slots
- Unlimited playtime

### Premium Store (Optional)

**1. Premium Unlock - $4.99**
- Remove branding
- Exclusive title screen
- Priority support

**2. Cosmetic Packs - $2.99 each**
- Cyberpunk Portrait Pack
- Neon Apocalypse Portrait Pack

**3. Time-Savers - $0.99 each**
- 24h XP Boost (+50% XP)
- 24h Loot Boost (+25% drop quality)
- 24h Caps Boost (+50% currency)

**4. Mega Boost Bundle - $1.99**
- All 3 boosts for 24h
- Save 33%

**5. Extra Save Slots - $1.99**
- Unlock slots 4, 5, 6

**6. Season Pass - $9.99**
- 50 tiers of rewards
- Exclusive cosmetics
- 3-month duration

**Monetization Philosophy:**
- **No pay-to-win** - All purchases are cosmetic or time-savers
- **No ads** - Clean experience
- **Fair pricing** - Average $0.99-$4.99

---

## 📊 GAME LOOP

### Core Loop (10-30 min session)
```
1. Choose character class
2. Explore map
3. Fight enemies
4. Collect loot
5. Level up
6. Face boss
7. Die (permadeath)
8. Unlock permanent progress
9. Repeat with new build
```

### Meta Loop (Hours to weeks)
```
1. Master one class
2. Unlock new classes
3. Discover all bosses
4. Climb leaderboards
5. Complete achievements
6. Chase perfect run
```

---

## 🏆 LEADERBOARDS & SOCIAL

### Leaderboard Categories
1. **Total XP** - Who leveled highest
2. **Caps Earned** - Economic mastery
3. **Reality Rifts Discovered** - Risk-taker
4. **Deepest Level Reached** - Survival
5. **Bosses Killed** - Combat prowess

### Social Features
- **Global Rankings** - See top 10 worldwide
- **Share Achievements** - Post to social media
- **Newsletter** - Get updates on new content
- **Community Challenges** - Timed events

---

## 🛠️ TECHNICAL SPECIFICATIONS

### Frontend
- **Engine:** Vanilla JavaScript (6,900+ lines)
- **Rendering:** HTML5 + CSS3
- **Storage:** LocalStorage for save games
- **Platform:** Browser-based (Chrome, Firefox, Safari)

### Backend
- **Framework:** FastAPI (Python)
- **Database:** MongoDB
- **APIs:** 
  - `/api/leaderboard/*` - Rankings
  - `/api/newsletter/*` - Email capture
  - `/api/payments/*` - Stripe integration

### Hosting
- **Frontend:** Served from `/app/frontend/public/`
- **Backend:** Port 8001 (Kubernetes ingress)
- **Database:** MongoDB (local)

---

## 🎨 ART STYLE

**Visual Direction:** Comic book post-apocalyptic

**Color Palette:**
- Primary: Burnt orange (#d4a44a)
- Secondary: Toxic green (#a8c4d4)
- Accent: Blood red (#d32f2f)
- Background: Dark brown (#1a1410)

**Art Assets:**
- Character portraits: 64x64 pixel art
- Enemy sprites: 32x32 to 64x64
- Icons: 16x16 to 24x24
- UI: Hand-drawn borders and buttons

**Typography:**
- Titles: "Bangers" (Google Font)
- Body: "Share Tech Mono" (monospace)

---

## 🔊 AUDIO DESIGN

**Music:**
- Main menu: Ambient wasteland atmosphere
- Combat: Tense, rhythmic percussion
- Boss fights: Epic orchestral metal
- Victory: Triumphant fanfare

**Sound Effects:**
- Dice roll: Physical dice clatter
- Combat hits: Meaty impact sounds
- Level up: Satisfying "ding"
- Reality Rift: Cosmic whoosh

---

## 📈 ANALYTICS & KPIs

### Key Metrics to Track

**Engagement:**
- Daily Active Users (DAU)
- Average Session Length (target: 15-25 min)
- Retention (Day 1, Day 7, Day 30)

**Monetization:**
- Conversion Rate (free → paid)
- Average Revenue Per User (ARPU)
- Lifetime Value (LTV)

**Gameplay:**
- Average run length (target: 20-30 min)
- Boss kill rate (balance indicator)
- Rift engagement rate
- Death causes (balance indicator)

---

## 🚀 ROADMAP & FUTURE CONTENT

### Season 2 (Q2 2025)
- 3 new character classes
- 2 new boss fights
- 5 new Reality Rift types
- Seasonal leaderboard
- 50 new cosmetic rewards

### Quality of Life (Q1 2025)
- Rebind controls
- Colorblind mode
- Audio sliders
- Speed mode (2x combat)

### Community Requests
- Daily challenges
- Clan system
- Multiplayer co-op (maybe?)
- Mod support (long-term)

---

## 🎯 TARGET AUDIENCE

### Primary Audience
- **Age:** 18-35
- **Gender:** 60% male, 40% female
- **Interests:** Roguelikes, tabletop RPGs, retro gaming
- **Platform:** Desktop gamers (70%), mobile (30%)

### Secondary Audience
- Casual gamers looking for quick sessions
- Streamers (high replayability)
- Tabletop RPG players

---

## 📚 DESIGN REFERENCES

**Influences:**
- **Slay the Spire** - Card combat, meta-progression
- **FTL: Faster Than Light** - Random events, permadeath
- **Darkest Dungeon** - Risk management, stress
- **Fallout series** - Setting, VATS system
- **D&D / Tabletop RPGs** - Dice mechanics, stats

---

## ✅ LAUNCH CHECKLIST

- [x] Core combat system
- [x] 5 character classes
- [x] 4 boss fights
- [x] Reality Rift system
- [x] Loot & economy
- [x] Global leaderboards
- [x] Newsletter system
- [x] Stripe payments (LIVE)
- [x] Mobile optimization
- [x] Tutorial/guide system
- [ ] Daily challenges
- [ ] Achievements UI
- [ ] Steam integration (future)

---

## 📞 CREDITS & CONTACT

**Developer:** [Your Name]  
**Website:** [Your URL]  
**Support:** [Your Email]  
**Discord:** [Community Link]

**Special Thanks:**
- Playtesters
- Early supporters
- The roguelike community

---

## 📄 VERSION HISTORY

**v26 (Current - January 2025)**
- Leaderboards added
- Newsletter system
- Stripe Live payments
- XP curve rebalanced
- D-Pad removed
- Dice UI overflow fixed

**v25 (December 2024)**
- Premium Store integration
- Reality Rifts system
- Boss fights polished

**v1-24 (Development)**
- Core systems built
- Content creation
- Balance testing

---

**END OF GAME DESIGN DOCUMENT**

This document represents Wasteland Zero as of January 2025.  
For the latest updates, visit [Your URL].

**Survive the wasteland. Die with honor. Become a legend.** 💀🎲

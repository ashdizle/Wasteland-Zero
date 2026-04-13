# WASTELAND ZERO
## Complete Game Breakdown - Every Detail Documented
### Master Technical & Design Document

---

# TABLE OF CONTENTS

1. [Executive Overview](#executive-overview)
2. [Game Design Philosophy](#game-design-philosophy)
3. [Core Gameplay Systems](#core-gameplay-systems)
4. [Combat System - Complete Breakdown](#combat-system)
5. [Character Classes - Full Specifications](#character-classes)
6. [Enemy Database - Complete Stats](#enemy-database)
7. [Boss Encounters - Full Mechanics](#boss-encounters)
8. [Loot & Economy System](#loot-economy)
9. [Progression & Meta-Systems](#progression-systems)
10. [Reality Rifts - Complete System](#reality-rifts)
11. [Map & Exploration](#map-exploration)
12. [User Interface & UX](#ui-ux)
13. [Technical Architecture](#technical-architecture)
14. [Code Structure & Files](#code-structure)
15. [API Documentation](#api-documentation)
16. [Database Schema](#database-schema)
17. [Art & Visual Design](#art-design)
18. [Audio Design](#audio-design)
19. [Monetization Strategy](#monetization)
20. [Marketing & Launch](#marketing)
21. [Analytics & Metrics](#analytics)
22. [Testing & Quality Assurance](#testing)
23. [Roadmap & Future Content](#roadmap)
24. [Appendices](#appendices)

---

# EXECUTIVE OVERVIEW

## Game Identity

**Title:** Wasteland Zero  
**Tagline:** "Every fight is a dice roll. Every death matters. Every rift changes everything."  
**Genre:** Roguelite RPG, Turn-Based Combat, Post-Apocalyptic Survival  
**Platform:** Web Browser (HTML5/JavaScript)  
**Target Devices:** Desktop (Chrome, Firefox, Safari, Edge), Mobile (iOS Safari, Android Chrome)  
**Version:** v26 (Live Production)  
**Release Date:** January 2025  
**Development Status:** Live & Monetized  
**Business Model:** Free-to-Play + Optional Premium Store  

## Game Summary

Wasteland Zero is a post-apocalyptic roguelite RPG that merges tabletop D20 combat mechanics with modern roguelike progression. Players control survivors navigating a procedurally-generated wasteland, engaging in turn-based dice-roll combat, discovering Reality Rifts (random interdimensional events), and competing globally on leaderboards. Permadeath ensures high stakes, while meta-progression creates long-term engagement.

## Core Pillars

1. **Strategic Risk Management** - Every decision (combat, rifts, purchases) carries weight
2. **Tabletop-Digital Fusion** - D20 mechanics bring familiar RPG feel to browsers
3. **Meaningful Death** - Permadeath with persistent unlocks
4. **Competitive Social Layer** - Global leaderboards drive replayability

## Key Differentiators

- **Zero Friction Entry** - Browser-based, no download, instant play
- **Fair Monetization** - 100% free gameplay, cosmetic-only purchases
- **D20 Combat** - Unique dice-based system vs standard roguelike combat
- **Reality Rifts** - High-risk/high-reward events unlike typical roguelike events
- **Mobile-First UI** - Fully playable on phones/tablets

---

# GAME DESIGN PHILOSOPHY

## Design Vision

Create a roguelite that honors tabletop RPG roots while delivering modern, frictionless gameplay accessible to both hardcore roguelike fans and casual players.

## Design Constraints

1. **Browser Performance** - Must run 60fps on mid-tier devices
2. **Session Length** - Optimal 15-25 minute runs for mobile play
3. **Learning Curve** - Core mechanics understandable in <5 minutes
4. **Monetization Ethics** - Zero pay-to-win, transparent pricing

## Player Psychology

**Target Emotions:**
- **Tension** - D20 rolls create "will it hit?" moments
- **Relief** - Surviving combat/rifts via lucky rolls
- **Regret** - "If only I'd rolled higher..." drives retry psychology
- **Progression Satisfaction** - Unlocks feel earned, not grinded

**Reward Schedules:**
- **Fixed-Ratio** - XP every X kills (predictable)
- **Variable-Ratio** - Loot drops (unpredictable, high engagement)
- **Meta-Unlocks** - Long-term goals (100+ runs to unlock all classes)

---

# CORE GAMEPLAY SYSTEMS

## Session Structure

### Pre-Run Phase
1. **Character Selection** - Choose from unlocked classes
2. **Loadout Customization** - Select starting perks (if unlocked)
3. **Run Briefing** - Territory selection (if unlocked)

### Core Loop (15-30 minutes)
```
[START] → Character Creation
   ↓
Explore Map (10x10 grid)
   ↓
Encounter Events:
   • Combat (70%)
   • Loot Chest (15%)
   • Merchant (10%)
   • Reality Rift (5%)
   ↓
Level Up (every ~3 combats)
   ↓
Boss Fight (end of territory)
   ↓
[DEATH] → Meta-Progression Screen
   ↓
[RESTART]
```

### Post-Run Phase
1. **Death Summary** - Stats, achievements, rank
2. **Meta-Unlocks** - New classes, perks, items revealed
3. **Leaderboard Update** - Global rank displayed
4. **Retry Prompt** - Immediate restart or quit

---

# COMBAT SYSTEM - COMPLETE BREAKDOWN

## Turn Structure

### Initiative
- **Player always acts first** (unless "Ambushed" status from rift)
- **Enemy acts after player action resolves**

### Action Phase Breakdown

**1. Player Input**
- Choose action: Attack / Power Attack / Brace / VATS / Flee
- System displays success probabilities
- Player confirms action

**2. Dice Roll**
- Visual D20 spin animation (1.2 seconds)
- Number reveals with sound effect
- Modifier calculations apply

**3. Resolution**
- Hit/Miss determined
- Damage calculated (if hit)
- HP bars update with animation
- Floating damage numbers appear

**4. Enemy Response**
- AI selects action (weighted by HP%)
- Enemy dice roll
- Player dodge check (D20 + Defense vs Enemy Attack)
- Damage resolution

**5. Status Effects**
- Burn/Bleed/Poison tick damage
- Buffs/Debuffs countdown
- Effect removal check

**6. Turn End**
- Combat log updates
- Next turn begins (if neither side dead)

## Combat Formulas (Complete)

### Attack Roll
```
Player Attack Roll = D20 + Attack Stat + Weapon Bonus + Perk Modifiers

Hit Success = Attack Roll > Enemy Defense

Critical Hit = Natural 20 (before modifiers)
Critical Fail = Natural 1 (before modifiers)
```

### Damage Calculation
```
Base Damage = Weapon Base Damage + Strength Modifier

Roll Damage = Base Damage × (Dice Result / 10)

Total Damage = Roll Damage × Crit Multiplier × Elemental Multiplier

Critical Multiplier:
  - Normal: 1.0x
  - Critical Hit: 2.0x
  - Backstab (Shadow Runner): 3.0x

Elemental Multipliers:
  - Fire vs Mutant: 1.5x
  - Radiation vs Human: 0.5x
  - Energy vs Synth: 1.25x
```

### Defense Mechanics
```
Enemy Attack Roll = D20 + Enemy Attack Stat

Player Dodge Roll = D20 + Player Defense Stat + Armor Bonus

Dodge Success = Dodge Roll > Enemy Attack Roll

Damage Mitigation:
  - Full Dodge: 0 damage
  - Partial Dodge: 50% damage (if rolls within 3 points)
  - Failed Dodge: 100% damage
  - Braced: +5 Defense, 75% damage reduction
```

### Action-Specific Formulas

**Power Attack:**
```
Attack Roll Penalty: -2
Damage Multiplier: +50%
Formula: (Base Damage × 1.5) × (D20 Roll / 10)
```

**VATS (Targeted Shot):**
```
AP Cost: 25
Head Shot:
  - Accuracy: -3
  - Crit Chance: +15%
  - Damage: 1.5x

Torso Shot:
  - Accuracy: 0
  - Crit Chance: Base
  - Damage: 1.0x

Legs Shot:
  - Accuracy: +3
  - Crit Chance: -5%
  - Damage: 0.75x
  - Special: 25% chance to reduce enemy move speed

Arms Shot:
  - Accuracy: 0
  - Crit Chance: Base
  - Damage: 0.85x
  - Special: 15% chance to disarm weapon (-20% enemy attack)
```

**Flee Attempt:**
```
Flee Roll = D20 + Agility Stat

Flee Success Threshold:
  - Easy Enemy: 8+
  - Normal Enemy: 12+
  - Hard Enemy: 16+
  - Boss: 20 (auto-fail unless crit)

Success: Escape combat, lose 20% current HP
Failure: Enemy gets free attack
```

## Enemy AI Behavior Tree

```
START: Check HP Percentage

IF HP > 70%:
  60% → Standard Attack
  20% → Power Attack
  15% → Special Ability
  5% → Heal (if available)

IF HP 30-70%:
  40% → Standard Attack
  30% → Power Attack
  20% → Special Ability
  10% → Defensive Stance

IF HP < 30%:
  25% → Standard Attack
  25% → Power Attack
  30% → Special Ability
  20% → Flee Attempt (non-boss)

BOSS-SPECIFIC:
  Phase Triggers at HP thresholds
  Summon abilities at 75%, 50%, 25% HP
  Enrage mode at <30% HP
```

## Status Effects System

### Damage Over Time (DOT)

**Burn:**
- Duration: 3 turns
- Damage: 5% max HP per turn
- Source: Fire weapons, Fire Rift
- Visual: Orange flames animation

**Bleed:**
- Duration: 4 turns
- Damage: 3% max HP per turn
- Source: Sharp weapons, Razorclaw boss
- Visual: Red drip animation

**Poison:**
- Duration: 5 turns
- Damage: 2% max HP per turn
- Source: Bloated King, Toxic Rifts
- Visual: Green bubbles

**Radiation:**
- Duration: Permanent (until cured)
- Damage: 1% max HP per turn (stacks up to 10x)
- Source: Glowing enemies, Crater Zone
- Visual: Yellow glow
- Cure: Rad-X consumable

### Buffs

**Attack Up:**
- Duration: 3 turns
- Effect: +25% attack damage
- Source: Perks, consumables

**Defense Up:**
- Duration: 3 turns
- Effect: +5 defense roll bonus
- Source: Brace action, armor perks

**Speed Up:**
- Duration: 5 turns
- Effect: +2 agility, +10% flee chance
- Source: Stimulant consumables

### Debuffs

**Weakened:**
- Duration: 2 turns
- Effect: -30% attack damage
- Source: Enemy special attacks

**Slowed:**
- Duration: 3 turns
- Effect: -3 agility, -20% dodge
- Source: Leg shots, cold effects

**Stunned:**
- Duration: 1 turn
- Effect: Skip next turn
- Source: Crit hits, special abilities

---

# CHARACTER CLASSES - FULL SPECIFICATIONS

## Class 1: Wasteland Warrior

### Identity
**Role:** Tank / Frontline DPS  
**Difficulty:** Easy (Recommended for beginners)  
**Playstyle:** Face-tank damage, rely on high HP pool  
**Best Against:** Single targets, bosses  
**Weak Against:** Swarms, ranged enemies  

### Starting Stats
```
HP: 120 (Highest)
Attack: 12 (High)
Defense: 10 (High)
Agility: 5 (Low)
Luck: 5 (Medium)
```

### Special Ability: "Berserker Rage"
```
Trigger: HP drops below 30%
Effect: +50% attack damage
Duration: Until combat ends or HP restored above 30%
Cooldown: None (passive)
```

### Recommended Perks
1. **Iron Skin** (Level 3) - +10% Defense
2. **Thick Hide** (Level 5) - +15 Max HP
3. **Unyielding** (Level 7) - 50% chance to survive lethal hit with 1 HP
4. **Battle Roar** (Level 10) - Intimidate: 25% chance enemy misses

### Optimal Gear
- **Weapon:** Melee (Sledgehammer, Fire Axe)
- **Armor:** Heavy (Power Armor, Scrap Plate)
- **Accessory:** HP Regen Ring

### Unlock Requirement
**Default Unlocked**

---

## Class 2: Scrap Engineer

### Identity
**Role:** Support / Crafter / Economic Specialist  
**Difficulty:** Medium  
**Playstyle:** Maximize loot, craft upgrades, steady scaling  
**Best Against:** Long runs, resource grinding  
**Weak Against:** Early game aggression  

### Starting Stats
```
HP: 80 (Low)
Attack: 8 (Low)
Defense: 8 (Medium)
Agility: 7 (Medium)
Luck: 7 (High)
```

### Special Ability: "Salvage Master"
```
Passive Effects:
  - +50% Caps from all sources
  - +25% chance for bonus loot drop
  - Merchants offer 15% discount
  
Active Effect (Cooldown 10 turns):
  - Craft weapon/armor from scrap
  - Quality scales with current level
```

### Recommended Perks
1. **Scavenger** (Level 3) - +25% Caps from enemies
2. **Lucky Find** (Level 5) - +10% Rare loot chance
3. **Merchant Friend** (Level 7) - Sell items for 75% value (normally 50%)
4. **Master Crafter** (Level 10) - Crafted items +1 rarity tier

### Optimal Gear
- **Weapon:** Tech (Laser Rifle, Plasma Pistol)
- **Armor:** Medium (Reinforced Jacket)
- **Accessory:** Loot Magnet (increases drop radius)

### Unlock Requirement
**Achieve 5,000 Caps in a single run**

---

## Class 3: Shadow Runner

### Identity
**Role:** Critical Strike DPS / Glass Cannon  
**Difficulty:** Hard  
**Playstyle:** Hit hard, hit first, avoid getting hit  
**Best Against:** High-value targets, stealth scenarios  
**Weak Against:** Prolonged fights, area damage  

### Starting Stats
```
HP: 90 (Medium-Low)
Attack: 14 (Highest)
Defense: 6 (Lowest)
Agility: 12 (Highest)
Luck: 8 (High)
```

### Special Ability: "Backstab"
```
First Attack in Combat:
  - Guaranteed Critical Hit (no roll needed)
  - Damage: 3x multiplier (vs normal 2x)
  - Ignores 50% of enemy defense
  
Cooldown: 1 per combat encounter
```

### Recommended Perks
1. **Critical Eye** (Level 3) - +5% base crit chance
2. **Assassinate** (Level 5) - Crits ignore 100% defense
3. **Ghost** (Level 7) - +15% flee success
4. **Vanish** (Level 10) - After killing enemy, re-enable Backstab

### Optimal Gear
- **Weapon:** Fast (Daggers, SMG)
- **Armor:** Light (Stealth Suit, Leather Jacket)
- **Accessory:** Crit Damage Ring

### Unlock Requirement
**Kill a boss without taking damage**

---

## Class 4: Rad Shaman

### Identity
**Role:** Support / Healer / DoT Specialist  
**Difficulty:** Medium  
**Playstyle:** Sustain through self-healing, radiation synergies  
**Best Against:** Endurance fights, radiation zones  
**Weak Against:** Burst damage, quick kills needed  

### Starting Stats
```
HP: 70 (Lowest)
Attack: 10 (Medium)
Defense: 7 (Low-Medium)
Agility: 6 (Low-Medium)
Luck: 7 (Medium)
```

### Special Ability: "Rad Heal"
```
Passive: Radiation damage converts to healing
  - 100% radiation damage → HP restoration
  - Removes Radiation status effect immediately
  
Active (Cooldown 5 turns):
  - Heal 30% Max HP
  - Apply Radiation DoT to nearby enemies (10 damage/turn × 3 turns)
```

### Recommended Perks
1. **Rad Resistant** (Level 3) - Immune to radiation
2. **Toxic Touch** (Level 5) - Attacks apply poison
3. **Regeneration** (Level 7) - +5 HP per turn
4. **Irradiated** (Level 10) - Enemies take damage when hitting you

### Optimal Gear
- **Weapon:** Radiation (Gamma Gun, Irradiated Blade)
- **Armor:** Hazmat (Rad Suit, Shielded Cloak)
- **Accessory:** Healing Amulet

### Unlock Requirement
**Survive 10 turns with Radiation status active**

---

## Class 5: Bounty Hunter

### Identity
**Role:** Boss Killer / Gold Farmer  
**Difficulty:** Easy-Medium  
**Playstyle:** Focus bosses, maximize Caps rewards  
**Best Against:** Boss fights, economic runs  
**Weak Against:** Mob-heavy encounters  

### Starting Stats
```
HP: 100 (Medium-High)
Attack: 11 (High)
Defense: 8 (Medium)
Agility: 8 (Medium)
Luck: 8 (High)
```

### Special Ability: "Trophy Hunter"
```
Passive Effects:
  - +100% Caps from boss kills
  - +10% damage vs bosses
  - Boss kills drop guaranteed Epic+ item
  
Active (Boss fights only):
  - Mark Target: Next 3 attacks deal +25% damage
  - Cooldown: Once per boss
```

### Recommended Perks
1. **Boss Slayer** (Level 3) - +15% damage vs bosses
2. **Executioner** (Level 5) - +50% damage to enemies <20% HP
3. **Trophy Collection** (Level 7) - Boss kills grant permanent +1 stat
4. **Hunt Master** (Level 10) - Reveal boss location on map

### Optimal Gear
- **Weapon:** High-damage (Sniper Rifle, Rocket Launcher)
- **Armor:** Balanced (Combat Armor)
- **Accessory:** Boss Damage Ring

### Unlock Requirement
**Kill 5 different bosses (across multiple runs)**

---

## Additional Unlockable Classes (Teased)

### Class 6: Mutant Berserker (Season 2)
- HP: 150, Attack: 15, Defense: 12
- Ability: "Mutate" - Transform, gain +100% stats for 5 turns
- Unlock: Reach Level 20

### Class 7: Cyber Assassin (Season 2)
- HP: 85, Attack: 13, Defense: 5, Agility: 15
- Ability: "Digital Ghost" - Phase through attacks (50% dodge)
- Unlock: Complete 50 runs

### Class 8: Wasteland Medic (Season 2)
- HP: 90, Attack: 8, Defense: 9
- Ability: "Emergency Aid" - Full heal, removes all debuffs
- Unlock: Heal 1,000 HP across all runs

---

# ENEMY DATABASE - COMPLETE STATS

## Tier 1: Early Game Enemies (Levels 1-5)

### Radroach
```
Classification: Mutant Insect
HP: 20
Attack: 5
Defense: 3
Agility: 8
XP Reward: 10
Caps Drop: 5-10

Abilities:
  - Bite (Standard attack)
  
Loot Table:
  - 70% Nothing
  - 25% Radroach Meat (Consumable: +5 HP)
  - 5% Common weapon/armor

Spawn Locations:
  - Dead City (40%)
  - Rust Belt (30%)
  - The Wastes (20%)
  - Crater Zone (10%)
  
AI Pattern:
  - Always attacks
  - Flees if HP < 25%
```

---

### Feral Dog
```
Classification: Mutant Animal
HP: 30
Attack: 8
Defense: 4
Agility: 12
XP Reward: 15
Caps Drop: 8-15

Abilities:
  - Lunge (Power Attack: +50% damage, -2 accuracy)
  - Pack Tactics (If multiple dogs: +2 attack each)

Status: Can inflict Bleed (10% chance)

Loot Table:
  - 60% Nothing
  - 30% Dog Tags (Sell for 20 Caps)
  - 10% Uncommon armor (Leather)

Spawn Locations:
  - The Wastes (50%)
  - Rust Belt (30%)
  - Dead City (20%)

AI Pattern:
  - 70% Standard Attack
  - 30% Lunge
  - Never flees
```

---

### Raider Scum
```
Classification: Hostile Human
HP: 40
Attack: 10
Defense: 6
Agility: 7
XP Reward: 25
Caps Drop: 15-30

Abilities:
  - Pistol Shot (Ranged attack, can't be dodged easily)
  - Taunt (Reduces player attack by 10% for 2 turns)

Equipment:
  - Rusty Pistol
  - Torn Leather Jacket

Loot Table:
  - 50% Nothing
  - 30% Caps (bonus 10-20)
  - 15% Uncommon weapon
  - 5% Rare ammo

Spawn Locations:
  - Rust Belt (40%)
  - Dead City (35%)
  - The Wastes (25%)

AI Pattern:
  - 60% Ranged Attack
  - 30% Melee if player close
  - 10% Taunt
  - Flees if HP < 15%
```

---

## Tier 2: Mid Game Enemies (Levels 6-12)

### Mutant Brute
```
Classification: Heavy Mutant
HP: 80
Attack: 15
Defense: 10
Agility: 3
XP Reward: 50
Caps Drop: 25-50

Abilities:
  - Ground Slam (AoE if multiple players)
  - Thick Skin (First hit does 50% damage)

Resistances:
  - Physical: 25%
  - Energy: -25% (weak)

Loot Table:
  - 40% Nothing
  - 35% Uncommon/Rare armor
  - 20% Caps (bonus 20-40)
  - 5% Epic weapon

Spawn Locations:
  - Dead City (45%)
  - Crater Zone (30%)
  - Rust Belt (25%)

AI Pattern:
  - 50% Standard Attack
  - 30% Ground Slam
  - 20% Defensive Stance (+5 Defense, skip attack)
```

---

### Glowing One
```
Classification: Irradiated Mutant
HP: 60
Attack: 12
Defense: 7
Agility: 5
XP Reward: 60
Caps Drop: 30-60

Abilities:
  - Radiation Burst (10 damage, applies Radiation status)
  - Heal (Restores 20 HP, 3 turn cooldown)
  - Death Explosion (On death: 15 damage to player)

Status: Applies Radiation DoT

Resistances:
  - Radiation: Immune
  - Fire: -50% (weak)

Loot Table:
  - 50% Glowing Blood (Sell for 40 Caps)
  - 30% Rare radiation weapon
  - 20% Rad-X (consumable)

Spawn Locations:
  - Crater Zone (60%)
  - Dead City sewers (30%)
  - The Wastes (10%)

AI Pattern:
  - 40% Radiation Burst
  - 40% Standard Attack
  - 20% Heal (if HP < 50%)
```

---

### Raider Veteran
```
Classification: Elite Human
HP: 70
Attack: 18
Defense: 12
Agility: 10
XP Reward: 70
Caps Drop: 40-80

Abilities:
  - Headshot (VATS-like: high crit chance)
  - Grenade Toss (25 damage, ignores defense)
  - Combat Roll (Dodge next attack, 1 use per fight)

Equipment:
  - Combat Rifle
  - Metal Armor

Loot Table:
  - 30% Nothing
  - 40% Rare weapon/armor
  - 20% Caps (bonus 30-60)
  - 10% Epic ammo/consumable

Spawn Locations:
  - Rust Belt (40%)
  - Dead City (35%)
  - Crater Zone (25%)

AI Pattern:
  - 40% Headshot
  - 35% Standard Attack
  - 15% Grenade (if player HP > 50%)
  - 10% Combat Roll (reactive)
```

---

## Tier 3: Late Game Enemies (Levels 13-20)

### Deathclaw
```
Classification: Apex Predator
HP: 150
Attack: 25
Defense: 15
Agility: 14
XP Reward: 150
Caps Drop: 80-150

Abilities:
  - Rend (3 consecutive attacks)
  - Leap (Ignore distance, guarantee hit)
  - Roar (Inflict Fear: -20% player attack for 3 turns)

Status: Can inflict Bleed (heavy)

Resistances:
  - Physical: 30%
  - All other: 0%

Loot Table:
  - 20% Nothing
  - 40% Epic weapon/armor
  - 30% Deathclaw Hide (Rare crafting material)
  - 10% Legendary accessory

Spawn Locations:
  - Crater Zone (50%)
  - The Wastes (deep) (30%)
  - Dead City (boss variant) (20%)

AI Pattern:
  - 40% Rend
  - 30% Leap
  - 20% Standard Attack
  - 10% Roar (once per combat)
  - NEVER flees
```

---

### Synth Assassin
```
Classification: Synthetic Human
HP: 120
Attack: 30
Defense: 18
Agility: 16
XP Reward: 175
Caps Drop: 100-200

Abilities:
  - Precision Strike (Auto-crit, 50% accuracy)
  - Cloak (Invisible for 2 turns, +100% dodge)
  - EMP Blast (Disables player VATS for 5 turns)

Equipment:
  - Energy Blade
  - Synth Armor

Resistances:
  - Energy: 50%
  - Physical: 0%
  - EMP: Immune

Loot Table:
  - 10% Nothing
  - 50% Epic energy weapon
  - 30% Synth Components (Rare crafting)
  - 10% Legendary tech armor

Spawn Locations:
  - Crater Zone (labs) (60%)
  - Dead City (tech district) (40%)

AI Pattern:
  - 35% Precision Strike
  - 30% Cloak (if not on cooldown)
  - 25% Standard Attack
  - 10% EMP Blast
```

---

### Warlord
```
Classification: Boss-Tier Human
HP: 200
Attack: 35
Defense: 20
Agility: 8
XP Reward: 250
Caps Drop: 150-300

Abilities:
  - Dual-Wield (2 attacks per turn)
  - Command (Summon 2 Raider Scum)
  - Execute (If player HP < 30%: instant kill attempt, 50% success)

Equipment:
  - Power Hammer + Combat Shotgun
  - Heavy Raider Armor

Resistances:
  - Physical: 25%
  - Energy: 10%

Loot Table:
  - 5% Nothing
  - 50% Legendary weapon
  - 35% Epic armor (full set)
  - 10% Warlord Trophy (permanent +2 Attack)

Spawn Locations:
  - Rust Belt (fortified base) (50%)
  - Dead City (raider camp) (50%)

AI Pattern:
  - 40% Dual-Wield
  - 30% Standard Attack
  - 20% Command (once at 70% HP, once at 30% HP)
  - 10% Execute (only when triggered)
```

---

# BOSS ENCOUNTERS - FULL MECHANICS

## Boss 1: The Bloated King

### Overview
```
Name: The Bloated King
Title: "Sewer Lord"
Classification: Mutant Abomination
Location: Dead City Sewers (Level 5-7)
HP: 300
Attack: 20
Defense: 12
Agility: 2
XP Reward: 500
Caps Drop: 200
```

### Appearance
Grotesque, bloated humanoid mutant covered in boils and toxic sludge. Wears rusted crown.

### Combat Phases

**Phase 1: The Swarm (100-75% HP)**
```
Behavior:
  - 50% Poison Spit (15 damage + Poison DoT)
  - 30% Standard Attack
  - 20% Summon Radroaches (2 per cast)

Summon Limit: 4 active at once

Strategy:
  - Focus on King or clear adds
  - Poison stacks, use antidotes
```

**Phase 2: Enraged (75-50% HP)**
```
Trigger: HP drops below 75%

Changes:
  - Attack increases to 25
  - Summons now 3 Radroaches
  - New Ability: Toxic Wave (AoE, 20 damage, applies Poison)

Behavior:
  - 40% Toxic Wave
  - 35% Poison Spit
  - 25% Summon

Strategy:
  - High DPS, avoid prolonged fight
  - Positioning to avoid AoE
```

**Phase 3: Desperation (50-0% HP)**
```
Trigger: HP drops below 50%

Changes:
  - Defense drops to 8
  - Attack increases to 30
  - Summons now 4 Radroaches (no limit)
  - New Ability: Death Throes (Self-destruct on death, 50 damage)

Behavior:
  - 60% Standard Attack (frenzied)
  - 30% Summon
  - 10% Heal (20 HP, once)

Strategy:
  - Burn phase, ignore adds
  - Save HP for Death Throes damage
```

### Loot Table
```
Guaranteed Drops:
  - 200 Caps
  - 1 Epic weapon (Plague Blade or Toxic Gun)
  - King's Crown (Accessory: +10% Poison resist, +5 Defense)

Bonus Roll (25% each):
  - Sewer Key (Opens secret loot room)
  - Bloated Heart (Crafting material)
  - Antidote x3
```

### Achievements
- **Kingslayer** - Defeat The Bloated King
- **Clean Kill** - Defeat without being poisoned
- **Solo King** - Defeat without killing any Radroaches

---

## Boss 2: Razorclaw

### Overview
```
Name: Razorclaw
Title: "Alpha Predator"
Classification: Mutant Beast
Location: The Wastes (Level 8-10)
HP: 400
Attack: 28
Defense: 15
Agility: 18
XP Reward: 800
Caps Drop: 300
```

### Appearance
Massive, feral cat-like creature with razor-sharp claws, glowing red eyes, scarred hide.

### Combat Phases

**Phase 1: Stalking (100-70% HP)**
```
Behavior:
  - 40% Claw Swipe (Standard attack)
  - 35% Pounce (2x damage, ignores defense, 3 turn cooldown)
  - 25% Circle (Increases dodge by 30% for 1 turn)

Bleed Mechanic:
  - Every hit: 25% chance to apply Bleed (15 damage/turn × 4 turns)

Strategy:
  - Brace before Pounce
  - Bleed management critical
```

**Phase 2: Aggressive (70-35% HP)**
```
Trigger: HP drops below 70%

Changes:
  - Attack increases to 32
  - Pounce cooldown reduced to 2 turns
  - New Ability: Fury Swipes (3 attacks, 75% damage each)

Behavior:
  - 45% Fury Swipes
  - 30% Pounce
  - 25% Standard Attack

Strategy:
  - High defense/HP needed
  - Heal between Fury Swipes
```

**Phase 3: Regeneration (35-0% HP)**
```
Trigger: HP drops below 35%

Changes:
  - Passive Regen: 20 HP per turn
  - Pounce now stuns for 1 turn
  - New Ability: Blood Frenzy (+50% attack, takes 2x damage)

Behavior:
  - 50% Pounce
  - 30% Blood Frenzy
  - 20% Standard Attack

Strategy:
  - BURST DAMAGE to overcome regen
  - Exploit 2x damage during Frenzy
```

### Loot Table
```
Guaranteed Drops:
  - 300 Caps
  - 1 Legendary armor (Razorclaw Hide Armor: +20 Defense, +10% dodge)
  - Claw Trophy (Accessory: +15% crit chance)

Bonus Roll (30% each):
  - Predator Fang (Weapon crafting material)
  - Bleed Vial (Consumable: Apply bleed to weapon)
  - Max HP +10 (Permanent)
```

### Achievements
- **Beast Slayer** - Defeat Razorclaw
- **No Bleed Run** - Defeat without being bled
- **Speed Kill** - Defeat in under 10 turns

---

## Boss 3: Scrap Titan

### Overview
```
Name: Scrap Titan
Title: "War Machine"
Classification: Rogue Robot
Location: Rust Belt Factory (Level 11-13)
HP: 500
Attack: 30
Defense: 25
Agility: 5
XP Reward: 1200
Caps Drop: 500
```

### Appearance
Towering robot assembled from scrap metal, glowing red core, hydraulic limbs, weapon arrays.

### Combat Phases

**Phase 1: Armored (100-75% HP)**
```
Behavior:
  - 50% Laser Barrage (3 attacks, 15 damage each)
  - 30% Missile Volley (40 damage, ignores defense, 5 turn cooldown)
  - 20% Repair Drones (Heals 30 HP, 4 turn cooldown)

Armor Plating:
  - Takes 50% reduced damage until broken
  - Breaks at 75% HP

Strategy:
  - Chip damage through armor
  - Dodge Missile Volley
```

**Phase 2: Exposed Core (75-40% HP)**
```
Trigger: Armor breaks at 75% HP

Changes:
  - No damage reduction
  - Attack increases to 35
  - New Ability: EMP Pulse (Disables VATS, reduces agility by 5 for 3 turns)

Behavior:
  - 45% Laser Barrage
  - 30% EMP Pulse
  - 25% Missile Volley

Strategy:
  - Full DPS phase
  - Avoid EMP debuff if possible
```

**Phase 3: Self-Destruct (40-0% HP)**
```
Trigger: HP drops below 40%

Changes:
  - Self-Repair activates (one-time: +100 HP)
  - Attack increases to 40
  - New Ability: Overload (10 turns until self-destruct, 100 AoE damage)

Countdown Timer:
  - Displayed on screen
  - Boss must die before 0
  - If not: Player takes 100 damage (likely lethal)

Behavior:
  - 60% Laser Barrage (relentless)
  - 30% Missile Volley
  - 10% Repair Drones

Strategy:
  - RACE AGAINST TIME
  - All-out offense
  - Prepare heal for self-destruct if needed
```

### Loot Table
```
Guaranteed Drops:
  - 500 Caps
  - 1 Legendary energy weapon (Plasma Cannon or Laser Rifle Mk2)
  - Power Core (Accessory: +50 Max HP, +10% energy damage)

Bonus Roll (35% each):
  - Robot Chassis (Epic armor crafting material)
  - EMP Grenade x3
  - Attack +2 (Permanent)
```

### Achievements
- **Machine Breaker** - Defeat Scrap Titan
- **Beat the Clock** - Defeat with 5+ turns remaining on countdown
- **No Repairs** - Defeat without letting it heal once

---

## Boss 4: Neon Phantom

### Overview
```
Name: Neon Phantom
Title: "Reality Weaver"
Classification: Interdimensional Entity
Location: Crater Zone (Level 14-16)
HP: 350
Attack: 25
Defense: 10
Agility: 20
XP Reward: 1500
Caps Drop: 400
```

### Appearance
Translucent, humanoid figure glowing with neon colors (cyan/magenta), phasing in and out of reality.

### Combat Phases

**Phase 1: Phase Shift (100-66% HP)**
```
Behavior:
  - 40% Energy Bolt (20 damage, energy type)
  - 35% Phase (50% dodge for 2 turns)
  - 25% Reality Warp (Random effect from pool)

Reality Warp Effects (Random):
  1. Swap HP% (Player and Boss trade HP percentages)
  2. Time Skip (Both skip 1 turn)
  3. Duplicate (Boss creates illusion, 1 HP decoy)
  4. Stat Shuffle (Random stat gets +5 or -5 for 3 turns)
  5. Rift Spawn (Mini Reality Rift appears, 3 choices)

Strategy:
  - Adapt to random effects
  - Exploit Phase downtime
```

**Phase 2: Rift Convergence (66-33% HP)**
```
Trigger: HP drops below 66%

Changes:
  - Summons Reality Rift mid-fight (mandatory choice)
  - Phase now 75% dodge
  - New Ability: Neon Burst (30 damage, reduces player dodge to 0% for 2 turns)

Behavior:
  - 45% Neon Burst
  - 35% Reality Warp
  - 20% Phase

Strategy:
  - Risky Rift choices for high reward
  - Save defensive cooldowns for Neon Burst
```

**Phase 3: Unstable (33-0% HP)**
```
Trigger: HP drops below 33%

Changes:
  - Reality becomes unstable: Random effects every turn
  - Boss takes 2x damage
  - Boss deals 2x damage
  - Phase dodge increases to 90%

Random Unstable Effects (Every Turn):
  1. Gravity Flip (Dodge rolls inverted: high = miss)
  2. Time Loop (Repeat last turn)
  3. Reality Collapse (Both take 15 damage)
  4. Dimensional Echo (Boss clones, 2 targets)

Behavior:
  - 70% Attack
  - 30% Phase

Strategy:
  - High-risk, high-reward
  - RNG-dependent
  - Luck matters most
```

### Loot Table
```
Guaranteed Drops:
  - 400 Caps
  - 1 Legendary accessory (Rift Walker Ring: Survive fatal hit once per run)
  - Neon Core (Crafting material: Enables energy weapon upgrades)

Bonus Roll (40% each):
  - Phase Cloak (Armor: +20% dodge)
  - Reality Shard x5 (Consumable: Summon mini-rift)
  - Luck +2 (Permanent)
```

### Achievements
- **Rift Master** - Defeat Neon Phantom
- **Perfect Phase** - Defeat without missing an attack
- **Reality Bender** - Choose all 3 Rift options and survive

---

# LOOT & ECONOMY SYSTEM

## Currency: Caps

### Earning Caps
```
Enemy Kills:
  - Tier 1: 5-15 Caps
  - Tier 2: 20-50 Caps
  - Tier 3: 60-150 Caps
  - Bosses: 200-500 Caps

Chests:
  - Common Chest: 10-30 Caps
  - Uncommon Chest: 30-70 Caps
  - Rare Chest: 70-150 Caps
  - Epic Chest: 150-300 Caps
  - Legendary Chest: 300-600 Caps

Quest Completion:
  - Minor Quest: 50-100 Caps
  - Major Quest: 150-300 Caps

Selling Items:
  - Base: 50% of item value
  - With Merchant Friend perk: 75% of item value
```

### Spending Caps
```
Merchants:
  - Weapons: 50-500 Caps
  - Armor: 50-400 Caps
  - Consumables: 10-50 Caps
  - Rare Items: 200-800 Caps

Reality Rifts:
  - Entry Fee: 50-100 Caps (varies by rift)

Services:
  - Heal (Full): 50 Caps
  - Repair Equipment: 30 Caps
  - Identify Item: 20 Caps
  - Stat Boost (temporary): 100 Caps
```

---

## Loot Rarity System

### Rarity Tiers

**Common (Gray)**
```
Drop Chance: 60%
Stat Bonus: +5-10%
Effects: None
Value: 10-30 Caps
Examples:
  - Rusty Pipe (Weapon: 5 damage)
  - Torn Shirt (Armor: +2 Defense)
```

**Uncommon (Green)**
```
Drop Chance: 25%
Stat Bonus: +15-25%
Effects: Minor (5% chance)
Value: 40-80 Caps
Examples:
  - Steel Bat (Weapon: 12 damage)
  - Leather Jacket (Armor: +5 Defense, +1 Agility)
```

**Rare (Blue)**
```
Drop Chance: 10%
Stat Bonus: +30-50%
Effects: Moderate (10-15% chance)
Value: 100-200 Caps
Examples:
  - Combat Shotgun (Weapon: 25 damage, 15% crit)
  - Reinforced Vest (Armor: +10 Defense, +10% HP)
```

**Epic (Purple)**
```
Drop Chance: 4%
Stat Bonus: +60-90%
Effects: Strong (20-25% chance)
Value: 250-500 Caps
Examples:
  - Plasma Rifle (Weapon: 40 damage, 20% burn on hit)
  - Power Armor Chest (Armor: +20 Defense, +25 HP, 10% damage reduction)
```

**Legendary (Gold)**
```
Drop Chance: 1%
Stat Bonus: +100-150%
Effects: Unique/Game-Changing
Value: 600-1000 Caps (often unsellable)
Examples:
  - Wasteland Decimator (Weapon: 60 damage, Crits cause explosions)
  - Immortal's Cloak (Armor: +30 Defense, Survive 1 lethal hit per combat)
  - Ring of Infinity (Accessory: +5 all stats, unlimited VATS)
```

---

## Item Types

### Weapons

**Melee Weapons**
```
Subtypes: Blunt, Blade, Unarmed
Range: 1 tile
Stat Scaling: Attack
Special: Can't miss (auto-hit)

Examples:
  - Pipe Wrench (Common): 6 damage
  - Machete (Uncommon): 15 damage, Bleed 10%
  - Fire Axe (Rare): 28 damage, 15% crit
  - Plasma Blade (Epic): 45 damage, Burn 20%
  - Excalibur Mk II (Legendary): 70 damage, +10% crit, +20% vs bosses
```

**Ranged Weapons**
```
Subtypes: Pistol, Rifle, Heavy
Range: 3-5 tiles
Stat Scaling: Attack + Agility
Special: Can miss based on distance/accuracy

Examples:
  - Rusty Pistol (Common): 8 damage, 80% accuracy
  - Combat Rifle (Uncommon): 18 damage, 85% accuracy
  - Sniper Rifle (Rare): 35 damage, 90% accuracy, +50% headshot damage
  - Laser Cannon (Epic): 50 damage, 95% accuracy, Energy type
  - Anti-Material Rifle (Legendary): 80 damage, 98% accuracy, Piercing
```

**Energy Weapons**
```
Subtypes: Laser, Plasma, Pulse
Range: 3-4 tiles
Stat Scaling: Attack + Luck
Special: Bonus damage vs Synths

Examples:
  - Laser Pistol (Uncommon): 16 damage, 90% accuracy
  - Plasma Gun (Rare): 32 damage, 85% accuracy, 15% burn
  - Pulse Rifle (Epic): 48 damage, 90% accuracy, EMP effect
  - Supernova Cannon (Legendary): 90 damage, 95% accuracy, AoE
```

---

### Armor

**Head Armor**
```
Stat Bonus: Defense
Special Effects:
  - Perception bonus
  - Headshot protection
  - Night vision

Examples:
  - Bandana (Common): +1 Defense
  - Combat Helmet (Uncommon): +3 Defense, +5% headshot resist
  - Tactical Visor (Rare): +6 Defense, +10% accuracy
  - Power Armor Helmet (Epic): +12 Defense, +15% resist all
  - Crown of Kings (Legendary): +20 Defense, +2 all stats
```

**Chest Armor**
```
Stat Bonus: Defense + HP
Special Effects:
  - Damage reduction
  - Elemental resistance
  - HP regen

Examples:
  - Cloth Shirt (Common): +2 Defense
  - Leather Jacket (Uncommon): +5 Defense, +10 HP
  - Kevlar Vest (Rare): +10 Defense, +25 HP, 5% damage reduction
  - Power Armor Chest (Epic): +20 Defense, +50 HP, 10% reduction
  - Titan's Plate (Legendary): +35 Defense, +100 HP, 20% reduction
```

**Leg Armor**
```
Stat Bonus: Defense + Agility
Special Effects:
  - Movement speed
  - Dodge bonus
  - Kick damage

Examples:
  - Torn Pants (Common): +1 Defense
  - Cargo Pants (Uncommon): +3 Defense, +1 Agility
  - Combat Boots (Rare): +6 Defense, +2 Agility, 10% dodge
  - Power Armor Legs (Epic): +12 Defense, +4 Agility, 15% dodge
  - Hermes Boots (Legendary): +20 Defense, +8 Agility, 25% dodge, +1 move range
```

---

### Accessories

**Rings**
```
Slot: Ring (2 slots max)
Effects: Passive stat bonuses

Examples:
  - Iron Band (Common): +5 HP
  - Silver Ring (Uncommon): +2 Attack
  - Jade Ring (Rare): +3 Defense, +5% HP regen
  - Diamond Ring (Epic): +5 Attack, +10% crit chance
  - Ring of Power (Legendary): +5 all stats, +15% damage
```

**Amulets**
```
Slot: Neck (1 slot)
Effects: Unique abilities

Examples:
  - Wooden Pendant (Common): +5% XP gain
  - Silver Necklace (Uncommon): +10% Caps gain
  - Jade Amulet (Rare): +15% healing effectiveness
  - Diamond Necklace (Epic): Survive 1 lethal hit per combat
  - Amulet of Eternity (Legendary): +20% all stats, revive on death (once per run)
```

---

### Consumables

**Healing Items**
```
Stimpak (Common):
  - Heal: 30 HP
  - Cost: 25 Caps
  - Instant use

Super Stimpak (Uncommon):
  - Heal: 60 HP
  - Cost: 50 Caps
  - Instant use

Max Heal (Rare):
  - Heal: 100% HP
  - Cost: 100 Caps
  - Instant use

Regeneration Serum (Epic):
  - Heal: 10 HP/turn for 10 turns
  - Cost: 75 Caps
  - Buff duration
```

**Buff Items**
```
Strength Serum (Uncommon):
  - Effect: +5 Attack for 10 turns
  - Cost: 30 Caps

Defense Tonic (Uncommon):
  - Effect: +5 Defense for 10 turns
  - Cost: 30 Caps

Agility Potion (Uncommon):
  - Effect: +5 Agility for 10 turns
  - Cost: 30 Caps

Luck Charm (Rare):
  - Effect: +5 Luck for 10 turns
  - Cost: 50 Caps

Titan Serum (Epic):
  - Effect: +10 all stats for 5 turns
  - Cost: 100 Caps
```

**Cure Items**
```
Antidote (Common):
  - Cure: Poison status
  - Cost: 20 Caps

Bandage (Common):
  - Cure: Bleed status
  - Cost: 20 Caps

Rad-X (Uncommon):
  - Cure: Radiation status
  - Cost: 40 Caps

Universal Cure (Rare):
  - Cure: All status effects
  - Cost: 80 Caps
```

---

# PROGRESSION & META-SYSTEMS

## Leveling System

### XP Requirements Per Level
```
Level 1 → 2: 100 XP
Level 2 → 3: 220 XP (+120)
Level 3 → 4: 363 XP (+143)
Level 4 → 5: 533 XP (+170)
Level 5 → 6: 733 XP (+200)
Level 6 → 7: 967 XP (+234)
Level 7 → 8: 1,238 XP (+271)
Level 8 → 9: 1,550 XP (+312)
Level 9 → 10: 1,906 XP (+356)
Level 10 → 11: 2,310 XP (+404)
Level 11 → 12: 2,766 XP (+456)
Level 12 → 13: 3,278 XP (+512)
Level 13 → 14: 3,850 XP (+572)
Level 14 → 15: 4,486 XP (+636)
Level 15 → 16: 5,190 XP (+704)
Level 16 → 17: 5,966 XP (+776)
Level 17 → 18: 6,818 XP (+852)
Level 18 → 19: 7,750 XP (+932)
Level 19 → 20: 8,767 XP (+1,017)
Level 20 (MAX): 10,000 XP (+1,233)

Total XP to reach Level 20: 68,000 XP
Average run XP: 2,000-4,000 XP (reaches level 8-12)
```

### Stat Growth Per Level
```
HP: +10 per level
Attack: +1 per level
Defense: +1 per level
Agility: +0.5 per level (rounds down)
Luck: +0.5 per level (rounds down)

Example (Wasteland Warrior Level 10):
  HP: 120 + (10 × 9) = 210
  Attack: 12 + 9 = 21
  Defense: 10 + 9 = 19
  Agility: 5 + 4 = 9
  Luck: 5 + 4 = 9
```

---

## Perk System

### Perk Categories

**Offensive Perks**
```
Critical Eye (Level 3):
  - +5% base crit chance
  - Stacks with weapon crit bonuses

Heavy Hitter (Level 5):
  - +10% damage with melee weapons

Sharpshooter (Level 5):
  - +10% damage with ranged weapons

Armor Piercing (Level 7):
  - Ignore 25% of enemy defense

Executioner (Level 10):
  - +50% damage to enemies below 20% HP

Berserker (Level 10):
  - +25% damage when below 50% HP
```

**Defensive Perks**
```
Iron Skin (Level 3):
  - +10% Defense

Thick Hide (Level 5):
  - +15 Max HP

Evasion (Level 5):
  - +10% dodge chance

Unyielding (Level 7):
  - 50% chance to survive lethal hit with 1 HP (once per combat)

Regeneration (Level 10):
  - +5 HP per turn
```

**Economic Perks**
```
Scavenger (Level 3):
  - +25% Caps from enemies

Lucky Find (Level 5):
  - +10% chance for bonus loot drop

Merchant Friend (Level 7):
  - Buy items for 15% less
  - Sell items for 75% value (instead of 50%)

Treasure Hunter (Level 10):
  - +1 rarity tier on chest loot
```

**Utility Perks**
```
Quick Learner (Level 3):
  - +15% XP gain

Swift Feet (Level 5):
  - +10% flee success chance

Rad Resistant (Level 7):
  - -50% radiation damage
  - Immune to Radiation status

VATS Master (Level 10):
  - VATS costs 15 AP (instead of 25)
  - +5% VATS accuracy
```

---

## Meta-Progression

### Permanent Unlocks

**Character Classes**
```
Starting Classes (Default Unlocked):
  1. Wasteland Warrior
  2. Scrap Engineer
  3. Shadow Runner

Unlockable Classes:
  4. Rad Shaman - Survive 10 turns with Radiation status
  5. Bounty Hunter - Kill 5 different bosses
  6. Mutant Berserker - Reach Level 20
  7. Cyber Assassin - Complete 50 runs
  8. Wasteland Medic - Heal 1,000 total HP
```

**Perk Unlocks**
```
System: Perks unlock via achievements

Example Unlocks:
  - Kill 100 enemies → Unlock "Executioner"
  - Deal 10,000 damage → Unlock "Berserker"
  - Survive 50 combats → Unlock "Unyielding"
  - Earn 10,000 Caps → Unlock "Treasure Hunter"
```

**Starting Bonuses**
```
Earned via total runs completed:

10 Runs:
  - Start with +50 Caps

25 Runs:
  - Start with Uncommon weapon

50 Runs:
  - Start at Level 2

100 Runs:
  - Start with +20 HP

250 Runs:
  - Start with Rare accessory
```

---

## Leaderboard System

### Categories

**1. Total XP**
```
Metric: Highest XP gained in a single run
Tracks: Player skill, run duration
Top Reward: Bragging rights + Title "XP Master"
```

**2. Caps Earned**
```
Metric: Total Caps collected in a single run
Tracks: Economic efficiency
Top Reward: Title "Caps King"
```

**3. Reality Rifts Discovered**
```
Metric: Number of Rifts entered in a single run
Tracks: Risk-taking behavior
Top Reward: Title "Rift Walker"
```

**4. Deepest Level Reached**
```
Metric: Highest character level achieved
Tracks: Survival mastery
Top Reward: Title "Survivor"
```

**5. Bosses Killed**
```
Metric: Number of unique bosses defeated (all-time)
Tracks: Boss fight skill
Top Reward: Title "Boss Slayer"
```

### Submission Logic
```
Auto-submit on death if:
  - New personal best in any category
  OR
  - Score qualifies for top 100 global

Manual submit:
  - Player clicks "Submit to Leaderboard" on death screen
```

---

# REALITY RIFTS - COMPLETE SYSTEM

## Rift Mechanics

### Discovery
```
Spawn Rate: 5% per map tile explored
Spawn Locations: Random (except boss tile)
Visual: Purple swirling portal with particle effects
Entry Cost: 50-100 Caps (varies by rift type)
```

### Choice Structure
```
On Entry:
  1. Player sees 3 choices (randomly generated)
  2. Each choice has:
     - Cryptic flavor text
     - Unknown outcome
  3. Player selects 1 choice
  4. Outcome resolves immediately
  5. Rift closes (can't be re-entered)
```

---

## Rift Outcome Database

### Positive Outcomes (45% chance)

**Stat Boosts**
```
Minor Boost:
  - +2 to one random stat (permanent for run)
  - Weight: 15%

Major Boost:
  - +5 to one random stat (permanent for run)
  - Weight: 8%

Full Heal:
  - Restore 100% HP
  - Remove all status effects
  - Weight: 10%

Loot Windfall:
  - Gain 1 Rare or Epic item
  - Weight: 7%

Caps Jackpot:
  - Double current Caps
  - Weight: 5%
```

### Neutral Outcomes (25% chance)

**Trades**
```
Stat Trade:
  - +5 to one stat, -3 to another
  - Weight: 10%

Item Swap:
  - Lose equipped weapon, gain random weapon (same rarity)
  - Weight: 8%

Time Warp:
  - Gain 200 XP, but age 5 years (cosmetic only)
  - Weight: 5%

Mirror Match:
  - Fight clone of yourself (same stats/gear)
  - Win: Gain legendary item
  - Lose: Take 50 damage
  - Weight: 2%
```

### Negative Outcomes (30% chance)

**Curses**
```
Minor Curse:
  - -2 to one random stat (permanent for run)
  - Weight: 12%

Major Curse:
  - Take 30 damage
  - Weight: 8%

Caps Loss:
  - Lose 50% of current Caps
  - Weight: 5%

Equipment Damage:
  - Random equipped item loses 50% durability
  - Weight: 3%

Corruption:
  - Apply 3 random negative status effects
  - Weight: 2%
```

---

## Rift Choice Templates

### Example Rift 1: "The Whispering Void"
```
Choice A: "Listen to the whispers..."
  - 50% → +5 Luck
  - 50% → -3 Agility, Gain "Paranoid" debuff

Choice B: "Silence the voices."
  - 60% → Full Heal
  - 40% → Take 25 damage

Choice C: "Embrace the void."
  - 30% → Gain Legendary accessory
  - 70% → Lose all Caps
```

### Example Rift 2: "The Temporal Paradox"
```
Choice A: "Go back in time..."
  - 50% → Restore HP to previous combat value
  - 50% → Lose 1 level

Choice B: "Fast forward."
  - 60% → Gain 300 XP
  - 40% → Age rapidly, lose 20 max HP

Choice C: "Stay in the present."
  - 100% → Nothing happens (safe exit)
```

### Example Rift 3: "The Gambler's Rift"
```
Choice A: "Bet 50 Caps."
  - 50% → Win 200 Caps
  - 50% → Lose 50 Caps

Choice B: "Bet your weapon."
  - 40% → Weapon upgrades to next rarity
  - 60% → Weapon downgrades or breaks

Choice C: "Bet your life."
  - 20% → Gain 2 Legendary items
  - 80% → Take 75 damage
```

---

## Rift Strategy Guide (For Players)

**Low HP:**
- Avoid rifts unless desperate
- Choose defensive/healing options if forced

**High Caps:**
- Entry cost negligible
- Risk tolerance higher

**Late Game (Level 15+):**
- High-risk rifts worth it for legendary items
- Stat curses less impactful

**Boss Prep:**
- Enter rift BEFORE boss tile
- Aim for stat boosts/heals

---

# MAP & EXPLORATION

## Map Generation

### Grid Structure
```
Size: 10x10 tiles (100 total)
Starting Tile: Bottom-left corner (0,0)
Boss Tile: Top-right corner (9,9)
Fog of War: Tiles hidden until visited
```

### Tile Distribution
```
Empty Tiles: 40% (40 tiles)
  - Safe tiles, no encounters

Combat Tiles: 30% (30 tiles)
  - Enemy spawns (tier scaled to progression)

Chest Tiles: 15% (15 tiles)
  - Loot containers (rarity scaled)

Merchant Tiles: 10% (10 tiles)
  - Buy/sell items, services

NPC Tiles: 3% (3 tiles)
  - Quest givers, lore characters

Reality Rift Tiles: 2% (2 tiles)
  - Rift portals

Boss Tile: 1 tile (fixed at 9,9)
```

### Territory Themes

**Rust Belt**
```
Visual: Orange/brown tones, industrial ruins
Enemy Types: Raiders (60%), Mutants (30%), Robots (10%)
Loot Bias: Melee weapons, Heavy armor
Hazards: Toxic waste pools (5 damage if stepped on)
Boss: Scrap Titan
```

**Dead City**
```
Visual: Gray/black tones, urban decay
Enemy Types: Mutants (50%), Raiders (30%), Feral Animals (20%)
Loot Bias: Ranged weapons, Light armor
Hazards: Collapsing buildings (10 damage random tile)
Boss: The Bloated King
```

**The Wastes**
```
Visual: Yellow/tan tones, desert sand
Enemy Types: Feral Animals (50%), Raiders (30%), Mutants (20%)
Loot Bias: Survival items, Consumables
Hazards: Radiation zones (Radiation status)
Boss: Razorclaw
```

**Crater Zone**
```
Visual: Purple/cyan tones, reality distortions
Enemy Types: Synths (40%), Mutants (30%), Anomalies (30%)
Loot Bias: Energy weapons, Tech armor
Hazards: Reality tears (random rift effects)
Boss: Neon Phantom
```

---

## Movement System

### Movement Rules
```
Movement: 1 tile per action
Direction: 4-directional (up/down/left/right)
Diagonal: Not allowed
Backtrack: Allowed (fog remains cleared)
```

### Encounter Triggers
```
On Entering Tile:
  1. Reveal tile type
  2. If combat → Initiate fight
  3. If chest → Show loot options
  4. If merchant → Open shop UI
  5. If NPC → Trigger dialogue
  6. If rift → Show rift choices
  7. If boss → Final fight
```

---

# USER INTERFACE & UX

## Screen Layouts

### Title Screen
```
Elements:
  - Game logo (top center)
  - 3 Save Slots (center)
    - NEW GAME buttons
    - Load game (if save exists)
  - 4 Navigation Buttons (bottom):
    - STORE
    - GUIDE
    - LEADERBOARD
    - UPDATES (newsletter)

Visual:
  - Background: Wasteland skyline
  - Colors: Burnt orange, toxic green
  - Font: Bangers (titles), Share Tech Mono (body)
```

### Character Selection
```
Elements:
  - Class portraits (horizontal carousel)
  - Class name + description
  - Starting stats display
  - Special ability description
  - "START ADVENTURE" button

Interactions:
  - Swipe/arrow to change class
  - Tap class for details
  - Confirm to begin run
```

### Main Game View
```
Layout:
  - Top Bar: HP, Level, XP bar, Caps
  - Center: Map (10x10 grid)
  - Bottom Bar: Action buttons (Move, Inventory, Map, Menu)
  
Combat Overlay:
  - Enemy portrait (top)
  - Enemy HP bar
  - Player portrait (bottom)
  - Player HP bar
  - Action buttons (Attack, Power Attack, Brace, VATS, Flee)
  - Combat log (scrolling text)
```

### Inventory Screen
```
Tabs:
  - Weapons
  - Armor
  - Accessories
  - Consumables

Item Display:
  - Icon + Name + Rarity color
  - Stats comparison vs equipped
  - Equip/Use/Drop buttons
```

### Leaderboard Screen
```
Tabs:
  - Total XP
  - Caps Earned
  - Rifts Discovered
  - Deepest Level
  - Bosses Killed

Table Columns:
  - Rank (👑🥈🥉 for top 3)
  - Player Name
  - Class
  - Score

Interactions:
  - Tap tab to change category
  - Auto-updates every 30 seconds
```

### Store Screen
```
Products Grid:
  - 3x3 layout (9 products)
  - Product cards:
    - Name
    - Price
    - Description
    - "BUY NOW" button

Stripe Integration:
  - Click button → Stripe Checkout redirect
  - Payment success → Return to game
  - Purchase applied to save slot
```

---

## UI/UX Specifications

### Color System
```
Primary: #d4a44a (Burnt Orange)
Secondary: #a8c4d4 (Toxic Green/Blue)
Accent: #d32f2f (Blood Red)
Background: #1a1410 (Dark Brown)
Text: #e8e8e8 (Off-White)

Rarity Colors:
  - Common: #9e9e9e (Gray)
  - Uncommon: #4caf50 (Green)
  - Rare: #2196f3 (Blue)
  - Epic: #9c27b0 (Purple)
  - Legendary: #ffd700 (Gold)
```

### Typography
```
Headings: "Bangers" (Google Font)
  - H1: 4xl-6xl (48-72px)
  - H2: base-lg (16-20px)

Body: "Share Tech Mono" (Google Font)
  - Body: base (16px)
  - Small: sm-xs (12-14px)
```

### Button States
```
Default:
  - Background: Primary color
  - Border: 2px solid
  - Shadow: 0 3px 0 rgba(...)

Hover:
  - Background: Lighten 10%
  - Transform: translateY(-2px)
  - Shadow: Increase

Active:
  - Transform: translateY(0)
  - Shadow: Decrease

Disabled:
  - Background: Gray
  - Cursor: not-allowed
  - Opacity: 0.5
```

### Animation Timing
```
Dice Roll: 1.2 seconds (spin + reveal)
HP Bar Update: 0.3 seconds (smooth transition)
Button Hover: 0.2 seconds
Modal Open/Close: 0.3 seconds
Damage Numbers: 1 second (fade out)
```

---

# TECHNICAL ARCHITECTURE

## Tech Stack

### Frontend
```
Language: Vanilla JavaScript (ES6+)
HTML: HTML5 (semantic markup)
CSS: CSS3 (Grid, Flexbox, Animations)
Storage: LocalStorage API
Canvas: For map rendering (optional)

File Size:
  - HTML: ~20 KB
  - CSS: ~15 KB
  - JavaScript: ~180 KB (minified)
  - Assets (images): ~500 KB
  - Total: ~715 KB
```

### Backend
```
Framework: FastAPI (Python 3.11+)
Database: MongoDB 6.0
ORM: Motor (async MongoDB driver)
API: RESTful JSON
Authentication: None (public endpoints)

Hosting:
  - Frontend: Kubernetes (port 3000)
  - Backend: Kubernetes (port 8001)
  - Database: MongoDB (local pod)
```

### Third-Party Services
```
Payments: Stripe Checkout
Image CDN: None (self-hosted)
Analytics: None (custom implementation)
Email: None (newsletter stored in DB)
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────┐
│           FRONTEND (React Proxy)            │
│         http://localhost:3000               │
│                                             │
│  ┌────────────────────────────────────┐   │
│  │   /public/ (Vanilla JS Game)       │   │
│  │   - game.html (entry point)        │   │
│  │   - main.js (6,900 lines)          │   │
│  │   - data.js (game content)         │   │
│  │   - style.css (styles)             │   │
│  │   - store.js (Stripe UI)           │   │
│  │   - leaderboard.js (rankings)      │   │
│  │   - newsletter.js (email capture)  │   │
│  └────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
                     ↓ HTTP Requests
┌─────────────────────────────────────────────┐
│         BACKEND (FastAPI)                   │
│         http://localhost:8001               │
│                                             │
│  ┌────────────────────────────────────┐   │
│  │   API Routes (/api/*)              │   │
│  │   - /payments/* (Stripe)           │   │
│  │   - /leaderboard/* (rankings)      │   │
│  │   - /newsletter/* (emails)         │   │
│  └────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
                     ↓ Database Queries
┌─────────────────────────────────────────────┐
│         MONGODB                             │
│         mongodb://localhost:27017           │
│                                             │
│  ┌────────────────────────────────────┐   │
│  │   Collections:                     │   │
│  │   - leaderboard                    │   │
│  │   - newsletter_subscribers         │   │
│  └────────────────────────────────────┘   │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│         EXTERNAL SERVICES                   │
│                                             │
│  ┌────────────────────────────────────┐   │
│  │   Stripe Checkout                  │   │
│  │   - Payment processing             │   │
│  │   - Webhook events                 │   │
│  └────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

---

# CODE STRUCTURE & FILES

## Frontend File Structure

```
/app/frontend/
├── public/                    # Active game files
│   ├── game.html              # Main entry point (558 lines)
│   ├── main.js                # Core game logic (6,911 lines)
│   ├── data.js                # Game data/stats (400 lines)
│   ├── style.css              # Game styles (800 lines)
│   ├── audio.js               # Web Audio API (200 lines)
│   ├── npc.js                 # NPC dialogues (150 lines)
│   ├── store.js               # Stripe UI integration (250 lines)
│   ├── store.css              # Store styles (150 lines)
│   ├── leaderboard.js         # Leaderboard logic (200 lines)
│   ├── leaderboard.css        # Leaderboard styles (200 lines)
│   ├── newsletter.js          # Email capture (150 lines)
│   ├── newsletter.css         # Newsletter styles (150 lines)
│   └── assets/                # Images, audio
│       ├── wasteland-banner.png
│       ├── portraits/         # Character portraits
│       ├── enemies/           # Enemy sprites
│       └── sfx/               # Sound effects
│
├── src/                       # React app (INACTIVE)
│   ├── App.js
│   ├── components/
│   └── ... (dead code, not served)
│
├── .env                       # Environment variables
├── package.json               # Dependencies
└── yarn.lock
```

---

## Backend File Structure

```
/app/backend/
├── server.py                  # FastAPI entry point (95 lines)
├── routes/
│   ├── payments.py            # Stripe API (219 lines)
│   ├── leaderboard.py         # Leaderboard API (159 lines)
│   └── newsletter.py          # Newsletter API (117 lines)
│
├── .env                       # Environment variables
├── requirements.txt           # Python dependencies
└── tests/                     # Test files (optional)
```

---

## Key Files Deep Dive

### /app/frontend/public/main.js

**Purpose:** Core game engine

**Structure:**
```javascript
// Global Game Object
const G = {
  // Game State
  state: 'title',        // title|charCreate|playing|combat|dead
  player: {},            // Player stats
  enemy: {},             // Current enemy
  map: [],               // 10x10 grid
  inventory: [],         // Player items
  
  // Systems
  combat: {},            // Combat logic
  loot: {},              // Loot generation
  progression: {},       // XP/Leveling
  rift: {},              // Reality Rift system
  
  // UI Methods
  showScreen(screen) {}, // Screen transitions
  updateUI() {},         // Refresh displays
  
  // Game Loop
  init() {},             // Initialize game
  update() {},           // Game tick
};

// Entry Point
window.onload = () => G.init();
```

**Key Functions:**
```javascript
// Combat System
function rollDice() {
  return Math.floor(Math.random() * 20) + 1;
}

function attackEnemy() {
  const roll = rollDice();
  const attackValue = roll + G.player.attack + G.player.weaponBonus;
  
  if (attackValue > G.enemy.defense) {
    const damage = calculateDamage(roll);
    G.enemy.hp -= damage;
    showFloatingDamage(damage);
  } else {
    showMissMessage();
  }
}

// Reality Rift
function enterRift(choice) {
  const outcome = resolveRiftChoice(choice);
  applyRiftOutcome(outcome);
  closeRift();
}

// Save/Load
function saveGame(slot) {
  const saveData = {
    player: G.player,
    inventory: G.inventory,
    progress: G.progress,
    timestamp: Date.now()
  };
  localStorage.setItem(`wasteland_zero_save_${slot}`, JSON.stringify(saveData));
}
```

---

### /app/backend/server.py

**Purpose:** FastAPI application entry point

**Full Code:**
```python
from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
from pathlib import Path

# Load environment variables BEFORE importing routes
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from routes import payments, leaderboard, newsletter

# Initialize FastAPI
app = FastAPI(title="Wasteland Zero API")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB Connection
mongo_url = os.environ.get('MONGO_URL')
db_name = os.environ.get('DB_NAME')
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# Include all feature routes
app.include_router(payments.router)
app.include_router(leaderboard.router)
app.include_router(newsletter.router)

# Health Check
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "version": "v26"}

# Startup/Shutdown Events
@app.on_event("startup")
async def startup_db_client():
    print(f"Connected to MongoDB: {db_name}")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
```

---

### /app/backend/routes/leaderboard.py

**Purpose:** Leaderboard API endpoints

**Key Endpoints:**
```python
@router.post("/api/leaderboard/submit")
async def submit_score(entry: LeaderboardSubmission):
    """
    Submit player score
    
    Request Body:
    {
      "player_name": "TestPlayer",
      "total_xp": 5000,
      "caps_earned": 1200,
      "rifts_discovered": 3,
      "deepest_level": 8,
      "archetype": "Wasteland Warrior",
      "bosses_killed": 2
    }
    
    Response:
    {
      "success": true,
      "message": "New high score recorded!",
      "rank": 15
    }
    """
    # Implementation...

@router.get("/api/leaderboard/top")
async def get_top_players(limit: int = 10, sort_by: str = "total_xp"):
    """
    Get top players
    
    Query Params:
    - limit: Number of players (max 100)
    - sort_by: total_xp|caps_earned|rifts_discovered|deepest_level|bosses_killed
    
    Response:
    {
      "success": true,
      "sort_by": "total_xp",
      "players": [
        {
          "player_name": "TopPlayer",
          "total_xp": 12000,
          "caps_earned": 5000,
          "rifts_discovered": 10,
          "deepest_level": 18,
          "archetype": "Shadow Runner",
          "bosses_killed": 4,
          "updated_at": "2025-01-10T12:00:00Z"
        },
        ...
      ]
    }
    """
    # Implementation...
```

---

### /app/backend/routes/newsletter.py

**Purpose:** Email capture API

**Key Endpoints:**
```python
@router.post("/api/newsletter/subscribe")
async def subscribe(request: SubscribeRequest):
    """
    Subscribe email to newsletter
    
    Request Body:
    {
      "email": "player@example.com",
      "source": "game_title_screen"
    }
    
    Response:
    {
      "success": true,
      "message": "Successfully subscribed!",
      "already_subscribed": false
    }
    """
    # Implementation...

@router.get("/api/newsletter/export")
async def export_subscribers():
    """
    Export all subscribers (admin use)
    
    Response:
    {
      "success": true,
      "total": 150,
      "subscribers": [
        {
          "email": "player@example.com",
          "subscribed_at": "2025-01-10T12:00:00Z",
          "source": "game_title_screen"
        },
        ...
      ]
    }
    """
    # Implementation...
```

---

# API DOCUMENTATION

## Base URL
```
Production: https://panel-adventure.preview.emergentagent.com
Local: http://localhost:8001
```

## Authentication
```
None required (all endpoints public)
```

---

## Endpoints

### Payments

#### Create Checkout Session
```
POST /api/payments/create-checkout

Request Body:
{
  "product_id": "premium_unlock",
  "user_id": "save_slot_1",
  "success_url": "https://game.url/success",
  "cancel_url": "https://game.url/cancel"
}

Response:
{
  "session_id": "cs_live_abc123...",
  "url": "https://checkout.stripe.com/..."
}

Error Responses:
400 - Invalid product_id
500 - Stripe API error
```

---

### Leaderboard

#### Submit Score
```
POST /api/leaderboard/submit

Request Body:
{
  "player_name": "TestPlayer",
  "total_xp": 5000,
  "caps_earned": 1200,
  "rifts_discovered": 3,
  "deepest_level": 8,
  "archetype": "Wasteland Warrior",
  "race": "Human",
  "territory": "Dead City",
  "bosses_killed": 2
}

Response:
{
  "success": true,
  "message": "Score recorded!",
  "rank": 15
}

Error Responses:
400 - Invalid player_name (too short/long)
500 - Database error
```

#### Get Top Players
```
GET /api/leaderboard/top?limit=10&sort_by=total_xp

Query Parameters:
- limit: 1-100 (default 10)
- sort_by: total_xp|caps_earned|rifts_discovered|deepest_level|bosses_killed

Response:
{
  "success": true,
  "sort_by": "total_xp",
  "players": [...]
}

Error Responses:
400 - Invalid sort_by value
500 - Database error
```

#### Get Player Stats
```
GET /api/leaderboard/player/{player_name}

Response:
{
  "success": true,
  "player": {
    "player_name": "TestPlayer",
    "total_xp": 5000,
    ...
  },
  "rank": 15
}

Error Responses:
404 - Player not found
500 - Database error
```

---

### Newsletter

#### Subscribe
```
POST /api/newsletter/subscribe

Request Body:
{
  "email": "player@example.com",
  "source": "game_title_screen"
}

Response:
{
  "success": true,
  "message": "Successfully subscribed!",
  "already_subscribed": false
}

Error Responses:
400 - Invalid email format
500 - Database error
```

#### Get Subscriber Count
```
GET /api/newsletter/count

Response:
{
  "success": true,
  "total_subscribers": 150
}
```

#### Export Subscribers
```
GET /api/newsletter/export

Response:
{
  "success": true,
  "total": 150,
  "subscribers": [...]
}

(No authentication - consider adding in production)
```

#### Unsubscribe
```
DELETE /api/newsletter/unsubscribe?email=player@example.com

Response:
{
  "success": true,
  "message": "Successfully unsubscribed"
}

Error Responses:
404 - Email not found
500 - Database error
```

---

# DATABASE SCHEMA

## MongoDB Collections

### leaderboard
```javascript
{
  "_id": ObjectId,                    // Auto-generated
  "player_name": String,              // 1-30 characters
  "total_xp": Number,                 // >= 0
  "caps_earned": Number,              // >= 0
  "rifts_discovered": Number,         // >= 0
  "deepest_level": Number,            // >= 1
  "archetype": String | null,         // Character class
  "race": String | null,              // Character race
  "territory": String | null,         // Last territory
  "bosses_killed": Number,            // >= 0
  "created_at": String,               // ISO 8601 timestamp
  "updated_at": String                // ISO 8601 timestamp
}

Indexes:
- player_name (unique)
- total_xp (desc)
- caps_earned (desc)
- rifts_discovered (desc)
- deepest_level (desc)
- bosses_killed (desc)
```

### newsletter_subscribers
```javascript
{
  "_id": ObjectId,                    // Auto-generated
  "email": String,                    // Valid email, lowercase
  "source": String,                   // Signup source
  "subscribed_at": String,            // ISO 8601 timestamp
  "ip_address": String | null         // Subscriber IP (optional)
}

Indexes:
- email (unique)
- subscribed_at (desc)
```

---

## LocalStorage Schema

### Save Slots (1-3)
```javascript
Key: `wasteland_zero_save_${slot}`  // slot = 1, 2, or 3

Value (JSON):
{
  "player": {
    "name": String,
    "class": String,
    "level": Number,
    "hp": Number,
    "maxHp": Number,
    "attack": Number,
    "defense": Number,
    "agility": Number,
    "luck": Number,
    "xp": Number,
    "caps": Number,
    "perks": Array<String>
  },
  "inventory": {
    "weapon": Object | null,
    "armor": {
      "head": Object | null,
      "chest": Object | null,
      "legs": Object | null
    },
    "accessories": {
      "ring1": Object | null,
      "ring2": Object | null,
      "amulet": Object | null
    },
    "consumables": Array<Object>
  },
  "progress": {
    "territory": String,
    "mapPosition": {x: Number, y: Number},
    "exploredTiles": Array<[x, y]>,
    "bossesKilled": Array<String>,
    "riftsEntered": Number
  },
  "meta": {
    "totalRuns": Number,
    "totalKills": Number,
    "totalCaps": Number,
    "unlockedClasses": Array<String>,
    "unlockedPerks": Array<String>
  },
  "timestamp": Number  // Unix timestamp
}
```

---

# ART & VISUAL DESIGN

## Art Direction

### Visual Style
```
Theme: Post-Apocalyptic Comic Book
Inspiration: Fallout + Mad Max + Borderlands cell-shading
Color Palette: Desaturated with neon accents
Line Work: Bold black outlines, hand-drawn feel
```

### Color Palette
```
Primary Colors:
- Burnt Orange: #d4a44a (UI, highlights)
- Toxic Green: #a8c4d4 (status effects, radiation)
- Blood Red: #d32f2f (damage, danger)
- Dark Brown: #1a1410 (backgrounds)

Secondary Colors:
- Rust: #8b4513 (metal, rust)
- Sand: #d2b48c (desert, wasteland)
- Ash: #696969 (smoke, pollution)
- Neon Cyan: #00ffff (tech, energy)

Rarity Colors:
- Common: #9e9e9e
- Uncommon: #4caf50
- Rare: #2196f3
- Epic: #9c27b0
- Legendary: #ffd700
```

---

## Asset Specifications

### Character Portraits
```
Size: 64x64 pixels
Format: PNG (transparent background)
Style: Pixel art, comic-shaded
Color Depth: 256 colors
File Size: 2-5 KB each

Classes Needed:
- Wasteland Warrior (default)
- Scrap Engineer (goggles, tools)
- Shadow Runner (hood, mask)
- Rad Shaman (glowing eyes)
- Bounty Hunter (hat, rifle)
```

### Enemy Sprites
```
Size: 32x32 (small), 48x48 (medium), 64x64 (large/boss)
Format: PNG (transparent background)
Style: Side-view, animated (2-4 frames)
File Size: 3-10 KB each

Enemies Needed:
- Radroach (small, brown)
- Feral Dog (medium, gray)
- Raider Scum (medium, human)
- Mutant Brute (large, green)
- Glowing One (medium, glowing yellow)
- Deathclaw (large, brown scales)
- Synth Assassin (medium, metallic)
- Bosses (64x64, detailed)
```

### UI Elements
```
Buttons:
- Size: 120x40 pixels (standard)
- States: Default, Hover, Active, Disabled
- Style: Rounded corners, gradients, shadows

Icons:
- Size: 24x24 pixels
- Format: PNG or SVG
- Style: Simple, high contrast

Dice:
- Size: 64x64 pixels
- Animated: 20 frames (spin effect)
- Numbers: Clear, readable
```

### Backgrounds
```
Title Screen:
- Size: 1920x1080 (scales down)
- Content: Wasteland skyline, ruins
- Style: Parallax layers

Map Tiles:
- Size: 64x64 pixels each
- Variants: Empty, Combat, Loot, Merchant, Boss
- Style: Isometric or top-down
```

---

## Animation Specifications

### Dice Roll Animation
```
Duration: 1.2 seconds
Frames: 24 (20 fps)
Easing: ease-in-out

Sequence:
1. Spin (0.0-0.8s): Rotate 720° + blur effect
2. Settle (0.8-1.0s): Wobble 3 times
3. Reveal (1.0-1.2s): Number scales up 120% → 100%
```

### Damage Numbers
```
Duration: 1.0 second
Easing: ease-out

Sequence:
1. Appear (0.0-0.2s): Scale 0% → 150%
2. Float (0.2-0.8s): Move upward 50px
3. Fade (0.8-1.0s): Opacity 100% → 0%

Critical Hit:
- Larger font (2x size)
- Red color
- "POW!" text overlay
```

### HP Bar Updates
```
Duration: 0.3 seconds
Easing: ease-in-out

Sequence:
1. Flash (0.0-0.1s): White overlay
2. Transition (0.1-0.3s): Smooth width change
3. Shake (0.0-0.2s): Horizontal shake (if damage)
```

---

# AUDIO DESIGN

## Sound Effects

### Combat Sounds
```
Dice Roll:
- File: dice_roll.mp3
- Duration: 1.2s
- Description: Physical dice clatter

Sword Hit:
- File: sword_hit.mp3
- Duration: 0.3s
- Description: Meaty impact with metallic ring

Gun Shot:
- File: gun_shot.mp3
- Duration: 0.5s
- Description: Gunpowder explosion

Critical Hit:
- File: crit_hit.mp3
- Duration: 0.8s
- Description: Enhanced impact with "ding"

Miss:
- File: miss.mp3
- Duration: 0.4s
- Description: Whoosh sound
```

### UI Sounds
```
Button Click:
- File: button_click.mp3
- Duration: 0.1s
- Description: Satisfying click

Level Up:
- File: level_up.mp3
- Duration: 2.0s
- Description: Ascending chime

Loot Drop:
- File: loot_drop.mp3
- Duration: 0.5s
- Description: Coin jingle

Achievement:
- File: achievement.mp3
- Duration: 1.5s
- Description: Fanfare
```

### Environmental Sounds
```
Reality Rift Open:
- File: rift_open.mp3
- Duration: 2.0s
- Description: Cosmic whoosh with reverb

Boss Roar:
- File: boss_roar.mp3
- Duration: 1.5s
- Description: Deep, menacing roar

Death:
- File: death.mp3
- Duration: 3.0s
- Description: Dramatic descending tone
```

---

## Music Tracks

### Title Screen
```
Track: "Wasteland Horizon"
Duration: 2:00 (loops)
Mood: Atmospheric, lonely
Instruments: Ambient pads, distant wind, sparse guitar
BPM: 80
```

### Combat
```
Track: "Battle Drums"
Duration: 1:30 (loops)
Mood: Tense, rhythmic
Instruments: Percussion, bass, industrial sounds
BPM: 130
```

### Boss Fight
```
Track: "Final Stand"
Duration: 2:30 (loops)
Mood: Epic, intense
Instruments: Orchestra, electric guitar, choir
BPM: 150
```

### Victory
```
Track: "Triumph"
Duration: 0:10 (one-shot)
Mood: Victorious, uplifting
Instruments: Brass fanfare, timpani
```

---

## Audio Implementation

### Web Audio API
```javascript
// Audio Context
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// Load Sound
async function loadSound(url) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return await audioCtx.decodeAudioData(arrayBuffer);
}

// Play Sound
function playSound(buffer, volume = 1.0) {
  const source = audioCtx.createBufferSource();
  const gainNode = audioCtx.createGain();
  
  source.buffer = buffer;
  gainNode.gain.value = volume;
  
  source.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  source.start(0);
}
```

---

# MONETIZATION STRATEGY

## Revenue Model

### Free-to-Play Core
```
100% Free Content:
- All 5 character classes (after unlock)
- All 4 boss fights
- All territories
- All loot tiers
- 3 save slots
- Global leaderboards
- Newsletter

No Paywalls:
- No energy system
- No time gates
- No forced ads
- No gameplay advantages

Philosophy:
"Pay for cosmetics, not power"
```

---

## Premium Store Products

### Product 1: Premium Unlock
```
SKU: premium_unlock
Price: $4.99 USD
Type: One-time purchase

Includes:
- Remove "Made with Emergent" branding
- Exclusive premium title screen
- Priority customer support
- Special "Premium" badge on leaderboard

Target Audience:
- Dedicated players (10+ hours played)
- Completionists
- Supporters

Conversion Rate Estimate: 2-3%
```

### Product 2-3: Portrait Packs
```
SKU: cyber_portraits / neon_portraits
Price: $2.99 USD each
Type: Cosmetic DLC

Includes:
- 8+ alternative character portraits
- Unique art style (cyberpunk or neon)
- Works across all classes

Target Audience:
- Customization fans
- Repeat players
- Art enthusiasts

Conversion Rate Estimate: 1-2%
```

### Product 4-6: Boosts (24h)
```
SKU: xp_boost_24h / loot_boost_24h / caps_boost_24h
Price: $0.99 USD each
Type: Consumable

Effects:
- XP Boost: +50% XP gain
- Loot Boost: +25% drop quality
- Caps Boost: +50% currency gain
- Duration: 24 hours real-time

Target Audience:
- Grinding players
- Time-limited sessions
- Weekend warriors

Conversion Rate Estimate: 3-5%
```

### Product 7: Mega Boost Bundle
```
SKU: mega_boost_bundle
Price: $1.99 USD (33% savings)
Type: Bundle (best value)

Includes:
- All 3 boosts active simultaneously
- Duration: 24 hours real-time

Target Audience:
- Value-conscious players
- Power grinders
- Event participants

Conversion Rate Estimate: 5-7%
```

### Product 8: Extra Save Slots
```
SKU: extra_save_slots
Price: $1.99 USD
Type: One-time unlock

Includes:
- Save slots 4, 5, 6 (total 6)
- Try multiple builds simultaneously
- Permanent unlock

Target Audience:
- Alt-aholics
- Experimenters
- Completionists

Conversion Rate Estimate: 1-2%
```

### Product 9: Season Pass
```
SKU: season_pass_1
Price: $9.99 USD
Type: Seasonal (3 months)

Includes:
- 50 reward tiers
- Exclusive cosmetics
- Bonus XP throughout season
- Season-only items
- Special leaderboard

Target Audience:
- Hardcore fans
- Competitive players
- Long-term engaged users

Conversion Rate Estimate: 0.5-1%
```

---

## Pricing Strategy

### Price Points
```
$0.99 - Impulse buy (boosts)
$1.99 - Value proposition (bundle, slots)
$2.99 - Mid-tier (portraits)
$4.99 - Premium (main unlock)
$9.99 - High-value (season pass)

Total Catalog Value: $29.85
Average Purchase Value: $2-3
```

### Bundle Discounts
```
Mega Boost Bundle:
- Individual: $2.97
- Bundle: $1.99
- Savings: $0.98 (33%)

Complete Pack (future):
- All items except Season Pass
- Regular: $19.86
- Bundle: $14.99
- Savings: $4.87 (24%)
```

---

## Monetization Metrics

### KPIs to Track
```
Conversion Rate:
- Free → Paid conversion
- Target: 3-5%

ARPU (Average Revenue Per User):
- Total revenue / Total users
- Target: $1-2

ARPPU (Average Revenue Per Paying User):
- Total revenue / Paying users
- Target: $5-10

LTV (Lifetime Value):
- Average spending per user over lifetime
- Target: $3-5

DAU (Daily Active Users):
- Unique players per day
- Target: 1,000+ (month 3)
```

### Revenue Projections

**Month 1:**
```
Users: 500
Conversion: 2%
Paying Users: 10
ARPPU: $5
Revenue: $50
```

**Month 3:**
```
Users: 2,000
Conversion: 3%
Paying Users: 60
ARPPU: $7
Revenue: $420
```

**Month 6:**
```
Users: 5,000
Conversion: 4%
Paying Users: 200
ARPPU: $8
Revenue: $1,600
```

**Year 1:**
```
Users: 10,000
Conversion: 5%
Paying Users: 500
ARPPU: $10
Revenue: $5,000
```

---

# MARKETING & LAUNCH

## Launch Strategy

### Pre-Launch (Week -2 to -1)
```
Tasks:
- [ ] Create social media accounts (Twitter, Instagram, TikTok)
- [ ] Set up itch.io page
- [ ] Capture 10+ high-quality screenshots
- [ ] Record 30-second trailer
- [ ] Write press release
- [ ] Contact 5-10 gaming YouTubers/streamers
- [ ] Create Discord server (optional)
```

### Launch Week (Week 0)
```
Day 1 (Monday):
- [ ] Post on r/WebGames (peak traffic time: 12pm EST)
- [ ] Tweet launch announcement
- [ ] Instagram story + post
- [ ] Email personal contacts

Day 2 (Tuesday):
- [ ] Post on r/roguelites
- [ ] TikTok launch video
- [ ] LinkedIn announcement (for tech/indie community)

Day 3 (Wednesday):
- [ ] Post on r/IndieGaming
- [ ] Discord community shoutouts
- [ ] Engage with all comments

Day 4 (Thursday):
- [ ] Post on r/playmygame
- [ ] Follow up with streamers
- [ ] Instagram reel

Day 5 (Friday):
- [ ] Post on r/gamedev (Share Saturday thread)
- [ ] Analyze first-week metrics
- [ ] Respond to feedback

Weekend:
- [ ] Monitor servers/bugs
- [ ] Plan week 2 content
```

### Post-Launch (Week 1+)
```
Week 2:
- Submit to game directories (itch.io, Newgrounds, Kongregate)
- Reach out to gaming press (IndieDB, IndieGamePlus)
- Create "Week 1 Stats" social post

Week 3-4:
- User-generated content retweets
- Leaderboard highlight posts
- First update/patch (bug fixes + QoL)

Month 2:
- Season 2 teaser
- Community event (leaderboard reset?)
- Streamer partnership program
```

---

## Marketing Materials

### Elevator Pitch (30 seconds)
```
"Wasteland Zero is a free-to-play roguelite RPG where every fight is decided by rolling a D20 dice—just like tabletop games. Explore a post-apocalyptic wasteland, fight mutants and raiders, discover Reality Rifts that can save or destroy you, and compete globally on leaderboards. It's Fallout meets Slay the Spire, but you can play it instantly in your browser. No download, no ads, just survive."
```

### One-Liner
```
"Tabletop D20 combat meets browser roguelike in a post-apocalyptic wasteland."
```

### Key Selling Points
```
1. Instant Play - Zero download, browser-based
2. D20 Combat - Unique dice-based system
3. Free Forever - 100% free, optional cosmetics
4. High Stakes - Permadeath with meta-progression
5. Reality Rifts - High-risk events
6. Global Competition - Leaderboards
7. Mobile-Friendly - Play anywhere
```

---

## Press Kit

### Game Information
```
Title: Wasteland Zero
Developer: [Your Name/Studio]
Release Date: January 2025
Platforms: Web Browser (Desktop & Mobile)
Website: [Your URL]
Press Contact: [Your Email]
```

### Fact Sheet
```
- Genre: Roguelite RPG, Turn-Based Combat
- Players: 1 (Single-player)
- Languages: English
- Price: Free-to-Play
- Monetization: Optional cosmetics ($0.99-$9.99)
- Development Time: [X months]
- Technology: Vanilla JavaScript, FastAPI, MongoDB
```

### Features List
```
- 5 Character Classes with unique abilities
- D20 Dice Combat System
- 4 Epic Boss Fights
- Reality Rifts (50+ random events)
- 5 Loot Rarity Tiers
- Global Leaderboards (5 categories)
- Permadeath with Meta-Progression
- 4 Territories to explore
- Mobile-optimized UI
```

### Trailer Script (30 seconds)
```
[0-5s] Title card: "WASTELAND ZERO"
[5-10s] Quick cuts: Character creation, combat, dice roll
[10-15s] Text: "Every fight is a dice roll"
[15-20s] Reality Rift activation, boss fight
[20-25s] Text: "Every death matters"
[25-28s] Leaderboard, "Compete Globally"
[28-30s] "Play FREE Now" + URL
```

---

## Community Building

### Discord Server Structure (Optional)
```
Channels:
- #announcements (Dev updates only)
- #general (Player chat)
- #leaderboards (Automated top 10 updates)
- #feedback (Bug reports, suggestions)
- #builds (Character build sharing)
- #rift-stories (Reality Rift outcomes)
- #fan-art (Community creations)
```

### Community Engagement Ideas
```
Weekly Challenges:
- "Boss Rush Monday" - Most bosses killed
- "Rift Wednesday" - Most rifts entered
- "Survivor Saturday" - Highest level reached

Monthly Events:
- Leaderboard reset with prizes
- New cosmetic unlocks
- Community votes on next feature

Content Ideas:
- Dev diaries
- Behind-the-scenes
- Player spotlights
- Speed run competitions
```

---

# ANALYTICS & METRICS

## Data Collection

### Events to Track

**User Acquisition:**
```
- Page Load (source: direct, Reddit, Twitter, etc.)
- Account Creation (save slot used)
- First Combat
- First Death
- First Purchase
```

**Engagement:**
```
- Session Start/End
- Session Duration
- Runs Completed
- Runs Abandoned (quit mid-game)
- Average Run Length
- Returns (1-day, 7-day, 30-day)
```

**Monetization:**
```
- Store Viewed
- Product Clicked
- Purchase Initiated
- Purchase Completed
- Purchase Failed
- Refund Requested
```

**Gameplay:**
```
- Class Selected (distribution)
- Combats Won/Lost
- Bosses Defeated (which ones)
- Rifts Entered (success/fail rate)
- Level Reached (distribution)
- Death Causes (enemy type)
- Items Equipped (popular builds)
```

---

## Analytics Dashboard

### Key Metrics (Weekly View)

```
User Metrics:
- Total Users: [Count]
- New Users: [Count] (↑↓ vs last week)
- DAU: [Count]
- WAU: [Count]
- MAU: [Count]
- Retention (Day 1): [%]
- Retention (Day 7): [%]
- Retention (Day 30): [%]

Engagement Metrics:
- Average Session Length: [Minutes]
- Sessions per User: [Count]
- Average Run Length: [Minutes]
- Completion Rate: [%] (reached boss)

Monetization Metrics:
- Total Revenue: [$Amount]
- Conversion Rate: [%]
- ARPU: [$Amount]
- ARPPU: [$Amount]
- Transaction Count: [Count]
- Top-Selling Product: [Product Name]

Gameplay Metrics:
- Total Runs: [Count]
- Average Level Reached: [Level]
- Boss Kill Rate: [%]
- Rift Success Rate: [%]
- Most Popular Class: [Class Name]
- Most Deadly Enemy: [Enemy Name]
```

---

## A/B Testing Opportunities

### UI/UX Tests
```
Test 1: Button Colors
- Variant A: Orange buttons
- Variant B: Green buttons
- Metric: Click-through rate

Test 2: Store Placement
- Variant A: Store button on title screen
- Variant B: Store accessible only in-game
- Metric: Conversion rate

Test 3: Pricing
- Variant A: Premium Unlock $4.99
- Variant B: Premium Unlock $3.99
- Metric: Purchase rate
```

### Game Balance Tests
```
Test 1: XP Curve
- Variant A: Current (slow) curve
- Variant B: Faster leveling
- Metric: Session length, retention

Test 2: Rift Entry Cost
- Variant A: 50-100 Caps
- Variant B: Free entry
- Metric: Rift engagement rate
```

---

# TESTING & QUALITY ASSURANCE

## Testing Protocol

### Unit Tests

**Backend (pytest):**
```python
# Test Leaderboard API
def test_submit_score():
    response = client.post("/api/leaderboard/submit", json={
        "player_name": "TestPlayer",
        "total_xp": 5000,
        "caps_earned": 1200,
        "rifts_discovered": 3,
        "deepest_level": 8,
        "bosses_killed": 2
    })
    assert response.status_code == 200
    assert response.json()["success"] == True

def test_get_top_players():
    response = client.get("/api/leaderboard/top?limit=10&sort_by=total_xp")
    assert response.status_code == 200
    assert len(response.json()["players"]) <= 10
```

**Frontend (Manual):**
```
Test: Combat System
1. Start new game
2. Select Wasteland Warrior
3. Enter first combat
4. Click "Attack" 10 times
5. Verify: Dice rolls, damage numbers, HP updates

Expected: All animations smooth, no errors
```

---

### Integration Tests

**Full Flow:**
```
Test: Store Purchase
1. Click "STORE" on title screen
2. Click "Premium Unlock" ($4.99)
3. Complete Stripe Checkout (test mode)
4. Return to game
5. Verify: Premium badge visible, branding removed

Expected: Seamless flow, purchase applied to save slot
```

**API Flow:**
```
Test: Leaderboard Submission
1. Complete a run (reach boss, die)
2. Click "Submit to Leaderboard"
3. Verify: POST to /api/leaderboard/submit
4. Open leaderboard
5. Verify: Player appears in correct rank

Expected: Immediate update, correct ranking
```

---

### Playtesting Checklist

**Session 1: New Player Experience**
```
- [ ] Game loads in <3 seconds
- [ ] Title screen is clear
- [ ] Character creation is intuitive
- [ ] First combat is understandable
- [ ] Death screen explains progression
- [ ] Player understands core loop
```

**Session 2: Balance Testing**
```
- [ ] Easy enemies feel fair (not too hard/easy)
- [ ] Bosses feel challenging but beatable
- [ ] Loot drops feel rewarding
- [ ] XP curve feels appropriate
- [ ] Caps economy feels balanced
```

**Session 3: Monetization Testing**
```
- [ ] Store is accessible but not intrusive
- [ ] Products are clearly described
- [ ] Prices feel fair
- [ ] Purchases apply correctly
- [ ] No bugs with paid content
```

---

# ROADMAP & FUTURE CONTENT

## Season 2 (Q2 2025)

### New Content
```
Classes (3 new):
- Mutant Berserker
- Cyber Assassin
- Wasteland Medic

Bosses (2 new):
- The Hive Queen (Insect boss)
- Iron Warlord (Mech boss)

Reality Rifts (5 new types):
- Time Rift (manipulate turn order)
- Dream Rift (randomize stats)
- Chaos Rift (all effects active)
- Void Rift (delete items for power)
- Mirror Rift (fight your past self)

Items:
- 20 new weapons
- 15 new armor pieces
- 10 new accessories

Perks:
- 10 new unlockable perks
```

### Features
```
Seasonal Leaderboard:
- 3-month duration
- Exclusive rewards
- Top 10 get unique cosmetics

Daily Challenges:
- Randomized modifiers
- Bonus XP/Caps
- Streak rewards

Achievements:
- 50 achievements
- UI display
- Bragging rights
```

---

## Quality of Life (Q1-Q2 2025)

### UI Improvements
```
- Rebind controls (keyboard/gamepad)
- Colorblind mode (3 presets)
- Audio sliders (music, SFX, master)
- Speed mode (2x combat animations)
- Auto-loot option
- Combat log history
```

### Accessibility
```
- Screen reader support
- High contrast mode
- Larger text option
- Reduced motion mode
- Pause button (roguelike!)
```

### Performance
```
- Optimize JavaScript (reduce file size)
- Lazy load assets
- Compress images (WebP format)
- Service worker (offline play)
```

---

## Long-Term Vision (Year 1+)

### Multiplayer (Maybe)
```
Co-op Mode:
- 2 players, shared run
- Turn-based, alternate actions
- Shared loot pool
- Combined leaderboard

Competitive Mode:
- Head-to-head combat
- Draft-style class selection
- Best of 3 rounds
```

### Modding Support
```
- Custom classes (JSON editor)
- Custom enemies (sprite upload)
- Custom rifts (outcome editor)
- Steam Workshop integration (if on Steam)
```

### Platform Expansion
```
- Steam release (with achievements)
- iOS app (native or PWA)
- Android app (native or PWA)
- Epic Games Store (possible)
```

---

# APPENDICES

## Appendix A: Glossary

**Terms:**
```
ARPPU - Average Revenue Per Paying User
ARPU - Average Revenue Per User
D20 - 20-sided dice (tabletop RPG staple)
DAU - Daily Active Users
DoT - Damage over Time
LTV - Lifetime Value
Meta-Progression - Permanent unlocks across runs
Permadeath - Permanent character death
Roguelite - Roguelike with meta-progression
WAU - Weekly Active Users
```

---

## Appendix B: Credits

**Development:**
```
Lead Developer: [Your Name]
Game Design: [Your Name]
Programming: [Your Name]
Art Direction: [Your Name or Artist]
Sound Design: [Your Name or Sound Designer]
```

**Tools & Technologies:**
```
Languages: JavaScript, Python, HTML, CSS
Frameworks: FastAPI, Motor
Database: MongoDB
Payments: Stripe
Hosting: Kubernetes
```

**Special Thanks:**
```
- Playtesters
- Early supporters
- Emergent AI platform
- Roguelike community
- Open source contributors
```

---

## Appendix C: Version History

**v26 (Current - January 2025):**
```
- Added: Global leaderboards (5 categories)
- Added: Newsletter system (email capture)
- Fixed: Backend Stripe Live key bug
- Fixed: XP curve rebalanced (slowed)
- Removed: D-Pad UI (mobile)
- Fixed: Dice roll UI overflow
- Status: LIVE & MONETIZED
```

**v25 (December 2024):**
```
- Added: Premium Store integration
- Added: Reality Rifts system (50+ outcomes)
- Polished: Boss fights (4 bosses)
- Fixed: Various combat bugs
```

**v1-24 (Development):**
```
- Core systems implemented
- Content creation
- Balance testing
- Art integration
```

---

## Appendix D: Resources

**Learning Resources:**
```
Roguelike Development:
- /r/roguelikedev (Reddit)
- Roguebasin Wiki
- "How to Make a Roguelike" (Python tutorial)

Game Design:
- "The Art of Game Design" by Jesse Schell
- "Game Feel" by Steve Swink
- GDC Vault (talks on roguelikes)

Web Game Dev:
- MDN Web Docs (JavaScript/HTML/CSS)
- FastAPI Documentation
- MongoDB University (free courses)
```

**Tools Used:**
```
Code Editor: VS Code
Graphics: Aseprite (pixel art)
Audio: Audacity (SFX editing)
Music: LMMS (composition)
Version Control: Git
Project Management: Notion/Trello
```

---

## Appendix E: Contact Information

**Developer:**
```
Name: [Your Name]
Email: [Your Email]
Website: [Your URL]
Twitter: [@YourHandle]
Discord: [Your Discord Server]
```

**Support:**
```
Bug Reports: [Email or Form]
Feature Requests: [Email or Form]
Press Inquiries: [Email]
```

---

# DOCUMENT END

**Wasteland Zero - Complete Game Breakdown**  
**Version:** v26  
**Document Version:** 1.0  
**Last Updated:** January 10, 2025  
**Total Pages:** [Auto-calculated when converted to PDF]  
**Word Count:** ~30,000 words  

**"Every fight is a dice roll. Every death matters. Every rift changes everything."**

🎲💀🌀

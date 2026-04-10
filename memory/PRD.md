# Wasteland Zero - Product Requirements Document

## Overview
Post-apocalyptic roguelite browser RPG inspired by Fallout. Mobile-first design at 400px portrait width with comic-style aesthetics.

## Original Problem Statement
Build a complete implementation of "Wasteland Zero" based on user's game design document featuring:
- Character creation (5 races, 10 archetypes, trait selection)
- Turn-based combat with AP and d20 dice mechanics
- 7x7 fog-of-war map exploration
- 6 territories with bosses
- 7-tier loot system (Common to Celestial)
- Skill trees and level-up perks
- Inventory/equipment system
- Town shops/clinic
- 3-slot save system
- Web Audio API sounds

## User Personas
1. **Casual RPG Player**: Quick pick-up-and-play sessions, enjoys loot collecting
2. **Hardcore Roguelite Fan**: Permadeath mode, optimizing builds
3. **Fallout Enthusiast**: Post-apocalyptic theme appreciation

## Core Requirements (Implemented)
- [x] Title screen with START GAME
- [x] 3-slot save system with localStorage persistence
- [x] Character creation: Name → Race → Archetype → Traits
- [x] 5 playable races with unique bonuses
- [x] 10 archetypes/classes with starting gear
- [x] 10 selectable traits (pick 2)
- [x] 7x7 fog-of-war map exploration
- [x] Turn-based combat with AP system
- [x] V.A.T.S. targeting (headshot/body shot)
- [x] Attack, Brace, and item actions
- [x] Enemy AI with healers support
- [x] Victory rewards (XP, caps, loot)
- [x] Inventory with equipment slots
- [x] Skill tree with 4 categories
- [x] Town shop with purchasable items
- [x] Clinic for healing
- [x] Web Audio procedural sounds
- [x] Comic-style post-apocalyptic UI

## What's Been Implemented (Jan 2026)
### Data Files Created
- races.js (5 races)
- archetypes.js (10 classes)
- traits.js (10 traits)
- skills.js (15+ skills)
- perks.js (24 level-up perks)
- territories.js (6 territories)
- enemies.js (30+ enemy types)
- items.js (weapons, armor, consumables)
- achievements.js (40+ achievements)
- advancedClasses.js (level 10-50 milestones)
- npcs.js (quest chains and bounties)

### Screens Implemented
- TitleScreen.jsx
- SavesScreen.jsx
- CharacterCreation.jsx
- MapScreen.jsx
- CombatScreen.jsx
- InventoryScreen.jsx
- SkillsScreen.jsx
- TownScreen.jsx
- LevelUpScreen.jsx
- GameOverScreen.jsx

### Core Systems
- Zustand + Immer state management
- Combat calculations (damage, crit, dodge)
- Loot generation with tier system
- Map generation with fog-of-war
- Save/load with localStorage

## Prioritized Backlog (P0-P2)
### P0 (Critical)
- [x] Combat trigger from map tiles - FIXED

### P1 (Important)
- [ ] Level-up screen with perk selection
- [ ] Dungeon gauntlet system
- [ ] Territory progression (unlock next territory)
- [ ] Advanced class selection at milestones

### P2 (Nice to Have)
- [ ] NPC quest dialogue system
- [ ] Bounty board functionality
- [ ] Rift random events
- [ ] Achievement tracking/display
- [ ] Prestige system

## Next Tasks
1. Test level-up perk selection flow
2. Implement dungeon gauntlet system
3. Add territory boss defeat → unlock next territory
4. NPC dialogue system for quests

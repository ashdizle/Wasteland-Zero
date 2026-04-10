// Zustand game store with Immer for immutable updates
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { RACES } from '../data/races';
import { ARCHETYPES } from '../data/archetypes';
import { TRAITS } from '../data/traits';
import { SKILL_TREE } from '../data/skills';
import { PERK_LIST } from '../data/perks';
import { TERRITORIES } from '../data/territories';
import { ENEMIES } from '../data/enemies';
import { getRandomRift } from '../data/rifts';
import { calculateMaxHP, xpForLevel, rollDamage, performAttackRoll, calculateDamage, calculateStatusDamage, shuffleArray } from '../utils/combat';
import { generateTerritoryMap, generateCombatEnemies, TILE_TYPES } from '../utils/map';
import { generateLoot, generateCapsDrop, generateShopInventory } from '../utils/loot';
import { createInitialState, saveGame, loadGame, autoSave } from '../utils/save';
import audioEngine from '../utils/audio';

const useGameStore = create(
  immer((set, get) => ({
    // Game state
    ...createInitialState(),
    
    // UI State
    screen: 'title', // title, saves, newGame, map, combat, inventory, skills, shop, levelUp, rift
    pendingLevelUp: false,
    levelUpPerks: [],
    combatLog: [],
    floatingDamage: [],
    currentRift: null,
    
    // Actions
    setScreen: (screen) => set(state => { state.screen = screen; }),
    
    // Save/Load
    setSaveSlot: (slot) => set(state => { state.saveSlot = slot; }),
    
    loadFromSlot: (slot) => {
      const data = loadGame(slot);
      if (data) {
        set(state => {
          Object.keys(data).forEach(key => {
            state[key] = data[key];
          });
          state.screen = 'map';
        });
        return true;
      }
      return false;
    },
    
    saveToSlot: (slot) => {
      const state = get();
      return saveGame(state, slot || state.saveSlot);
    },
    
    // Character Creation
    setCharacterName: (name) => set(state => { state.name = name; }),
    
    selectRace: (raceId) => set(state => {
      const race = RACES[raceId];
      if (!race) return;
      
      state.race = raceId;
      
      // Apply race bonuses to stats
      Object.entries(race.bonuses).forEach(([stat, value]) => {
        state.stats[stat] = (state.stats[stat] || 5) + value;
      });
      Object.entries(race.penalties || {}).forEach(([stat, value]) => {
        state.stats[stat] = (state.stats[stat] || 5) + value;
      });
      
      // Apply HP and caps bonuses
      state.maxHP = calculateMaxHP(100 + (race.hpBonus || 0), state.stats.END, state.level, state.bonuses);
      state.hp = state.maxHP;
      state.caps += race.capsBonus || 0;
      
      // Store race-specific bonuses
      state.bonuses.radResist = race.radResist || 0;
      state.bonuses.toxinImmune = race.toxinImmune || false;
    }),
    
    selectArchetype: (archetypeId) => set(state => {
      const archetype = ARCHETYPES[archetypeId];
      if (!archetype) return;
      
      state.archetype = archetypeId;
      
      // Apply archetype base stats
      Object.entries(archetype.baseStats).forEach(([stat, value]) => {
        state.stats[stat] = (state.stats[stat] || 5) + value - 5; // Offset from default 5
      });
      
      // Recalculate HP
      state.maxHP = calculateMaxHP(100 + (RACES[state.race]?.hpBonus || 0), state.stats.END, state.level, state.bonuses);
      state.hp = state.maxHP;
      
      // Give starting weapon
      if (archetype.startingWeapon) {
        const weapon = {
          ...archetype.startingWeapon,
          uid: `starter_${archetype.startingWeapon.id}_${Date.now()}`
        };
        state.equipment.weapon = weapon;
      }
      
      // Give starting armor
      if (archetype.startingArmor) {
        const armor = {
          ...archetype.startingArmor,
          uid: `starter_${archetype.startingArmor.id}_${Date.now()}`
        };
        state.equipment[archetype.startingArmor.slot] = armor;
      }
      
      // Give starting item
      if (archetype.startingItem) {
        const item = {
          ...archetype.startingItem,
          uid: `starter_${archetype.startingItem.id}_${Date.now()}`,
          quantity: 1
        };
        state.inventory.push(item);
      }
      
      // Store weapon type for combat
      state.weaponType = archetype.weaponType;
    }),
    
    selectTraits: (traitIds) => set(state => {
      if (traitIds.length !== 2) return;
      
      state.traits = traitIds;
      
      // Apply trait effects
      traitIds.forEach(traitId => {
        const trait = TRAITS[traitId];
        if (!trait) return;
        
        Object.entries(trait.effects).forEach(([key, value]) => {
          if (['STR', 'AGI', 'INT', 'END', 'LCK'].includes(key)) {
            state.stats[key] += value;
          } else if (key === 'maxHP') {
            state.bonuses.maxHP = (state.bonuses.maxHP || 0) + value;
          } else if (key === 'maxAP') {
            state.maxAP += value;
            state.ap = state.maxAP;
          } else {
            state.bonuses[key] = (state.bonuses[key] || 0) + value;
          }
        });
      });
      
      // Recalculate HP
      state.maxHP = calculateMaxHP(100 + (RACES[state.race]?.hpBonus || 0), state.stats.END, state.level, state.bonuses);
      state.hp = state.maxHP;
    }),
    
    startNewGame: (slot, hardcoreMode = false) => set(state => {
      state.saveSlot = slot;
      state.hardcoreMode = hardcoreMode;
      state.createdAt = new Date().toISOString();
      state.lastPlayed = new Date().toISOString();
      
      // Generate initial map
      const territory = TERRITORIES.ashPlains;
      state.mapData.ashPlains = generateTerritoryMap('ashPlains');
      state.exploredTiles.ashPlains = ['3,6']; // Use array instead of Set
      
      state.screen = 'map';
      
      // Auto-save
      setTimeout(() => autoSave(get()), 100);
    }),
    
    // Map Movement
    moveToTile: (x, y) => {
      const state = get();
      const { currentTerritory, currentPosition, mapData, exploredTiles } = state;
      
      // Check if move is valid
      const dx = Math.abs(x - currentPosition.x);
      const dy = Math.abs(y - currentPosition.y);
      if (!((dx === 1 && dy === 0) || (dx === 0 && dy === 1))) return;
      
      // Get tile data
      const tile = mapData[currentTerritory]?.[y]?.[x];
      if (!tile) return;
      
      // Update position and explored tiles
      set(s => {
        s.currentPosition = { x, y };
        
        // Mark tile as explored (use array instead of Set)
        const key = `${x},${y}`;
        if (!s.exploredTiles[currentTerritory]) {
          s.exploredTiles[currentTerritory] = [];
        }
        if (!s.exploredTiles[currentTerritory].includes(key)) {
          s.exploredTiles[currentTerritory].push(key);
        }
        
        // Update achievement progress
        s.achievementProgress.tilesExplored++;
      });
      
      audioEngine.playButtonClick();
      
      // Handle tile type AFTER the set() completes
      if (!tile.cleared) {
        switch (tile.type) {
          case TILE_TYPES.FIGHT:
          case TILE_TYPES.ELITE:
            get().startCombat(tile, x, y);
            break;
          case TILE_TYPES.BOSS:
            audioEngine.playBossAppear();
            get().startCombat(tile, x, y);
            break;
          case TILE_TYPES.LOOT:
            get().collectLoot(tile);
            break;
          case TILE_TYPES.TOWN:
            set(s => { s.screen = 'town'; });
            break;
          case TILE_TYPES.DUNGEON:
            // TODO: Dungeon system
            break;
          case TILE_TYPES.NPC:
            // TODO: NPC dialogue
            break;
          case TILE_TYPES.RIFT:
            // Rift encounter
            const riftEncounter = getRandomRift();
            set(s => {
              s.currentRift = {
                encounter: riftEncounter,
                tilePos: { x, y }
              };
              s.screen = 'rift';
            });
            break;
          default:
            break;
        }
      } else if (tile.type === TILE_TYPES.TOWN) {
        set(s => { s.screen = 'town'; });
      }
    },
    
    collectLoot: (tile) => set(state => {
      const territory = TERRITORIES[state.currentTerritory];
      const lootCount = tile.lootCount || 1;
      
      for (let i = 0; i < lootCount; i++) {
        const item = generateLoot(territory.lootTier, state.stats.LCK / 10 + (state.bonuses.lootLuck || 0));
        state.inventory.push(item);
        state.achievementProgress.itemsLooted++;
      }
      
      // Mark tile as cleared
      const { x, y } = state.currentPosition;
      state.mapData[state.currentTerritory][y][x].cleared = true;
      
      audioEngine.playLoot();
    }),
    
    // Combat System
    startCombat: (tile, tileX, tileY) => set(state => {
      const territory = TERRITORIES[state.currentTerritory];
      const enemies = generateCombatEnemies(tile, territory);
      
      // If no enemies generated, mark tile as cleared and return
      if (!enemies || enemies.length === 0) {
        if (tileX !== undefined && tileY !== undefined) {
          state.mapData[state.currentTerritory][tileY][tileX].cleared = true;
        }
        return;
      }
      
      // Apply pre-combat healing from Triage skill
      if (state.unlockedSkills.includes('triage')) {
        const healAmount = Math.floor(state.maxHP * 0.12);
        state.hp = Math.min(state.maxHP, state.hp + healAmount);
      }
      
      // Store combat tile position for victory marking
      state.combatTilePosition = { x: tileX, y: tileY };
      
      state.combat = {
        enemies,
        turn: 'player',
        round: 1,
        ap: state.maxAP,
        skillUsesThisCombat: {},
        playerBuffs: [],
        selectedTarget: 0,
        vatsMode: false,
        vatsTarget: null
      };
      state.combatLog = ['Combat started!'];
      state.floatingDamage = [];
      state.screen = 'combat';
    }),
    
    performAttack: (targetIndex = 0) => {
      const state = get();
      if (!state.combat || state.combat.turn !== 'player') return;
      if (state.combat.ap < 2) return;
      
      const enemy = state.combat.enemies[targetIndex];
      if (!enemy || enemy.currentHP <= 0) return;
      
      const weapon = state.equipment.weapon;
      const attackResult = performAttackRoll(
        { stats: state.stats, weaponType: weapon?.weaponType || 'melee' },
        enemy,
        state.bonuses
      );
      
      set(s => {
        s.combat.ap -= 2;
        
        const targetEnemy = s.combat.enemies[targetIndex];
        
        if (attackResult.isMiss) {
          s.combatLog.push('You missed!');
          audioEngine.playMiss();
          return;
        }
        
        if (attackResult.dodged) {
          s.combatLog.push(`${targetEnemy.name} dodged your attack!`);
          audioEngine.playMiss();
          return;
        }
        
        // Calculate damage
        const baseDamage = weapon ? rollDamage(weapon.damage[0], weapon.damage[1]) : rollDamage(3, 8);
        const damage = calculateDamage(baseDamage, { ...s, weaponType: weapon?.weaponType || 'melee' }, targetEnemy, attackResult.isCrit, s.bonuses);
        
        // Track max damage
        if (damage > s.achievementProgress.maxDamage) {
          s.achievementProgress.maxDamage = damage;
        }
        
        // Apply damage
        targetEnemy.currentHP = Math.max(0, targetEnemy.currentHP - damage);
        
        // Add floating damage
        s.floatingDamage.push({
          id: Date.now(),
          damage,
          isCrit: attackResult.isCrit,
          targetIndex
        });
        
        if (attackResult.isCrit) {
          s.combatLog.push(`CRITICAL HIT! You deal ${damage} damage to ${targetEnemy.name}!`);
          s.achievementProgress.criticalHits++;
          audioEngine.playCrit();
        } else {
          s.combatLog.push(`You deal ${damage} damage to ${targetEnemy.name}.`);
          audioEngine.playHit();
        }
        
        // Lifesteal
        if (s.bonuses.lifesteal) {
          const healAmount = Math.floor(damage * s.bonuses.lifesteal);
          s.hp = Math.min(s.maxHP, s.hp + healAmount);
          s.combatLog.push(`You heal ${healAmount} HP from lifesteal.`);
        }
        
        // Apply status effects from weapon
        if (weapon?.element === 'bleed' && weapon.bleedChance && Math.random() < weapon.bleedChance) {
          targetEnemy.statusEffects.push({ type: 'bleed', stacks: 1, duration: 3 });
          s.combatLog.push(`${targetEnemy.name} is bleeding!`);
        }
        if (weapon?.element === 'fire' && weapon.burnChance && Math.random() < weapon.burnChance) {
          targetEnemy.statusEffects.push({ type: 'burn', stacks: 1, duration: 3 });
          s.combatLog.push(`${targetEnemy.name} is burning!`);
        }
        
        // Check if enemy died
        if (targetEnemy.currentHP <= 0) {
          s.combatLog.push(`${targetEnemy.name} has been defeated!`);
          s.achievementProgress.kills++;
          audioEngine.playDeath();
        }
      });
      
      // Check victory AFTER set completes
      const newState = get();
      if (newState.combat?.enemies.every(e => e.currentHP <= 0)) {
        setTimeout(() => get().endCombat(true), 300);
      }
    },
    
    performBrace: () => set(state => {
      if (!state.combat || state.combat.turn !== 'player') return;
      if (state.combat.ap < 1) return;
      
      state.combat.ap -= 1;
      
      const braceValue = 0.3 + (state.bonuses.braceBonus || 0);
      state.combat.playerBuffs.push({ type: 'brace', value: braceValue, duration: 1 });
      state.combatLog.push(`You brace for impact (-${Math.round(braceValue * 100)}% damage).`);
      audioEngine.playButtonClick();
    }),
    
    activateVATS: () => set(state => {
      if (!state.combat || state.combat.turn !== 'player') return;
      if (state.combat.ap < 3) return;
      
      state.combat.vatsMode = true;
      audioEngine.playButtonClick();
    }),
    
    vatsHeadshot: (targetIndex) => set(state => {
      if (!state.combat || !state.combat.vatsMode) return;
      
      state.combat.vatsMode = false;
      state.combat.ap -= 3;
      
      const enemy = state.combat.enemies[targetIndex];
      if (!enemy || enemy.currentHP <= 0) return;
      
      // Headshot: high crit chance
      const weapon = state.equipment.weapon;
      const baseDamage = weapon ? rollDamage(weapon.damage[0], weapon.damage[1]) : rollDamage(3, 8);
      const isCrit = Math.random() < 0.5 + (state.stats.LCK * 0.02); // 50% base + LCK bonus
      const damage = calculateDamage(baseDamage, { ...state, weaponType: weapon?.weaponType || 'melee' }, enemy, isCrit, { ...state.bonuses, critDamage: (state.bonuses.critDamage || 0) + 0.25 });
      
      enemy.currentHP = Math.max(0, enemy.currentHP - damage);
      
      state.floatingDamage.push({ id: Date.now(), damage, isCrit, targetIndex });
      state.combatLog.push(`V.A.T.S. HEADSHOT! ${isCrit ? 'CRITICAL! ' : ''}${damage} damage to ${enemy.name}!`);
      
      if (isCrit) {
        state.achievementProgress.criticalHits++;
        audioEngine.playCrit();
      } else {
        audioEngine.playHit();
      }
      
      if (enemy.currentHP <= 0) {
        state.combatLog.push(`${enemy.name} has been defeated!`);
        state.achievementProgress.kills++;
        audioEngine.playDeath();
        
        if (state.combat.enemies.every(e => e.currentHP <= 0)) {
          get().endCombat(true);
        }
      }
    }),
    
    vatsBodyshot: (targetIndex) => set(state => {
      if (!state.combat || !state.combat.vatsMode) return;
      
      state.combat.vatsMode = false;
      state.combat.ap -= 3;
      
      const enemy = state.combat.enemies[targetIndex];
      if (!enemy || enemy.currentHP <= 0) return;
      
      // Body shot: guaranteed hit, high damage
      const weapon = state.equipment.weapon;
      const baseDamage = weapon ? rollDamage(weapon.damage[0], weapon.damage[1]) : rollDamage(3, 8);
      const damage = calculateDamage(baseDamage * 1.5, { ...state, weaponType: weapon?.weaponType || 'melee' }, enemy, false, state.bonuses);
      
      enemy.currentHP = Math.max(0, enemy.currentHP - damage);
      
      state.floatingDamage.push({ id: Date.now(), damage, isCrit: false, targetIndex });
      state.combatLog.push(`V.A.T.S. BODY SHOT! ${damage} damage to ${enemy.name}!`);
      audioEngine.playHit();
      
      if (enemy.currentHP <= 0) {
        state.combatLog.push(`${enemy.name} has been defeated!`);
        state.achievementProgress.kills++;
        audioEngine.playDeath();
        
        if (state.combat.enemies.every(e => e.currentHP <= 0)) {
          get().endCombat(true);
        }
      }
    }),
    
    cancelVATS: () => set(state => {
      if (state.combat) {
        state.combat.vatsMode = false;
      }
    }),
    
    consumeItem: (itemUid) => set(state => {
      if (!state.combat || state.combat.turn !== 'player') return;
      if (state.combat.ap < 1) return;
      
      const itemIndex = state.inventory.findIndex(i => i.uid === itemUid);
      if (itemIndex === -1) return;
      
      const item = state.inventory[itemIndex];
      if (item.type !== 'consumable') return;
      
      state.combat.ap -= 1;
      
      // Apply item effect
      switch (item.effect) {
        case 'heal':
          const healBonus = 1 + (state.bonuses.healingBonus || 0);
          const healAmount = Math.floor(item.value * healBonus);
          state.hp = Math.min(state.maxHP, state.hp + healAmount);
          state.combatLog.push(`You use ${item.name} and heal ${healAmount} HP.`);
          state.achievementProgress.healingItemsUsed++;
          audioEngine.playHeal();
          break;
        case 'apBoost':
          state.combat.ap += item.value;
          state.combatLog.push(`You use ${item.name} and gain ${item.value} AP.`);
          audioEngine.playItemPickup();
          break;
        case 'damageBoost':
          state.combat.playerBuffs.push({ type: 'damage', value: item.value, duration: item.duration });
          state.combatLog.push(`You use ${item.name}. +${Math.round(item.value * 100)}% damage for ${item.duration} turns.`);
          audioEngine.playItemPickup();
          break;
        case 'aoeDamage':
          const aoeDamage = rollDamage(item.damage[0], item.damage[1]);
          state.combat.enemies.forEach((enemy, i) => {
            if (enemy.currentHP > 0) {
              enemy.currentHP = Math.max(0, enemy.currentHP - aoeDamage);
              state.floatingDamage.push({ id: Date.now() + i, damage: aoeDamage, isCrit: false, targetIndex: i });
            }
          });
          state.combatLog.push(`You throw ${item.name}! All enemies take ${aoeDamage} damage!`);
          audioEngine.playCrit();
          break;
      }
      
      // Remove item from inventory
      if (item.quantity && item.quantity > 1) {
        state.inventory[itemIndex].quantity--;
      } else {
        state.inventory.splice(itemIndex, 1);
      }
      
      // Check if all enemies dead
      if (state.combat.enemies.every(e => e.currentHP <= 0)) {
        get().endCombat(true);
      }
    }),
    
    endPlayerTurn: () => set(state => {
      if (!state.combat || state.combat.turn !== 'player') return;
      
      state.combat.turn = 'enemy';
      state.combatLog.push('--- Enemy Turn ---');
      
      // Process enemy turn
      setTimeout(() => get().processEnemyTurn(), 500);
    }),
    
    processEnemyTurn: () => {
      const state = get();
      if (!state.combat || state.combat.turn !== 'enemy') return;
      
      // Update state
      set(s => {
        const livingEnemies = s.combat.enemies.filter(e => e.currentHP > 0);
        
        livingEnemies.forEach(enemy => {
          // Check if healer should heal
          if (enemy.isHealer && enemy.healsRemaining > 0) {
            const woundedAlly = s.combat.enemies.find(
              e => e.currentHP > 0 && e.currentHP / e.maxHP < enemy.healThreshold
            );
            if (woundedAlly) {
              const healAmount = rollDamage(enemy.healAmount[0], enemy.healAmount[1]);
              const finalHeal = Math.floor(healAmount * (1 - (s.bonuses.antiHeal || 0) * 0.7));
              woundedAlly.currentHP = Math.min(woundedAlly.maxHP, woundedAlly.currentHP + finalHeal);
              enemy.healsRemaining--;
              s.combatLog.push(`${enemy.name} heals ${woundedAlly.name} for ${finalHeal} HP!`);
              audioEngine.playHeal();
              return;
            }
          }
          
          // Regular attack
          const baseDamage = rollDamage(enemy.scaledDamage[0], enemy.scaledDamage[1]);
          let damage = baseDamage;
          
          // Check for brace
          const braceEffect = s.combat.playerBuffs.find(b => b.type === 'brace');
          if (braceEffect) {
            damage = Math.floor(damage * (1 - braceEffect.value));
          }
          
          // Apply damage reduction
          if (s.bonuses.damageReduction) {
            damage = Math.floor(damage * (1 - s.bonuses.damageReduction));
          }
          
          // Apply defense
          const totalDefense = Object.values(s.equipment)
            .filter(e => e?.defense)
            .reduce((sum, e) => sum + e.defense, 0);
          damage = Math.max(1, damage - Math.floor(totalDefense * 0.5));
          
          s.hp = Math.max(0, s.hp - damage);
          s.combatLog.push(`${enemy.name} attacks you for ${damage} damage!`);
          audioEngine.playHit();
          
          // Brace counter
          if (braceEffect && s.unlockedSkills.includes('braceCounter') && s.equipment.weapon) {
            const counterDamage = Math.floor(rollDamage(s.equipment.weapon.damage[0], s.equipment.weapon.damage[1]) * 0.5);
            enemy.currentHP = Math.max(0, enemy.currentHP - counterDamage);
            s.combatLog.push(`Counter-attack! ${enemy.name} takes ${counterDamage} damage!`);
          }
        });
        
        // Check player death
        if (s.hp <= 0) {
          // Check for Phoenix Protocol or auto-revive
          if (s.unlockedSkills.includes('phoenixProtocol') && !s.combat.phoenixUsed) {
            s.hp = Math.floor(s.maxHP * 0.4);
            s.combat.phoenixUsed = true;
            s.combatLog.push('Phoenix Protocol activated! You revive with 40% HP!');
            audioEngine.playHeal();
          } else if (s.bonuses.autoRevive && !s.combat.reviveUsed) {
            s.hp = Math.floor(s.maxHP * s.bonuses.autoRevive);
            s.combat.reviveUsed = true;
            s.combatLog.push(`You revive with ${Math.floor(s.bonuses.autoRevive * 100)}% HP!`);
            audioEngine.playHeal();
          }
        }
        
        // Process status effects on enemies
        s.combat.enemies.forEach(enemy => {
          if (enemy.currentHP <= 0) return;
          
          enemy.statusEffects.forEach(effect => {
            const tickDamage = calculateStatusDamage(effect.type, effect.stacks);
            enemy.currentHP = Math.max(0, enemy.currentHP - tickDamage);
            s.combatLog.push(`${enemy.name} takes ${tickDamage} ${effect.type} damage.`);
            effect.duration--;
          });
          
          // Remove expired effects
          enemy.statusEffects = enemy.statusEffects.filter(e => e.duration > 0);
        });
        
        // Regen field
        if (s.unlockedSkills.includes('regenField')) {
          const regenAmount = 3;
          s.hp = Math.min(s.maxHP, s.hp + regenAmount);
          s.combatLog.push(`Regen Field heals you for ${regenAmount} HP.`);
        }
        
        // Decrement buff durations
        s.combat.playerBuffs.forEach(buff => buff.duration--);
        s.combat.playerBuffs = s.combat.playerBuffs.filter(b => b.duration > 0);
        
        // Next round setup (will check for victory/death after)
        s.combat.round++;
        s.combat.turn = 'player';
        s.combat.ap = s.maxAP;
        s.combatLog.push(`--- Round ${s.combat.round} ---`);
      });
      
      // Check outcomes AFTER the set completes
      const newState = get();
      
      // Player died
      if (newState.hp <= 0 && !newState.combat?.phoenixUsed && !newState.combat?.reviveUsed) {
        get().endCombat(false);
        return;
      }
      
      // All enemies dead
      if (newState.combat?.enemies.every(e => e.currentHP <= 0)) {
        get().endCombat(true);
        return;
      }
    },
    
    endCombat: (victory) => set(state => {
      if (victory) {
        audioEngine.playVictory();
        state.achievementProgress.combatsWon++;
        
        // Calculate rewards
        const territory = TERRITORIES[state.currentTerritory];
        let totalXP = 0;
        let totalCaps = 0;
        
        state.combat.enemies.forEach(enemy => {
          totalXP += enemy.xp;
          totalCaps += generateCapsDrop(enemy.caps[0], enemy.caps[1], territory.capsMultiplier, state.bonuses);
          
          // Track boss kills
          if (enemy.tier === 'boss') {
            state.achievementProgress.bossKills++;
            state.bossesDefeated.push(enemy.id);
          }
        });
        
        state.xp += totalXP;
        state.caps += totalCaps;
        if (state.caps > state.achievementProgress.capsTotal) {
          state.achievementProgress.capsTotal = state.caps;
        }
        
        // Generate loot drops
        const lootDrops = [];
        if (Math.random() < 0.5) {
          const item = generateLoot(territory.lootTier, state.stats.LCK / 10 + (state.bonuses.lootLuck || 0));
          lootDrops.push(item);
          state.inventory.push(item);
          state.achievementProgress.itemsLooted++;
        }
        
        state.combatLog.push(`Victory! +${totalXP} XP, +${totalCaps} caps${lootDrops.length ? ', ' + lootDrops.map(i => i.name).join(', ') : ''}`);
        
        // Mark tile as cleared
        const { x, y } = state.currentPosition;
        state.mapData[state.currentTerritory][y][x].cleared = true;
        
        // Check level up
        while (state.xp >= xpForLevel(state.level)) {
          state.xp -= xpForLevel(state.level);
          state.level++;
          state.skillPoints += 1 + (state.bonuses.bonusSkillPoints || 0);
          
          // Auto stat gains
          state.stats.STR++;
          state.stats.AGI++;
          state.stats.INT++;
          state.stats.END++;
          state.stats.LCK++;
          state.maxHP = calculateMaxHP(100 + (RACES[state.race]?.hpBonus || 0), state.stats.END, state.level, state.bonuses);
          state.hp = state.maxHP;
          
          // Generate level-up perk choices
          state.levelUpPerks = shuffleArray([...PERK_LIST]).slice(0, 4);
          state.pendingLevelUp = true;
          
          state.combatLog.push(`LEVEL UP! You are now level ${state.level}!`);
          audioEngine.playLevelUp();
        }
        
        // Check boss cleared (territory complete)
        if (state.combat.enemies.some(e => e.tier === 'boss')) {
          state.territoriesCleared.push(state.currentTerritory);
          state.combatLog.push(`Territory cleared! The path forward is now open.`);
        }
        
      } else {
        audioEngine.playDefeat();
        state.combatLog.push('You have been defeated...');
        
        if (state.hardcoreMode) {
          // Permadeath
          state.screen = 'gameOver';
        } else {
          // Respawn at town with penalty
          state.hp = Math.floor(state.maxHP * 0.5);
          state.caps = Math.floor(state.caps * 0.75);
          state.currentPosition = { x: 3, y: 5 }; // Town position
        }
      }
      
      state.combat = null;
      state.screen = victory ? (state.pendingLevelUp ? 'levelUp' : 'map') : (state.hardcoreMode ? 'gameOver' : 'map');
      
      // Auto-save
      setTimeout(() => autoSave(get()), 100);
    }),
    
    // Level Up
    choosePerk: (perkId) => set(state => {
      const perk = PERK_LIST.find(p => p.id === perkId);
      if (!perk) return;
      
      state.chosenPerks.push(perkId);
      
      // Apply perk effects
      Object.entries(perk.effects).forEach(([key, value]) => {
        if (['STR', 'AGI', 'INT', 'END', 'LCK'].includes(key)) {
          state.stats[key] += value;
        } else if (key === 'maxHP') {
          state.bonuses.maxHP = (state.bonuses.maxHP || 0) + value;
          state.maxHP = calculateMaxHP(100 + (RACES[state.race]?.hpBonus || 0), state.stats.END, state.level, state.bonuses);
          state.hp = Math.min(state.hp + value, state.maxHP);
        } else if (key === 'maxAP') {
          state.maxAP += value;
        } else if (key === 'skillPoints') {
          state.skillPoints += value;
        } else if (key === 'caps') {
          state.caps += value;
        } else {
          state.bonuses[key] = (state.bonuses[key] || 0) + value;
        }
      });
      
      state.pendingLevelUp = false;
      state.levelUpPerks = [];
      state.screen = 'map';
      
      audioEngine.playLevelUp();
      setTimeout(() => autoSave(get()), 100);
    }),
    
    // Skills
    unlockSkill: (skillId) => set(state => {
      const skill = SKILL_TREE[skillId];
      if (!skill) return;
      if (state.skillPoints < skill.cost) return;
      if (state.unlockedSkills.includes(skillId)) return;
      
      // Check requirements
      if (skill.requires?.length) {
        const hasAllReqs = skill.requires.every(req => state.unlockedSkills.includes(req));
        if (!hasAllReqs) return;
      }
      
      state.skillPoints -= skill.cost;
      state.unlockedSkills.push(skillId);
      state.achievementProgress.skillsUnlocked++;
      
      audioEngine.playLevelUp();
      setTimeout(() => autoSave(get()), 100);
    }),
    
    // Inventory & Equipment
    equipItem: (itemUid) => set(state => {
      const itemIndex = state.inventory.findIndex(i => i.uid === itemUid);
      if (itemIndex === -1) return;
      
      const item = state.inventory[itemIndex];
      let slot = item.slot || (item.type === 'weapon' ? 'weapon' : null);
      
      if (!slot) return;
      
      // Handle ring slots
      if (slot === 'ring') {
        slot = state.equipment.ring1 ? 'ring2' : 'ring1';
      }
      
      // Unequip current item
      if (state.equipment[slot]) {
        state.inventory.push(state.equipment[slot]);
      }
      
      // Equip new item
      state.equipment[slot] = item;
      state.inventory.splice(itemIndex, 1);
      
      // Recalculate stats
      state.maxHP = calculateMaxHP(100 + (RACES[state.race]?.hpBonus || 0), state.stats.END, state.level, state.bonuses);
      
      audioEngine.playItemPickup();
    }),
    
    unequipItem: (slot) => set(state => {
      if (!state.equipment[slot]) return;
      
      state.inventory.push(state.equipment[slot]);
      state.equipment[slot] = null;
      
      audioEngine.playItemPickup();
    }),
    
    sellItem: (itemUid) => set(state => {
      const itemIndex = state.inventory.findIndex(i => i.uid === itemUid);
      if (itemIndex === -1) return;
      
      const item = state.inventory[itemIndex];
      const sellPrice = Math.floor((item.value || item.price || 10) * 0.4);
      
      state.caps += sellPrice;
      state.inventory.splice(itemIndex, 1);
      
      audioEngine.playItemPickup();
    }),
    
    buyItem: (item, shopIndex) => set(state => {
      const price = Math.floor((item.value || item.price || 10) * (1 - (state.bonuses.shopDiscount || 0)));
      if (state.caps < price) return;
      
      state.caps -= price;
      
      const purchasedItem = { ...item, uid: `purchased_${item.id}_${Date.now()}` };
      state.inventory.push(purchasedItem);
      state.achievementProgress.itemsBought++;
      
      audioEngine.playItemPickup();
    }),
    
    // Town Services
    healAtClinic: () => set(state => {
      const cost = Math.ceil((state.maxHP - state.hp) * 0.5);
      if (state.caps < cost) return;
      
      state.caps -= cost;
      state.hp = state.maxHP;
      state.rad = 0;
      
      audioEngine.playHeal();
    }),
    
    // Clear floating damage
    clearFloatingDamage: (id) => set(state => {
      state.floatingDamage = state.floatingDamage.filter(d => d.id !== id);
    }),
    
    // Reset game
    resetGame: () => set(state => {
      const initial = createInitialState();
      Object.keys(initial).forEach(key => {
        state[key] = initial[key];
      });
      state.screen = 'title';
    }),
    
    // ===== RIFT SYSTEM =====
    selectRiftOption: (option, rollResult) => {
      const state = get();
      const { currentRift, currentTerritory } = state;
      
      if (!currentRift || !rollResult) return;

      const { encounter, tilePos } = currentRift;
      
      set(s => {
        // Pay HP cost
        s.hp = Math.max(0, s.hp - encounter.hpCost);
        
        if (rollResult.success) {
          // Success rewards
          const reward = option.successReward;
          
          if (reward.caps) s.caps += reward.caps;
          if (reward.xp) s.xp += reward.xp;
          if (reward.hpHeal) s.hp = Math.min(s.maxHP, s.hp + reward.hpHeal);
          
          // Item rewards
          if (reward.item) {
            const territory = TERRITORIES[currentTerritory];
            let item;
            
            if (reward.item === 'random') {
              item = generateLoot('common', s.stats.LCK / 10);
            } else if (reward.item === 'rare') {
              item = generateLoot('rare', s.stats.LCK / 10);
            } else if (reward.item === 'epic') {
              item = generateLoot('epic', s.stats.LCK / 10);
            } else if (reward.item === 'legendary') {
              item = generateLoot('legendary', s.stats.LCK / 10);
            } else if (reward.item === 'exotic') {
              item = generateLoot('exotic', s.stats.LCK / 10);
            }
            
            if (item && s.inventory.length < 30) {
              s.inventory.push(item);
            }
          }
          
          // Skill rewards (TODO: implement skill system)
          if (reward.skill) {
            // Future: add skill XP or unlock
          }
        } else {
          // Failure penalties
          const penalty = option.failurePenalty;
          
          if (penalty.hpLoss) {
            s.hp = Math.max(0, s.hp - penalty.hpLoss);
          }
          if (penalty.capsLoss) {
            s.caps = Math.max(0, s.caps - penalty.capsLoss);
          }
          if (penalty.xpLoss) {
            s.xp = Math.max(0, s.xp - penalty.xpLoss);
          }
          
          // Status effects (TODO: implement status system)
          if (penalty.status) {
            // Future: apply status effect
          }
        }
        
        // Mark tile as cleared
        if (tilePos && s.mapData[currentTerritory]?.[tilePos.y]?.[tilePos.x]) {
          s.mapData[currentTerritory][tilePos.y][tilePos.x].cleared = true;
        }
        
        // Check if player died
        if (s.hp <= 0) {
          s.screen = 'gameOver';
          s.deathReason = rollResult.success ? 'Rift HP cost' : 'Failed rift challenge';
        } else {
          // Return to map
          s.screen = 'map';
        }
        
        s.currentRift = null;
      });
      
      // Auto-save
      setTimeout(() => autoSave(get()), 100);
    },
    
    exitRift: () => set(state => {
      state.currentRift = null;
      state.screen = 'map';
    }),
  }))
);

export default useGameStore;

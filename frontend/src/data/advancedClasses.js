// Advanced Class Milestones - Level 10, 20, 30, 40, 50 upgrades
export const ADVANCED_CLASSES = {
  warrior: {
    archetype: 'warrior',
    milestones: [
      {
        level: 10,
        pathA: { name: 'Vanguard', effects: { maxHP: 25, STR: 2 }, description: '+25 HP, +2 STR' },
        pathB: { name: 'Defender', effects: { damageReduction: 0.1, END: 2 }, description: '-10% damage taken, +2 END' }
      },
      {
        level: 20,
        pathA: { name: 'Warlord', effects: { meleeDamage: 0.2, STR: 3 }, description: '+20% melee damage, +3 STR' },
        pathB: { name: 'Sentinel', effects: { maxHP: 40, braceBonus: 0.15 }, description: '+40 HP, +15% brace effectiveness' }
      },
      {
        level: 30,
        pathA: { name: 'Ravager', effects: { critChance: 0.1, critDamage: 0.25 }, description: '+10% crit, +25% crit damage' },
        pathB: { name: 'Juggernaut', effects: { maxHP: 50, damageReduction: 0.1 }, description: '+50 HP, -10% damage taken' }
      },
      {
        level: 40,
        pathA: { name: 'Destroyer', effects: { allDamage: 0.15, executeThreshold: 0.15 }, description: '+15% damage, execute below 15% HP' },
        pathB: { name: 'Fortress', effects: { maxHP: 60, thorns: 0.2 }, description: '+60 HP, reflect 20% damage' }
      },
      {
        level: 50,
        pathA: { name: 'WAR GOD', effects: { maxHP: 60, allStats: 5, executeThreshold: 0.2 }, description: '+60 HP, +5 all stats, execute below 20%' },
        pathB: { name: 'IMMORTAL', effects: { maxHP: 70, autoRevive: 0.4, damageReduction: 0.2 }, description: '+70 HP, revive at 40%, -20% damage' },
        ascended: { name: 'APEX WARLORD', effects: { allStats: 8, braceCounter: 2, thorns: 0.25, executeThreshold: 0.25 }, description: '+8 all stats, 200% brace counter, 25% reflect, execute below 25%' }
      }
    ]
  },
  gunslinger: {
    archetype: 'gunslinger',
    milestones: [
      {
        level: 10,
        pathA: { name: 'Quickshot', effects: { AGI: 3, critChance: 0.05 }, description: '+3 AGI, +5% crit' },
        pathB: { name: 'Deadeye', effects: { rangedDamage: 0.15, LCK: 2 }, description: '+15% ranged damage, +2 LCK' }
      },
      {
        level: 20,
        pathA: { name: 'Pistolero', effects: { attacks: 1, AGI: 2 }, description: '+1 attack per action, +2 AGI' },
        pathB: { name: 'Sharpshooter', effects: { critDamage: 0.3, critChance: 0.1 }, description: '+30% crit damage, +10% crit' }
      },
      {
        level: 30,
        pathA: { name: 'Gun Dancer', effects: { dodgeChance: 0.15, AGI: 3 }, description: '+15% dodge, +3 AGI' },
        pathB: { name: 'Marksman', effects: { rangedDamage: 0.25, headshot: 0.1 }, description: '+25% ranged, +10% instant kill on crit' }
      },
      {
        level: 40,
        pathA: { name: 'Bullet Storm', effects: { apRegen: 1, attacks: 1 }, description: '+1 AP regen, +1 attack' },
        pathB: { name: 'Sniper Elite', effects: { critChance: 0.15, critDamage: 0.4 }, description: '+15% crit, +40% crit damage' }
      },
      {
        level: 50,
        pathA: { name: 'ACE GUNNER', effects: { allStats: 4, critChance: 0.15 }, description: '+4 all stats, +15% crit' },
        pathB: { name: 'PHANTOM ACE', effects: { dodgeChance: 0.3, instantKill: 0.25 }, description: '30% dodge, 25% instant-kill on crits vs <30% HP' },
        ascended: { name: 'WASTELAND ACE', effects: { allStats: 6, dodgeChance: 0.5, freeHeadshot: true, critChance: 0.2 }, description: '+6 all stats, 50% dodge, free headshot, +20% crit' }
      }
    ]
  },
  sniper: {
    archetype: 'sniper',
    milestones: [
      { level: 10, pathA: { name: 'Scout', effects: { AGI: 3, LCK: 2 }, description: '+3 AGI, +2 LCK' }, pathB: { name: 'Spotter', effects: { critChance: 0.1, rangedDamage: 0.1 }, description: '+10% crit, +10% ranged' } },
      { level: 20, pathA: { name: 'Assassin', effects: { critDamage: 0.35, firstStrike: 0.2 }, description: '+35% crit dmg, +20% first hit damage' }, pathB: { name: 'Overwatch', effects: { counterAttack: true, rangedDamage: 0.15 }, description: 'Counter-attack ranged, +15% ranged' } },
      { level: 30, pathA: { name: 'Phantom', effects: { dodgeChance: 0.2, critChance: 0.1 }, description: '+20% dodge, +10% crit' }, pathB: { name: 'Predator', effects: { executeThreshold: 0.2, critDamage: 0.25 }, description: 'Execute <20% HP, +25% crit dmg' } },
      { level: 40, pathA: { name: 'Ghost', effects: { invisible: 1, critChance: 0.15 }, description: '1 turn invisible start, +15% crit' }, pathB: { name: 'Terminator', effects: { allDamage: 0.25, penetration: 0.2 }, description: '+25% damage, ignore 20% defense' } },
      { level: 50, pathA: { name: 'SILENT DEATH', effects: { allStats: 5, instantKill: 0.3, critChance: 0.2 }, description: '+5 stats, 30% instant kill on crit, +20% crit' }, pathB: { name: 'APEX HUNTER', effects: { allStats: 4, executeThreshold: 0.35, critDamage: 0.5 }, description: '+4 stats, execute <35%, +50% crit dmg' }, ascended: { name: 'DEATH INCARNATE', effects: { allStats: 7, guaranteedCrit: 0.25, instantKill: 0.4 }, description: '+7 stats, 25% guaranteed crit, 40% instant kill' } }
    ]
  },
  berserker: {
    archetype: 'berserker',
    milestones: [
      { level: 10, pathA: { name: 'Rager', effects: { lowHPDamage: 0.2, STR: 2 }, description: '+20% damage <50% HP, +2 STR' }, pathB: { name: 'Brute', effects: { maxHP: 30, END: 2 }, description: '+30 HP, +2 END' } },
      { level: 20, pathA: { name: 'Bloodlust', effects: { lifesteal: 0.15, STR: 3 }, description: '15% lifesteal, +3 STR' }, pathB: { name: 'Bulwark', effects: { maxHP: 45, damageReduction: 0.1 }, description: '+45 HP, -10% damage taken' } },
      { level: 30, pathA: { name: 'Frenzy', effects: { attackSpeed: 1, lowHPDamage: 0.25 }, description: '+1 attack, +25% low HP damage' }, pathB: { name: 'Colossus', effects: { maxHP: 60, thorns: 0.15 }, description: '+60 HP, 15% thorns' } },
      { level: 40, pathA: { name: 'Blood God', effects: { lifesteal: 0.25, critChance: 0.15 }, description: '25% lifesteal, +15% crit' }, pathB: { name: 'Titan', effects: { maxHP: 80, unstoppable: true }, description: '+80 HP, immune to stun' } },
      { level: 50, pathA: { name: 'RAGE INCARNATE', effects: { allStats: 4, lowHPDamage: 0.5, lifesteal: 0.3 }, description: '+4 stats, +50% dmg <30% HP, 30% lifesteal' }, pathB: { name: 'UNKILLABLE', effects: { maxHP: 100, autoRevive: 0.5, damageReduction: 0.25 }, description: '+100 HP, revive at 50%, -25% damage' }, ascended: { name: 'DOOM BRINGER', effects: { allStats: 6, allDamage: 0.4, lifesteal: 0.4, enrage: true }, description: '+6 stats, +40% damage, 40% lifesteal, permanent enrage' } }
    ]
  },
  ghost: {
    archetype: 'ghost',
    milestones: [
      { level: 10, pathA: { name: 'Shadow', effects: { AGI: 4, bleedChance: 0.1 }, description: '+4 AGI, +10% bleed' }, pathB: { name: 'Stalker', effects: { critChance: 0.1, critDamage: 0.2 }, description: '+10% crit, +20% crit dmg' } },
      { level: 20, pathA: { name: 'Wraith', effects: { dodgeChance: 0.2, phaseStrike: true }, description: '+20% dodge, phase through first attack' }, pathB: { name: 'Executioner', effects: { executeThreshold: 0.2, bleedDamage: 0.25 }, description: 'Execute <20%, +25% bleed damage' } },
      { level: 30, pathA: { name: 'Specter', effects: { invisible: 2, AGI: 3 }, description: '2 turns invisible, +3 AGI' }, pathB: { name: 'Reaper', effects: { critChance: 0.15, instantKill: 0.1 }, description: '+15% crit, 10% instant kill' } },
      { level: 40, pathA: { name: 'Phantom', effects: { dodgeChance: 0.25, counterAttack: 0.5 }, description: '25% dodge, 50% counter' }, pathB: { name: 'Assassin Lord', effects: { allDamage: 0.3, executeThreshold: 0.25 }, description: '+30% damage, execute <25%' } },
      { level: 50, pathA: { name: 'VOID WALKER', effects: { allStats: 5, dodgeChance: 0.4, phaseAll: true }, description: '+5 stats, 40% dodge, phase all first turn' }, pathB: { name: 'DEATH SHADOW', effects: { allStats: 4, instantKill: 0.25, critChance: 0.25 }, description: '+4 stats, 25% instant kill, 25% crit' }, ascended: { name: 'OBLIVION', effects: { allStats: 8, guaranteedCrit: 0.5, instantKill: 0.35, invisible: 3 }, description: '+8 stats, 50% guaranteed crit, 35% instant kill, 3 turn invisible' } }
    ]
  },
  scavenger: {
    archetype: 'scavenger',
    milestones: [
      { level: 10, pathA: { name: 'Looter', effects: { lootLuck: 0.2, caps: 0.15 }, description: '+20% loot luck, +15% caps' }, pathB: { name: 'Scrapper', effects: { AGI: 3, bleedChance: 0.15 }, description: '+3 AGI, +15% bleed' } },
      { level: 20, pathA: { name: 'Treasure Hunter', effects: { lootLuck: 0.3, rareLoot: 0.1 }, description: '+30% loot, +10% rare chance' }, pathB: { name: 'Blade Dancer', effects: { attacks: 1, AGI: 2 }, description: '+1 attack, +2 AGI' } },
      { level: 30, pathA: { name: 'Hoarder', effects: { lootLuck: 0.4, shopDiscount: 0.2 }, description: '+40% loot, -20% shop prices' }, pathB: { name: 'Cutthroat', effects: { critChance: 0.15, bleedDamage: 0.3 }, description: '+15% crit, +30% bleed damage' } },
      { level: 40, pathA: { name: 'Kingpin', effects: { caps: 0.5, blackMarket: true }, description: '+50% caps, black market access' }, pathB: { name: 'Assassin', effects: { instantKill: 0.15, critDamage: 0.35 }, description: '15% instant kill, +35% crit dmg' } },
      { level: 50, pathA: { name: 'GOLDEN TOUCH', effects: { allStats: 3, lootLuck: 0.6, caps: 1.0 }, description: '+3 stats, +60% loot, +100% caps' }, pathB: { name: 'SHADOW BLADE', effects: { allStats: 5, instantKill: 0.25, bleedChance: 0.5 }, description: '+5 stats, 25% instant kill, 50% bleed' }, ascended: { name: 'FORTUNE MASTER', effects: { allStats: 6, celestialLoot: 0.1, caps: 2.0, lootLuck: 1.0 }, description: '+6 stats, 10% celestial drop, +200% caps, +100% loot' } }
    ]
  },
  doc: {
    archetype: 'doc',
    milestones: [
      { level: 10, pathA: { name: 'Medic', effects: { healingBonus: 0.25, INT: 2 }, description: '+25% healing, +2 INT' }, pathB: { name: 'Surgeon', effects: { bleedChance: 0.2, critChance: 0.1 }, description: '+20% bleed, +10% crit' } },
      { level: 20, pathA: { name: 'Field Doctor', effects: { healingBonus: 0.4, regenPerTurn: 5 }, description: '+40% healing, +5 HP/turn' }, pathB: { name: 'Combat Doc', effects: { allDamage: 0.15, lifesteal: 0.1 }, description: '+15% damage, 10% lifesteal' } },
      { level: 30, pathA: { name: 'Lifesaver', effects: { autoHeal: 0.2, maxHP: 30 }, description: 'Auto-heal 20% when <30% HP, +30 HP' }, pathB: { name: 'Battle Medic', effects: { allDamage: 0.2, healingBonus: 0.2 }, description: '+20% damage, +20% healing' } },
      { level: 40, pathA: { name: 'Miracle Worker', effects: { reviveAlly: true, healingBonus: 0.5 }, description: 'Can revive once, +50% healing' }, pathB: { name: 'War Doctor', effects: { allStats: 3, lifesteal: 0.2 }, description: '+3 all stats, 20% lifesteal' } },
      { level: 50, pathA: { name: 'SAINT', effects: { allStats: 4, healingBonus: 1.0, autoRevive: 0.6 }, description: '+4 stats, +100% healing, revive at 60%' }, pathB: { name: 'PLAGUE DOCTOR', effects: { allStats: 5, poisonImmune: true, allDamage: 0.3, lifesteal: 0.3 }, description: '+5 stats, poison immune, +30% dmg, 30% lifesteal' }, ascended: { name: 'DIVINE HEALER', effects: { allStats: 7, healingBonus: 2.0, fullRevive: true, regenPerTurn: 15 }, description: '+7 stats, +200% healing, full HP revive, +15 HP/turn' } }
    ]
  },
  grunt: {
    archetype: 'grunt',
    milestones: [
      { level: 10, pathA: { name: 'Soldier', effects: { STR: 2, END: 2, defense: 3 }, description: '+2 STR/END, +3 defense' }, pathB: { name: 'Trooper', effects: { maxHP: 25, damageReduction: 0.05 }, description: '+25 HP, -5% damage taken' } },
      { level: 20, pathA: { name: 'Sergeant', effects: { allDamage: 0.15, defense: 5 }, description: '+15% damage, +5 defense' }, pathB: { name: 'Tank', effects: { maxHP: 40, thorns: 0.1 }, description: '+40 HP, 10% thorns' } },
      { level: 30, pathA: { name: 'Lieutenant', effects: { critChance: 0.1, allDamage: 0.2 }, description: '+10% crit, +20% damage' }, pathB: { name: 'Fortress', effects: { maxHP: 55, damageReduction: 0.15 }, description: '+55 HP, -15% damage taken' } },
      { level: 40, pathA: { name: 'Captain', effects: { allStats: 3, executeThreshold: 0.15 }, description: '+3 all stats, execute <15%' }, pathB: { name: 'Colossus', effects: { maxHP: 70, unstoppable: true }, description: '+70 HP, immune to stun/slow' } },
      { level: 50, pathA: { name: 'COMMANDER', effects: { allStats: 5, allDamage: 0.3, leadership: true }, description: '+5 stats, +30% damage, leadership aura' }, pathB: { name: 'IRON WALL', effects: { maxHP: 100, damageReduction: 0.3, thorns: 0.25 }, description: '+100 HP, -30% damage, 25% thorns' }, ascended: { name: 'GENERAL', effects: { allStats: 8, allDamage: 0.4, damageReduction: 0.2, maxHP: 80 }, description: '+8 stats, +40% damage, -20% damage taken, +80 HP' } }
    ]
  },
  pyro: {
    archetype: 'pyro',
    milestones: [
      { level: 10, pathA: { name: 'Firestarter', effects: { burnChance: 0.15, fireDamage: 0.15 }, description: '+15% burn, +15% fire damage' }, pathB: { name: 'Pyromaniac', effects: { AGI: 3, burnDamage: 0.2 }, description: '+3 AGI, +20% burn tick damage' } },
      { level: 20, pathA: { name: 'Arsonist', effects: { burnChance: 0.25, aoeBonus: 0.2 }, description: '+25% burn, +20% AOE damage' }, pathB: { name: 'Inferno', effects: { fireDamage: 0.3, burnSpread: true }, description: '+30% fire damage, burns spread' } },
      { level: 30, pathA: { name: 'Firelord', effects: { fireImmune: true, fireDamage: 0.35 }, description: 'Fire immune, +35% fire damage' }, pathB: { name: 'Hellfire', effects: { burnChance: 0.4, burnDamage: 0.4 }, description: '+40% burn chance, +40% burn damage' } },
      { level: 40, pathA: { name: 'Conflagration', effects: { aoeBonus: 0.4, burnChance: 0.5 }, description: '+40% AOE, +50% burn' }, pathB: { name: 'Ember', effects: { fireDamage: 0.5, ignite: true }, description: '+50% fire damage, ignite on hit' } },
      { level: 50, pathA: { name: 'INFERNO MASTER', effects: { allStats: 4, fireDamage: 0.6, aoeBonus: 0.5 }, description: '+4 stats, +60% fire, +50% AOE' }, pathB: { name: 'PHOENIX', effects: { allStats: 5, fireImmune: true, autoRevive: 0.8, burnAura: true }, description: '+5 stats, fire immune, revive 80%, burn aura' }, ascended: { name: 'APOCALYPSE FLAME', effects: { allStats: 7, fireDamage: 1.0, burnChance: 1.0, meteorStrike: true }, description: '+7 stats, +100% fire, guaranteed burn, meteor strike ability' } }
    ]
  },
  engineer: {
    archetype: 'engineer',
    milestones: [
      { level: 10, pathA: { name: 'Technician', effects: { INT: 3, shockChance: 0.1 }, description: '+3 INT, +10% shock' }, pathB: { name: 'Mechanic', effects: { defense: 5, repairBot: true }, description: '+5 defense, repair bot (+10 HP/turn)' } },
      { level: 20, pathA: { name: 'Electrician', effects: { shockDamage: 0.3, stunDuration: 1 }, description: '+30% shock damage, +1 stun duration' }, pathB: { name: 'Inventor', effects: { gadgetSlots: 1, INT: 3 }, description: '+1 gadget slot, +3 INT' } },
      { level: 30, pathA: { name: 'Tesla', effects: { shockChance: 0.35, chainLightning: true }, description: '+35% shock, chain lightning' }, pathB: { name: 'Roboticist', effects: { summonDrone: true, INT: 4 }, description: 'Summon combat drone, +4 INT' } },
      { level: 40, pathA: { name: 'Storm Caller', effects: { shockDamage: 0.5, permanentStun: 0.1 }, description: '+50% shock, 10% permanent stun' }, pathB: { name: 'Architect', effects: { turret: true, defense: 10 }, description: 'Deploy turret, +10 defense' } },
      { level: 50, pathA: { name: 'THUNDER GOD', effects: { allStats: 4, shockDamage: 0.8, chainLightning: 3 }, description: '+4 stats, +80% shock, chain 3 targets' }, pathB: { name: 'MECH LORD', effects: { allStats: 5, mechSuit: true, defense: 20 }, description: '+5 stats, mech suit (+50% HP, +30% damage)' }, ascended: { name: 'TECH OVERLORD', effects: { allStats: 8, allDamage: 0.5, permanentStun: 0.2, summonArmy: true }, description: '+8 stats, +50% damage, 20% perma-stun, summon robot army' } }
    ]
  }
};

export const getAdvancedClassMilestone = (archetypeId, level) => {
  const classData = ADVANCED_CLASSES[archetypeId];
  if (!classData) return null;
  return classData.milestones.find(m => m.level === level);
};

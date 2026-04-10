// Dice rolling and combat calculations

// Roll a d20
export const rollD20 = () => Math.floor(Math.random() * 20) + 1;

// Roll damage within a range [min, max]
export const rollDamage = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Calculate hit chance based on attacker AGI vs defender AGI
export const calculateHitChance = (attackerAGI, defenderAGI) => {
  const base = 0.75;
  const agiDiff = (attackerAGI - defenderAGI) * 0.02;
  return Math.min(0.95, Math.max(0.4, base + agiDiff));
};

// Calculate crit chance based on LCK and bonuses
export const calculateCritChance = (luck, bonuses = {}) => {
  const base = 0.05; // 5% base crit
  const luckBonus = luck * 0.01; // 1% per LCK
  const extraBonus = bonuses.critChance || 0;
  return Math.min(0.75, base + luckBonus + extraBonus);
};

// Calculate damage with all modifiers
export const calculateDamage = (baseDamage, attacker, defender, isCrit = false, bonuses = {}) => {
  let damage = baseDamage;
  
  // STR bonus for melee, AGI/INT for ranged
  const statBonus = attacker.weaponType === 'melee' 
    ? attacker.stats.STR * 0.5 
    : (attacker.stats.AGI * 0.3 + attacker.stats.INT * 0.2);
  
  damage += statBonus;
  
  // Apply flat damage bonuses
  damage += bonuses.flatDamage || 0;
  
  // Apply percentage damage bonuses
  const percentBonus = 1 + (bonuses.damageDealt || 0) + (bonuses.meleeDamage || 0) + (bonuses.rangedDamage || 0);
  damage *= percentBonus;
  
  // Critical hit multiplier
  if (isCrit) {
    const critMultiplier = 1.5 + (bonuses.critDamage || 0);
    damage *= critMultiplier;
  }
  
  // Low HP berserker bonus
  if (bonuses.lowHPDamage && attacker.hp / attacker.maxHP < 0.3) {
    damage *= (1 + bonuses.lowHPDamage);
  }
  
  // Executioner bonus (enemy low HP)
  if (bonuses.executeBonus && defender.hp / defender.maxHP < 0.3) {
    damage *= (1 + bonuses.executeBonus);
  }
  
  // Defense reduction
  const defenseReduction = defender.defense * 0.5;
  damage = Math.max(1, damage - defenseReduction);
  
  // Damage taken modifier on defender
  if (bonuses.damageTaken) {
    damage *= (1 + bonuses.damageTaken);
  }
  
  return Math.round(damage);
};

// Calculate dodge chance
export const calculateDodgeChance = (agi, bonuses = {}) => {
  const base = agi * 0.01; // 1% per AGI
  const bonus = bonuses.dodgeChance || 0;
  return Math.min(0.5, base + bonus);
};

// Perform an attack roll
export const performAttackRoll = (attacker, defender, bonuses = {}) => {
  const roll = rollD20();
  const isCrit = roll === 20 || Math.random() < calculateCritChance(attacker.stats.LCK, bonuses);
  const isMiss = roll === 1;
  
  // Check dodge
  const dodgeChance = calculateDodgeChance(defender.stats?.AGI || 0, defender.bonuses || {});
  const dodged = !isMiss && !isCrit && Math.random() < dodgeChance;
  
  return { roll, isCrit, isMiss, dodged };
};

// Calculate status effect damage
export const calculateStatusDamage = (effect, stacks = 1) => {
  const damages = {
    burn: 5,
    bleed: 4,
    poison: 3,
    radiation: 2
  };
  return (damages[effect] || 0) * stacks;
};

// XP needed for next level (linear curve)
export const xpForLevel = (level) => 200 + level * 50;

// Total XP to reach a level
export const totalXpForLevel = (level) => {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += xpForLevel(i);
  }
  return total;
};

// Calculate max HP
export const calculateMaxHP = (baseHP, endurance, level, bonuses = {}) => {
  const endBonus = endurance * 5;
  const levelBonus = (level - 1) * 12;
  const flatBonus = bonuses.maxHP || 0;
  return baseHP + endBonus + levelBonus + flatBonus;
};

// Random number in range
export const randomInRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Weighted random selection
export const weightedRandom = (weights) => {
  const total = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    random -= weights[i];
    if (random <= 0) return i;
  }
  return weights.length - 1;
};

// Shuffle array
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

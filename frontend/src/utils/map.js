// Map generation and exploration utilities
import { TERRITORIES } from '../data/territories';
import { ENEMIES } from '../data/enemies';

// Tile types
export const TILE_TYPES = {
  EMPTY: 'empty',
  FIGHT: 'fight',
  ELITE: 'elite',
  BOSS: 'boss',
  TOWN: 'town',
  DUNGEON: 'dungeon',
  NPC: 'npc',
  LOOT: 'loot',
  RIFT: 'rift'
};

// Generate a 7x7 map for a territory
export const generateTerritoryMap = (territoryId) => {
  const territory = TERRITORIES[territoryId];
  if (!territory) return null;
  
  const map = [];
  
  for (let y = 0; y < 7; y++) {
    const row = [];
    for (let x = 0; x < 7; x++) {
      row.push(generateTile(x, y, territory));
    }
    map.push(row);
  }
  
  // Ensure boss is at top center (3, 0)
  map[0][3] = {
    type: TILE_TYPES.BOSS,
    enemy: territory.boss,
    explored: false,
    cleared: false
  };
  
  // Ensure town is near start (bottom area)
  map[5][3] = {
    type: TILE_TYPES.TOWN,
    explored: false,
    cleared: true // Towns are always "cleared"
  };
  
  // Starting position is safe
  map[6][3] = {
    type: TILE_TYPES.EMPTY,
    explored: true,
    cleared: true
  };
  
  // Add guaranteed dungeon
  const dungeonY = Math.floor(Math.random() * 3) + 2;
  const dungeonX = Math.random() < 0.5 ? 1 : 5;
  map[dungeonY][dungeonX] = {
    type: TILE_TYPES.DUNGEON,
    explored: false,
    cleared: false,
    waves: 3 + Math.floor(Math.random() * 3)
  };
  
  // Add NPC if territory has one
  const npcY = Math.floor(Math.random() * 4) + 1;
  const npcX = Math.floor(Math.random() * 5) + 1;
  if (map[npcY][npcX].type === TILE_TYPES.FIGHT) {
    map[npcY][npcX] = {
      type: TILE_TYPES.NPC,
      explored: false,
      cleared: false
    };
  }
  
  return map;
};

// Generate a single tile
const generateTile = (x, y, territory) => {
  // Skip special positions
  if ((x === 3 && y === 0) || (x === 3 && y === 5) || (x === 3 && y === 6)) {
    return { type: TILE_TYPES.EMPTY, explored: false, cleared: true };
  }
  
  const roll = Math.random();
  
  // 50% regular fight
  if (roll < 0.5) {
    const enemies = territory.enemies;
    const enemyId = enemies[Math.floor(Math.random() * enemies.length)];
    const enemyCount = Math.random() < 0.3 ? Math.floor(Math.random() * 2) + 2 : 1;
    
    return {
      type: TILE_TYPES.FIGHT,
      enemies: Array(enemyCount).fill(enemyId),
      explored: false,
      cleared: false
    };
  }
  
  // 15% elite fight
  if (roll < 0.65) {
    const elites = territory.elites;
    const eliteId = elites[Math.floor(Math.random() * elites.length)];
    
    return {
      type: TILE_TYPES.ELITE,
      enemies: [eliteId],
      explored: false,
      cleared: false
    };
  }
  
  // 15% loot cache
  if (roll < 0.8) {
    return {
      type: TILE_TYPES.LOOT,
      explored: false,
      cleared: false,
      lootCount: Math.floor(Math.random() * 2) + 1
    };
  }
  
  // 5% rift event
  if (roll < 0.85) {
    return {
      type: TILE_TYPES.RIFT,
      explored: false,
      cleared: false
    };
  }
  
  // 15% empty
  return {
    type: TILE_TYPES.EMPTY,
    explored: false,
    cleared: true
  };
};

// Check if a move is valid (adjacent tile)
export const isValidMove = (fromX, fromY, toX, toY) => {
  const dx = Math.abs(toX - fromX);
  const dy = Math.abs(toY - fromY);
  // Only cardinal directions (no diagonals)
  return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
};

// Get adjacent tiles
export const getAdjacentTiles = (x, y) => {
  const adjacent = [];
  const directions = [
    { dx: 0, dy: -1 }, // up
    { dx: 0, dy: 1 },  // down
    { dx: -1, dy: 0 }, // left
    { dx: 1, dy: 0 }   // right
  ];
  
  directions.forEach(({ dx, dy }) => {
    const newX = x + dx;
    const newY = y + dy;
    if (newX >= 0 && newX < 7 && newY >= 0 && newY < 7) {
      adjacent.push({ x: newX, y: newY });
    }
  });
  
  return adjacent;
};

// Generate enemies for combat
export const generateCombatEnemies = (tile, territory) => {
  if (!tile.enemies) return [];
  
  return tile.enemies.map((enemyId, index) => {
    const template = ENEMIES[enemyId];
    if (!template) return null;
    
    // Scale enemy based on territory
    const levelScale = 1 + (territory.order - 1) * 0.2;
    
    return {
      ...template,
      uid: `${enemyId}_${index}_${Date.now()}`,
      currentHP: Math.round(template.hp * levelScale),
      maxHP: Math.round(template.hp * levelScale),
      scaledDamage: [
        Math.round(template.damage[0] * levelScale),
        Math.round(template.damage[1] * levelScale)
      ],
      healsRemaining: template.isHealer ? (template.maxHeals || 3) : 0,
      statusEffects: []
    };
  }).filter(Boolean);
};

// Get tile icon
export const getTileIcon = (tile, explored) => {
  if (!explored) return '❓';
  if (tile.cleared) {
    switch (tile.type) {
      case TILE_TYPES.TOWN: return '🏘️';
      default: return '✅';
    }
  }
  
  switch (tile.type) {
    case TILE_TYPES.FIGHT: return '⚔️';
    case TILE_TYPES.ELITE: return '💠';
    case TILE_TYPES.BOSS: return '👹';
    case TILE_TYPES.TOWN: return '🏘️';
    case TILE_TYPES.DUNGEON: return '🕳️';
    case TILE_TYPES.NPC: return '🗣️';
    case TILE_TYPES.LOOT: return '💼';
    case TILE_TYPES.RIFT: return '🌀';
    case TILE_TYPES.EMPTY: return '·';
    default: return '·';
  }
};

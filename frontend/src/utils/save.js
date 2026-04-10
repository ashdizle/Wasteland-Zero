// Save/Load system with 3 slots using localStorage

const SAVE_PREFIX = 'wasteland_zero_save_';
const SETTINGS_KEY = 'wasteland_zero_settings';

// Create initial game state
export const createInitialState = () => ({
  // Meta
  saveSlot: null,
  createdAt: null,
  lastPlayed: null,
  playTime: 0,
  
  // Character
  name: 'Survivor',
  race: null,
  archetype: null,
  traits: [],
  
  // Stats
  level: 1,
  xp: 0,
  hp: 100,
  maxHP: 100,
  ap: 4,
  maxAP: 4,
  rad: 0,
  caps: 0,
  
  // Core stats
  stats: {
    STR: 5,
    AGI: 5,
    INT: 5,
    END: 5,
    LCK: 5
  },
  
  // Derived bonuses (from perks, traits, equipment)
  bonuses: {},
  
  // Progression
  skillPoints: 0,
  unlockedSkills: [],
  chosenPerks: [],
  advancedClassChoices: {},
  prestigeLevel: 0,
  
  // Equipment
  equipment: {
    weapon: null,
    chest: null,
    head: null,
    arms: null,
    legs: null,
    shoes: null,
    amulet: null,
    belt: null,
    ring1: null,
    ring2: null
  },
  inventory: [],
  
  // Map & Exploration
  currentTerritory: 'ashPlains',
  currentPosition: { x: 3, y: 6 }, // Start at bottom center
  exploredTiles: {}, // { territoryId: Set of "x,y" strings }
  mapData: {}, // { territoryId: 2D array of tile data }
  
  // Progress
  territoriesCleared: [],
  bossesDefeated: [],
  dungeonsCompleted: [],
  
  // Quests & NPCs
  activeQuests: {},
  completedQuests: [],
  npcFlags: {},
  
  // Bounties
  activeBounties: [],
  completedBounties: [],
  bountyProgress: {},
  
  // Achievements
  unlockedAchievements: [],
  achievementProgress: {
    kills: 0,
    bossKills: 0,
    itemsLooted: 0,
    tilesExplored: 0,
    combatsWon: 0,
    itemsBought: 0,
    healingItemsUsed: 0,
    criticalHits: 0,
    maxDamage: 0,
    capsTotal: 0,
    celestialItems: 0,
    bountiesCompleted: 0,
    dungeonsCompleted: 0,
    skillsUnlocked: 0
  },
  
  // Combat state (temporary, cleared after combat)
  combat: null,
  
  // Settings
  hardcoreMode: false
});

// Get save slot data (for display)
export const getSaveSlotInfo = (slot) => {
  try {
    const data = localStorage.getItem(`${SAVE_PREFIX}${slot}`);
    if (!data) return null;
    
    const save = JSON.parse(data);
    return {
      slot,
      name: save.name,
      level: save.level,
      race: save.race,
      archetype: save.archetype,
      territory: save.currentTerritory,
      playTime: save.playTime,
      lastPlayed: save.lastPlayed,
      prestigeLevel: save.prestigeLevel || 0,
      hardcoreMode: save.hardcoreMode || false
    };
  } catch (e) {
    console.error('Error reading save slot:', e);
    return null;
  }
};

// Get all save slots info
export const getAllSaveSlots = () => {
  return [1, 2, 3].map(slot => getSaveSlotInfo(slot));
};

// Save game to slot
export const saveGame = (state, slot) => {
  try {
    const saveData = {
      ...state,
      saveSlot: slot,
      lastPlayed: new Date().toISOString(),
      // Don't save temporary combat state
      combat: null
    };
    
    localStorage.setItem(`${SAVE_PREFIX}${slot}`, JSON.stringify(saveData));
    return true;
  } catch (e) {
    console.error('Error saving game:', e);
    return false;
  }
};

// Load game from slot
export const loadGame = (slot) => {
  try {
    const data = localStorage.getItem(`${SAVE_PREFIX}${slot}`);
    if (!data) return null;
    
    return JSON.parse(data);
  } catch (e) {
    console.error('Error loading game:', e);
    return null;
  }
};

// Delete save slot
export const deleteSave = (slot) => {
  try {
    localStorage.removeItem(`${SAVE_PREFIX}${slot}`);
    return true;
  } catch (e) {
    console.error('Error deleting save:', e);
    return false;
  }
};

// Auto-save (call after important actions)
export const autoSave = (state) => {
  if (state.saveSlot) {
    return saveGame(state, state.saveSlot);
  }
  return false;
};

// Save settings
export const saveSettings = (settings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (e) {
    console.error('Error saving settings:', e);
    return false;
  }
};

// Load settings
export const loadSettings = () => {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : {
      sfxEnabled: true,
      musicEnabled: true,
      masterVolume: 0.5
    };
  } catch (e) {
    return {
      sfxEnabled: true,
      musicEnabled: true,
      masterVolume: 0.5
    };
  }
};

// Format play time for display
export const formatPlayTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

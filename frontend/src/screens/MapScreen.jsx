import { useEffect, useMemo } from 'react';
import useGameStore from '../store/gameStore';
import { TERRITORIES } from '../data/territories';
import { getTileIcon, TILE_TYPES, getAdjacentTiles } from '../utils/map';
import { RACES } from '../data/races';
import { ARCHETYPES } from '../data/archetypes';
import { xpForLevel } from '../utils/combat';
import audioEngine from '../utils/audio';

const MapScreen = () => {
  const state = useGameStore();
  const {
    currentTerritory, currentPosition, mapData, exploredTiles,
    name, level, hp, maxHP, xp, caps, stats, race, archetype,
    setScreen, moveToTile, saveToSlot
  } = state;

  const territory = TERRITORIES[currentTerritory];
  const map = mapData[currentTerritory];
  const explored = exploredTiles[currentTerritory] || [];

  // Get adjacent positions for highlighting valid moves
  const validMoves = useMemo(() => {
    return getAdjacentTiles(currentPosition.x, currentPosition.y);
  }, [currentPosition]);

  const handleTileClick = (x, y) => {
    const isValid = validMoves.some(pos => pos.x === x && pos.y === y);
    if (isValid) {
      moveToTile(x, y);
    }
  };

  const isValidMove = (x, y) => {
    return validMoves.some(pos => pos.x === x && pos.y === y);
  };

  const xpNeeded = xpForLevel(level);
  const xpPercent = (xp / xpNeeded) * 100;

  return (
    <div className="min-h-screen bg-[#0A0806] p-3">
      {/* Character HUD */}
      <div className="card-terminal mb-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="font-comic text-lg text-[#F59E0B]">{name}</span>
            <span className="font-mono text-xs text-[#F59E0B]/60 ml-2">
              {RACES[race]?.name} {ARCHETYPES[archetype]?.name}
            </span>
          </div>
          <span className="font-comic text-[#F59E0B]">LV.{level}</span>
        </div>
        
        {/* HP Bar */}
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-xs text-[#DC2626] w-8">HP</span>
          <div className="health-bar flex-1">
            <div className="health-fill" style={{ width: `${(hp / maxHP) * 100}%` }} />
          </div>
          <span className="font-mono text-xs text-[#F59E0B]">{hp}/{maxHP}</span>
        </div>
        
        {/* XP Bar */}
        <div className="flex items-center gap-2 mb-2">
          <span className="font-mono text-xs text-[#84cc16] w-8">XP</span>
          <div className="health-bar flex-1">
            <div className="xp-fill" style={{ width: `${xpPercent}%` }} />
          </div>
          <span className="font-mono text-xs text-[#F59E0B]">{xp}/{xpNeeded}</span>
        </div>
        
        {/* Caps */}
        <div className="flex justify-between font-mono text-sm">
          <span className="text-[#F59E0B]/60">CAPS: <span className="text-[#F59E0B]">{caps}</span></span>
          <span className="text-[#F59E0B]/60">{territory?.name}</span>
        </div>
      </div>

      {/* Territory Map */}
      <div 
        className="card-comic mb-3 p-2"
        style={{ backgroundColor: territory?.bgColor || '#1A130F' }}
      >
        <div className="grid grid-cols-7 gap-1">
          {map?.map((row, y) =>
            row.map((tile, x) => {
              const key = `${x},${y}`;
              const isExplored = Array.isArray(explored) ? explored.includes(key) : false;
              const isCurrent = x === currentPosition.x && y === currentPosition.y;
              const canMove = isValidMove(x, y);
              
              return (
                <div
                  key={key}
                  data-testid={`tile-${x}-${y}`}
                  onClick={() => handleTileClick(x, y)}
                  className={`
                    ${isExplored ? 'fog-cell' : 'fog-cell-unexplored'}
                    ${isCurrent ? 'fog-cell-current' : ''}
                    ${canMove && !isCurrent ? 'ring-1 ring-[#F59E0B]/50' : ''}
                    ${canMove ? 'cursor-pointer' : 'cursor-default'}
                  `}
                >
                  {isCurrent ? (
                    <span className="text-lg">🧍</span>
                  ) : isExplored ? (
                    <span className="text-sm">{getTileIcon(tile, true)}</span>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Map Legend */}
      <div className="card-terminal text-xs font-mono mb-3">
        <div className="grid grid-cols-3 gap-2 text-[#F59E0B]/70">
          <span>⚔️ Fight</span>
          <span>💠 Elite</span>
          <span>👹 Boss</span>
          <span>🏘️ Town</span>
          <span>🕳️ Dungeon</span>
          <span>💼 Loot</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-5 gap-2 mb-3">
        {Object.entries(stats).map(([stat, value]) => (
          <div key={stat} className="card-terminal text-center py-2">
            <div className="font-comic text-xs text-[#F59E0B]/60">{stat}</div>
            <div className="font-mono text-lg text-[#F59E0B]">{value}</div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button
          data-testid="inventory-btn"
          onClick={() => {
            audioEngine.playButtonClick();
            setScreen('inventory');
          }}
          className="btn-comic-sm"
        >
          🎒 BAG
        </button>
        <button
          data-testid="skills-btn"
          onClick={() => {
            audioEngine.playButtonClick();
            setScreen('skills');
          }}
          className="btn-comic-sm"
        >
          ⭐ SKILLS
        </button>
        <button
          data-testid="save-btn"
          onClick={() => {
            audioEngine.playButtonClick();
            saveToSlot();
          }}
          className="btn-comic-sm"
        >
          💾 SAVE
        </button>
      </div>
    </div>
  );
};

export default MapScreen;
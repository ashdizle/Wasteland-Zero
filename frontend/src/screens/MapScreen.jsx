import { useMemo } from 'react';
import useGameStore from '../store/gameStore';
import { TERRITORIES } from '../data/territories';
import { getTileIcon, getAdjacentTiles } from '../utils/map';
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

  const validMoves = useMemo(() => {
    return getAdjacentTiles(currentPosition.x, currentPosition.y);
  }, [currentPosition]);

  const handleTileClick = (x, y) => {
    const isValid = validMoves.some(pos => pos.x === x && pos.y === y);
    if (isValid) {
      moveToTile(x, y);
    }
  };

  const isValidMove = (x, y) => validMoves.some(pos => pos.x === x && pos.y === y);

  const xpNeeded = xpForLevel(level);
  const xpPercent = (xp / xpNeeded) * 100;
  const hpPercent = (hp / maxHP) * 100;

  return (
    <div className="min-h-screen wasteland-container flex flex-col">
      {/* Character HUD */}
      <div className="combat-hud">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="font-comic text-xl text-[#f5d742]">{name}</span>
            <span className="font-mono text-xs text-[#c9a227]/60 ml-2">
              {RACES[race]?.name} {ARCHETYPES[archetype]?.name}
            </span>
          </div>
          <span className="font-comic text-lg text-[#f5d742]">LV.{level}</span>
        </div>
        
        {/* HP Bar */}
        <div className="stat-bar mb-1">
          <div 
            className={`stat-bar-fill ${hpPercent < 30 ? 'hp-fill-low' : 'hp-fill'}`}
            style={{ width: `${hpPercent}%` }}
          />
          <div className="stat-bar-text">HP {hp}/{maxHP}</div>
        </div>
        
        {/* XP Bar */}
        <div className="stat-bar h-4 mb-2">
          <div className="stat-bar-fill xp-fill" style={{ width: `${xpPercent}%` }} />
          <div className="stat-bar-text text-xs">XP {xp}/{xpNeeded}</div>
        </div>
        
        {/* Caps & Territory */}
        <div className="flex justify-between font-mono text-sm">
          <span className="text-[#f5d742]">💰 {caps}</span>
          <span className="text-[#c9a227]/70">{territory?.name}</span>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 p-3">
        <div 
          className="map-grid"
          style={{ backgroundColor: territory?.bgColor || '#2a1d12' }}
        >
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
                  className={`map-tile ${
                    isCurrent ? 'map-tile-current' : 
                    !isExplored ? 'map-tile-unexplored' :
                    canMove ? 'map-tile-adjacent' : ''
                  }`}
                >
                  {isCurrent ? (
                    <span className="text-xl">🧍</span>
                  ) : isExplored ? (
                    <span className="text-base">{getTileIcon(tile, true)}</span>
                  ) : canMove ? (
                    <span className="text-[#c9a227]/30 text-lg">?</span>
                  ) : null}
                </div>
              );
            })
          )}
        </div>

        {/* Map Legend */}
        <div className="card-terminal mt-3">
          <div className="grid grid-cols-3 gap-2 text-xs font-mono text-[#c9a227]/70">
            <span>⚔️ Fight</span>
            <span>💠 Elite</span>
            <span>👹 Boss</span>
            <span>🏘️ Town</span>
            <span>🕳️ Dungeon</span>
            <span>💼 Loot</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-5 gap-2 mt-3">
          {Object.entries(stats).map(([stat, value]) => (
            <div key={stat} className="card-terminal text-center py-2">
              <div className="font-comic text-xs text-[#c9a227]/60">{stat}</div>
              <div className="font-mono text-lg text-[#f5d742]">{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="p-3 bg-gradient-to-t from-[#1a1209] to-transparent">
        <div className="grid grid-cols-3 gap-3">
          <button
            data-testid="inventory-btn"
            onClick={() => {
              audioEngine.playButtonClick();
              setScreen('inventory');
            }}
            className="btn-comic"
          >
            🎒 BAG
          </button>
          <button
            data-testid="skills-btn"
            onClick={() => {
              audioEngine.playButtonClick();
              setScreen('skills');
            }}
            className="btn-comic"
          >
            ⭐ SKILLS
          </button>
          <button
            data-testid="save-btn"
            onClick={() => {
              audioEngine.playButtonClick();
              saveToSlot();
            }}
            className="btn-comic"
          >
            💾 SAVE
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapScreen;

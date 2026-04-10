import { useEffect, useRef } from 'react';
import useGameStore from '../store/gameStore';
import audioEngine from '../utils/audio';

const CombatScreen = () => {
  const state = useGameStore();
  const {
    combat, hp, maxHP, stats, level, caps, equipment, inventory, combatLog, floatingDamage,
    performAttack, performBrace, activateVATS, vatsHeadshot, vatsBodyshot, cancelVATS,
    consumeItem, endPlayerTurn, clearFloatingDamage
  } = state;

  const logRef = useRef(null);

  // Auto-scroll combat log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [combatLog]);

  // Clear floating damage after animation
  useEffect(() => {
    floatingDamage.forEach(fd => {
      setTimeout(() => clearFloatingDamage(fd.id), 1000);
    });
  }, [floatingDamage, clearFloatingDamage]);

  if (!combat) return null;

  const { enemies, turn, round, ap: currentAP, vatsMode, playerBuffs } = combat;
  const livingEnemies = enemies.filter(e => e.currentHP > 0);
  const consumables = inventory.filter(i => i.type === 'consumable');
  const hpPercent = (hp / maxHP) * 100;
  const isLowHP = hpPercent < 30;

  const getLogClass = (log) => {
    if (log.includes('CRITICAL') || log.includes('V.A.T.S.')) return 'combat-log-critical';
    if (log.includes('damage to')) return 'combat-log-damage';
    if (log.includes('heal') || log.includes('revive')) return 'combat-log-heal';
    if (log.includes('---') || log.includes('started')) return 'combat-log-info';
    return 'text-[#c9a227]/70';
  };

  return (
    <div className="min-h-screen wasteland-container flex flex-col">
      {/* VATS Overlay */}
      {vatsMode && (
        <div className="fixed inset-0 vats-overlay z-50 flex flex-col items-center justify-center p-4">
          <h2 className="font-comic text-4xl text-[#3498db] mb-4" style={{textShadow: '0 0 20px #3498db, 4px 4px 0 #000'}}>
            V.A.T.S.
          </h2>
          <p className="font-mono text-[#3498db]/80 mb-6 text-lg">SELECT TARGET ZONE</p>
          
          {livingEnemies.map((enemy, idx) => (
            <div key={enemy.uid} className="w-full mb-4">
              <div className="font-comic text-xl text-[#f5d742] text-center mb-3">{enemy.name}</div>
              <div className="flex gap-3">
                <button
                  data-testid={`vats-headshot-${idx}`}
                  onClick={() => vatsHeadshot(enemies.indexOf(enemy))}
                  className="vats-target flex-1 text-center"
                >
                  <span className="font-comic text-xl text-[#3498db]">HEAD</span>
                  <p className="font-mono text-sm text-[#3498db]/70 mt-1">50% Crit Chance</p>
                </button>
                <button
                  data-testid={`vats-bodyshot-${idx}`}
                  onClick={() => vatsBodyshot(enemies.indexOf(enemy))}
                  className="vats-target flex-1 text-center"
                >
                  <span className="font-comic text-xl text-[#3498db]">BODY</span>
                  <p className="font-mono text-sm text-[#3498db]/70 mt-1">+50% Damage</p>
                </button>
              </div>
            </div>
          ))}
          
          <button
            data-testid="vats-cancel"
            onClick={cancelVATS}
            className="btn-comic mt-6"
          >
            CANCEL
          </button>
        </div>
      )}

      {/* Top HUD */}
      <div className="combat-hud">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-comic text-lg text-[#f5d742]">LV.{level}</span>
            <span className="font-mono text-sm text-[#c9a227]/60">ROUND {round}</span>
          </div>
          <div className="font-mono text-sm text-[#f5d742]">💰 {caps}</div>
        </div>
        
        {/* HP Bar */}
        <div className="stat-bar mb-2">
          <div 
            className={`stat-bar-fill ${isLowHP ? 'hp-fill-low' : 'hp-fill'}`}
            style={{ width: `${hpPercent}%` }}
          />
          <div className="stat-bar-text">HP {hp}/{maxHP}</div>
        </div>
        
        {/* AP Bar */}
        <div className="stat-bar h-5">
          <div 
            className="stat-bar-fill ap-fill"
            style={{ width: `${(currentAP / state.maxAP) * 100}%` }}
          />
          <div className="stat-bar-text text-xs">AP {currentAP}/{state.maxAP}</div>
        </div>

        {/* Active buffs */}
        {playerBuffs?.length > 0 && (
          <div className="flex gap-2 mt-2">
            {playerBuffs.map((buff, i) => (
              <span key={i} className="status-badge status-bleed">
                {buff.type} ({buff.duration})
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Battle Area */}
      <div className="flex-1 p-3 flex flex-col">
        {/* Enemies Section */}
        <div className="space-y-3 mb-4">
          {enemies.map((enemy, idx) => {
            const enemyHpPercent = (enemy.currentHP / enemy.maxHP) * 100;
            const isDead = enemy.currentHP <= 0;
            
            return (
              <div
                key={enemy.uid}
                data-testid={`enemy-${idx}`}
                onClick={() => !isDead && useGameStore.setState(s => { s.combat.selectedTarget = idx; })}
                className={`
                  ${enemy.tier === 'boss' ? 'enemy-card-boss' : enemy.tier === 'elite' ? 'enemy-card-elite' : 'enemy-card'}
                  ${isDead ? 'opacity-40' : ''}
                  ${combat.selectedTarget === idx ? 'ring-2 ring-[#f5d742]' : ''}
                  cursor-pointer relative
                `}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`font-comic text-xl ${
                      enemy.tier === 'boss' ? 'text-[#f39c12]' :
                      enemy.tier === 'elite' ? 'text-[#9b59b6]' :
                      'text-[#e74c3c]'
                    }`}>
                      {enemy.name}
                    </span>
                    {enemy.isHealer && <span className="text-sm">⚕️</span>}
                  </div>
                  <span className={`font-mono text-xs px-2 py-0.5 rounded ${
                    enemy.tier === 'boss' ? 'bg-[#f39c12]/20 text-[#f39c12]' :
                    enemy.tier === 'elite' ? 'bg-[#9b59b6]/20 text-[#9b59b6]' :
                    'bg-[#e74c3c]/20 text-[#e74c3c]'
                  }`}>
                    {enemy.tier?.toUpperCase()}
                  </span>
                </div>
                
                {/* Enemy HP */}
                <div className="stat-bar h-5">
                  <div 
                    className="stat-bar-fill" 
                    style={{ 
                      width: `${enemyHpPercent}%`,
                      background: 'linear-gradient(180deg, #e74c3c 0%, #a83229 50%, #6b1f18 100%)'
                    }} 
                  />
                  <div className="stat-bar-text text-xs">{enemy.currentHP}/{enemy.maxHP}</div>
                </div>
                
                {/* Status effects */}
                {enemy.statusEffects?.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {enemy.statusEffects.map((effect, i) => (
                      <span key={i} className={`status-badge ${
                        effect.type === 'burn' ? 'status-burn' :
                        effect.type === 'bleed' ? 'status-bleed' :
                        'status-poison'
                      }`}>
                        {effect.type === 'burn' && '🔥'}
                        {effect.type === 'bleed' && '🩸'}
                        {effect.type === 'poison' && '☠️'}
                        {effect.duration}
                      </span>
                    ))}
                  </div>
                )}

                {/* Floating damage */}
                {floatingDamage
                  .filter(fd => fd.targetIndex === idx)
                  .map(fd => (
                    <div
                      key={fd.id}
                      className={`floating-damage absolute top-0 left-1/2 -translate-x-1/2 text-3xl ${
                        fd.isCrit ? 'text-[#f5d742]' : 'text-white'
                      }`}
                    >
                      {fd.isCrit && '💥'}{fd.damage}
                    </div>
                  ))}
              </div>
            );
          })}
        </div>

        {/* Combat Log */}
        <div ref={logRef} className="combat-log flex-1 mb-3">
          {combatLog.map((log, idx) => (
            <p key={idx} className={`combat-log-entry ${getLogClass(log)}`}>
              {log}
            </p>
          ))}
        </div>
      </div>

      {/* Action Bar */}
      <div className="p-3 bg-gradient-to-t from-[#1a1209] to-[#0d0906] border-t-3 border-[#3d2914]">
        {/* Main Actions */}
        <div className="action-grid mb-3">
          <button
            data-testid="attack-btn"
            onClick={() => performAttack(combat.selectedTarget)}
            disabled={turn !== 'player' || currentAP < 2}
            className="btn-combat"
          >
            <span className="text-lg">⚔️</span> ATTACK
            <span className="block text-xs opacity-70">2 AP</span>
          </button>
          <button
            data-testid="brace-btn"
            onClick={performBrace}
            disabled={turn !== 'player' || currentAP < 1}
            className="btn-combat btn-combat-brace"
          >
            <span className="text-lg">🛡️</span> BRACE
            <span className="block text-xs opacity-70">1 AP</span>
          </button>
          <button
            data-testid="vats-btn"
            onClick={activateVATS}
            disabled={turn !== 'player' || currentAP < 3}
            className="btn-combat btn-combat-vats"
          >
            <span className="text-lg">🎯</span> V.A.T.S.
            <span className="block text-xs opacity-70">3 AP</span>
          </button>
          <button
            data-testid="end-turn-btn"
            onClick={endPlayerTurn}
            disabled={turn !== 'player'}
            className="btn-comic"
          >
            END TURN ⏭️
          </button>
        </div>

        {/* Items Quick Bar */}
        {consumables.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
            {consumables.slice(0, 4).map(item => (
              <button
                key={item.uid}
                data-testid={`use-item-${item.id}`}
                onClick={() => consumeItem(item.uid)}
                disabled={turn !== 'player' || currentAP < 1}
                className="btn-comic-sm whitespace-nowrap text-xs flex-shrink-0"
              >
                {item.name} {item.quantity > 1 ? `x${item.quantity}` : ''}
              </button>
            ))}
          </div>
        )}

        {/* Turn indicator */}
        <div className="text-center">
          <span className={`font-comic text-lg ${
            turn === 'player' ? 'text-[#2ecc71]' : 'text-[#e74c3c]'
          }`} style={{textShadow: '2px 2px 0 #000'}}>
            {turn === 'player' ? '⚡ YOUR TURN' : '⏳ ENEMY TURN...'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CombatScreen;

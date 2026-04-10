import { useEffect, useRef } from 'react';
import useGameStore from '../store/gameStore';
import { LOOT_TIERS } from '../data/items';
import audioEngine from '../utils/audio';

const CombatScreen = () => {
  const state = useGameStore();
  const {
    combat, hp, maxHP, ap, maxAP, equipment, inventory, combatLog, floatingDamage,
    performAttack, performBrace, activateVATS, vatsHeadshot, vatsBodyshot, cancelVATS,
    consumeItem, endPlayerTurn, clearFloatingDamage, unlockedSkills
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

  const getTierClass = (tier) => {
    return `loot-${tier}`;
  };

  return (
    <div className="min-h-screen bg-[#0A0806] flex flex-col">
      {/* VATS Overlay */}
      {vatsMode && (
        <div className="vats-overlay flex flex-col items-center justify-center p-4">
          <h2 className="font-comic text-3xl text-[#3B82F6] mb-4 text-glow">V.A.T.S.</h2>
          <p className="font-mono text-[#3B82F6]/80 mb-6">SELECT TARGET ZONE</p>
          
          {livingEnemies.map((enemy, idx) => (
            <div key={enemy.uid} className="w-full mb-4">
              <div className="font-comic text-[#F59E0B] text-center mb-2">{enemy.name}</div>
              <div className="flex gap-2">
                <button
                  data-testid={`vats-headshot-${idx}`}
                  onClick={() => vatsHeadshot(enemies.indexOf(enemy))}
                  className="vats-target flex-1 text-center"
                >
                  <span className="font-mono text-[#3B82F6]">[ HEAD ]</span>
                  <p className="text-xs text-[#3B82F6]/70">High Crit Chance</p>
                </button>
                <button
                  data-testid={`vats-bodyshot-${idx}`}
                  onClick={() => vatsBodyshot(enemies.indexOf(enemy))}
                  className="vats-target flex-1 text-center"
                >
                  <span className="font-mono text-[#3B82F6]">[ BODY ]</span>
                  <p className="text-xs text-[#3B82F6]/70">High Damage</p>
                </button>
              </div>
            </div>
          ))}
          
          <button
            data-testid="vats-cancel"
            onClick={cancelVATS}
            className="btn-comic mt-4"
          >
            CANCEL
          </button>
        </div>
      )}

      {/* Enemy Section */}
      <div className="p-3 space-y-2">
        {enemies.map((enemy, idx) => (
          <div
            key={enemy.uid}
            data-testid={`enemy-${idx}`}
            className={`card-terminal relative ${
              enemy.currentHP <= 0 ? 'opacity-40' : ''
            } ${combat.selectedTarget === idx ? 'ring-2 ring-[#F59E0B]' : ''}`}
            onClick={() => enemy.currentHP > 0 && useGameStore.setState(s => { s.combat.selectedTarget = idx; })}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className={`font-comic text-lg ${
                  enemy.tier === 'boss' ? 'text-[#DC2626]' :
                  enemy.tier === 'elite' ? 'text-purple-400' :
                  'text-[#F59E0B]'
                }`}>
                  {enemy.name}
                </span>
                {enemy.isHealer && <span className="text-xs">⚕️</span>}
              </div>
              <span className="font-mono text-xs text-[#F59E0B]/60">
                {enemy.tier?.toUpperCase()}
              </span>
            </div>
            
            {/* Enemy HP */}
            <div className="flex items-center gap-2">
              <div className="health-bar flex-1">
                <div 
                  className="health-fill" 
                  style={{ width: `${(enemy.currentHP / enemy.maxHP) * 100}%` }} 
                />
              </div>
              <span className="font-mono text-xs text-[#F59E0B]">
                {enemy.currentHP}/{enemy.maxHP}
              </span>
            </div>
            
            {/* Status effects */}
            {enemy.statusEffects?.length > 0 && (
              <div className="flex gap-1 mt-1">
                {enemy.statusEffects.map((effect, i) => (
                  <span key={i} className="text-xs px-1 bg-[#1A130F] border border-[#F59E0B]/30">
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
                  className={`floating-damage absolute top-0 left-1/2 -translate-x-1/2 font-comic text-2xl ${
                    fd.isCrit ? 'text-[#F59E0B] text-3xl' : 'text-white'
                  }`}
                >
                  {fd.isCrit && '✨'}{fd.damage}
                </div>
              ))}
          </div>
        ))}
      </div>

      {/* Combat Log */}
      <div 
        ref={logRef}
        className="combat-log flex-1 p-3 overflow-y-auto max-h-32 bg-[#0A0806] border-y border-[#F59E0B]/20"
      >
        {combatLog.map((log, idx) => (
          <p key={idx} className={`font-mono text-xs ${
            log.includes('CRITICAL') || log.includes('V.A.T.S.') ? 'text-[#F59E0B]' :
            log.includes('defeated') ? 'text-[#84cc16]' :
            log.includes('missed') || log.includes('dodged') ? 'text-[#F59E0B]/50' :
            log.includes('---') ? 'text-[#F59E0B]/30' :
            'text-[#F59E0B]/70'
          }`}>
            {log}
          </p>
        ))}
      </div>

      {/* Player Stats */}
      <div className="p-3 border-t border-[#F59E0B]/20">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-mono text-xs text-[#DC2626] w-8">HP</span>
          <div className="health-bar flex-1">
            <div className="health-fill" style={{ width: `${(hp / maxHP) * 100}%` }} />
          </div>
          <span className="font-mono text-xs text-[#F59E0B]">{hp}/{maxHP}</span>
        </div>
        
        <div className="flex items-center gap-2 mb-3">
          <span className="font-mono text-xs text-[#3B82F6] w-8">AP</span>
          <div className="health-bar flex-1">
            <div className="ap-fill" style={{ width: `${(currentAP / maxAP) * 100}%` }} />
          </div>
          <span className="font-mono text-xs text-[#F59E0B]">{currentAP}/{maxAP}</span>
        </div>

        {/* Active buffs */}
        {playerBuffs?.length > 0 && (
          <div className="flex gap-1 mb-2">
            {playerBuffs.map((buff, i) => (
              <span key={i} className="font-mono text-xs px-2 py-0.5 bg-[#84cc16]/20 border border-[#84cc16] text-[#84cc16]">
                {buff.type} ({buff.duration})
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Combat Actions */}
      <div className="p-3 bg-[#1A130F]">
        <div className="grid grid-cols-2 gap-2 mb-2">
          <button
            data-testid="attack-btn"
            onClick={() => performAttack(combat.selectedTarget)}
            disabled={turn !== 'player' || currentAP < 2}
            className="btn-comic"
          >
            ⚔️ ATK (2 AP)
          </button>
          <button
            data-testid="brace-btn"
            onClick={performBrace}
            disabled={turn !== 'player' || currentAP < 1}
            className="btn-comic"
          >
            🛡️ BRACE (1 AP)
          </button>
          <button
            data-testid="vats-btn"
            onClick={activateVATS}
            disabled={turn !== 'player' || currentAP < 3}
            className="btn-comic"
          >
            🎯 V.A.T.S. (3 AP)
          </button>
          <button
            data-testid="end-turn-btn"
            onClick={endPlayerTurn}
            disabled={turn !== 'player'}
            className="btn-comic"
          >
            ⏭️ END TURN
          </button>
        </div>

        {/* Items */}
        {consumables.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {consumables.slice(0, 4).map(item => (
              <button
                key={item.uid}
                data-testid={`use-item-${item.id}`}
                onClick={() => consumeItem(item.uid)}
                disabled={turn !== 'player' || currentAP < 1}
                className="btn-comic-sm whitespace-nowrap text-xs"
              >
                {item.name} {item.quantity > 1 ? `x${item.quantity}` : ''}
              </button>
            ))}
          </div>
        )}

        {/* Turn indicator */}
        <div className="text-center mt-2">
          <span className={`font-comic text-sm ${
            turn === 'player' ? 'text-[#84cc16]' : 'text-[#DC2626]'
          }`}>
            {turn === 'player' ? 'YOUR TURN' : 'ENEMY TURN...'}
          </span>
          <span className="font-mono text-xs text-[#F59E0B]/40 ml-2">ROUND {round}</span>
        </div>
      </div>
    </div>
  );
};

export default CombatScreen;
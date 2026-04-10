import { useState, useMemo } from 'react';
import useGameStore from '../store/gameStore';
import { TERRITORIES } from '../data/territories';
import { generateShopInventory, getItemBuyPrice } from '../utils/loot';
import { LOOT_TIERS } from '../data/items';
import audioEngine from '../utils/audio';

const TownScreen = () => {
  const state = useGameStore();
  const {
    currentTerritory, hp, maxHP, rad, caps, bonuses, inventory,
    healAtClinic, buyItem, setScreen
  } = state;

  const [tab, setTab] = useState('shop');
  const territory = TERRITORIES[currentTerritory];

  const shopInventory = useMemo(() => {
    return generateShopInventory(territory, bonuses.blackMarket);
  }, [territory, bonuses.blackMarket]);

  const clinicCost = Math.ceil((maxHP - hp) * 0.5) + (rad * 2);

  const getTierClass = (tier) => `loot-${tier}`;

  return (
    <div className="min-h-screen bg-[#0A0806]">
      {/* Header */}
      <div className="p-4 border-b border-[#F59E0B]/20">
        <div className="flex items-center justify-between mb-2">
          <button
            data-testid="leave-town-btn"
            onClick={() => {
              audioEngine.playButtonClick();
              setScreen('map');
            }}
            className="btn-comic-sm"
          >
            ← LEAVE
          </button>
          <h1 className="font-comic text-xl text-[#F59E0B]">🏘️ {territory?.name} TOWN</h1>
          <span className="font-mono text-[#F59E0B]">💰 {caps}</span>
        </div>
        
        {/* HP Display */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-[#DC2626]">HP</span>
          <div className="health-bar flex-1">
            <div className="health-fill" style={{ width: `${(hp / maxHP) * 100}%` }} />
          </div>
          <span className="font-mono text-xs text-[#F59E0B]">{hp}/{maxHP}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#F59E0B]/20">
        {['shop', 'clinic', 'bounty'].map(t => (
          <button
            key={t}
            data-testid={`tab-${t}`}
            onClick={() => {
              setTab(t);
              audioEngine.playButtonClick();
            }}
            className={`tab-btn flex-1 py-3 ${tab === t ? 'tab-btn-active' : ''}`}
          >
            {t === 'shop' && '🛍️ SHOP'}
            {t === 'clinic' && '🏥 CLINIC'}
            {t === 'bounty' && '📜 BOUNTY'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* Shop Tab */}
        {tab === 'shop' && (
          <div className="space-y-2">
            {shopInventory.map((item, idx) => {
              const price = getItemBuyPrice(item, bonuses.shopDiscount || 0);
              const canBuy = caps >= price;
              
              return (
                <div
                  key={item.uid}
                  className={`card-terminal border ${LOOT_TIERS[item.tier]?.borderColor || 'border-[#F59E0B]/30'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <span className={`font-body font-medium ${getTierClass(item.tier)}`}>
                        {item.name}
                      </span>
                      {item.quantity && (
                        <span className="font-mono text-xs text-[#F59E0B]/60 ml-1">
                          x{item.quantity}
                        </span>
                      )}
                      
                      <div className="font-mono text-xs text-[#F59E0B]/60 mt-1">
                        {item.damage && <span>DMG: {item.damage[0]}-{item.damage[1]} </span>}
                        {item.defense && <span>DEF: +{item.defense} </span>}
                        {item.description && <span>{item.description}</span>}
                      </div>
                    </div>
                    
                    <button
                      data-testid={`buy-${idx}`}
                      onClick={() => {
                        if (canBuy) {
                          buyItem(item, idx);
                          audioEngine.playItemPickup();
                        } else {
                          audioEngine.playError();
                        }
                      }}
                      disabled={!canBuy}
                      className="btn-comic-sm text-xs"
                    >
                      💰 {price}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Clinic Tab */}
        {tab === 'clinic' && (
          <div className="card-comic text-center py-8">
            <h2 className="font-comic text-2xl text-[#F59E0B] mb-4">🏥 WASTELAND CLINIC</h2>
            
            <p className="font-body text-[#F59E0B]/70 mb-4">
              "Let me patch you up, stranger."
            </p>
            
            <div className="mb-6">
              <p className="font-mono text-sm text-[#F59E0B]/60">
                HP: {hp}/{maxHP} | RAD: {rad}
              </p>
              <p className="font-mono text-sm text-[#F59E0B]/60 mt-1">
                Treatment Cost: <span className="text-[#F59E0B]">{clinicCost} caps</span>
              </p>
            </div>
            
            {hp < maxHP || rad > 0 ? (
              <button
                data-testid="heal-btn"
                onClick={() => {
                  if (caps >= clinicCost) {
                    healAtClinic();
                    audioEngine.playHeal();
                  } else {
                    audioEngine.playError();
                  }
                }}
                disabled={caps < clinicCost}
                className="btn-comic text-xl"
              >
                HEAL ME
              </button>
            ) : (
              <p className="font-comic text-[#84cc16]">YOU'RE IN PERFECT HEALTH!</p>
            )}
          </div>
        )}

        {/* Bounty Tab */}
        {tab === 'bounty' && (
          <div className="card-comic text-center py-8">
            <h2 className="font-comic text-2xl text-[#F59E0B] mb-4">📜 BOUNTY BOARD</h2>
            <p className="font-mono text-[#F59E0B]/50">
              Coming soon...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TownScreen;
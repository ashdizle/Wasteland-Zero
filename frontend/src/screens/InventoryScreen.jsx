import useGameStore from '../store/gameStore';
import { LOOT_TIERS } from '../data/items';
import audioEngine from '../utils/audio';

const InventoryScreen = () => {
  const state = useGameStore();
  const {
    inventory, equipment, caps,
    equipItem, unequipItem, sellItem, setScreen
  } = state;

  const getTierClass = (tier) => `loot-${tier}`;

  const equipmentSlots = [
    { slot: 'weapon', label: 'Weapon', icon: '⚔️' },
    { slot: 'head', label: 'Head', icon: '🪖' },
    { slot: 'chest', label: 'Chest', icon: '🧥' },
    { slot: 'arms', label: 'Arms', icon: '🦴' },
    { slot: 'legs', label: 'Legs', icon: '👖' },
    { slot: 'amulet', label: 'Amulet', icon: '📿' },
    { slot: 'belt', label: 'Belt', icon: '🪀' },
    { slot: 'ring1', label: 'Ring 1', icon: '💍' },
    { slot: 'ring2', label: 'Ring 2', icon: '💍' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0806] p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          data-testid="back-btn"
          onClick={() => {
            audioEngine.playButtonClick();
            setScreen('map');
          }}
          className="btn-comic-sm"
        >
          ← BACK
        </button>
        <h1 className="font-comic text-2xl text-[#F59E0B]">INVENTORY</h1>
        <span className="font-mono text-[#F59E0B]">💰 {caps}</span>
      </div>

      {/* Equipment Section */}
      <div className="mb-4">
        <h2 className="font-comic text-lg text-[#F59E0B]/80 mb-2">EQUIPPED</h2>
        <div className="grid grid-cols-3 gap-2">
          {equipmentSlots.map(({ slot, label, icon }) => {
            const item = equipment[slot];
            return (
              <div
                key={slot}
                data-testid={`slot-${slot}`}
                onClick={() => item && unequipItem(slot)}
                className={`item-slot flex-col ${item ? 'item-slot-equipped cursor-pointer' : ''}`}
              >
                {item ? (
                  <>
                    <span className={`text-lg ${getTierClass(item.tier)}`}>{icon}</span>
                    <span className={`text-xs truncate w-full text-center ${getTierClass(item.tier)}`}>
                      {item.name}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-lg opacity-30">{icon}</span>
                    <span className="text-xs text-[#F59E0B]/30">{label}</span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Inventory Section */}
      <div>
        <h2 className="font-comic text-lg text-[#F59E0B]/80 mb-2">
          BAG ({inventory.length}/30)
        </h2>
        
        {inventory.length === 0 ? (
          <div className="card-terminal text-center py-8">
            <p className="font-mono text-[#F59E0B]/40">EMPTY</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto">
            {inventory.map(item => (
              <div
                key={item.uid}
                className={`card-terminal border ${LOOT_TIERS[item.tier]?.borderColor || 'border-[#F59E0B]/30'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <span className={`font-body font-medium ${getTierClass(item.tier)}`}>
                      {item.name}
                    </span>
                    {item.quantity > 1 && (
                      <span className="font-mono text-xs text-[#F59E0B]/60 ml-1">
                        x{item.quantity}
                      </span>
                    )}
                    
                    {/* Item stats */}
                    <div className="font-mono text-xs text-[#F59E0B]/60 mt-1">
                      {item.damage && <span>DMG: {item.damage[0]}-{item.damage[1]} </span>}
                      {item.defense && <span>DEF: +{item.defense} </span>}
                      {item.element && <span className="text-purple-400">{item.element} </span>}
                      {item.value && <span>💰{Math.floor(item.value * 0.4)}</span>}
                    </div>
                    
                    {/* Celestial perk */}
                    {item.celestialPerk && (
                      <div className="text-xs text-pink-400 mt-1">
                        ✨ {item.celestialPerk.name}: {item.celestialPerk.effect}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-1">
                    {(item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory') && (
                      <button
                        data-testid={`equip-${item.uid}`}
                        onClick={() => {
                          equipItem(item.uid);
                          audioEngine.playItemPickup();
                        }}
                        className="btn-comic-sm text-xs"
                      >
                        EQUIP
                      </button>
                    )}
                    <button
                      data-testid={`sell-${item.uid}`}
                      onClick={() => {
                        sellItem(item.uid);
                        audioEngine.playItemPickup();
                      }}
                      className="btn-comic-sm text-xs btn-danger"
                    >
                      SELL
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryScreen;
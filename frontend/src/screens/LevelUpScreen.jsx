import useGameStore from '../store/gameStore';
import { PERK_LIST } from '../data/perks';
import audioEngine from '../utils/audio';

const LevelUpScreen = () => {
  const state = useGameStore();
  const { level, levelUpPerks, choosePerk } = state;

  const handleChoosePerk = (perkId) => {
    audioEngine.playLevelUp();
    choosePerk(perkId);
  };

  return (
    <div className="min-h-screen bg-[#0A0806] flex flex-col items-center justify-center p-4">
      {/* Level Up Banner */}
      <div className="text-center mb-8">
        <h1 className="font-comic text-5xl text-[#F59E0B] title-glow mb-2">
          LEVEL UP!
        </h1>
        <p className="font-comic text-3xl text-[#84cc16]">
          Level {level}
        </p>
        <p className="font-mono text-[#F59E0B]/60 mt-2">
          +1 to all stats • +12 HP • +1 Skill Point
        </p>
      </div>

      {/* Perk Selection */}
      <div className="w-full">
        <h2 className="font-comic text-xl text-[#F59E0B] text-center mb-4">
          CHOOSE A PERK
        </h2>
        
        <div className="space-y-3">
          {levelUpPerks.map(perk => (
            <div
              key={perk.id}
              data-testid={`perk-${perk.id}`}
              onClick={() => handleChoosePerk(perk.id)}
              className="card-comic cursor-pointer hover:border-[#84cc16] hover:shadow-[4px_4px_0px_#84cc16] transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{perk.icon}</span>
                <div className="flex-1">
                  <h3 className="font-comic text-lg text-[#F59E0B]">{perk.name}</h3>
                  <p className="text-sm text-[#F59E0B]/70">{perk.description}</p>
                </div>
                <div className="text-right">
                  <span className={`font-mono text-xs px-2 py-0.5 border ${
                    perk.tier === 1 ? 'border-gray-400 text-gray-400' :
                    perk.tier === 2 ? 'border-[#84cc16] text-[#84cc16]' :
                    'border-purple-400 text-purple-400'
                  }`}>
                    T{perk.tier}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LevelUpScreen;
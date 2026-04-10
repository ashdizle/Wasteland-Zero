import { useState } from 'react';
import useGameStore from '../store/gameStore';
import { RACES, RACE_LIST } from '../data/races';
import { ARCHETYPES, ARCHETYPE_LIST } from '../data/archetypes';
import { TRAITS, TRAIT_LIST } from '../data/traits';
import audioEngine from '../utils/audio';

const CharacterCreation = () => {
  const [step, setStep] = useState(1); // 1: name, 2: race, 3: archetype, 4: traits
  const [name, setName] = useState('Survivor');
  const [selectedRace, setSelectedRace] = useState(null);
  const [selectedArchetype, setSelectedArchetype] = useState(null);
  const [selectedTraits, setSelectedTraits] = useState([]);
  const [hardcoreMode, setHardcoreMode] = useState(false);

  const setScreen = useGameStore(state => state.setScreen);
  const setCharacterName = useGameStore(state => state.setCharacterName);
  const selectRace = useGameStore(state => state.selectRace);
  const selectArchetype = useGameStore(state => state.selectArchetype);
  const selectTraitsAction = useGameStore(state => state.selectTraits);
  const startNewGame = useGameStore(state => state.startNewGame);
  const saveSlot = useGameStore(state => state.saveSlot);

  const handleNext = () => {
    audioEngine.playButtonClick();
    
    if (step === 1) {
      setCharacterName(name);
      setStep(2);
    } else if (step === 2 && selectedRace) {
      selectRace(selectedRace);
      setStep(3);
    } else if (step === 3 && selectedArchetype) {
      selectArchetype(selectedArchetype);
      setStep(4);
    } else if (step === 4 && selectedTraits.length === 2) {
      selectTraitsAction(selectedTraits);
      startNewGame(saveSlot, hardcoreMode);
    }
  };

  const handleTraitToggle = (traitId) => {
    if (selectedTraits.includes(traitId)) {
      setSelectedTraits(selectedTraits.filter(t => t !== traitId));
    } else if (selectedTraits.length < 2) {
      setSelectedTraits([...selectedTraits, traitId]);
      audioEngine.playItemPickup();
    }
  };

  const renderStepIndicator = () => (
    <div className="flex justify-center gap-2 mb-6">
      {[1, 2, 3, 4].map(s => (
        <div
          key={s}
          className={`w-3 h-3 border border-[#F59E0B] ${
            s === step ? 'bg-[#F59E0B]' : s < step ? 'bg-[#F59E0B]/50' : 'bg-transparent'
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen p-4 bg-[#0A0806]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          data-testid="back-btn"
          onClick={() => {
            audioEngine.playButtonClick();
            if (step > 1) setStep(step - 1);
            else setScreen('saves');
          }}
          className="btn-comic-sm"
        >
          ← BACK
        </button>
        <h1 className="font-comic text-xl text-[#F59E0B]">
          {step === 1 && 'NAME'}
          {step === 2 && 'RACE'}
          {step === 3 && 'CLASS'}
          {step === 4 && 'TRAITS'}
        </h1>
        <div className="w-16" />
      </div>

      {renderStepIndicator()}

      {/* Step 1: Name */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="card-comic">
            <label className="font-comic text-[#F59E0B] text-sm block mb-2">
              SURVIVOR NAME
            </label>
            <input
              data-testid="name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              className="w-full text-xl"
            />
          </div>

          <div className="card-comic">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                data-testid="hardcore-toggle"
                type="checkbox"
                checked={hardcoreMode}
                onChange={(e) => setHardcoreMode(e.target.checked)}
                className="w-5 h-5 accent-[#DC2626]"
              />
              <div>
                <span className="font-comic text-[#DC2626]">HARDCORE MODE</span>
                <p className="text-xs text-[#F59E0B]/60">Permadeath enabled. One life.</p>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Step 2: Race */}
      {step === 2 && (
        <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
          {RACE_LIST.map(race => (
            <div
              key={race.id}
              data-testid={`race-${race.id}`}
              onClick={() => {
                setSelectedRace(race.id);
                audioEngine.playItemPickup();
              }}
              className={`card-comic cursor-pointer transition-all ${
                selectedRace === race.id 
                  ? 'border-[#84cc16] shadow-[4px_4px_0px_#84cc16]' 
                  : 'hover:border-[#F59E0B]/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{race.icon}</span>
                <div className="flex-1">
                  <h3 className="font-comic text-lg text-[#F59E0B]">{race.name}</h3>
                  <p className="text-xs text-[#F59E0B]/60">{race.description}</p>
                </div>
              </div>
              <div className="mt-2 font-mono text-xs text-[#84cc16]">
                {Object.entries(race.bonuses).map(([stat, val]) => (
                  <span key={stat} className="mr-2">+{val} {stat}</span>
                ))}
                {Object.entries(race.penalties || {}).map(([stat, val]) => (
                  <span key={stat} className="mr-2 text-[#DC2626]">{val} {stat}</span>
                ))}
                {race.hpBonus !== 0 && (
                  <span className={race.hpBonus > 0 ? '' : 'text-[#DC2626]'}>
                    {race.hpBonus > 0 ? '+' : ''}{race.hpBonus} HP
                  </span>
                )}
              </div>
              {race.special && (
                <p className="text-xs text-purple-400 mt-1 font-mono">{race.special}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Step 3: Archetype */}
      {step === 3 && (
        <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
          {ARCHETYPE_LIST.map(arch => (
            <div
              key={arch.id}
              data-testid={`archetype-${arch.id}`}
              onClick={() => {
                setSelectedArchetype(arch.id);
                audioEngine.playItemPickup();
              }}
              className={`card-comic cursor-pointer transition-all ${
                selectedArchetype === arch.id 
                  ? 'border-[#84cc16] shadow-[4px_4px_0px_#84cc16]' 
                  : 'hover:border-[#F59E0B]/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{arch.icon}</span>
                <div className="flex-1">
                  <h3 className="font-comic text-lg text-[#F59E0B]">{arch.name}</h3>
                  <p className="text-xs text-[#F59E0B]/60">{arch.role}</p>
                </div>
                <span className="font-mono text-xs text-[#F59E0B]/40 uppercase">
                  {arch.weaponType}
                </span>
              </div>
              <p className="text-xs text-[#F59E0B]/70 mt-1">{arch.description}</p>
              <div className="mt-2 font-mono text-xs">
                <span className="text-[#84cc16]">Starting: {arch.startingWeapon.name}</span>
                {arch.passive && (
                  <span className="text-purple-400 block">⚡ {arch.passive}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Step 4: Traits */}
      {step === 4 && (
        <div>
          <p className="font-mono text-center text-[#F59E0B]/60 text-sm mb-4">
            SELECT 2 TRAITS ({selectedTraits.length}/2)
          </p>
          <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto">
            {TRAIT_LIST.map(trait => (
              <div
                key={trait.id}
                data-testid={`trait-${trait.id}`}
                onClick={() => handleTraitToggle(trait.id)}
                className={`card-comic cursor-pointer transition-all ${
                  selectedTraits.includes(trait.id)
                    ? 'border-[#84cc16] shadow-[4px_4px_0px_#84cc16]'
                    : selectedTraits.length >= 2
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:border-[#F59E0B]/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{trait.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-comic text-[#F59E0B]">{trait.name}</h3>
                    <p className="text-xs text-[#F59E0B]/70">{trait.description}</p>
                  </div>
                  {selectedTraits.includes(trait.id) && (
                    <span className="text-[#84cc16] text-xl">✓</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Button */}
      <div className="fixed bottom-4 left-4 right-4 max-w-[400px] mx-auto">
        <button
          data-testid="next-btn"
          onClick={handleNext}
          disabled={
            (step === 1 && !name) ||
            (step === 2 && !selectedRace) ||
            (step === 3 && !selectedArchetype) ||
            (step === 4 && selectedTraits.length !== 2)
          }
          className="btn-comic w-full text-xl"
        >
          {step === 4 ? 'START ADVENTURE' : 'NEXT →'}
        </button>
      </div>
    </div>
  );
};

export default CharacterCreation;
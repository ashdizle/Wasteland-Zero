import { useState, useEffect } from 'react';
import useGameStore from '../store/gameStore';
import { performSkillCheck } from '../data/rifts';
import audioEngine from '../utils/audio';

const RiftScreen = () => {
  const state = useGameStore();
  const { 
    currentRift, 
    name,
    stats,
    hp,
    inventory,
    selectRiftOption,
    exitRift
  } = state;

  const [showResult, setShowResult] = useState(false);
  const [rollResult, setRollResult] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);

  if (!currentRift) {
    return null;
  }

  const { encounter } = currentRift;
  const freeSlots = 30 - inventory.length;
  const canEnter = hp >= encounter.hpCost && (!encounter.inventorySlotRequired || freeSlots > 0);

  const handleOptionSelect = (option) => {
    if (!canEnter) {
      audioEngine.playError();
      return;
    }

    const statValue = stats[option.stat] || 0;
    const result = performSkillCheck(option.stat, statValue, option.dc);
    
    setSelectedOption(option);
    setRollResult(result);
    setShowResult(true);
    
    if (result.success) {
      audioEngine.playVictory();
    } else {
      audioEngine.playDefeat();
    }
  };

  const handleContinue = () => {
    if (rollResult && selectedOption) {
      selectRiftOption(selectedOption, rollResult);
      setShowResult(false);
      setRollResult(null);
      setSelectedOption(null);
    }
  };

  const handleExit = () => {
    audioEngine.playButtonClick();
    exitRift();
  };

  // Result Screen
  if (showResult && rollResult && selectedOption) {
    return (
      <div className="min-h-screen rift-container flex items-center justify-center p-4">
        <div className="card-rift max-w-md w-full">
          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="font-comic text-2xl sm:text-3xl text-[#c084fc] mb-2">
              {name.toUpperCase()} ROLLS {selectedOption.name}
            </h1>
            <p className="font-mono text-sm text-[#a78bfa]/70">
              DIFFICULTY: {selectedOption.difficulty.toUpperCase()} · DC {selectedOption.dc}
            </p>
          </div>

          {/* D20 Roll Display */}
          <div className="flex flex-col items-center mb-6">
            <div className="rift-die mb-4">
              <span className="text-6xl font-comic text-white animate-pulse">
                {rollResult.roll}
              </span>
            </div>
            
            {/* Calculation */}
            <div className="font-mono text-xl text-[#a78bfa]/80 mb-4">
              {rollResult.roll} +{rollResult.modifier} = {rollResult.total}
            </div>

            {/* Result */}
            <div className={`font-comic text-4xl ${
              rollResult.success ? 'text-[#4ade80] rift-success' : 'text-[#ef4444] rift-failure'
            }`}>
              {rollResult.isCrit ? '⚡ CRITICAL!' : rollResult.success ? 'SUCCESS' : 'FAILURE'}
            </div>
          </div>

          {/* Continue */}
          <button
            data-testid="rift-continue-btn"
            onClick={handleContinue}
            className="btn-rift w-full"
          >
            TAP TO CONTINUE
          </button>
        </div>
      </div>
    );
  }

  // Rift Encounter Screen
  return (
    <div className="min-h-screen rift-container p-4">
      <div className="max-w-md mx-auto">
        {/* Rift Icon & Title */}
        <div className="text-center mb-6 mt-8">
          <div className="text-6xl mb-3 rift-icon">
            {encounter.icon}
          </div>
          <h1 className="font-comic text-3xl sm:text-4xl text-[#c084fc] mb-2 rift-glow">
            {encounter.name.toUpperCase()}
          </h1>
          <p className="font-body text-base text-[#e9d5ff] leading-relaxed px-4">
            {encounter.description}
          </p>
        </div>

        {/* Entry Cost */}
        <div className="card-rift-cost mb-4">
          <div className="flex items-center justify-center gap-2 font-mono text-sm">
            <span className="text-[#f87171]">⚡ Entry cost: {encounter.hpCost} HP</span>
            {encounter.inventorySlotRequired && (
              <span className="text-[#60a5fa]">· Bag needs 1 free slot</span>
            )}
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-4">
          {encounter.options.map((option, index) => {
            const statValue = stats[option.stat] || 0;
            
            return (
              <button
                key={option.id}
                data-testid={`rift-option-${index}`}
                onClick={() => handleOptionSelect(option)}
                disabled={!canEnter}
                className="card-rift-option w-full text-left"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">
                    {option.stat === 'STR' ? '⚔️' : 
                     option.stat === 'INT' ? '🧠' : 
                     option.stat === 'AGI' ? '💨' :
                     option.stat === 'END' ? '🛡️' :
                     option.stat === 'LCK' ? '🎲' : '✨'}
                  </span>
                  <div className="flex-1">
                    <div className="font-comic text-lg text-[#e9d5ff] mb-1">
                      {option.name}
                    </div>
                    <div className="font-mono text-xs text-[#a78bfa]/60 mb-1">
                      {option.stat} +{statValue} · DC {option.dc} ({option.difficulty})
                    </div>
                    {option.description && (
                      <p className="font-body text-sm text-[#c4b5fd]/80">
                        {option.description}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Back Away */}
        <button
          data-testid="rift-back-away-btn"
          onClick={handleExit}
          className="btn-rift-safe w-full"
        >
          ↩ Back Away (Safe)
        </button>

        {/* Warning if can't enter */}
        {!canEnter && (
          <div className="mt-4 text-center font-mono text-sm text-[#f87171]">
            {hp < encounter.hpCost ? '⚠️ Not enough HP' : '⚠️ No inventory space'}
          </div>
        )}
      </div>
    </div>
  );
};

export default RiftScreen;

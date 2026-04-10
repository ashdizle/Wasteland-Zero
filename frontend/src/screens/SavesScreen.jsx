import { useState } from 'react';
import useGameStore from '../store/gameStore';
import { getAllSaveSlots, deleteSave, formatPlayTime } from '../utils/save';
import { RACES } from '../data/races';
import { ARCHETYPES } from '../data/archetypes';
import { TERRITORIES } from '../data/territories';
import audioEngine from '../utils/audio';

const SavesScreen = () => {
  const setScreen = useGameStore(state => state.setScreen);
  const loadFromSlot = useGameStore(state => state.loadFromSlot);
  const setSaveSlot = useGameStore(state => state.setSaveSlot);
  const [saves, setSaves] = useState(getAllSaveSlots());
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleLoad = (slot) => {
    if (saves[slot - 1]) {
      audioEngine.playButtonClick();
      loadFromSlot(slot);
    }
  };

  const handleNewGame = (slot) => {
    audioEngine.playButtonClick();
    setSaveSlot(slot);
    setScreen('newGame');
  };

  const handleDelete = (slot) => {
    audioEngine.playError();
    deleteSave(slot);
    setSaves(getAllSaveSlots());
    setConfirmDelete(null);
  };

  return (
    <div className="min-h-screen p-4 bg-[#0A0806]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          data-testid="back-btn"
          onClick={() => {
            audioEngine.playButtonClick();
            setScreen('title');
          }}
          className="btn-comic-sm"
        >
          ← BACK
        </button>
        <h1 className="font-comic text-2xl text-[#F59E0B]">SAVE FILES</h1>
        <div className="w-20" />
      </div>

      {/* Save Slots */}
      <div className="space-y-4">
        {[1, 2, 3].map(slot => {
          const save = saves[slot - 1];
          return (
            <div key={slot} className="card-comic">
              <div className="flex items-center justify-between mb-2">
                <span className="font-comic text-xl text-[#F59E0B]">
                  SLOT {slot}
                </span>
                {save?.hardcoreMode && (
                  <span className="font-mono text-xs text-[#DC2626] border border-[#DC2626] px-2 py-0.5">
                    HARDCORE
                  </span>
                )}
              </div>
              
              {save ? (
                <>
                  <div className="font-body text-[#F59E0B]/80 mb-2">
                    <div className="flex justify-between">
                      <span className="font-bold">{save.name}</span>
                      <span className="font-mono">Lv.{save.level}</span>
                    </div>
                    <div className="flex justify-between text-sm text-[#F59E0B]/60">
                      <span>{RACES[save.race]?.name} {ARCHETYPES[save.archetype]?.name}</span>
                      <span>{TERRITORIES[save.territory]?.name}</span>
                    </div>
                    {save.prestigeLevel > 0 && (
                      <span className="font-mono text-purple-400">🔱 P{save.prestigeLevel}</span>
                    )}
                    <div className="text-xs text-[#F59E0B]/40 mt-1">
                      Playtime: {formatPlayTime(save.playTime || 0)}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    <button
                      data-testid={`load-slot-${slot}-btn`}
                      onClick={() => handleLoad(slot)}
                      className="btn-comic-sm flex-1"
                    >
                      CONTINUE
                    </button>
                    {confirmDelete === slot ? (
                      <>
                        <button
                          data-testid={`confirm-delete-${slot}-btn`}
                          onClick={() => handleDelete(slot)}
                          className="btn-comic-sm btn-danger"
                        >
                          YES
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="btn-comic-sm"
                        >
                          NO
                        </button>
                      </>
                    ) : (
                      <button
                        data-testid={`delete-slot-${slot}-btn`}
                        onClick={() => setConfirmDelete(slot)}
                        className="btn-comic-sm btn-danger"
                      >
                        DELETE
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <button
                  data-testid={`new-game-slot-${slot}-btn`}
                  onClick={() => handleNewGame(slot)}
                  className="btn-comic w-full mt-2"
                >
                  NEW GAME
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SavesScreen;
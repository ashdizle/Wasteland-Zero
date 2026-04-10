import useGameStore from '../store/gameStore';
import audioEngine from '../utils/audio';

const GameOverScreen = () => {
  const { name, level, race, archetype, achievementProgress, resetGame, setScreen } = useGameStore();

  return (
    <div className="min-h-screen bg-[#0A0806] flex flex-col items-center justify-center p-6">
      {/* Death Banner */}
      <div className="text-center mb-8">
        <h1 className="font-comic text-5xl text-[#DC2626] mb-2">
          GAME OVER
        </h1>
        <p className="font-mono text-[#F59E0B]/60">
          The wasteland claims another soul...
        </p>
      </div>

      {/* Stats Card */}
      <div className="card-comic w-full mb-8">
        <h2 className="font-comic text-xl text-[#F59E0B] text-center mb-4">
          {name}'s Legacy
        </h2>
        
        <div className="space-y-2 font-mono text-sm">
          <div className="flex justify-between text-[#F59E0B]/70">
            <span>Level Reached</span>
            <span className="text-[#F59E0B]">{level}</span>
          </div>
          <div className="flex justify-between text-[#F59E0B]/70">
            <span>Enemies Killed</span>
            <span className="text-[#F59E0B]">{achievementProgress.kills}</span>
          </div>
          <div className="flex justify-between text-[#F59E0B]/70">
            <span>Bosses Defeated</span>
            <span className="text-[#F59E0B]">{achievementProgress.bossKills}</span>
          </div>
          <div className="flex justify-between text-[#F59E0B]/70">
            <span>Combats Won</span>
            <span className="text-[#F59E0B]">{achievementProgress.combatsWon}</span>
          </div>
          <div className="flex justify-between text-[#F59E0B]/70">
            <span>Max Damage Hit</span>
            <span className="text-[#F59E0B]">{achievementProgress.maxDamage}</span>
          </div>
          <div className="flex justify-between text-[#F59E0B]/70">
            <span>Tiles Explored</span>
            <span className="text-[#F59E0B]">{achievementProgress.tilesExplored}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="w-full space-y-3">
        <button
          data-testid="new-game-btn"
          onClick={() => {
            audioEngine.playButtonClick();
            resetGame();
          }}
          className="btn-comic w-full text-xl"
        >
          TRY AGAIN
        </button>
        
        <button
          data-testid="main-menu-btn"
          onClick={() => {
            audioEngine.playButtonClick();
            resetGame();
            setScreen('title');
          }}
          className="btn-comic w-full"
        >
          MAIN MENU
        </button>
      </div>
    </div>
  );
};

export default GameOverScreen;
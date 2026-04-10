import useGameStore from '../store/gameStore';
import audioEngine from '../utils/audio';

const TitleScreen = () => {
  const setScreen = useGameStore(state => state.setScreen);

  const handleStart = () => {
    audioEngine.playButtonClick();
    setScreen('saves');
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-6 relative"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1765578539072-7c074ddb5ef3?w=800)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0806]/70 via-[#0A0806]/50 to-[#0A0806]/90" />
      
      <div className="relative z-10 text-center">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="font-comic text-6xl text-[#F59E0B] title-glow tracking-wider">
            WASTELAND
          </h1>
          <h1 className="font-comic text-7xl text-[#F59E0B] title-glow tracking-widest -mt-2">
            ZERO
          </h1>
        </div>
        
        {/* Tagline */}
        <p className="font-mono text-[#F59E0B]/70 text-lg mb-12 tracking-wider">
          [ SURVIVE · FIGHT · CONQUER ]
        </p>
        
        {/* Main button */}
        <button
          data-testid="start-game-btn"
          onClick={handleStart}
          className="btn-comic text-2xl px-8 py-4 mb-6"
        >
          START GAME
        </button>
        
        {/* Version */}
        <p className="font-mono text-[#F59E0B]/40 text-sm mt-8">
          v1.0.0 | A Post-Apocalyptic Roguelite
        </p>
      </div>
      
      {/* Halftone decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-32 halftone-bg" />
    </div>
  );
};

export default TitleScreen;
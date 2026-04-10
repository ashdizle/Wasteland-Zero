import useGameStore from '../store/gameStore';
import audioEngine from '../utils/audio';

const TitleScreen = () => {
  const setScreen = useGameStore(state => state.setScreen);

  const handleStart = () => {
    audioEngine.init();
    audioEngine.playButtonClick();
    setScreen('saves');
  };

  return (
    <div className="min-h-screen wasteland-container flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#3d2914]/50 via-transparent to-[#0d0906]" />
      
      {/* Wasteland cityscape silhouette */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-48 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 100'%3E%3Cpath fill='%23c9a227' d='M0,100 L0,70 L20,70 L20,50 L40,50 L40,60 L60,60 L60,40 L80,40 L80,30 L100,30 L100,50 L120,50 L120,35 L140,35 L140,55 L160,55 L160,25 L180,25 L180,45 L200,45 L200,20 L220,20 L220,50 L240,50 L240,30 L260,30 L260,60 L280,60 L280,40 L300,40 L300,55 L320,55 L320,45 L340,45 L340,65 L360,65 L360,50 L380,50 L380,70 L400,70 L400,100 Z'/%3E%3C/svg%3E")`,
          backgroundSize: 'cover',
          backgroundPosition: 'bottom'
        }}
      />
      
      <div className="relative z-10 text-center">
        {/* Logo */}
        <div className="mb-8">
          <h1 
            className="font-comic text-6xl text-[#f5d742] title-glow tracking-wider"
            style={{ WebkitTextStroke: '2px #000' }}
          >
            WASTELAND
          </h1>
          <h1 
            className="font-comic text-7xl text-[#ff6b35] title-glow tracking-widest -mt-2"
            style={{ 
              WebkitTextStroke: '2px #000',
              textShadow: '0 0 30px #ff6b35, 4px 4px 0 #000'
            }}
          >
            ZERO
          </h1>
        </div>
        
        {/* Tagline */}
        <p className="font-mono text-[#c9a227] text-lg mb-12 tracking-wider">
          [ SURVIVE • FIGHT • CONQUER ]
        </p>
        
        {/* Main button */}
        <button
          data-testid="start-game-btn"
          onClick={handleStart}
          className="btn-comic text-2xl px-12 py-4 mb-6"
          style={{ boxShadow: '0 6px 0 #1a1008, 0 8px 20px rgba(0, 0, 0, 0.5)' }}
        >
          START GAME
        </button>
        
        {/* Version */}
        <p className="font-mono text-[#c9a227]/40 text-sm mt-12">
          v1.0.0 | A Post-Apocalyptic Roguelite RPG
        </p>
      </div>
      
      {/* Decorative corners */}
      <div className="absolute top-4 left-4 w-16 h-16 border-l-4 border-t-4 border-[#c9a227]/30" />
      <div className="absolute top-4 right-4 w-16 h-16 border-r-4 border-t-4 border-[#c9a227]/30" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-l-4 border-b-4 border-[#c9a227]/30" />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-r-4 border-b-4 border-[#c9a227]/30" />
    </div>
  );
};

export default TitleScreen;

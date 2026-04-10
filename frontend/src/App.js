import "@/App.css";
import { useEffect } from "react";
import useGameStore from "./store/gameStore";
import audioEngine from "./utils/audio";

// Screens
import TitleScreen from "./screens/TitleScreen";
import SavesScreen from "./screens/SavesScreen";
import CharacterCreation from "./screens/CharacterCreation";
import MapScreen from "./screens/MapScreen";
import CombatScreen from "./screens/CombatScreen";
import InventoryScreen from "./screens/InventoryScreen";
import SkillsScreen from "./screens/SkillsScreen";
import TownScreen from "./screens/TownScreen";
import LevelUpScreen from "./screens/LevelUpScreen";
import GameOverScreen from "./screens/GameOverScreen";

function App() {
  const screen = useGameStore(state => state.screen);

  useEffect(() => {
    // Initialize audio on first interaction
    const initAudio = () => {
      audioEngine.init();
      document.removeEventListener('click', initAudio);
    };
    document.addEventListener('click', initAudio);
    return () => document.removeEventListener('click', initAudio);
  }, []);

  const renderScreen = () => {
    switch (screen) {
      case 'title':
        return <TitleScreen />;
      case 'saves':
        return <SavesScreen />;
      case 'newGame':
        return <CharacterCreation />;
      case 'map':
        return <MapScreen />;
      case 'combat':
        return <CombatScreen />;
      case 'inventory':
        return <InventoryScreen />;
      case 'skills':
        return <SkillsScreen />;
      case 'town':
        return <TownScreen />;
      case 'levelUp':
        return <LevelUpScreen />;
      case 'gameOver':
        return <GameOverScreen />;
      default:
        return <TitleScreen />;
    }
  };

  return (
    <div className="w-full min-h-screen bg-black flex justify-center font-body">
      <div className="w-full max-w-[400px] min-h-screen bg-[#0A0806] relative shadow-[0_0_50px_rgba(245,158,11,0.1)] overflow-hidden">
        {/* Scanline overlay */}
        <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] z-[100] mix-blend-overlay" />
        {/* Vignette */}
        <div className="pointer-events-none fixed inset-0 shadow-[inset_0_0_50px_rgba(0,0,0,0.9)] z-[90]" />
        {/* Main content */}
        <div className="relative z-10 min-h-screen">
          {renderScreen()}
        </div>
      </div>
    </div>
  );
}

export default App;
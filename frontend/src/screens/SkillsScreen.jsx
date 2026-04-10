import useGameStore from '../store/gameStore';
import { SKILL_TREE, SKILL_CATEGORIES } from '../data/skills';
import audioEngine from '../utils/audio';

const SkillsScreen = () => {
  const state = useGameStore();
  const {
    skillPoints, unlockedSkills,
    unlockSkill, setScreen
  } = state;

  const canUnlock = (skill) => {
    if (unlockedSkills.includes(skill.id)) return false;
    if (skillPoints < skill.cost) return false;
    if (skill.requires?.length) {
      return skill.requires.every(req => unlockedSkills.includes(req));
    }
    return true;
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'combat': return '⚔️';
      case 'defense': return '🛡️';
      case 'healing': return '❤️';
      case 'economy': return '💰';
      default: return '⭐';
    }
  };

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
        <h1 className="font-comic text-2xl text-[#F59E0B]">SKILLS</h1>
        <span className="font-mono text-[#84cc16]">⭐ {skillPoints}</span>
      </div>

      {/* Skill Categories */}
      {SKILL_CATEGORIES.map(category => {
        const categorySkills = Object.values(SKILL_TREE).filter(s => s.category === category);
        
        return (
          <div key={category} className="mb-6">
            <h2 className="font-comic text-lg text-[#F59E0B]/80 mb-2 flex items-center gap-2">
              {getCategoryIcon(category)} {category.toUpperCase()}
            </h2>
            
            <div className="space-y-2">
              {categorySkills.map(skill => {
                const isUnlocked = unlockedSkills.includes(skill.id);
                const canBuy = canUnlock(skill);
                const isLocked = !isUnlocked && !canBuy;
                
                return (
                  <div
                    key={skill.id}
                    data-testid={`skill-${skill.id}`}
                    onClick={() => canBuy && unlockSkill(skill.id)}
                    className={`skill-card ${
                      isUnlocked ? 'skill-card-unlocked' :
                      isLocked ? 'skill-card-locked' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{skill.icon}</span>
                        <div>
                          <span className={`font-comic ${
                            isUnlocked ? 'text-[#84cc16]' : 'text-[#F59E0B]'
                          }`}>
                            {skill.name}
                          </span>
                          {skill.apCost > 0 && (
                            <span className="font-mono text-xs text-[#3B82F6] ml-2">
                              {skill.apCost} AP
                            </span>
                          )}
                          {skill.usesPerCombat > 0 && (
                            <span className="font-mono text-xs text-[#F59E0B]/50 ml-1">
                              ({skill.usesPerCombat}/combat)
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {isUnlocked ? (
                        <span className="text-[#84cc16] text-xl">✓</span>
                      ) : (
                        <span className={`font-mono text-sm ${
                          canBuy ? 'text-[#F59E0B]' : 'text-[#F59E0B]/40'
                        }`}>
                          {skill.cost} SP
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-[#F59E0B]/60 mt-1">
                      {skill.description}
                    </p>
                    
                    {skill.requires?.length > 0 && !isUnlocked && (
                      <p className="text-xs text-purple-400 mt-1">
                        Requires: {skill.requires.map(r => SKILL_TREE[r]?.name).join(', ')}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SkillsScreen;
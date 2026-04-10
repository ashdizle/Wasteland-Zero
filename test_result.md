#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: "Wasteland Zero - Comic-style roguelite RPG with turn-based combat, procedural maps, character creation, and D&D-style mechanics including Reality Rift system"

frontend:
  - task: "Map Screen - Adjacent Tile Visual Highlighting"
    implemented: true
    working: false
    file: "/app/frontend/src/screens/MapScreen.jsx, /app/frontend/src/App.css"
    stuck_count: 1
    priority: "critical"
    needs_retesting: true
    status_history:
      - working: false
        agent: "testing"
        comment: "Iteration 3 - No adjacent tiles visible for combat navigation. Map shows 48 unexplored tiles but 0 adjacent tiles."
      - working: false
        agent: "main"
        comment: "Fixed CSS class conditional logic in MapScreen.jsx (line 93-98) to allow both unexplored AND adjacent classes simultaneously. Updated App.css map-tile-adjacent to use !important, golden border (#f5d742), stronger background, and pulse animation to override unexplored styling."

  - task: "Character Creation Flow"
    implemented: true
    working: true
    file: "/app/frontend/src/screens/CharacterCreation.jsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "testing"
        comment: "Iteration 3 - Complete character creation flow working (name, race, archetype, traits)"

  - task: "Combat System"
    implemented: true
    working: true
    file: "/app/frontend/src/screens/CombatScreen.jsx, /app/frontend/src/store/gameStore.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "testing"
        comment: "Iteration 3 - Turn-based combat functional but inaccessible due to map navigation issue"

  - task: "Web Audio API Integration"
    implemented: true
    working: true
    file: "/app/frontend/src/utils/audio.js"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Audio engine created with methods for button clicks, attacks, victory, etc. Partially hooked into UI (MapScreen buttons). Needs full verification across all game actions."
      - working: true
        agent: "main"
        comment: "VERIFIED: Audio engine fully integrated across entire application. Found 37 audioEngine calls in UI screens and 30+ in gameStore.js. Covers all actions: button clicks, combat (hits/crits/misses/death), item pickup, healing, level up, victory/defeat, boss appearance, loot. Audio.init() called on first user interaction in TitleScreen."

  - task: "Reality Rift System & D20 Mechanics"
    implemented: true
    working: "NA"
    file: "/app/frontend/src/screens/RiftScreen.jsx, /app/frontend/src/data/rifts.js, /app/frontend/src/store/gameStore.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "User shared screenshots showing Reality Rift encounter with skill checks (BRAWN, MIND MELD, LUCK). Appears implemented but needs e2e testing."
      - working: "NA"
        agent: "main"
        comment: "IMPLEMENTED: Full Reality Rift system with RiftScreen component, 5 unique encounters (Reality Tear, Void Gaze, Cosmic Whispers, Time Fracture, Aberrant Portal), D20 roll mechanics with stat modifiers vs DC, purple/blue cosmic theme UI, HP cost entry, 3 skill check options per encounter, success rewards (caps/XP/items), failure penalties, animated d20 result screen. Integration complete in gameStore. Rifts spawn at 5% on map generation. Needs testing to verify encounter flow, roll calculations, and rewards/penalties."

metadata:
  created_by: "main_agent"
  version: "1.0"
  test_sequence: 4
  run_ui: true

test_plan:
  current_focus:
    - "Map Screen - Adjacent Tile Visual Highlighting"
  stuck_tasks:
    - "Map Screen - Adjacent Tile Visual Highlighting"
  test_all: false
  test_priority: "stuck_first"

agent_communication:
  - agent: "main"
    message: "Fixed the CSS conflict preventing adjacent tiles from being highlighted on MapScreen. The issue was conditional class logic that prevented both 'unexplored' and 'adjacent' classes from being applied simultaneously. Updated MapScreen.jsx to allow both classes, and strengthened CSS specificity for map-tile-adjacent with !important, golden borders, glow effects, and pulse animation. CRITICAL: Testing agent must verify adjacent tiles (typically 4 tiles around player position at map start) now have visible golden/glowing borders that distinguish them from regular unexplored tiles."
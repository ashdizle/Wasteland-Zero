// ═══════════════════════════════════════════════════════════════
//  NPC & DIALOGUE SYSTEM — Wasteland Zero
// ═══════════════════════════════════════════════════════════════

const NPC_PORTRAITS = {
  elder:    '/npc_elder.png',
  mechanic: '/npc_mechanic.png',
  broker:   '/npc_broker.png',
};

// ─── NPC DEFINITIONS ───
const NPCS = [
  {
    id: 'elder_mara', name: 'Elder Mara', portrait: 'elder', icon: '👁',
    title: 'Wasteland Oracle',
    desc: 'An ancient seer who knows the land\'s secrets.',
    territories: ['badlands', 'deadzone'],
  },
  {
    id: 'wrench_kai', name: 'Wrench Kai', portrait: 'mechanic', icon: '🔧',
    title: 'Rogue Mechanic',
    desc: 'Builds anything from scrap. Has a favor to ask.',
    territories: ['badlands', 'ironworks'],
  },
  {
    id: 'shade', name: 'Shade', portrait: 'broker', icon: '🕵',
    title: 'Information Broker',
    desc: 'Knows everyone\'s secrets — for a price.',
    territories: ['ironworks', 'deadzone', 'vaultreach'],
  },
  {
    id: 'old_bones', name: 'Old Bones', portrait: 'elder', icon: '💀',
    title: 'Gravekeeper',
    desc: 'Tends the dead. Knows where they hid their treasures.',
    territories: ['deadzone', 'vaultreach'],
  },
  {
    id: 'spark', name: 'Spark', portrait: 'mechanic', icon: '⚡',
    title: 'Scrap Engineer',
    desc: 'Wants to build something big. Needs your help.',
    territories: ['ironworks', 'vaultreach'],
  },
  {
    id: 'whisper', name: 'Whisper', portrait: 'broker', icon: '🌑',
    title: 'Shadow Runner',
    desc: 'Moves unseen. Has intel on the vault.',
    territories: ['deadzone', 'vaultreach'],
  },
];

// ─── QUEST CHAIN SYSTEM ───
// Each quest has: id, npcId, title, description, type, requirements, rewards, nextQuest
// Types: 'kill', 'fetch', 'explore', 'choice'
// Choice quests branch based on player decision

const QUEST_CHAINS = {
  // ─── ELDER MARA'S CHAIN ───
  mara_visions: {
    id: 'mara_visions', npcId: 'elder_mara', chain: 'mara',
    title: 'Visions of the Wasteland',
    desc: 'Elder Mara has foreseen danger. She needs you to scout the ruins to the north.',
    type: 'explore', reqTilesExplored: 12,
    reward: { xp: 200, caps: 50, item: 'Stimpack' },
    nextQuest: 'mara_choice',
  },
  mara_choice: {
    id: 'mara_choice', npcId: 'elder_mara', chain: 'mara',
    title: 'The Seer\'s Dilemma',
    desc: 'Mara has seen two possible futures. One path leads to power, the other to knowledge.',
    type: 'choice',
    choices: [
      {
        label: '⚔ PATH OF POWER',
        desc: 'Seek the ancient weapon cache. +STR, +ATK gear.',
        flag: 'mara_power',
        reward: { xp: 300, caps: 80, statBoost: { str: 3 }, item: 'War Axe' },
        nextQuest: 'mara_power_hunt',
      },
      {
        label: '📖 PATH OF KNOWLEDGE',
        desc: 'Study the old texts. +INT, +skill point, better loot luck.',
        flag: 'mara_knowledge',
        reward: { xp: 300, caps: 60, statBoost: { int: 3 }, skillPoints: 2 },
        nextQuest: 'mara_knowledge_seek',
      },
    ],
  },
  mara_power_hunt: {
    id: 'mara_power_hunt', npcId: 'elder_mara', chain: 'mara',
    title: 'The Weapon Cache',
    desc: 'Mara directs you to destroy 5 Mutants guarding the ancient armory.',
    type: 'kill', target: 'Mutant', count: 5,
    reward: { xp: 500, caps: 120, tierItem: 'legendary', statBoost: { str: 2, end: 1 } },
    nextQuest: null,
  },
  mara_knowledge_seek: {
    id: 'mara_knowledge_seek', npcId: 'elder_mara', chain: 'mara',
    title: 'Lost Archives',
    desc: 'Mara asks you to explore 20 tiles to find scattered data fragments.',
    type: 'explore', reqTilesExplored: 20,
    reward: { xp: 500, caps: 100, skillPoints: 2, lootLuck: 3, statBoost: { int: 2, lck: 2 } },
    nextQuest: null,
  },

  // ─── WRENCH KAI'S CHAIN ───
  kai_parts: {
    id: 'kai_parts', npcId: 'wrench_kai', chain: 'kai',
    title: 'Spare Parts',
    desc: 'Kai needs scrap metal from destroyed Mech-Bots. Bring her 3 kills.',
    type: 'kill', target: 'Mech-Bot', count: 3,
    reward: { xp: 250, caps: 70, item: 'Scrap Armor' },
    nextQuest: 'kai_choice',
  },
  kai_choice: {
    id: 'kai_choice', npcId: 'wrench_kai', chain: 'kai',
    title: 'Kai\'s Masterwork',
    desc: 'With the parts collected, Kai can build one of two things.',
    type: 'choice',
    choices: [
      {
        label: '🛡 HEAVY ARMOR',
        desc: 'A custom suit of wasteland plate. Best defense in the land.',
        flag: 'kai_armor',
        reward: { xp: 400, caps: 50, tierItem: 'legendary', tierSlot: 'chest' },
        nextQuest: 'kai_armor_test',
      },
      {
        label: '⚔ SHOCK WEAPON',
        desc: 'An electrified blade that stuns on hit. Pure offense.',
        flag: 'kai_weapon',
        reward: { xp: 400, caps: 50, tierItem: 'legendary', tierSlot: 'weapon' },
        nextQuest: 'kai_weapon_test',
      },
    ],
  },
  kai_armor_test: {
    id: 'kai_armor_test', npcId: 'wrench_kai', chain: 'kai',
    title: 'Armor Field Test',
    desc: 'Kai wants you to take 10 hits in combat to test the armor. Kill 4 enemies wearing it.',
    type: 'kill', target: 'any', count: 4,
    reward: { xp: 600, caps: 150, statBoost: { end: 3, def: 5 } },
    nextQuest: null,
  },
  kai_weapon_test: {
    id: 'kai_weapon_test', npcId: 'wrench_kai', chain: 'kai',
    title: 'Blade Field Test',
    desc: 'Kai wants proof the weapon works. Kill 4 enemies with it equipped.',
    type: 'kill', target: 'any', count: 4,
    reward: { xp: 600, caps: 150, statBoost: { str: 2, agi: 2 } },
    nextQuest: null,
  },

  // ─── SHADE'S CHAIN ───
  shade_intel: {
    id: 'shade_intel', npcId: 'shade', chain: 'shade',
    title: 'Eyes Everywhere',
    desc: 'Shade wants intel. Explore 15 map tiles so he can map the territory.',
    type: 'explore', reqTilesExplored: 15,
    reward: { xp: 200, caps: 100 },
    nextQuest: 'shade_choice',
  },
  shade_choice: {
    id: 'shade_choice', npcId: 'shade', chain: 'shade',
    title: 'Shade\'s Deal',
    desc: 'Shade has a proposition. Help him, and the rewards are great — but the methods... differ.',
    type: 'choice',
    choices: [
      {
        label: '💰 THE HEIST',
        desc: 'Rob a wasteland caravan. Big caps, no questions asked.',
        flag: 'shade_heist',
        reward: { xp: 350, caps: 300 },
        nextQuest: 'shade_heist_job',
      },
      {
        label: '🕵 THE INFORMANT',
        desc: 'Become Shade\'s eyes. Map the territory, reveal all secrets.',
        flag: 'shade_informant',
        reward: { xp: 350, caps: 80, revealMap: true },
        nextQuest: 'shade_informant_job',
      },
      {
        label: '🗡 THE BETRAYAL',
        desc: 'Turn Shade in to the town guards. Justice has its own rewards.',
        flag: 'shade_betrayal',
        reward: { xp: 500, caps: 60, skillPoints: 1, statBoost: { lck: 3 } },
        nextQuest: null,
      },
    ],
  },
  shade_heist_job: {
    id: 'shade_heist_job', npcId: 'shade', chain: 'shade',
    title: 'Caravan Takedown',
    desc: 'Clear the caravan guards — 3 Shock Troopers stand between you and the loot.',
    type: 'kill', target: 'Shock Trooper', count: 3,
    reward: { xp: 600, caps: 400, tierItem: 'unique' },
    nextQuest: null,
  },
  shade_informant_job: {
    id: 'shade_informant_job', npcId: 'shade', chain: 'shade',
    title: 'Total Surveillance',
    desc: 'Reveal the entire map for Shade. Explore every corner.',
    type: 'explore', reqTilesExplored: 35,
    reward: { xp: 600, caps: 200, lootLuck: 5, revealMap: true },
    nextQuest: null,
  },

  // ─── OLD BONES CHAIN ───
  bones_burial: {
    id: 'bones_burial', npcId: 'old_bones', chain: 'bones',
    title: 'Grave Robbers',
    desc: 'Raiders are desecrating graves. Kill 4 Raiders to drive them off.',
    type: 'kill', target: 'Raider', count: 4,
    reward: { xp: 200, caps: 60, item: 'RadAway' },
    nextQuest: 'bones_choice',
  },
  bones_choice: {
    id: 'bones_choice', npcId: 'old_bones', chain: 'bones',
    title: 'The Dead\'s Secrets',
    desc: 'Old Bones knows where the dead hid their most valuable possessions.',
    type: 'choice',
    choices: [
      {
        label: '💎 TREASURE MAP',
        desc: 'Get the location of hidden treasure. Massive loot.',
        flag: 'bones_treasure',
        reward: { xp: 300, caps: 200, tierItem: 'legendary' },
        nextQuest: 'bones_treasure_hunt',
      },
      {
        label: '☠ DEATH\'S BLESSING',
        desc: 'Old Bones teaches you the dead\'s resilience. +MAX HP, rad resistance.',
        flag: 'bones_blessing',
        reward: { xp: 300, statBoost: { end: 4, maxHp: 40 }, radResist: true },
        nextQuest: null,
      },
    ],
  },
  bones_treasure_hunt: {
    id: 'bones_treasure_hunt', npcId: 'old_bones', chain: 'bones',
    title: 'Into the Crypt',
    desc: 'The treasure is guarded by the restless dead. Kill 3 Ghouls to reach it.',
    type: 'kill', target: 'Ghoul', count: 3,
    reward: { xp: 500, caps: 300, tierItem: 'mythic', statBoost: { lck: 2 } },
    nextQuest: null,
  },

  // ─── SPARK'S CHAIN ───
  spark_prototype: {
    id: 'spark_prototype', npcId: 'spark', chain: 'spark',
    title: 'The Big Machine',
    desc: 'Spark is building something massive but needs Power Cells from Mech-Bots. Kill 3.',
    type: 'kill', target: 'Mech-Bot', count: 3,
    reward: { xp: 280, caps: 80, item: 'Adrenaline' },
    nextQuest: 'spark_test',
  },
  spark_test: {
    id: 'spark_test', npcId: 'spark', chain: 'spark',
    title: 'Field Test',
    desc: 'Spark\'s prototype is ready. She wants you to stress-test it — kill 5 enemies using it.',
    type: 'kill', target: 'any', count: 5,
    reward: { xp: 350, caps: 100 },
    nextQuest: 'spark_choice',
  },
  spark_choice: {
    id: 'spark_choice', npcId: 'spark', chain: 'spark',
    title: 'What to Build?',
    desc: 'Spark can adapt the machine into one of two tools for your journey.',
    type: 'choice',
    choices: [
      {
        label: '⚡ PULSE CANNON',
        desc: 'A devastating ranged weapon with stun capability.',
        flag: 'spark_cannon',
        reward: { xp: 500, caps: 100, tierItem: 'legendary', tierSlot: 'weapon' },
        nextQuest: null,
      },
      {
        label: '🛡 POWER SHIELD',
        desc: 'An energy shield that absorbs damage and reflects it.',
        flag: 'spark_shield',
        reward: { xp: 500, caps: 100, tierItem: 'legendary', tierSlot: 'chest', statBoost: { end: 3 } },
        nextQuest: null,
      },
    ],
  },

  // ─── WHISPER'S CHAIN ───
  whisper_contact: {
    id: 'whisper_contact', npcId: 'whisper', chain: 'whisper',
    title: 'A Ghost\'s Request',
    desc: 'Whisper has intel on the vault but needs you to eliminate 3 Shock Troopers blocking her route.',
    type: 'kill', target: 'Shock Trooper', count: 3,
    reward: { xp: 300, caps: 90, revealMap: false },
    nextQuest: 'whisper_vault',
  },
  whisper_vault: {
    id: 'whisper_vault', npcId: 'whisper', chain: 'whisper',
    title: 'Vault Secrets',
    desc: 'Whisper has decoded the vault layouts. Help her scout — explore 25 tiles.',
    type: 'explore', reqTilesExplored: 25,
    reward: { xp: 400, caps: 120, revealMap: true },
    nextQuest: 'whisper_choice',
  },
  whisper_choice: {
    id: 'whisper_choice', npcId: 'whisper', chain: 'whisper',
    title: 'The Shadow\'s Price',
    desc: 'Whisper offers you a choice: share in the vault\'s secrets, or use the intel to dominate your enemies.',
    type: 'choice',
    choices: [
      {
        label: '📜 VAULT INTEL',
        desc: 'Get full map intel + skill points from decoded data.',
        flag: 'whisper_intel',
        reward: { xp: 600, caps: 150, skillPoints: 3, lootLuck: 5 },
        nextQuest: null,
      },
      {
        label: '💀 SHADOW PACT',
        desc: 'Join Whisper\'s network for permanent combat advantage.',
        flag: 'whisper_pact',
        reward: { xp: 600, caps: 200, tierItem: 'mythic', statBoost: { agi: 4, lck: 4 } },
        nextQuest: null,
      },
    ],
  },
};

// Starting quests per NPC (first quest in their chain)
const NPC_STARTING_QUESTS = {
  elder_mara: 'mara_visions',
  wrench_kai: 'kai_parts',
  shade: 'shade_intel',
  old_bones: 'bones_burial',
  spark: 'spark_prototype',
  whisper: 'whisper_contact',
};

// ─── DIALOGUE TREES ───
// Each node has: text, options[{label, action, next, condition}]
// Actions: 'quest_accept', 'quest_turn_in', 'shop', 'close', 'choice'

function getDialogueForNPC(npcId, state) {
  const npc = NPCS.find(n => n.id === npcId);
  if (!npc) return null;

  const questState = state.npcQuests || {};
  const chainId = NPC_STARTING_QUESTS[npcId];
  const activeQuest = questState[npcId + '_active'];
  const completedQuests = questState[npcId + '_done'] || [];
  const flags = state.questFlags || {};

  // If there's an active quest, check if it's complete
  if (activeQuest) {
    const quest = QUEST_CHAINS[activeQuest];
    if (quest) {
      const isComplete = checkQuestComplete(quest, state);
      if (isComplete) {
        return buildTurnInDialogue(npc, quest, state);
      } else {
        return buildProgressDialogue(npc, quest, state);
      }
    }
  }

  // Find next available quest in chain
  const nextQuest = findNextQuest(npcId, state);
  if (nextQuest) {
    return buildOfferDialogue(npc, nextQuest, state);
  }

  // All quests done — general dialogue
  return buildIdleDialogue(npc, state);
}

function findNextQuest(npcId, state) {
  const questState = state.npcQuests || {};
  const completedQuests = questState[npcId + '_done'] || [];
  const startId = NPC_STARTING_QUESTS[npcId];
  if (!startId) return null;

  // Walk the chain to find next unaccepted quest
  let currentId = startId;
  while (currentId) {
    if (completedQuests.includes(currentId)) {
      const quest = QUEST_CHAINS[currentId];
      if (!quest) break;
      // If it was a choice quest, follow the chosen branch
      if (quest.type === 'choice' && quest.choices) {
        const flags = state.questFlags || {};
        let foundNext = null;
        for (const ch of quest.choices) {
          if (flags[ch.flag]) {
            foundNext = ch.nextQuest;
            break;
          }
        }
        currentId = foundNext;
      } else {
        currentId = quest.nextQuest;
      }
    } else {
      // This quest hasn't been completed — offer it
      return QUEST_CHAINS[currentId];
    }
  }
  return null;
}

function checkQuestComplete(quest, state) {
  if (quest.type === 'kill') {
    const progress = (state.questProgress || {})[quest.id] || 0;
    return progress >= quest.count;
  }
  if (quest.type === 'explore') {
    const explored = countExploredTiles(state);
    return explored >= quest.reqTilesExplored;
  }
  if (quest.type === 'choice') return false; // choices are instant
  return false;
}

function countExploredTiles(state) {
  if (!state.map) return 0;
  let count = 0;
  for (let r = 0; r < state.map.length; r++) {
    for (let c = 0; c < (state.map[r] || []).length; c++) {
      if (state.map[r][c] && state.map[r][c].revealed) count++;
    }
  }
  return count;
}

function getQuestProgressText(quest, state) {
  if (quest.type === 'kill') {
    const progress = (state.questProgress || {})[quest.id] || 0;
    const target = quest.target === 'any' ? 'enemies' : quest.target + 's';
    return `Kill ${target}: ${progress}/${quest.count}`;
  }
  if (quest.type === 'explore') {
    const explored = countExploredTiles(state);
    return `Tiles explored: ${explored}/${quest.reqTilesExplored}`;
  }
  return '';
}

function buildOfferDialogue(npc, quest, state) {
  if (quest.type === 'choice') {
    return buildChoiceDialogue(npc, quest, state);
  }

  const greetings = [
    `Ah, a wanderer. I am ${npc.name}. I have need of someone like you.`,
    `You look capable. I'm ${npc.name}. Listen closely.`,
    `Traveler! ${npc.name} here. I have a proposition.`,
    `The wasteland brings you to me. I am ${npc.name}.`,
  ];

  return {
    npc,
    nodes: [
      {
        id: 'greeting',
        text: greetings[Math.floor(Math.random() * greetings.length)],
        options: [
          { label: 'What do you need?', next: 'offer' },
          { label: 'Not interested.', action: 'close' },
        ],
      },
      {
        id: 'offer',
        text: `"${quest.title}" — ${quest.desc}`,
        options: [
          { label: '✅ Accept Quest', action: 'quest_accept', questId: quest.id },
          { label: 'Tell me more about yourself.', next: 'about' },
          { label: 'Maybe later.', action: 'close' },
        ],
      },
      {
        id: 'about',
        text: `${npc.desc} I've been out here longer than most survive. Help me, and I'll make it worth your while.`,
        options: [
          { label: '✅ Accept Quest', action: 'quest_accept', questId: quest.id },
          { label: 'Goodbye.', action: 'close' },
        ],
      },
    ],
  };
}

function buildChoiceDialogue(npc, quest, state) {
  const options = quest.choices.map((ch, i) => ({
    label: ch.label,
    desc: ch.desc,
    action: 'quest_choice',
    questId: quest.id,
    choiceIndex: i,
  }));

  return {
    npc,
    nodes: [
      {
        id: 'greeting',
        text: `${npc.name} looks at you intently. "${quest.desc}"`,
        options: [
          { label: 'What are my options?', next: 'choices' },
        ],
      },
      {
        id: 'choices',
        text: 'Choose your path carefully. This decision will shape your future in the wasteland.',
        isChoice: true,
        options,
      },
    ],
  };
}

function buildTurnInDialogue(npc, quest, state) {
  return {
    npc,
    nodes: [
      {
        id: 'greeting',
        text: `${npc.name} grins. "You've done it! '${quest.title}' is complete. Here's your reward."`,
        options: [
          { label: '🏆 Collect Reward', action: 'quest_turn_in', questId: quest.id },
        ],
      },
    ],
  };
}

function buildProgressDialogue(npc, quest, state) {
  const progress = getQuestProgressText(quest, state);
  const encouragements = [
    `Still working on it? ${progress}. Keep at it.`,
    `Not done yet? ${progress}. The wasteland waits for no one.`,
    `${progress}. You're getting there. Don't give up now.`,
    `Progress: ${progress}. I believe in you, wanderer.`,
  ];

  return {
    npc,
    nodes: [
      {
        id: 'greeting',
        text: encouragements[Math.floor(Math.random() * encouragements.length)],
        options: [
          { label: 'I\'ll keep at it.', action: 'close' },
          { label: 'Remind me of the quest.', next: 'reminder' },
        ],
      },
      {
        id: 'reminder',
        text: `"${quest.title}" — ${quest.desc}\n\n${progress}`,
        options: [
          { label: 'Got it. I\'ll be back.', action: 'close' },
        ],
      },
    ],
  };
}

function buildIdleDialogue(npc, state) {
  const flags = state.questFlags || {};
  const lines = [
    `${npc.name} nods. "You've done well, wanderer. I have nothing more to ask of you... for now."`,
    `"The wasteland remembers those who help. You are remembered, friend." — ${npc.name}`,
    `${npc.name} smiles beneath their hood. "Stay safe out there. The worst is yet to come."`,
  ];

  return {
    npc,
    nodes: [
      {
        id: 'greeting',
        text: lines[Math.floor(Math.random() * lines.length)],
        options: [
          { label: 'Farewell.', action: 'close' },
        ],
      },
    ],
  };
}

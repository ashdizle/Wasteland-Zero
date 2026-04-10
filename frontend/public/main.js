// data.js and audio.js loaded via script tags

// ═══════════════════════════════════════════════════════════════
//  GAME ENGINE
// ═══════════════════════════════════════════════════════════════
const G = {
  state: null,
  selectedArch: null,
  combat: null,
  shopItems: [],
  lootItems: [],
  _vatsZones: [],
  currentSlot: 1,

  // ─── INIT / SAVE ───
  init() {
    // Migrate legacy single wzSave → slot 1
    const legacySave = localStorage.getItem('wzSave');
    if (legacySave && !localStorage.getItem('wzSave_1')) {
      localStorage.setItem('wzSave_1', legacySave);
    }
    if (legacySave) localStorage.removeItem('wzSave');
    // Render slot cards
    this.renderStartScreen();
    // Inject title art
    const titleArt = document.getElementById('title-art');
    if (titleArt) titleArt.src = TITLE_ART;
    // Keyboard support
    document.addEventListener('keydown', e => {
      if (!this.state) return;
      const screen = document.querySelector('.screen.active');
      if (!screen) return;
      // Map movement
      if (screen.id === 'screen-map') {
        if (e.key === 'ArrowUp'    || e.key === 'w') this.move(-1, 0);
        if (e.key === 'ArrowDown'  || e.key === 's') this.move(1, 0);
        if (e.key === 'ArrowLeft'  || e.key === 'a') this.move(0, -1);
        if (e.key === 'ArrowRight' || e.key === 'd') this.move(0, 1);
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (document.querySelector('#merchant-modal.show,#npc-modal.show,#dungeon-modal.show,#chest-modal.show')) return;
          this.interactTile();
        }
      }
      // Combat shortcuts
      if (screen.id === 'screen-combat' && this.combat) {
        if (e.key === '1') this.combatAction('attack');
        if (e.key === '2') this.combatAction('power_attack');
        if (e.key === '3') this.combatAction('brace');
        if (e.key === '4') this.toggleVATS();
        if (e.key === '5') this.combatAction('flee');
      }
    });
    this._initSwipe();
  },

  // ─── SAVE SLOT MANAGEMENT ───
  renderStartScreen() {
    const container = document.getElementById('save-slots');
    if (!container) return;
    let html = '';
    for (let slot = 1; slot <= 3; slot++) {
      const raw = localStorage.getItem('wzSave_' + slot);
      if (raw) {
        let s;
        try { s = JSON.parse(raw); } catch { s = null; }
        if (s) {
          const arch = (typeof ARCHETYPES !== 'undefined') ? ARCHETYPES.find(a => a.id === s.archetype) : null;
          const race = (typeof RACES !== 'undefined') ? RACES.find(r => r.id === s.race) : null;
          const terr = (typeof TERRITORIES !== 'undefined') ? TERRITORIES.find(t => t.id === s.territory) : null;
          const archName = arch ? arch.name : (s.archetype || 'Survivor');
          const raceName = race ? race.name : (s.race || 'Unknown');
          const raceIcon = race ? (race.icon + ' ') : '';
          const terrName = terr ? terr.name : (s.territory || 'Unknown Zone');
          const bossCount = s.bossesKilled || 0;
          html += `<div class="slot-card slot-occupied">
            <div class="slot-header">
              <div class="slot-label">SLOT ${slot}</div>
              <div style="font-size:.52rem;color:var(--dim)">${bossCount} boss${bossCount !== 1 ? 'es' : ''} killed</div>
            </div>
            <div class="slot-char">${raceIcon}${raceName} · ${archName}</div>
            <div class="slot-detail">LV ${s.lv || 1} · ${terrName} · ${s.caps || 0}💰</div>
            <div class="slot-btns">
              <button class="slot-btn green" onclick="G.loadSlot(${slot})">▶ CONTINUE</button>
              <button class="slot-btn new" onclick="G.startNewGameOnSlot(${slot})">⊕ NEW</button>
              <button class="slot-btn del" onclick="G.deleteSlot(${slot})">✕</button>
            </div>
          </div>`;
        } else {
          html += `<div class="slot-card">
            <div class="slot-label">SLOT ${slot} — CORRUPT DATA</div>
            <div class="slot-btns">
              <button class="slot-btn new" onclick="G.startNewGameOnSlot(${slot})">⊕ NEW GAME</button>
              <button class="slot-btn del" onclick="G.deleteSlot(${slot})">✕ DELETE</button>
            </div>
          </div>`;
        }
      } else {
        html += `<div class="slot-card">
          <div class="slot-label">SLOT ${slot}</div>
          <div class="slot-empty-text">— EMPTY —</div>
          <button class="slot-btn new" onclick="G.startNewGameOnSlot(${slot})" style="max-width:180px;margin:0 auto">⊕ NEW GAME</button>
        </div>`;
      }
    }
    container.innerHTML = html;
  },

  loadSlot(slot) {
    this.currentSlot = slot;
    this.loadGame();
  },

  startNewGameOnSlot(slot) {
    const key = 'wzSave_' + slot;
    const doNew = () => { localStorage.removeItem(key); this.currentSlot = slot; this.newGame(); };
    if (localStorage.getItem(key)) {
      this.showEventWarning(
        '⚠ OVERWRITE SAVE?',
        `Slot ${slot} has an existing character. Starting a new game will permanently erase them — this cannot be undone.`,
        '⊕ START NEW GAME',
        doNew,
        '↩ CANCEL'
      );
      return;
    }
    this.currentSlot = slot;
    this.newGame();
  },

  deleteSlot(slot) {
    if (!confirm(`Delete Slot ${slot}? This cannot be undone.`)) return;
    localStorage.removeItem('wzSave_' + slot);
    this.renderStartScreen();
  },

  _initSwipe() {
    let touchStartX = 0, touchStartY = 0;
    document.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    document.addEventListener('touchend', e => {
      if (!this.state) return;
      const screen = document.querySelector('.screen.active');
      if (!screen || screen.id !== 'screen-map') return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      const adx = Math.abs(dx), ady = Math.abs(dy);
      if (Math.max(adx, ady) < 30) return; // too short
      if (adx > ady) {
        if (dx > 0) this.move(0, 1); else this.move(0, -1);
      } else {
        if (dy > 0) this.move(1, 0); else this.move(-1, 0);
      }
    }, { passive: true });
  },

  newGame() {
    this.show('screen-race');
    this.buildRaceSelect();
  },

  // ─── RACE SELECT ───
  buildRaceSelect() {
    const el = document.getElementById('race-list');
    el.innerHTML = RACES.map((r, i) => {
      const bonusParts = [];
      const b = r.bonus;
      if (b.allStats) bonusParts.push(`+${b.allStats} ALL STATS`);
      if (b.str > 0) bonusParts.push(`+${b.str} STR`); if (b.str < 0) bonusParts.push(`${b.str} STR`);
      if (b.agi > 0) bonusParts.push(`+${b.agi} AGI`); if (b.agi < 0) bonusParts.push(`${b.agi} AGI`);
      if (b.int > 0) bonusParts.push(`+${b.int} INT`); if (b.int < 0) bonusParts.push(`${b.int} INT`);
      if (b.end > 0) bonusParts.push(`+${b.end} END`); if (b.end < 0) bonusParts.push(`${b.end} END`);
      if (b.lck > 0) bonusParts.push(`+${b.lck} LCK`); if (b.lck < 0) bonusParts.push(`${b.lck} LCK`);
      if (b.maxHp) bonusParts.push(`+${b.maxHp} MAX HP`);
      if (b.startCaps) bonusParts.push(`+${b.startCaps} CAPS`);
      if (b.radResist) bonusParts.push(`${Math.round(b.radResist * 100)}% RAD RES`);
      if (b.immuneTox) bonusParts.push(`IMMUNE TO TOXINS`);
      return `<div class="race-card" id="race-${i}" onclick="G.selectRace(${i})">
        <div class="race-icon">${r.icon}</div>
        <div class="race-info">
          <div class="race-name">${r.name}</div>
          <div class="race-desc">${r.desc}</div>
          <div class="race-bonus">${bonusParts.join(' · ')}</div>
        </div>
      </div>`;
    }).join('');
  },

  selectRace(i) {
    document.querySelectorAll('.race-card').forEach(c => c.classList.remove('sel'));
    document.getElementById('race-' + i).classList.add('sel');
    this.selectedRace = i;
    document.getElementById('btn-race-confirm').disabled = false;
    AudioEngine.sfx.equip();
  },

  confirmRace() {
    if (this.selectedRace == null) return;
    this._pendingRace = RACES[this.selectedRace].id;
    this.show('screen-arch');
    this.buildArchSelect();
    // Restore arch selection if player came back then re-confirmed
    if (this.selectedArch != null) {
      const card = document.getElementById('arch-' + this.selectedArch);
      if (card) card.classList.add('sel');
      document.getElementById('btn-arch-confirm').disabled = false;
    }
  },

  backToRace() {
    this.show('screen-race');
    // Restore race card highlight
    if (this.selectedRace != null) {
      const card = document.getElementById('race-' + this.selectedRace);
      if (card) card.classList.add('sel');
      document.getElementById('btn-race-confirm').disabled = false;
    }
  },

  backToArch() {
    this.show('screen-arch');
    this.buildArchSelect();
    // Restore arch card highlight
    if (this.selectedArch != null) {
      const card = document.getElementById('arch-' + this.selectedArch);
      if (card) card.classList.add('sel');
      document.getElementById('btn-arch-confirm').disabled = false;
    }
    // Sync hardcore toggle button label
    const hcBtn = document.getElementById('btn-hardcore-toggle');
    if (hcBtn) hcBtn.textContent = this._pendingHardcore ? 'ON' : 'OFF';
    // Discard the half-built state from confirmArch
    this.state = null;
  },

  goStart() {
    AudioEngine.stop();
    this.show('screen-start');
    this.renderStartScreen();
    document.getElementById('hud').style.display = 'none';
  },

  loadGame() {
    try {
      const raw = localStorage.getItem('wzSave_' + this.currentSlot);
      if (!raw) throw new Error('No save in slot ' + this.currentSlot);
      const s = JSON.parse(raw);
      if (s.cleared && !Array.isArray(s.cleared)) s.cleared = Object.keys(s.cleared);
      // Field migrations
      if (!s.equip.shoes) s.equip.shoes = null;
      if (!s.equip.belt) s.equip.belt = null;
      if (!s.equip.ring1) s.equip.ring1 = null;
      if (!s.equip.ring2) s.equip.ring2 = null;
      // Migrate old single weapon slot → mainHand
      if (s.equip.weapon !== undefined) {
        if (s.equip.weapon && !s.equip.mainHand) s.equip.mainHand = s.equip.weapon;
        delete s.equip.weapon;
      }
      if (!('mainHand' in s.equip)) s.equip.mainHand = null;
      if (!('offHand'  in s.equip)) s.equip.offHand  = null;
      if (!s.essenceCount) s.essenceCount = 0;
      if (!s.artificerBonus) s.artificerBonus = 0;
      if (!s.bossAssignments) s.bossAssignments = {};
      if (!s.npcQuests) s.npcQuests = {};
      if (!s.questProgress) s.questProgress = {};
      if (!s.questFlags) s.questFlags = {};
      if (!s.npcAssignments) s.npcAssignments = {};
      if (!s.flatAtk) s.flatAtk = 0;
      // Migrate old exponential xpNext to new linear formula if it looks stale
      { const expectedXpNext = 200 + (s.lv || 1) * 50;
        if (!s.xpNext || s.xpNext < expectedXpNext * 0.5) s.xpNext = expectedXpNext; }
      if (!s.territoriesCleared) s.territoriesCleared = [];
      if (!s.race) s.race = 'human';
      if (s.raceImmuneTox === undefined) s.raceImmuneTox = false;
      if (s.raceRadResist === undefined) s.raceRadResist = 0;
      if (!s.traits) s.traits = [];
      // Item migrations: fix unique items missing skills, celestial items missing perks/stats
      this._migrateSave(s);
      this.state = s;
      this._applyAudioSettings();
      this._territoryLootMod = this.getCurrentTerritory().lootMod || 0;
      this.show('screen-map');
      document.getElementById('hud').style.display = 'block';
      this.renderMap();
      this.renderHUD();
      // Persist the migrated save immediately
      this.save();
    } catch(e) { this.newGame(); }
  },

  save() {
    if (this.state) localStorage.setItem('wzSave_' + this.currentSlot, JSON.stringify(this.state));
  },

  // ─── ITEM SAVE MIGRATION ───
  // Fix old saves: unique items missing skill/skillDesc, celestial items missing perk/stats
  _migrateSave(s) {
    const fixItem = (it) => {
      if (!it) return;
      // Fix unique items that are missing their named skill
      if (it.tier === 'unique' && !it.skill) {
        const base = this._findBossDropByName(it.name);
        if (base) {
          it.skill = base.skill;
          it.skillDesc = base.skillDesc;
        }
      }
      // Fix celestial gear missing its perk, statuses, or minimum stats
      const _celestialNonGear = ['consumable','material','essence','imbue_stone','amulet','belt','ring'];
      if (it.tier === 'celestial' && !it.celestialPerk && !_celestialNonGear.includes(it.type)) {
        it.celestialPerk = { ...CELESTIAL_PERKS[Math.floor(Math.random() * CELESTIAL_PERKS.length)] };
        if (!it.celestialStatuses) {
          const pool = ['burn', 'poison', 'stun', 'shock', 'bleed'];
          const picked = [...pool].sort(() => Math.random() - .5).slice(0, 2);
          it.celestialStatuses = picked.map(type => ({ type, chance: .35 + Math.random() * .25 }));
        }
        const isAcc = ['amulet', 'belt', 'ring'].includes(it.type);
        if (!isAcc) {
          if (!it.atk   || it.atk   < 30)  it.atk   = (it.atk   || 0) + 30;
          if (!it.def   || it.def   < 20)  it.def   = (it.def   || 0) + 20;
          if (!it.crit  || it.crit  < .20) it.crit  = Math.min(.60, (it.crit  || 0) + .20);
          if (!it.bleed || it.bleed < .25) it.bleed = Math.min(.75, (it.bleed || 0) + .25);
          if (!it.dodge || it.dodge < .18) it.dodge = Math.min(.45, (it.dodge || 0) + .18);
          if (!it.resist|| it.resist< .18) it.resist= Math.min(.40, (it.resist|| 0) + .18);
        } else {
          it.bonus = it.bonus ? { ...it.bonus } : {};
          if (!it.bonus.atk       || it.bonus.atk       < 20)  it.bonus.atk       = (it.bonus.atk       || 0) + 20;
          if (!it.bonus.def       || it.bonus.def       < 15)  it.bonus.def       = (it.bonus.def       || 0) + 15;
          if (!it.bonus.crit      || it.bonus.crit      < .20) it.bonus.crit      = Math.min(.50, (it.bonus.crit      || 0) + .20);
          if (!it.bonus.lifesteal || it.bonus.lifesteal < .12) it.bonus.lifesteal = Math.min(.30, (it.bonus.lifesteal || 0) + .12);
          if (!it.bonus.dodge     || it.bonus.dodge     < .15) it.bonus.dodge     = Math.min(.30, (it.bonus.dodge     || 0) + .15);
          if (!it.bonus.resist    || it.bonus.resist    < .18) it.bonus.resist    = Math.min(.35, (it.bonus.resist    || 0) + .18);
        }
      }
    };
    if (s.bag) s.bag.forEach(fixItem);
    if (s.equip) Object.values(s.equip).forEach(fixItem);
  },

  _findBossDropByName(name) {
    if (typeof BOSS_DROPS === 'undefined') return null;
    for (const drops of Object.values(BOSS_DROPS)) {
      for (const drop of drops) {
        if (drop.name === name) return drop;
      }
    }
    return null;
  },

  show(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  },

  // ─── TIER SYSTEM ───
  rollTier(forced) {
    if (forced) return forced;
    const artBonus = (this.state && this.state.artificerBonus) ? Math.floor(this.state.artificerBonus / 3) : 0;
    const boost = (this.getAdvClassEffect('tierBoost') || 0) + (this._territoryLootMod || 0) + artBonus;
    const r = Math.random();
    // Note: unique tier is bossOnly — never rolled here, only from boss drops
    const tierOrder = ['common','uncommon','rare','epic','legendary','mythic','celestial'];
    let tierIdx = 0;
    // Generous drop rates (unique excluded from random rolls)
    if (r < .020) tierIdx = 6;      // celestial 2%
    else if (r < .045) tierIdx = 5; // mythic 2.5%
    else if (r < .10)  tierIdx = 4; // legendary 5.5%
    else if (r < .22)  tierIdx = 3; // epic 12%
    else if (r < .42)  tierIdx = 2; // rare 20%
    else if (r < .70)  tierIdx = 1; // uncommon 28%
    // else common ~30%
    return tierOrder[Math.min(6, tierIdx + boost)];
  },

  applyTier(item, tier) {
    const t = TIERS[tier];
    const out = { ...item, tier, tierLabel: t.label, tierColor: t.color };
    // Rainbow celestial shimmer: only on actual gear, never on consumables/simple items
    const isSimpleItem = ['consumable','throwable','material','essence','imbue_stone'].includes(out.type);
    if (t.rainbow && !isSimpleItem) out.tierRainbow = true;
    // Consumables: only scale HEAL with tier (better stimpak = more heal); no gear stats
    if (out.type === 'consumable' && out.heal) {
      out.heal = Math.round(out.heal * (1 + (t.mult - 1) * 0.4));
    }
    // Gear items: scale all combat stats
    if (!isSimpleItem) {
      if (out.atk)  out.atk  = Math.round(out.atk  * t.mult) + t.statBonus;
      if (out.def)  out.def  = Math.round(out.def  * t.mult) + Math.round(t.statBonus / 2);
      if (out.heal) out.heal = Math.round(out.heal * (1 + (t.mult - 1) * 0.5));
      if (out.crit) out.crit = Math.min(.6, out.crit + (t.statBonus * .005));
      if (out.bleed) out.bleed = Math.min(.8, out.bleed + (t.statBonus * .01));
      if (out.dodge) out.dodge = Math.min(.5, out.dodge + (t.statBonus * .005));
    }
    out.val  = Math.round((out.val || 10) * t.mult);
    // ── CELESTIAL: force 5 stats, 2 status effects, assign perk ──
    if (tier === 'celestial') {
      const isAccessory  = ['amulet','belt','ring'].includes(out.type);
      const isConsumable = ['consumable','throwable','material','essence','imbue_stone'].includes(out.type);
      if (!isAccessory && !isConsumable) {
        // Force all five direct stats regardless of base
        out.atk   = (out.atk  || 0) + 30;
        out.def   = (out.def  || 0) + 20;
        out.crit  = Math.min(.60, (out.crit  || 0) + .20);
        out.bleed = Math.min(.75, (out.bleed || 0) + .25);
        out.dodge = Math.min(.45, (out.dodge || 0) + .18);
        out.resist= Math.min(.40, (out.resist|| 0) + .18);
        // Two status effects
        const statusPool = ['burn','poison','stun','shock','bleed'];
        const picked = [...statusPool].sort(() => Math.random() - .5).slice(0,2);
        out.celestialStatuses = picked.map(type => ({type, chance: .35 + Math.random() * .25}));
      } else if (!isConsumable) {
        // Accessories: boost bonus object + add extra keys
        out.bonus = out.bonus ? {...out.bonus} : {};
        out.bonus.atk       = (out.bonus.atk       || 0) + 20;
        out.bonus.def       = (out.bonus.def       || 0) + 15;
        out.bonus.crit      = Math.min(.50, (out.bonus.crit      || 0) + .20);
        out.bonus.lifesteal = Math.min(.30, (out.bonus.lifesteal || 0) + .12);
        out.bonus.dodge     = Math.min(.30, (out.bonus.dodge     || 0) + .15);
        out.bonus.resist    = Math.min(.35, (out.bonus.resist    || 0) + .18);
      }
      // Assign random celestial perk — gear only
      if (!isConsumable && !isAccessory) {
        out.celestialPerk = { ...CELESTIAL_PERKS[Math.floor(Math.random() * CELESTIAL_PERKS.length)] };
      }
    }
    return out;
  },

  itemStatLine(it) {
    const parts = [];
    const isConsumable = it.type === 'consumable';
    const isMaterial   = it.type === 'material';
    const isEssence    = it.type === 'essence';

    // ── Slot type label ──
    if (it.slotDesc) parts.push(`[${it.slotDesc}]`);
    else if (it.type === 'armor' && it.slot) {
      const slotNames = {chest:'Chest Armor',head:'Head Armor',arms:'Arm Armor',legs:'Leg Armor',shoes:'Shoes'};
      parts.push(`[${slotNames[it.slot] || it.slot}]`);
    }
    else if (it.type === 'belt') parts.push('[Utility Belt]');
    else if (it.type === 'ring') parts.push('[Ring]');

    if (isConsumable) {
      // Consumables only show what they actually do when used
      if (it.heal)    parts.push(`HEAL ${it.heal}`);
      if (it.ap)      parts.push(`+${it.ap} AP`);
      if (it.radCure) parts.push(`-${it.radCure} RAD`);
      if (it.cure)    parts.push('CURES STATUS EFFECTS');
    } else if (isMaterial) {
      parts.push('MATERIAL');
    } else if (isEssence) {
      // no stat line for essences
    } else if (it.type === 'throwable') {
      // Show what the throwable does — no gear stats
      parts.push(it.desc || 'Throwable');
    } else if (it.type === 'imbue_stone') {
      const bonus = it.imbueBonus ? it.imbueBonus.label : '';
      parts.push(`⚗ IMBUE STONE${bonus ? ': ' + bonus : ''}`);
    } else {
      // Gear: show all combat stats
      if (it.atk)    parts.push(`ATK ${it.atk}`);
      if (it.crit)   parts.push(`CRIT ${Math.round(it.crit * 100)}%`);
      if (it.bleed)  parts.push(`BLEED ${Math.round(it.bleed * 100)}%`);
      if (it.def)    parts.push(`DEF ${it.def}`);
      if (it.dodge)  parts.push(`DODGE ${Math.round(it.dodge * 100)}%`);
      if (it.resist) parts.push(`RES ${Math.round(it.resist * 100)}%`);
      if (it.heal)   parts.push(`HEAL ${it.heal}`);
      if (it.ap)     parts.push(`+${it.ap} AP`);
      if (it.radCure) parts.push(`-${it.radCure} RAD`);
      if (it.bonus) {
        if (it.bonus.atk)       parts.push(`ATK +${it.bonus.atk}`);
        if (it.bonus.def)       parts.push(`DEF +${it.bonus.def}`);
        if (it.bonus.crit)      parts.push(`CRIT ${Math.round(it.bonus.crit*100)}%`);
        if (it.bonus.lifesteal) parts.push(`LIFESTEAL ${Math.round(it.bonus.lifesteal*100)}%`);
        if (it.bonus.dodge)     parts.push(`DODGE ${Math.round(it.bonus.dodge*100)}%`);
        if (it.bonus.resist)    parts.push(`RES ${Math.round(it.bonus.resist*100)}%`);
        if (it.bonus.ap)        parts.push(`+${it.bonus.ap} AP`);
        if (it.bonus.heal)      parts.push(`+${it.bonus.heal} HEAL`);
        if (it.bonus.loot)      parts.push(`+${it.bonus.loot} LOOT/FIGHT`);
        if (it.bonus.sell)      parts.push(`SELL +${Math.round(it.bonus.sell*100)}%`);
        if (it.bonus.xp)        parts.push(`+${Math.round(it.bonus.xp*100)}% XP`);
      }
      if (it.imbued) parts.push(`✧ IMBUED: ${it.imbued.label}`);
      if (it.status) parts.push(it.status.type.toUpperCase() + ` ${Math.round(it.status.chance * 100)}%`);
      if (it.celestialStatuses) it.celestialStatuses.forEach(st => parts.push(`${st.type.toUpperCase()} ${Math.round(st.chance*100)}%`));
      if (it.skill) parts.push(`✦ ${it.skillDesc || it.skill}`);
      if (it.celestialPerk) parts.push(`★ ${it.celestialPerk.name}`);
    }
    return parts.join(' · ') || it.desc || it.type;
  },

  // Aggregate a specific celestial perk effect value across all equipped items
  getCelestialEffect(key) {
    const s = this.state;
    if (!s || !s.equip) return 0;
    let val = 0;
    for (const sl of Object.values(s.equip)) {
      if (sl && sl.celestialPerk && sl.celestialPerk.effect && sl.celestialPerk.effect[key] != null) {
        val += sl.celestialPerk.effect[key];
      }
    }
    return val;
  },

  hasCelestialEffect(key) {
    const s = this.state;
    if (!s || !s.equip) return false;
    for (const sl of Object.values(s.equip)) {
      if (sl && sl.celestialPerk && sl.celestialPerk.effect && sl.celestialPerk.effect[key]) return true;
    }
    return false;
  },

  // ─── ADVANCED CLASS HELPERS ───
  getAdvancedClasses() {
    const s = this.state;
    if (!s) return [];
    return ADVANCED_CLASSES[s.archetype] || [];
  },

  // Find a path object (pathA/pathB/ascended) by its id
  _findClassPath(id) {
    for (const arch of Object.values(ADVANCED_CLASSES)) {
      for (const milestone of arch) {
        for (const path of [milestone.pathA, milestone.pathB, milestone.ascended]) {
          if (path && path.id === id) return path;
        }
      }
    }
    return null;
  },

  getAdvClassEffect(key) {
    const s = this.state;
    if (!s || !s.advancedClasses) return 0;
    let total = 0;
    let hasBoolean = false;
    for (const clsId of s.advancedClasses) {
      const path = this._findClassPath(clsId);
      if (path && path.effect && path.effect[key] != null) {
        if (typeof path.effect[key] === 'boolean') {
          if (path.effect[key]) { hasBoolean = true; total = 1; }
        } else {
          total += path.effect[key];
        }
      }
    }
    return hasBoolean ? (total > 0) : total;
  },

  hasAdvClass(id) {
    const s = this.state;
    return s && s.advancedClasses && s.advancedClasses.includes(id);
  },

  hasTrait(id) {
    const s = this.state;
    return !!(s && s.traits && s.traits.includes(id));
  },

  // ─── TRAIT SELECTION SCREEN ───
  buildTraitSelect() {
    this._selectedTraits = [];
    const el = document.getElementById('trait-list');
    el.innerHTML = TRAITS.map(t => `
      <div class="trait-card" id="trait-${t.id}" onclick="G.selectTrait('${t.id}')">
        <div class="trait-icon">${t.icon}</div>
        <div class="trait-info">
          <div class="trait-name">${t.name}</div>
          <div class="trait-desc">${t.desc}</div>
          ${t.diceTag ? `<span class="trait-dice-tag">🎲 ${t.diceTag}</span>` : ''}
        </div>
      </div>`).join('');
    document.getElementById('btn-traits-confirm').disabled = true;
  },

  selectTrait(id) {
    if (!this._selectedTraits) this._selectedTraits = [];
    const idx = this._selectedTraits.indexOf(id);
    if (idx !== -1) {
      // Deselect the clicked card
      this._selectedTraits.splice(idx, 1);
      document.getElementById('trait-' + id).classList.remove('sel');
    } else {
      // If already at 2, auto-swap: remove the oldest pick first
      if (this._selectedTraits.length >= 2) {
        const removed = this._selectedTraits.shift();
        document.getElementById('trait-' + removed).classList.remove('sel');
      }
      this._selectedTraits.push(id);
      document.getElementById('trait-' + id).classList.add('sel');
    }
    // Dim unselected cards when the limit is reached (still clickable for swapping)
    const atMax = this._selectedTraits.length >= 2;
    document.querySelectorAll('.trait-card').forEach(c => {
      const cardId = c.id.replace('trait-', '');
      if (atMax && !this._selectedTraits.includes(cardId)) {
        c.classList.add('sel-max');
      } else {
        c.classList.remove('sel-max');
      }
    });
    document.getElementById('btn-traits-confirm').disabled = this._selectedTraits.length !== 2;
    AudioEngine.sfx.equip();
  },

  confirmTraits() {
    if (!this._selectedTraits || this._selectedTraits.length !== 2) return;
    this.state.traits = [...this._selectedTraits];
    this._selectedTraits = [];
    // Apply passive trait bonuses to state
    const s = this.state;
    if (this.hasTrait('thick_skin')) s._traitDmgReduce = 0.10;
    // Field medic bonus handled at use-time via hasTrait()
    AudioEngine.sfx.equip();
    this.save();
    this._pendingRace = null;
    this._territoryLootMod = 0;
    document.getElementById('hud').style.display = 'block';
    this.show('screen-map');
    this.renderMap();
    this.renderHUD();
  },

  checkAdvancedClassUnlock(level) {
    const s = this.state;
    const milestones = [10, 20, 30, 40, 50];
    if (!milestones.includes(level)) return;
    const archData = ADVANCED_CLASSES[s.archetype];
    if (!archData) return;
    const milestone = archData.find(m => m.level === level);
    if (!milestone) return;
    if (!s.advancedClasses) s.advancedClasses = [];
    const pathAChosen = milestone.pathA && s.advancedClasses.includes(milestone.pathA.id);
    const pathBChosen = milestone.pathB && s.advancedClasses.includes(milestone.pathB.id);
    if (pathAChosen || pathBChosen) return; // already made a choice at this milestone
    this.showClassUpgrade(milestone);
  },

  showClassUpgrade(milestone) {
    const overlay = document.getElementById('class-upgrade-overlay');
    const lvEl = document.getElementById('cu-level');
    if (lvEl) lvEl.textContent = 'CLASS EVOLUTION — LEVEL ' + milestone.level;
    const chooseEl = document.getElementById('cu-choose-text');
    if (chooseEl) chooseEl.textContent = 'CHOOSE YOUR PATH:';
    const choicesEl = document.getElementById('cu-choices');
    const choices = [milestone.pathA, milestone.pathB].filter(Boolean);
    if (choicesEl) {
      choicesEl.innerHTML = choices.map(path => `
        <div class="cu-choice-card" onclick="G.chooseClassPath('${path.id}')">
          <div class="cu-choice-icon">${path.icon}</div>
          <div class="cu-choice-name">${path.name}</div>
          <div class="cu-choice-desc">${path.desc}</div>
        </div>
      `).join('');
    }
    overlay.classList.add('show');
    AudioEngine.sfx.classup();
  },

  _showAscendedUpgrade(milestone) {
    const asc = milestone.ascended;
    if (!asc) return;
    const lvEl = document.getElementById('cu-level');
    if (lvEl) lvEl.textContent = 'ASCENDED TIER UNLOCKED';
    const chooseEl = document.getElementById('cu-choose-text');
    if (chooseEl) chooseEl.textContent = 'TRANSCENDENCE AWAITS:';
    const choicesEl = document.getElementById('cu-choices');
    if (choicesEl) {
      choicesEl.innerHTML = `<div class="cu-choice-card" style="border-color:#cc88ff;box-shadow:3px 3px 0 #cc88ff"
        onclick="G.chooseClassPath('${asc.id}')">
        <div class="cu-choice-icon">${asc.icon}</div>
        <div class="cu-choice-name" style="color:#cc88ff">${asc.name}</div>
        <div class="cu-choice-desc">${asc.desc}</div>
      </div>`;
    }
    document.getElementById('class-upgrade-overlay').classList.add('show');
    AudioEngine.sfx.classup();
  },

  chooseClassPath(pathId) {
    const s = this.state;
    if (!s.advancedClasses) s.advancedClasses = [];
    if (s.advancedClasses.includes(pathId)) return;
    const path = this._findClassPath(pathId);
    if (!path) return;
    this._applyClassPath(path);
    document.getElementById('class-upgrade-overlay').classList.remove('show');
    // Check if level-50 ascended should now trigger
    const archData = ADVANCED_CLASSES[s.archetype];
    if (archData) {
      const m50 = archData.find(m => m.level === 50 && m.ascended);
      if (m50 && !s.advancedClasses.includes(m50.ascended.id)) {
        const pathAChosen = m50.pathA && s.advancedClasses.includes(m50.pathA.id);
        const pathBChosen = m50.pathB && s.advancedClasses.includes(m50.pathB.id);
        if (pathAChosen || pathBChosen) {
          setTimeout(() => this._showAscendedUpgrade(m50), 1500);
        }
      }
    }
    this.toast('⭐ ' + path.name.toUpperCase() + ' UNLOCKED!');
    this.renderHUD();
    this.save();
    // If a dungeon wave was deferred while this overlay was showing, resume it now
    if (this._pendingDungeonWave) {
      this._pendingDungeonWave = false;
      setTimeout(() => this._runNextDungeonWave(), 2500);
    }
  },

  _applyClassPath(path) {
    const s = this.state;
    if (!s.advancedClasses) s.advancedClasses = [];
    if (s.advancedClasses.includes(path.id)) return;
    s.advancedClasses.push(path.id);
    const e = path.effect || {};
    if (e.maxHp)    { s.maxHp += e.maxHp; s.hp = Math.min(s.maxHp, s.hp + e.maxHp); }
    if (e.str)      s.str += e.str;
    if (e.agi)      s.agi += e.agi;
    if (e.int)      s.int += e.int;
    if (e.end)      s.end += e.end;
    if (e.lck)      s.lck += e.lck;
    if (e.flatAtk)  s.flatAtk = (s.flatAtk || 0) + e.flatAtk;
    if (e.allStats) { s.str+=e.allStats; s.agi+=e.allStats; s.int+=e.allStats; s.end+=e.allStats; s.lck+=e.allStats; }
  },

  // Legacy wrapper kept so any old save that uses closeClassUpgrade() still works
  closeClassUpgrade() {
    document.getElementById('class-upgrade-overlay').classList.remove('show');
  },

  // ─── ARCHETYPE SELECT ───
  buildArchSelect() {
    const el = document.getElementById('arch-list');
    el.innerHTML = ARCHETYPES.map((a, i) => `
      <div class="arch-card" id="arch-${i}" onclick="G.selectArch(${i})">
        <div class="arch-card-inner">
          <div class="arch-portrait-wrap">
            <img class="arch-portrait" src="${ARCHETYPE_ART[a.id] || ''}" alt="${a.name}">
          </div>
          <div class="arch-info">
            <div class="arch-name">${a.icon} ${a.name}</div>
            <div class="arch-desc">${a.desc}</div>
            <div class="arch-stats">STR:${a.stats.str} AGI:${a.stats.agi} INT:${a.stats.int} END:${a.stats.end} LCK:${a.stats.lck}</div>
            <div class="arch-weapon">⚔ ${a.weapon.name} (ATK:${a.weapon.atk})${a.armor ? ' 🛡 ' + a.armor.name : ''}${a.bonus ? ' 🧪 ' + a.bonus.name : ''}</div>
            ${a.passive ? `<div class="arch-passive">✦ PASSIVE ABILITY</div>` : ''}
          </div>
        </div>
        <div class="arch-class-preview">
          ${(ADVANCED_CLASSES[a.id]||[]).map(m => `<span class="arch-class-badge">Lv${m.level}: ${m.pathA ? m.pathA.name : '?'} / ${m.pathB ? m.pathB.name : '?'}</span>`).join('')}
        </div>
      </div>`).join('');
  },

  selectArch(i) {
    document.querySelectorAll('.arch-card').forEach(c => c.classList.remove('sel'));
    document.getElementById('arch-' + i).classList.add('sel');
    this.selectedArch = i;
    document.getElementById('btn-arch-confirm').disabled = false;
    AudioEngine.sfx.equip();
  },

  confirmArch() {
    const a = ARCHETYPES[this.selectedArch];
    const s = a.stats;
    const raceId = this._pendingRace || 'human';
    const raceData = RACES.find(r => r.id === raceId) || RACES[0];
    const rb = raceData.bonus;
    // Apply race stat deltas to base archetype stats
    const str = s.str + (rb.str || 0) + (rb.allStats || 0);
    const agi = s.agi + (rb.agi || 0) + (rb.allStats || 0);
    const int_ = s.int + (rb.int || 0) + (rb.allStats || 0);
    const end = s.end + (rb.end || 0) + (rb.allStats || 0);
    const lck = s.lck + (rb.lck || 0) + (rb.allStats || 0);
    const maxHp = (100 + end * 5) + (rb.maxHp || 0);
    this.state = {
      lv: 1, xp: 0, xpNext: 250,
      maxHp, hp: maxHp, maxAp: 4, ap: 4,
      str, agi, int: int_, end, lck,
      caps: 30 + (rb.startCaps || 0),
      equip: { mainHand: null, offHand: null, chest: null, head: null, arms: null, legs: null, shoes: null, amulet: null, belt: null, ring1: null, ring2: null },
      bag: [],
      buyback: [],
      skills: [],
      traits: [],
      skillPoints: 0,
      flatAtk: 0,
      rad: 0, maxRad: 100,
      bounties: [],
      statuses: [],
      archetype: a.id,
      race: raceId,
      raceImmuneTox: rb.immuneTox || false,
      raceRadResist: rb.radResist || 0,
      advancedClasses: [],
      map: this.genMap(),
      playerPos: { r: 6, c: 0 },
      cleared: [],
      bossesKilled: 0,
      totalKills: 0,
      essenceCount: 0,
      artificerBonus: 0,
      bossAssignments: {},
      npcQuests: {},
      questProgress: {},
      questFlags: {},
      npcAssignments: {},
      territoriesCleared: [],
    };
    // ─── Reset all transient dungeon / level-up state from any prior run ───
    this._currentDungeon        = null;
    this._dungeonWave           = 0;
    this._dungeonCombatHook     = false;
    this._pendingDungeonWave    = false;
    this._pendingLevelUpQueue   = [];
    this._dungeonBonusLootCallback = null;
    const st = this.state;
    st.equip.mainHand = { ...a.weapon };
    if (a.armor) st.equip[a.armor.slot] = { ...a.armor };
    if (a.bonus) st.bag.push({ ...a.bonus });
    // ─── Hardcore mode carry-over ───
    if (this._pendingHardcore) {
      st.hardcore = true;
      this._pendingHardcore = false;
    }
    // ─── Prestige carryover ───
    if (this._prestigeCarryover) {
      const { bonus, level, fromState } = this._prestigeCarryover;
      st.prestigeLevel = level;
      if (bonus === 'caps') {
        st.caps += 1500;
      } else if (bonus === 'stats') {
        st.lv = 5;
        st.xp = 0;
        st.xpNext = 200 + 5 * 50; // linear formula: 450 XP for LV 5→6
        st.str += 4; st.agi += 4; st.int += 4; st.end += 4; st.lck += 4;
        const hpBonus = st.end * 5;
        st.maxHp += hpBonus; st.hp = st.maxHp;
      } else if (bonus === 'skills' && fromState.skills && fromState.skills.length) {
        const topSkills = fromState.skills.slice(-2);
        topSkills.forEach(sk => { if (!st.skills.includes(sk)) st.skills.push(sk); });
        this.toast(`📚 Prestige: carried over skills!`);
      } else if (bonus === 'weapon' && fromState.equip) {
        const allWpns = Object.values(fromState.equip).filter(i => i && i.type === 'weapon');
        if (allWpns.length) {
          const best = allWpns.reduce((a, b) => ((a.atk || 0) >= (b.atk || 0) ? a : b));
          st.equip.mainHand = { ...best };
        }
      }
      this._prestigeCarryover = null;
      this.toast(`🔱 Prestige ${level} active! ${bonus === 'caps' ? '+1500 caps' : bonus === 'stats' ? 'Head Start LV 5' : bonus === 'skills' ? 'Skills carried' : 'Weapon carried'}!`, 2800);
    }
    // ─── Show trait selection before deploying ───
    this.show('screen-traits');
    this.buildTraitSelect();
  },

  // ─── TERRITORY SYSTEM ───
  getCurrentTerritory() {
    const s = this.state;
    const id = (s && s.currentTerritory) || 'badlands';
    return TERRITORIES.find(t => t.id === id) || TERRITORIES[0];
  },

  openTerritoryMap() {
    const s = this.state;
    const current = this.getCurrentTerritory();
    const cleared = s.territoriesCleared || [];
    const el = document.getElementById('territory-list');
    const sub = document.getElementById('terr-sub');
    sub.textContent = `Current: ${current.icon} ${current.name}`;

    el.innerHTML = TERRITORIES.map((t, i) => {
      const isCurrent = t.id === current.id;
      const isUnlocked = i === 0 || cleared.includes(TERRITORIES[i-1].id);
      const isCleared = cleared.includes(t.id);
      return `<div class="territory-card${isCurrent ? ' current-terr' : ''}${!isUnlocked ? ' locked-terr' : ''}"
        onclick="G.selectTerritory('${t.id}', ${isUnlocked})">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:1.8rem">${t.icon}</span>
          <div>
            <div style="font-family:var(--font-title);font-size:1.05rem;color:${t.color}">${t.name}</div>
            <div style="font-size:.6rem;color:var(--blue);margin-top:2px">${t.desc}</div>
          </div>
        </div>
        <div class="territory-badges" style="margin-top:6px">
          ${isCurrent ? `<span class="terr-badge" style="border-color:var(--amber);color:var(--amber)">📍 CURRENT</span>` : ''}
          ${isCleared ? `<span class="terr-badge" style="border-color:var(--green);color:var(--green)">✅ CLEARED</span>` : ''}
          ${!isUnlocked ? `<span class="terr-badge" style="border-color:var(--red);color:var(--red)">🔒 LOCKED</span>` : ''}
          <span class="terr-badge" style="border-color:var(--red);color:var(--red)">⚔ DANGER +${t.dangerMod}</span>
          <span class="terr-badge" style="border-color:var(--amber);color:var(--amber)">📦 LOOT +${t.lootMod}</span>
          <span class="terr-badge" style="border-color:var(--blue);color:var(--blue)">💀 ${t.bossCount} BOSSES</span>
        </div>
      </div>`;
    }).join('');

    this.show('screen-territory');
  },

  selectTerritory(id, isUnlocked) {
    if (!isUnlocked) { this.toast('Clear the previous territory first!'); return; }
    const s = this.state;
    const terr = TERRITORIES.find(t => t.id === id);
    if (!terr) return;
    const isCurrent = (s.currentTerritory || 'badlands') === id;
    if (isCurrent) { this.show('screen-map'); this.renderMap(); this.renderHUD(); return; }
    // Travel to new territory — reset the map
    s.currentTerritory = id;
    s.map = this.genMap();
    s.playerPos = { r: 6, c: 0 };
    s.cleared = [];
    s.bossesKilled = 0;
    this._secondWindUsed = false; // reset Second Wind on new territory
    this._territoryLootMod = terr.lootMod;
    this.save();
    this.toast(`✈ Traveling to ${terr.name}!`);
    this.show('screen-map');
    this.renderMap();
    this.renderHUD();
    this._updateTerritoryBar();
  },

  _updateTerritoryBar() {
    const t = this.getCurrentTerritory();
    const el = document.getElementById('territory-bar-name');
    const idx = TERRITORIES.findIndex(x => x.id === t.id);
    if (el) el.textContent = `${t.icon} ${t.name}  ·  Zone ${idx + 1}/${TERRITORIES.length}`;
    this._territoryLootMod = t.lootMod || 0;
  },

  // ─── MAP GEN ───
  genMap() {
    const terr = this.getCurrentTerritory();
    const dangerMod = terr ? terr.dangerMod : 0;
    const terrId = terr ? terr.id : 'badlands';
    const grid = [];
    for (let r = 0; r < 7; r++) {
      grid[r] = [];
      for (let c = 0; c < 7; c++) {
        const d = Math.min(3, Math.floor(Math.hypot(r - 6, c - 0) / 2.5) + 1 + dangerMod);
        const roll = Math.random();
        let type;
        if (r === 6 && c === 0) { type = 'start'; }
        else if (r === 0 && c === 6) { type = 'boss'; }
        else if (roll < .03) { type = 'chest'; }
        else if (roll < .06) { type = 'dungeon'; }
        else if (roll < .09) { type = 'merchant'; }
        else if (roll < .12) { type = 'npc'; }
        else if (roll < .15) { type = 'camp'; }
        else if (roll < .17) { type = 'ruins'; }
        else if (roll < .19) { type = 'shrine'; }
        else if (roll < .22) { type = 'supply'; }
        else if (roll < .27) { type = 'town'; }
        else if (roll < .30) { type = 'city'; }
        else if (roll < .32) { type = 'hideout'; }
        else if (roll < .34) { type = 'ambush'; }
        else if (roll < .36) { type = 'rift'; }
        else { type = 'enemy' + Math.min(d, 3); }
        grid[r][c] = { type, revealed: false, visited: false };
      }
    }
    const bossCount = terr ? terr.bossCount : 2;
    grid[0][3] = { type: 'boss',   revealed: false, visited: false };
    grid[6][6] = { type: 'boss',   revealed: false, visited: false };
    if (bossCount >= 3) grid[3][6] = { type: 'boss', revealed: false, visited: false };
    // Guaranteed POIs
    grid[2][4] = { type: 'chest',  revealed: false, visited: false };
    grid[5][1] = { type: 'supply', revealed: false, visited: false };
    grid[2][2] = { type: 'town',   revealed: false, visited: false };
    grid[4][3] = { type: 'dungeon',revealed: false, visited: false };
    grid[5][5] = { type: 'city',   revealed: false, visited: false };
    // Guaranteed NPC encounters (2 per map)
    grid[1][2] = { type: 'npc',    revealed: false, visited: false };
    grid[4][5] = { type: 'npc',    revealed: false, visited: false };
    // Guaranteed camp & ruins
    grid[5][2] = { type: 'camp',    revealed: false, visited: false };
    grid[2][5] = { type: 'ruins',   revealed: false, visited: false };
    grid[3][1] = { type: 'shrine',  revealed: false, visited: false };
    // Guaranteed new node types
    grid[1][4] = { type: 'hideout', revealed: false, visited: false };
    grid[3][5] = { type: 'ambush',  revealed: false, visited: false };
    grid[1][1] = { type: 'rift',    revealed: false, visited: false };
    grid[6][0].revealed = true;
    return grid;
  },

  // ─── MAP RENDER ───
  renderMap() {
    const { map, playerPos, cleared } = this.state;
    this.revealAround(playerPos.r, playerPos.c);
    // Fit grid to real container dimensions.
    // iOS Safari needs multiple frames before getBoundingClientRect is reliable.
    this._resizeMapGrid();
    requestAnimationFrame(() => {
      this._resizeMapGrid();
      requestAnimationFrame(() => this._resizeMapGrid());
    });
    setTimeout(() => this._resizeMapGrid(), 300);
    if (!this._mapResizeObserver) {
      const wrap = document.querySelector('.map-grid-wrap');
      if (wrap && window.ResizeObserver) {
        this._mapResizeObserver = new ResizeObserver(() => this._resizeMapGrid());
        this._mapResizeObserver.observe(wrap);
      }
    }
    const grid = document.getElementById('map-grid');
    grid.innerHTML = '';
    const tid = this.state.territory || 'badlands';
    const terrainSrc = TERRAIN_BG[tid] || '/art/terrain_desert.png';
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const t = map[r][c];
        const div = document.createElement('div');
        div.className = 'tile';
        const key = r + ',' + c;
        const isPlayer = playerPos.r === r && playerPos.c === c;
        if (!t.revealed) {
          div.classList.add('fog');
        } else {
          div.style.backgroundImage = `url('${terrainSrc}')`;
          div.style.backgroundSize = 'cover';
          let em = '';
          if (t.type === 'start') em = TILE_EMOJI.start;
          else if (t.type.startsWith('enemy')) {
            const d = t.type.slice(-1);
            em = d === '1' ? TILE_EMOJI.enemy1 : d === '2' ? TILE_EMOJI.enemy2 : TILE_EMOJI.enemy3;
          } else {
            em = TILE_EMOJI[t.type] || '?';
          }
          const icon = document.createElement('span');
          icon.className = 'tile-icon';
          icon.textContent = em;
          div.appendChild(icon);
          if (t.type === 'boss') div.classList.add('boss');
          if (t.type === 'npc') div.classList.add('npc-tile');
          if (t.type === 'camp') div.classList.add('camp-tile');
          if (t.type === 'ruins') div.classList.add('ruins-tile');
          if (t.type === 'shrine') div.classList.add('shrine-tile');
          if (cleared.includes(key)) div.classList.add('cleared');
          div.onclick = () => this.tapTile(r, c);
        }
        if (isPlayer) {
          div.classList.add('player');
          div.innerHTML = '';
          const portraitSrc = (this.state && ARCHETYPE_ART[this.state.archetype]) || '';
          if (portraitSrc) {
            const img = document.createElement('img');
            img.className = 'player-portrait-tile';
            img.src = portraitSrc;
            img.onerror = () => { img.remove(); div.textContent = '⬤'; };
            div.appendChild(img);
          } else {
            div.textContent = '⬤';
          }
        }
        grid.appendChild(div);
      }
    }
    this._updateTerritoryBar();
  },

  revealAround(r, c) {
    const { map } = this.state;
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < 7 && nc >= 0 && nc < 7) map[nr][nc].revealed = true;
    }
  },

  tapTile(r, c) {
    const { playerPos, map } = this.state;
    const t = map[r][c];
    if (!t.revealed) return;
    const dr = r - playerPos.r, dc = c - playerPos.c;
    if (Math.abs(dr) <= 1 && Math.abs(dc) <= 1 && (dr !== 0 || dc !== 0)) {
      this.enterTile(r, c);
    }
  },

  // ─── LOOK / INTERACT — center d-pad button ───
  interactTile() {
    const { playerPos, map } = this.state;
    const t = map[playerPos.r][playerPos.c];
    // Re-open revisitable locations
    if (t.type === 'merchant')             { this.openMerchant(); return; }
    if (t.type === 'town' || t.type === 'city') { this.openTown(t.type === 'city'); return; }
    if (t.type === 'npc')                  { this.openNPCEncounter(playerPos.r, playerPos.c); return; }
    if (t.type === 'camp')                 { this.openCampEvent(); return; }
    if (t.type === 'hideout')              { this.openHideout(); return; }
    // Tile inspection for everything else
    const TILE_DESC = {
      start:   '⛺ Starting camp — safe ground. Your origin.',
      boss:    '💀 BOSS TERRITORY — a powerful boss guards this tile. Defeat it to advance!',
      supply:  '📦 Supply cache' + (t.visited ? ' — already looted' : ' — enter to find gear, consumables, and materials'),
      chest:   '🗝 Locked chest'  + (t.visited ? ' — already opened' : ' — contains tiered gear + caps'),
      dungeon: '🏚 Dungeon'       + (t.visited ? ' — cleared'        : ' — multi-wave combat with guaranteed rare loot bonus'),
      shrine:  '⛩ Shrine'        + (t.visited ? ' — already activated' : ' — Roll INT to commune: BLESS (+2 stat) or DRAIN (-HP, +XP)'),
      ruins:   '🏛 Ancient Ruins' + (t.visited ? ' — already explored' : ' — Roll AGI to search: rare loot or trigger a trap'),
      camp:    '🔥 Wasteland Camp — press LOOK or enter to rest here (+30% HP, full AP)',
      enemy1:  '· Low-danger zone — Danger 1 enemies (weak). Good for early XP.',
      enemy2:  '⚠ Mid-danger zone — Danger 2 enemies (moderate). Better loot.',
      enemy3:  '☢ High-danger zone — Danger 3 enemies (powerful). High risk, high reward.',
      hideout: '🏠 Hideout' + (t.visited ? ' — well-rested here before' : ' — a fortified shelter. Rest to recover HP and loot a supply cache.'),
      ambush:  '⚠ Ambush Zone' + (t.visited ? ' — cleared' : ' — hostiles lying in wait. High risk, high reward.'),
      rift:    '🌀 Rift' + (t.visited ? ' — already tapped' : ' — a tear in reality. Sacrifice HP for a chance at extraordinary gear.'),
    };
    const desc = TILE_DESC[t.type] || ('📍 ' + t.type.toUpperCase());
    this.toast(desc, 2600);
  },

  // Dynamically size the map grid to fit the actual wrap height (avoids dvh issues in iframes)
  _resizeMapGrid() {
    const wrap = document.querySelector('.map-grid-wrap');
    const grid = document.getElementById('map-grid');
    if (!wrap || !grid) return;
    const rect = wrap.getBoundingClientRect();
    const wrapW = rect.width;
    const vvH = (window.visualViewport?.height || window.innerHeight);
    const wrapH = rect.height > 30 ? rect.height : Math.max(vvH - 430, 60);
    if (wrapW < 30) return;
    const isWide = wrapW >= 400;
    const maxW = Math.floor(Math.min(wrapW - 12, isWide ? 600 : 400));
    const maxH = Math.floor(wrapH - 12);
    const ratio = 7 / 5;
    let finalW = maxW;
    let finalH = Math.floor(finalW / ratio);
    if (finalH > maxH) {
      finalH = maxH;
      finalW = Math.floor(finalH * ratio);
    }
    if (finalW > 60 && finalH > 40) {
      grid.style.width     = finalW + 'px';
      grid.style.height    = finalH + 'px';
      grid.style.maxWidth  = finalW + 'px';
      grid.style.maxHeight = finalH + 'px';
    } else {
      grid.style.width     = '';
      grid.style.height    = '';
      grid.style.maxWidth  = '';
      grid.style.maxHeight = '';
    }
  },

  move(dr, dc) {
    const { playerPos } = this.state;
    const nr = playerPos.r + dr, nc = playerPos.c + dc;
    if (nr < 0 || nr >= 7 || nc < 0 || nc >= 7) return;
    AudioEngine.sfx.move();
    this.enterTile(nr, nc);
  },

  // Returns true if the player is in a safe context (town, inventory, etc.)
  _inSafeContext() {
    const screen = document.querySelector('.screen.active');
    if (!screen) return false;
    // These screens are always safe — no mob spawns
    const safeScreens = ['screen-town','screen-loot','screen-gameover','screen-win','screen-combat'];
    if (safeScreens.includes(screen.id)) return true;
    // If on map screen but NOT on the map tab — inv/skills/craft tabs are safe
    if (screen.id === 'screen-map') {
      const mapTab = document.getElementById('tab-map');
      if (mapTab && !mapTab.classList.contains('active')) return true;
    }
    return false;
  },

  enterTile(r, c) {
    const st = this.state;
    const t = st.map[r][c];
    st.playerPos = { r, c };
    const key = r + ',' + c;
    const firstVisit = !t.visited;
    t.visited = true;
    this.revealAround(r, c);

    // RAD exposure
    if (t.type.startsWith('enemy') || t.type === 'boss') {
      const radMult = this.hasSkill('rad_resist') ? 0.5 : 1;
      const radGain = Math.round(8 * radMult);
      st.rad = Math.min(st.maxRad, st.rad + radGain);
      if (st.rad >= st.maxRad) {
        st.hp = Math.max(1, st.hp - 15);
        this.toast('☢ RADIATION DAMAGE!');
        AudioEngine.sfx.rad();
      }
    }
    if (t.type === 'town' || t.type === 'city') st.rad = Math.max(0, st.rad - 30);
    if (t.type === 'camp' || t.type === 'shrine') st.rad = Math.max(0, st.rad - 15);
    if (t.type === 'npc') st.rad = Math.max(0, st.rad - 10);

    this.processStatusTick();
    this.save();
    this.renderMap();
    this.renderHUD();

    // Never trigger combat/events if player is in a safe screen or inventory tab
    if (this._inSafeContext()) return;

    if (t.type === 'boss') {
      const boss = this.pickBoss();
      this.showBossAlarm(boss.name, () => {
        this.strobeEffect(() => this.startCombat(boss, true));
      });
    } else if (t.type.startsWith('enemy')) {
      const danger = parseInt(t.type.slice(-1));
      const chance = firstVisit ? 1 : .60;
      if (Math.random() < chance) {
        const enemy = this.pickEnemy(danger);
        const isMini = !!enemy.isMini;
        if (isMini) {
          // Show warning before mini-boss
          this.showEventWarning(
            '⚠ MINI-BOSS INCOMING',
            `${enemy.name} is approaching! This is a powerful named enemy with a unique item drop. Prepare yourself!`,
            '⚔ ENGAGE',
            () => this.startCombat(enemy, false),
            '↩ BACK TO MAP',
            () => { this.show('screen-map'); this.renderMap(); this.renderHUD(); }
          );
        } else {
          this.startCombat(enemy, false);
        }
      }
    } else if (t.type === 'supply') {
      if (firstVisit) this.showLoot(1);
    } else if (t.type === 'chest') {
      if (firstVisit) this.openChest(r, c);
    } else if (t.type === 'dungeon') {
      if (firstVisit) this.openDungeonPrompt(r, c);
    } else if (t.type === 'merchant') {
      this.openMerchant();
    } else if (t.type === 'town' || t.type === 'city') {
      this.openTown(t.type === 'city');
    } else if (t.type === 'npc') {
      this.openNPCEncounter(r, c);
    } else if (t.type === 'camp') {
      this.openCampEvent();
    } else if (t.type === 'ruins') {
      if (firstVisit) this.openRuinsEvent();
    } else if (t.type === 'shrine') {
      if (firstVisit) this.openShrineEvent();
    } else if (t.type === 'hideout') {
      this.openHideout();
    } else if (t.type === 'ambush') {
      if (firstVisit) this.openAmbushEvent();
    } else if (t.type === 'rift') {
      if (firstVisit) this.openRiftEvent();
    }
  },

  // ─── HUD ───
  renderHUD() {
    const s = this.state;
    if (!s) return;
    document.getElementById('hp-bar').style.width  = Math.max(0, (s.hp / s.maxHp) * 100) + '%';
    document.getElementById('hp-text').textContent  = s.hp + '/' + s.maxHp;
    document.getElementById('ap-bar').style.width  = Math.max(0, (s.ap / s.maxAp) * 100) + '%';
    document.getElementById('ap-text').textContent  = s.ap + '/' + s.maxAp + ' AP';
    document.getElementById('xp-bar').style.width  = Math.max(0, (s.xp / s.xpNext) * 100) + '%';
    document.getElementById('rad-bar').style.width = Math.max(0, s.rad / s.maxRad * 100) + '%';
    const radText = document.getElementById('rad-text');
    if (radText) radText.textContent = `${s.rad}/${s.maxRad}`;
    document.getElementById('hud-lv').textContent   = (s.lv >= 100 ? 'MAX ' : 'LV ') + s.lv + (s.advancedClasses && s.advancedClasses.length ? ' ★' : '');
    document.getElementById('hud-caps').textContent = '💰 ' + s.caps;
    const essEl = document.getElementById('hud-essence');
    if (essEl) {
      const ec = s.essenceCount || 0;
      const ab = s.artificerBonus || 0;
      if (ec > 0 || ab > 0) { essEl.style.display = 'block'; essEl.textContent = `✦ Loot Luck +${ab}`; }
      else essEl.style.display = 'none';
    }
    // Hardcore / Prestige badges
    const hcBadge = document.getElementById('hud-hardcore-badge');
    if (hcBadge) hcBadge.style.display = s.hardcore ? 'block' : 'none';
    const pBadge = document.getElementById('hud-prestige-badge');
    if (pBadge) {
      const pLv = s.prestigeLevel || 0;
      if (pLv > 0) { pBadge.style.display = 'block'; pBadge.textContent = `🔱 P${pLv}`; }
      else pBadge.style.display = 'none';
    }
    const si = document.getElementById('status-icons');
    if (s.statuses && s.statuses.length > 0) {
      si.innerHTML = s.statuses.map(st => {
        const def = STATUS_DEF[st.type];
        if (!def) return '';
        return `<span style="margin-right:6px;white-space:nowrap"><span style="color:${def.color}">${def.icon} ${def.label}</span><span style="color:#e8e0d0;opacity:.9;font-size:.85em"> (${st.turns})</span></span>`;
      }).join('');
    } else {
      si.innerHTML = '';
    }
    // HUD avatar portrait
    const avatarEl = document.getElementById('hud-avatar');
    if (avatarEl && s.archetype) {
      const src = ARCHETYPE_ART[s.archetype] || '';
      if (avatarEl.src !== location.origin + src) avatarEl.src = src;
    }
    const raceEl = document.getElementById('hud-avatar-race');
    if (raceEl) {
      const raceData = RACES.find(r => r.id === s.race);
      raceEl.textContent = raceData ? raceData.icon + ' ' + raceData.name : '';
    }
    // HUD quest / bounty badge
    const qbadgeEl = document.getElementById('hud-quest-badge');
    if (qbadgeEl) {
      const activeBounties = (s.bounties || []).filter(b => !b.done);
      const completedBounties = (s.bounties || []).filter(b => !b.done && b.progress > 0);
      let activeNpcQuests = 0;
      let readyNpcQuests = 0;
      if (s.npcQuests) {
        for (const key of Object.keys(s.npcQuests)) {
          if (!key.endsWith('_active')) continue;
          const qId = s.npcQuests[key];
          if (!qId) continue;
          const q = QUEST_CHAINS[qId];
          if (!q) continue;
          activeNpcQuests++;
          if (checkQuestComplete(q, s)) readyNpcQuests++;
        }
      }
      if (readyNpcQuests > 0) {
        qbadgeEl.style.display = 'inline-block';
        qbadgeEl.style.borderColor = 'var(--green)';
        qbadgeEl.style.color = 'var(--green)';
        qbadgeEl.style.background = 'rgba(57,255,90,.15)';
        qbadgeEl.textContent = `✅ QUEST READY`;
      } else if (activeBounties.length > 0 || activeNpcQuests > 0) {
        qbadgeEl.style.display = 'inline-block';
        qbadgeEl.style.borderColor = 'var(--amber)';
        qbadgeEl.style.color = 'var(--amber)';
        qbadgeEl.style.background = 'rgba(255,224,80,.1)';
        const parts = [];
        if (activeBounties.length) parts.push(`${activeBounties.length} bounty`);
        if (activeNpcQuests) parts.push(`${activeNpcQuests} quest`);
        qbadgeEl.textContent = `🎯 ${parts.join(' · ')}`;
      } else {
        qbadgeEl.style.display = 'none';
      }
    }
  },

  getTotalDef() {
    const s = this.state;
    let def = s.end * 0.3;
    const armorDouble = this.getAdvClassEffect('armorDouble');
    const armorBonus  = (this.getAdvClassEffect('armorBonus') || 0) + (this.hasSkill('fortify') ? 5 : 0) + (this.hasSkill('scrap_plate') ? 10 : 0) + (this.hasSkill('colossus') ? 15 : 0);
    ['chest','head','arms','legs','shoes'].forEach(sl => {
      if (s.equip[sl]) {
        const d = s.equip[sl].def || 0;
        def += armorDouble ? d * 2 : d;
      }
    });
    if (this.getAmuletBonus('def')) def += this.getAmuletBonus('def');
    if (this.getSlotBonus('def')) def += this.getSlotBonus('def');
    def += armorBonus;
    // Last Stand: +20 DEF when below 25% HP
    if (this.hasSkill('last_stand') && s.hp < s.maxHp * 0.25) def += 20;
    return Math.round(def);
  },

  getSlotBonus(key) {
    const s = this.state;
    let total = 0;
    ['belt','ring1','ring2'].forEach(sl => {
      if (s.equip[sl] && s.equip[sl].bonus && s.equip[sl].bonus[key]) total += s.equip[sl].bonus[key];
    });
    return total;
  },

  getTotalDodge() {
    const s = this.state;
    let dodge = this.getAdvClassEffect('dodge') || 0;
    ['mainHand','offHand','head','chest','arms','legs','shoes','amulet'].forEach(sl => {
      if (s.equip[sl] && s.equip[sl].dodge) dodge += s.equip[sl].dodge;
    });
    dodge += this.getAmuletBonus('dodge') || 0;
    dodge += this.getCelestialEffect('bonusDodge') || 0;
    return Math.min(0.75, dodge);
  },

  getWeaponAtk() {
    const s = this.state;
    let atk = s.equip.mainHand ? s.equip.mainHand.atk : 3;
    // Off-hand contributes 60% of its ATK as bonus damage
    if (s.equip.offHand && s.equip.offHand.atk) atk += Math.round(s.equip.offHand.atk * 0.6);
    // ATK bonus from non-weapon unique gear (helm, chest, arms, etc.)
    ['head','chest','arms','legs','shoes'].forEach(sl => {
      if (s.equip[sl] && s.equip[sl].atk) atk += s.equip[sl].atk;
    });
    if (this.hasSkill('fury')) atk += 4;
    if (this.hasSkill('dead_eye')) atk += 6;
    atk += this.getSlotBonus('atk') || 0;
    atk += s.flatAtk || 0;
    // Berserker: +6 ATK when below 40% HP
    if (this.hasSkill('berserker') && s.hp < s.maxHp * 0.4) atk += 6;
    return atk;
  },

  // Combined sell bonus from class + Fence skill
  getSellBonus() {
    return (this.getAdvClassEffect('sellBonus') || 0) + (this.hasSkill('fence') ? 0.40 : 0);
  },

  getAmuletBonus(key) {
    const s = this.state;
    let total = 0;
    if (s.equip && s.equip.amulet && s.equip.amulet.bonus) total += s.equip.amulet.bonus[key] || 0;
    // Also aggregate from belt + rings
    total += this.getSlotBonus(key) || 0;
    return total;
  },

  // ─── STATUS EFFECTS ───
  processStatusTick() {
    const s = this.state;
    if (!s.statuses || s.statuses.length === 0) return;
    s.statuses = s.statuses.filter(st => {
      const def = STATUS_DEF[st.type];
      if (!def) { st.turns--; return st.turns > 0; }
      if (def.dmgPerTurn) {
        s.hp = Math.max(0, s.hp - def.dmgPerTurn);
      }
      // Elemental player status effects
      if (def.radPerTurn) {
        // bio/radiant status causes radiation buildup in player
        s.rad = Math.min(s.maxRad, s.rad + def.radPerTurn);
      }
      if (def.apPenalty && s.ap > 1) {
        // freeze burns AP each turn
        s.ap = Math.max(0, s.ap - def.apPenalty);
      }
      if (def.defShred && !st._shredApplied) {
        // acid reduces player DEF (tracked via a debuff flag)
        s._acidShred = (s._acidShred || 0) + def.defShred;
        st._shredApplied = true;
      }
      st.turns--;
      if (st.turns <= 0 && st._shredApplied) {
        // Reset acid shred when status expires
        s._acidShred = Math.max(0, (s._acidShred || 0) - (def.defShred || 0));
      }
      return st.turns > 0;
    });
    if (s.hp <= 0) this.die();
  },

  applyStatusToPlayer(type) {
    const s = this.state;
    if (this.hasSkill('antitoxin') && (type === 'poison' || type === 'burn')) return;
    if (this.getAdvClassEffect('immuneTox') && (type === 'poison' || type === 'burn')) return;
    if (s.raceImmuneTox && (type === 'poison' || type === 'burn' || type === 'acid' || type === 'bio')) return;
    if (this.getAdvClassEffect('immuneSlowStun') && (type === 'slow' || type === 'stun')) return;
    if (!s.statuses) s.statuses = [];
    const existing = s.statuses.find(st => st.type === type);
    if (existing) { existing.turns = STATUS_DEF[type].duration; }
    else s.statuses.push({ type, turns: STATUS_DEF[type].duration });
  },

  applyStatusToEnemy(type) {
    const e = this.combat.enemy;
    if (!e.statuses) e.statuses = [];
    const existing = e.statuses.find(st => st.type === type);
    const dur = (STATUS_DEF[type].duration || 3) + this._intDurationBonus();
    if (existing) { existing.turns = dur; }
    else e.statuses.push({ type, turns: dur });
    this.logCombat(STATUS_DEF[type].icon + ' ' + e.name + ' is ' + STATUS_DEF[type].label + 'ED!', 'log-status');
  },

  // INT scales DoT damage multiplicatively: each INT point = +4% bonus (INT 10 → ×1.40, INT 15 → ×1.60)
  _intStatusMult() {
    const s = this.state;
    return s ? 1 + (s.int || 0) * 0.04 : 1;
  },

  // INT extends status durations: +1 turn at INT 8, +2 turns at INT 15
  _intDurationBonus() {
    const s = this.state;
    const int_ = s ? (s.int || 0) : 0;
    if (int_ >= 15) return 2;
    if (int_ >= 8)  return 1;
    return 0;
  },

  // INT boosts status application chance: +5% per 5 INT
  _intStatusChanceBonus() {
    const s = this.state;
    return s ? Math.floor((s.int || 0) / 5) * 0.05 : 0;
  },

  processEnemyStatusTick() {
    const e = this.combat.enemy;
    if (!e.statuses || e.statuses.length === 0) return false;
    let stunned = false;
    const burnDotBonus = this.getAdvClassEffect('burnDotBonus') || 0;
    const intMult = this._intStatusMult();
    e.statuses = e.statuses.filter(st => {
      const def = STATUS_DEF[st.type];
      if (!def) { st.turns--; return st.turns > 0; }
      let dmg = def.dmgPerTurn || 0;
      if (dmg > 0) {
        dmg = Math.floor(dmg * intMult); // INT multiplies ALL DoT effects
        if (st.type === 'burn') dmg += burnDotBonus;
        const intPct = Math.round((intMult - 1) * 100);
        e.hp = Math.max(0, e.hp - dmg);
        this.logCombat(`${def.icon} ${def.label} dealt ${dmg} to ${e.name}!${intPct > 0 ? ` (INT ×${(intMult).toFixed(1)})` : ''}`, 'log-status');
      }
      // Elemental special effects on enemies
      if (def.stunChance && Math.random() < def.stunChance) stunned = true;
      if (def.skipsTurn) stunned = true;
      if (def.defShred && !st._enemyShredApplied) {
        e._atkShred = (e._atkShred || 0) + def.defShred;
        st._enemyShredApplied = true;
      }
      if (def.apPenalty && !st._freezeApplied) {
        // Freeze slows enemy attacks (treat as 50% dmg reduction for this enemy)
        e._freezePenalty = true;
        st._freezeApplied = true;
      }
      st.turns--;
      if (st.turns <= 0) {
        if (st._enemyShredApplied) e._atkShred = Math.max(0, (e._atkShred || 0) - (def.defShred || 0));
        if (st._freezeApplied) e._freezePenalty = false;
      }
      return st.turns > 0;
    });
    return stunned;
  },

  // Get weapon-type advantage multiplier for damage
  _getAdvantageMultiplier() {
    const s = this.state;
    const e = this.combat && this.combat.enemy;
    if (!e) return 1;
    const wpn = s.equip.mainHand;
    const playerType = (wpn && wpn.weaponType) || (ARCHETYPES.find(a => a.id === s.archetype) || {}).weaponType || 'melee';
    const enemyType = e.weaponType || 'melee';
    if (playerType === 'ranged' && enemyType === 'melee') return 1.15; // ranged vs melee: advantage
    if (playerType === 'melee' && enemyType === 'ranged') return 0.90; // melee vs ranged: penalty (enemy stays back)
    return 1.0; // same type = neutral
  },

  // Apply elemental damage from weapon element property
  _applyWeaponElement() {
    const s = this.state;
    const wpn = s.equip.mainHand;
    if (!wpn || !wpn.element) return;
    const elementStatusMap = { fire: 'burn', acid: 'acid', shock: 'shock', cryo: 'freeze', freeze: 'freeze', radiant: 'radiant', bio: 'bio', poison: 'poison' };
    const statusType = elementStatusMap[wpn.element] || wpn.element;
    if (!STATUS_DEF[statusType]) return;
    if (Math.random() < (0.40 + this._intStatusChanceBonus())) this.applyStatusToEnemy(statusType);
  },

  renderEnemyStatus() {
    const e = this.combat.enemy;
    const el = document.getElementById('enemy-status');
    if (!e.statuses || e.statuses.length === 0) { el.textContent = ''; return; }
    el.innerHTML = e.statuses.map(st => {
      const def = STATUS_DEF[st.type];
      return `<span style="margin-right:6px;white-space:nowrap"><span style="color:${def.color}">${def.icon} ${def.label}</span><span style="color:#e8e0d0;opacity:.9;font-size:.85em"> (${st.turns})</span></span>`;
    }).join('');
  },

  // ─── VATS ───
  toggleVATS() {
    const s = this.state;
    const panel = document.getElementById('vats-panel');
    if (panel.style.display === 'block') { panel.style.display = 'none'; return; }
    const freeHeadshot = this.getAdvClassEffect('freeHeadshot');
    if (!freeHeadshot && s.ap < 1) { this.toast('Not enough AP!'); return; }
    AudioEngine.sfx.vats();
    const headMult = this.getAdvClassEffect('headMult') || 2.2;
    // Zone DC values for d20 check (AGI mod vs DC)
    const zones = [
      { id: 'head',  label: 'HEAD',  icon: '🎯', dc: freeHeadshot ? 0 : 14, dmgMult: headMult, effect: 'CRIT',   desc: freeHeadshot ? 'FREE · Auto Hit · Crit' : 'CRIT hit · DC 14' },
      { id: 'torso', label: 'TORSO', icon: '💢', dc: 8,  dmgMult: 1.0, effect: 'none',   desc: 'Standard damage · DC 8' },
      { id: 'arms',  label: 'ARMS',  icon: '💪', dc: 11, dmgMult: 0.7, effect: 'DISARM', desc: 'Disarms enemy · DC 11' },
      { id: 'legs',  label: 'LEGS',  icon: '🦵', dc: 9,  dmgMult: 0.6, effect: 'SLOW',   desc: 'Applies SLOW · DC 9' },
    ];
    // Compute AGI mod for display
    let agiMod = Math.floor((s.agi - 5) / 2);
    if (this.hasTrait('quickfooted')) agiMod += 2;
    if (this.hasTrait('dead_shot')) agiMod += 2;
    if (this.hasTrait('bloodhound') && s.hp / s.maxHp < 0.40) agiMod += 3;
    if (this.hasTrait('born_lucky')) agiMod += Math.floor(s.lck / 4);
    const sign = agiMod >= 0 ? `+${agiMod}` : `${agiMod}`;
    document.getElementById('vats-targets').innerHTML = zones.map(z => `
      <div class="vats-target" onclick="G.vatsFire('${z.id}')">
        <span class="vats-zone">${z.icon} ${z.label}</span>
        <span class="vats-chance">${z.dc === 0 ? 'AUTO' : `DC ${z.dc}`}</span>
        <span class="vats-effect">${z.desc} <span style="color:#ffda44;font-size:.55rem">[d20${sign}]</span></span>
      </div>`).join('');
    panel.style.display = 'block';
    this._vatsZones = zones;
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },

  vatsFire(zoneId) {
    const s = this.state;
    const enemy = this.combat.enemy;
    const freeHeadshot = this.getAdvClassEffect('freeHeadshot');
    const isFreeHead = freeHeadshot && zoneId === 'head';
    if (!isFreeHead && s.ap < 1) { this.toast('Not enough AP!'); return; }
    if (!isFreeHead) s.ap -= 1;
    document.getElementById('vats-panel').style.display = 'none';
    const zone = this._vatsZones.find(z => z.id === zoneId);

    // Free headshot skips the dice roll entirely
    if (isFreeHead) {
      this._vatsLand(zone, true);
      return;
    }

    // Build AGI modifier for VATS check (includes Dead Shot / Quickfooted / Bloodhound / Born Lucky traits)
    let agiMod = Math.floor((s.agi - 5) / 2);
    if (this.hasTrait('quickfooted')) agiMod += 2;
    if (this.hasTrait('dead_shot'))   agiMod += 2;
    // (Bloodhound & Born Lucky are applied globally inside showDiceRoll)

    this.logCombat(`🎯 V.A.T.S. ${zone.label} — AGI check DC ${zone.dc} (mod ${agiMod >= 0 ? '+' : ''}${agiMod})`, 'log-status');
    this.updateCombatUI();
    this.showDiceRoll({
      statLabel: `V.A.T.S. ${zone.icon}${zone.label} (AGI)`,
      modifier: agiMod,
      dc: zone.dc,
      difficulty: zone.dc >= 13 ? 'hard' : zone.dc >= 10 ? 'normal' : 'easy',
      onSuccess: () => this._vatsLand(zone, false),
      onFail: () => {
        AudioEngine.sfx.miss();
        this.logCombat(`V.A.T.S. ${zone.label} MISS — shot went wide!`, 'log-dmg');
        this.floatingDmg('MISS', 'miss', 'enemy');
        this.updateCombatUI();
        this.enemyTurn();
      },
    });
  },

  _vatsLand(zone, isFreeHead) {
    const s = this.state;
    const enemy = this.combat.enemy;
    let dmg = Math.round(this.getWeaponAtk() * zone.dmgMult * (0.85 + Math.random() * .3));
    const lifeSteal = this.getAmuletBonus('lifesteal');
    enemy.hp = Math.max(0, enemy.hp - dmg);
    if (lifeSteal) {
      const h = Math.round(dmg * lifeSteal);
      s.hp = Math.min(s.maxHp, s.hp + h);
      this.logCombat(`Lifesteal +${h}HP`, 'log-heal');
      this.floatingDmg(`+${h}`, 'heal', 'player');
    }
    if (zone.effect === 'CRIT') {
      const extra = Math.round(dmg * .5);
      enemy.hp = Math.max(0, enemy.hp - extra);
      AudioEngine.sfx.crit();
      this.logCombat(`V.A.T.S. ${zone.label} HIT for ${dmg + extra}!${isFreeHead ? ' [FREE SHOT]' : ''} CRITICAL!`, 'log-crit');
      this.animSprite('player', 'attack'); this.animSprite('enemy', 'hit');
      this.floatingDmg(dmg + extra, 'crit', 'enemy');
    } else {
      AudioEngine.sfx.attack();
      this.logCombat(`V.A.T.S. ${zone.label} HIT for ${dmg}!`, 'log-crit');
      this.animSprite('player', 'attack'); this.animSprite('enemy', 'hit');
      this.floatingDmg(dmg, 'dmg', 'enemy');
    }
    if (zone.effect === 'DISARM') { enemy.atk = Math.max(1, Math.round(enemy.atk * .6)); this.logCombat('Enemy weapon damaged! ATK -40%', 'log-status'); }
    if (zone.effect === 'SLOW')   this.applyStatusToEnemy('slow');
    if (enemy.hp <= 0) {
      const allDead = this.combat.enemies.every(e => e.hp <= 0);
      if (allDead) { this.winCombat(); return; }
      this._advanceToNextLiveEnemy();
      this.logCombat(`💀 ${enemy.name} eliminated! ${this.combat.enemies.filter(e => e.hp > 0).length} foe(s) remain!`, 'log-crit');
    }
    this.updateCombatUI();
    this.enemyTurn();
  },

  // ─── COMBAT ───
  pickEnemy(danger) {
    const scale = 1 + (this.state.lv - 1) * 0.12;

    // 25% chance on danger 2-3 tiles to spawn a mini-boss
    if (danger >= 2 && Math.random() < 0.25) {
      const pool = MINI_BOSSES.filter(m => m.danger <= danger);
      const base = pool[Math.floor(Math.random() * pool.length)];
      const e = { ...base };
      e.hp   = Math.round(e.hp  * scale);
      e.atk  = Math.round(e.atk * scale);
      e.maxHp = e.hp;
      e.statuses = [];
      return e;
    }

    const pool = ENEMIES.filter(e => e.danger <= danger);
    const e = { ...pool[Math.floor(Math.random() * pool.length)] };
    e.hp    = Math.round(e.hp  * scale);
    e.atk   = Math.round(e.atk * scale);
    e.maxHp = e.hp;
    e.statuses = [];
    if (danger === 3 && Math.random() < 0.20) {
      e.name  = '⚡ ELITE ' + e.name;
      e.hp    = Math.round(e.hp  * 1.6);
      e.maxHp = e.hp;
      e.atk   = Math.round(e.atk * 1.3);
      e.xp    = Math.round(e.xp  * 1.5);
      e.caps  = Math.round(e.caps * 2);
      e.elite = true;
    }
    // Init special archetype runtime state
    if (e.isShielder && e.shieldHp) {
      e._shieldHp    = Math.round(e.shieldHp * scale);
      e._maxShieldHp = e._shieldHp;
    }
    if (e.isBerserker) { e._baseAtk = e.atk; }
    return e;
  },

  pickBoss() {
    // Persistent boss per tile — same boss every time you revisit
    const s = this.state;
    const key = s.playerPos.r + ',' + s.playerPos.c;
    if (!s.bossAssignments) s.bossAssignments = {};
    let bossName = s.bossAssignments[key];
    if (!bossName) {
      // Assign a boss to this tile permanently
      const killed = s.killedBossNames || [];
      let pool = BOSSES.filter(b => !killed.includes(b.name) && !Object.values(s.bossAssignments).includes(b.name));
      if (!pool.length) pool = BOSSES.filter(b => !Object.values(s.bossAssignments).includes(b.name));
      if (!pool.length) pool = BOSSES;
      bossName = pool[Math.floor(Math.random() * pool.length)].name;
      s.bossAssignments[key] = bossName;
      this.save();
    }
    const template = BOSSES.find(b => b.name === bossName) || BOSSES[0];
    const b = { ...template };
    const scale = 1 + (s.lv - 1) * 0.14;   // linear — same curve as enemies, just steeper base stats
    b.hp    = Math.round(b.hp  * scale);
    b.atk   = Math.round(b.atk * scale);
    b.maxHp = b.hp;
    b.statuses = [];
    return b;
  },

  // Get the unique drop for a boss/mini-boss by name — always Unique tier
  getBossDrop(enemyName) {
    const drops = BOSS_DROPS[enemyName];
    if (!drops || !drops.length) return null;
    const drop = { ...drops[0] };
    // Boss-only drops are always Unique tier (brown)
    delete drop.tier;
    return this.applyTier(drop, 'unique');
  },

  startCombat(enemy, isBoss) {
    const s = this.state;
    // AP always resets to full at the start of each new encounter
    s.ap = s.maxAp;
    if (this.hasSkill('apboost')) s.ap = Math.min(s.maxAp, s.ap + 1);
    if (this.hasSkill('patched_up')) s.hp = Math.min(s.maxHp, s.hp + 10);
    if (this.hasSkill('triage')) {
      const triageHeal = Math.round(s.maxHp * 0.12);
      s.hp = Math.min(s.maxHp, s.hp + triageHeal);
    }
    s._lifeTapRegen = 0; // reset life tap regen counter each combat

    // Build enemy squad: 30% chance of 2-3 mobs on non-boss enemy encounters
    let enemies;
    if (!isBoss && !enemy.isMini && Math.random() < 0.30) {
      const extraCount = Math.random() < 0.4 ? 2 : 1; // 1 or 2 extras
      const danger = enemy.danger || 1;
      const pool = ENEMIES.filter(e => e.danger <= danger);
      const extras = [];
      for (let i = 0; i < extraCount; i++) {
        const base = pool[Math.floor(Math.random() * pool.length)];
        const scale = 1 + (s.lv - 1) * 0.12;
        const ex = { ...base };
        ex.hp = Math.round(ex.hp * scale * 0.8); // mobs in squad are slightly weaker
        ex.atk = Math.round(ex.atk * scale * 0.85);
        ex.maxHp = ex.hp;
        ex.statuses = [];
        if (ex.isShielder && ex.shieldHp) { ex._shieldHp = Math.round(ex.shieldHp * scale * 0.8); ex._maxShieldHp = ex._shieldHp; }
        if (ex.isBerserker) { ex._baseAtk = ex.atk; }
        extras.push(ex);
      }
      enemies = [enemy, ...extras];
      this.logCombat(`⚠ AMBUSH! ${enemies.length} enemies!`, 'log-crit');
    } else {
      enemies = [enemy];
    }

    this._combatLog = [];
    this.combat = {
      enemy,      // primary target (kept for backward compat)
      enemies,    // full squad
      activeIdx: 0,
      isBoss, braceActive: false, firstStrike: true,
      aoeUsed: {}, astralShieldUsed: false,
    };
    this.show('screen-combat');
    // Always reset enemy HP bar visibility at combat start (multi-mob fights hide it)
    const arenaHpReset = document.querySelector('#arena-enemy .arena-hp-wrap');
    if (arenaHpReset) arenaHpReset.style.display = '';
    // Clear any lingering multi-mob pips from previous fight
    const prevOverlay = document.getElementById('multi-mob-overlay');
    if (prevOverlay) prevOverlay.innerHTML = '';
    AudioEngine.play(isBoss);
    const arena = document.getElementById('combat-arena');
    const tid = s.territory || 'badlands';
    const bg = COMBAT_BG[tid] || '/art/combat_bg_desert.png';
    arena.style.backgroundImage = `url('${bg}')`;
    const pSprite = document.getElementById('player-sprite');
    if (pSprite) { pSprite.src = ARCHETYPE_ART[s.archetype] || ''; pSprite.style.visibility = 'visible'; }
    // Reset any death visuals from previous encounter
    const prevAvatar = document.getElementById('enemy-avatar');
    if (prevAvatar) prevAvatar.classList.remove('enemy-dying');
    const prevActions = document.querySelector('.combat-actions');
    if (prevActions) prevActions.classList.remove('locked');
    document.getElementById('player-arena-name').textContent = s.name || s.archetype || 'You';
    document.getElementById('combat-log').innerHTML    = '';
    document.getElementById('vats-panel').style.display = 'none';
    document.getElementById('combat-item-list').style.display = 'none';
    if (this.getAdvClassEffect('combatRevive') && this.combat.reviveUsed === undefined) {
      this.combat.reviveUsed = false;
    }
    if (enemies.length > 1) {
      this.logCombat(`⚠ ${enemies.length} enemies incoming! Focus fire or use AOE!`, 'log-status');
    } else {
      this.logCombat(`⚠ Encountered ${enemy.name}!`, 'log-status');
    }
    // Show active bounties that match any enemy in this combat
    const activeBounties = (s.bounties || []).filter(b => !b.done);
    activeBounties.forEach(b => {
      const matches = enemies.some(e => {
        const base = e.name.replace('⚡ ELITE ', '').replace(' BOSS', '');
        return base === b.target;
      });
      if (matches) this.logCombat(`🎯 BOUNTY: ${b.target} — ${b.progress}/${b.count} kills`, 'log-status');
    });
    this.updateCombatUI();
    this.renderHUD();
  },

  updateCombatUI() {
    if (!this.combat) return;
    const { enemies, activeIdx } = this.combat;
    const enemy = enemies[activeIdx];
    this.combat.enemy = enemy;
    const s = this.state;

    const pHpPct = Math.max(0, (s.hp / s.maxHp) * 100);
    const pHpFill = document.getElementById('player-arena-hp');
    if (pHpFill) pHpFill.style.width = pHpPct + '%';
    const pHpText = document.getElementById('player-arena-hp-text');
    if (pHpText) pHpText.textContent = `${s.hp}/${s.maxHp}`;
    const pHpBar = pHpFill ? pHpFill.parentElement : null;
    if (pHpBar) pHpBar.classList.toggle('braced', !!this.combat.braceActive);

    const eHpPct = Math.max(0, (enemy.hp / enemy.maxHp) * 100);
    const eHpFillEl = document.getElementById('enemy-hp-fill');
    if (eHpFillEl) eHpFillEl.style.width = eHpPct + '%';
    const eHpBar = eHpFillEl ? eHpFillEl.parentElement : null;
    const hasShield = !!(enemy._shieldHp > 0);
    if (eHpBar) eHpBar.classList.toggle('shielded', hasShield);
    const eHpText = document.getElementById('enemy-arena-hp-text');
    if (eHpText) eHpText.textContent = hasShield ? `${enemy.hp}/${enemy.maxHp} 🛡${enemy._shieldHp}` : `${enemy.hp}/${enemy.maxHp}`;
    document.getElementById('enemy-name').textContent = (this.combat.isBoss ? '💀 ' : '') + enemy.name;
    const avatarEl = document.getElementById('enemy-avatar');
    if (avatarEl) { avatarEl.style.visibility = 'visible'; avatarEl.src = this.getEnemyAvatar(enemy); }

    const arenaHpWrap = document.querySelector('#arena-enemy .arena-hp-wrap');
    if (enemies.length > 1) {
      // Multi-mob: hide the main arena HP bar (pips show all enemies' HP)
      if (arenaHpWrap) arenaHpWrap.style.display = 'none';
      const overlay = document.getElementById('multi-mob-overlay');
      if (overlay) {
        overlay.innerHTML = enemies.map((e, i) => {
          const isDead = e.hp <= 0;
          const isActive = i === activeIdx && !isDead;
          const hpPct = Math.max(0, (e.hp / e.maxHp) * 100);
          return `<div class="mob-pip${isActive ? ' active' : ''}${isDead ? ' dead' : ''}" onclick="${isDead ? '' : 'G.setTarget('+i+')'}">
            <span style="color:${isDead ? '#665544' : (isActive ? 'var(--amber)' : 'var(--red)')}">${isDead ? '💀' : (isActive ? '▶' : '·')} ${e.name}</span>
            <div class="mob-pip-hp"><div class="mob-pip-hp-fill" style="width:${hpPct}%"></div></div>
            ${isActive ? `<span style="font-size:.48rem;color:#ccc;margin-left:2px">${e.hp}/${e.maxHp}</span>` : ''}
          </div>`;
        }).join('');
      }
    } else {
      // Single enemy: show main arena HP bar, clear pips
      if (arenaHpWrap) arenaHpWrap.style.display = '';
      const overlay = document.getElementById('multi-mob-overlay');
      if (overlay) overlay.innerHTML = '';
    }

    this._renderAOEButtons();

    const eStatus = document.getElementById('enemy-status');
    if (eStatus) {
      eStatus.innerHTML = (enemy.statuses && enemy.statuses.length)
        ? enemy.statuses.map(st => { const d = STATUS_DEF[st.type]; return d ? `<span style="color:${d.color};margin-right:4px">${d.icon}${st.turns}</span>` : ''; }).join('')
        : '';
    }

    const pStatuses = document.getElementById('arena-player-statuses');
    if (pStatuses) {
      pStatuses.innerHTML = (s.statuses && s.statuses.length)
        ? s.statuses.map(st => { const d = STATUS_DEF[st.type]; return d ? `<span style="color:${d.color};margin-right:4px">${d.icon}${st.turns}</span>` : ''; }).join('')
        : '';
    }
    const psi = document.getElementById('combat-player-status');
    if (psi) {
      if (s.statuses && s.statuses.length > 0) {
        psi.innerHTML = s.statuses.map(st => {
            const def = STATUS_DEF[st.type];
            if (!def) return '';
            return `<span style="color:${def.color};margin-right:6px;font-size:.6rem">${def.icon} ${def.label} (${st.turns})</span>`;
          }).join('');
        psi.style.display = 'flex';
      } else { psi.style.display = 'none'; }
    }

    document.getElementById('btn-attack').disabled = s.ap < 2;
    document.getElementById('btn-power').disabled  = s.ap < 4;
    document.getElementById('btn-brace').disabled  = false;
    document.getElementById('btn-vats').disabled   = s.ap < 1 && !this.getAdvClassEffect('freeHeadshot');
    const braceBtn = document.getElementById('btn-brace');
    braceBtn.className = 'btn blue' + (this.combat.braceActive ? ' brace-active' : '');
    this.renderHUD();
  },

  setTarget(idx) {
    const { enemies } = this.combat;
    if (!enemies[idx] || enemies[idx].hp <= 0) return;
    this.combat.activeIdx = idx;
    this.combat.enemy = enemies[idx];
    this.updateCombatUI();
    this.logCombat(`🎯 Targeting: ${enemies[idx].name}`, 'log-status');
  },

  floatingDmg(text, type, target) {
    const container = document.getElementById('floating-dmg-container');
    if (!container) return;
    const el = document.createElement('div');
    el.className = `floating-dmg ${type}`;
    el.textContent = text;
    const ox = (Math.random() - 0.5) * 40;
    el.style.left = (target === 'enemy' ? 60 : -60) + ox + 'px';
    el.style.top = (Math.random() * 30 - 40) + 'px';
    container.appendChild(el);
    setTimeout(() => el.remove(), 1100);
  },

  animSprite(which, anim) {
    const id = which === 'player' ? 'player-sprite' : 'enemy-avatar';
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('hit', 'attack');
    void el.offsetWidth;
    el.classList.add(anim);
    setTimeout(() => el.classList.remove(anim), 350);
  },

  _renderAOEButtons() {
    const { enemies, aoeUsed } = this.combat;
    const s = this.state;
    const aliveCount = enemies.filter(e => e.hp > 0).length;
    // Only show AOE row if 2+ enemies alive OR player has AOE skills
    const aoeSkills = [
      { id:'frag_grenade', label:'💣 GRENADE',   apCost:0, usesKey:'grenade' },
      { id:'shockwave',    label:'💥 SHOCKWAVE', apCost:2, usesKey:'shockwave' },
      { id:'molotov',      label:'🔥 MOLOTOV',   apCost:0, usesKey:'molotov' },
      { id:'concussive',   label:'💨 CONCUSSIVE',apCost:1, usesKey:'concussive' },
      { id:'emp_blast',    label:'⚡ EMP',        apCost:1, usesKey:'emp' },
      { id:'combat_medic', label:'💊 MEDIC',      apCost:2, usesKey:'medic_heal' },
    ].filter(a => this.hasSkill(a.id));

    const container = document.getElementById('aoe-btn-row');
    if (!container) return;
    if (aoeSkills.length === 0) { container.style.display = 'none'; return; }
    container.style.display = 'flex';
    container.innerHTML = aoeSkills.map(a => {
      const used = !!(aoeUsed[a.usesKey]);
      const canAfford = a.apCost === 0 || s.ap >= a.apCost;
      return `<button class="aoe-btn" ${(used || !canAfford) ? 'disabled' : ''} onclick="G.useAOE('${a.usesKey}')" title="${used ? 'Already used' : ''}">
        ${a.label}${a.apCost > 0 ? `<small style="font-size:.58rem;display:block">(${a.apCost}AP)</small>` : '<small style="font-size:.58rem;display:block">(once)</small>'}
      </button>`;
    }).join('');
  },

  useAOE(type) {
    const { enemies, aoeUsed } = this.combat;
    const s = this.state;
    const aliveEnemies = enemies.filter(e => e.hp > 0);
    if (!aliveEnemies.length) return;

    aoeUsed[type] = true;
    const baseAtk = this.getWeaponAtk() + s.str * 1.5;

    switch(type) {
      case 'grenade': {
        const dmgPer = Math.round(baseAtk * 0.6 * (0.8 + Math.random() * 0.4));
        aliveEnemies.forEach(e => { e.hp = Math.max(0, e.hp - dmgPer); });
        AudioEngine.sfx.crit();
        this.logCombat(`💣 GRENADE hits all ${aliveEnemies.length} enemies for ${dmgPer} each!`, 'log-crit');
        break;
      }
      case 'shockwave': {
        if (s.ap < 2) { this.toast('Not enough AP!'); aoeUsed[type] = false; return; }
        s.ap -= 2;
        const dmgPer = Math.round(baseAtk * 0.8 * (0.8 + Math.random() * 0.4));
        aliveEnemies.forEach(e => { e.hp = Math.max(0, e.hp - dmgPer); });
        AudioEngine.sfx.crit();
        this.logCombat(`💥 SHOCKWAVE hits all ${aliveEnemies.length} enemies for ${dmgPer}!`, 'log-crit');
        break;
      }
      case 'molotov': {
        aliveEnemies.forEach(e => { if (!e.statuses) e.statuses = []; e.statuses.push({type:'burn',turns:3}); });
        AudioEngine.sfx.attack();
        this.logCombat(`🔥 MOLOTOV! All ${aliveEnemies.length} enemies are BURNING!`, 'log-crit');
        break;
      }
      case 'concussive': {
        if (s.ap < 1) { this.toast('Not enough AP!'); aoeUsed[type] = false; return; }
        s.ap -= 1;
        const target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
        if (!target.statuses) target.statuses = [];
        target.statuses.push({type:'stun',turns:1});
        AudioEngine.sfx.brace();
        this.logCombat(`💨 CONCUSSIVE WAVE stuns ${target.name}!`, 'log-status');
        break;
      }
      case 'emp': {
        if (s.ap < 1) { this.toast('Not enough AP!'); aoeUsed[type] = false; return; }
        s.ap -= 1;
        aliveEnemies.forEach(e => { if (!e.statuses) e.statuses = []; e.statuses.push({type:'slow',turns:2}); });
        AudioEngine.sfx.brace();
        this.logCombat(`⚡ EMP BLAST slows all ${aliveEnemies.length} enemies!`, 'log-status');
        break;
      }
      case 'medic_heal': {
        if (s.ap < 2) { this.toast('Not enough AP!'); aoeUsed[type] = false; return; }
        s.ap -= 2;
        const healAmt = 30 + Math.round(s.int * 1.5);
        const actual = Math.min(healAmt, s.maxHp - s.hp);
        s.hp = Math.min(s.maxHp, s.hp + healAmt);
        AudioEngine.sfx.heal();
        this.logCombat(`💊 FIELD HEAL: +${actual} HP restored!`, 'log-heal');
        this.updateCombatUI();
        this.renderHUD();
        return; // don't check enemy deaths from a heal
      }
    }
    // Check if all enemies are dead
    const allDead = this.combat.enemies.every(e => e.hp <= 0);
    if (allDead) { this.winCombat(); return; }
    // Advance active target if current one died
    this._advanceToNextLiveEnemy();
    this.updateCombatUI();
    this.enemyTurn();
  },

  _advanceToNextLiveEnemy() {
    const { enemies } = this.combat;
    // If current target is dead, find next alive one
    if (enemies[this.combat.activeIdx] && enemies[this.combat.activeIdx].hp > 0) return;
    for (let i = 0; i < enemies.length; i++) {
      if (enemies[i].hp > 0) { this.combat.activeIdx = i; this.combat.enemy = enemies[i]; return; }
    }
  },

  // ── Returns the best offensive stat modifier and label for dice rolls ──
  _getBestOffensiveStat() {
    const s = this.state;
    const TRAIT_MAP = { str: 'scrapper', agi: 'quickfooted', int: 'wiredhead' };
    const stats = [
      { key: 'str', label: 'STR', icon: '💪' },
      { key: 'agi', label: 'AGI', icon: '🦵' },
      { key: 'int', label: 'INT', icon: '🧠' },
    ];
    const best = stats.reduce((a, b) => s[a.key] >= s[b.key] ? a : b);
    let mod = Math.floor((s[best.key] - 5) / 2);
    if (this.hasTrait(TRAIT_MAP[best.key])) mod += 2;
    if (this.hasTrait('bloodhound') && s.hp / s.maxHp < 0.40) mod += 3;
    if (this.hasTrait('born_lucky')) mod += Math.floor(s.lck / 4);
    return {
      key:   best.key,
      label: best.label,
      icon:  best.icon,
      value: s[best.key],
      mod,
    };
  },

  combatAction(action) {
    if (!this.combat) return;
    const s = this.state;
    const { enemy } = this.combat;

    if (action === 'attack') {
      if (s.ap < 2) return;
      s.ap -= 2;
      const firstStrikeCrit = this.getAdvClassEffect('firstStrikeCrit') && this.combat.firstStrike;
      this.combat.firstStrike = false;

      // ── Inline d20 skill check — uses character's best offensive stat ──
      const offStat = this._getBestOffensiveStat();
      const attackMod = offStat.mod;
      const enemyAC = 8 + Math.floor((enemy.atk || 10) / 10);
      const d20 = Math.floor(Math.random() * 20) + 1;
      const total = d20 + attackMod;
      const sign  = attackMod >= 0 ? `+${attackMod}` : `${attackMod}`;
      let hitMult = 1.0, hitLabel = 'HIT';
      const natTwenty = d20 === 20, natOne = d20 === 1;
      if (natTwenty) {
        hitMult = 1.0; hitLabel = 'NAT 20 — AUTO CRIT!';
      } else if (natOne) {
        hitMult = this.hasTrait('iron_nerves') ? 0.55 : 0.30; hitLabel = 'NAT 1 — FUMBLE!';
      } else if (total < enemyAC) {
        hitMult = 0.55; hitLabel = 'GLANCING BLOW';
      } else if (total >= enemyAC + 6) {
        hitMult = 1.25; hitLabel = 'SOLID HIT';
      }
      const diceColor = (natTwenty || total >= enemyAC + 6) ? 'log-crit' : (natOne || total < enemyAC) ? 'log-flee' : 'log-status';
      this.logCombat(`🎲 d20: ${d20} ${sign} = ${total} vs AC${enemyAC} [${offStat.icon}${offStat.label}] — ${hitLabel}`, diceColor);

      let critChance = 0.05 + s.lck * 0.02 + (this.hasSkill('precision') ? 0.10 : 0) + (this.hasSkill('marksman') ? 0.08 : 0) + (this.hasSkill('dead_eye') ? 0.08 : 0) + (this.getAmuletBonus('crit') || 0) + (s.equip.mainHand?.crit || 0) + (s.equip.offHand?.crit || 0) * 0.5;
      const advCrit = this.getAdvClassEffect('crit');
      if (advCrit) critChance += advCrit;
      const isCrit = natTwenty || firstStrikeCrit || Math.random() < critChance;
      const advantageMult = this._getAdvantageMultiplier();
      let dmg = Math.round((this.getWeaponAtk() + s[offStat.key] * 1.5) * (0.8 + Math.random() * 0.4) * advantageMult * hitMult);
      if (advantageMult > 1) this.logCombat(`⚔ ADVANTAGE! +${Math.round((advantageMult-1)*100)}% DMG`, 'log-status');
      if (advantageMult < 1) this.logCombat(`🛡 DISADVANTAGE! ${Math.round((advantageMult-1)*100)}% DMG`, 'log-status');
      if (this.getAdvClassEffect('burnDmgBonus') && enemy.statuses && enemy.statuses.find(st => st.type === 'burn')) {
        dmg = Math.round(dmg * 1.25);
      }
      if (isCrit) {
        dmg *= 2;
        AudioEngine.sfx.crit();
        this.logCombat(`💥 CRITICAL! You hit ${enemy.name} for ${dmg}!`, 'log-crit');
        this.animSprite('player', 'attack'); this.animSprite('enemy', 'hit');
        this.floatingDmg(dmg, 'crit', 'enemy');
        s._critsThisRun = (s._critsThisRun || 0) + 1;
        if (s._critsThisRun >= 50) this.unlockAchievement('crits_50');
      } else {
        AudioEngine.sfx.attack();
        this.logCombat(`You hit ${enemy.name} for ${dmg}`, 'log-dmg');
        this.animSprite('player', 'attack'); this.animSprite('enemy', 'hit');
        this.floatingDmg(dmg, 'dmg', 'enemy');
      }
      // Celestial: Void Touched — bonus damage chance
      const voidChance = this.getCelestialEffect('bonusDmgChance');
      const voidMult   = this.getCelestialEffect('bonusDmgMult') || .60;
      if (voidChance > 0 && Math.random() < voidChance) {
        const bonus = Math.round(dmg * voidMult);
        dmg += bonus;
        this.logCombat(`✨ VOID TOUCHED! +${bonus} bonus damage!`, 'log-crit');
      }
      // Shielder: damage hits the shield first
      if (enemy._shieldHp > 0) {
        if (this.hasSkill('arc_breaker')) {
          // 40% of damage punches straight through to HP, 60% goes into shield
          const pierceAmt = Math.round(dmg * 0.40);
          const shieldDmg  = dmg - pierceAmt;
          const absorbed   = Math.min(enemy._shieldHp, shieldDmg);
          enemy._shieldHp -= absorbed;
          dmg = pierceAmt + Math.max(0, shieldDmg - absorbed); // pierce + shield overflow
          if (enemy._shieldHp <= 0) {
            this.logCombat(`🛡 Shield SHATTERED! 🔩 ${pierceAmt} pierced through!`, 'log-crit');
            this.unlockAchievement('shielder_kill');
          } else {
            this.logCombat(`🔩 Arc Breaker: ${pierceAmt} pierces! 🛡 ${absorbed} absorbed (${enemy._shieldHp}/${enemy._maxShieldHp} left)`, 'log-status');
          }
        } else {
          const absorbed = Math.min(enemy._shieldHp, dmg);
          enemy._shieldHp -= absorbed;
          dmg = Math.max(0, dmg - absorbed);
          if (enemy._shieldHp <= 0) {
            this.logCombat(`🛡 ${enemy.name}'s shield SHATTERED!`, 'log-crit');
            this.unlockAchievement('shielder_kill');
          } else {
            this.logCombat(`🛡 Shield absorbs ${absorbed}! (${enemy._shieldHp}/${enemy._maxShieldHp} left)`, 'log-status');
          }
        }
      }
      enemy.hp = Math.max(0, enemy.hp - dmg);
      // Achievement: big hit
      if (dmg >= 150) this.unlockAchievement('big_hit');
      // Lifesteal: amulet + vampiric touch skill + Cosmic Drain perk
      const ls = (this.getAmuletBonus('lifesteal') || 0) + (this.hasSkill('vampiric') ? 0.08 : 0) + (this.hasSkill('bloodlust') ? 0.12 : 0) + this.getCelestialEffect('lifesteal');
      if (ls > 0) { const h = Math.round(dmg * ls); s.hp = Math.min(s.maxHp, s.hp + h); if (h > 0) this.logCombat(`🩸 Lifesteal +${h}HP`, 'log-heal'); }
      const wpn = s.equip.mainHand;
      const intChance = this._intStatusChanceBonus();
      if (wpn && wpn.status && Math.random() < (wpn.status.chance + intChance)) this.applyStatusToEnemy(wpn.status.type);
      if (wpn && wpn.element) this._applyWeaponElement();
      // Off-hand weapon on-hit effects
      const offWpn = s.equip.offHand;
      if (offWpn && offWpn.status && Math.random() < (offWpn.status.chance * 0.6 + intChance)) this.applyStatusToEnemy(offWpn.status.type);
      if (this.getAdvClassEffect('burnAll')) this.applyStatusToEnemy('burn');
      const poisonHit = this.getAdvClassEffect('poisonOnHit');
      if (poisonHit && Math.random() < Math.min(0.95, poisonHit + intChance)) this.applyStatusToEnemy('poison');
      // Celestial: apply celestialStatuses from all equipped items
      const allEquipped = Object.values(s.equip).filter(Boolean);
      allEquipped.forEach(eq => {
        if (eq.celestialStatuses) eq.celestialStatuses.forEach(st => {
          if (Math.random() < st.chance) this.applyStatusToEnemy(st.type);
        });
      });
      // Celestial: Solar Wrath — crit → burn
      if (isCrit && this.hasCelestialEffect('critBurn')) {
        this.applyStatusToEnemy('burn');
        this.logCombat(`☀ SOLAR WRATH! Critical ignites ${enemy.name}!`, 'log-crit');
      }
      // Celestial: Entropy Burst — stun chance on hit
      const stunChance = this.getCelestialEffect('bonusStunChance');
      if (stunChance > 0 && Math.random() < stunChance) {
        this.applyStatusToEnemy('stun');
        this.logCombat(`⚡ ENTROPY BURST! ${enemy.name} stunned!`, 'log-status');
      }
      // Double Strike: 10% chance to hit again for half damage
      if (this.hasSkill('double_strike') && Math.random() < 0.10) {
        const bonus = Math.round(dmg * 0.5);
        enemy.hp = Math.max(0, enemy.hp - bonus);
        this.logCombat(`⚡ DOUBLE STRIKE! +${bonus} bonus damage!`, 'log-crit');
      }
      // Celestial: Quantum Surge — double act chance
      const surgeChance = this.getCelestialEffect('doubleActChance');
      if (surgeChance > 0 && Math.random() < surgeChance && enemy.hp > 0) {
        const surgeDmg = Math.round(this.getWeaponAtk() * (0.8 + Math.random() * 0.4));
        enemy.hp = Math.max(0, enemy.hp - surgeDmg);
        this.logCombat(`🌀 QUANTUM SURGE! Free strike for ${surgeDmg}!`, 'log-crit');
      }
      this.updateCombatUI();
      // Executioner skill (execute at 15%)
      const execSkill = this.hasSkill('apex_hunter') ? 0.20 : this.hasSkill('executioner') ? 0.15 : 0;
      const execThresh = Math.max(this.getAdvClassEffect('execute') || 0, execSkill);
      if (execThresh && enemy.hp / enemy.maxHp < execThresh && enemy.hp > 0) {
        this.logCombat(`⚔ EXECUTE! ${enemy.name} eliminated!`, 'log-crit');
        enemy.hp = 0;
      }
      if (enemy.hp <= 0) {
        const allDead = this.combat.enemies.every(e => e.hp <= 0);
        if (allDead) { this.winCombat(); return; }
        this._advanceToNextLiveEnemy();
        this.logCombat(`💀 ${enemy.name} eliminated! ${this.combat.enemies.filter(e => e.hp > 0).length} foe(s) remain!`, 'log-crit');
        this.updateCombatUI();
      }
      this.enemyTurn();

    } else if (action === 'brace') {
      // Brace is FREE — restores AP and reduces incoming damage
      const apBefore = s.ap;
      s.ap = Math.min(s.maxAp, s.ap + 2);
      this.combat.braceActive = true;
      AudioEngine.sfx.brace();
      this.logCombat(`🛡 You brace! (+${s.ap - apBefore} AP · damage halved next hit)`, 'log-status');
      this.updateCombatUI();
      this.enemyTurn();

    } else if (action === 'flee') {
      // Auto-flee for Slippery trait / class bonus
      if (this.hasTrait('slippery') || this.getAdvClassEffect('fleeAlways')) {
        AudioEngine.sfx.flee();
        AudioEngine.stop();
        const label = this.hasTrait('slippery') ? '🏃 SLIPPERY — you ghosted out!' : '💨 Instincts — you escaped cleanly!';
        this.logCombat(label, 'log-flee');
        setTimeout(() => { this.show('screen-map'); this.renderMap(); this.renderHUD(); }, 900);
        return;
      }
      let agiMod = Math.floor((s.agi - 5) / 2);
      if (this.hasTrait('quickfooted')) agiMod += 2;
      this.logCombat(`💨 Attempting to flee… (AGI check DC 10, mod ${agiMod >= 0 ? '+' : ''}${agiMod})`, 'log-status');
      this.showDiceRoll({
        statLabel: 'Agility (AGI)',
        modifier: agiMod,
        dc: 10,
        difficulty: 'normal',
        onSuccess: () => {
          AudioEngine.sfx.flee();
          AudioEngine.stop();
          this.logCombat('💨 SUCCESS! You slipped away!', 'log-flee');
          setTimeout(() => { this.show('screen-map'); this.renderMap(); this.renderHUD(); }, 500);
        },
        onFail: () => {
          this.logCombat('⚠ FAILED to flee — enemy strikes back!', 'log-dmg');
          this.enemyTurn();
        },
      });

    } else if (action === 'power_attack') {
      if (s.ap < 4) { this.toast('⚔ Need 4 AP for a Power Attack!', 1400); return; }
      s.ap -= 4;
      const offStat = this._getBestOffensiveStat();
      const paMod = offStat.mod;
      this.logCombat(`💥 POWER ATTACK! (${offStat.label} check DC 13, mod ${paMod >= 0 ? '+' : ''}${paMod})`, 'log-status');
      this.updateCombatUI();
      this.showDiceRoll({
        statLabel: `Power Attack (${offStat.icon}${offStat.label})`,
        modifier: paMod,
        dc: 13,
        difficulty: 'hard',
        onSuccess: () => {
          const rawDmg = Math.round((this.getWeaponAtk() + s[offStat.key] * 2.0) * (0.9 + Math.random() * 0.2) * 2.5);
          // Pierces 60% of shield on success
          if (enemy._shieldHp > 0) {
            const pierce = Math.round(rawDmg * 0.60);
            const shAbs  = Math.min(enemy._shieldHp, rawDmg - pierce);
            enemy._shieldHp = Math.max(0, enemy._shieldHp - shAbs);
            const finalDmg = pierce + Math.max(0, (rawDmg - pierce) - shAbs);
            enemy.hp = Math.max(0, enemy.hp - finalDmg);
            this.logCombat(`💥 CRUSHING BLOW! ${finalDmg} damage (60% shield pierced)!`, 'log-crit');
            this.floatingDmg(finalDmg, 'crit', 'enemy');
          } else {
            enemy.hp = Math.max(0, enemy.hp - rawDmg);
            this.logCombat(`💥 CRUSHING BLOW! ${rawDmg} damage!`, 'log-crit');
            this.floatingDmg(rawDmg, 'crit', 'enemy');
          }
          AudioEngine.sfx.crit();
          this.animSprite('player', 'attack'); this.animSprite('enemy', 'hit');
          if (rawDmg >= 150) this.unlockAchievement('big_hit');
          this.updateCombatUI();
          if (enemy.hp <= 0) {
            const allDead = this.combat.enemies.every(e => e.hp <= 0);
            if (allDead) { this.winCombat(); return; }
            this._advanceToNextLiveEnemy();
          }
          this.enemyTurn();
        },
        onFail: () => {
          const rawDmg = Math.round((this.getWeaponAtk() + s[offStat.key] * 1.5) * 0.65);
          enemy.hp = Math.max(0, enemy.hp - rawDmg);
          this.logCombat(`⚠ OVERSWING! ${rawDmg} glancing damage — ${enemy.name} counters!`, 'log-dmg');
          this.floatingDmg(rawDmg, 'dmg', 'enemy');
          this.animSprite('player', 'attack'); this.animSprite('enemy', 'hit');
          // Enemy counter-hit for ~50% of their ATK
          const counterDmg = Math.max(1, Math.round(enemy.atk * 0.5));
          s.hp = Math.max(0, s.hp - counterDmg);
          this.logCombat(`⚔ ${enemy.name} counter-hits you for ${counterDmg}!`, 'log-crit');
          this.floatingDmg(counterDmg, 'dmg', 'player');
          AudioEngine.sfx.hit();
          this.updateCombatUI();
          if (enemy.hp <= 0) {
            const allDead = this.combat.enemies.every(e => e.hp <= 0);
            if (allDead) { this.winCombat(); return; }
            this._advanceToNextLiveEnemy();
          }
          if (s.hp <= 0) { this.die(); return; }
          this.enemyTurn();
        },
      });
    }
  },

  enemyTurn() {
    // If level-up overlay is showing, defer enemy turn until player picks perk
    const luOverlay = document.getElementById('levelup-overlay');
    if (luOverlay && luOverlay.classList.contains('show')) {
      this._pendingEnemyTurn = true;
      return;
    }
    const s = this.state;
    const e = this.combat.enemy;
    const stunned = this.processEnemyStatusTick();
    if (e.hp <= 0) {
      const allDead = this.combat.enemies.every(en => en.hp <= 0);
      if (allDead) { this.winCombat(); return; }
      this._advanceToNextLiveEnemy();
      this.logCombat(`💀 ${e.name} falls to status damage! ${this.combat.enemies.filter(en => en.hp > 0).length} foe(s) remain!`, 'log-crit');
      s.ap = Math.min(s.maxAp, s.ap + 2);
      this.updateCombatUI();
      return;
    }
    // Celestial: Starborn — HP regen each enemy turn
    const hpRegen = this.getCelestialEffect('hpRegen');
    if (hpRegen > 0 && s.hp < s.maxHp) {
      const healed = Math.min(hpRegen, s.maxHp - s.hp);
      s.hp += healed;
      this.logCombat(`✨ STARBORN regen: +${healed} HP`, 'log-heal');
    }
    // Special: Berserker — ATK scales as HP drops (rage stacks)
    if (e.isBerserker) {
      if (!e._baseAtk) e._baseAtk = e.atk;
      const rageFactor = Math.floor((1 - e.hp / e.maxHp) * 5); // 0 at full HP, up to 5 at death
      const rageBonus  = rageFactor * Math.ceil(e._baseAtk * 0.15);
      const newAtk     = e._baseAtk + rageBonus;
      if (newAtk > e.atk) {
        e.atk = newAtk;
        if (rageFactor >= 3) this.logCombat(`😡 ${e.name} is ENRAGED! ATK ${e.atk}!`, 'log-crit');
      }
    }
    if (!stunned) {
      // Special: Healer — heals a hurt ally (not itself) up to 3 times per combat
      if (e.isHealer) {
        const living = this.combat.enemies.filter(en => en.hp > 0);
        const otherLiving = living.filter(en => en !== e); // never self-heal
        if (otherLiving.length > 0 && (!e._healUses || e._healUses < 3)) {
          const needsHeal = otherLiving.find(en => en.hp < en.maxHp * 0.45);
          if (needsHeal) {
            const sorted = otherLiving.slice().sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp));
            const target = sorted[0];
            let healAmt = Math.round(target.maxHp * 0.14 + 6);
            if (this.hasSkill('antiheal')) {
              healAmt = Math.round(healAmt * 0.30);
              this.logCombat(`🚫 ANTI-HEAL! Enemy heal crushed!`, 'log-status');
            }
            e._healUses = (e._healUses || 0) + 1;
            target.hp = Math.min(target.maxHp, target.hp + healAmt);
            this.logCombat(`💉 ${e.name} heals ${target.name} for ${healAmt}! (${e._healUses}/3)`, 'log-status');
            this.updateCombatUI();
            this.renderHUD();
            return;
          }
        }
      }
      let def = this.getTotalDef();
      let dmg = Math.round(e.atk * (0.8 + Math.random() * 0.4) - def * 0.4);
      dmg = Math.max(1, dmg);
      // Dodge from class + equipped gear + celestial bonusDodge
      const dodgeChance = this.getTotalDodge();
      if (dodgeChance > 0 && Math.random() < dodgeChance) {
        this.logCombat(`👻 DODGE! You evaded the attack!`, 'log-status');
        this.floatingDmg('DODGE', 'miss', 'player');
        this.combat.braceActive = false;
        s.ap = Math.min(s.maxAp, s.ap + 2);
        s._dodgesThisRun = (s._dodgesThisRun || 0) + 1;
        if (s._dodgesThisRun >= 20) this.unlockAchievement('dodge_20');
        this.updateCombatUI();
        if (s.hp <= 0) this.die();
        return;
      }
      // Tank: damage reduction (skills + advanced class + trait)
      const dmgReduce = (this.getAdvClassEffect('damageReduce') || 0)
        + (this.hasSkill('iron_will') ? 0.08 : 0)
        + (this.hasSkill('ironclad') ? 0.08 : 0)
        + (this.hasTrait('thick_skin') ? 0.10 : 0);
      if (dmgReduce) dmg = Math.max(1, Math.round(dmg * (1 - dmgReduce)));
      // Celestial: Gravity Pull — extra damage mitigation
      const celestialMitigate = this.getCelestialEffect('dmgMitigate');
      if (celestialMitigate > 0) dmg = Math.max(1, Math.round(dmg * (1 - celestialMitigate)));
      const originalDmg = dmg; // save pre-brace damage for counter calc
      if (this.combat.braceActive) { dmg = Math.ceil(dmg / 2); this.logCombat('🛡 Brace reduced damage!', 'log-status'); }
      // Brace counter-damage (Warlord/Dreadnought) — uses ORIGINAL damage + STR scaling
      const braceCounter = this.combat.braceActive ? (this.getAdvClassEffect('braceCounter') || 0) : 0;
      this.combat.braceActive = false;
      // Celestial: Astral Shield — death save
      const deathSaveChance = this.getCelestialEffect('deathSave');
      if (deathSaveChance > 0 && !this.combat.astralShieldUsed && s.hp - dmg <= 0 && Math.random() < deathSaveChance) {
        this.combat.astralShieldUsed = true;
        dmg = s.hp - 1; // survive at 1 HP
        this.logCombat(`🌟 ASTRAL SHIELD! Death's blow negated — survive at 1 HP!`, 'log-crit');
        AudioEngine.sfx.heal();
      }
      s.hp = Math.max(0, s.hp - dmg);
      this.combat._tookHit = true;
      AudioEngine.sfx.hit();
      this.logCombat(`${e.name} hits you for ${dmg}`, 'log-dmg');
      this.animSprite('enemy', 'attack'); this.animSprite('player', 'hit');
      this.floatingDmg(dmg, 'dmg', 'player');
      if (braceCounter > 0) {
        const strFloor = Math.round(s.str * 1.5);
        const cDmg = Math.max(strFloor, Math.round(originalDmg * braceCounter)) + strFloor;
        e.hp = Math.max(0, e.hp - cDmg);
        this.logCombat(`🗡 Counter-damage! ${e.name} takes ${cDmg}!`, 'log-crit');
      }
      // Juggernaut reflect + Celestial Nebula Shroud reflect
      const reflect = (this.getAdvClassEffect('reflect') || 0) + this.getCelestialEffect('reflect');
      if (reflect > 0) {
        const rDmg = Math.round(dmg * reflect);
        e.hp = Math.max(0, e.hp - rDmg);
        this.logCombat(`⚡ REFLECT! ${e.name} takes ${rDmg} damage!`, 'log-status');
      }
      if (e.status && Math.random() < e.status.chance) {
        this.applyStatusToPlayer(e.status.type);
        this.logCombat(STATUS_DEF[e.status.type].icon + ' You are ' + STATUS_DEF[e.status.type].label + 'ED!', 'log-status');
      }
    } else {
      this.logCombat(`⚡ ${e.name} is STUNNED — skips turn!`, 'log-status');
    }
    // slow penalty
    if (s.statuses && s.statuses.find(st => st.type === 'slow') && !this.getAdvClassEffect('immuneSlowStun')) {
      s.ap = Math.max(0, s.ap - 1);
      this.logCombat('🧊 SLOW reduces your AP!', 'log-status');
    }
    this.processStatusTick();
    if (!this.combat) return; // player died from DOT status tick — combat already ended
    // Life Bringer: full heal when HP drops to 20% or below
    if (this.getAdvClassEffect('combatRevive') && !this.combat.reviveUsed && s.hp > 0 && s.hp <= Math.ceil(s.maxHp * 0.20)) {
      this.combat.reviveUsed = true;
      s.hp = s.maxHp;
      AudioEngine.sfx.heal();
      this.logCombat(`✨ LIFE BRINGER activates! Full HP restored!`, 'log-crit');
    }
    // Regen Field skill: recover HP each round
    if (this.hasSkill('regen_field') && s.hp > 0) {
      const regenAmt = 3;
      s.hp = Math.min(s.maxHp, s.hp + regenAmt);
      this.logCombat(`💚 REGEN FIELD: +${regenAmt} HP`, 'log-heal');
    }
    // Life Tap: tick down regen from using consumables
    if ((s._lifeTapRegen || 0) > 0 && s.hp > 0) {
      s.hp = Math.min(s.maxHp, s.hp + 3);
      s._lifeTapRegen--;
      this.logCombat(`🩸 LIFE TAP regen: +3 HP (${s._lifeTapRegen} turns left)`, 'log-heal');
    }
    s.ap = Math.min(s.maxAp, s.ap + 2);
    this.updateCombatUI();
    if (s.hp <= 0) {
      // Phoenix: revive once
      if (this.getAdvClassEffect('phoenixRevive') && !this.combat.phoenixUsed) {
        this.combat.phoenixUsed = true;
        s.hp = Math.round(s.maxHp * 0.4);
        AudioEngine.sfx.heal();
        this.logCombat(`🦅 PHOENIX RISES! Revived with ${s.hp} HP!`, 'log-crit');
        this.updateCombatUI();
        return;
      }
      this.die();
      if (!this.combat) return; // player truly died, combat ended
    }
    if (e.hp <= 0) {
      const allDead = this.combat.enemies.every(en => en.hp <= 0);
      if (allDead) { this.winCombat(); return; }
      this._advanceToNextLiveEnemy();
      this.logCombat(`💀 Counter-blow finishes ${e.name}! ${this.combat.enemies.filter(en => en.hp > 0).length} foe(s) remain!`, 'log-crit');
      this.updateCombatUI();
    }
  },

  openCombatItem() {
    const el = document.getElementById('combat-item-list');
    if (el.style.display !== 'none') { el.style.display = 'none'; return; }
    const bag = this.state.bag;
    const usable = bag.map((it, i) => ({...it, _bagIdx:i}))
                      .filter(it => it.type === 'consumable' || it.type === 'throwable');
    if (usable.length === 0) { this.toast('No usable items!'); return; }
    el.style.display = 'block';
    el.innerHTML = usable.map(it => {
      let info = '';
      if (it.type === 'throwable') {
        info = it.shieldBurst ? '⚡ SHIELD BREAK' : it.aoe ? `💥 AOE ~${Math.round((it.dmgMult||0.6)*100)}% ATK` : `🎯 ~${Math.round((it.dmgMult||0.5)*100)}% ATK`;
        if (it.burn)   info += '+BURN';
        if (it.freeze) info += '+FREEZE';
        if (it.slow)   info += '+SLOW';
        return `<button class="btn" style="margin-bottom:4px;font-size:.72rem;border-color:#ff7744;background:rgba(255,119,68,.08)" onclick="G.useCombatItemByBagIdx(${it._bagIdx})">
          ${it.icon||'💥'} ${it.name} <small style="color:#ff9966;font-size:.55rem">${info}</small>
        </button>`;
      } else {
        info = it.heal ? `+${it.heal} HP` : it.ap ? `+${it.ap} AP` : it.radCure ? `-${it.radCure} RAD` : it.cure ? 'CURE STATUS' : '';
        return `<button class="btn" style="margin-bottom:4px;font-size:.72rem" onclick="G.useCombatItemByBagIdx(${it._bagIdx})">
          🧪 ${it.name} <small style="color:#88cc88;font-size:.55rem">${info}</small>
        </button>`;
      }
    }).join('');
  },

  useCombatItem(bagIdx) {
    const consumables = this.state.bag.filter(i => i.type === 'consumable');
    const item = consumables[bagIdx];
    if (!item) return;
    const realIdx = this.state.bag.findIndex(i => i === item);
    this.useCombatItemByBagIdx(realIdx);
  },

  useCombatItemByBagIdx(bagIdx) {
    const item = this.state.bag[bagIdx];
    if (!item) return;
    if (item.type === 'throwable') {
      this.useThrowableItem(item);
    } else {
      this.useConsumable(item);
    }
    // Decrement qty or remove entirely
    if ((item.qty || 1) > 1) { item.qty--; }
    else this.state.bag.splice(bagIdx, 1);
    document.getElementById('combat-item-list').style.display = 'none';
    this.updateCombatUI();
    this.save();
  },

  useThrowableItem(item) {
    const s = this.state;
    const baseAtk = this.getWeaponAtk();
    const enemy = this.combat.enemy;
    const aliveEnemies = this.combat.enemies.filter(e => e.hp > 0);
    AudioEngine.sfx.crit();

    if (item.shieldBurst) {
      // EMP Charge — shatters all shields
      let shattered = 0;
      aliveEnemies.forEach(e => { if (e._shieldHp > 0) { e._shieldHp = 0; shattered++; } });
      if (shattered > 0) this.logCombat(`⚡ EMP CHARGE — ${shattered} shield(s) SHATTERED!`, 'log-crit');
      else this.logCombat('⚡ EMP Charge — no shields to break!', 'log-status');
      if (item.slow) {
        aliveEnemies.forEach(e => { if (!e.statuses) e.statuses = []; e.statuses.push({type:'slow',turns:2}); });
        this.logCombat('⚡ All enemies SLOWED for 2 turns!', 'log-status');
      }
    } else if (item.aoe) {
      const dmg = Math.round(baseAtk * (item.dmgMult||0.6) * (0.8 + Math.random() * 0.4));
      aliveEnemies.forEach(e => { e.hp = Math.max(0, e.hp - dmg); });
      this.logCombat(`${item.icon||'💣'} ${item.name} hits ALL ${aliveEnemies.length} enemies for ${dmg}!`, 'log-crit');
      if (item.freeze) {
        aliveEnemies.forEach(e => { if (!e.statuses) e.statuses = []; e.statuses.push({type:'slow',turns:3}); });
        this.logCombat('❄ All enemies FROZEN!', 'log-status');
      }
    } else {
      const dmg = Math.round(baseAtk * (item.dmgMult||0.5) * (0.8 + Math.random() * 0.4));
      if (enemy) {
        enemy.hp = Math.max(0, enemy.hp - dmg);
        this.logCombat(`${item.icon||'🎯'} ${item.name} hits ${enemy.name} for ${dmg}!`, 'log-crit');
        if (item.burn) {
          if (!enemy.statuses) enemy.statuses = [];
          enemy.statuses.push({type:'burn',turns:3});
          this.logCombat(`🔥 ${enemy.name} is BURNING!`, 'log-status');
        }
      }
    }

    const allDead = this.combat.enemies.every(e => e.hp <= 0);
    if (allDead) { setTimeout(() => this.winCombat(), 200); return; }
    this._advanceToNextLiveEnemy();
  },

  useConsumable(item) {
    const s = this.state;
    if (item.heal) {
      let bonus = 1;
      if (this.hasSkill('pharmacist')) bonus = 1.30;
      if (this.hasTrait('field_medic')) bonus = Math.max(bonus, 1.30);
      const advHeal = this.getAdvClassEffect('healBonus');
      if (advHeal) bonus = Math.max(bonus, 1 + advHeal);
      const healed = Math.min(Math.round(item.heal * bonus), s.maxHp - s.hp);
      s.hp = Math.min(s.maxHp, s.hp + Math.round(item.heal * bonus));
      AudioEngine.sfx.heal();
      this.logCombat(`🧪 ${item.name} restored ${healed} HP`, 'log-heal');
    }
    if (item.ap) s.ap = Math.min(s.maxAp, s.ap + item.ap);
    if (item.radCure) {
      s.rad = Math.max(0, s.rad - item.radCure);
      AudioEngine.sfx.rad();
      this.toast(`☢ Radiation reduced by ${item.radCure}!`);
    }
    if (item.cure) {
      s.statuses = [];
      this.logCombat('✅ Status effects cleared!', 'log-status');
    }
    // Life Tap: using a heal item in combat triggers 2 turns of regen
    if (item.heal && this.hasSkill('life_tap') && this.combat) {
      s._lifeTapRegen = 2;
      this.logCombat('🩸 LIFE TAP: Regen 3 HP/turn for 2 turns!', 'log-heal');
    }
    this.renderHUD();
  },

  winCombat() {
    const s = this.state;
    const allEnemies = this.combat.enemies || [this.combat.enemy];
    const e = this.combat.enemy; // primary (for boss drop logic)

    // ── Immediate death visual: gray out enemy sprite so it doesn't "linger" ──
    const avatarEl = document.getElementById('enemy-avatar');
    if (avatarEl) avatarEl.classList.add('enemy-dying');
    const actionsEl = document.querySelector('.combat-actions');
    if (actionsEl) actionsEl.classList.add('locked');

    AudioEngine.stop();
    // Sum XP + caps across ALL enemies in squad
    let capGain = 0;
    let xpGain = 0;
    allEnemies.forEach(en => {
      let mult = 1;
      if (en.isBoss) mult = 3.0;
      else if (en.isMini) mult = 2.0;
      else if (en.elite) mult = 1.5;
      let ec = en.caps || 10;
      if (this.hasSkill('looter')) ec = Math.round(ec * 1.3);
      if (this.hasSkill('scrounger')) ec = Math.round(ec * 1.25);
      if (en.elite && this.hasSkill('capitalist')) ec = Math.round(ec * 1.6);
      capGain += ec;
      xpGain += Math.round((en.xp || 50) * mult);
    });
    s.caps += capGain;
    if (allEnemies.length > 1) {
      this.logCombat(`⚡ Squad defeated! +${xpGain}XP +${capGain}💰`, 'log-heal');
    } else {
      this.logCombat(`⚡ ${e.name} defeated! +${xpGain}XP +${capGain}💰`, 'log-heal');
    }
    // Adrenaline Rush: killing blow restores 2 AP
    if (this.hasSkill('adrenaline')) {
      s.ap = Math.min(s.maxAp, s.ap + 2);
      this.logCombat('⚡ ADRENALINE RUSH! +2 AP!', 'log-heal');
    }
    // Warmonger: killing blow restores 3 AP
    if (this.hasSkill('warmonger')) {
      s.ap = Math.min(s.maxAp, s.ap + 3);
      this.logCombat('⚔ WARMONGER! +3 AP!', 'log-heal');
    }
    // Track kills for NPC quests + death recap
    allEnemies.forEach(en => this.trackQuestKill(en.name));
    s.totalKills = (s.totalKills || 0) + allEnemies.length;
    // Achievement: special archetype kills
    allEnemies.forEach(en => {
      if (en.isHealer)    this.unlockAchievement('healer_kill');
      if (en.isBerserker && en._baseAtk && en.atk > en._baseAtk * 1.3) this.unlockAchievement('berserker_kill');
    });
    if (s.totalKills >= 1)   this.unlockAchievement('first_blood');
    if (s.totalKills >= 100) this.unlockAchievement('kills_100');
    if (s.bag && s.bag.length >= 30) this.unlockAchievement('items_30');
    if (s.caps >= 2000)      this.unlockAchievement('caps_2k');
    // Track no-hit combat
    if (!this.combat._tookHit) this.unlockAchievement('no_hit_win');
    const { r, c } = s.playerPos;
    const key = r + ',' + c;
    if (!s.cleared.includes(key)) s.cleared.push(key);

    // Track killed boss names to avoid repeats
    if (e.isBoss || e.isMini) {
      if (!s.killedBossNames) s.killedBossNames = [];
      if (!s.killedBossNames.includes(e.name)) s.killedBossNames.push(e.name);
    }

    // Bosses ALWAYS drop their unique item
    const uniqueDrop = this.getBossDrop(e.name);

    // Chance to drop an essence (for Artificer loot luck) from any enemy
    const essenceChance = e.isBoss ? 1.0 : e.isMini ? 0.7 : e.elite ? 0.4 : (e.danger >= 2 ? 0.25 : 0.12);
    if (Math.random() < essenceChance) {
      const essPool = ITEMS.filter(i => i.type === 'essence');
      if (essPool.length) {
        const ess = { ...essPool[Math.floor(Math.random() * essPool.length)] };
        this._addToStack(ess);
        if (!s.essenceCount) s.essenceCount = 0;
        s.essenceCount++;
        this.toast(`✦ Got ${ess.name}!`);
      }
    }

    // Chance to drop an imbue stone — rarer, only from harder enemies
    const imbueChance = e.isBoss ? 0.85 : e.isMini ? 0.5 : e.elite ? 0.25 : (e.danger >= 2 ? 0.08 : 0.02);
    if (Math.random() < imbueChance) {
      const imbuePool = ITEMS.filter(i => i.type === 'imbue_stone');
      if (imbuePool.length) {
        const stone = { ...imbuePool[Math.floor(Math.random() * imbuePool.length)] };
        this._addToStack(stone);
        this.toast(`⚗ Got ${stone.name}!`);
      }
    }

    if (e.isBoss) {
      s.bossesKilled = (s.bossesKilled || 0) + 1;
      s._bossStreak = (s._bossStreak || 0) + 1;
      this.unlockAchievement('boss_slayer');
      if (s._bossStreak >= 3) this.unlockAchievement('boss_streak_3');
      // Check territory cleared
      const terr = this.getCurrentTerritory();
      if (s.bossesKilled >= (terr.bossCount || 3)) {
        if (!s.territoriesCleared) s.territoriesCleared = [];
        if (!s.territoriesCleared.includes(terr.id)) s.territoriesCleared.push(terr.id);
        if (s.territoriesCleared.length >= (typeof TERRITORIES !== 'undefined' ? TERRITORIES.length : 6)) {
          this.unlockAchievement('all_clear');
        }
        this.gainXP(xpGain);
        allEnemies.forEach(en => this.checkBounties(en.name));
        if (uniqueDrop) s.bag.push(uniqueDrop);
        this.save();
        AudioEngine.sfx.win();
        if (uniqueDrop) this.toast(`🌟 Unique drop: ${uniqueDrop.name}!`);
        // Final territory = game win. Otherwise territory cleared toast + loot
        if (terr.id === 'apex_citadel') {
          setTimeout(() => this.showWin(), 600);
        } else {
          this.toast(`🏆 TERRITORY CLEARED: ${terr.name}! Next zone unlocked!`);
          const forcedT = 'legendary';
          // uniqueDrop already pushed to bag above — don't pass again
          setTimeout(() => this.showLoot(3, forcedT), 600);
        }
        return;
      }
    }
    this.gainXP(xpGain);
    allEnemies.forEach(en => this.checkBounties(en.name));
    this.save();

    // Ambush bonus loot hook
    if (this._ambushPending) {
      this._ambushPending = false;
      s._ambushWins = (s._ambushWins || 0) + 1;
      if (s._ambushWins >= 3) this.unlockAchievement('ambush_win');
      this.toast('⚠ AMBUSH CLEARED! Bonus loot awarded!', 1800);
      setTimeout(() => this.showLoot(2, 'rare'), 1800);
      return;
    }
    // Dungeon wave hook
    if (this._dungeonCombatHook && this._currentDungeon) {
      this._dungeonCombatHook = false;
      const dw = this._dungeonWave;
      const tw = this._currentDungeon.room.waves;
      if (dw < tw) {
        this.toast(`⚔ Wave ${dw}/${tw} cleared! Next wave incoming...`);
      }
      // Defer the next wave if any overlay is open OR loot screen is showing
      const luOverlay = document.getElementById('levelup-overlay');
      const cuOverlay = document.getElementById('class-upgrade-overlay');
      const lootScreen = document.getElementById('screen-loot');
      const anyBlocking = (luOverlay && luOverlay.classList.contains('show'))
                        || (cuOverlay && cuOverlay.classList.contains('show'))
                        || (lootScreen && lootScreen.classList.contains('active'));
      if (anyBlocking) {
        this._pendingDungeonWave = true;
      } else {
        this._pendingDungeonWave = true;
        setTimeout(() => {
          if (!this._pendingDungeonWave) return;
          this._pendingDungeonWave = false;
          this._runNextDungeonWave();
        }, 2500);
      }
      return;
    }

    // Bosses have a chance at celestial; mini-bosses at legendary+; elites at epic
    let forcedTier;
    if (e.isBoss)      forcedTier = Math.random() < 0.22 ? 'celestial' : 'legendary';
    else if (e.isMini) forcedTier = Math.random() < 0.08 ? 'celestial' : 'legendary';
    else if (e.elite)  forcedTier = Math.random() < 0.03 ? 'mythic'    : 'epic';
    else               forcedTier = undefined;
    this._lastCombatEnemy = e;
    setTimeout(() => this.showLootWithUnique(e.danger || 2, forcedTier, uniqueDrop), 600);
  },

  showLootWithUnique(danger, forcedTier, uniqueDrop) {
    this.showLoot(danger, forcedTier);
    if (uniqueDrop) {
      this.lootItems.unshift(uniqueDrop);
      this._renderLootItems();
      this.toast(`🌟 Unique boss drop: ${uniqueDrop.name}!`);
    }
  },

  die() {
    const s = this.state;
    // Reset boss streak on death
    s._bossStreak = 0;
    // Hardcore: No Second Wind, instant permadeath with special label
    if (s.hardcore) {
      AudioEngine.stop();
      AudioEngine.sfx.death && AudioEngine.sfx.death();
      localStorage.removeItem('wzSave_' + this.currentSlot);
      document.getElementById('hud').style.display = 'none';
      document.getElementById('go-title').textContent = '⚠ PERMADEATH';
      document.getElementById('go-title').style.color = 'var(--amber)';
      const terr = (typeof TERRITORIES !== 'undefined') ? TERRITORIES.find(t => t.id === s.territory) : null;
      const arch = (typeof ARCHETYPES !== 'undefined') ? ARCHETYPES.find(a => a.id === s.archetype) : null;
      const race = (typeof RACES !== 'undefined') ? RACES.find(r => r.id === s.race) : null;
      document.getElementById('go-sub').textContent = `${race ? race.name : ''} ${arch ? arch.name : ''} · HARDCORE · LV ${s.lv}`;
      const recap = document.getElementById('go-recap');
      if (recap) {
        const row = (icon, label, val) => `<div class="go-recap-row"><span class="go-recap-icon">${icon}</span><span class="go-recap-label">${label}</span><span class="go-recap-val">${val}</span></div>`;
        recap.innerHTML = row('⚠','Mode','HARDCORE PERMADEATH') + row('⚔','Level',`${s.lv}`) + row('💀','Enemies Killed',`${s.totalKills || 0}`) + row('🏆','Bosses Slain',`${s.bossesKilled || 0}`) + row('💰','Caps',`${s.caps}`);
      }
      this.combat = null;
      this.show('screen-gameover');
      return;
    }
    // Second Wind: revive once per map with 30% HP
    if (this.hasSkill('second_wind') && !this._secondWindUsed) {
      this._secondWindUsed = true;
      s.hp = Math.round(s.maxHp * 0.30);
      AudioEngine.sfx.heal();
      if (this.combat) {
        this.logCombat(`💨 SECOND WIND! Revived with ${s.hp} HP!`, 'log-crit');
        this.updateCombatUI();
      }
      this.renderHUD();
      return;
    }
    AudioEngine.stop();
    AudioEngine.sfx.death();
    localStorage.removeItem('wzSave_' + this.currentSlot);
    document.getElementById('hud').style.display = 'none';
    document.getElementById('go-title').textContent = 'YOU DIED';
    document.getElementById('go-title').style.color = 'var(--red)';
    const terr = (typeof TERRITORIES !== 'undefined') ? TERRITORIES.find(t => t.id === s.territory) : null;
    const arch = (typeof ARCHETYPES !== 'undefined') ? ARCHETYPES.find(a => a.id === s.archetype) : null;
    const race = (typeof RACES !== 'undefined') ? RACES.find(r => r.id === s.race) : null;
    const zoneName = terr ? `${terr.icon} ${terr.name}` : 'The Wasteland';
    const archName = arch ? arch.name : (s.archetype || 'Survivor');
    const raceName = race ? race.name : '';
    document.getElementById('go-sub').textContent = `${raceName} ${archName} · ${zoneName}`;
    const recap = document.getElementById('go-recap');
    if (recap) {
      const row = (icon, label, val) => `<div class="go-recap-row"><span class="go-recap-icon">${icon}</span><span class="go-recap-label">${label}</span><span class="go-recap-val">${val}</span></div>`;
      recap.innerHTML = `
        ${row('⚔', 'Level', `${s.lv}`)}
        ${row('💀', 'Enemies Killed', `${s.totalKills || 0}`)}
        ${row('🏆', 'Bosses Slain', `${s.bossesKilled || 0}`)}
        ${row('💰', 'Caps Accumulated', `${s.caps}`)}
        ${row('📦', 'Items Collected', `${s.bag ? s.bag.length : 0} in bag`)}
        ${row('🗺', 'Zones Cleared', `${(s.territoriesCleared || []).length} / ${typeof TERRITORIES !== 'undefined' ? TERRITORIES.length : 6}`)}`;
    }
    this.combat = null;
    this.show('screen-gameover');
  },

  showWin() {
    AudioEngine.stop();
    localStorage.removeItem('wzSave_' + this.currentSlot);
    document.getElementById('hud').style.display = 'none';
    const s = this.state;
    const totalBosses = TERRITORIES.reduce((sum, t) => sum + t.bossCount, 0);
    const pLv = s.prestigeLevel || 0;
    const hardcoreTag = s.hardcore ? ' · ⚠ HARDCORE' : '';
    document.getElementById('win-sub').textContent =
      `LV ${s.lv} · ${s.xp} XP · ${s.caps} caps\nAll ${totalBosses} bosses defeated${hardcoreTag}`;
    // Render prestige section
    const prestigeDiv = document.getElementById('win-prestige');
    if (prestigeDiv) {
      const PRESTIGE_OPTIONS = [
        {id:'skills',   icon:'📚', label:'Keep 2 Skills',      desc:'Start with your 2 highest skills already learned'},
        {id:'caps',     icon:'💰', label:'+1500 Starting Caps', desc:'Begin the next run with 1500 bonus caps'},
        {id:'stats',    icon:'⭐', label:'Head Start (LV 5)',   desc:'Start at level 5 with boosted base stats'},
        {id:'weapon',   icon:'⚔', label:'Keep Best Weapon',    desc:'Your highest-ATK weapon carries forward'},
      ];
      prestigeDiv.innerHTML = `
        <div style="margin:14px 0 8px;font-family:var(--font-title);color:var(--amber);font-size:.8rem;letter-spacing:.08em">— PRESTIGE ${pLv + 1} —</div>
        <div style="font-size:.65rem;color:#b8a080;margin-bottom:10px">Choose a bonus to carry into your next run. Everything else resets.</div>
        <div id="prestige-opts" style="display:grid;gap:6px;margin-bottom:10px">
          ${PRESTIGE_OPTIONS.map(o => `
            <button class="prestige-opt-btn" onclick="G._selectPrestige('${o.id}', this)" data-pid="${o.id}">
              <span style="font-size:1.1rem">${o.icon}</span>
              <div style="text-align:left;flex:1">
                <div style="font-family:var(--font-title);font-size:.7rem;color:var(--amber)">${o.label}</div>
                <div style="font-size:.58rem;color:#b8a080">${o.desc}</div>
              </div>
            </button>`).join('')}
        </div>
        <button class="btn amber" id="btn-prestige-confirm" style="max-width:260px;opacity:.4;pointer-events:none" onclick="G.confirmPrestige()">🔱 PRESTIGE &amp; CONTINUE</button>`;
    }
    if (s.hardcore) this.unlockAchievement('hardcore_win');
    this.show('screen-win');
  },

  _selectPrestige(id, btn) {
    document.querySelectorAll('.prestige-opt-btn').forEach(b => b.classList.remove('sel'));
    btn.classList.add('sel');
    this._pendingPrestige = id;
    const conf = document.getElementById('btn-prestige-confirm');
    if (conf) { conf.style.opacity = '1'; conf.style.pointerEvents = ''; }
    AudioEngine.sfx.equip && AudioEngine.sfx.equip();
  },

  confirmPrestige() {
    if (!this._pendingPrestige) return;
    const s = this.state;
    const pBonus = this._pendingPrestige;
    const pLv = (s.prestigeLevel || 0) + 1;
    // Store prestige info for newGame to pick up
    this._prestigeCarryover = { bonus: pBonus, level: pLv, fromState: s };
    this.unlockAchievement('prestige_1');
    this._pendingPrestige = null;
    // Start fresh run
    this.currentSlot = this.currentSlot || 1;
    this.newGame();
  },

  logCombat(msg, cls = '') {
    if (!this._combatLog) this._combatLog = [];
    this._combatLog.push({ msg, cls });
    if (this._combatLog.length > 4) this._combatLog.shift();
    this._renderCombatLog();
  },

  _renderCombatLog() {
    const log = document.getElementById('combat-log');
    if (!log) return;
    const entries = this._combatLog || [];
    // Pad to 4 slots (empty rows at top)
    const padded = [...Array(4 - entries.length).fill(null), ...entries];
    log.innerHTML = padded.map((e, i) => {
      const age = i; // 0=oldest shown, 3=newest
      const opacity = e ? (0.38 + age * 0.205).toFixed(2) : 0;
      const cls = e ? e.cls : '';
      const text = e ? e.msg : '';
      return `<div class="clog-line ${cls}" style="opacity:${opacity}">${text ? `<span class="clog-dot"></span><span class="clog-text">${text}</span>` : ''}</div>`;
    }).join('');
  },

  // ─── LOOT ───
  showLoot(danger, forcedTier) {
    danger = danger || 1;
    const s = this.state;
    let count = 1 + Math.floor(Math.random() * 3);
    if (this.hasSkill('scavmaster')) count++;
    if (this.hasSkill('hoarder')) count += 2;
    if (this.getAmuletBonus('loot')) count += this.getAmuletBonus('loot');
    const advLoot = this.getAdvClassEffect('extraLoot') || 0;
    count += advLoot;
    // Finder skill: 15% chance of +1 bonus item
    if (this.hasSkill('finder') && Math.random() < 0.15) count++;

    // Only real gear goes through applyTier — consumables, throwables, materials dropped separately
    const pool = ITEMS.filter(i => !['material','throwable','consumable'].includes(i.type));
    const loot = [];
    // Gut Feeling: guarantee at least one rare (or better) item
    const gutFeeling = this.hasSkill('gut_feeling');
    for (let i = 0; i < count; i++) {
      const base = { ...pool[Math.floor(Math.random() * pool.length)] };
      let tierOverride = forcedTier;
      if (!tierOverride && danger >= 3 && Math.random() < .1) tierOverride = 'rare';
      // Gut Feeling: first item is at least rare
      if (!tierOverride && gutFeeling && i === 0) tierOverride = 'rare';
      const tier = this.rollTier(tierOverride);
      loot.push(this.applyTier(base, tier));
    }
    // Materials always drop (1, or 3 with resourceful)
    const matPool = ITEMS.filter(i => i.type === 'material');
    const matCount = 1 + (this.hasSkill('resourceful') ? 2 : 0);
    for (let i = 0; i < matCount; i++) loot.push({ ...matPool[Math.floor(Math.random() * matPool.length)] });
    // Consumables: 40% chance of a bonus stimpak/consumable (plain, no tier)
    const consumPool = ITEMS.filter(i => i.type === 'consumable');
    if (consumPool.length && Math.random() < 0.40) {
      loot.push({ ...consumPool[Math.floor(Math.random() * consumPool.length)] });
    }
    // Throwables: 25% chance of a bonus throwable (plain, no tier)
    const throwPool = ITEMS.filter(i => i.type === 'throwable');
    if (throwPool.length && Math.random() < 0.25) {
      loot.push({ ...throwPool[Math.floor(Math.random() * throwPool.length)] });
    }

    this.lootItems = loot;
    this._renderLootItems();
    this.show('screen-loot');
    // Update enemy banner if we have a last combat enemy
    const bannerEl = document.getElementById('loot-enemy-banner');
    if (bannerEl) {
      const lastE = this._lastCombatEnemy;
      if (lastE) {
        const sprite = this.getEnemyAvatar(lastE);
        bannerEl.style.display = 'flex';
        bannerEl.innerHTML = `
          <img class="loot-enemy-sprite" src="${sprite}" onerror="this.style.display='none'">
          <div>
            <div class="loot-enemy-name">${lastE.isBoss ? '💀 ' : ''}${lastE.name}</div>
            <div class="loot-enemy-sub">Defeated · ${loot.length} item${loot.length!==1?'s':''} dropped</div>
          </div>`;
      } else {
        bannerEl.style.display = 'none';
      }
    }
    this.renderHUD();
  },

  // Returns true if item is "junk" — ONLY gray (common) tier gear qualifies.
  // Consumables, essences, and materials are NEVER junk regardless of tier.
  _isJunk(it) {
    if (it.type === 'consumable' || it.type === 'throwable' || it.type === 'essence' || it.type === 'imbue_stone' || it.type === 'material') return false;
    return !it.tier || it.tier === 'common';
  },

  // Salvage value: materials + small caps return
  _salvageValue(it) {
    return Math.max(2, Math.round((it.val || 5) * 0.25));
  },

  // How many materials a salvage yields (1–3 based on item value)
  _salvageMats(it) {
    const v = it.val || 5;
    return v >= 200 ? 3 : v >= 80 ? 2 : 1;
  },

  // Adds a stackable item (material/consumable/essence/imbue_stone) to the bag,
  // merging into an existing same-name stack via qty field.
  // Non-stackable items are pushed directly.
  _addToStack(item) {
    const STACKABLE = ['material','consumable','throwable','essence','imbue_stone'];
    if (!STACKABLE.includes(item.type)) {
      this.state.bag.push(item);
      return;
    }
    const existing = this.state.bag.find(b => b.type === item.type && b.name === item.name);
    if (existing) {
      existing.qty = (existing.qty || 1) + (item.qty || 1);
    } else {
      this.state.bag.push({ ...item, qty: item.qty || 1 });
    }
  },

  // Groups bag items by name for display.
  // Items with a qty field (true stacks) are represented by a single group.
  _buildBagGroups(visibleItems) {
    const isStackable = it => ['material','consumable','throwable','essence','imbue_stone'].includes(it.type);
    const groups = [];
    const seen = new Set();
    visibleItems.forEach(({ it, i }) => {
      if (seen.has(i)) return;
      seen.add(i);
      if (!isStackable(it)) {
        groups.push({ count: 1, item: it, indices: [i], locked: !!it.locked });
        return;
      }
      // True qty stack — one bag slot represents N items
      if (it.qty && it.qty > 0) {
        groups.push({ count: it.qty, item: it, indices: [i], locked: !!it.locked });
        return;
      }
      // Legacy fallback: scan for same-name duplicates (old saves without qty)
      const indices = [i];
      visibleItems.forEach(({ it: other, i: oi }) => {
        if (!seen.has(oi) && isStackable(other) && other.name === it.name) {
          indices.push(oi);
          seen.add(oi);
        }
      });
      const allLocked = indices.every(idx => !!this.state.bag[idx]?.locked);
      groups.push({ count: indices.length, item: it, indices, locked: allLocked });
    });
    return groups;
  },

  toggleBagGroupLock(gi) {
    const grp = this._bagGroups?.[gi];
    if (!grp) return;
    const newLocked = !grp.locked;
    grp.indices.forEach(i => { if (this.state.bag[i]) this.state.bag[i].locked = newLocked; });
    this.save();
    this.buildInvTab();
  },

  salvageBagGroup(gi) {
    const grp = this._bagGroups?.[gi];
    if (!grp) return;
    const s = this.state;
    const toRemove = grp.indices.filter(i => s.bag[i] && !s.bag[i].locked).sort((a,b) => b - a);
    let mats = 0;
    toRemove.forEach(i => {
      mats += this._salvageMats(s.bag[i]);
      s.bag.splice(i, 1);
    });
    if (mats > 0) {
      const matPool = ITEMS.filter(i => i.type === 'material');
      for (let m = 0; m < mats; m++) {
        if (matPool.length) this._addToStack({ ...matPool[Math.floor(Math.random() * matPool.length)] });
      }
      this.toast(`⚙ +${mats} crafting material${mats !== 1 ? 's' : ''} added to bag`);
    }
    this.save();
    this.buildInvTab();
  },

  // Groups identical stackable items (materials, consumables, essences, junk) into one display row.
  // Non-stackable items (weapons, armor, unique gear) get their own row always.
  _buildLootGroups() {
    const isStackable = it => ['material','consumable','throwable','essence','imbue_stone'].includes(it.type) || this._isJunk(it);
    const groups = [];
    const seen = new Set();
    this.lootItems.forEach((it, idx) => {
      if (seen.has(idx)) return;
      seen.add(idx);
      if (!isStackable(it)) {
        groups.push({ count: 1, item: it, indices: [idx], locked: !!it.locked });
        return;
      }
      // Collect all same-named stackable items
      const indices = [idx];
      this.lootItems.forEach((other, oi) => {
        if (!seen.has(oi) && isStackable(other) && other.name === it.name) {
          indices.push(oi);
          seen.add(oi);
        }
      });
      const allLocked = indices.every(i => this.lootItems[i].locked);
      groups.push({ count: indices.length, item: it, indices, locked: allLocked });
    });
    return groups;
  },

  _renderLootItems() {
    const el = document.getElementById('loot-items');
    const BAG_MAX = 60;
    const bagUsed = this.state.bag.length;
    const bagFree = BAG_MAX - bagUsed;
    const bagFull = bagFree <= 0;
    // Update loot title
    const lootTitle = document.querySelector('#screen-loot .loot-title');
    if (lootTitle) {
      const bagColor = bagFree <= 5 ? 'var(--red)' : bagFree <= 15 ? 'var(--amber)' : 'var(--blue)';
      lootTitle.innerHTML = `📦 LOOT &nbsp;<span style="font-size:.6rem;color:${bagColor};font-family:var(--font-mono)">🎒 ${bagUsed}/${BAG_MAX} bag slots</span>${bagFull ? `&nbsp;<span style="font-size:.55rem;color:var(--red);font-family:var(--font-mono)">BAG FULL</span>` : ''}`;
    }
    const manageBagHint = document.getElementById('loot-manage-bag-hint');
    if (manageBagHint) manageBagHint.style.display = bagFull ? 'block' : 'none';

    // Build stacked groups and cache for action handlers
    this._lootGroups = this._buildLootGroups();
    const sellMult = 1 + this.getSellBonus();

    el.innerHTML = this._lootGroups.map((grp, gi) => {
      const it = grp.item;
      const n = grp.count;
      const isJunk = this._isJunk(it);
      const rainbowCls = it.tierRainbow ? ' rainbow-text' : '';
      const isUnique = it.tier === 'unique';
      const isCelestial = it.tier === 'celestial';
      const nameColor = isCelestial ? '' : `color:${isJunk ? '#aaaaaa' : (it.tierColor || 'var(--green)')}`;
      const lockedStyle = grp.locked ? 'border-color:var(--amber)!important;box-shadow:2px 2px 0 var(--amber)' : '';
      const countBadge = n > 1 ? `<span style="color:var(--amber);font-family:var(--font-mono)"> ×${n}</span>` : '';
      const junkBadge  = isJunk && !it.tierLabel ? `<span style="font-size:.5rem;opacity:.55"> [Junk]</span>` : '';
      const lockBadge  = grp.locked ? `<span style="font-size:.6rem;color:var(--amber)"> 🔒</span>` : '';
      const uniqueBadge = isUnique ? `<span style="font-size:.5rem;color:#D4884A;font-family:var(--font-title);letter-spacing:.05em"> ◆UNIQUE</span>` : '';

      // Build compact single subtitle line: stat · flavor · compare · value
      const subParts = [this.itemStatLine(it)];
      if (it.skill && it.skillDesc) subParts.push(`<span style="color:var(--amber);font-style:italic">✦ ${it.skillDesc}</span>`);
      if (isCelestial && it.celestialPerk) subParts.push(`<span style="color:#cc99ff">★ ${it.celestialPerk.name}</span>`);
      const cmp = (['weapon','armor','amulet','belt','ring'].includes(it.type)) ? this._compareToEquipped(it) : '';
      if (cmp) subParts.push(cmp);
      subParts.push(`<span class="item-val">${(it.val||0)*n}💰</span>`);
      const subLine = subParts.join('<span style="color:var(--dim)"> · </span>');

      // Totals for stacked actions
      const sellTotal = Math.round((it.val || 0) * n * 0.5 * sellMult);
      const matsTotal = this._salvageMats(it) * n;
      const typeIcons = {weapon:'⚔',armor:'🛡',amulet:'💎',consumable:'🧪',throwable:'💣',material:'⚙',belt:'🎗',ring:'💍',essence:'✨',imbue_stone:'⚗'};
      const typeIcon = typeIcons[it.type] || '📦';
      const TIER_COLS = {
        junk:'#888888',common:'#99cc99',uncommon:'#c8a040',rare:'#4499ff',
        epic:'#cc44ff',legendary:'#FFD700',unique:'#D4884A',mythic:'#ff4444',celestial:'#ccccff',
      };
      const lootTierCol = isJunk ? TIER_COLS.junk : (TIER_COLS[it.tier] || TIER_COLS.common);
      const lootStatLine = this.itemStatLine(it);
      const lootPerkLine = (isCelestial && it.celestialPerk) ? `<div class="loot-item-perk">★ ${it.celestialPerk.name}</div>` : '';
      const lootSkillLine = (it.skill && it.skillDesc) ? `<div class="loot-item-perk" style="color:var(--amber)">✦ ${it.skillDesc}</div>` : '';
      const tierLabel = isJunk ? 'JUNK' : (it.tier || 'COMMON').toUpperCase();
      return `
        <div class="loot-item-card${isCelestial ? ' celestial-drop-row' : ''}" id="loot-grp-${gi}" style="--tier-col:${lootTierCol}">
          <div class="loot-type-icon" style="border-color:${lootTierCol}44">${typeIcon}</div>
          <div class="loot-item-body" onclick="G.showItemDetail(${gi},'loot')">
            <div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap">
              <div class="loot-item-name${rainbowCls}" style="${isCelestial ? '' : `color:${it.tierColor || 'var(--green)'}`}">${isUnique ? '◆ ' : isCelestial ? '★ ' : it.skill ? '🌟 ' : ''}${it.name}${countBadge}</div>
              <div class="loot-item-tier" style="color:${lootTierCol};border-color:${lootTierCol}55">${tierLabel}</div>
              ${grp.locked ? '<span style="font-size:.65rem">🔒</span>' : ''}
            </div>
            ${lootStatLine ? `<div class="loot-item-stats">${lootStatLine}</div>` : ''}
            ${lootPerkLine}${lootSkillLine}
          </div>
          <div class="loot-item-actions-v2">
            <button class="slot-btn${grp.locked ? ' amber lock-active' : ''}" onclick="G.toggleLootGroupLock(${gi})" style="font-size:.75rem;min-width:26px;padding:1px 3px">${grp.locked ? '🔒' : '🔓'}</button>
            <button class="slot-btn" onclick="G.takeLootGroup(${gi})" style="font-size:.55rem">${n > 1 ? `TAKE×${n}` : 'TAKE'}</button>
          </div>
        </div>`;
    }).join('');
  },

  toggleLootGroupLock(gi) {
    const grp = this._lootGroups?.[gi];
    if (!grp) return;
    const newLocked = !grp.locked; // toggle: if all locked → unlock all, else lock all
    grp.indices.forEach(i => { if (this.lootItems[i]) this.lootItems[i].locked = newLocked; });
    this._renderLootItems();
  },

  takeLootGroup(gi) {
    const grp = this._lootGroups?.[gi];
    if (!grp) return;
    const BAG_MAX = 60;
    const s = this.state;
    const STACKABLE = ['material','consumable','throwable','essence','imbue_stone'];
    const isStackable = STACKABLE.includes(grp.item.type);
    const canMerge = isStackable && s.bag.some(b => b.type === grp.item.type && b.name === grp.item.name);
    // Stackable items that can merge into an existing stack never need a new slot
    const available = canMerge ? grp.count : BAG_MAX - s.bag.length;
    if (available <= 0) {
      this.toast(`🎒 BAG FULL — use MANAGE BAG to make room!`);
      return;
    }
    // Take as many as fit, highest indices first to avoid splice drift
    const toTake = grp.indices.slice(0, available).sort((a, b) => b - a);
    const taken = toTake.length;
    const name = grp.item.name;
    toTake.forEach(i => { this._addToStack(this.lootItems[i]); });
    // Remove taken indices (already sorted descending)
    toTake.forEach(i => { this.lootItems.splice(i, 1); });
    this.save();
    AudioEngine.sfx.buy();
    this.toast(taken < grp.count ? `Took ${taken}× ${name} (bag full after ${taken})` : `Took ${taken > 1 ? taken+'× ' : ''}${name}!`);
    if (this.lootItems.length === 0) {
      this.show('screen-map'); this.renderMap(); this.renderHUD();
    } else {
      this._renderLootItems(); this.renderHUD();
    }
  },

  sellLootGroup(gi) {
    const grp = this._lootGroups?.[gi];
    if (!grp) return;
    const sellMult = 1 + this.getSellBonus();
    const totalCaps = Math.round((grp.item.val || 5) * 0.5 * sellMult) * grp.count;
    const label = grp.count > 1 ? `${grp.count}× ${grp.item.name}` : grp.item.name;
    this.showEventWarning(
      '💰 SELL?',
      `Sell ${label} for ${totalCaps} caps? Cannot be undone.`,
      `💰 SELL FOR ${totalCaps} CAPS`,
      () => {
        const indices = (this._lootGroups?.[gi]?.indices || grp.indices).slice().sort((a, b) => b - a);
        indices.forEach(i => { this.lootItems.splice(i, 1); });
        this.state.caps += totalCaps;
        this.save();
        AudioEngine.sfx.buy();
        this.toast(`Sold ${label} for ${totalCaps} caps!`);
        if (this.lootItems.length === 0) {
          this.show('screen-map'); this.renderMap(); this.renderHUD();
        } else {
          this._renderLootItems(); this.renderHUD();
        }
      }
    );
  },

  salvageLootGroup(gi) {
    const grp = this._lootGroups?.[gi];
    if (!grp) return;
    const matsEach  = this._salvageMats(grp.item);
    const matsTotal = matsEach * grp.count;
    const label = grp.count > 1 ? `${grp.count}× ${grp.item.name}` : grp.item.name;
    this.showEventWarning(
      '⚙ SALVAGE?',
      `Break down ${label} into ${matsTotal} crafting material${matsTotal !== 1 ? 's' : ''}? No caps. Cannot be undone.`,
      `⚙ SALVAGE FOR ${matsTotal} MAT${matsTotal !== 1 ? 'S' : ''}`,
      () => {
        const indices = (this._lootGroups?.[gi]?.indices || grp.indices).slice().sort((a, b) => b - a);
        const matPool = ITEMS.filter(i => i.type === 'material');
        let added = 0;
        if (matPool.length) {
          for (let m = 0; m < matsTotal; m++) {
            this._addToStack({ ...matPool[Math.floor(Math.random() * matPool.length)] });
            added++;
          }
        }
        indices.forEach(i => { this.lootItems.splice(i, 1); });
        this.save();
        AudioEngine.sfx.equip();
        this.toast(`Salvaged ${label} → ${added} mat${added !== 1 ? 's' : ''} added to bag!`);
        if (this.lootItems.length === 0) {
          this.show('screen-map'); this.renderMap(); this.renderHUD();
        } else {
          this._renderLootItems(); this.renderHUD();
        }
      }
    );
  },

  // Legacy single-item stubs (kept for safety — grouped renderer uses group methods above)
  takeLootItem(idx)    { this.takeLootGroup(this._lootGroups?.findIndex(g => g.indices.includes(idx)) ?? -1); },
  sellLootItem(idx)    { this.sellLootGroup(this._lootGroups?.findIndex(g => g.indices.includes(idx)) ?? -1); },
  salvageLootItem(idx) { this.salvageLootGroup(this._lootGroups?.findIndex(g => g.indices.includes(idx)) ?? -1); },
  toggleLootLock(idx)  { this.toggleLootGroupLock(this._lootGroups?.findIndex(g => g.indices.includes(idx)) ?? -1); },

  collectAll() {
    const BAG_MAX = 60;
    const s = this.state;
    const available = BAG_MAX - s.bag.length;
    if (available <= 0) {
      this.toast(`🎒 BAG FULL (${BAG_MAX} max) — sell or salvage something first!`);
      return;
    }
    const toTake = this.lootItems.splice(0, available);
    toTake.forEach(it => this._addToStack(it));
    this.save();
    AudioEngine.sfx.buy();
    if (this.lootItems.length > 0) {
      this.toast(`Items collected! (${this.lootItems.length} left — bag full)`);
      this._renderLootItems();
      this.renderHUD();
    } else {
      this.toast('All items collected!');
      this.show('screen-map');
      this.renderMap();
      this.renderHUD();
    }
  },

  salvageAll() {
    if (!this.lootItems.length) return;
    const s = this.state;
    const unlocked = this.lootItems.filter(it => !it.locked);
    if (!unlocked.length) { this.toast('All items are 🔒 locked! Tap 🔒 on items to unlock them first.'); return; }
    const lockedCount = this.lootItems.length - unlocked.length;
    let totalMats = 0;
    unlocked.forEach(it => { totalMats += this._salvageMats(it); });
    this.showEventWarning(
      '⚙ SALVAGE UNLOCKED LOOT?',
      `Break down ${unlocked.length} unlocked item(s) into ~${totalMats} crafting materials (no caps)?${lockedCount ? ` ${lockedCount} locked item(s) will be kept.` : ''} Cannot be undone! Use SELL for caps instead.`,
      `⚙ SALVAGE ${unlocked.length} FOR ~${totalMats} MATS`,
      () => {
        let matCount = 0;
        const matPool = ITEMS.filter(i => i.type === 'material');
        unlocked.forEach(it => {
          const n = this._salvageMats(it);
          for (let m = 0; m < n; m++) {
            if (matPool.length) {
              this._addToStack({ ...matPool[Math.floor(Math.random() * matPool.length)] });
              matCount++;
            }
          }
        });
        this.lootItems = this.lootItems.filter(it => it.locked);
        this.save();
        AudioEngine.sfx.equip();
        this.toast(`Salvaged ${unlocked.length} item(s): +${matCount} mat${matCount !== 1 ? 's' : ''}!`);
        if (this.lootItems.length === 0) {
          this.show('screen-map'); this.renderMap(); this.renderHUD();
        } else {
          this._renderLootItems(); this.renderHUD();
        }
      }
    );
  },

  sellAll() {
    if (!this.lootItems.length) return;
    const s = this.state;
    const sellMult = 1 + this.getSellBonus();
    const junk = this.lootItems.filter(it => !it.locked && this._isJunk(it));
    if (!junk.length) { this.toast('No junk loot here! (Gray common-tier gear only)'); return; }
    const keptCount = this.lootItems.length - junk.length;
    let totalCaps = 0;
    junk.forEach(it => { totalCaps += Math.round((it.val || 5) * 0.5 * sellMult); });
    if (totalCaps === 0) { this.toast('Nothing to sell!'); return; }
    this.showEventWarning(
      '💰 SELL JUNK LOOT?',
      `Sell ${junk.length} junk item(s) for ${totalCaps} caps?${keptCount ? ` ${keptCount} item(s) (non-junk or locked) will be kept.` : ''} This CANNOT be undone!`,
      `💰 SELL ${junk.length} JUNK FOR ${totalCaps} CAPS`,
      () => {
        s.caps += totalCaps;
        this.lootItems = this.lootItems.filter(it => !this._isJunk(it) || it.locked);
        this.save();
        AudioEngine.sfx.buy();
        this.toast(`Sold ${junk.length} junk item(s) for ${totalCaps} caps!`);
        if (this.lootItems.length === 0) {
          this.show('screen-map'); this.renderMap(); this.renderHUD();
        } else {
          this._renderLootItems(); this.renderHUD();
        }
      }
    );
  },

  // ─── LOOT SCREEN: MANAGE BAG MODAL ───
  openLootBagModal() {
    const modal = document.getElementById('loot-bag-modal');
    if (!modal) return;
    this._renderLootBagModal();
    modal.style.display = 'flex';
  },

  closeLootBagModal() {
    const modal = document.getElementById('loot-bag-modal');
    if (modal) modal.style.display = 'none';
    this._renderLootItems();
    this.renderHUD();
  },

  _renderLootBagModal() {
    const s = this.state;
    const BAG_MAX = 60;
    const bagUsed = s.bag.length;
    const bagFree = BAG_MAX - bagUsed;
    const bagColor = bagFree <= 5 ? 'var(--red)' : bagFree <= 15 ? 'var(--amber)' : 'var(--green)';
    const statsEl = document.getElementById('loot-bag-modal-stats');
    if (statsEl) statsEl.innerHTML = `<span style="color:${bagColor}">🎒 ${bagUsed}/${BAG_MAX} — ${bagFree} free</span>`;
    const container = document.getElementById('loot-bag-modal-items');
    if (!container) return;
    if (s.bag.length === 0) {
      container.innerHTML = `<div style="text-align:center;color:#8a7a5a;padding:20px;font-size:.72rem">Bag is empty.</div>`;
      return;
    }
    const sellMult = 1 + this.getSellBonus();
    container.innerHTML = s.bag.map((it, i) => {
      const isJunk = this._isJunk(it);
      const sellPrice = Math.round((it.val || 5) * 0.5 * sellMult);
      const itemColor = isJunk ? '#aaaaaa' : (it.tierColor || 'var(--green)');
      const locked = it.locked;
      return `
        <div class="item-row" style="${locked ? 'opacity:.55;border-color:var(--amber)!important' : ''}">
          <div style="flex:1;min-width:0">
            <div class="item-name" style="color:${itemColor}">${it.name}${locked ? ' 🔒' : ''}</div>
            <div class="item-stat">${this.itemStatLine(it)}</div>
          </div>
          <div class="loot-item-actions">
            <div class="item-val">${it.val || 0}💰</div>
            ${!locked ? `
              <button class="slot-btn red" onclick="G._lootBagDrop(${i})" title="Drop item — gone forever">DROP</button>
              <button class="slot-btn amber" onclick="G._lootBagSell(${i})" title="Quick-sell for ${sellPrice} caps">💰${sellPrice}</button>
            ` : `<div style="font-size:.55rem;color:var(--amber);text-align:right">LOCKED<br>in bag</div>`}
          </div>
        </div>`;
    }).join('');
  },

  _lootBagDrop(i) {
    const it = this.state.bag[i];
    if (!it || it.locked) { this.toast('🔒 Locked items cannot be dropped from here.'); return; }
    this.state.bag.splice(i, 1);
    this.save();
    AudioEngine.sfx.move();
    this.toast(`Dropped: ${it.name}`);
    this._renderLootBagModal();
    this.renderHUD();
  },

  _lootBagSell(i) {
    const it = this.state.bag[i];
    if (!it || it.locked) { this.toast('🔒 Locked items cannot be sold from here.'); return; }
    const price = Math.round((it.val || 5) * 0.5 * (1 + this.getSellBonus()));
    this.state.bag.splice(i, 1);
    this.state.caps += price;
    this.save();
    AudioEngine.sfx.buy();
    this.toast(`Sold ${it.name} for ${price} caps!`);
    this._renderLootBagModal();
    this.renderHUD();
  },

  leaveLoot() {
    this.lootItems = [];
    this.show('screen-map');
    this.renderMap();
    this.renderHUD();
    if (this._pendingDungeonWave) {
      this._pendingDungeonWave = false;
      setTimeout(() => this._runNextDungeonWave(), 1200);
    }
  },

  // ─── TOWN ───
  openTown(isCity) {
    const townArtEl = document.getElementById('town-art-img');
    if (townArtEl) townArtEl.src = TOWN_ART;
    document.getElementById('town-title').textContent = isCity ? '🏙 CITY' : '🏘 TOWN';
    this.shopItems = this.genShop(isCity ? 6 : 4);
    this.renderShop();
    this.renderBountyBoard();
    this.updateRadRecoverUI();
    this.updateArtificerUI();
    document.getElementById('town-scene').style.display = 'flex';
    document.getElementById('town-panel').style.display = 'none';
    this.show('screen-town');
    this.renderHUD();
  },

  updateRadRecoverUI() {
    const s = this.state;
    const btn25 = document.getElementById('btn-rad-25');
    const btn100 = document.getElementById('btn-rad-100');
    if (btn25)  btn25.disabled  = s.caps < 20 || s.rad === 0;
    if (btn100) btn100.disabled = s.caps < 50 || s.rad === 0;
    const radInfo = document.getElementById('rad-info');
    if (radInfo) radInfo.textContent = `Current RAD: ${s.rad}/${s.maxRad}`;
  },

  recoverRad(amount, cost) {
    const s = this.state;
    if (s.caps < cost) { this.toast('Not enough caps!'); return; }
    if (s.rad === 0) { this.toast('No radiation to treat!'); return; }
    s.caps -= cost;
    const reduced = Math.min(s.rad, amount);
    s.rad = Math.max(0, s.rad - amount);
    this.save();
    this.renderHUD();
    this.updateRadRecoverUI();
    AudioEngine.sfx.heal();
    this.toast(`☢ Radiation cleared by ${reduced}!`);
  },

  genShop(count) {
    const pool = ITEMS.filter(i => i.type !== 'material' && i.type !== 'throwable');
    const items = [];
    // Black Market: shop has at least 1 legendary tier item
    const blackMarket = this.hasSkill('black_market');
    let forcedLeg = blackMarket;
    while (items.length < count) {
      const base = { ...pool[Math.floor(Math.random() * pool.length)] };
      let tier;
      if (forcedLeg) { tier = 'legendary'; forcedLeg = false; }
      else tier = this.rollTier();
      // Shops never stock celestial — that tier is boss-drop only
      if (tier === 'celestial') tier = 'mythic';
      const it = this.applyTier(base, tier);
      if (!items.find(x => x.name === it.name)) items.push(it);
    }
    return items;
  },

  renderShop() {
    const s = this.state;
    const discount = this.hasSkill('trader') ? 0.80 : 1.0;
    document.getElementById('shop-list').innerHTML = this.shopItems.map((it, i) => {
      const price = Math.round(it.val * discount);
      const isCelestial = it.tier === 'celestial';
      const nameColor = isCelestial ? '' : `color:${it.tierColor || 'var(--green)'}`;
      const nameStyle = isCelestial ? 'background:linear-gradient(90deg,#ff4444,#ff8c00,#ffe000,#44ff66,#00bbff,#8844ff,#ff44cc);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent' : nameColor;
      const prefix = isCelestial ? '★ ' : it.tier === 'unique' ? '◆ ' : it.skill ? '🌟 ' : '';
      return `<div class="shop-row" style="flex-direction:column;align-items:stretch;padding:6px 8px;gap:3px">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:6px">
          <div style="font-size:.7rem;font-family:var(--font-title);${nameStyle}">${prefix}${it.name}</div>
          <div style="display:flex;align-items:center;gap:6px;flex-shrink:0">
            <div style="color:var(--amber);font-size:.65rem">${price}💰</div>
            <button class="shop-buy-btn" ${s.caps < price ? 'disabled' : ''} onclick="G.buyItem(${i})">BUY</button>
          </div>
        </div>
        <div style="color:var(--blue);font-size:.58rem;line-height:1.3">${this.itemStatLine(it)}</div>
        ${it.skill ? `<div style="color:#cc88ff;font-size:.55rem">✦ ${it.skillDesc}</div>` : ''}
      </div>`;
    }).join('');
  },

  buyItem(i) {
    const s = this.state;
    const discount = this.hasSkill('trader') ? 0.80 : 1.0;
    const it = this.shopItems[i];
    const price = Math.round(it.val * discount);
    if (s.caps < price) return;
    s.caps -= price;
    this._addToStack({ ...it });
    this.shopItems.splice(i, 1);
    this.save();
    this.renderShop();
    this.renderHUD();
    AudioEngine.sfx.buy();
    this.toast('Bought: ' + it.name);
  },

  heal(amount, cost) {
    const s = this.state;
    if (s.caps < cost) { this.toast('Not enough caps!'); return; }
    s.caps -= cost;
    s.hp = Math.min(s.maxHp, s.hp + amount);
    this.save();
    this.renderHUD();
    AudioEngine.sfx.heal();
    this.toast('Healed!');
  },

  toggleTownPanel(which) {
    const panel = document.getElementById('town-panel');
    const titles = { medic: '⚕ MEDIC', shop: '🏪 SHOP', forge: '✦ ARTIFICER', bounty: '📋 BOUNTIES' };
    document.querySelectorAll('.tp-section').forEach(s => s.style.display = 'none');
    const target = document.getElementById('town-p-' + which);
    if (target) target.style.display = 'block';
    document.getElementById('town-panel-title').textContent = titles[which] || which;
    panel.style.display = 'flex';
    document.getElementById('town-scene').style.display = 'none';
    if (which === 'bounty') {
      document.getElementById('bounty-board-section').style.display = 'block';
      this.renderBountyBoard();
    }
  },

  closeTownPanel() {
    document.getElementById('town-panel').style.display = 'none';
    document.getElementById('town-scene').style.display = 'flex';
  },

  leaveTown() { this.show('screen-map'); this.renderMap(); this.renderHUD(); },

  // ─── BOUNTIES ───
  genBounties() {
    const s = this.state;
    if (!s.bounties) s.bounties = [];
    if (s.bounties.filter(b => !b.done).length >= 2) return;
    const pool = BOUNTY_TEMPLATES.filter(t => !s.bounties.find(b => b.target === t.target && !b.done));
    if (!pool.length) return;
    const tmpl = pool[Math.floor(Math.random() * pool.length)];
    s.bounties.push({ ...tmpl, progress: 0, done: false, id: Date.now() });
  },

  renderBountyBoard() {
    const s = this.state;
    if (!s.bounties) s.bounties = [];
    this.genBounties(); this.genBounties();
    const el = document.getElementById('bounty-board-list');
    if (!el) return;
    const active = s.bounties.filter(b => !b.done);
    const done   = s.bounties.filter(b =>  b.done).slice(-3);
    let html = '';
    if (!active.length) {
      html = '<div style="font-size:.68rem;color:#8a7a5a;padding:10px;text-align:center;border:1px dashed #362a1a;border-radius:8px">No contracts posted. Check back later.</div>';
    }
    active.forEach(b => {
      const pct = Math.min(100, (b.progress / b.count) * 100);
      const full = b.progress >= b.count;
      html += `<div class="bounty-poster${full ? ' done' : ''}" style="margin-bottom:10px">
        <div class="bounty-poster-header">
          <div class="bounty-skull">${full ? '✅' : '💀'}</div>
          <div style="flex:1">
            <div class="bounty-name">KILL ${b.count}× ${b.target.toUpperCase()}</div>
            <div class="bounty-meta">${full ? 'CONTRACT FULFILLED' : 'DEAD OR ALIVE'}</div>
          </div>
          <span class="bounty-reward-badge">+${b.reward}💰</span>
        </div>
        <div class="bounty-progress-row">
          <span style="color:${full ? 'var(--green)' : 'var(--amber)'}">
            ${full ? '✅ DONE' : `${b.progress} / ${b.count} kills`}
          </span>
          <span style="font-size:.6rem;color:#886600">${pct.toFixed(0)}%</span>
        </div>
        <div class="bounty-progress-bar">
          <div class="bounty-progress-fill${full ? ' complete' : ''}" style="width:${pct}%"></div>
        </div>
      </div>`;
    });
    if (done.length) {
      html += '<div style="font-size:.65rem;color:#5a4a3a;margin-top:8px;margin-bottom:4px;font-family:var(--font-title)">PAST CONTRACTS:</div>';
      done.forEach(b => {
        html += `<div style="font-size:.62rem;color:#5a4a3a;padding:2px 0">✓ ${b.count}× ${b.target} — +${b.reward}💰 collected</div>`;
      });
    }
    el.innerHTML = html;
  },

  checkBounties(enemyName) {
    const s = this.state;
    if (!s.bounties) s.bounties = [];
    const base = enemyName.replace('⚡ ELITE ', '').replace(' BOSS', '');
    s.bounties.filter(b => !b.done && b.target === base).forEach(b => {
      b.progress++;
      if (b.progress >= b.count) {
        b.done = true;
        let reward = b.reward;
        if (this.hasSkill('bounty_hunter')) reward = Math.round(reward * 1.25);
        s.caps += reward;
        AudioEngine.sfx.buy();
        this.bountyCompleteToast(b.target, reward);
        const doneCount = s.bounties.filter(bx => bx.done).length;
        if (doneCount >= 5) this.unlockAchievement('bounty_5');
      } else {
        this.toast(`🎯 ${b.target}: ${b.progress}/${b.count} kills`, 1400);
      }
    });
  },

  bountyCompleteToast(target, reward) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = `💀 BOUNTY COMPLETE — ${target.toUpperCase()} — +${reward}💰`;
    el.style.background = 'linear-gradient(90deg,#8b4000,#cc6600,#ff9900)';
    el.style.color = '#fff';
    el.style.fontSize = '1.1rem';
    el.style.padding = '12px 24px';
    el.style.borderRadius = '16px';
    el.style.boxShadow = '0 0 20px rgba(255,150,0,.8),0 4px 0 rgba(0,0,0,.5)';
    el.style.opacity = '1';
    clearTimeout(this._bountyToastTimer);
    this._bountyToastTimer = setTimeout(() => {
      el.style.opacity = '0';
      setTimeout(() => {
        el.style.background = '';
        el.style.color = '';
        el.style.fontSize = '';
        el.style.padding = '';
        el.style.borderRadius = '';
        el.style.boxShadow = '';
      }, 400);
    }, 3200);
  },

  // ─── ITEM DETAIL POPUP ───
  showItemDetail(gi, source) {
    const grp = source === 'loot' ? this._lootGroups?.[gi] : this._bagGroups?.[gi];
    if (!grp) return;
    const it = grp.item;
    const n  = grp.count;
    const isUnique    = it.tier === 'unique';
    const isCelestial = it.tier === 'celestial';
    const nameColor   = isCelestial ? 'background:linear-gradient(90deg,#ff4444,#ff8c00,#ffe000,#44ff66,#00bbff,#8844ff,#ff44cc);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent'
                      : `color:${it.tierColor || 'var(--green)'}`;
    const prefix = isUnique ? '◆ ' : isCelestial ? '★ ' : it.skill ? '🌟 ' : '';
    const countStr = n > 1 ? ` <span style="color:var(--amber);font-family:var(--font-mono)">×${n}</span>` : '';
    document.getElementById('item-detail-name').innerHTML =
      `<span style="${nameColor}">${prefix}${it.name}</span>${countStr}`;

    const rows = [];

    // ── Stats block ──
    const statLines = [];
    const typeColor = '#b8a080';
    if (it.slotDesc) statLines.push(`<span style="color:${typeColor}">${it.slotDesc}</span>`);
    else if (it.type === 'armor' && it.slot) {
      const sn = {chest:'Chest Armor',head:'Head Armor',arms:'Arm Armor',legs:'Leg Armor',shoes:'Shoes'};
      statLines.push(`<span style="color:${typeColor}">${sn[it.slot] || it.slot}</span>`);
    } else if (it.type === 'belt') statLines.push(`<span style="color:${typeColor}">Utility Belt</span>`);
    else if (it.type === 'ring') statLines.push(`<span style="color:${typeColor}">Ring</span>`);
    else if (it.type === 'weapon') statLines.push(`<span style="color:${typeColor}">Weapon</span>`);
    else if (it.type === 'amulet') statLines.push(`<span style="color:${typeColor}">Amulet</span>`);
    if (it.type === 'consumable') {
      if (it.heal)    statLines.push(`<span style="color:#66cc66">HEAL +${it.heal} HP</span>`);
      if (it.ap)      statLines.push(`<span style="color:#a8c4d4">AP +${it.ap}</span>`);
      if (it.radCure) statLines.push(`<span style="color:#c8a040">RAD −${it.radCure}</span>`);
      if (it.cure)    statLines.push(`<span style="color:#66cc66">CURES ALL STATUS EFFECTS</span>`);
    } else if (it.type === 'throwable') {
      statLines.push(`<span style="color:#b8a080">Combat Throwable — use from item menu in battle</span>`);
      if (it.aoe)       statLines.push(`<span style="color:#ff7744">💥 AOE</span> <span style="color:#cc6633">hits all enemies</span>`);
      if (it.dmgMult)   statLines.push(`<span style="color:#ff9966">DAMAGE ${Math.round(it.dmgMult * 100)}% ATK</span>`);
      if (it.burn)      statLines.push(`<span style="color:#ff6600">BURN on hit</span>`);
      if (it.freeze)    statLines.push(`<span style="color:#88ccff">FREEZE on hit</span>`);
      if (it.slow)      statLines.push(`<span style="color:#aaccff">SLOW on hit</span>`);
      if (it.shieldBurst) statLines.push(`<span style="color:#ffe000">SHATTERS SHIELDS</span>`);
      if (it.desc)      statLines.push(`<span style="color:#a8c4d4">${it.desc}</span>`);
    } else if (it.type === 'material') {
      statLines.push(`<span style="color:#aaaaaa">Crafting Material</span>`);
    } else if (it.type === 'essence') {
      statLines.push(`<span style="color:#cc99ff">Essence</span>`);
    } else if (it.type === 'imbue_stone') {
      const bonus = it.imbueBonus?.label || '';
      statLines.push(`<span style="color:#ff9900">⚗ Imbue Stone${bonus ? ' — ' + bonus : ''}</span>`);
    } else {
      if (it.atk)    statLines.push(`ATK <span style="color:#66cc66">+${it.atk}</span>`);
      if (it.def)    statLines.push(`DEF <span style="color:#a8c4d4">+${it.def}</span>`);
      if (it.crit)   statLines.push(`CRIT <span style="color:#ff9900">${Math.round(it.crit*100)}%</span>`);
      if (it.bleed)  statLines.push(`BLEED <span style="color:#ff4444">${Math.round(it.bleed*100)}%</span>`);
      if (it.dodge)  statLines.push(`DODGE <span style="color:#a8c4d4">${Math.round(it.dodge*100)}%</span>`);
      if (it.resist) statLines.push(`RES <span style="color:#cc99ff">${Math.round(it.resist*100)}%</span>`);
      if (it.heal)   statLines.push(`HEAL <span style="color:#66cc66">+${it.heal}</span>`);
      if (it.poison) statLines.push(`POISON <span style="color:#88ff44">${Math.round(it.poison*100)}%</span>`);
      if (it.burn)   statLines.push(`BURN <span style="color:#ff6600">${Math.round(it.burn*100)}%</span>`);
      if (it.stun)   statLines.push(`STUN <span style="color:#ffff44">${Math.round(it.stun*100)}%</span>`);
      if (it.shock)  statLines.push(`SHOCK <span style="color:#00ddff">${Math.round(it.shock*100)}%</span>`);
      // Bonus stats
      if (it.bonus) {
        const b = it.bonus;
        if (b.atk)       statLines.push(`+ATK <span style="color:#66cc66">+${b.atk}</span>`);
        if (b.def)       statLines.push(`+DEF <span style="color:#a8c4d4">+${b.def}</span>`);
        if (b.ap)        statLines.push(`+AP <span style="color:#a8c4d4">+${b.ap}</span>`);
        if (b.crit)      statLines.push(`+CRIT <span style="color:#ff9900">+${Math.round(b.crit*100)}%</span>`);
        if (b.lifesteal) statLines.push(`LIFESTEAL <span style="color:#ff4488">${Math.round(b.lifesteal*100)}%</span>`);
        if (b.dodge)     statLines.push(`+DODGE <span style="color:#a8c4d4">+${Math.round(b.dodge*100)}%</span>`);
        if (b.resist)    statLines.push(`+RES <span style="color:#cc99ff">+${Math.round(b.resist*100)}%</span>`);
        if (b.loot)      statLines.push(`+LOOT LUCK <span style="color:#ffe000">+${b.loot}</span>`);
        if (b.heal)      statLines.push(`+HEAL POWER <span style="color:#66cc66">+${b.heal}</span>`);
      }
    }
    if (statLines.length) {
      rows.push(`<div class="item-detail-row">
        <div class="item-detail-label">STATS</div>
        <div class="item-detail-stat">${statLines.join(' &nbsp;·&nbsp; ')}</div>
      </div>`);
    }

    // ── Celestial statuses ──
    if (isCelestial && it.celestialStatuses?.length) {
      const ss = it.celestialStatuses.map(s => `<span style="color:#cc99ff">${s.type.toUpperCase()} ${Math.round(s.chance*100)}%</span>`).join(' &nbsp;·&nbsp; ');
      rows.push(`<div class="item-detail-row">
        <div class="item-detail-label">CELESTIAL EFFECTS</div>
        <div class="item-detail-stat">${ss}</div>
      </div>`);
    }

    // ── Skill ──
    if (it.skill && it.skillDesc) {
      const skillColor = isUnique ? '#D4884A' : 'var(--amber)';
      rows.push(`<div class="item-detail-skill">
        <div class="item-detail-label" style="color:${skillColor}">✦ ${isUnique ? 'UNIQUE SKILL' : 'ACTIVE SKILL'}</div>
        <div style="color:${skillColor};line-height:1.6">${it.skillDesc}</div>
      </div>`);
    }

    // ── Celestial perk ──
    if (isCelestial && it.celestialPerk) {
      rows.push(`<div class="item-detail-perk">
        <div class="item-detail-label" style="color:#cc99ff">★ CELESTIAL PERK — ${it.celestialPerk.name}</div>
        <div style="color:#ddbbff;line-height:1.6">${it.celestialPerk.desc}</div>
      </div>`);
    }

    // ── Compare vs equipped ──
    if (['weapon','armor','amulet','belt','ring'].includes(it.type)) {
      const cmp = this._compareToEquipped(it, true);
      if (cmp) rows.push(`<div class="item-detail-cmp">${cmp}</div>`);
    }

    // ── Value ──
    rows.push(`<div style="text-align:right;font-size:.6rem;color:var(--amber);font-family:var(--font-mono);padding-top:2px">
      VALUE: ${(it.val || 0) * n}💰 &nbsp;·&nbsp; SELL: ${Math.round((it.val||0)*n*0.5*(1+this.getSellBonus()))}💰
    </div>`);

    document.getElementById('item-detail-body').innerHTML = rows.join('');
    const modal = document.getElementById('item-detail-modal');
    modal.style.display = 'flex';
  },

  closeItemDetail() {
    document.getElementById('item-detail-modal').style.display = 'none';
  },

  // ─── ITEM LOCKING ───
  toggleLock(i) {
    const s = this.state;
    if (!s.bag[i]) return;
    s.bag[i].locked = !s.bag[i].locked;
    this.save();
    this.buildInvTab();
  },

  // ─── INVENTORY ───
  _compareToEquipped(it, alwaysOpen = false, targetSlot = null) {
    const s = this.state;
    let slot;
    if (targetSlot) {
      // Caller knows the exact destination slot — use it directly
      slot = targetSlot;
    } else if (it.type === 'weapon') {
      slot = s.equip.mainHand ? 'mainHand' : (s.equip.offHand ? 'offHand' : null);
    } else if (it.type === 'amulet') slot = 'amulet';
    else if (it.type === 'belt') slot = 'belt';
    else if (it.type === 'ring') slot = s.equip.ring1 ? 'ring1' : (s.equip.ring2 ? 'ring2' : null);
    else if (it.type === 'armor') slot = it.slot;
    if (!slot) return '';
    const eq = s.equip[slot];
    if (!eq) return '';
    const diffs = [];
    const addDiff = (label, aVal, bVal, pct) => {
      const a = aVal || 0, b = bVal || 0;
      if (a === 0 && b === 0) return;
      const diff = b - a;
      if (diff === 0) return;
      const better = diff > 0;
      const sign = diff > 0 ? '+' : '';
      const fmt = pct ? `${sign}${Math.round(diff * 100)}%` : `${sign}${diff}`;
      diffs.push(`<span style="color:${better ? '#c8a040' : '#ff5555'}">${label} ${fmt}</span>`);
    };
    addDiff('ATK', eq.atk, it.atk);
    addDiff('DEF', eq.def, it.def);
    addDiff('CRIT', eq.crit, it.crit, true);
    addDiff('DODGE', eq.dodge, it.dodge, true);
    addDiff('RES', eq.resist, it.resist, true);
    addDiff('BLEED', eq.bleed, it.bleed, true);
    addDiff('HEAL', eq.heal, it.heal);
    addDiff('ATK', eq.bonus?.atk, it.bonus?.atk);
    addDiff('DEF', eq.bonus?.def, it.bonus?.def);
    addDiff('AP', eq.bonus?.ap, it.bonus?.ap);
    addDiff('CRIT', eq.bonus?.crit, it.bonus?.crit, true);
    addDiff('LIFESTEAL', eq.bonus?.lifesteal, it.bonus?.lifesteal, true);
    addDiff('DODGE', eq.bonus?.dodge, it.bonus?.dodge, true);
    addDiff('HEAL', eq.bonus?.heal, it.bonus?.heal);
    const vsLabel = `<span style="color:${eq.tierColor||'var(--green)'}">${eq.name}</span>`;
    const openAttr = alwaysOpen ? ' open' : '';
    if (!diffs.length) return `<details class="inv-cmp"${openAttr}><summary>vs ${vsLabel} <span style="color:#665544">— same stats</span></summary></details>`;
    const upCount   = diffs.filter(d => d.includes('#c8a040')).length;
    const downCount = diffs.filter(d => d.includes('#ff5555')).length;
    const summaryHint = [
      upCount   ? `<span style="color:#c8a040">▲${upCount}</span>`   : '',
      downCount ? `<span style="color:#ff5555">▼${downCount}</span>` : '',
    ].filter(Boolean).join(' ');
    return `<details class="inv-cmp"${openAttr}><summary>vs ${vsLabel} ${summaryHint}</summary><div class="inv-cmp-body">${diffs.join(' ')}</div></details>`;
  },

  buildInvTab() {
    const s = this.state;
    // Ensure new slots exist on old saves
    if (!s.equip.shoes)    s.equip.shoes    = null;
    if (!s.equip.belt)     s.equip.belt     = null;
    if (!s.equip.ring1)    s.equip.ring1    = null;
    if (!s.equip.ring2)    s.equip.ring2    = null;
    if (!('mainHand' in s.equip)) s.equip.mainHand = null;
    if (!('offHand'  in s.equip)) s.equip.offHand  = null;
    if (!('_invFilter' in this)) this._invFilter = 'all';
    const slots = ['mainHand','offHand','head','chest','arms','legs','shoes','amulet','belt','ring1','ring2'];
    const sellMult = 1 + this.getSellBonus();

    // ── Equipped slots → sticky top panel (visual grid) ──
    const SLOT_ICONS = {
      mainHand:'⚔', offHand:'🛡', head:'⛑', chest:'🧥', arms:'🥊',
      legs:'👖', shoes:'👟', amulet:'💎', belt:'🎗', ring1:'💍', ring2:'💍',
    };
    let slotsHtml = `<div style="padding:6px 8px 4px">
      <div class="inv-title" style="font-size:.58rem;margin-bottom:5px">⚔ EQUIPPED <span style="font-size:.44rem;color:var(--dim)">(tap to swap)</span></div>
      <div class="inv-eq-grid">`;
    slots.forEach(sl => {
      const item = s.equip[sl];
      const label = SLOT_LABELS[sl] || sl.toUpperCase();
      const slotIcon = SLOT_ICONS[sl] || '📦';
      const itemRainbowCls = (item && item.tierRainbow) ? ' rainbow-text' : '';
      slotsHtml += `<div id="slot-row-${sl}" class="inv-eq-slot ${item ? 'slot-filled' : ''}" onclick="G.openSlotPicker('${sl}')">
        <div class="inv-eq-icon">${slotIcon}</div>
        <div class="inv-eq-info">
          <div class="inv-eq-label">${label}</div>
          ${item
            ? `<div class="inv-eq-name ${itemRainbowCls}" style="${item.tierRainbow ? '' : `color:${item.tierColor || 'var(--green)'}`}">${item.name}</div>
               <div class="inv-eq-stat">${this.itemStatLine(item)}</div>`
            : `<div class="inv-eq-empty">— empty —</div>`
          }
        </div>
        ${item ? `<button style="flex-shrink:0;background:none;border:none;color:rgba(255,80,80,.6);font-size:.75rem;padding:2px;line-height:1;cursor:pointer" onclick="event.stopPropagation();G.unequip('${sl}')">✕</button>` : ''}
      </div>`;
    });
    slotsHtml += `</div></div>`;
    document.getElementById('inv-slots-panel').innerHTML = slotsHtml;

    // ── Bag (filter + items) → scrollable bottom panel ──
    let html = `<div style="padding:4px 10px 12px">`;
    // ── Filter bar ──
    const FILTERS = [
      { id:'all',       label:'ALL',       color:'var(--green)' },
      { id:'junk',      label:'JUNK',      color:'#aaaaaa' },
      { id:'uncommon',  label:'UNCOMMON',  color:'#c8a040' },
      { id:'rare',      label:'RARE',      color:'#4499ff' },
      { id:'epic',      label:'EPIC',      color:'#cc44ff' },
      { id:'legendary', label:'LGND',      color:'#FFD700' },
      { id:'unique',    label:'UNIQUE',    color:'#D4884A' },
      { id:'mythic',    label:'MYTHIC',    color:'#ff2222' },
      { id:'celestial', label:'CLSTL',     color:'#ccccff' },
    ];
    const lockedCount = s.bag.filter(it => it.locked).length;
    html += `<div class="inv-bag-title">🎒 BAG (${s.bag.length} items${lockedCount ? ' · 🔒'+lockedCount+' locked' : ''})</div>`;
    html += `<div class="inv-filter-bar">`;
    FILTERS.forEach(f => {
      const active = this._invFilter === f.id;
      if (f.id === 'celestial') {
        const activeSty = active ? 'background:rgba(136,68,255,.18);border-color:#aa66ff;' : '';
        html += `<button class="inv-filter-btn rainbow-text" style="${activeSty}" onclick="G._invFilter='${f.id}';G.buildInvTab()">${f.label}</button>`;
      } else {
        const activeSty = active ? `background:${f.color}28;border-color:${f.color};` : '';
        html += `<button class="inv-filter-btn" style="color:${f.color};${activeSty}" onclick="G._invFilter='${f.id}';G.buildInvTab()">${f.label}</button>`;
      }
    });
    html += `</div>`;

    // ── Bag items (filtered, grouped by name for stackables) ──
    const visibleItems = s.bag.map((it, i) => ({ it, i })).filter(({ it }) => {
      if (this._invFilter === 'all') return true;
      if (this._invFilter === 'junk') return this._isJunk(it);
      return it.tier === this._invFilter;
    });

    this._bagGroups = this._buildBagGroups(visibleItems);

    if (!this._bagGroups.length) {
      const emptyMsg = s.bag.length === 0 ? 'Bag is empty.' : 'No items in this category.';
      html += `<div style="font-size:.65rem;color:#8a7a5a;padding:8px">${emptyMsg}</div>`;
    }
    this._bagGroups.forEach((grp, gi) => {
      const it = grp.item;
      const n  = grp.count;
      const firstIdx = grp.indices[0];
      const isLocked = grp.locked;
      const isJunk   = this._isJunk(it);
      const canEquip = ['weapon','armor','amulet','belt','ring'].includes(it.type);
      const cmpHtml  = canEquip ? this._compareToEquipped(it) : '';
      const bagRainbow = it.tierRainbow ? ' rainbow-text' : '';
      const bagUnique = it.tier === 'unique';
      const bagCelestial = it.tier === 'celestial';
      const bagItemColor = bagCelestial ? '' : `color:${isJunk ? '#aaaaaa' : (it.tierColor || 'var(--green)')}`;
      const countBadge = n > 1 ? `<span style="color:var(--amber);font-family:var(--font-mono);font-size:.65rem"> ×${n}</span>` : '';
      // Type icon
      const bagTypeIcons = {weapon:'⚔',armor:'🛡',amulet:'💎',consumable:'🧪',material:'⚙',belt:'🎗',ring:'💍',essence:'✨',imbue_stone:'⚗'};
      const bagTypeIcon = bagTypeIcons[it.type] || '📦';
      // Tier badge config
      const TIER_BAD = {
        junk:{col:'#888888',bg:'rgba(136,136,136,.1)'},
        common:{col:'#99cc99',bg:'rgba(100,180,100,.1)'},
        uncommon:{col:'#c8a040',bg:'rgba(200,160,64,.1)'},
        rare:{col:'#4499ff',bg:'rgba(68,153,255,.1)'},
        epic:{col:'#cc44ff',bg:'rgba(200,68,255,.1)'},
        legendary:{col:'#FFD700',bg:'rgba(255,215,0,.1)'},
        unique:{col:'#D4884A',bg:'rgba(212,136,74,.1)'},
        mythic:{col:'#ff4444',bg:'rgba(255,68,68,.1)'},
        celestial:{col:'#ccccff',bg:'rgba(180,180,255,.1)'},
      };
      const tierBad = TIER_BAD[isJunk ? 'junk' : (it.tier || 'common')];
      const tierLabel = isJunk ? 'JUNK' : (it.tier || 'common').toUpperCase();
      // Subline
      const statLine = this.itemStatLine(it);
      const skillLine = (it.skill && it.skillDesc) ? `<div class="bag-item-sub" style="color:var(--amber)">✦ ${it.skillDesc}</div>` : '';
      const perkLine = (bagCelestial && it.celestialPerk) ? `<div class="bag-item-sub" style="color:#cc99ff">★ ${it.celestialPerk.name}</div>` : '';

      html += `<div class="bag-item-v2${isLocked ? ' bag-item-locked' : ''}${bagUnique ? ' bag-item-unique' : ''}${bagCelestial ? ' bag-item-celestial' : ''}" style="--tier-col:${tierBad.col}">
        <div class="bag-type-icon" style="background:${tierBad.bg};border-color:${tierBad.col}44">${bagTypeIcon}</div>
        <div class="bag-item-content" onclick="G.showItemDetail(${gi},'bag')">
          <div class="bag-item-name-row">
            <div class="bag-item-name ${bagRainbow}" style="${bagCelestial ? '' : `color:${isJunk ? '#aaaaaa' : (it.tierColor || 'var(--green)')}`}">${isLocked ? '🔒 ' : ''}${bagUnique ? '◆ ' : ''}${bagCelestial ? '★ ' : ''}${it.name}${countBadge}</div>
            <div class="bag-item-tier-badge" style="color:${tierBad.col};border-color:${tierBad.col}55;background:${tierBad.bg}">${tierLabel}</div>
          </div>
          ${statLine ? `<div class="bag-item-stats">${statLine}</div>` : ''}
          ${skillLine}${perkLine}
          ${cmpHtml ? `<div style="font-size:.52rem;margin-top:1px">${cmpHtml}</div>` : ''}
        </div>
        <div class="bag-actions-v2">
          <button class="slot-btn${isLocked ? ' lock-active' : ''}" onclick="G.toggleBagGroupLock(${gi})" style="min-width:26px;padding:1px 3px;font-size:.75rem">${isLocked ? '🔒' : '🔓'}</button>
          ${it.type === 'weapon'
            ? `<button class="slot-btn" onclick="G.equip(${firstIdx},'mainHand')" style="font-size:.55rem;padding:2px 5px">MH</button><button class="slot-btn" onclick="G.equip(${firstIdx},'offHand')" style="font-size:.55rem;padding:2px 5px">OH</button>`
            : canEquip ? `<button class="slot-btn" onclick="G.equip(${firstIdx})" style="font-size:.55rem">EQUIP</button>` : ''
          }
          ${it.type === 'imbue_stone' ? `<button class="slot-btn amber" onclick="G.openImbue(${firstIdx})" style="font-size:.55rem">⚗IMBUE</button>` : ''}
          ${it.type === 'consumable' ? `<button class="slot-btn amber" onclick="G.useItemFromBag(${firstIdx})" style="font-size:.55rem">${n > 1 ? `USE×${n}` : 'USE'}</button>` : ''}
          ${it.type === 'throwable' ? `<span style="font-size:.5rem;color:#ff7744;opacity:.7;letter-spacing:.03em">⚔ COMBAT</span>` : ''}
        </div>
      </div>`;
    });
    html += `</div>`;
    document.getElementById('inv-bag-panel').innerHTML = html;
  },

  equip(i, forceSlot = null) {
    const s = this.state;
    const it = s.bag[i];
    if (!it) return;
    let slot;
    if (it.type === 'weapon') {
      slot = forceSlot || (!s.equip.mainHand ? 'mainHand' : 'offHand');
    }
    else if (it.type === 'amulet') slot = 'amulet';
    else if (it.type === 'belt') slot = 'belt';
    else if (it.type === 'ring') {
      slot = forceSlot || (!s.equip.ring1 ? 'ring1' : 'ring2');
    }
    else if (it.type === 'armor' && it.slot === 'shoes') slot = 'shoes';
    else slot = it.slot;
    if (!slot) return;
    if (s.equip[slot]) s.bag.push(s.equip[slot]);
    s.equip[slot] = it;
    s.bag.splice(i, 1);
    if (it.bonus && it.bonus.ap) s.ap = Math.min(s.maxAp, s.ap + it.bonus.ap);
    this.save();
    this.buildInvTab();
    this.renderHUD();
    AudioEngine.sfx.equip();
    const slotLabel = slot === 'mainHand' ? ' → Main Hand' : slot === 'offHand' ? ' → Off Hand' : slot === 'ring1' || slot === 'ring2' ? ' → Ring' : '';
    this.toast(`Equipped ${it.name}${slotLabel}`);
  },

  unequip(slot) {
    const s = this.state;
    if (!s.equip[slot]) return;
    const it = s.equip[slot];
    s.bag.push(it);
    s.equip[slot] = null;
    this.save();
    this.buildInvTab();
    this.renderHUD();
    this.toast(`Unequipped ${it.name}`);
  },

  // ─── SLOT GEAR PICKER ───
  openSlotPicker(slot) {
    const s = this.state;
    this._activeSlotPicker = slot;
    const ARMOR_SLOTS = ['head','chest','arms','legs','shoes'];
    const compatible = s.bag.map((it, i) => ({ it, i })).filter(({ it }) => {
      if (slot === 'mainHand' || slot === 'offHand') return it.type === 'weapon';
      if (slot === 'amulet') return it.type === 'amulet';
      if (slot === 'belt')   return it.type === 'belt';
      if (slot === 'ring1' || slot === 'ring2') return it.type === 'ring';
      if (ARMOR_SLOTS.includes(slot)) return it.type === 'armor' && it.slot === slot;
      return false;
    });
    const slotLabel = (SLOT_LABELS[slot] || slot.toUpperCase()).replace(/^[^\s]+\s*/, '').trim() || slot.toUpperCase();
    let html = `<div class="picker-header">
      <div class="picker-title">⚡ EQUIP ${slotLabel}</div>
      <button class="picker-close" onclick="G.closeSlotPicker()">✕ CLOSE</button>
    </div>`;
    if (!compatible.length) {
      html += `<div class="picker-empty">No ${slotLabel.toLowerCase()} items in your bag.</div>`;
    } else {
      compatible.forEach(({ it, i }) => {
        const rainbow = it.tierRainbow ? ' rainbow-text' : '';
        const tierBadge = it.tierLabel ? ` <span style="font-size:.5rem;opacity:.65">[${it.tierLabel}]</span>` : '';
        const cmp = this._compareToEquipped(it, false, slot);
        const skillLine = it.skillDesc ? `<div class="picker-item-skill">✦ ${it.skillDesc}</div>` : '';
        const perkLine = it.celestialPerk ? `<div class="picker-item-perk">★ ${it.celestialPerk.name} — ${it.celestialPerk.desc}</div>` : '';
        html += `<div class="picker-item" onclick="G.equipFromPicker(${i})">
          <div class="picker-item-info">
            <div class="picker-item-name${rainbow}" style="${it.tierRainbow ? '' : `color:${it.tierColor || 'var(--green)'}`}">
              ${it.tier === 'unique' ? '◆ ' : it.tier === 'celestial' ? '★ ' : ''}${it.name}${tierBadge}
            </div>
            <div class="picker-item-stats">${this.itemStatLine(it)}</div>
            ${cmp}
            ${skillLine}${perkLine}
          </div>
          <button class="slot-btn green" onclick="event.stopPropagation();G.equipFromPicker(${i})" style="flex-shrink:0;margin-top:2px">EQUIP</button>
        </div>`;
      });
    }
    // highlight active slot
    document.querySelectorAll('.inv-slot').forEach(el => el.classList.remove('slot-picker-active'));
    document.getElementById('slot-picker').innerHTML = html;
    document.getElementById('slot-picker').style.display = 'block';
    document.getElementById('slot-picker-backdrop').style.display = 'block';
  },

  closeSlotPicker() {
    this._activeSlotPicker = null;
    document.querySelectorAll('.inv-slot').forEach(el => el.classList.remove('slot-picker-active'));
    const p = document.getElementById('slot-picker');
    const b = document.getElementById('slot-picker-backdrop');
    if (p) p.style.display = 'none';
    if (b) b.style.display = 'none';
  },

  // ─── IMBUE SYSTEM ───
  openImbue(bagIdx) {
    const s = this.state;
    const essence = s.bag[bagIdx];
    if (!essence || essence.type !== 'imbue_stone') return;
    const bonus = essence.imbueBonus;
    if (!bonus) { this.toast('This essence cannot be imbued.'); return; }
    // Build list of equipped gear (only occupied slots, excluding belt/ring/amulet accessories)
    const GEAR_SLOTS = ['mainHand','offHand','head','chest','arms','legs','shoes'];
    const equippedGear = GEAR_SLOTS.map(sl => ({ slot: sl, item: s.equip[sl] })).filter(g => g.item);
    if (!equippedGear.length) { this.toast('No gear equipped to imbue!'); return; }
    const slotLabel = (sl) => (SLOT_LABELS[sl] || sl.toUpperCase()).replace(/^[^\s]+\s*/, '').trim() || sl.toUpperCase();
    let html = `<div class="picker-header">
      <div class="picker-title">⚗ IMBUE — ${essence.name}</div>
      <button class="picker-close" onclick="G.closeSlotPicker()">✕ CLOSE</button>
    </div>
    <div style="font-size:.6rem;color:var(--amber);margin-bottom:8px;padding:0 2px">Choose a piece of gear to permanently add <strong>${bonus.label}</strong>. One imbue per item.</div>`;
    equippedGear.forEach(({ slot, item }) => {
      const alreadyImbued = !!item.imbued;
      const rainbow = item.tierRainbow ? ' rainbow-text' : '';
      html += `<div class="picker-item${alreadyImbued ? ' imbue-already' : ''}" ${!alreadyImbued ? `onclick="G.doImbue(${bagIdx},'${slot}')"` : ''}>
        <div class="picker-item-info">
          <div style="font-size:.58rem;color:var(--amber);opacity:.6">${slotLabel(slot)}</div>
          <div class="picker-item-name${rainbow}" style="${item.tierRainbow ? '' : `color:${item.tierColor||'var(--green)'}`}">${item.name}</div>
          <div class="picker-item-stats">${this.itemStatLine(item)}</div>
          ${alreadyImbued ? `<div style="font-size:.52rem;color:#cc88ff">✧ Already imbued — cannot stack</div>` : ''}
        </div>
        ${!alreadyImbued ? `<button class="slot-btn amber" onclick="event.stopPropagation();G.doImbue(${bagIdx},'${slot}')" style="flex-shrink:0">IMBUE</button>` : ''}
      </div>`;
    });
    document.getElementById('slot-picker').innerHTML = html;
    document.getElementById('slot-picker').style.display = 'block';
    document.getElementById('slot-picker-backdrop').style.display = 'block';
  },

  doImbue(bagIdx, slot) {
    const s = this.state;
    const essence = s.bag[bagIdx];
    const gear = s.equip[slot];
    if (!essence || !gear || !essence.imbueBonus) return;
    if (gear.imbued) { this.toast('This item is already imbued!'); return; }
    const bonus = essence.imbueBonus;
    const slotLabel = (SLOT_LABELS[slot] || slot).replace(/^[^\s]+\s*/, '').trim() || slot.toUpperCase();
    this.closeSlotPicker();
    this.showEventWarning(
      '⚗ CONFIRM IMBUE',
      `Permanently add ${bonus.label} to "${gear.name}"? The ${essence.name} will be consumed. This CANNOT be undone!`,
      `⚗ IMBUE ${gear.name.toUpperCase()}`,
      () => {
        // Apply the stat bonus to the gear directly
        if (bonus.stat === 'atk')   gear.atk   = (gear.atk   || 0) + bonus.val;
        if (bonus.stat === 'def')   gear.def   = (gear.def   || 0) + bonus.val;
        if (bonus.stat === 'crit')  gear.crit  = Math.min(0.95, (gear.crit  || 0) + bonus.val);
        if (bonus.stat === 'dodge') gear.dodge = Math.min(0.75, (gear.dodge || 0) + bonus.val);
        gear.imbued = { name: essence.name, label: bonus.label };
        // Remove essence from bag
        s.bag.splice(bagIdx, 1);
        this.save();
        this.buildInvTab();
        this.renderHUD();
        AudioEngine.sfx.equip();
        this.toast(`⚗ Imbued ${gear.name} with ${essence.name}! ${bonus.label} added permanently.`);
      }
    );
  },

  equipFromPicker(idx) {
    const targetSlot = this._activeSlotPicker;
    const s = this.state;
    const it = s.bag[idx];
    if (!it) { this.closeSlotPicker(); return; }
    // For hand slots, force into the specific slot the player chose
    const handSlots = ['mainHand','offHand'];
    const ringSlots = ['ring1','ring2'];
    if (handSlots.includes(targetSlot) || ringSlots.includes(targetSlot)) {
      if (s.equip[targetSlot]) s.bag.push(s.equip[targetSlot]);
      s.equip[targetSlot] = it;
      s.bag.splice(idx, 1);
      if (it.bonus && it.bonus.ap) s.ap = Math.min(s.maxAp, s.ap + it.bonus.ap);
      this.save();
      this.buildInvTab();
      this.renderHUD();
      AudioEngine.sfx.equip();
      this.toast(`Equipped ${it.name} (${SLOT_LABELS[targetSlot] || targetSlot})`);
    } else {
      this.equip(idx);
    }
    this.closeSlotPicker();
  },

  sellEquipped(slot, price) {
    const s = this.state;
    const it = s.equip[slot];
    if (!it) return;
    const sellMult = 1 + this.getSellBonus();
    const finalPrice = Math.round((it.val || 5) * 0.5 * sellMult);
    this.showEventWarning(
      '💰 SELL EQUIPPED ITEM?',
      `Sell "${it.name}" (currently equipped in ${slot.toUpperCase()}) for ${finalPrice} caps? It will be removed from your character. This cannot be undone.`,
      `💰 SELL FOR ${finalPrice} CAPS`,
      () => {
        if (!s.equip[slot]) return;
        s.equip[slot] = null;
        s.caps += finalPrice;
        this.save();
        AudioEngine.sfx.buy();
        this.toast(`Sold ${it.name} for ${finalPrice} caps!`);
        this.buildInvTab();
        this.renderHUD();
      }
    );
  },

  useItemFromBag(i) {
    const s = this.state;
    const it = s.bag[i];
    if (!it || it.type !== 'consumable') return;
    this.useConsumable(it);
    if ((it.qty || 1) > 1) { it.qty--; }
    else s.bag.splice(i, 1);
    this.save();
    this.toast(`Used ${it.name}`);
    this.buildInvTab();
    this.renderHUD();
  },

  sellItem(i) {
    const s = this.state;
    const it = s.bag[i];
    if (!it) return;
    if (it.locked) { this.toast('🔒 Item is locked! Unlock first.'); return; }
    const sellMult = 1 + this.getSellBonus();
    const price = Math.round((it.val || 5) * 0.5 * sellMult);
    this.showEventWarning(
      '💰 SELL ITEM?',
      `Sell "${it.name}" for ${price} caps? You can buy it back from this merchant.`,
      `💰 SELL FOR ${price} CAPS`,
      () => {
        // Prefer direct index; fall back to indexOf if bag was modified
        let idx = (s.bag[i] === it) ? i : s.bag.indexOf(it);
        if (idx === -1) { this.toast('Item no longer available.'); return; }
        s.caps += price;
        s.bag.splice(idx, 1);
        // Save to buyback (max 5, FIFO — oldest dropped)
        if (!s.buyback) s.buyback = [];
        s.buyback.unshift({ item: { ...it }, price });
        if (s.buyback.length > 5) s.buyback.pop();
        this.save();
        AudioEngine.sfx.buy();
        this.toast(`Sold for ${price} caps`);
        this.buildInvTab();
        this._renderMerchantSell();
        this._renderBuyback();
        this.renderHUD();
      }
    );
  },

  salvageItem(i) {
    const s = this.state;
    const it = s.bag[i];
    if (!it) return;
    if (it.locked) { this.toast('🔒 Item is locked! Unlock first.'); return; }
    const capsGain = this._salvageValue(it);
    this.showEventWarning(
      '⚙ SALVAGE ITEM?',
      `Salvage "${it.name}" for ${capsGain} caps + materials? This cannot be undone.`,
      `⚙ SALVAGE FOR ${capsGain} CAPS`,
      () => {
        const idx = s.bag.indexOf(it);
        if (idx === -1) return;
        s.caps += capsGain;
        const matPool = ITEMS.filter(i => i.type === 'material');
        s.bag.splice(idx, 1);
        if (matPool.length) this._addToStack({ ...matPool[Math.floor(Math.random() * matPool.length)] });
        this.save();
        AudioEngine.sfx.equip();
        this.toast(`Salvaged: +${capsGain} caps + material!`);
        this.buildInvTab();
        this.renderHUD();
      }
    );
  },

  sellAll() {
    const s = this.state;
    const sellable = s.bag.filter(it => !it.locked && this._isJunk(it));
    if (!sellable.length) { this.toast('No junk to sell! (Only gray common-tier gear sells here)'); return; }
    const sellMult = 1 + this.getSellBonus();
    let total = 0;
    sellable.forEach(it => { total += Math.round((it.val || 5) * 0.5 * sellMult); });
    s.caps += total;
    s.bag = s.bag.filter(it => !(this._isJunk(it) && !it.locked));
    this.save();
    AudioEngine.sfx.buy();
    this.toast(`Sold ${sellable.length} junk item(s) for ${total} caps!`);
    this.buildInvTab();
    this.renderHUD();
  },

  dropItem(i) {
    const it = this.state.bag[i];
    if (!it) return;
    if (it.locked) { this.toast('🔒 Item is locked! Unlock first.'); return; }
    this.state.bag.splice(i, 1);
    this.save();
    this.buildInvTab();
    this.renderHUD();
  },

  // ─── STORE SELL/SALVAGE (town only) ───
  sellJunkAtStore() {
    const s = this.state;
    const sellMult = 1 + this.getSellBonus();
    let totalCaps = 0;
    const junkItems = s.bag.filter(it => !it.locked && this._isJunk(it));
    junkItems.forEach(it => { totalCaps += Math.round((it.val || 5) * 0.5 * sellMult); });
    if (totalCaps === 0) { this.toast('No common junk to sell! (Lock icon = protected)'); return; }
    this.showEventWarning(
      '💰 SELL JUNK?',
      `Sell ${junkItems.length} common item(s) for ${totalCaps} caps? Uncommon and above are safe.`,
      `💰 SELL FOR ${totalCaps} CAPS`,
      () => {
        const kept = s.bag.filter(it => it.locked || !this._isJunk(it));
        s.caps += totalCaps;
        s.bag = kept;
        this.save();
        AudioEngine.sfx.buy();
        this.toast(`Sold junk for ${totalCaps} caps!`);
        this.renderHUD();
        this.renderShop();
      }
    );
  },

  salvageAllAtStore() {
    const s = this.state;
    const salvageable = s.bag.filter(it => !it.locked);
    if (!salvageable.length) { this.toast('No unlocked items to salvage!'); return; }
    let totalMats = 0;
    salvageable.forEach(it => { totalMats += this._salvageMats(it); });
    this.showEventWarning(
      '⚙ SALVAGE ALL?',
      `Break down all ${salvageable.length} unlocked items into ~${totalMats} crafting materials (no caps)? Locked items are safe. Use SELL JUNK for caps instead. This CANNOT be undone!`,
      '⚙ SALVAGE ALL FOR MATS',
      () => this._doSalvageAllAtStore()
    );
  },

  _doSalvageAllAtStore() {
    const s = this.state;
    const salvageable = s.bag.filter(it => !it.locked);
    if (!salvageable.length) { this.toast('No unlocked items to salvage!'); return; }
    let totalMats = 0;
    const matPool = ITEMS.filter(i => i.type === 'material');
    // Keep only locked items, then re-add material stacks
    s.bag = s.bag.filter(it => it.locked);
    salvageable.forEach(it => {
      const n = this._salvageMats(it);
      totalMats += n;
      for (let m = 0; m < n; m++) {
        if (matPool.length) this._addToStack({ ...matPool[Math.floor(Math.random() * matPool.length)] });
      }
    });
    this.save();
    AudioEngine.sfx.equip();
    this.toast(`Salvaged everything! +${totalMats} crafting material${totalMats !== 1 ? 's' : ''} in bag!`);
    this.renderHUD();
    this.renderShop();
  },

  // ─── SKILL TREE ───
  hasSkill(id) { return this.state && this.state.skills.includes(id); },

  buildSkillsTab() {
    const s = this.state;
    const cats = [...new Set(SKILL_TREE.map(sk => sk.cat))];
    const advClasses = this.getAdvancedClasses();
    const totalSkills = SKILL_TREE.length;
    const unlockedCount = SKILL_TREE.filter(sk => s.skills.includes(sk.id)).length;
    const allSkillsLearned = unlockedCount >= totalSkills;
    const sp = s.skillPoints || 0;

    // Category config: color, icon
    const CAT_CFG = {
      Combat:   { col:'#ff7744', icon:'⚔' },
      AOE:      { col:'#ff4422', icon:'💥' },
      Defense:  { col:'#4499ff', icon:'🛡' },
      Scavenge: { col:'#44cc66', icon:'🔍' },
      Economy:  { col:'#ffcc44', icon:'💰' },
      Survival: { col:'#44ddcc', icon:'🌿' },
      Mastery:  { col:'#cc88ff', icon:'⭐' },
    };
    // Per-skill icons
    const SK_ICON = {
      toughness:'❤',frag_grenade:'💣',shockwave:'🌊',molotov:'🔥',concussive:'🌀',emp_blast:'⚡',
      fury:'😡',precision:'🎯',survivor:'🏃',berserker:'😤',executioner:'💀',double_strike:'🗡',
      vampiric:'🧛',bulwark:'🛡',iron_will:'💪',last_stand:'⚡',fortify:'🏰',stoic:'🧊',
      scavmaster:'🔍',resourceful:'🔧',pharmacist:'💊',finder:'🍀',hoarder:'📦',gut_feeling:'🔮',
      trader:'🤝',looter:'💰',bounty_hunter:'🎯',black_market:'🏪',fence:'💎',capitalist:'📈',
      antitoxin:'🧪',apboost:'⚡',crafter:'⚙',rad_resist:'☢',adrenaline:'💉',second_wind:'💨',
      marksman:'👁',scrap_plate:'🔩',scrounger:'🔍',patched_up:'🩹',dead_eye:'🎯',bloodlust:'🩸',
      ironclad:'⚓',warmonger:'⚔',apex_hunter:'🦅',colossus:'🗿',
      triage:'🩹',regen_field:'💚',antiheal:'🚫',combat_medic:'💊',life_tap:'🩸',
      str_mastery:'💪',agi_mastery:'🏃',int_mastery:'🧠',end_mastery:'❤',lck_mastery:'🍀',apex_body:'✨',arc_breaker:'🔩',
    };

    // Preserve scroll position across rebuilds
    const _prevScroll = document.getElementById('skills-scroll-inner');
    const _savedScrollY = _prevScroll ? _prevScroll.scrollTop : 0;

    const _dungeonLock = !!this._currentDungeon;

    // ── Sticky header ──
    let html = `<div class="skills-header-bar">
      <div>
        <div class="skills-header-title">⚡ SKILL TREE</div>
        <div style="font-size:.52rem;color:#6a7a5a;margin-top:2px">${unlockedCount}/${totalSkills} skills • LV ${s.lv}</div>
      </div>
      <div class="skills-sp-pill">
        <div class="skills-sp-count ${sp === 0 ? 'skills-sp-zero' : ''}">${sp}</div>
        <div class="skills-sp-label">SP<br>AVAIL</div>
      </div>
    </div>
    <div id="skills-scroll-inner" style="overflow-y:auto;flex:1;padding-bottom:16px">
    ${_dungeonLock ? `<div class="skills-lock-banner">⚔ DUNGEON IN PROGRESS — Skill points locked until the battle ends</div>` : ''}`;

    // ── Advanced class progression ──
    if (advClasses.length > 0) {
      const archObj = ARCHETYPES ? ARCHETYPES.find(a => a.id === s.archetype) : null;
      html += `<div class="adv-class-section" style="margin:10px 10px 4px">
        <div class="adv-class-header">⭐ CLASS PROGRESSION — ${s.archetype.toUpperCase()}${archObj ? ` ${archObj.icon}` : ''}</div>`;
      advClasses.forEach(milestone => {
        const available = s.lv >= milestone.level;
        const pathAChosen = milestone.pathA && s.advancedClasses && s.advancedClasses.includes(milestone.pathA.id);
        const pathBChosen = milestone.pathB && s.advancedClasses && s.advancedClasses.includes(milestone.pathB.id);
        const chosen = pathAChosen ? milestone.pathA : pathBChosen ? milestone.pathB : null;
        if (chosen) {
          html += `<div class="adv-class-node adv-unlocked">
            <div class="adv-class-icon">${chosen.icon}</div>
            <div class="adv-class-info">
              <div class="adv-class-name">${chosen.name} <span class="adv-lv-badge">Lv ${milestone.level}</span></div>
              <div class="adv-class-desc">${chosen.desc}</div>
            </div>
            <div class="adv-class-status">✅</div>
          </div>`;
        } else {
          const paths = [milestone.pathA, milestone.pathB].filter(Boolean);
          html += `<div class="adv-class-node ${available ? 'adv-available' : 'adv-locked'}" style="flex-direction:column;align-items:stretch;padding:8px 12px">
            <div style="font-size:.54rem;color:var(--amber);margin-bottom:6px;font-family:var(--font-title);letter-spacing:.06em">
              ${available ? '🔓 LV '+milestone.level+' — CHOOSE YOUR PATH' : '🔒 UNLOCKS AT LV '+milestone.level}
            </div>
            <div class="adv-path-choices" style="padding:0;gap:6px">
              ${paths.map(p => `<div class="adv-path-card" onclick="${available ? `G.chooseAdvClass('${p.id}')` : ''}">
                <div class="adv-path-card-icon">${p.icon}</div>
                <div class="adv-path-card-name">${p.name}</div>
                <div class="adv-path-card-desc">${p.desc}</div>
              </div>`).join('')}
            </div>
          </div>`;
        }
        if (milestone.ascended && milestone.level === 50) {
          const asc = milestone.ascended;
          const ascChosen = s.advancedClasses && s.advancedClasses.includes(asc.id);
          const ascAvail = chosen && s.lv >= 50;
          html += `<div class="adv-class-node ${ascChosen ? 'adv-unlocked' : ascAvail ? 'adv-available' : 'adv-locked'}" style="border-top:1px dashed #cc88ff44">
            <div class="adv-class-icon">${asc.icon}</div>
            <div class="adv-class-info">
              <div class="adv-class-name" style="color:#cc88ff">${asc.name} <span class="adv-lv-badge" style="color:#cc88ff;border-color:#8844cc">ASCENDED</span></div>
              <div class="adv-class-desc">${asc.desc}</div>
            </div>
            <div class="adv-class-status">${ascChosen ? '✅' : ascAvail ? '🔓' : '🔒'}</div>
          </div>`;
        }
      });
      html += `</div>`;
    }

    // ── Skill categories ──
    cats.forEach(cat => {
      const cfg = CAT_CFG[cat] || { col:'var(--amber)', icon:'⚡' };
      const catSkills = SKILL_TREE.filter(sk => sk.cat === cat);
      const catUnlocked = catSkills.filter(sk => s.skills.includes(sk.id)).length;
      html += `<div class="skill-cat-section" style="--catcol:${cfg.col}">
        <div class="skill-cat-header" style="color:${cfg.col}">
          <span style="font-size:1rem">${cfg.icon}</span>
          ${cat.toUpperCase()}
          <span style="font-size:.52rem;color:${cfg.col}80;margin-left:2px">${catUnlocked}/${catSkills.length}</span>
          <div class="skill-cat-divider"></div>
        </div>`;
      catSkills.forEach(sk => {
        const unlocked = s.skills.includes(sk.id);
        const canAfford = sp >= sk.cost;
        const stateClass = unlocked ? 'sk-unlocked' : canAfford ? 'sk-affordable' : 'sk-locked';
        const skIcon = SK_ICON[sk.id] || cfg.icon;
        html += `<div class="skill-card ${stateClass}" style="--catcol:${cfg.col}">
          <div class="skill-card-icon">${skIcon}</div>
          <div class="skill-card-body">
            <div class="skill-card-name">${sk.name}</div>
            <div class="skill-card-desc">${sk.desc}</div>
          </div>
          <div class="skill-card-actions">
            ${unlocked
              ? `<div class="skill-done-badge">✅ LEARNED</div>`
              : `<div class="skill-cost-badge">${sk.cost} SP</div>
                 <button class="skill-unlock-btn" style="border-color:${cfg.col};color:${cfg.col};background:${cfg.col}18" ${(!canAfford || _dungeonLock) ? 'disabled' : ''} onclick="G.unlockSkill('${sk.id}')">${_dungeonLock ? '🔒' : 'UNLOCK'}</button>`
            }
          </div>
        </div>`;
      });
      html += `</div>`;
    });

    // ── Mastery spends ──
    html += `<div class="skill-cat-section" style="--catcol:#cc88ff">
      <div class="skill-cat-header" style="color:#cc88ff">
        <span style="font-size:1rem">♾</span>
        MASTERY SPENDS ${allSkillsLearned ? '— TREE COMPLETE!' : ''}
        <div class="skill-cat-divider"></div>
      </div>
      <div style="font-size:.54rem;color:#6a6a8a;padding:3px 14px 6px">Repeatable power boosts — spend leftover points anytime.</div>`;
    MASTERY_SPENDS.forEach(ms => {
      const canAfford = sp >= ms.cost;
      html += `<div class="skill-card ${canAfford ? 'sk-affordable' : 'sk-locked'}" style="--catcol:#cc88ff">
        <div class="skill-card-icon" style="background:rgba(136,68,255,.12);border-color:rgba(136,68,255,.3)">♾</div>
        <div class="skill-card-body">
          <div class="skill-card-name" style="color:#cc88ff">${ms.name}</div>
          <div class="skill-card-desc">${ms.desc}</div>
        </div>
        <div class="skill-card-actions">
          <div class="skill-cost-badge" style="color:#cc88ff;border-color:#cc88ff44;background:rgba(136,68,255,.08)">${ms.cost} SP</div>
          <button class="skill-unlock-btn" style="border-color:#cc88ff;color:#cc88ff;background:rgba(136,68,255,.1)" ${(!canAfford || _dungeonLock) ? 'disabled' : ''} onclick="G.spendMastery('${ms.id}')">${_dungeonLock ? '🔒' : 'SPEND'}</button>
        </div>
      </div>`;
    });
    html += `</div></div>`;

    const el = document.getElementById('tab-content-skills');
    el.style.display = 'flex';
    el.style.flexDirection = 'column';
    el.style.overflow = 'hidden';
    el.innerHTML = html;
    // Restore scroll position so unlocking a skill doesn't jump to top
    if (_savedScrollY > 0) {
      const newScroll = document.getElementById('skills-scroll-inner');
      if (newScroll) newScroll.scrollTop = _savedScrollY;
    }
  },

  unlockSkill(id) {
    if (this._currentDungeon) { this.toast('⚔ Finish the dungeon first! SP locked during battle.'); return; }
    const s = this.state;
    const sk = SKILL_TREE.find(x => x.id === id);
    if (!sk || s.skillPoints < sk.cost || s.skills.includes(id)) return;
    s.skillPoints -= sk.cost;
    s.skills.push(id);
    this._applySkillEffect(sk.effect);
    if (s.skills.length >= 10) this.unlockAchievement('skills_10');
    this.buildSkillsTab();
    this.renderHUD();
    AudioEngine.sfx.levelup();
    this.toast('Unlocked: ' + sk.name);
  },

  spendMastery(id) {
    if (this._currentDungeon) { this.toast('⚔ Finish the dungeon first! SP locked during battle.'); return; }
    const s = this.state;
    const ms = MASTERY_SPENDS.find(x => x.id === id);
    if (!ms || s.skillPoints < ms.cost) return;
    s.skillPoints -= ms.cost;
    this._applySkillEffect(ms.effect);
    this.buildSkillsTab();
    this.renderHUD();
    AudioEngine.sfx.equip();
    this.toast('Mastery: ' + ms.name);
  },

  // ─── CRAFTING ───
  countMaterial(name) { return this.state.bag.reduce((sum, i) => i.type === 'material' && i.name === name ? sum + (i.qty || 1) : sum, 0); },
  countEssences()     { return this.state.bag.reduce((sum, i) => i.type === 'essence' ? sum + (i.qty || 1) : sum, 0); },

  buildCraftTab() {
    const showAdvanced = this.hasSkill('crafter');
    const matCounts = {};
    const matNames = ['Scrap Metal','Wire Bundle','Chem Flask','Power Cell'];
    matNames.forEach(n => matCounts[n] = this.countMaterial(n));
    const essCount = this.countEssences();

    // Inventory row
    const matRow = matNames.map(n =>
      `<div class="craft-mat-chip ${matCounts[n]>0?'have':'empty'}">
         <span class="craft-mat-name">${n}</span><span class="craft-mat-qty">${matCounts[n]}</span>
       </div>`
    ).join('');
    const essChip = `<div class="craft-mat-chip ${essCount>0?'have':'empty'}">
      <span class="craft-mat-name">Essences</span><span class="craft-mat-qty">${essCount}</span>
    </div>`;

    let html = `<div class="craft-wrap">
      <div class="craft-title">⚒ CRAFTING</div>
      <div class="craft-inv-bar">${matRow}${essChip}</div>`;

    if (!showAdvanced) {
      html += `<div class="craft-adv-hint">🔓 Unlock <strong>Crafter</strong> skill to see advanced recipes</div>`;
    }

    const cats = [{id:'Consumable',icon:'🧪'},{id:'Weapon',icon:'⚔'},{id:'Armor',icon:'🛡'},{id:'Accessory',icon:'💍'}];
    cats.forEach(cat => {
      const recs = RECIPES.filter(r => r.cat === cat.id && (!r.advanced || showAdvanced));
      if (!recs.length) return;
      html += `<div class="craft-cat-header">${cat.icon} ${cat.id.toUpperCase()}S</div>`;
      recs.forEach(rec => {
        const matReqs = rec.reqs.material || [];
        const essReqs = rec.reqs.essence ? rec.reqs.essence[0].qty : 0;
        const matOk = matReqs.every(r => matCounts[r.name] >= r.qty);
        const essOk = essReqs === 0 || essCount >= essReqs;
        const canCraft = matOk && essOk;
        const res = rec.result;

        const matBadges = matReqs.map(r => {
          const have = matCounts[r.name] || 0;
          const ok = have >= r.qty;
          return `<span class="craft-req-badge ${ok?'ok':'short'}">${r.name.split(' ')[0]} ${have}/${r.qty}</span>`;
        }).join('');
        const essBadge = essReqs ? `<span class="craft-req-badge ${essCount>=essReqs?'ok':'short'}">Essence ${essCount}/${essReqs}</span>` : '';

        const resultColor = cat.id==='Consumable' ? 'var(--green)' : cat.id==='Weapon' ? 'var(--red)' : cat.id==='Armor' ? 'var(--blue)' : 'var(--amber)';
        html += `<div class="craft-recipe ${canCraft?'craftable':''}">
          <div class="craft-recipe-top">
            <div>
              <div class="craft-recipe-name" style="color:${resultColor}">${res.name}${rec.advanced?' <span class="craft-adv-tag">[ADV]</span>':''}</div>
              <div class="craft-recipe-stat">${res.desc||''}</div>
            </div>
            <button class="craft-btn ${canCraft?'craft-btn-ready':''}" ${!canCraft?'disabled':''} onclick="G.craft('${rec.id}')">CRAFT</button>
          </div>
          <div class="craft-req-row">${matBadges}${essBadge}</div>
        </div>`;
      });
    });

    html += `</div>`;
    document.getElementById('tab-content-craft').innerHTML = html;
  },

  craft(id) {
    const s = this.state;
    const rec = RECIPES.find(r => r.id === id);
    if (!rec) return;
    // Check and consume materials
    const matReqs = rec.reqs.material || [];
    const canMat = matReqs.every(r => this.countMaterial(r.name) >= r.qty);
    const essReqs = rec.reqs.essence ? rec.reqs.essence[0].qty : 0;
    const canEss = essReqs === 0 || this.countEssences() >= essReqs;
    if (!canMat || !canEss) { this.toast('Not enough materials!'); return; }
    matReqs.forEach(r => {
      let needed = r.qty;
      for (const item of s.bag) {
        if (item.type === 'material' && item.name === r.name && needed > 0) {
          const take = Math.min(item.qty || 1, needed);
          needed -= take;
          item.qty = (item.qty || 1) - take;
        }
      }
      s.bag = s.bag.filter(i => !(i.type === 'material' && i.name === r.name) || (i.qty || 1) > 0);
    });
    if (essReqs) {
      let needed = essReqs;
      for (const item of s.bag) {
        if (item.type === 'essence' && needed > 0) {
          const take = Math.min(item.qty || 1, needed);
          needed -= take;
          item.qty = (item.qty || 1) - take;
        }
      }
      s.bag = s.bag.filter(i => i.type !== 'essence' || (i.qty || 1) > 0);
    }
    this._addToStack({ ...rec.result });
    s._craftedThisRun = (s._craftedThisRun || 0) + 1;
    if (s._craftedThisRun >= 10) this.unlockAchievement('crafted_10');
    this.save();
    this.buildCraftTab();
    AudioEngine.sfx.equip();
    this.toast(`✅ Crafted: ${rec.result.name}`);
  },

  // ─── CHARACTER SHEET ───
  buildCharTab() {
    const s = this.state;
    if (!s) return;

    // ── Computed stats ──
    const atk        = this.getWeaponAtk();
    const def        = this.getTotalDef();
    const dodge       = Math.round(this.getTotalDodge() * 100);
    const critChance = Math.min(0.95, 0.05 + s.lck * 0.02
      + (this.hasSkill('precision') ? 0.10 : 0)
      + (this.getAmuletBonus('crit') || 0)
      + (s.equip.mainHand?.crit || 0)
      + (s.equip.offHand?.crit || 0) * 0.5);
    const critPct    = Math.round(critChance * 100);

    // Total resist from all equipped pieces
    let totalResist = 0;
    ['mainHand','offHand','head','chest','arms','legs','shoes','amulet','belt','ring1','ring2'].forEach(sl => {
      const it = s.equip[sl];
      if (!it) return;
      if (it.resist) totalResist += it.resist;
      if (it.bonus?.resist) totalResist += it.bonus.resist;
    });
    const resistPct = Math.round(Math.min(0.85, totalResist) * 100);

    // Loot/fight bonus
    let lootBonus = this.getSlotBonus('loot') || 0;

    // Heal bonus
    let healBonus = this.getSlotBonus('heal') || 0;
    if (s.equip.amulet?.bonus?.heal) healBonus += s.equip.amulet.bonus.heal;

    // Sell bonus
    const sellPct = Math.round(this.getSellBonus() * 100);

    // XP progress
    const xpPct = Math.round((s.xp / s.xpNext) * 100);

    // Race info
    const race = RACES ? RACES.find(r => r.id === s.race) : null;

    // Archetype
    const arch = ARCHETYPES ? ARCHETYPES.find(a => a.id === s.archetype) : null;

    // Weapon proc chances
    const procs = [];
    ['mainHand','offHand'].forEach(sl => {
      const it = s.equip[sl];
      if (!it) return;
      const label = sl === 'mainHand' ? 'Main' : 'Off';
      if (it.status) procs.push(`${label}: ${it.status.type.toUpperCase()} ${Math.round(it.status.chance * 100)}%`);
      if (it.celestialStatuses) it.celestialStatuses.forEach(st => procs.push(`${label}: ${st.type.toUpperCase()} ${Math.round(st.chance * 100)}%`));
    });

    // Immunities
    const immunities = [];
    if (this.hasSkill('antitoxin') || this.getAdvClassEffect('immuneTox') || s.raceImmuneTox) immunities.push('Poison', 'Burn');
    if (this.getAdvClassEffect('immuneSlowStun')) immunities.push('Slow', 'Stun');

    // Active skills
    const unlockedSkills = SKILL_TREE ? SKILL_TREE.filter(sk => s.skills.includes(sk.id)) : [];

    // Advanced classes — iterate milestones for this archetype
    const advClassEntries = [];
    const milestones = this.getAdvancedClasses();
    if (milestones && s.advancedClasses) {
      milestones.forEach(m => {
        [m.pathA, m.pathB, m.ascended].filter(Boolean).forEach(p => {
          if (s.advancedClasses.includes(p.id)) advClassEntries.push(`${p.icon || '★'} ${p.name}: ${p.desc}`);
        });
      });
    }

    const portraitSrc = ARCHETYPE_ART ? (ARCHETYPE_ART[s.archetype] || '') : '';
    const intMult = this._intStatusMult();
    const intDur  = this._intDurationBonus();
    const intChanceB = this._intStatusChanceBonus();

    const barRow = (label, val, max, color, displayVal) =>
      `<div class="char-bar-row">
        <div class="char-bar-label">${label}</div>
        <div class="char-bar-track"><div class="char-bar-fill" style="width:${Math.min(100,Math.round(val/max*100))}%;background:${color}"></div></div>
        <div class="char-bar-val">${displayVal}</div>
      </div>`;

    let html = `<div style="padding:10px 12px 20px">`;

    // ── Hero card: portrait + name + bars ──
    html += `<div class="char-hero-card">
      <div class="char-portrait-wrap">
        ${portraitSrc
          ? `<img class="char-portrait-img" src="${portraitSrc}" alt="${s.archetype}">`
          : `<div class="char-portrait-fallback">${arch ? arch.icon : '?'}</div>`}
      </div>
      <div class="char-hero-info">
        <div>
          <div class="char-hero-name">${s.name || 'Survivor'}</div>
          <div class="char-hero-title">${arch ? arch.name : 'Survivor'}${race ? ' · ' + race.icon + ' ' + race.name : ''}</div>
          <div class="char-hero-lv">LV ${s.lv} &nbsp;·&nbsp; ${s.caps}💰 &nbsp;·&nbsp; ${s.totalKills||0} kills</div>
        </div>
        <div class="char-bar-section">
          ${barRow('HP', s.hp, s.maxHp, '#55bb55', `${s.hp}/${s.maxHp}`)}
          ${barRow('AP', s.ap, s.maxAp, 'var(--blue)', `${s.ap}/${s.maxAp}`)}
          ${barRow('XP', s.xp, s.xpNext, 'var(--amber)', `${xpPct}%`)}
          ${s.rad > 0 ? barRow('RAD', s.rad, s.maxRad||100, '#88ff44', `${s.rad}/${s.maxRad||100}`) : ''}
        </div>
      </div>
    </div>`;

    // ── Combat stats grid ──
    html += `<div class="char-section">
      <div class="char-section-title">⚔ COMBAT STATS</div>
      <div class="char-stat-grid">
        <div class="char-stat-cell"><div class="char-stat-icon">⚔</div><div class="char-stat-label">ATK</div><div class="char-stat-val" style="color:#ffdd88">${atk}</div></div>
        <div class="char-stat-cell"><div class="char-stat-icon">🛡</div><div class="char-stat-label">DEF</div><div class="char-stat-val" style="color:var(--blue)">${def}</div></div>
        <div class="char-stat-cell"><div class="char-stat-icon">🎯</div><div class="char-stat-label">CRIT</div><div class="char-stat-val" style="color:#ffaa44">${critPct}%</div></div>
        <div class="char-stat-cell"><div class="char-stat-icon">💨</div><div class="char-stat-label">DODGE</div><div class="char-stat-val" style="color:#88ffcc">${dodge}%</div></div>
        ${resistPct > 0 ? `<div class="char-stat-cell"><div class="char-stat-icon">🧪</div><div class="char-stat-label">RESIST</div><div class="char-stat-val" style="color:#cc88ff">${resistPct}%</div></div>` : ''}
        ${procs.map(p => `<div class="char-stat-cell" style="grid-column:span 2"><div class="char-stat-icon">💥</div><div class="char-stat-label">PROC</div><div class="char-stat-val" style="color:#ff8844;font-size:.55rem">${p}</div></div>`).join('')}
      </div>
    </div>`;

    // ── Attributes ──
    html += `<div class="char-section">
      <div class="char-section-title">📊 ATTRIBUTES</div>
      <div class="char-attr-grid">
        <div class="char-attr-block"><div class="char-attr-num">${s.str}</div><div class="char-attr-tag">STR</div></div>
        <div class="char-attr-block"><div class="char-attr-num">${s.agi}</div><div class="char-attr-tag">AGI</div></div>
        <div class="char-attr-block"><div class="char-attr-num" style="color:#88ffcc" title="×${intMult.toFixed(1)} DoT">${s.int}</div><div class="char-attr-tag" style="color:#88ffcc">INT</div></div>
        <div class="char-attr-block"><div class="char-attr-num">${s.end}</div><div class="char-attr-tag">END</div></div>
        <div class="char-attr-block"><div class="char-attr-num">${s.lck}</div><div class="char-attr-tag">LCK</div></div>
      </div>
      ${race ? `<div class="char-race-passive" style="margin-top:6px;font-size:.56rem;color:#7a8a7a;line-height:1.5">${race.icon} ${race.desc}</div>` : ''}
    </div>`;

    // ── Bonuses ──
    const hasUtility = sellPct > 0 || lootBonus > 0 || healBonus > 0 || immunities.length > 0;
    if (hasUtility) {
      const bRow = (icon, label, val, col) =>
        `<div class="char-row"><span class="char-label">${icon} ${label}</span><span class="char-val" style="color:${col}">${val}</span></div>`;
      html += `<div class="char-section">
        <div class="char-section-title">🎒 BONUSES</div>
        ${sellPct > 0    ? bRow('💰','SELL BONUS', `+${sellPct}%`, '#ffe050') : ''}
        ${lootBonus > 0  ? bRow('📦','LOOT BONUS', `+${lootBonus}`, '#88ffcc') : ''}
        ${healBonus > 0  ? bRow('💊','HEAL BONUS', `+${healBonus}`, '#ff88aa') : ''}
        ${immunities.length ? bRow('🛡','IMMUNE', immunities.join(', '), '#88ff88') : ''}
      </div>`;
    }

    // ── Advanced classes ──
    if (advClassEntries.length > 0) {
      html += `<div class="char-section"><div class="char-section-title">★ ADVANCED CLASSES</div>`;
      const milestones = this.getAdvancedClasses();
      if (milestones && s.advancedClasses) {
        milestones.forEach(m => {
          [m.pathA, m.pathB, m.ascended].filter(Boolean).forEach(p => {
            if (s.advancedClasses.includes(p.id)) {
              html += `<div class="char-adv-badge">
                <div class="char-adv-icon">${p.icon || '★'}</div>
                <div>
                  <div class="char-adv-text">${p.name}</div>
                  <div class="char-adv-desc">${p.desc}</div>
                </div>
              </div>`;
            }
          });
        });
      }
      html += `</div>`;
    }

    // ── Active skills ──
    if (unlockedSkills.length > 0) {
      html += `<div class="char-section">
        <div class="char-section-title">✅ ACTIVE SKILLS (${unlockedSkills.length})</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px;padding-top:4px">`;
      unlockedSkills.forEach(sk => {
        html += `<div class="char-skill-pill">✅ ${sk.name}</div>`;
      });
      html += `</div></div>`;
    } else {
      html += `<div class="char-section" style="text-align:center;color:var(--dim);font-size:.62rem;padding:12px">No skills yet — visit the ⚡ SKILLS tab.</div>`;
    }

    html += `</div>`;
    document.getElementById('tab-content-char').innerHTML = html;
  },

  // ─── TAB SWITCHING ───
  switchTab(tab) {
    this.closeSlotPicker();
    ['map','inv','skills','quests','craft','char'].forEach(t => {
      document.getElementById('tab-' + t).classList.toggle('active', t === tab);
      const content = document.getElementById('tab-content-' + t);
      const isFlex = t === 'map' || t === 'inv';
      content.style.display = t === tab ? (isFlex ? 'flex' : 'block') : 'none';
    });
    if (tab === 'inv')    this.buildInvTab();
    if (tab === 'skills') this.buildSkillsTab();
    if (tab === 'quests') this.buildQuestsTab();
    if (tab === 'craft')  this.buildCraftTab();
    if (tab === 'char')   this.buildCharTab();
  },

  // ─── LEVELING ───
  gainXP(amount) {
    const s = this.state;
    s.xp += amount;
    while (s.xp >= s.xpNext) this.levelUp();
  },

  levelUp() {
    const s = this.state;
    if (s.lv >= 100) return; // hard cap at level 100
    s.lv++;
    s.xp -= s.xpNext;
    // Slower XP curve: each level costs 300 + level×80 XP (increased from 200 + level×50)
    s.xpNext = 300 + s.lv * 80;
    s.maxHp += 12; s.hp = Math.min(s.maxHp, s.hp + 12);
    s.str++; s.agi++; s.int++; s.end++; s.lck++;
    s.skillPoints = (s.skillPoints || 0) + 1;
    if (s.lv >= 10) this.unlockAchievement('lv10');
    if (s.lv >= 20) this.unlockAchievement('lv20');
    if (s.lv >= 50) this.unlockAchievement('lv50');
    this.checkAdvancedClassUnlock(s.lv);
    AudioEngine.sfx.levelup();
    // ── Level-up screen: draw 4 random power perks (separate from skill tree) ──
    const choices = LEVEL_UP_PERKS.sort(() => Math.random() - .5).slice(0, 4);
    // ── Mid-dungeon: queue the perk pick, don't interrupt waves ──
    if (this._currentDungeon && this._dungeonWave < this._currentDungeon.room.waves) {
      if (!this._pendingLevelUpQueue) this._pendingLevelUpQueue = [];
      this._pendingLevelUpQueue.push({ choices, masteryChoices: [] });
      setTimeout(() => this.toast(`⬆ LV ${s.lv}! Power pick queued — finish the dungeon first`, 2500), 100);
      return;
    }
    const cuOverlay = document.getElementById('class-upgrade-overlay');
    const delay = cuOverlay.classList.contains('show') ? 2500 : 0;
    setTimeout(() => this.showLevelUp(choices, []), delay);
  },

  showLevelUp(choices, masteryChoices) {
    const s = this.state;
    document.getElementById('lu-info').innerHTML =
      `⬆ LEVEL ${s.lv} — HP +12 | All Stats +1<br>Skill Points: <span style="color:var(--amber)">${s.skillPoints} SP</span> (spend in Skills tab)<br><span style="color:#aaddaa;font-size:.72em">Choose a power upgrade:</span>`;
    const el = document.getElementById('lu-perks');
    el.innerHTML = choices.map(p => `
      <button class="lu-perk-btn" onclick="G.pickLevelPerk('${p.id}')">
        <div class="lu-perk-name">${p.name}</div>
        <div class="lu-perk-desc">${p.desc}</div>
      </button>`).join('');
    if (choices.length === 0) {
      el.innerHTML = `<button class="lu-perk-btn" onclick="G.closeLevelUp()">CONTINUE</button>`;
    }
    el.innerHTML += `<button class="lu-perk-btn" style="border-color:#4a6a4a;color:#7a9a7a;font-size:.8rem" onclick="G.closeLevelUp()">SKIP</button>`;
    document.getElementById('levelup-overlay').classList.add('show');
    this.renderHUD();
  },

  pickLevelPerk(id) {
    const s = this.state;
    const perk = LEVEL_UP_PERKS.find(x => x.id === id);
    if (!perk) return;
    this._applySkillEffect(perk.effect);
    this.closeLevelUp();
    AudioEngine.sfx.equip();
    this.toast('Power up: ' + perk.name);
  },

  _applySkillEffect(e) {
    const s = this.state;
    if (!e) return;
    if (e.maxHp)       { s.maxHp += e.maxHp; s.hp = Math.min(s.maxHp, s.hp + e.maxHp); }
    if (e.str)         s.str += e.str;
    if (e.agi)         s.agi += e.agi;
    if (e.int)         s.int += e.int;
    if (e.end)         s.end += e.end;
    if (e.lck)         s.lck += e.lck;
    if (e.allStats)    { s.str+=e.allStats; s.agi+=e.allStats; s.int+=e.allStats; s.end+=e.allStats; s.lck+=e.allStats; }
    if (e.caps)        s.caps += e.caps;
    if (e.lootLuck)    s.artificerBonus = (s.artificerBonus || 0) + e.lootLuck;
    if (e.flatAtk)     { if (!s.flatAtk) s.flatAtk = 0; s.flatAtk += e.flatAtk; }
    if (e.maxAp)       { s.maxAp = Math.min(10, (s.maxAp || 4) + e.maxAp); s.ap = Math.min(s.ap + e.maxAp, s.maxAp); }
    if (e.skillPoints) s.skillPoints = (s.skillPoints || 0) + e.skillPoints;
    this.save();
    this.renderHUD();
  },

  closeLevelUp() {
    document.getElementById('levelup-overlay').classList.remove('show');
    this.save();
    this.renderHUD();
    // Resume deferred enemy turn if one was pending during level-up
    if (this._pendingEnemyTurn) {
      this._pendingEnemyTurn = false;
      if (this.combat && this.state && this.state.hp > 0) {
        setTimeout(() => this.enemyTurn(), 300);
      }
    }
    // Drain any remaining queued perk picks (deferred mid-dungeon level-ups)
    if (this._pendingLevelUpQueue && this._pendingLevelUpQueue.length) {
      const next = this._pendingLevelUpQueue.shift();
      setTimeout(() => this.showLevelUp(next.choices, next.masteryChoices), 350);
      return; // Don't fire dungeon loot or wave resume yet — more picks to show
    }
    // All picks done — fire dungeon bonus loot callback if one is waiting
    if (this._dungeonBonusLootCallback) {
      const cb = this._dungeonBonusLootCallback;
      this._dungeonBonusLootCallback = null;
      setTimeout(cb, 500);
      return;
    }
    // Resume deferred dungeon next-wave if level-up happened mid-dungeon
    // BUT only if the class upgrade overlay isn't also open (player may still be choosing)
    if (this._pendingDungeonWave) {
      const cuOv = document.getElementById('class-upgrade-overlay');
      if (cuOv && cuOv.classList.contains('show')) {
        // class upgrade still open — leave flag set; chooseClassPath will resume
      } else {
        this._pendingDungeonWave = false;
        setTimeout(() => this._runNextDungeonWave(), 2500);
      }
    }
  },

  // ─── EFFECTS ───
  strobeEffect(cb) {
    const el = document.getElementById('strobe');
    let n = 0;
    const iv = setInterval(() => {
      el.style.opacity = n % 2 === 0 ? '0.4' : '0';
      n++;
      if (n > 6) { clearInterval(iv); el.style.opacity = '0'; if (cb) cb(); }
    }, 120);
  },

  // Boss alarm banner that scrolls across screen
  showBossAlarm(bossName, cb) {
    const banner = document.getElementById('boss-alarm-banner');
    banner.textContent = `⚠ BOSS DETECTED: ${bossName} ⚠`;
    banner.classList.add('alarm-show');
    AudioEngine.sfx.classup();
    setTimeout(() => {
      banner.classList.remove('alarm-show');
      if (cb) cb();
    }, 2800);
  },

  // Show a warning modal before chaotic/dangerous events
  // cancelLabel/onCancel optional — if omitted, just hides modal
  showEventWarning(title, body, confirmLabel, onConfirm, cancelLabel, onCancel) {
    const modal = document.getElementById('event-warning-modal');
    document.getElementById('ewm-title').textContent = title;
    document.getElementById('ewm-body').textContent = body;
    const btn = document.getElementById('ewm-confirm');
    btn.textContent = confirmLabel;
    btn.onclick = () => {
      modal.style.display = 'none';
      onConfirm();
    };
    const cancelBtn = document.getElementById('ewm-cancel');
    cancelBtn.textContent = cancelLabel || '↩ CANCEL';
    cancelBtn.onclick = () => {
      modal.style.display = 'none';
      if (onCancel) onCancel();
    };
    modal.style.display = 'flex';
  },

  // ─── DUNGEON SYSTEM ───
  openDungeonPrompt(r, c) {
    const room = DUNGEON_ROOMS[Math.floor(Math.random() * DUNGEON_ROOMS.length)];
    this._currentDungeon = { room, r, c, wave: 0 };
    document.getElementById('dungeon-icon').textContent = room.icon;
    document.getElementById('dungeon-title').textContent = room.name;
    document.getElementById('dungeon-desc').textContent = room.desc;
    document.getElementById('dungeon-waves').textContent = `⚔ ${room.waves} COMBAT WAVES · Guaranteed Loot Bonus`;
    const modal = document.getElementById('dungeon-modal');
    modal.classList.add('show');
  },

  closeDungeon() {
    document.getElementById('dungeon-modal').classList.remove('show');
    this._currentDungeon = null;
    this._pendingLevelUpQueue = [];
    this._dungeonBonusLootCallback = null;
    this.show('screen-map');
    this.renderMap();
    this.renderHUD();
  },

  enterDungeon() {
    document.getElementById('dungeon-modal').classList.remove('show');
    if (!this._currentDungeon) return;
    this._dungeonWave = 0;
    this._runNextDungeonWave();
  },

  _runNextDungeonWave() {
    const d = this._currentDungeon;
    if (!d) return;
    const lootScreen = document.getElementById('screen-loot');
    const luOverlay = document.getElementById('levelup-overlay');
    const cuOverlay = document.getElementById('class-upgrade-overlay');
    const blocked = (lootScreen && lootScreen.classList.contains('active'))
                 || (luOverlay && luOverlay.classList.contains('show'))
                 || (cuOverlay && cuOverlay.classList.contains('show'));
    if (blocked) {
      this._pendingDungeonWave = true;
      return;
    }
    if (this._dungeonWave >= d.room.waves) {
      // All waves cleared
      const bonusTier = d.room.lootBonus >= 2 ? 'legendary' : 'epic';
      this.toast(`🏚 DUNGEON CLEARED! Rare loot inbound!`);
      const { r, c } = d;
      const key = r + ',' + c;
      if (!this.state.cleared.includes(key)) this.state.cleared.push(key);
      this.save();
      this._currentDungeon = null;
      // Drain any perk picks that were queued mid-wave — show them before bonus loot
      if (this._pendingLevelUpQueue && this._pendingLevelUpQueue.length) {
        this._dungeonBonusLootCallback = () => this.showLoot(3, bonusTier);
        const next = this._pendingLevelUpQueue.shift();
        setTimeout(() => this.showLevelUp(next.choices, next.masteryChoices), 600);
      } else {
        this.showLoot(3, bonusTier);
      }
      return;
    }
    const danger = Math.min(3, 2 + (d.room.dangerBonus || 0));
    const enemy = this.pickEnemy(danger);
    this._dungeonWave++;
    const waveLabel = `Wave ${this._dungeonWave}/${d.room.waves}`;
    setTimeout(() => {
      this.showBossAlarm(`${d.room.name} — ${waveLabel}`, () => {
        this.startCombat(enemy, false);
        // Hook into winCombat to continue waves
        this._dungeonCombatHook = true;
      });
    }, 100);
  },

  // ─── CHEST SYSTEM ───
  openChest(r, c) {
    // Determine chest quality by danger level of nearby tiles
    const terr = this.getCurrentTerritory();
    const lv = this.state.lv;
    let chestType = 'common';
    if (lv >= 10 || (terr && terr.lootMod >= 2)) chestType = 'vaultbox';
    else if (lv >= 5 || (terr && terr.lootMod >= 1)) chestType = 'locked';

    const cfg = CHEST_TIERS[chestType];
    const capReward = cfg.caps[0] + Math.floor(Math.random() * (cfg.caps[1] - cfg.caps[0]));

    // Generate 2-3 tiered gear items — consumables/throwables/materials excluded
    const pool = ITEMS.filter(i => !['material','essence','imbue_stone','throwable','consumable'].includes(i.type));
    const items = [];
    const count = 2 + (chestType === 'vaultbox' ? 1 : 0);
    for (let i = 0; i < count; i++) {
      const base = { ...pool[Math.floor(Math.random() * pool.length)] };
      const tier = this.rollTier(cfg.minTier);
      items.push(this.applyTier(base, tier));
    }

    this._chestItems = items;
    this._chestCaps  = capReward;

    const icons = { common:'📦', locked:'🗝', vaultbox:'🏆' };
    const titles = { common:'SUPPLY CACHE', locked:'LOCKED CHEST', vaultbox:'VAULT BOX' };
    document.getElementById('chest-icon').textContent = icons[chestType];
    document.getElementById('chest-title').textContent = titles[chestType];

    const contEl = document.getElementById('chest-contents');
    contEl.innerHTML = `<div class="chest-item-row"><span style="color:var(--amber)">💰 CAPS</span><span style="color:var(--amber)">${capReward}</span></div>`
      + items.map(it => `<div class="chest-item-row">
          <span style="color:${it.tierColor || 'var(--green)'};flex:1">${it.name}</span>
          <span style="color:var(--blue);font-size:.55rem;margin-left:4px">${this.itemStatLine(it)}</span>
        </div>`).join('');

    document.getElementById('chest-modal').classList.add('show');
    AudioEngine.sfx.buy();
  },

  collectChest() {
    document.getElementById('chest-modal').classList.remove('show');
    const s = this.state;
    if (this._chestCaps) { s.caps += this._chestCaps; }
    if (this._chestItems) { this._chestItems.forEach(it => this._addToStack(it)); }
    this.save();
    this.toast(`📦 Chest collected! +${this._chestCaps} caps!`);
    this._chestItems = null; this._chestCaps = 0;
    this.show('screen-map'); this.renderMap(); this.renderHUD();
  },

  leaveChest() {
    document.getElementById('chest-modal').classList.remove('show');
    this._chestItems = null; this._chestCaps = 0;
    this.show('screen-map'); this.renderMap(); this.renderHUD();
  },

  // ─── QUESTS TAB ───
  buildQuestsTab() {
    const s = this.state;
    if (!s.bounties) s.bounties = [];
    if (!s.npcQuests) s.npcQuests = {};
    if (!s.questProgress) s.questProgress = {};
    const completedBounties = s.bounties.filter(b => b.done).slice(-4);
    const activeBounties = s.bounties.filter(b => !b.done);
    let html = `<div style="padding:12px">`;
    html += `<div class="quests-title">🗺 QUESTS & CONTRACTS</div>`;

    // ─── NPC QUEST CHAINS ───
    let hasNpcQuests = false;
    const npcQuestBlocks = [];
    for (const key of Object.keys(s.npcQuests)) {
      if (!key.endsWith('_active')) continue;
      const questId = s.npcQuests[key];
      if (!questId) continue;
      const quest = QUEST_CHAINS[questId];
      if (!quest) continue;
      hasNpcQuests = true;
      const npc = NPCS.find(n => n.id === quest.npcId);
      const progress = getQuestProgressText(quest, s);
      const isComplete = checkQuestComplete(quest, s);
      // Compute progress % if possible
      const progMatch = progress ? progress.match(/(\d+)\s*\/\s*(\d+)/) : null;
      const progPct = progMatch ? Math.min(100, Math.round(parseInt(progMatch[1]) / parseInt(progMatch[2]) * 100)) : (isComplete ? 100 : 0);
      npcQuestBlocks.push(`<div class="quest-card${isComplete ? ' quest-complete' : ''}" style="${isComplete ? 'border-left-color:#66dd66' : ''}">
        <div class="quest-card-header">
          <div class="quest-card-icon">${npc ? npc.icon : '📋'}</div>
          <div class="quest-card-title">${quest.title}${isComplete ? ' <span style="color:#66dd66;font-size:.6rem">● READY</span>' : ''}</div>
          ${npc ? `<div class="quest-card-npc">${npc.name}</div>` : ''}
        </div>
        <div class="quest-card-desc">${quest.desc}</div>
        ${progress ? `
          <div class="quest-progress-bar"><div class="quest-progress-fill" style="width:${progPct}%"></div></div>
          <div class="quest-progress-text">${progress}${isComplete ? ' — ✅ COMPLETE' : ''}</div>` : ''}
        ${isComplete ? `<div class="quest-complete-banner">✅ QUEST COMPLETE — Find ${npc ? npc.name : 'NPC'} on the map (👤)!</div>` : ''}
      </div>`);
    }
    if (hasNpcQuests) {
      html += `<div class="quest-section-head">📋 ACTIVE QUESTS</div>`;
      html += npcQuestBlocks.join('');
    } else {
      html += `<div style="font-size:.68rem;color:#8a7a5a;padding:12px;border:1px dashed #362a1a;border-radius:12px;margin-bottom:10px;text-align:center;line-height:1.7">
        No quests active.<br>Find <strong style="color:var(--green)">👤 NPC tiles</strong> on the map to start quest chains.
      </div>`;
    }

    // Completed quest chains
    const completedChains = [];
    for (const key of Object.keys(s.npcQuests)) {
      if (!key.endsWith('_done')) continue;
      const done = s.npcQuests[key];
      if (done && done.length) done.forEach(qId => { const q = QUEST_CHAINS[qId]; if (q) completedChains.push(q); });
    }
    if (completedChains.length) {
      html += `<div class="quest-section-head">✅ COMPLETED</div>`;
      completedChains.forEach(q => {
        const npc = NPCS.find(n => n.id === q.npcId);
        html += `<div class="quest-card" style="border-left-color:#447744;opacity:.75">
          <div class="quest-card-header">
            <div class="quest-card-icon">${npc ? npc.icon : '✅'}</div>
            <div class="quest-card-title" style="color:#66aa66">${q.title}</div>
          </div>
        </div>`;
      });
    }

    // Choice flags
    const flags = s.questFlags || {};
    const flagLabels = {
      mara_power: '⚔ Path of Power', mara_knowledge: '📖 Path of Knowledge',
      kai_armor: '🛡 Heavy Armor', kai_weapon: '⚔ Shock Weapon',
      shade_heist: '💰 The Heist', shade_informant: '🕵 The Informant', shade_betrayal: '🗡 The Betrayal',
      bones_treasure: '💎 Treasure Map', bones_blessing: '☠ Death\'s Blessing',
      spark_cannon: '⚡ Pulse Cannon', spark_shield: '🛡 Power Shield',
      whisper_intel: '📜 Vault Intel', whisper_pact: '💀 Shadow Pact',
    };
    const activeFlags = Object.keys(flags).filter(f => flags[f] && flagLabels[f]);
    if (activeFlags.length) {
      html += `<div class="quest-section-head">🎲 YOUR CHOICES</div>`;
      html += `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px">`;
      activeFlags.forEach(f => {
        html += `<span style="font-size:.62rem;color:var(--blue);background:rgba(125,232,255,.08);border:1px solid rgba(125,232,255,.3);border-radius:12px;padding:3px 9px">${flagLabels[f]}</span>`;
      });
      html += `</div>`;
    }

    // ─── BOUNTIES (WANTED POSTER STYLE) ───
    html += `<div class="quest-section-head">🎯 BOUNTY CONTRACTS</div>`;
    if (!activeBounties.length) {
      html += `<div style="font-size:.68rem;color:#8a7a5a;padding:10px 8px;border:1px dashed #362a1a;border-radius:10px;margin-bottom:10px;text-align:center">
        No active contracts.<br><span style="color:#4a7a4a">Visit a <strong style="color:var(--amber)">town</strong> to pick up bounties.</span>
      </div>`;
    }
    activeBounties.forEach(b => {
      const pct = Math.min(100, (b.progress / b.count) * 100);
      const full = b.progress >= b.count;
      html += `<div class="bounty-poster${full ? ' done' : ''}">
        <div class="bounty-poster-header">
          <div class="bounty-skull">${full ? '✅' : '💀'}</div>
          <div>
            <div class="bounty-name">KILL ${b.count}× ${b.target.toUpperCase()}</div>
            <div class="bounty-meta">DEAD OR ALIVE — ${b.target} CONTRACT</div>
          </div>
          <div style="margin-left:auto"><span class="bounty-reward-badge">+${b.reward}💰</span></div>
        </div>
        <div class="bounty-progress-row">
          <span style="color:${full ? 'var(--green)' : 'var(--amber)'}">
            ${full ? '✅ CONTRACT FULFILLED' : `Kills: ${b.progress} / ${b.count}`}
          </span>
          <span style="font-size:.6rem;color:#886600">${pct.toFixed(0)}%</span>
        </div>
        <div class="bounty-progress-bar">
          <div class="bounty-progress-fill${full ? ' complete' : ''}" style="width:${pct}%"></div>
        </div>
        ${full ? `<div style="font-size:.65rem;color:var(--green);margin-top:6px;text-align:center;font-family:var(--font-title);letter-spacing:.05em">REWARD AUTO-COLLECTED ✓</div>` : ''}
      </div>`;
    });

    if (completedBounties.length) {
      html += `<div style="font-size:.65rem;color:#4a6a4a;margin-top:6px;margin-bottom:4px;font-family:var(--font-title);letter-spacing:.04em">PAST CONTRACTS:</div>`;
      completedBounties.forEach(b => {
        html += `<div style="font-size:.63rem;color:#5a4a3a;padding:2px 0;display:flex;gap:8px">
          <span style="color:#446644">✓</span>
          <span>${b.count}× ${b.target} — +${b.reward}💰 collected</span>
        </div>`;
      });
    }

    // Artificer
    html += `<div style="margin-top:14px;background:linear-gradient(135deg,#150020,#200a30);border:2px solid #cc88ff;padding:12px;border-radius:var(--radius-sm);box-shadow:3px 3px 0 rgba(200,100,255,.3)">
      <div style="font-family:var(--font-title);color:#cc88ff;font-size:1rem;letter-spacing:.05em">✦ ARTIFICER LOOT LUCK</div>
      <div style="font-size:.65rem;color:var(--blue);margin-top:6px">Bonus: <strong>+${s.artificerBonus || 0}</strong> <span style="color:#886699">(every 3 pts = +1 loot tier)</span></div>
      <div style="font-size:.62rem;color:#7766aa;margin-top:3px">Kill enemies → collect Essences → trade in town</div>
    </div>`;

    html += `</div>`;
    document.getElementById('tab-content-quests').innerHTML = html;
  },

  // ─── MERCHANT SYSTEM ───
  openMerchant() {
    const name = MERCHANT_NAMES[Math.floor(Math.random() * MERCHANT_NAMES.length)];
    document.getElementById('merchant-title').textContent = `🧳 ${name}`;
    // Generate rare+ items for merchant
    const pool = ITEMS.filter(i => i.type !== 'material' && i.type !== 'throwable' && i.type !== 'essence' && i.type !== 'imbue_stone');
    const items = [];
    const count = 3 + Math.floor(Math.random() * 3);
    while (items.length < count) {
      const base = { ...pool[Math.floor(Math.random() * pool.length)] };
      const tierPool = ['rare','epic','legendary'];
      const tier = tierPool[Math.floor(Math.random() * tierPool.length)];
      const it = this.applyTier(base, tier);
      if (!items.find(x => x.name === it.name)) items.push(it);
    }
    this._merchantItems = items;
    this._renderMerchantItems();
    this._renderMerchantSell();
    this._renderBuyback();
    document.getElementById('merchant-modal').classList.add('show');
    AudioEngine.sfx.buy();
  },

  _renderMerchantSell() {
    const s = this.state;
    const sellMult = 1 + this.getSellBonus();
    const el = document.getElementById('merchant-sell-items');
    if (!el) return;
    const UNSELLABLE_TYPES = ['consumable','essence','imbue_stone','material'];
    const sellable = s.bag.map((it, i) => ({ it, i })).filter(({ it }) => !it.locked && !UNSELLABLE_TYPES.includes(it.type));
    if (!sellable.length) {
      el.innerHTML = `<div style="font-size:.6rem;color:var(--dim);text-align:center;padding:6px">No items to sell.</div>`;
      return;
    }
    el.innerHTML = sellable.map(({ it, i }) => {
      const price = Math.round((it.val || 5) * 0.5 * sellMult);
      const nameColor = it.tierColor || 'var(--amber)';
      const rainbowCls = it.tierRainbow ? ' rainbow-text' : '';
      return `<div style="display:flex;align-items:center;justify-content:space-between;gap:6px;padding:5px 2px;border-bottom:1px solid rgba(255,255,255,.07)">
        <div style="flex:1;min-width:0">
          <div class="${rainbowCls}" style="color:${nameColor};font-size:.72rem;font-family:var(--font-title);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${it.name}</div>
          <div style="font-size:.58rem;color:var(--blue);margin-top:2px">${this.itemStatLine(it)}</div>
        </div>
        <div style="display:flex;align-items:center;gap:6px;flex-shrink:0">
          <span style="font-size:.65rem;color:var(--amber);white-space:nowrap">${price}💰</span>
          <button style="background:var(--amber);color:#1a1410;border:none;border-radius:8px;padding:5px 10px;font-family:var(--font-title);font-size:.7rem;min-height:36px;cursor:pointer" onclick="G.sellItem(${i})">SELL</button>
        </div>
      </div>`;
    }).join('');
  },

  _renderBuyback() {
    const s = this.state;
    const el = document.getElementById('merchant-buyback-items');
    const hdr = document.getElementById('buyback-header');
    if (!el || !hdr) return;
    const buyback = s.buyback || [];
    if (!buyback.length) {
      hdr.style.display = 'none';
      el.innerHTML = '';
      return;
    }
    hdr.style.display = '';
    el.innerHTML = buyback.map((entry, i) => {
      const it = entry.item;
      const canAfford = s.caps >= entry.price;
      const rainbowCls = it.tierRainbow ? ' rainbow-text' : '';
      return `<div style="display:flex;align-items:center;justify-content:space-between;gap:6px;padding:3px 0;border-bottom:1px solid #1a1a3a">
        <div style="flex:1;min-width:0">
          <div class="${rainbowCls}" style="color:${it.tierColor||'var(--amber)'};font-size:.66rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${it.name}</div>
          <div style="font-size:.52rem;color:var(--blue)">${this.itemStatLine(it)}</div>
        </div>
        <div style="display:flex;align-items:center;gap:4px;flex-shrink:0">
          <span style="font-size:.6rem;color:var(--amber)">${entry.price}💰</span>
          <button class="shop-buy-btn" ${!canAfford ? 'disabled' : ''} onclick="G.buybackItem(${i})">↩ BUY</button>
        </div>
      </div>`;
    }).join('');
  },

  buybackItem(i) {
    const s = this.state;
    if (!s.buyback || !s.buyback[i]) return;
    const entry = s.buyback[i];
    if (s.caps < entry.price) { this.toast('Not enough caps!'); return; }
    s.caps -= entry.price;
    this._addToStack({ ...entry.item });
    s.buyback.splice(i, 1);
    this.save();
    AudioEngine.sfx.buy();
    this.toast(`Bought back: ${entry.item.name}`);
    this.buildInvTab();
    this._renderMerchantSell();
    this._renderBuyback();
    this.renderHUD();
  },

  _renderMerchantItems() {
    const s = this.state;
    const discount = this.hasSkill('trader') ? 0.80 : 1.0;
    const el = document.getElementById('merchant-items');
    el.innerHTML = this._merchantItems.map((it, i) => {
      const price = Math.round(it.val * 1.2 * discount);
      const prefix = it.skill ? '🌟 ' : '';
      return `<div class="shop-row" style="flex-direction:column;align-items:stretch;padding:6px 8px;gap:3px">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:6px">
          <div style="color:${it.tierColor || 'var(--green)'};font-size:.68rem;font-family:var(--font-title)">${prefix}${it.name}</div>
          <div style="display:flex;align-items:center;gap:6px;flex-shrink:0">
            <div style="color:var(--amber);font-size:.65rem">${price}💰</div>
            <button class="shop-buy-btn" ${s.caps < price ? 'disabled' : ''} onclick="G.buyMerchantItem(${i})">BUY</button>
          </div>
        </div>
        <div style="color:var(--blue);font-size:.55rem;line-height:1.3">${this.itemStatLine(it)}</div>
        ${it.skill ? `<div style="color:#cc88ff;font-size:.52rem">✦ ${it.skillDesc}</div>` : ''}
      </div>`;
    }).join('');
  },

  buyMerchantItem(i) {
    const s = this.state;
    const discount = this.hasSkill('trader') ? 0.80 : 1.0;
    const it = this._merchantItems[i];
    const price = Math.round(it.val * 1.2 * discount);
    if (s.caps < price) return;
    s.caps -= price;
    this._addToStack({ ...it });
    this._merchantItems.splice(i, 1);
    this.save();
    this._renderMerchantItems();
    this._renderMerchantSell();
    this.renderHUD();
    AudioEngine.sfx.buy();
    this.toast('Bought: ' + it.name);
  },

  leaveMerchant() {
    document.getElementById('merchant-modal').classList.remove('show');
    this._merchantItems = [];
    this.show('screen-map'); this.renderMap(); this.renderHUD();
  },

  // ─── ARTIFICER ───
  updateArtificerUI() {
    const s = this.state;
    const essences = s.bag.filter(it => it.type === 'essence');
    const infoEl = document.getElementById('artificer-info');
    const essEl = document.getElementById('artificer-essences');
    const btn = document.getElementById('btn-sell-essences');
    if (infoEl) infoEl.textContent = `Current Loot Luck Bonus: +${s.artificerBonus || 0} (every 3 pts = +1 tier boost)`;
    if (essEl) {
      if (essences.length === 0) {
        essEl.innerHTML = '<div style="font-size:.6rem;color:var(--dim)">No essences in bag. Kill enemies for drops!</div>';
      } else {
        essEl.innerHTML = essences.map(e => `<div style="font-size:.6rem;color:#cc88ff;padding:2px 0">✦ ${e.name} (+${Math.ceil((e.val || 30) / 20)} luck)</div>`).join('');
      }
    }
    if (btn) btn.disabled = essences.length === 0;
  },

  sellEssences() {
    const s = this.state;
    const essences = s.bag.filter(it => it.type === 'essence');
    if (!essences.length) { this.toast('No essences to trade!'); return; }
    let luckGain = 0;
    essences.forEach(e => { luckGain += Math.ceil((e.val || 30) / 20); });
    if (!s.artificerBonus) s.artificerBonus = 0;
    s.artificerBonus += luckGain;
    s.bag = s.bag.filter(it => it.type !== 'essence');
    s.essenceCount = 0;
    this.save();
    AudioEngine.sfx.classup();
    this.toast(`✦ Loot Luck +${luckGain}! Total: +${s.artificerBonus}`);
    this.updateArtificerUI();
    this.renderHUD();
  },

  // ─── NPC ENCOUNTER SYSTEM ───
  openNPCEncounter(r, c) {
    const s = this.state;
    const terrId = (s.currentTerritory || 'badlands');
    const key = r + ',' + c;

    // Assign a persistent NPC to this tile
    if (!s.npcAssignments) s.npcAssignments = {};
    let npcId = s.npcAssignments[key];
    if (!npcId) {
      // Pick an NPC appropriate for this territory
      const available = NPCS.filter(n => n.territories.includes(terrId));
      // Prefer NPCs not already assigned on this map
      const assigned = Object.values(s.npcAssignments);
      let pool = available.filter(n => !assigned.includes(n.id));
      if (!pool.length) pool = available;
      if (!pool.length) pool = NPCS;
      const npc = pool[Math.floor(Math.random() * pool.length)];
      npcId = npc.id;
      s.npcAssignments[key] = npcId;
      this.save();
    }

    this.openNPCDialogue(npcId);
  },

  openNPCDialogue(npcId) {
    const s = this.state;
    if (!s.npcQuests) s.npcQuests = {};
    if (!s.questProgress) s.questProgress = {};
    if (!s.questFlags) s.questFlags = {};

    const dialogue = getDialogueForNPC(npcId, s);
    if (!dialogue) { this.toast('The stranger says nothing.'); return; }

    this._currentDialogue = dialogue;
    this._dialogueNodeIndex = 0;

    const modal = document.getElementById('npc-modal');
    const portraitEl = document.getElementById('npc-portrait');
    const nameEl = document.getElementById('npc-name');
    const titleEl = document.getElementById('npc-title');

    const npc = dialogue.npc;
    portraitEl.src = NPC_PORTRAITS[npc.portrait] || '';
    nameEl.textContent = npc.icon + ' ' + npc.name;
    titleEl.textContent = npc.title;

    this._showDialogueNode('greeting');
    modal.classList.add('show');
    AudioEngine.sfx.equip();
  },

  _showDialogueNode(nodeId) {
    const dialogue = this._currentDialogue;
    if (!dialogue) return;
    const node = dialogue.nodes.find(n => n.id === nodeId);
    if (!node) { this.closeNPCDialogue(); return; }

    this._currentNode = node;
    const textEl = document.getElementById('npc-dialogue-text');
    const choicesEl = document.getElementById('npc-choices');

    // Typewriter-style display
    textEl.innerHTML = `<span class="dialogue-speaker">${dialogue.npc.name}:</span>` + node.text;

    // Render choices
    choicesEl.innerHTML = node.options.map((opt, i) => {
      const isMajor = opt.action === 'quest_accept' || opt.action === 'quest_choice';
      return `<button class="npc-choice-btn${isMajor ? ' choice-major' : ''}" onclick="G.handleDialogueChoice(${i})">
        ${opt.label}
        ${opt.desc ? `<span class="choice-desc">${opt.desc}</span>` : ''}
      </button>`;
    }).join('');
  },

  handleDialogueChoice(index) {
    const node = this._currentNode;
    if (!node || !node.options[index]) return;
    const opt = node.options[index];

    if (opt.action === 'close') {
      this.closeNPCDialogue();
    } else if (opt.action === 'quest_accept') {
      this.acceptQuest(opt.questId);
      this.closeNPCDialogue();
    } else if (opt.action === 'quest_turn_in') {
      this.turnInQuest(opt.questId);
      this.closeNPCDialogue();
    } else if (opt.action === 'quest_choice') {
      this.handleQuestChoice(opt.questId, opt.choiceIndex);
      this.closeNPCDialogue();
    } else if (opt.next) {
      this._showDialogueNode(opt.next);
      AudioEngine.sfx.equip();
    }
  },

  acceptQuest(questId) {
    const s = this.state;
    const quest = QUEST_CHAINS[questId];
    if (!quest) return;
    const npcId = quest.npcId;
    if (!s.npcQuests) s.npcQuests = {};
    s.npcQuests[npcId + '_active'] = questId;
    if (!s.questProgress) s.questProgress = {};
    s.questProgress[questId] = 0;
    this.save();
    AudioEngine.sfx.levelup();
    this.toast(`📋 Quest accepted: ${quest.title}`);
  },

  handleQuestChoice(questId, choiceIndex) {
    const s = this.state;
    const quest = QUEST_CHAINS[questId];
    if (!quest || !quest.choices) return;
    const choice = quest.choices[choiceIndex];
    if (!choice) return;

    // Set the flag for this choice
    if (!s.questFlags) s.questFlags = {};
    s.questFlags[choice.flag] = true;

    // Give choice reward
    this.giveQuestReward(choice.reward);

    // Mark this choice quest as done
    const npcId = quest.npcId;
    if (!s.npcQuests) s.npcQuests = {};
    const done = s.npcQuests[npcId + '_done'] || [];
    done.push(questId);
    s.npcQuests[npcId + '_done'] = done;

    // Set the next quest as active if there is one
    if (choice.nextQuest) {
      s.npcQuests[npcId + '_active'] = choice.nextQuest;
      if (!s.questProgress) s.questProgress = {};
      s.questProgress[choice.nextQuest] = 0;
      this.toast(`📋 New quest: ${QUEST_CHAINS[choice.nextQuest].title}`);
    } else {
      s.npcQuests[npcId + '_active'] = null;
      this.toast(`🏆 Quest chain complete!`);
    }

    AudioEngine.sfx.classup();
    this.save();
    this.renderHUD();
  },

  turnInQuest(questId) {
    const s = this.state;
    const quest = QUEST_CHAINS[questId];
    if (!quest) return;
    const npcId = quest.npcId;

    // Give rewards
    this.giveQuestReward(quest.reward);

    // Mark as done
    if (!s.npcQuests) s.npcQuests = {};
    const done = s.npcQuests[npcId + '_done'] || [];
    done.push(questId);
    s.npcQuests[npcId + '_done'] = done;

    // Set next quest
    if (quest.nextQuest) {
      s.npcQuests[npcId + '_active'] = quest.nextQuest;
      if (!s.questProgress) s.questProgress = {};
      s.questProgress[quest.nextQuest] = 0;
      this.toast(`📋 New quest: ${QUEST_CHAINS[quest.nextQuest].title}`);
    } else {
      s.npcQuests[npcId + '_active'] = null;
      this.toast(`🏆 Quest chain complete!`);
    }

    AudioEngine.sfx.classup();
    this.save();
    this.renderHUD();
  },

  giveQuestReward(reward) {
    if (!reward) return;
    const s = this.state;
    if (reward.xp) this.gainXP(reward.xp);
    if (reward.caps) { s.caps += reward.caps; this.toast(`+${reward.caps} caps!`); }
    if (reward.skillPoints) { s.skillPoints = (s.skillPoints || 0) + reward.skillPoints; }
    if (reward.lootLuck) { s.artificerBonus = (s.artificerBonus || 0) + reward.lootLuck; }
    if (reward.statBoost) {
      const b = reward.statBoost;
      if (b.str) s.str += b.str;
      if (b.agi) s.agi += b.agi;
      if (b.int) s.int += b.int;
      if (b.end) s.end += b.end;
      if (b.lck) s.lck += b.lck;
      if (b.maxHp) { s.maxHp += b.maxHp; s.hp = Math.min(s.maxHp, s.hp + b.maxHp); }
    }
    if (reward.item) {
      const base = ITEMS.find(i => i.name === reward.item);
      if (base) this._addToStack({ ...base });
    }
    if (reward.tierItem) {
      const pool = ITEMS.filter(i => i.type !== 'material' && i.type !== 'essence' && i.type !== 'imbue_stone' && i.type !== 'consumable');
      let filtered = pool;
      if (reward.tierSlot === 'weapon') filtered = pool.filter(i => i.type === 'weapon');
      else if (reward.tierSlot === 'chest') filtered = pool.filter(i => i.type === 'armor' && i.slot === 'chest');
      if (!filtered.length) filtered = pool;
      const base = { ...filtered[Math.floor(Math.random() * filtered.length)] };
      const it = this.applyTier(base, reward.tierItem);
      s.bag.push(it);
      this.toast(`🌟 Reward: ${it.name}!`);
    }
    if (reward.revealMap) {
      // Reveal all map tiles
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (s.map[r] && s.map[r][c]) s.map[r][c].revealed = true;
        }
      }
      this.toast('🗺 Entire map revealed!');
    }
  },

  // Track kills for NPC quests
  trackQuestKill(enemyName) {
    const s = this.state;
    if (!s.npcQuests || !s.questProgress) return;
    const baseName = enemyName.replace('⚡ ELITE ', '');
    // Check all active quests
    for (const key of Object.keys(s.npcQuests)) {
      if (!key.endsWith('_active')) continue;
      const questId = s.npcQuests[key];
      if (!questId) continue;
      const quest = QUEST_CHAINS[questId];
      if (!quest || quest.type !== 'kill') continue;
      if (quest.target === 'any' || quest.target === baseName) {
        s.questProgress[questId] = (s.questProgress[questId] || 0) + 1;
        if (s.questProgress[questId] >= quest.count) {
          this.toast(`✅ Quest ready: ${quest.title} — Return to NPC!`);
        }
      }
    }
  },

  closeNPCDialogue() {
    document.getElementById('npc-modal').classList.remove('show');
    this._currentDialogue = null;
    this._currentNode = null;
    this.show('screen-map');
    this.renderMap();
    this.renderHUD();
  },

  // ─── FIELD REST (anywhere, costs caps) ───
  fieldRest() {
    const s = this.state;
    if (!s) return;
    const cost = 20;
    const healPct = 0.25;
    const healAmt = Math.round(s.maxHp * healPct);
    if (s.caps < cost) {
      this.toast(`🔥 Need ${cost}💰 to rest. Not enough caps!`);
      return;
    }
    this.showEventWarning(
      '🔥 MAKE CAMP',
      `Find shelter and rest for a while. Costs ${cost} caps.\n\n+${healAmt} HP  ·  -10 RAD  ·  30% ambush chance`,
      `🔥 REST (${cost}💰)`,
      () => {
        s.caps -= cost;
        s.hp = Math.min(s.maxHp, s.hp + healAmt);
        s.rad = Math.max(0, s.rad - 10);
        AudioEngine.sfx.heal();
        this.toast(`🔥 Rested! +${healAmt} HP, -10 RAD`);
        this.save();
        this.renderHUD();
        if (Math.random() < 0.3) {
          setTimeout(() => {
            const enemy = this.pickEnemy(2);
            this.toast('⚠ Ambush! Scavengers found you!');
            setTimeout(() => this.startCombat(enemy, false), 800);
          }, 600);
        }
      },
      '↩ CANCEL'
    );
  },

  openCampEvent() {
    const s = this.state;
    this.showEventWarning(
      '🔥 WASTELAND CAMP',
      'An abandoned campfire still smolders. You can rest here to recover HP and AP, but there\'s a chance scavengers are nearby.',
      '🔥 REST HERE',
      () => {
        // Heal 30% HP
        const heal = Math.round(s.maxHp * 0.3);
        s.hp = Math.min(s.maxHp, s.hp + heal);
        s.ap = s.maxAp;
        s.rad = Math.max(0, s.rad - 10);
        AudioEngine.sfx.heal();
        this.toast(`🔥 Rested! +${heal} HP, AP restored, -10 RAD`);
        this.save();
        this.renderHUD();
        // 30% chance of ambush
        if (Math.random() < 0.3) {
          setTimeout(() => {
            const enemy = this.pickEnemy(2);
            this.toast('⚠ Ambush! Scavengers found you!');
            setTimeout(() => this.startCombat(enemy, false), 800);
          }, 600);
        }
      },
      '↩ MOVE ON'
    );
  },

  // ─── RUINS EVENT (exploration loot + lore) ───
  openRuinsEvent() {
    const s = this.state;
    const loreSnippets = [
      'Weathered journals from before the collapse. Old knowledge hides treasures.',
      'Ancient computer terminals still flicker. Something valuable is buried here.',
      'Wall murals depict the final days. Among the rubble, something glints.',
      'A pre-war vault cache — partially looted, but secrets remain.',
    ];
    const lore = loreSnippets[Math.floor(Math.random() * loreSnippets.length)];
    const agiMod = Math.floor((s.agi - 5) / 2);
    this.showEventWarning(
      '🏛 ANCIENT RUINS',
      lore + `\n\nSearch the ruins carefully? Roll Agility (DC 11) to find the best loot without triggering traps.\n\nYour AGI modifier: ${agiMod >= 0 ? '+' : ''}${agiMod}`,
      '🔍 SEARCH RUINS (AGI Check)',
      () => {
        this.showDiceRoll({
          statLabel: 'Agility (AGI)',
          modifier: agiMod,
          dc: 11,
          difficulty: 'normal',
          onSuccess: () => {
            this.gainXP(150);
            const pool = ITEMS.filter(i => i.type !== 'material' && i.type !== 'essence' && i.type !== 'imbue_stone');
            for (let i = 0; i < 2; i++) {
              const base = { ...pool[Math.floor(Math.random() * pool.length)] };
              s.bag.push(this.applyTier(base, this.rollTier('rare')));
            }
            AudioEngine.sfx.buy();
            this.toast('🏛 Expertly searched! Found 2 rare items! +150 XP', 2200);
            this.save(); this.renderHUD();
          },
          onFail: () => {
            this.gainXP(80);
            const pool = ITEMS.filter(i => i.type !== 'material' && i.type !== 'essence' && i.type !== 'imbue_stone');
            const base = { ...pool[Math.floor(Math.random() * pool.length)] };
            s.bag.push(this.applyTier(base, this.rollTier()));
            const trapDmg = Math.round(s.maxHp * 0.08);
            s.hp = Math.max(1, s.hp - trapDmg);
            AudioEngine.sfx.hit();
            this.toast(`🏛 Triggered a trap! -${trapDmg} HP, but found 1 item. +80 XP`, 2200);
            this.save(); this.renderHUD();
          },
        });
      },
      '↩ LEAVE RUINS'
    );
  },

  // ─── SHRINE EVENT (stat boost or curse — now with dice roll) ───
  openShrineEvent() {
    const s = this.state;
    const intMod = Math.floor((s.int - 5) / 2);
    this.showEventWarning(
      '⛩ WASTELAND SHRINE',
      `A mysterious shrine hums with ancient energy.\n\nRoll Intellect (DC 10) to commune with it:\n✅ SUCCESS — BLESSED: gain +2 to a random stat\n☠ FAILURE — DRAIN: lose 12% HP but gain +200 XP\n\nYour INT modifier: ${intMod >= 0 ? '+' : ''}${intMod}`,
      '✋ COMMUNE WITH SHRINE (INT Check)',
      () => {
        this.showDiceRoll({
          statLabel: 'Intellect (INT)',
          modifier: intMod,
          dc: 10,
          difficulty: 'easy',
          onSuccess: () => {
            const blessings = [
              { stat: 'str', name: 'Strength', val: 2 },
              { stat: 'agi', name: 'Agility', val: 2 },
              { stat: 'int', name: 'Intelligence', val: 2 },
              { stat: 'end', name: 'Endurance', val: 2 },
              { stat: 'lck', name: 'Luck', val: 3 },
            ];
            const b = blessings[Math.floor(Math.random() * blessings.length)];
            s[b.stat] += b.val;
            AudioEngine.sfx.classup();
            this.toast(`⛩ BLESSED! The shrine grants +${b.val} ${b.name}!`, 2000);
            this.save(); this.renderHUD();
          },
          onFail: () => {
            const dmg = Math.round(s.maxHp * 0.12);
            s.hp = Math.max(1, s.hp - dmg);
            this.gainXP(200);
            AudioEngine.sfx.rad();
            this.toast(`⛩ The shrine rejects you! -${dmg} HP but your ordeal grants +200 XP`, 2200);
            this.save(); this.renderHUD();
          },
        });
      },
      '↩ WALK AWAY'
    );
  },

  // ─── HIDEOUT EVENT ───
  openHideout() {
    const s = this.state;
    const t = s.map[s.playerPos.r][s.playerPos.c];
    const alreadyLooted = t._looted;
    const healPct = 0.40;
    const healAmt = Math.round(s.maxHp * healPct);
    const lootMsg = alreadyLooted ? '(supply cache already looted)' : '· loot a supply cache (+1–2 items)';
    this.showEventWarning(
      '🏠 HIDEOUT',
      `You find a fortified shelter — scarred walls, old cots, survival gear.\n\n✅ Rest here: +${healAmt} HP (${Math.round(healPct*100)}% of max)\n📦 ${lootMsg}`,
      '🔥 REST HERE',
      () => {
        s.hp = Math.min(s.maxHp, s.hp + healAmt);
        this.toast(`🏠 Rested at hideout! +${healAmt} HP`, 1800);
        AudioEngine.sfx.heal && AudioEngine.sfx.heal();
        if (!alreadyLooted) {
          t._looted = true;
          this.showLoot(s.playerPos.r > 3 ? 2 : 1);
        } else {
          this.save(); this.renderHUD();
          this.show('screen-map'); this.renderMap();
        }
        // Achievement tracking
        s._hideoutRests = (s._hideoutRests || 0) + 1;
        if (s._hideoutRests >= 5) this.unlockAchievement('hideout_rest');
      },
      '↩ MOVE ON'
    );
  },

  // ─── AMBUSH EVENT ───
  openAmbushEvent() {
    const s = this.state;
    const danger = Math.min(3, Math.floor(Math.hypot(s.playerPos.r - 6, s.playerPos.c - 0) / 2.5) + 1);
    const pool = ENEMIES.filter(e => e.danger <= Math.max(1, danger));
    const base = pool[Math.floor(Math.random() * pool.length)];
    const scale = 1 + (s.lv - 1) * 0.12;
    const enemy = { ...base };
    enemy.hp  = Math.round(enemy.hp  * scale * 1.6);
    enemy.atk = Math.round(enemy.atk * scale * 1.3);
    enemy.maxHp = enemy.hp;
    enemy.xp    = Math.round(enemy.xp  * 1.5);
    enemy.caps  = Math.round(enemy.caps * 2);
    enemy.elite = true;
    enemy.statuses = [];
    enemy.name = '⚠ AMBUSH: ' + enemy.name;
    if (enemy.isShielder && enemy.shieldHp) { enemy._shieldHp = Math.round(enemy.shieldHp * scale); enemy._maxShieldHp = enemy._shieldHp; }
    if (enemy.isBerserker) { enemy._baseAtk = enemy.atk; }
    this.showEventWarning(
      '⚠ AMBUSH!',
      `You stumble into a trap! An elite enemy was waiting for you.\n\n${enemy.name.replace('⚠ AMBUSH: ','')}\nHP: ${enemy.hp} · ATK: ${enemy.atk}\n\nVictory reward: +2 items (guaranteed rare+)`,
      '⚔ FIGHT!',
      () => {
        this.startCombat(enemy, false);
        // Hook post-win for bonus loot
        this._ambushPending = true;
      },
      '🏃 ATTEMPT ESCAPE (50%)',
      () => {
        if (Math.random() < 0.5) {
          this.toast('💨 Escaped the ambush!', 1600);
          this.show('screen-map'); this.renderMap();
        } else {
          this.toast('⚠ No escape! Forced into combat!', 1600);
          setTimeout(() => this.startCombat(enemy, false), 800);
        }
      }
    );
  },

  // ─── DICE ROLL SYSTEM ───
  _diceCallback: null,
  _diceRolling: false,

  showDiceRoll({ statLabel, modifier, dc, difficulty, onSuccess, onFail }) {
    const s = this.state;
    // Apply global trait modifiers on top of whatever modifier was passed
    let traitBonus = 0;
    if (this.hasTrait('bloodhound') && s && s.hp / s.maxHp < 0.40) traitBonus += 3;
    if (this.hasTrait('born_lucky') && s) traitBonus += Math.floor(s.lck / 4);
    const totalMod = (modifier || 0) + traitBonus;

    const charName = s.name || s.archetype || 'Survivor';
    document.getElementById('dice-header').textContent = `${charName} rolls ${statLabel}`;
    document.getElementById('dice-diff').textContent = `Difficulty: ${difficulty || 'normal'} · DC ${dc}`;
    document.getElementById('dice-formula').innerHTML = '&nbsp;';
    const resultEl = document.getElementById('dice-result');
    resultEl.className = 'dice-result'; resultEl.innerHTML = '&nbsp;';
    const continueBtn = document.getElementById('dice-continue');
    continueBtn.style.display = 'none';
    const face = document.getElementById('dice-face');
    // Kill any CSS transition first so previous success/fail glow doesn't bleed into new roll
    face.style.transition = 'none';
    face.className = 'dice-face rolling';
    face.textContent = '?';
    // Re-enable transitions after a frame (so the rolling→success/fail animation still works)
    requestAnimationFrame(() => { face.style.transition = ''; });
    document.getElementById('dice-modal').style.display = 'flex';
    AudioEngine.sfx.diceRoll();
    this._diceRolling = true;
    let elapsed = 0;
    const rollAnim = () => {
      if (!this._diceRolling) return;
      face.textContent = Math.floor(Math.random() * 20) + 1;
      elapsed += 85;
      if (elapsed < 1150) {
        setTimeout(rollAnim, 85);
      } else {
        const rawRoll = Math.floor(Math.random() * 20) + 1;
        const total = rawRoll + totalMod;
        const succeeded = total >= dc;
        face.textContent = rawRoll;
        face.classList.remove('rolling');
        face.classList.add(succeeded ? 'success' : 'fail');
        const sign = totalMod >= 0 ? `+${totalMod}` : `${totalMod}`;
        document.getElementById('dice-formula').textContent = `${rawRoll} ${sign} = ${total}`;
        resultEl.className = 'dice-result ' + (succeeded ? 'success' : 'fail');
        resultEl.textContent = succeeded ? 'SUCCESS' : 'FAILURE';
        continueBtn.style.display = 'block';
        if (succeeded) AudioEngine.sfx.diceSuccess();
        else AudioEngine.sfx.diceFail();
        this._diceCallback = succeeded ? onSuccess : onFail;
        this._diceRolling = false;
      }
    };
    setTimeout(rollAnim, 85);
  },

  _onDiceContinue() {
    document.getElementById('dice-modal').style.display = 'none';
    const cb = this._diceCallback;
    this._diceCallback = null;
    if (cb) setTimeout(cb, 80);
  },

  // ─── RIFT EVENT (Revamped) ───
  openRiftEvent() {
    const s = this.state;
    const costHp = Math.round(s.maxHp * 0.20);
    if (s.hp <= costHp + 5) {
      this.toast('🌀 Too wounded to survive the Rift — heal first.', 2400);
      this.show('screen-map'); this.renderMap();
      return;
    }
    AudioEngine.sfx.rift();
    s._riftVisits = (s._riftVisits || 0) + 1;
    if (s._riftVisits >= 3) this.unlockAchievement('rift_3');

    // Compute modifiers from player stats
    const strMod  = Math.floor((s.str  - 5) / 2);
    const intMod  = Math.floor((s.int  - 5) / 2);
    const lckMod  = Math.floor((s.lck  - 5) / 2);

    const fmt = n => n >= 0 ? `+${n}` : `${n}`;

    const choices = [
      {
        id: 'brawn',
        icon: '⚔',
        name: 'BRAWN TEST',
        stat: `STR ${fmt(strMod)}`,
        desc: 'Force your way through the rift\'s crushing energy field.',
        diff: 'normal', dc: 12,
        modifier: strMod,
        statLabel: 'Brawn (STR)',
        successReward: 'legendary',
        successText: '💪 Sheer force wins! A legendary item tears through!',
        failText: '⚔ The rift beats you back — but leaves a parting gift.',
        failReward: 'epic',
        failHpCost: costHp,
      },
      {
        id: 'cunning',
        icon: '🧠',
        name: 'MIND MELD',
        stat: `INT ${fmt(intMod)}`,
        desc: 'Attune your mind to the rift\'s impossible frequency.',
        diff: 'hard', dc: 15,
        modifier: intMod,
        statLabel: 'Cunning (INT)',
        successReward: 'celestial',
        successText: '✨ Your mind pierces the veil — CELESTIAL item manifests!',
        failText: '🧠 Too much... your thoughts scatter. A rare item falls out.',
        failReward: 'rare',
        failHpCost: 0,
      },
      {
        id: 'fortune',
        icon: '🎲',
        name: 'LUCK OF THE DRAW',
        stat: `LCK ${fmt(lckMod)}`,
        desc: 'Let the rift itself decide your fate. Wild outcomes guaranteed.',
        diff: 'easy', dc: 8,
        modifier: lckMod,
        statLabel: 'Fortune (LCK)',
        successReward: 'wild',
        successText: '🎲 Fortune smiles! The rift rewards your faith!',
        failText: '💀 Fate is cruel — the rift curses you before spitting you out.',
        failReward: 'curse',
        failHpCost: costHp,
      },
    ];

    const el = document.getElementById('rift-choices');
    el.innerHTML = choices.map(ch => `
      <button class="rift-choice-btn" onclick="G._doRiftChallenge('${ch.id}')">
        <div class="rift-choice-name">${ch.icon} ${ch.name}</div>
        <div class="rift-choice-stat">${ch.stat} · DC ${ch.dc} (${ch.diff})</div>
        <div class="rift-choice-reward">${ch.desc}</div>
      </button>`).join('');

    document.getElementById('rift-cost-row').textContent =
      `⚡ Entry cost: ${costHp} HP · Bag needs 1 free slot`;
    document.getElementById('rift-modal').style.display = 'flex';
    this._riftChoices = choices;
  },

  _doRiftChallenge(id) {
    const s = this.state;
    const ch = this._riftChoices?.find(c => c.id === id);
    if (!ch) return;

    if (s.bag.length >= 60) {
      this.toast('🎒 Bag full! Make room first.', 2000);
      return;
    }

    document.getElementById('rift-modal').style.display = 'none';

    this.showDiceRoll({
      statLabel: ch.statLabel,
      modifier: ch.modifier,
      dc: ch.dc,
      difficulty: ch.diff,
      onSuccess: () => this._riftSuccess(ch),
      onFail: () => this._riftFail(ch),
    });
  },

  _riftGiveItem(tier) {
    const pool = ITEMS.filter(i => i.type !== 'material' && i.type !== 'essence');
    const base = { ...pool[Math.floor(Math.random() * pool.length)] };
    return this.applyTier(base, tier);
  },

  _riftSuccess(ch) {
    const s = this.state;
    s.hp = Math.max(1, s.hp - Math.round(ch.failHpCost * 0.5));
    let item, tierLabel;
    if (ch.successReward === 'wild') {
      const r = Math.random();
      const tier = r < 0.35 ? 'celestial' : r < 0.70 ? 'legendary' : 'epic';
      item = this._riftGiveItem(tier);
      tierLabel = tier.toUpperCase();
    } else {
      item = this._riftGiveItem(ch.successReward);
      tierLabel = ch.successReward.toUpperCase();
    }
    s.bag.push(item);
    if (item.tier === 'celestial') this.unlockAchievement('celestial');
    AudioEngine.sfx.riftReward();
    this.toast(`${ch.successText} → ${item.name} [${tierLabel}]`, 2800);
    this.save(); this.renderHUD();
    this.show('screen-map'); this.renderMap();
  },

  _riftFail(ch) {
    const s = this.state;
    if (ch.failHpCost > 0) {
      s.hp = Math.max(1, s.hp - ch.failHpCost);
      this.logCombat(`🌀 The rift drains ${ch.failHpCost} HP!`, 'log-crit');
    }
    if (ch.failReward === 'curse') {
      const curses = ['burn','poison','slow'];
      const st = curses[Math.floor(Math.random() * curses.length)];
      if (!s.statuses) s.statuses = [];
      s.statuses.push({ type: st, turns: 3 });
      this.toast(`${ch.failText} You are ${st.toUpperCase()} for 3 turns.`, 2600);
      // Give a small consolation
      const item = this._riftGiveItem('uncommon');
      s.bag.push(item);
    } else {
      const item = this._riftGiveItem(ch.failReward);
      s.bag.push(item);
      this.toast(`${ch.failText} → ${item.name} [${(ch.failReward || 'RARE').toUpperCase()}]`, 2400);
    }
    this.save(); this.renderHUD();
    this.show('screen-map'); this.renderMap();
  },

  closeRift() {
    document.getElementById('rift-modal').style.display = 'none';
    this.show('screen-map'); this.renderMap();
  },

  // ─── HARDCORE TOGGLE ───
  toggleHardcore() {
    this._pendingHardcore = !this._pendingHardcore;
    const btn = document.getElementById('btn-hardcore-toggle');
    if (btn) {
      btn.textContent = this._pendingHardcore ? 'ON' : 'OFF';
      btn.style.background = this._pendingHardcore ? 'var(--amber)' : '';
      btn.style.color = this._pendingHardcore ? '#000' : '';
    }
    AudioEngine.sfx.equip && AudioEngine.sfx.equip();
  },

  // ─── ACHIEVEMENT SYSTEM ───
  _loadAchievements() {
    try {
      const raw = localStorage.getItem('wzAchievements');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  },

  unlockAchievement(id) {
    if (typeof ACHIEVEMENTS === 'undefined') return;
    const def = ACHIEVEMENTS.find(a => a.id === id);
    if (!def) return;
    const unlocked = this._loadAchievements();
    if (unlocked.includes(id)) return; // already earned
    unlocked.push(id);
    localStorage.setItem('wzAchievements', JSON.stringify(unlocked));
    // Toast notification
    this.toast(`🏆 ACHIEVEMENT: ${def.icon} ${def.name}`, 3200);
    AudioEngine.sfx.win && AudioEngine.sfx.win();
    // ── Grant reward ──────────────────────────────────────────────
    if (def.reward && this.state) {
      const r = def.reward;
      const rewardParts = [];
      if (r.caps) {
        this.state.caps = (this.state.caps || 0) + r.caps;
        rewardParts.push(`+${r.caps} CAPS`);
      }
      if (r.xp) {
        this.state.xp = (this.state.xp || 0) + r.xp;
        this.checkLevelUp && this.checkLevelUp();
        rewardParts.push(`+${r.xp} XP`);
      }
      if (r.tier) {
        // Pick a random gear item and tier it up as a reward
        const gearPool = ITEMS.filter(i => ['weapon','armor','ring','amulet','belt'].includes(i.type));
        if (gearPool.length) {
          const base = { ...gearPool[Math.floor(Math.random() * gearPool.length)] };
          const item = this.applyTier(base, r.tier);
          this._addToStack(item);
          rewardParts.push(`${r.tier.toUpperCase()} LOOT`);
        }
      }
      if (rewardParts.length) {
        setTimeout(() => this.toast(`🎁 REWARD: ${rewardParts.join(' · ')}`, 3000), 3500);
      }
      this.save();
    }
  },

  openAchievements() {
    if (typeof ACHIEVEMENTS === 'undefined') return;
    const unlocked = this._loadAchievements();
    const modal = document.getElementById('achievements-modal');
    const panel = document.getElementById('achievements-panel') || modal?.querySelector('.achievements-panel');
    if (!modal) return;
    const total = ACHIEVEMENTS.length;
    const count = unlocked.length;
    const pct = Math.round((count / total) * 100);

    if (panel) {
      panel.innerHTML = `
        <div class="ach-modal-header" style="position:relative">
          <button class="ach-close-btn" onclick="G.closeAchievements()">✕</button>
          <div class="ach-modal-title">🏆 HALL OF RECORDS</div>
          <div class="ach-overall-row">
            <div class="ach-overall-track"><div class="ach-overall-fill" style="width:${pct}%"></div></div>
            <div class="ach-overall-text">${count}/${total} · ${pct}%</div>
          </div>
        </div>
        <div style="overflow-y:auto;flex:1">
          <div class="ach-grid">
            ${ACHIEVEMENTS.map(a => {
              const done = unlocked.includes(a.id);
              const diffColors = { bronze:'#cd7f32', silver:'#b0b0b0', gold:'#ffd700', diamond:'#66ddff' };
              const diffLabels = { bronze:'BRONZE', silver:'SILVER', gold:'GOLD', diamond:'DIAMOND' };
              const diffColor  = diffColors[a.difficulty] || '#888';
              const diffLabel  = diffLabels[a.difficulty] || '';
              // Build reward description
              const r = a.reward || {};
              const rParts = [];
              if (r.caps) rParts.push(`${r.caps} CAPS`);
              if (r.xp)   rParts.push(`${r.xp} XP`);
              if (r.tier) rParts.push(`${r.tier.toUpperCase()} LOOT`);
              const rewardStr = rParts.join(' + ');
              return `<div class="ach-card-v2 ${done ? 'ach-done' : 'ach-locked'}" style="${done ? `border-left:3px solid ${diffColor}` : ''}">
                <div style="display:flex;align-items:flex-start;gap:8px">
                  <div class="ach-card-icon">${done ? a.icon : '🔒'}</div>
                  <div style="flex:1;min-width:0">
                    <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
                      <div class="ach-card-name">${done ? a.name : '???'}</div>
                      <span style="font-size:.48rem;font-family:var(--font-mono);color:${diffColor};background:${diffColor}18;border:1px solid ${diffColor}44;border-radius:4px;padding:1px 5px;letter-spacing:.06em">${diffLabel}</span>
                    </div>
                    <div class="ach-card-desc">${done ? a.desc : 'Keep playing to unlock...'}</div>
                    <div style="margin-top:4px;font-size:.52rem;font-family:var(--font-mono);color:${done ? diffColor : '#666'};letter-spacing:.04em">
                      ${done ? `✓ EARNED &nbsp;·&nbsp; ` : ''}🎁 ${rewardStr || 'Bragging rights'}
                    </div>
                  </div>
                </div>
              </div>`;
            }).join('')}
          </div>
        </div>`;
    }
    modal.classList.add('show');
  },

  closeAchievements() {
    document.getElementById('achievements-modal').classList.remove('show');
  },

  // ─── ENEMY AVATAR ───
  getEnemyAvatar(enemy) {
    const n = (enemy.name || '').toLowerCase();
    if (enemy.isBoss || enemy.isMini) return '/enemy_boss.png';
    if (n.includes('raider') || n.includes('bandit') || n.includes('marauder') || n.includes('wasteland')) return '/enemy_raider.png';
    if (n.includes('ghoul') || n.includes('revenant') || n.includes('walker') || n.includes('plague') || n.includes('bone')) return '/enemy_ghoul.png';
    if (n.includes('mutant') || n.includes('hulk') || n.includes('brute') || n.includes('titan')) return '/enemy_mutant.png';
    if (n.includes('stalker') || n.includes('fiend') || n.includes('shadow') || n.includes('void')) return '/enemy_stalker.png';
    if (n.includes('pyro') || n.includes('flame') || n.includes('inferno') || n.includes('incinerator')) return '/enemy_pyro.png';
    if (n.includes('mech') || n.includes('bot') || n.includes('machine') || n.includes('war machine') || n.includes('turret') || n.includes('iron')) return '/enemy_mech.png';
    if (n.includes('cryo') || n.includes('drone') || n.includes('chill') || n.includes('freeze')) return '/enemy_cryo.png';
    if (n.includes('trooper') || n.includes('soldier') || n.includes('guard') || n.includes('enforcer') || n.includes('sentinel') || n.includes('apex')) return '/enemy_trooper.png';
    const pool = ['/enemy_raider.png', '/enemy_ghoul.png', '/enemy_mutant.png', '/enemy_stalker.png'];
    return pool[(enemy.name || 'X').charCodeAt(0) % pool.length];
  },

  // ─── SETTINGS ───
  openSettings() {
    const settings = this.state.settings || {};
    const sfxOff    = settings.sfxOff    || false;
    const musicOff  = settings.musicOff  || false;
    const logShort  = settings.logShort  || false;
    const sfxBtn    = document.getElementById('settings-sfx-btn');
    const musicBtn  = document.getElementById('settings-music-btn');
    const logBtn    = document.getElementById('settings-log-btn');
    if (sfxBtn)   { sfxBtn.textContent   = sfxOff   ? 'OFF' : 'ON';  sfxBtn.classList.toggle('off', sfxOff); }
    if (musicBtn) { musicBtn.textContent = musicOff  ? 'OFF' : 'ON';  musicBtn.classList.toggle('off', musicOff); }
    if (logBtn)   { logBtn.textContent   = logShort  ? 'SHORT' : 'FULL'; logBtn.classList.toggle('off', logShort); }
    document.getElementById('settings-modal').classList.add('show');
  },

  closeSettings() {
    document.getElementById('settings-modal').classList.remove('show');
  },

  toggleSetting(key) {
    if (!this.state.settings) this.state.settings = {};
    const s = this.state.settings;
    if (key === 'sfx') {
      s.sfxOff = !s.sfxOff;
      AudioEngine.sfxOff = !!s.sfxOff;
    }
    if (key === 'music') {
      s.musicOff = !s.musicOff;
      AudioEngine.musicOff = !!s.musicOff;
      if (s.musicOff) { AudioEngine.stop(); }
      else if (this.combat) { AudioEngine.play(!!this.combat.isBoss); }
    }
    if (key === 'combatLog') { s.logShort = !s.logShort; }
    this.save();
    this.openSettings();
  },

  _applyAudioSettings() {
    const s = (this.state && this.state.settings) || {};
    AudioEngine.sfxOff   = !!s.sfxOff;
    AudioEngine.musicOff = !!s.musicOff;
  },

  saveAndQuit() {
    this.save();
    this.closeSettings();
    this.goStart();
  },

  openGuide() {
    document.getElementById('guide-modal').classList.add('show');
    this.switchGuideTab('howto');
  },

  closeGuide() {
    document.getElementById('guide-modal').classList.remove('show');
  },

  switchGuideTab(tab) {
    document.querySelectorAll('.guide-tab').forEach(t => t.classList.remove('active'));
    const tabEl = document.getElementById('gtab-' + tab);
    if (tabEl) tabEl.classList.add('active');
    const el = document.getElementById('guide-content');
    if (!el) return;
    if (tab === 'howto')    el.innerHTML = this._guideHowTo();
    else if (tab === 'progress') el.innerHTML = this._guideProgress();
    else if (tab === 'tiers')    el.innerHTML = this._guideTiers();
    else if (tab === 'bestiary') el.innerHTML = this._guideBestiary();
    else if (tab === 'bosslog')  el.innerHTML = this._guideBossLog();
    else if (tab === 'status')   el.innerHTML = this._guideStatus();
  },

  _guideHowTo() {
    return `
    <div class="guide-section">
      <div class="gs-title">🗺 MOVEMENT</div>
      <div class="gs-body">Use the D-pad (or arrow keys / WASD) to move on the 7×7 fog-of-war map. Only tiles adjacent to you are visible. Tap an adjacent revealed tile to move there.</div>
    </div>
    <div class="guide-section">
      <div class="gs-title">⚡ ACTION POINTS (AP)</div>
      <div class="gs-body">
        AP powers your combat actions. You gain +2 AP at the end of each enemy turn.<br>
        • <span style="color:var(--red)">ATTACK</span> — 2 AP · rolls d20+STR vs enemy AC · Nat 20 = auto-crit, Nat 1 = fumble<br>
        • <span style="color:#cc4444">POWER ATTACK</span> — 4 AP · d20 STR check (DC 13) · success = 2.5× crushing blow, fail = enemy counters<br>
        • <span style="color:var(--amber)">V.A.T.S.</span> — 1 AP · aim for body zones for special effects<br>
        • <span style="color:var(--blue)">BRACE</span> — FREE · halves next hit, restores +2 AP<br>
        • <span style="color:var(--green)">FLEE</span> — d20 AGI check (DC 10) · Survivor skill auto-succeeds
      </div>
    </div>
    <div class="guide-section">
      <div class="gs-title">⚔ COMBAT</div>
      <div class="gs-body">Some tiles contain squads of enemies — defeat ALL foes in the group to win. Status effects (burn, poison, stun, slow, bleed) can turn the tide. AOE skills hit every enemy in a squad.</div>
    </div>
    <div class="guide-section">
      <div class="gs-title">📦 LOOT & INVENTORY</div>
      <div class="gs-body">After each victory, a loot screen appears. TAKE items to bag them, SELL junk for caps, or SALVAGE for crafting materials. In the INV tab, equip weapons and armor to gain their stat bonuses.</div>
    </div>
    <div class="guide-section">
      <div class="gs-title">🏘 TOWNS</div>
      <div class="gs-body">Town tiles restore HP and reduce radiation. Visit the town shop to buy gear and accept bounty missions for bonus caps.<br><br>
        <b style="color:var(--amber)">Artificer</b> — Two items power the Artificer system:<br>
        • <b style="color:#88ffcc">Essences</b> (Combat, Rare, Mutant, Ghost) drop from enemies — trade them with the Artificer for permanent loot luck bonuses<br>
        • <b style="color:#cc88ff">Imbue Stones</b> (Mutant Stone, Mech Core, etc.) also drop — use them to enhance equipped gear stats
      </div>
    </div>
    <div class="guide-section">
      <div class="gs-title">☢ RADIATION</div>
      <div class="gs-body">Radiation builds as you explore irradiated tiles. At 100 RAD it deals constant damage. Visit towns or use RadAway consumables (found as loot) to flush your rads.</div>
    </div>
    <div class="guide-section">
      <div class="gs-title">⌨ KEYBOARD CONTROLS</div>
      <div class="gs-body">
        <b style="color:var(--amber)">Movement:</b> Arrow Keys or WASD<br>
        <b style="color:var(--amber)">Inspect tile:</b> Enter / Space — same as LOOK button<br>
        <b style="color:var(--amber)">Mobile:</b> Swipe to move · Tap adjacent tile to move there<br>
        <b style="color:var(--amber)">Combat:</b> 1 = Attack · 2 = Brace · 3 = VATS · 4 = Flee
      </div>
    </div>
    <div class="guide-section">
      <div class="gs-title">🎒 BAG LIMIT</div>
      <div class="gs-body">Your bag holds up to <b style="color:var(--amber)">60 items</b>. When full, use SELL or SALVAGE on the loot screen to make room. Locked items (🔒) in your bag are protected from bulk actions.<br><br>
        <b style="color:var(--amber)">SELL</b> — turns junk into caps (💰). Best when you need money.<br>
        <b style="color:var(--amber)">SALVAGE ⚙×N</b> — breaks junk into <b>crafting materials</b> (no caps). Use when you need Wire Bundles, Scrap Metal, etc. for crafting.
      </div>
    </div>
    <div class="guide-section">
      <div class="gs-title">🔥 FIELD REST</div>
      <div class="gs-body">Use the <b style="color:var(--green)">REST (20💰)</b> button below the d-pad to make camp anywhere. Restores 25% HP and -10 RAD at the cost of 20 caps. 30% chance of ambush — stay alert!</div>
    </div>`;
  },

  _guideProgress() {
    return `
    <div class="guide-section">
      <div class="gs-title">📈 LEVELING UP</div>
      <div class="gs-body">Earn XP from every kill. On level-up: +10 Max HP, +1 Max AP, +1 to ALL stats, and 1 Skill Point. Pick a perk from 3 random skill options. Enemy turns pause while you choose.</div>
    </div>
    <div class="guide-section">
      <div class="gs-title">⚡ SKILL PERKS</div>
      <div class="gs-body">Skills are permanent passive or active abilities: Iron Skin, Battle Fury, Precision, Frag Grenade, Shockwave, Molotov, EMP Blast, and many more. AOE skills hit all enemies in a squad. Once every skill is learned, extra points unlock Mastery stat boosts.</div>
    </div>
    <div class="guide-section">
      <div class="gs-title">★ ADVANCED CLASSES</div>
      <div class="gs-body">At <span style="color:var(--amber)">Levels 10, 25, and 50</span> your archetype evolves into a more powerful class. Each tier grants unique passive abilities (e.g. Warrior → Warlord → Dreadnought → War God).</div>
    </div>
    <div class="guide-section">
      <div class="gs-title">🗺 TERRITORIES (6 ZONES)</div>
      <div class="gs-body" style="margin-bottom:6px">
        <b style="color:var(--amber)">Tap the glowing "🗺 TERRITORIES" button on the map screen</b> to see the world map and travel to unlocked zones. Each zone must be cleared by defeating its boss before the next one opens.
      </div>
      <div class="gs-body">
        ${typeof TERRITORIES !== 'undefined' ? TERRITORIES.map((t, i) => `<div style="color:${t.color};margin:3px 0"><b>${t.icon} ${t.name}</b> <span style="color:var(--dim);font-size:.58rem">(Zone ${i+1})</span> — ${t.desc}</div>`).join('') : 'Territory data loading...'}
      </div>
    </div>
    <div class="guide-section">
      <div class="gs-title">💰 CAPS & CRAFTING</div>
      <div class="gs-body">Caps are the currency of the wasteland. Buy gear from shops, earn caps from bounties, and sell unwanted loot. The CRAFT tab lets you combine salvaged materials into usable consumables and items.</div>
    </div>`;
  },

  _guideTiers() {
    const rows = typeof TIERS !== 'undefined'
      ? Object.entries(TIERS).map(([id, t]) => {
          const extra = t.bossOnly ? '<span style="color:var(--amber);font-size:.55rem"> · Boss Drops Only</span>' : '';
          return `<div style="border-left:4px solid ${t.color};padding:6px 8px;margin-bottom:6px;background:rgba(0,0,0,.3);border-radius:4px">
            <div class="${t.rainbow ? 'rainbow-text' : ''}" style="color:${t.color};font-family:var(--font-title);font-size:.9rem">${t.label}${extra}</div>
            <div style="font-size:.58rem;color:var(--blue)">Stat Bonus: +${t.statBonus} all stats · Value Mult: ×${t.mult}</div>
          </div>`;
        }).join('')
      : '<div style="color:var(--dim)">Tier data loading...</div>';
    return `
    <div class="guide-section">
      <div class="gs-title">💎 ITEM TIER SYSTEM</div>
      <div class="gs-body" style="margin-bottom:8px">Item quality is shown by color. Higher tiers deal more damage, grant better stat bonuses, and sell for more caps. Unique items only drop from named bosses.</div>
      ${rows}
    </div>`;
  },

  _guideBestiary() {
    if (typeof ENEMIES === 'undefined') return '<div class="guide-section"><div class="gs-body" style="color:var(--dim)">Bestiary data loading...</div></div>';
    const allEnemies = [...(ENEMIES || []), ...(MINI_BOSSES || [])];
    return `<div class="guide-section">
      <div class="gs-title">👾 BESTIARY (${allEnemies.length} Creatures)</div>
      ${allEnemies.map(e => {
        const statusStr = (e.status && typeof STATUS_DEF !== 'undefined' && STATUS_DEF[e.status.type])
          ? `<span style="color:${STATUS_DEF[e.status.type].color}">${STATUS_DEF[e.status.type].icon} ${Math.round(e.status.chance * 100)}%</span>` : '';
        const tag = e.isMini ? '<span style="color:var(--amber);font-size:.5rem"> [MINI-BOSS]</span>' : '';
        return `<div class="bestiary-row">
          <img src="${this.getEnemyAvatar(e)}" class="bestiary-avatar" onerror="this.style.display='none'">
          <div style="flex:1;min-width:0">
            <div style="font-family:var(--font-title);color:${e.isMini ? 'var(--amber)' : 'var(--red)'};font-size:.78rem">${e.name}${tag}</div>
            <div style="font-size:.54rem;color:var(--blue)">HP:${e.hp} · ATK:${e.atk} · XP:${e.xp} · ${'★'.repeat(e.danger || 1)} ${statusStr}</div>
          </div>
        </div>`;
      }).join('')}
    </div>`;
  },

  _guideBossLog() {
    if (typeof BOSSES === 'undefined') return '<div class="guide-section"><div class="gs-body" style="color:var(--dim)">Boss data loading...</div></div>';
    const s = this.state;
    const killed = (s && s.killedBossNames) || [];
    const total = BOSSES.length;
    const slain = BOSSES.filter(b => killed.includes(b.name)).length;
    return `<div class="guide-section">
      <div class="gs-title">💀 BOSS LOG <span style="color:${slain===total?'var(--amber)':'var(--dim)'}">(${slain}/${total} Slain)</span></div>
      ${BOSSES.map(b => {
        const done = killed.includes(b.name);
        const drop = typeof BOSS_DROPS !== 'undefined' && BOSS_DROPS[b.name] ? BOSS_DROPS[b.name][0] : null;
        return `<div class="bestiary-row" style="opacity:${done ? '1' : '.45'}">
          <img src="/enemy_boss.png" class="bestiary-avatar" onerror="this.style.display='none'">
          <div style="flex:1;min-width:0">
            <div style="font-family:var(--font-title);color:${done ? 'var(--red)' : 'var(--dim)'};font-size:.78rem">${done ? '✅' : '☐'} ${done ? b.name : '??? (not yet encountered)'}</div>
            ${done
              ? `<div style="font-size:.54rem;color:var(--blue)">HP:${b.hp} · ATK:${b.atk}</div>${drop ? `<div style="font-size:.52rem;color:#cc88ff">🌟 Drop: ${drop.name}</div>` : ''}`
              : `<div style="font-size:.54rem;color:var(--dim)">Find and defeat this boss to unlock its entry.</div>`}
          </div>
        </div>`;
      }).join('')}
    </div>`;
  },

  _guideStatus() {
    const entries = Object.values(STATUS_DEF);
    return `<div class="guide-section">
      <div class="gs-title">☠ STATUS EFFECTS</div>
      <div class="gs-body">Status effects are applied during combat — by weapons, skills, enemy attacks, or class abilities. Each lasts for a set number of turns.<br><br>
        <b style="color:#88ffcc">🧠 INT (Intelligence) powers status builds:</b><br>
        • Each INT point multiplies all DoT damage by <b>+4%</b> (INT 10 → ×1.4, INT 15 → ×1.6)<br>
        • INT 8+ extends every status you apply by <b>+1 turn</b>; INT 15+ by <b>+2 turns</b><br>
        • Every 5 INT adds <b>+5% application chance</b> to weapon status procs and poison-on-hit
      </div>
    </div>
    <div class="guide-section">
      <div class="gs-title">🧠 INT — STATUS BUILD SCALING</div>
      <div class="gs-body">
        INT is the <b style="color:#88ffcc">primary offensive stat for non-physical builds</b>. While STR boosts direct ATK damage, INT multiplies every damage-over-time tick:<br><br>
        <div style="font-family:var(--font-mono);font-size:.58rem;line-height:1.8;color:var(--blue)">
          INT  5 → ×1.20 DoT · +0 turns · +5% apply<br>
          INT  8 → ×1.32 DoT · +1 turn  · +5% apply<br>
          INT 10 → ×1.40 DoT · +1 turn  · +10% apply<br>
          INT 15 → ×1.60 DoT · +2 turns · +15% apply<br>
          INT 20 → ×1.80 DoT · +2 turns · +20% apply
        </div><br>
        <b style="color:var(--amber)">Best used with:</b> Techie (Shock), Ranger (Poison), Mutant (Acid/Bio), Pyro (Burn). Classes that poison-on-hit, use elemental weapons, or apply burn naturally pair with high INT to maximise status damage output.
      </div>
    </div>
    ${entries.map(def => `
      <div class="guide-section">
        <div class="gs-title" style="color:${def.color}">${def.icon} ${def.label}</div>
        <div class="gs-body">
          ${def.tip || def.desc || ''}
          ${def.dmgPerTurn ? `<br>• <span style="color:var(--red)">Deals ${def.dmgPerTurn} dmg/turn <span style="color:var(--dim);font-size:.88em">(×INT mult)</span></span>` : ''}
          ${def.radPerTurn ? `<br>• <span style="color:#4dff4d">Adds ${def.radPerTurn} RAD per turn</span>` : ''}
          ${def.defShred ? `<br>• <span style="color:var(--amber)">Reduces target ATK by ${def.defShred} per tick</span>` : ''}
          ${def.stunChance ? `<br>• <span style="color:var(--blue)">${Math.round(def.stunChance*100)}% chance to stun per turn</span>` : ''}
          ${def.apPenalty ? `<br>• <span style="color:var(--blue)">Burns ${def.apPenalty} AP per turn (or slows enemy)</span>` : ''}
          ${def.skipsTurn ? `<br>• <span style="color:var(--red)">Target skips their turn</span>` : ''}
          ${def.skipChance ? `<br>• <span style="color:var(--amber)">${Math.round(def.skipChance*100)}% chance to skip turn</span>` : ''}
          ${def.dmgReduce ? `<br>• <span style="color:var(--blue)">Reduces incoming damage by ${Math.round(def.dmgReduce*100)}%</span>` : ''}
          <br>• <span style="color:var(--dim)">Base duration: ${def.duration} turn${def.duration !== 1 ? 's' : ''} (extended by INT)</span>
        </div>
      </div>
    `).join('')}`;
  },

  toast(msg, duration) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.style.opacity = '1';
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => el.style.opacity = '0', duration || 1800);
  },
};

// Expose globally for inline onclick handlers
window.G = G;

// ─── BOOT ───
document.addEventListener('DOMContentLoaded', () => {
  G.init();
});



// ═══════════════════════════════════════════════════════════════
//  PREMIUM STORE INTEGRATION
// ═══════════════════════════════════════════════════════════════

G.showStore = function() {
  // Initialize Stripe if not already done
  if (!window.Stripe) {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.onload = () => {
      window.stripe = Stripe('pk_live_51TKimHGz3LGNY9vIPyp45wik3GQSBGYHZvr2MtHuRK6n5yfnIoR0FDchARA1yoigv4fWOXITQUASyMWww7M7fCdw00UzT6EWXf');
      this.showStore();
    };
    document.head.appendChild(script);
    this.toast('Loading store...', 1500);
    return;
  }
  
  if (!window.stripe) {
    window.stripe = Stripe('pk_live_51TKimHGz3LGNY9vIPyp45wik3GQSBGYHZvr2MtHuRK6n5yfnIoR0FDchARA1yoigv4fWOXITQUASyMWww7M7fCdw00UzT6EWXf');
  }
  
  const storeHTML = `
    <div id="store-screen" class="screen" style="display:flex;flex-direction:column;overflow-y:auto;padding:20px 12px;background:linear-gradient(180deg,#1a1410 0%,#0f0a06 100%);min-height:100vh">
      <button style="position:absolute;top:12px;left:12px;font-family:var(--font-title);font-size:.9rem;padding:8px 16px;background:linear-gradient(180deg,#5d4428 0%,#3d2914 100%);border:2px solid #7a6a4a;border-radius:6px;color:#d4a44a;cursor:pointer;z-index:100;letter-spacing:.05em" onclick="G.closeStore()">← BACK</button>
      
      <h2 style="font-family:var(--font-title);font-size:2rem;color:#d4a44a;text-align:center;margin:40px 0 24px;letter-spacing:.08em;text-shadow:2px 2px 0 #000,0 0 10px rgba(212,164,74,0.5)">🏪 PREMIUM STORE</h2>
      
      <div style="display:flex;flex-direction:column;gap:24px">
        <!-- Premium Category -->
        <div>
          <h3 style="font-family:var(--font-title);font-size:1.3rem;color:#f5a442;margin-bottom:12px;padding-bottom:6px;border-bottom:2px solid rgba(245,164,66,0.3);letter-spacing:.05em">💎 Premium</h3>
          <div style="background:linear-gradient(145deg,rgba(76,29,149,0.2) 0%,rgba(30,27,75,0.3) 100%);border:2px solid #d4a44a;border-radius:8px;padding:16px">
            <h4 style="font-family:var(--font-mono);font-size:1rem;color:#f5d742;margin:0 0 8px">Wasteland Zero Premium</h4>
            <p style="font-family:var(--font-mono);font-size:.8rem;color:#a8c4d4;line-height:1.4;margin:0 0 12px">Remove branding, exclusive title screen, priority support</p>
            <button onclick="G.purchaseProduct('premium_unlock', 499)" style="font-family:var(--font-title);font-size:1.1rem;width:100%;padding:10px;background:linear-gradient(180deg,#d4a44a 0%,#b38838 100%);border:2px solid #f5d742;border-radius:6px;color:#1a1410;text-shadow:1px 1px 0 rgba(255,255,255,0.3);box-shadow:0 3px 0 #8b6b2c;cursor:pointer;letter-spacing:.05em">$4.99</button>
          </div>
        </div>
        
        <!-- Boosts Category -->
        <div>
          <h3 style="font-family:var(--font-title);font-size:1.3rem;color:#f5a442;margin-bottom:12px;padding-bottom:6px;border-bottom:2px solid rgba(245,164,66,0.3);letter-spacing:.05em">⚡ Boosts</h3>
          
          <div style="display:flex;flex-direction:column;gap:12px">
            <div style="background:linear-gradient(145deg,rgba(76,29,149,0.2) 0%,rgba(30,27,75,0.3) 100%);border:2px solid rgba(167,139,250,0.4);border-radius:8px;padding:14px">
              <h4 style="font-family:var(--font-mono);font-size:1rem;color:#f5d742;margin:0 0 6px">24h XP Boost</h4>
              <p style="font-family:var(--font-mono);font-size:.8rem;color:#a8c4d4;line-height:1.4;margin:0 0 10px">+50% XP gain for 24 hours</p>
              <button onclick="G.purchaseProduct('xp_boost_24h', 99)" style="font-family:var(--font-title);font-size:1.1rem;width:100%;padding:10px;background:linear-gradient(180deg,#d4a44a 0%,#b38838 100%);border:2px solid #f5d742;border-radius:6px;color:#1a1410;cursor:pointer">$0.99</button>
            </div>
            
            <div style="background:linear-gradient(145deg,rgba(76,29,149,0.2) 0%,rgba(30,27,75,0.3) 100%);border:2px solid rgba(167,139,250,0.4);border-radius:8px;padding:14px">
              <h4 style="font-family:var(--font-mono);font-size:1rem;color:#f5d742;margin:0 0 6px">Mega Boost Bundle</h4>
              <p style="font-family:var(--font-mono);font-size:.8rem;color:#a8c4d4;line-height:1.4;margin:0 0 10px">All 3 boosts (XP, Loot, Caps) for 24h - Save 33%!</p>
              <button onclick="G.purchaseProduct('mega_boost_bundle', 199)" style="font-family:var(--font-title);font-size:1.1rem;width:100%;padding:10px;background:linear-gradient(180deg,#d4a44a 0%,#b38838 100%);border:2px solid #f5d742;border-radius:6px;color:#1a1410;cursor:pointer">$1.99</button>
            </div>
          </div>
        </div>
        
        <!-- Info -->
        <div style="margin-top:12px;padding:16px;background:rgba(61,41,20,0.3);border-radius:8px;border:1px solid #5d4428">
          <p style="font-family:var(--font-mono);font-size:.75rem;color:#a8c4d4;text-align:center;line-height:1.5;margin:0">
            💳 All purchases are secure via Stripe<br>
            💰 <strong style="color:#4ade80">LIVE MODE</strong> - Real payments enabled!<br>
            🚀 Support development & unlock exclusive content!
          </p>
        </div>
      </div>
    </div>
  `;
  
  document.getElementById('app').insertAdjacentHTML('beforeend', storeHTML);
  this.hideAllScreens();
  document.getElementById('store-screen').style.display = 'flex';
  if (AudioEngine && AudioEngine.sfx && AudioEngine.sfx.click) AudioEngine.sfx.click();
};

G.purchaseProduct = async function(productId, priceInCents) {
  const userId = `slot_${this.currentSlot || 1}`;
  const apiUrl = window.location.origin;
  
  this.toast('Opening checkout...', 2000);
  
  try {
    const response = await fetch(`${apiUrl}/api/payments/create-checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: productId,
        user_id: userId,
        success_url: `${window.location.origin}/game.html?purchase=success`,
        cancel_url: `${window.location.origin}/game.html?purchase=cancelled`
      })
    });
    
    const data = await response.json();
    
    if (data.session_id && window.stripe) {
      const result = await window.stripe.redirectToCheckout({
        sessionId: data.session_id
      });
      
      if (result.error) {
        this.toast(`Error: ${result.error.message}`, 3000);
      }
    } else {
      this.toast('Failed to create checkout session', 3000);
    }
  } catch (error) {
    console.error('Purchase error:', error);
    this.toast('Purchase failed - please try again', 3000);
  }
};

G.closeStore = function() {
  const storeScreen = document.getElementById('store-screen');
  if (storeScreen) storeScreen.remove();
  this.show('screen-start');
  AudioEngine.sfx.click && AudioEngine.sfx.click();
};

// XP Boost integration
G._originalGainXP = G.gainXP;
G.gainXP = function(amount, reason = '') {
  let finalAmount = amount;
  
  if (typeof Store !== 'undefined' && Store.hasActiveBenefit && Store.hasActiveBenefit('xp_boost_24h')) {
    finalAmount = Math.floor(amount * 1.5);
    if (reason) reason += ' <span style="color:#c084fc">(+50% BOOST)</span>';
  }
  
  return this._originalGainXP.call(this, finalAmount, reason);
};

// Caps Boost integration  
G._originalAddCaps = function(amount, silent = false) {
  this.state.caps = (this.state.caps || 0) + amount;
  if (!silent) this.renderHUD();
};

G.addCaps = function(amount, silent = false) {
  let finalAmount = amount;
  
  if (typeof Store !== 'undefined' && Store.hasActiveBenefit && Store.hasActiveBenefit('caps_boost_24h')) {
    finalAmount = Math.floor(amount * 1.5);
  }
  
  this._originalAddCaps.call(this, finalAmount, silent);
  if (!silent && finalAmount !== amount) {
    this.toast(`+${finalAmount} 💰 <span style="color:#c084fc">(+50% BOOST)</span>`, 1600);
  }
};

// Show active boost indicator
G.updateBoostIndicator = function() {
  if (typeof Store === 'undefined') return;
  
  let boostHTML = '';
  const boosts = [];
  
  if (Store.hasActiveBenefit && Store.hasActiveBenefit('xp_boost_24h')) boosts.push('⚡ XP +50%');
  if (Store.hasActiveBenefit && Store.hasActiveBenefit('loot_boost_24h')) boosts.push('💎 LOOT +25%');
  if (Store.hasActiveBenefit && Store.hasActiveBenefit('caps_boost_24h')) boosts.push('💰 CAPS +50%');
  
  if (boosts.length > 0) {
    boostHTML = `<div class="boost-active-indicator" style="position:fixed;top:60px;right:12px;background:linear-gradient(135deg,#6d28d9 0%,#4c1d95 100%);border:2px solid #c084fc;border-radius:8px;padding:8px 12px;font-family:var(--font-title);font-size:.75rem;color:#e9d5ff;letter-spacing:.05em;z-index:99;box-shadow:0 0 10px rgba(192,132,252,0.4)">${boosts.join(' · ')}</div>`;
  }
  
  const existing = document.querySelector('.boost-active-indicator');
  if (existing) existing.remove();
  
  if (boostHTML) {
    document.getElementById('app').insertAdjacentHTML('beforeend', boostHTML);
  }
};

// Update boost indicator periodically
setInterval(() => {
  if (typeof Store !== 'undefined' && G.state && G.state.screen !== 'start') {
    G.updateBoostIndicator();
  }
}, 5000);

// Remove Emergent badge if premium purchased
if (typeof Store !== 'undefined' && Store.hasActiveBenefit && Store.hasActiveBenefit('no_branding')) {
  const badge = document.getElementById('emergent-badge');
  if (badge) badge.style.display = 'none';
}

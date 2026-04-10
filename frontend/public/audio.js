const AudioEngine = {
  ctx: null, nodes: [], playing: false,

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Resume context if suspended (needed on mobile after user gesture)
    if (this.ctx.state === 'suspended') this.ctx.resume();
  },

  stop() {
    this.nodes.forEach(n => { try { n.stop(); } catch(e) {} });
    this.nodes = [];
    this.playing = false;
  },

  // ─── MUSIC ───
  play(boss = false) {
    if (this.musicOff) return;
    this.init();
    this.stop();
    const c = this.ctx, bpm = boss ? 138 : 118, beat = 60 / bpm;
    const master = c.createGain();
    master.gain.value = .14;
    master.connect(c.destination);

    // ── Kick drum ──
    const kick = () => {
      const o = c.createOscillator(), g = c.createGain();
      o.connect(g); g.connect(master);
      o.frequency.setValueAtTime(160, c.currentTime);
      o.frequency.exponentialRampToValueAtTime(38, c.currentTime + .12);
      g.gain.setValueAtTime(boss ? 1.0 : .85, c.currentTime);
      g.gain.exponentialRampToValueAtTime(.001, c.currentTime + .22);
      o.start(); o.stop(c.currentTime + .22);
    };

    // ── Snare ──
    const snare = () => {
      const buf = c.createBuffer(1, c.sampleRate * .12, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * .75;
      const b = c.createBufferSource(), g = c.createGain();
      b.buffer = buf;
      g.gain.setValueAtTime(.55, c.currentTime);
      g.gain.exponentialRampToValueAtTime(.001, c.currentTime + .12);
      b.connect(g); g.connect(master); b.start();
    };

    // ── Hi-hat ──
    const hihat = (open = false) => {
      const buf = c.createBuffer(1, c.sampleRate * (open ? .08 : .025), c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1);
      const src = c.createBufferSource(), g = c.createGain(), flt = c.createBiquadFilter();
      flt.type = 'highpass'; flt.frequency.value = 7000;
      g.gain.setValueAtTime(.18, c.currentTime);
      g.gain.exponentialRampToValueAtTime(.001, c.currentTime + (open ? .08 : .025));
      src.buffer = buf; src.connect(flt); flt.connect(g); g.connect(master); src.start();
    };

    // ── Bass oscillator ──
    const bassOsc = c.createOscillator(), bassGain = c.createGain();
    bassOsc.type = 'sawtooth';
    bassOsc.frequency.value = 55;
    bassGain.gain.value = .20;
    bassOsc.connect(bassGain); bassGain.connect(master);
    bassOsc.start();
    this.nodes.push(bassOsc);

    // ── Melody lead oscillator ──
    const leadOsc = c.createOscillator(), leadGain = c.createGain();
    leadOsc.type = boss ? 'square' : 'triangle';
    leadOsc.frequency.value = 220;
    leadGain.gain.value = .09;
    leadOsc.connect(leadGain); leadGain.connect(master);
    leadOsc.start();
    this.nodes.push(leadOsc);

    // Note sequences — boss has a darker, faster melody
    const bassNotes   = boss ? [55,55,82,55,73,55,82,55] : [55,55,73,55,82,55,73,55];
    const melodyNotes = boss
      ? [220,185,196,165,185,165,220,185,  196,220,247,220,196,165,185,165]
      : [330,294,330,370,330,294,262,294,  330,370,392,370,330,294,262,294];

    let step = 0;
    const tick = () => {
      if (!this.playing) return;
      const onBeat = step % 2 === 0;
      const offBeat = step % 2 === 1 && step > 0;
      if (onBeat) kick();
      if (offBeat) snare();
      // Hi-hats on every other half-beat
      if (step % 4 === 1 || step % 4 === 3) hihat(step % 8 === 3);
      bassOsc.frequency.setValueAtTime(bassNotes[step % 8], c.currentTime);
      leadOsc.frequency.setValueAtTime(melodyNotes[step % melodyNotes.length], c.currentTime);
      step++;
      setTimeout(tick, beat * 500);
    };
    this.playing = true;
    tick();
  },

  // ─── SOUND EFFECTS ───
  sfx: {
    attack() {
      const c = AudioEngine._getCtx(); if (!c) return;
      const o = c.createOscillator(), g = c.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(320, c.currentTime);
      o.frequency.exponentialRampToValueAtTime(80, c.currentTime + .12);
      g.gain.setValueAtTime(.4, c.currentTime);
      g.gain.exponentialRampToValueAtTime(.001, c.currentTime + .15);
      o.connect(g); g.connect(c.destination);
      o.start(); o.stop(c.currentTime + .15);
    },

    hit() {
      const c = AudioEngine._getCtx(); if (!c) return;
      // low thud
      const o = c.createOscillator(), g = c.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(180, c.currentTime);
      o.frequency.exponentialRampToValueAtTime(50, c.currentTime + .18);
      g.gain.setValueAtTime(.55, c.currentTime);
      g.gain.exponentialRampToValueAtTime(.001, c.currentTime + .2);
      o.connect(g); g.connect(c.destination);
      o.start(); o.stop(c.currentTime + .2);
    },

    crit() {
      const c = AudioEngine._getCtx(); if (!c) return;
      // high sharp crack
      const o = c.createOscillator(), g = c.createGain();
      o.type = 'square';
      o.frequency.setValueAtTime(900, c.currentTime);
      o.frequency.exponentialRampToValueAtTime(200, c.currentTime + .08);
      g.gain.setValueAtTime(.5, c.currentTime);
      g.gain.exponentialRampToValueAtTime(.001, c.currentTime + .14);
      o.connect(g); g.connect(c.destination);
      o.start(); o.stop(c.currentTime + .14);
      // second harmonic layer
      setTimeout(() => {
        const c2 = AudioEngine._getCtx(); if (!c2) return;
        const o2 = c2.createOscillator(), g2 = c2.createGain();
        o2.type = 'sine';
        o2.frequency.setValueAtTime(1200, c2.currentTime);
        o2.frequency.exponentialRampToValueAtTime(400, c2.currentTime + .12);
        g2.gain.setValueAtTime(.3, c2.currentTime);
        g2.gain.exponentialRampToValueAtTime(.001, c2.currentTime + .12);
        o2.connect(g2); g2.connect(c2.destination);
        o2.start(); o2.stop(c2.currentTime + .12);
      }, 30);
    },

    miss() {
      const c = AudioEngine._getCtx(); if (!c) return;
      const o = c.createOscillator(), g = c.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(220, c.currentTime);
      o.frequency.exponentialRampToValueAtTime(160, c.currentTime + .25);
      g.gain.setValueAtTime(.2, c.currentTime);
      g.gain.exponentialRampToValueAtTime(.001, c.currentTime + .28);
      o.connect(g); g.connect(c.destination);
      o.start(); o.stop(c.currentTime + .28);
    },

    heal() {
      const c = AudioEngine._getCtx(); if (!c) return;
      const freqs = [523, 659, 784];
      freqs.forEach((f, i) => {
        setTimeout(() => {
          const c2 = AudioEngine._getCtx(); if (!c2) return;
          const o = c2.createOscillator(), g = c2.createGain();
          o.type = 'sine';
          o.frequency.value = f;
          g.gain.setValueAtTime(.25, c2.currentTime);
          g.gain.exponentialRampToValueAtTime(.001, c2.currentTime + .18);
          o.connect(g); g.connect(c2.destination);
          o.start(); o.stop(c2.currentTime + .18);
        }, i * 70);
      });
    },

    levelup() {
      const c = AudioEngine._getCtx(); if (!c) return;
      const notes = [523, 659, 784, 1047];
      notes.forEach((f, i) => {
        setTimeout(() => {
          const c2 = AudioEngine._getCtx(); if (!c2) return;
          const o = c2.createOscillator(), g = c2.createGain();
          o.type = 'square';
          o.frequency.value = f;
          g.gain.setValueAtTime(.3, c2.currentTime);
          g.gain.exponentialRampToValueAtTime(.001, c2.currentTime + .22);
          o.connect(g); g.connect(c2.destination);
          o.start(); o.stop(c2.currentTime + .22);
        }, i * 90);
      });
    },

    classup() {
      const c = AudioEngine._getCtx(); if (!c) return;
      const notes = [330, 415, 523, 659, 830, 1047];
      notes.forEach((f, i) => {
        setTimeout(() => {
          const c2 = AudioEngine._getCtx(); if (!c2) return;
          const o = c2.createOscillator(), g = c2.createGain();
          o.type = i > 3 ? 'square' : 'sawtooth';
          o.frequency.value = f;
          g.gain.setValueAtTime(.35, c2.currentTime);
          g.gain.exponentialRampToValueAtTime(.001, c2.currentTime + .3);
          o.connect(g); g.connect(c2.destination);
          o.start(); o.stop(c2.currentTime + .3);
        }, i * 80);
      });
    },

    buy() {
      const c = AudioEngine._getCtx(); if (!c) return;
      [880, 1100].forEach((f, i) => {
        setTimeout(() => {
          const c2 = AudioEngine._getCtx(); if (!c2) return;
          const o = c2.createOscillator(), g = c2.createGain();
          o.type = 'sine';
          o.frequency.value = f;
          g.gain.setValueAtTime(.2, c2.currentTime);
          g.gain.exponentialRampToValueAtTime(.001, c2.currentTime + .12);
          o.connect(g); g.connect(c2.destination);
          o.start(); o.stop(c2.currentTime + .12);
        }, i * 60);
      });
    },

    flee() {
      const c = AudioEngine._getCtx(); if (!c) return;
      const o = c.createOscillator(), g = c.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(600, c.currentTime);
      o.frequency.exponentialRampToValueAtTime(150, c.currentTime + .35);
      g.gain.setValueAtTime(.3, c.currentTime);
      g.gain.exponentialRampToValueAtTime(.001, c.currentTime + .38);
      o.connect(g); g.connect(c.destination);
      o.start(); o.stop(c.currentTime + .38);
    },

    equip() {
      const c = AudioEngine._getCtx(); if (!c) return;
      const o = c.createOscillator(), g = c.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(440, c.currentTime);
      o.frequency.linearRampToValueAtTime(660, c.currentTime + .1);
      g.gain.setValueAtTime(.25, c.currentTime);
      g.gain.exponentialRampToValueAtTime(.001, c.currentTime + .16);
      o.connect(g); g.connect(c.destination);
      o.start(); o.stop(c.currentTime + .16);
    },

    death() {
      const c = AudioEngine._getCtx(); if (!c) return;
      const o = c.createOscillator(), g = c.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(220, c.currentTime);
      o.frequency.exponentialRampToValueAtTime(40, c.currentTime + .8);
      g.gain.setValueAtTime(.5, c.currentTime);
      g.gain.exponentialRampToValueAtTime(.001, c.currentTime + .9);
      o.connect(g); g.connect(c.destination);
      o.start(); o.stop(c.currentTime + .9);
    },

    win() {
      const c = AudioEngine._getCtx(); if (!c) return;
      const notes = [523, 659, 784, 659, 784, 1047];
      notes.forEach((f, i) => {
        setTimeout(() => {
          const c2 = AudioEngine._getCtx(); if (!c2) return;
          const o = c2.createOscillator(), g = c2.createGain();
          o.type = 'square';
          o.frequency.value = f;
          g.gain.setValueAtTime(.3, c2.currentTime);
          g.gain.exponentialRampToValueAtTime(.001, c2.currentTime + .28);
          o.connect(g); g.connect(c2.destination);
          o.start(); o.stop(c2.currentTime + .28);
        }, i * 110);
      });
    },

    rad() {
      const c = AudioEngine._getCtx(); if (!c) return;
      // geiger-like noise burst
      const buf = c.createBuffer(1, c.sampleRate * .15, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const src = c.createBufferSource();
      src.buffer = buf;
      const g = c.createGain(), flt = c.createBiquadFilter();
      flt.type = 'bandpass'; flt.frequency.value = 2000; flt.Q.value = 0.5;
      g.gain.setValueAtTime(.3, c.currentTime);
      g.gain.exponentialRampToValueAtTime(.001, c.currentTime + .15);
      src.connect(flt); flt.connect(g); g.connect(c.destination);
      src.start(); src.stop(c.currentTime + .15);
    },

    move() {
      const c = AudioEngine._getCtx(); if (!c) return;
      const o = c.createOscillator(), g = c.createGain();
      o.type = 'sine';
      o.frequency.value = 180 + Math.random() * 60;
      g.gain.setValueAtTime(.08, c.currentTime);
      g.gain.exponentialRampToValueAtTime(.001, c.currentTime + .07);
      o.connect(g); g.connect(c.destination);
      o.start(); o.stop(c.currentTime + .07);
    },

    brace() {
      const c = AudioEngine._getCtx(); if (!c) return;
      const o = c.createOscillator(), g = c.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(300, c.currentTime);
      o.frequency.linearRampToValueAtTime(200, c.currentTime + .15);
      g.gain.setValueAtTime(.3, c.currentTime);
      g.gain.exponentialRampToValueAtTime(.001, c.currentTime + .2);
      o.connect(g); g.connect(c.destination);
      o.start(); o.stop(c.currentTime + .2);
    },

    vats() {
      const c = AudioEngine._getCtx(); if (!c) return;
      [800, 1000, 1200].forEach((f, i) => {
        setTimeout(() => {
          const c2 = AudioEngine._getCtx(); if (!c2) return;
          const o = c2.createOscillator(), g = c2.createGain();
          o.type = 'square';
          o.frequency.value = f;
          g.gain.setValueAtTime(.15, c2.currentTime);
          g.gain.exponentialRampToValueAtTime(.001, c2.currentTime + .06);
          o.connect(g); g.connect(c2.destination);
          o.start(); o.stop(c2.currentTime + .06);
        }, i * 40);
      });
    },

    // ── Dice roll: rattling tumble then landing thud ──
    diceRoll() {
      const c = AudioEngine._getCtx(); if (!c) return;
      // Rattle burst
      for (let i = 0; i < 12; i++) {
        setTimeout(() => {
          const c2 = AudioEngine._getCtx(); if (!c2) return;
          const buf = c2.createBuffer(1, c2.sampleRate * .05, c2.sampleRate);
          const d = buf.getChannelData(0);
          for (let j = 0; j < d.length; j++) d[j] = (Math.random() * 2 - 1) * .55;
          const src = c2.createBufferSource(), g = c2.createGain();
          const flt = c2.createBiquadFilter();
          flt.type = 'bandpass'; flt.frequency.value = 800 + Math.random() * 1200; flt.Q.value = 1.5;
          g.gain.setValueAtTime(.35, c2.currentTime);
          g.gain.exponentialRampToValueAtTime(.001, c2.currentTime + .05);
          src.buffer = buf; src.connect(flt); flt.connect(g); g.connect(c2.destination);
          src.start();
        }, i * 90);
      }
      // Landing thud at the end
      setTimeout(() => {
        const c2 = AudioEngine._getCtx(); if (!c2) return;
        const o = c2.createOscillator(), g = c2.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(200, c2.currentTime);
        o.frequency.exponentialRampToValueAtTime(60, c2.currentTime + .18);
        g.gain.setValueAtTime(.6, c2.currentTime);
        g.gain.exponentialRampToValueAtTime(.001, c2.currentTime + .22);
        o.connect(g); g.connect(c2.destination);
        o.start(); o.stop(c2.currentTime + .22);
      }, 1060);
    },

    // ── Dice SUCCESS: bright triumphant ding ──
    diceSuccess() {
      const c = AudioEngine._getCtx(); if (!c) return;
      [523, 659, 784, 1047].forEach((f, i) => {
        setTimeout(() => {
          const c2 = AudioEngine._getCtx(); if (!c2) return;
          const o = c2.createOscillator(), g = c2.createGain();
          o.type = i < 2 ? 'triangle' : 'sine';
          o.frequency.value = f;
          g.gain.setValueAtTime(.32, c2.currentTime);
          g.gain.exponentialRampToValueAtTime(.001, c2.currentTime + .28);
          o.connect(g); g.connect(c2.destination);
          o.start(); o.stop(c2.currentTime + .28);
        }, i * 75);
      });
    },

    // ── Dice FAIL: descending sad chord ──
    diceFail() {
      const c = AudioEngine._getCtx(); if (!c) return;
      [392, 330, 277, 233].forEach((f, i) => {
        setTimeout(() => {
          const c2 = AudioEngine._getCtx(); if (!c2) return;
          const o = c2.createOscillator(), g = c2.createGain();
          o.type = 'sawtooth';
          o.frequency.value = f;
          g.gain.setValueAtTime(.22, c2.currentTime);
          g.gain.exponentialRampToValueAtTime(.001, c2.currentTime + .32);
          o.connect(g); g.connect(c2.destination);
          o.start(); o.stop(c2.currentTime + .32);
        }, i * 95);
      });
    },

    // ── Rift ambient whoosh ──
    rift() {
      const c = AudioEngine._getCtx(); if (!c) return;
      // Eerie sweep up
      const o = c.createOscillator(), g = c.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(80, c.currentTime);
      o.frequency.exponentialRampToValueAtTime(600, c.currentTime + .7);
      o.frequency.exponentialRampToValueAtTime(120, c.currentTime + 1.4);
      g.gain.setValueAtTime(0, c.currentTime);
      g.gain.linearRampToValueAtTime(.28, c.currentTime + .35);
      g.gain.exponentialRampToValueAtTime(.001, c.currentTime + 1.5);
      o.connect(g); g.connect(c.destination);
      o.start(); o.stop(c.currentTime + 1.5);
      // Noise layer
      const buf = c.createBuffer(1, c.sampleRate * 1.5, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * .4;
      const src = c.createBufferSource(), g2 = c.createGain();
      const flt = c.createBiquadFilter();
      flt.type = 'bandpass'; flt.frequency.value = 300; flt.Q.value = 0.5;
      g2.gain.setValueAtTime(0, c.currentTime);
      g2.gain.linearRampToValueAtTime(.18, c.currentTime + .4);
      g2.gain.exponentialRampToValueAtTime(.001, c.currentTime + 1.5);
      src.buffer = buf; src.connect(flt); flt.connect(g2); g2.connect(c.destination);
      src.start();
    },

    // ── Rift REWARD fanfare ──
    riftReward() {
      const c = AudioEngine._getCtx(); if (!c) return;
      [196, 247, 294, 392, 523, 784].forEach((f, i) => {
        setTimeout(() => {
          const c2 = AudioEngine._getCtx(); if (!c2) return;
          const o = c2.createOscillator(), g = c2.createGain();
          o.type = i > 3 ? 'square' : 'sawtooth';
          o.frequency.value = f;
          g.gain.setValueAtTime(.28, c2.currentTime);
          g.gain.exponentialRampToValueAtTime(.001, c2.currentTime + .35);
          o.connect(g); g.connect(c2.destination);
          o.start(); o.stop(c2.currentTime + .35);
        }, i * 70);
      });
    },
  },

  _getCtx() {
    if (this.sfxOff) return null;
    try {
      this.init();
      return this.ctx;
    } catch(e) { return null; }
  },
};

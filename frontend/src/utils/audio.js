// Web Audio API Sound Engine
class AudioEngine {
  constructor() {
    this.context = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.musicGain = null;
    this.sfxEnabled = true;
    this.musicEnabled = true;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    
    try {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
      
      // Master gain
      this.masterGain = this.context.createGain();
      this.masterGain.connect(this.context.destination);
      this.masterGain.gain.value = 0.5;
      
      // SFX gain
      this.sfxGain = this.context.createGain();
      this.sfxGain.connect(this.masterGain);
      this.sfxGain.gain.value = 0.7;
      
      // Music gain
      this.musicGain = this.context.createGain();
      this.musicGain.connect(this.masterGain);
      this.musicGain.gain.value = 0.3;
      
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio not supported:', e);
    }
  }

  resume() {
    if (this.context?.state === 'suspended') {
      this.context.resume();
    }
  }

  // Create an oscillator-based sound
  playTone(frequency, duration, type = 'sine', volume = 0.5) {
    if (!this.initialized || !this.sfxEnabled) return;
    this.resume();
    
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.type = type;
    osc.frequency.value = frequency;
    
    gain.gain.setValueAtTime(volume * 0.5, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(this.sfxGain);
    
    osc.start();
    osc.stop(this.context.currentTime + duration);
  }

  // Play noise burst (for hits)
  playNoise(duration, volume = 0.3) {
    if (!this.initialized || !this.sfxEnabled) return;
    this.resume();
    
    const bufferSize = this.context.sampleRate * duration;
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    
    const gain = this.context.createGain();
    gain.gain.setValueAtTime(volume * 0.4, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);
    
    const filter = this.context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000;
    
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    
    source.start();
  }

  // Sound effects
  playHit() {
    this.playNoise(0.1, 0.4);
    this.playTone(150, 0.1, 'square', 0.3);
  }

  playCrit() {
    this.playNoise(0.15, 0.5);
    this.playTone(300, 0.1, 'sawtooth', 0.4);
    this.playTone(450, 0.15, 'sawtooth', 0.3);
  }

  playMiss() {
    this.playTone(200, 0.15, 'sine', 0.2);
    this.playTone(150, 0.2, 'sine', 0.15);
  }

  playDeath() {
    this.playNoise(0.3, 0.4);
    this.playTone(200, 0.2, 'sawtooth', 0.4);
    this.playTone(100, 0.4, 'sawtooth', 0.3);
  }

  playLevelUp() {
    const notes = [262, 330, 392, 523]; // C E G C
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 0.3, 'sine', 0.4);
      }, i * 100);
    });
  }

  playLoot() {
    this.playTone(440, 0.1, 'sine', 0.3);
    setTimeout(() => this.playTone(554, 0.1, 'sine', 0.3), 50);
    setTimeout(() => this.playTone(659, 0.15, 'sine', 0.3), 100);
  }

  playItemPickup() {
    this.playTone(600, 0.08, 'sine', 0.25);
    setTimeout(() => this.playTone(800, 0.1, 'sine', 0.2), 50);
  }

  playButtonClick() {
    this.playTone(400, 0.05, 'square', 0.15);
  }

  playError() {
    this.playTone(200, 0.15, 'square', 0.3);
    setTimeout(() => this.playTone(150, 0.2, 'square', 0.25), 100);
  }

  playHeal() {
    this.playTone(400, 0.15, 'sine', 0.3);
    setTimeout(() => this.playTone(500, 0.15, 'sine', 0.25), 100);
    setTimeout(() => this.playTone(600, 0.2, 'sine', 0.2), 200);
  }

  playBossAppear() {
    this.playNoise(0.5, 0.3);
    this.playTone(80, 0.5, 'sawtooth', 0.5);
    setTimeout(() => this.playTone(60, 0.6, 'sawtooth', 0.4), 200);
  }

  playVictory() {
    const melody = [392, 440, 494, 523, 587, 659, 784];
    melody.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 0.2, 'sine', 0.35);
      }, i * 120);
    });
  }

  playDefeat() {
    const melody = [400, 350, 300, 250, 200];
    melody.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 0.25, 'sawtooth', 0.3);
      }, i * 150);
    });
  }

  toggleSFX() {
    this.sfxEnabled = !this.sfxEnabled;
    return this.sfxEnabled;
  }

  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    if (this.musicGain) {
      this.musicGain.gain.value = this.musicEnabled ? 0.3 : 0;
    }
    return this.musicEnabled;
  }

  setMasterVolume(value) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, value));
    }
  }
}

export const audioEngine = new AudioEngine();
export default audioEngine;

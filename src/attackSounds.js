// attackSounds.js — Web Audio API sound effects for attack visualizations

function ctx() {
  try { return new (window.AudioContext || window.webkitAudioContext)(); } catch(e) { return null; }
}

// Single beep
function beep(freq = 440, type = 'sine', duration = 0.15, vol = 0.08) {
  const c = ctx(); if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.connect(g); g.connect(c.destination);
  o.type = type; o.frequency.setValueAtTime(freq, c.currentTime);
  g.gain.setValueAtTime(vol, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
  o.start(); o.stop(c.currentTime + duration);
}

// Keyboard click (typing sound)
export function sfxType() {
  beep(800 + Math.random() * 400, 'square', 0.04, 0.04);
}

// Alert / warning
export function sfxAlert() {
  beep(220, 'sawtooth', 0.25, 0.1);
  setTimeout(() => beep(180, 'sawtooth', 0.3, 0.1), 200);
}

// Chain break / error
export function sfxBreak() {
  const c = ctx(); if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.connect(g); g.connect(c.destination);
  o.type = 'sawtooth';
  o.frequency.setValueAtTime(300, c.currentTime);
  o.frequency.linearRampToValueAtTime(80, c.currentTime + 0.4);
  g.gain.setValueAtTime(0.1, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.4);
  o.start(); o.stop(c.currentTime + 0.4);
}

// Mining / hashing loop sound (returns stop function)
export function sfxMineStart() {
  const c = ctx(); if (!c) return () => {};
  const o = c.createOscillator();
  const g = c.createGain();
  o.connect(g); g.connect(c.destination);
  o.type = 'sawtooth';
  o.frequency.setValueAtTime(80, c.currentTime);
  o.frequency.linearRampToValueAtTime(160, c.currentTime + 0.2);
  g.gain.setValueAtTime(0.04, c.currentTime);
  o.start();
  return () => { try { g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.1); o.stop(c.currentTime + 0.1); c.close(); } catch(e) {} };
}

// Block mined / success
export function sfxSuccess() {
  const c = ctx(); if (!c) return;
  [440, 554, 660].forEach((f, i) => {
    setTimeout(() => {
      const o = c.createOscillator(); const g = c.createGain();
      o.connect(g); g.connect(c.destination);
      o.type = 'sine'; o.frequency.setValueAtTime(f, c.currentTime);
      g.gain.setValueAtTime(0.08, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.2);
      o.start(); o.stop(c.currentTime + 0.2);
    }, i * 100);
  });
}

// Rejection / failure
export function sfxReject() {
  const c = ctx(); if (!c) return;
  [300, 200, 150].forEach((f, i) => {
    setTimeout(() => {
      const o = c.createOscillator(); const g = c.createGain();
      o.connect(g); g.connect(c.destination);
      o.type = 'square'; o.frequency.setValueAtTime(f, c.currentTime);
      g.gain.setValueAtTime(0.1, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.25);
      o.start(); o.stop(c.currentTime + 0.25);
    }, i * 120);
  });
}

// Intercept / steal sound (glitchy)
export function sfxIntercept() {
  const c = ctx(); if (!c) return;
  for (let i = 0; i < 6; i++) {
    setTimeout(() => {
      beep(200 + Math.random() * 800, 'square', 0.06, 0.06);
    }, i * 60);
  }
}

// Packet travelling (rising tone)
export function sfxPacket() {
  const c = ctx(); if (!c) return;
  const o = c.createOscillator(); const g = c.createGain();
  o.connect(g); g.connect(c.destination);
  o.type = 'sine';
  o.frequency.setValueAtTime(300, c.currentTime);
  o.frequency.linearRampToValueAtTime(600, c.currentTime + 0.5);
  g.gain.setValueAtTime(0.05, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.5);
  o.start(); o.stop(c.currentTime + 0.5);
}

// Flood / spam (rapid low beeps)
export function sfxFlood() {
  for (let i = 0; i < 4; i++) {
    setTimeout(() => beep(100 + i * 30, 'square', 0.08, 0.05), i * 80);
  }
}

// Network switch / broadcast
export function sfxBroadcast() {
  const c = ctx(); if (!c) return;
  const o = c.createOscillator(); const g = c.createGain();
  o.connect(g); g.connect(c.destination);
  o.type = 'sine';
  o.frequency.setValueAtTime(600, c.currentTime);
  o.frequency.exponentialRampToValueAtTime(200, c.currentTime + 0.6);
  g.gain.setValueAtTime(0.1, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.6);
  o.start(); o.stop(c.currentTime + 0.6);
}

// Orphan / fade out
export function sfxOrphan() {
  const c = ctx(); if (!c) return;
  const o = c.createOscillator(); const g = c.createGain();
  o.connect(g); g.connect(c.destination);
  o.type = 'sawtooth';
  o.frequency.setValueAtTime(150, c.currentTime);
  o.frequency.linearRampToValueAtTime(50, c.currentTime + 0.8);
  g.gain.setValueAtTime(0.07, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.8);
  o.start(); o.stop(c.currentTime + 0.8);
}

// Lottery spin (rising/falling)
export function sfxLotterySpin() {
  const c = ctx(); if (!c) return;
  const o = c.createOscillator(); const g = c.createGain();
  o.connect(g); g.connect(c.destination);
  o.type = 'sine';
  o.frequency.setValueAtTime(200, c.currentTime);
  o.frequency.linearRampToValueAtTime(800, c.currentTime + 0.8);
  o.frequency.linearRampToValueAtTime(400, c.currentTime + 1.2);
  g.gain.setValueAtTime(0.06, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 1.2);
  o.start(); o.stop(c.currentTime + 1.2);
}

// Winner reveal
export function sfxWinner() {
  const c = ctx(); if (!c) return;
  [261, 329, 392, 523].forEach((f, i) => {
    setTimeout(() => {
      const o = c.createOscillator(); const g = c.createGain();
      o.connect(g); g.connect(c.destination);
      o.type = 'sine'; o.frequency.setValueAtTime(f, c.currentTime);
      g.gain.setValueAtTime(0.1, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.3);
      o.start(); o.stop(c.currentTime + 0.3);
    }, i * 120);
  });
}

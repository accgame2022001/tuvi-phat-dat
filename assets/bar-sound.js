(function (global) {
  'use strict';

  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  const buffers = new WeakMap();

  function noiseBuffer(ctx, brown) {
    let set = buffers.get(ctx);
    if (!set) buffers.set(ctx, set = {});
    const key = brown ? 'brown' : 'white';
    if (set[key]) return set[key];
    const len = Math.ceil(ctx.sampleRate * 2);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (brown) { last = (last + 0.02 * w) / 1.02; d[i] = Math.max(-1, Math.min(1, last * 3.4)); }
      else d[i] = w;
    }
    return (set[key] = buf);
  }

  function panner(ctx, pan) {
    if (!ctx.createStereoPanner) return null;
    const p = ctx.createStereoPanner();
    p.pan.value = pan;
    return p;
  }

  const BPM = 72;
  const STEP = 60 / BPM / 4;
  const PROG = [
    { chord: [57, 62, 64, 69], bass: 45 },
    { chord: [53, 57, 60, 64], bass: 41 },
    { chord: [55, 59, 62, 67], bass: 43 },
    { chord: [52, 57, 59, 64], bass: 40 },
  ];
  const PHRASES = [
    [[0, 76, 3], [3, 74, 2], [6, 72, 3], [10, 69, 4], [14, 72, 2]],
    [[0, 79, 4], [4, 76, 2], [6, 74, 2], [8, 72, 4], [12, 69, 4]],
    [[0, 72, 2], [2, 74, 2], [4, 76, 4], [8, 79, 3], [12, 81, 4]],
    [[0, 81, 3], [4, 79, 2], [6, 76, 3], [10, 74, 2], [12, 69, 4]],
  ];

  class Band {
    constructor(ctx, destination) {
      this.ctx = ctx;
      this.mix = ctx.createGain();
      this.mix.gain.value = 1.0;
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -20; comp.knee.value = 18; comp.ratio.value = 2.5;
      comp.attack.value = .01; comp.release.value = .25;
      this.out = ctx.createGain();
      this.out.gain.value = 1;
      this.mix.connect(comp); comp.connect(this.out); this.out.connect(destination);

      const delay = ctx.createDelay(1.2);
      delay.delayTime.value = STEP * 3;
      const fb = ctx.createGain(); fb.gain.value = .36;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1800;
      delay.connect(lp); lp.connect(fb); fb.connect(delay); delay.connect(this.mix);
      this.delaySend = ctx.createGain(); this.delaySend.gain.value = .42;
      this.delaySend.connect(delay);
      this._started = false;
    }

    start() {
      if (this._started) return;
      this._started = true;
      this._step = 0;
      this._next = this.ctx.currentTime + .12;
      this._timer = setInterval(() => this._tick(), 180);
      this._tick();
    }

    stop() {
      clearInterval(this._timer);
      this._started = false;
      try { this.out.disconnect(); } catch {}
    }

    _tick() {
      const ahead = this.ctx.currentTime + .5;
      while (this._next < ahead) {
        this._at(this._step, this._next);
        this._next += STEP;
        this._step++;
      }
    }

    _at(step, t) {
      const s = step % 16, bar = Math.floor(step / 16), b8 = bar % 8, prog = PROG[b8 % 4];
      if (s === 0) {
        this._pad(t, prog.chord, STEP * 15);
        this._bass(t, prog.bass, STEP * 8);
      }
      if (s === 8) this._bass(t, prog.bass + 7, STEP * 7);
      if (s % 4 === 0 && b8 % 2 === 0 && s === 0) this._bell(t, prog.chord[2] + 12, .05);
      if (s === 4 || s === 12) this._woodblock(t, s === 4 ? 680 : 620, .022);
      for (const [at, midi, len] of PHRASES[b8 % 4]) {
        if (at === s) this._zither(t, midi, len * STEP);
      }
      if (b8 % 2 === 1 && s === 6) this._flute(t, prog.chord[3] + 12, STEP * 6);
    }

    _zither(t, midi, dur) {
      const ctx = this.ctx;
      const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(mtof(midi), t);
      const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.setValueAtTime(mtof(midi + 12), t);
      const f = ctx.createBiquadFilter(); f.type = 'lowpass';
      f.frequency.setValueAtTime(3200, t);
      f.frequency.exponentialRampToValueAtTime(850, t + dur);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(.07, t + .008);
      g.gain.exponentialRampToValueAtTime(.0008, t + dur * 1.2);
      const g2 = ctx.createGain(); g2.gain.value = .25;
      o.connect(f); o2.connect(g2); g2.connect(f);
      f.connect(g); g.connect(this.mix); g.connect(this.delaySend);
      o.start(t); o2.start(t); o.stop(t + dur * 1.25); o2.stop(t + dur * 1.25);
    }

    _flute(t, midi, dur) {
      const ctx = this.ctx;
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(mtof(midi), t);
      const vib = ctx.createOscillator(); vib.frequency.value = 5.2;
      const vg = ctx.createGain(); vg.gain.value = 3.5;
      vib.connect(vg); vg.connect(o.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(.032, t + .18);
      g.gain.linearRampToValueAtTime(.024, t + dur * .7);
      g.gain.exponentialRampToValueAtTime(.0006, t + dur);
      o.connect(g); g.connect(this.mix); g.connect(this.delaySend);
      o.start(t); vib.start(t); o.stop(t + dur + .05); vib.stop(t + dur + .05);
    }

    _pad(t, notes, dur) {
      const ctx = this.ctx;
      for (const midi of notes) {
        const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = mtof(midi);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(.018, t + .4);
        g.gain.exponentialRampToValueAtTime(.0008, t + dur);
        o.connect(g); g.connect(this.mix);
        o.start(t); o.stop(t + dur + .05);
      }
    }

    _bass(t, midi, dur) {
      const ctx = this.ctx;
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = mtof(midi);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(.08, t + .04);
      g.gain.exponentialRampToValueAtTime(.001, t + dur);
      o.connect(g); g.connect(this.mix);
      o.start(t); o.stop(t + dur + .05);
    }

    _bell(t, midi, gain) {
      const ctx = this.ctx;
      const f0 = mtof(midi);
      for (const [ratio, amp, dec] of [[1, 1, 2.6], [2.0, .4, 1.6], [2.98, .2, 1.1]]) {
        const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(f0 * ratio, t);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(gain * amp, t + .006);
        g.gain.exponentialRampToValueAtTime(.0004, t + dec);
        o.connect(g); g.connect(this.mix); g.connect(this.delaySend);
        o.start(t); o.stop(t + dec + .05);
      }
    }

    _woodblock(t, freq, gain) {
      const ctx = this.ctx;
      const o = ctx.createOscillator(); o.type = 'triangle';
      o.frequency.setValueAtTime(freq, t);
      o.frequency.exponentialRampToValueAtTime(freq * .72, t + .09);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(gain, t + .004);
      g.gain.exponentialRampToValueAtTime(.0005, t + .11);
      o.connect(g); g.connect(this.mix);
      o.start(t); o.stop(t + .12);
    }
  }

  class Crowd {
    constructor(ctx, destination) {
      this.ctx = ctx;
      this.out = ctx.createGain();
      this.out.gain.value = 0;
      this.out.connect(destination);
      this.enabled = true;
      this.ducked = false;
      this.level = .7;
      this.started = false;
      this._nodes = [];
    }

    start() {
      if (this.started) return;
      this.started = true;
      const ctx = this.ctx, buf = noiseBuffer(ctx, true);
      const layers = [
        [260, .9, .028, .04],
        [520, 1.2, .016, .07],
      ];
      for (const [freq, q, gain, rate] of layers) {
        const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
        const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = q;
        const g = ctx.createGain(); g.gain.value = gain;
        const lfo = ctx.createOscillator(); lfo.frequency.value = rate;
        const lg = ctx.createGain(); lg.gain.value = gain * .45;
        lfo.connect(lg); lg.connect(g.gain);
        src.connect(bp); bp.connect(g); g.connect(this.out);
        src.start(); lfo.start();
        this._nodes.push(src, lfo);
      }
      this._apply(.6);
      this._schedule();
    }

    stop() {
      clearTimeout(this._timer);
      this.started = false;
      for (const n of this._nodes) { try { n.stop(); } catch {} }
      this._nodes = [];
      try { this.out.disconnect(); } catch {}
    }

    _schedule() {
      clearTimeout(this._timer);
      if (!this.started) return;
      this._timer = setTimeout(() => {
        if (this.enabled && !this.ducked) this._random();
        this._schedule();
      }, 3200 + Math.random() * 6500);
    }

    _random() {
      const r = Math.random();
      if (r < .5) this.clink(.7);
      else if (r < .8) this.scrape();
      else this.cheer(.5);
    }

    clink(power = 1) {
      if (!this.started) return;
      const ctx = this.ctx, t0 = ctx.currentTime + .02;
      for (const [ratio, amp, dec] of [[1, .045, 1.8], [2.75, .022, 1.1]]) {
        const o = ctx.createOscillator(); o.type = 'sine';
        o.frequency.setValueAtTime(528 * ratio, t0);
        const g = ctx.createGain();
        g.gain.setValueAtTime(.0001, t0);
        g.gain.linearRampToValueAtTime(amp * power, t0 + .008);
        g.gain.exponentialRampToValueAtTime(.0004, t0 + dec);
        o.connect(g); g.connect(this.out);
        o.start(t0); o.stop(t0 + dec + .05);
      }
    }

    scrape() {
      if (!this.started) return;
      const ctx = this.ctx, t = ctx.currentTime + .02;
      for (let i = 0; i < 4; i++) {
        const at = t + i * .065;
        const o = ctx.createOscillator(); o.type = 'triangle';
        o.frequency.setValueAtTime(640 + (i % 2) * 80, at);
        o.frequency.exponentialRampToValueAtTime(420, at + .055);
        const g = ctx.createGain();
        g.gain.setValueAtTime(.0001, at);
        g.gain.linearRampToValueAtTime(.025, at + .004);
        g.gain.exponentialRampToValueAtTime(.0005, at + .06);
        o.connect(g); g.connect(this.out);
        o.start(at); o.stop(at + .07);
      }
    }

    chatter() {
      this.clink(.5);
    }

    cheer(power = 1) {
      if (!this.started || !this.enabled) return;
      this.clink(power * 1.2);
      const ctx = this.ctx, t = ctx.currentTime + .05;
      for (let i = 0; i < 3; i++) {
        const at = t + i * .12;
        const o = ctx.createOscillator(); o.type = 'sine';
        const f = [528, 660, 792][i];
        o.frequency.setValueAtTime(f, at);
        const g = ctx.createGain();
        g.gain.setValueAtTime(.0001, at);
        g.gain.linearRampToValueAtTime(.04 * power, at + .01);
        g.gain.exponentialRampToValueAtTime(.0004, at + 1.4);
        o.connect(g); g.connect(this.out);
        o.start(at); o.stop(at + 1.45);
      }
    }

    setEnabled(on) {
      this.enabled = !!on;
      this._apply(.5);
    }

    setLevel(x) {
      this.level = Math.max(.2, Math.min(1, +x || .8));
      this._apply(.4);
    }

    duck(on) {
      const v = !!on;
      if (v === this.ducked) return;
      this.ducked = v;
      this._apply(.35);
    }

    _apply(ramp) {
      const t = this.ctx.currentTime;
      const target = this.enabled ? .65 * this.level * (this.ducked ? .22 : 1) : 0;
      const p = this.out.gain;
      p.cancelScheduledValues(t);
      p.setValueAtTime(p.value, t);
      p.linearRampToValueAtTime(target, t + (ramp || .4));
    }
  }

  class Street {
    constructor(ctx, destination) {
      this.ctx = ctx;
      this.out = ctx.createGain();
      this.out.gain.value = 0;
      this.out.connect(destination);
      this.enabled = true;
      this.ducked = false;
      this.level = .6;
      this.started = false;
    }
    start() { this.started = true; }
    stop() { this.started = false; }
    setEnabled(on) { this.enabled = !!on; }
    setLevel(x) { this.level = Math.max(.2, Math.min(1, +x || .6)); }
    duck(on) { this.ducked = !!on; }
    cheer() {}
  }

  global.BarSound = { Band, Crowd, Street };
})(window);

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let started = false;

function build() {
  if (ctx) return;
  ctx = new AudioContext();
  master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 420;
  filter.Q.value = 0.6;
  filter.connect(master);

  const droneGain = ctx.createGain();
  droneGain.gain.value = 0.5;
  droneGain.connect(filter);

  [110, 164.81, 220].forEach((freq, i) => {
    const osc = ctx!.createOscillator();
    osc.type = i === 2 ? "triangle" : "sine";
    osc.frequency.value = freq;
    osc.detune.value = i * 4 - 4;
    const g = ctx!.createGain();
    g.gain.value = i === 2 ? 0.08 : 0.22;
    osc.connect(g);
    g.connect(droneGain);
    osc.start();
  });

  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.06;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 160;
  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);
  lfo.start();
}

export function setAmbient(on: boolean) {
  if (on) {
    build();
    if (!ctx || !master) return;
    if (ctx.state === "suspended") void ctx.resume();
    started = true;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(0.045, ctx.currentTime, 0.8);
  } else if (ctx && master) {
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
    started = false;
  }
}

export function orbitTick() {
  if (!ctx || !master || !started) return;
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = 1320;
  const g = ctx.createGain();
  g.gain.value = 0.035;
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
  osc.connect(g);
  g.connect(master);
  osc.start();
  osc.stop(ctx.currentTime + 0.14);
}
/* Logger + How-to + Stopwatch + HIIT + Auto Rest Timer + Presets */
(function() {
  const key = 'fittracker.logs.v3';

  // ---- HOW-TO EXAMPLES ----
  const examples = [
    { keys: ['dumbbell bench press','db bench','dumbbell press'], title: 'Dumbbell Bench Press',
      text: 'Lie on bench, feet flat. Hold dumbbells over chest, palms forward. Lower to ~90°; press up without locking. Keep shoulder blades pinched; stop if shoulder pinches.' },
    { keys: ['incline dumbbell press','incline press'], title: 'Incline Dumbbell Press',
      text: 'Bench 15–30°. Press like flat press but lighter. Keep wrists stacked; avoid wide flared elbows to protect the shoulder.' },
    { keys: ['resistance band row','band row','seated band row','row band'], title: 'Resistance Band Row',
      text: 'Anchor chest height. Tall posture. Pull to ribs; squeeze shoulder blades; keep shoulders down. Control the return.' },
    { keys: ['kettlebell goblet squat','goblet squat'], title: 'Kettlebell Goblet Squat',
      text: 'Hold bell at chest. Feet shoulder-width, toes slightly out. Sit hips back/down; chest tall; knees track over toes. Drive through mid-foot.' },
    { keys: ['dumbbell rdl','db rdl','romanian deadlift'], title: 'Dumbbell RDL',
      text: 'Soft knees, hinge hips back with a neutral spine. Lower to shins, feel hamstrings; stand tall by driving hips forward.' },
    { keys: ['band external rotation','external rotation'], title: 'Band External Rotation (shoulder-safe)',
      text: 'Elbow at side bent 90°. Rotate forearm outward against band. Keep shoulder blade set; slow control.' },
    { keys: ['bike intervals','bike','exercise bike'], title: 'Bike Intervals',
      text: 'Warm up 5 min. Then intervals; finish with 5 min easy. Choose resistances you can finish strong.' }
  ];

  // ---- STATE ----
  const state = { logs: JSON.parse(localStorage.getItem(key) || '[]') };

  // ---- DOM ----
  const exName = document.getElementById('exName');
  const exWeight = document.getElementById('exWeight');
  const exSets = document.getElementById('exSets');
  const exReps = document.getElementById('exReps');
  const saveBtn = document.getElementById('saveBtn');
  const exportBtn = document.getElementById('exportBtn');
  const todayList = document.getElementById('todayList');
  const exampleBox = document.getElementById('exampleBox');
  const exampleTitle = document.getElementById('exampleTitle');
  const exampleText = document.getElementById('exampleText');

  // Stopwatch elements
  const swDisplay = document.getElementById('stopwatchDisplay');
  const swStart = document.getElementById('swStart');
  const swStop = document.getElementById('swStop');
  const swReset = document.getElementById('swReset');

  // Rest timer elements
  const restSeconds = document.getElementById('restSeconds');
  const restDisplay = document.getElementById('restDisplay');
  const restProgress = document.getElementById('restProgress');
  const restStart = document.getElementById('restStart');
  const restPause = document.getElementById('restPause');
  const restReset = document.getElementById('restReset');

  // HIIT elements
  const hiitWork = document.getElementById('hiitWork');
  const hiitRest = document.getElementById('hiitRest');
  const hiitRounds = document.getElementById('hiitRounds');
  const hiitDisplay = document.getElementById('hiitDisplay');
  const hiitPhase = document.getElementById('hiitPhase');
  const hiitProgress = document.getElementById('hiitProgress');
  const hiitStart = document.getElementById('hiitStart');
  const hiitPause = document.getElementById('hiitPause');
  const hiitReset = document.getElementById('hiitReset');

  // Preset buttons
  document.querySelectorAll('[data-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      const [w,r,n] = btn.dataset.preset.split(',').map(Number);
      hiitWork.value = w; hiitRest.value = r; hiitRounds.value = n;
      hiit_reset();
    });
  });

  // ---- HELPERS ----
  function findExample(name) {
    if (!name) return null;
    const key = name.toLowerCase().trim();
    for (const ex of examples) {
      if (ex.keys.some(k => key.includes(k))) return ex;
    }
    return null;
  }

  function updateExampleUI() {
    const ex = findExample(exName.value);
    if (ex) {
      exampleTitle.textContent = ex.title + ' — How to';
      exampleText.textContent = ex.text;
      exampleBox.style.display = 'block';
    } else {
      exampleBox.style.display = 'none';
    }
  }

  function render() {
    const today = new Date().toISOString().slice(0,10);
    const items = state.logs.filter(x => x.date === today).reverse();
    todayList.innerHTML = items.map(item => {
      const title = `${item.name} — ${item.sets}×${item.reps}${item.weight?` @ ${item.weight}lb`:''}`;
      const time = new Date(item.ts).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
      return `<div class="item"><div>${title}<small>${time}</small></div><button class="ghost" data-ts="${item.ts}">Delete</button></div>`;
    }).join('');
  }

  function save() {
    const name = (exName.value || '').trim();
    const weight = Number(exWeight.value || 0);
    const sets = Number(exSets.value || 0);
    const reps = Number(exReps.value || 0);
    if (!name || !sets || !reps) {
      alert('Please enter exercise, sets, and reps.');
      return;
    }
    const entry = { ts: Date.now(), date: new Date().toISOString().slice(0,10), name, weight, sets, reps };
    state.logs.push(entry);
    localStorage.setItem(key, JSON.stringify(state.logs));
    // Auto start rest timer
    try { rest_reset(); rest_start(); } catch(e){}
    exName.value=''; exWeight.value=''; exSets.value=''; exReps.value='';
    updateExampleUI();
    render();
  }

  function exportCSV() {
    const header = ['date','time','exercise','weight_lb','sets','reps'];
    const rows = state.logs.map(i => [
      i.date,
      new Date(i.ts).toLocaleTimeString(),
      i.name.replaceAll(',', ';'),
      i.weight,
      i.sets,
      i.reps
    ]);
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], {type: 'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fit-tracker-export.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // ---- STOPWATCH ----
  let swRunning = false, swStartTime = 0, swOffset = 0, swRaf;
  function fmtMS(ms) {
    const t = Math.max(0, ms|0);
    const m = Math.floor(t/60000);
    const s = Math.floor((t%60000)/1000);
    const d = Math.floor((t%1000)/100);
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${d}`;
  }
  function swTick() {
    if (!swRunning) return;
    const elapsed = Date.now() - swStartTime + swOffset;
    swDisplay.textContent = fmtMS(elapsed);
    swRaf = requestAnimationFrame(swTick);
  }
  function sw_start() {
    if (swRunning) return;
    swRunning = true;
    swStartTime = Date.now();
    swRaf = requestAnimationFrame(swTick);
    try { navigator.vibrate && navigator.vibrate(20); } catch(e){}
  }
  function sw_stop() {
    if (!swRunning) return;
    swRunning = false;
    cancelAnimationFrame(swRaf);
    swOffset += Date.now() - swStartTime;
    try { navigator.vibrate && navigator.vibrate([10,40,10]); } catch(e){}
  }
  function sw_reset() {
    swRunning = false;
    cancelAnimationFrame(swRaf);
    swOffset = 0;
    swDisplay.textContent = '00:00.0';
  }
  swStart?.addEventListener('click', sw_start);
  swStop?.addEventListener('click', sw_stop);
  swReset?.addEventListener('click', sw_reset);

  // ---- REST TIMER (auto-start on save) ----
  let restTimer = null, restRemain = 0, restTotal = 0;
  let audioCtx = null;
  function ensureAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  function beep(freq=880, dur=0.16) {
    try {
      ensureAudio();
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(freq, audioCtx.currentTime);
      g.gain.setValueAtTime(0.0001, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.2, audioCtx.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
      o.connect(g).connect(audioCtx.destination);
      o.start();
      o.stop(audioCtx.currentTime + dur + 0.02);
    } catch(e) {}
  }
  function fmtSec(sec) {
    sec = Math.max(0, Math.floor(sec));
    const m = Math.floor(sec/60);
    const s = sec%60;
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }
  function updateRestUI() {
    restDisplay.textContent = fmtSec(restRemain);
    restProgress.max = Math.max(1, restTotal);
    restProgress.value = (restTotal - restRemain);
  }
  function restTick() {
    restRemain -= 1;
    updateRestUI();
    if (restRemain <= 0) {
      clearInterval(restTimer); restTimer = null;
      beep(660, 0.2); setTimeout(()=>beep(990,0.25), 180);
      try { navigator.vibrate && navigator.vibrate([60,60,60]); } catch(e){}
    }
  }
  function rest_start() {
    if (restTimer) return;
    const secs = Number(restSeconds.value || 0);
    if (restRemain <= 0) { restRemain = secs; restTotal = secs; }
    updateRestUI();
    restTimer = setInterval(restTick, 1000);
    beep(520, 0.12);
  }
  function rest_pause() {
    if (!restTimer) return;
    clearInterval(restTimer); restTimer = null;
  }
  function rest_reset() {
    if (restTimer) { clearInterval(restTimer); restTimer = null; }
    restRemain = Number(restSeconds.value || 0);
    restTotal = restRemain;
    updateRestUI();
  }
  // Controls
  restStart?.addEventListener('click', () => { ensureAudio(); rest_start(); });
  restPause?.addEventListener('click', rest_pause);
  restReset?.addEventListener('click', rest_reset);
  restSeconds?.addEventListener('input', rest_reset);

  // ---- HIIT TIMER ----
  let hiitTimer = null, hiitRemain = 0, hiitTotal = 1, hiitCurrentRound = 0, hiitIsWork = true;
  function setPhase(isWork, seconds, totalSeconds) {
    hiitIsWork = isWork;
    hiitRemain = seconds;
    hiitTotal = Math.max(1, totalSeconds || seconds);
    hiitPhase.textContent = isWork ? 'WORK' : 'REST';
    hiitPhase.style.background = isWork ? 'linear-gradient(180deg,#198754,#0f6b40)' : 'linear-gradient(180deg,#6c757d,#4a5055)';
    updateHIITUI();
  }
  function updateHIITUI() {
    hiitDisplay.textContent = fmtSec(hiitRemain);
    hiitProgress.max = hiitTotal;
    hiitProgress.value = hiitTotal - hiitRemain;
  }
  function hiitTick() {
    hiitRemain -= 1;
    updateHIITUI();
    if (hiitRemain <= 0) {
      beep(880,0.18);
      try { navigator.vibrate && navigator.vibrate([50,50,50]); } catch(e){}
      if (hiitIsWork) {
        setPhase(false, Number(hiitRest.value||0), Number(hiitRest.value||0));
      } else {
        hiitCurrentRound += 1;
        if (hiitCurrentRound >= Number(hiitRounds.value||1)) {
          clearInterval(hiitTimer); hiitTimer = null;
          hiitPhase.textContent = 'Done 🎉';
          return;
        }
        setPhase(true, Number(hiitWork.value||0), Number(hiitWork.value||0));
      }
    }
  }
  function hiit_start() {
    if (hiitTimer) return;
    ensureAudio();
    if (hiitRemain <= 0 || hiitCurrentRound === 0 && hiitPhase.textContent === 'Ready') {
      hiitCurrentRound = 0;
      setPhase(true, Number(hiitWork.value||0), Number(hiitWork.value||0));
    }
    hiitTimer = setInterval(hiitTick, 1000);
    beep(520,0.12);
  }
  function hiit_pause() { if (!hiitTimer) return; clearInterval(hiitTimer); hiitTimer = null; }
  function hiit_reset() {
    if (hiitTimer) { clearInterval(hiitTimer); hiitTimer = null; }
    hiitCurrentRound = 0;
    hiitPhase.textContent = 'Ready';
    hiitRemain = 0; hiitTotal = 1;
    updateHIITUI();
  }
  hiitStart?.addEventListener('click', hiit_start);
  hiitPause?.addEventListener('click', hiit_pause);
  hiitReset?.addEventListener('click', hiit_reset);

  // ---- LISTENERS ----
  todayList?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-ts]');
    if (!btn) return;
    const ts = Number(btn.dataset.ts);
    const idx = state.logs.findIndex(x => x.ts === ts);
    if (idx >= 0) {
      state.logs.splice(idx,1);
      localStorage.setItem(key, JSON.stringify(state.logs));
      render();
    }
  });
  saveBtn?.addEventListener('click', save);
  exportBtn?.addEventListener('click', exportCSV);
  exName?.addEventListener('input', updateExampleUI);

  // ---- PWA SW ----
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js'));
  }

  // Init
  updateExampleUI();
  render();
  rest_reset(); // initialize rest display from default seconds
})();
/* NINJA GLITCH - app.js
 * Logika halaman: Intro, Login (+Fingerprint +Ninja Loading), Dashboard.
 * Semua SIMULASI LOKAL. Tidak ada jaringan, tidak ada backend.
 * Catatan keamanan: kredensial di bawah hanya untuk simulasi UI; JANGAN dipakai sebagai keamanan sungguhan. */
(function (w, d) {
  'use strict';
  var NG = w.NG = w.NG || {};
  var S = w.NGStorage;

  /* ---------- Konfigurasi simulasi ---------- */
  var USER = 'Ninja67';
  var PASS = 'Glitch76';
  var MAX_FAILS = 5;
  var LOCK_MS = 30000;

  /* ---------- Helper ---------- */
  function $(s, r) { return (r || d).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); }
  function on(el, ev, fn) {
    if (!el) { if (w.console) console.warn('[NG] elemen tidak ditemukan untuk event:', ev); return; }
    el.addEventListener(ev, fn);
  }
  function clock() {
    var n = new Date();
    function z(v) { return (v < 10 ? '0' : '') + v; }
    return z(n.getHours()) + ':' + z(n.getMinutes()) + ':' + z(n.getSeconds());
  }
  NG.go = function (url) {
    if (NG._going) return;
    NG._going = true;
    try { d.body.classList.add('leaving'); } catch (e) { /* abaikan */ }
    setTimeout(function () {
      try { w.location.replace(url); } catch (e) { w.location.href = url; }
    }, 180);
  };

  /* Error global: jangan biarkan satu error mematikan flow (hanya dicatat) */
  w.addEventListener('error', function (ev) { if (w.console) console.warn('[NG] runtime:', ev && ev.message); });

  /* ---------- Settings ---------- */
  var DEF = { particles: true, scanlines: true, glitch: true, reduce: false };
  function getSettings() {
    var s = S.getJSON('settings', {}) || {};
    var out = {};
    for (var k in DEF) out[k] = (typeof s[k] === 'boolean') ? s[k] : DEF[k];
    return out;
  }
  function applySettings() {
    var s = getSettings();
    var b = d.body;
    b.classList.toggle('fx-off', !s.particles);
    b.classList.toggle('scan-off', !s.scanlines);
    b.classList.toggle('glitch-off', !s.glitch);
    b.classList.toggle('reduce', s.reduce);
    if (NG.Particles) {
      if (s.particles && !s.reduce) NG.Particles.start($('#fx')); else NG.Particles.stop();
    }
    var fx = $('#kvFx'); if (fx) { fx.textContent = (s.particles && !s.reduce) ? 'ON' : 'OFF'; fx.className = (s.particles && !s.reduce) ? 'ok' : 'dim'; }
    return s;
  }

  /* ---------- Log (console) ---------- */
  var logListeners = [];
  NG.Log = {
    all: function () { var a = S.getJSON('logs', []); return Array.isArray(a) ? a : []; },
    add: function (tag, msg) {
      var e = { t: clock(), tag: tag, msg: msg };
      var a = NG.Log.all(); a.push(e); if (a.length > 60) a = a.slice(a.length - 60);
      S.setJSON('logs', a);
      for (var i = 0; i < logListeners.length; i++) { try { logListeners[i](e); } catch (x) { /* abaikan */ } }
      return e;
    },
    onAdd: function (fn) { logListeners.push(fn); },
    clear: function () { S.remove('logs'); }
  };
  function renderLine(box, e) {
    var ln = d.createElement('span');
    ln.className = 'ln';
    var t = d.createElement('i'); t.textContent = e.t;
    var tag = d.createElement('em'); tag.textContent = '[' + e.tag + '] ';
    ln.appendChild(t); ln.appendChild(tag); ln.appendChild(d.createTextNode(e.msg));
    box.appendChild(ln);
    while (box.childNodes.length > 80) box.removeChild(box.firstChild);
    box.scrollTop = box.scrollHeight;
  }

  /* =====================================================
   *  INTRO
   * ===================================================== */
  function initIntro() {
    var replay = /[?&]replay=1/.test(w.location.search);
    if (!replay && S.get('session', '') === '1') { NG.go('dashboard.html'); return; }

    var skipBtn = $('#skipIntro');
    var lines = $('#bootLines');
    var go = function () { NG.go('login.html'); };

    var steps = [
      [0, 'BOOTING KERNEL...'], [18, 'LOADING SHADERS...'], [42, 'CALIBRATING GLITCH CORE...'],
      [68, 'SYNCING NEON GRID...'], [90, 'SYSTEM READY']
    ];
    var shown = [];
    NG.Boot.run({
      duration: 4800,
      steps: steps,
      els: { bar: $('#introBar'), pct: $('#introPct'), status: $('#introStatus') },
      skipBtn: skipBtn,
      onStep: function (i, text) {
        if (!lines) return;
        shown.push('<b>&gt;</b> ' + text);
        lines.innerHTML = shown.slice(-3).join('<br>');
      },
      onDone: go
    });
    applySettings();
  }

  /* =====================================================
   *  LOGIN + FINGERPRINT + NINJA LOADING
   * ===================================================== */
  function initLogin() {
    var stages = { login: $('#stage-login'), finger: $('#stage-finger'), loading: $('#stage-loading') };
    function show(name) {
      for (var k in stages) { if (stages[k]) stages[k].classList.toggle('active', k === name); }
      w.scrollTo(0, 0);
    }
    var qs = w.location.search;
    var hasSession = S.get('session', '') === '1';

    // ---- Ninja loading ----
    var loadingStarted = false;
    function startLoading() {
      if (loadingStarted) return;
      loadingStarted = true;
      show('loading');
      NG.Boot.run({
        duration: 6500,
        steps: [[0, 'INITIALIZING...'], [18, 'LOADING CORE...'], [42, 'SYNCING MODULES...'], [72, 'RENDERING...'], [93, 'SYSTEM READY']],
        els: { bar: $('#ldgBar'), pct: $('#ldgPct'), status: $('#ldgStatus') },
        skipBtn: $('#ldgSkip'),
        onDone: function () { S.set('session', '1'); NG.go('dashboard.html'); }
      });
    }

    // ---- Fingerprint ----
    var fpReady = false;
    function showFinger() {
      show('finger');
      if (fpReady) return;
      fpReady = true;
      NG.Fingerprint.init({
        btn: $('#fpBtn'), pct: $('#fpPct'), status: $('#fpStatus'), steps: $$('.fp-steps span'),
        skipBtn: $('#fpSkip'), duration: 2800,
        onGranted: startLoading
      });
      on($('#fpBack'), 'click', function () {
        S.remove('authed');
        if (NG.Fingerprint._api) NG.Fingerprint._api.reset();
        show('login');
      });
    }

    // ---- Routing awal (aman saat refresh) ----
    if (hasSession) {
      if (/[?&]stage=loading/.test(qs)) { applySettings(); startLoading(); }
      else { NG.go('dashboard.html'); }
      return;
    }
    applySettings();

    var form = $('#loginForm'), uEl = $('#username'), pEl = $('#password');
    var btn = $('#loginBtn'), btnTxt = $('#loginBtnTxt'), msg = $('#loginMsg'), eye = $('#togglePass');
    var busy = false, lockTimer = null;

    function setMsg(text, cls) { msg.textContent = text || ''; msg.className = 'msg' + (cls ? ' ' + cls : ''); }
    function setBusy(v, label) {
      busy = v; btn.disabled = v; uEl.disabled = v; pEl.disabled = v;
      btnTxt.textContent = label || 'ENTER SYSTEM';
      var sp = $('.spinner', btn);
      if (v && !sp) { sp = d.createElement('span'); sp.className = 'spinner'; btn.insertBefore(sp, btnTxt); }
      if (!v && sp) sp.parentNode.removeChild(sp);
    }
    function lockLeft() {
      var until = parseInt(S.get('lockUntil', '0'), 10) || 0;
      var left = until - Date.now();
      if (left > LOCK_MS) left = LOCK_MS;      // lindungi dari nilai storage rusak
      return left > 0 ? left : 0;
    }
    function startLockUI() {
      if (lockTimer) clearInterval(lockTimer);
      function tick() {
        var left = lockLeft();
        if (left <= 0) {
          clearInterval(lockTimer); lockTimer = null;
          S.remove('lockUntil'); S.remove('fails');
          setBusy(false); setMsg('SILAKAN COBA LAGI', 'info');
          return;
        }
        setBusy(true, 'LOCKED ' + Math.ceil(left / 1000) + 's');
        setMsg('TOO MANY ATTEMPTS - LOCKED ' + Math.ceil(left / 1000) + 's', 'denied');
      }
      tick();
      if (lockLeft() > 0) lockTimer = setInterval(tick, 250);
    }

    function onSuccess() {
      S.set('authed', '1');
      S.remove('fails'); S.remove('lockUntil');
      pEl.value = '';
      setBusy(true, 'ACCESS OK');
      setMsg('ACCESS VERIFIED', 'good');
      setTimeout(function () { setBusy(false); setMsg(''); showFinger(); }, 600);
    }
    function onFail() {
      var fails = (parseInt(S.get('fails', '0'), 10) || 0) + 1;
      S.set('fails', fails);
      pEl.value = '';
      var card = $('#loginForm');
      card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
      if (fails >= MAX_FAILS) {
        S.set('lockUntil', Date.now() + LOCK_MS);
        startLockUI();
        return;
      }
      setBusy(false);
      setMsg('ACCESS DENIED (' + fails + '/' + MAX_FAILS + ')', 'denied');
      try { pEl.focus(); } catch (e) { /* abaikan */ }
    }
    function attempt() {
      if (busy) return;
      if (lockLeft() > 0) { startLockUI(); return; }
      var u = uEl.value.replace(/^\s+|\s+$/g, '');   // spasi otomatis keyboard HP di username diabaikan
      var p = pEl.value;
      if (!u || !p) { setMsg('ISI USERNAME DAN PASSWORD', 'info'); return; }
      setBusy(true, 'VERIFYING...');
      setMsg('VERIFYING...', 'info');
      setTimeout(function () {
        if (u === USER && p === PASS) onSuccess(); else onFail();   // case-sensitive
      }, 900);
    }

    // Form submit (tombol & Enter) - SELALU preventDefault: tidak ada reload / ?query di URL
    on(form, 'submit', function (e) { e.preventDefault(); e.stopPropagation(); attempt(); });
    on(uEl, 'keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); pEl.focus(); } });
    on(eye, 'click', function () {
      var show = pEl.type === 'password';
      pEl.type = show ? 'text' : 'password';
      eye.setAttribute('aria-pressed', show ? 'true' : 'false');
      eye.setAttribute('aria-label', show ? 'Sembunyikan password' : 'Tampilkan password');
    });

    // Tampilan awal
    if (S.get('authed', '') === '1') showFinger(); else show('login');
    if (lockLeft() > 0) startLockUI();
  }

  /* =====================================================
   *  DASHBOARD
   * ===================================================== */
  function initDashboard() {
    if (S.get('session', '') !== '1') { NG.go('login.html'); return; }
    var timers = [];
    function every(fn, ms) { var id = setInterval(fn, ms); timers.push(id); return id; }
    w.addEventListener('pagehide', function () { for (var i = 0; i < timers.length; i++) clearInterval(timers[i]); });

    var toastEl = $('#toast'), toastT = null;
    function toast(t) {
      if (!toastEl) return;
      toastEl.textContent = t; toastEl.classList.add('show');
      clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('show'); }, 2200);
    }

    applySettings();

    /* --- Console utama --- */
    var con = $('#console');
    var existing = NG.Log.all();
    if (con) for (var i = Math.max(0, existing.length - 30); i < existing.length; i++) renderLine(con, existing[i]);
    NG.Log.onAdd(function (e) { if (con) renderLine(con, e); });
    NG.Log.add('LOCAL', 'Session started (local simulation).');
    NG.Log.add('LOCAL', 'Visual engine online.');

    /* --- Nav --- */
    NG.Nav.init({ views: ['home', 'glitch', 'tools', 'settings'], fallback: 'home', onChange: function (n) {
      if (n === 'tools') renderHistory();
    } });

    /* --- Uptime & info --- */
    var t0 = Date.now(), upEl = $('#uptime');
    function z(n) { return (n < 10 ? '0' : '') + n; }
    function uptime() {
      var s = Math.floor((Date.now() - t0) / 1000);
      if (upEl) upEl.textContent = z(Math.floor(s / 60)) + ':' + z(s % 60);
    }
    function info() {
      var v = $('#kvView'), n = $('#kvNet');
      if (v) v.textContent = w.innerWidth + ' x ' + w.innerHeight;
      if (n) { var o = w.navigator.onLine !== false; n.textContent = o ? 'ONLINE (IDLE)' : 'OFFLINE'; n.className = o ? 'ok' : 'warn'; }
    }
    every(uptime, 1000); info();
    w.addEventListener('resize', info); w.addEventListener('online', info); w.addEventListener('offline', info);

    /* --- Meter simulasi --- */
    var m = { cpu: 34, mem: 52, gpu: 28 };
    function drift(v, lo, hi) { v += (Math.random() - .5) * 14; return Math.max(lo, Math.min(hi, v)); }
    function setMeter(id, v) {
      var bar = $('#' + id), val = $('#' + id + 'V');
      v = Math.round(v);
      if (bar) bar.style.width = v + '%';
      if (val) val.textContent = v + '%';
    }
    function meters() {
      m.cpu = drift(m.cpu, 12, 88); m.mem = drift(m.mem, 35, 80); m.gpu = drift(m.gpu, 10, 92);
      setMeter('mCpu', m.cpu); setMeter('mMem', m.mem); setMeter('mGpu', m.gpu);
    }
    meters(); every(meters, 1800);

    /* --- FPS nyata --- */
    var fpsEl = $('#kvFps');
    NG.Fps.start(function (f) { if (fpsEl) fpsEl.textContent = f + ' FPS'; });

    /* --- Glitch simulator --- */
    var lvl = 2, running = false, simH = null;
    var stageEl = $('#glStage'), runBtn = $('#simRun'), abortBtn = $('#simAbort');
    var simCon = $('#simConsole'), simStatus = $('#simStatus'), simPct = $('#simPct'), simBar = $('#simBar'), simBadge = $('#simBadge');
    var chips = $$('.chip[data-lvl]');
    var SIM_STEPS = [
      [0, 'Initializing...'], [14, 'Loading visual engine...'], [34, 'Allocating virtual buffers...'],
      [55, 'Rendering effect...'], [78, 'Applying RGB split...'], [100, 'Simulation complete.']
    ];
    function simLine(text) {
      var e = NG.Log.add('LOCAL', text);
      if (simCon) renderLine(simCon, e);
    }
    function setSim(status, cls, p) {
      if (simStatus) { simStatus.textContent = 'STATUS: ' + status; simStatus.className = cls || 'dim'; }
      if (simBadge) simBadge.textContent = status;
      if (p !== undefined) {
        if (simPct) simPct.textContent = p + '%';
        if (simBar) { simBar.style.width = p + '%'; if (simBar.parentNode) simBar.parentNode.setAttribute('aria-valuenow', String(p)); }
      }
    }
    function endSim(ok) {
      running = false; simH = null;
      if (stageEl) { stageEl.classList.remove('run', 'lvl-1', 'lvl-2', 'lvl-3'); if (ok) { stageEl.classList.add('done'); setTimeout(function () { stageEl.classList.remove('done'); }, 1600); } }
      if (runBtn) { runBtn.disabled = false; runBtn.textContent = 'RUN AGAIN'; }
      if (abortBtn) abortBtn.hidden = true;
      var kg = $('#kvGlitch'); if (kg) kg.textContent = 'READY';
      chips.forEach(function (c) { c.disabled = false; });
    }
    function runSim() {
      if (running) return;
      running = true;
      if (simCon) { simCon.hidden = false; simCon.innerHTML = ''; }
      if (stageEl) { stageEl.classList.remove('done'); stageEl.classList.add('run', 'lvl-' + lvl); }
      if (runBtn) { runBtn.disabled = true; runBtn.textContent = 'RUNNING...'; }
      if (abortBtn) abortBtn.hidden = false;
      var kg = $('#kvGlitch'); if (kg) kg.textContent = 'ACTIVE';
      chips.forEach(function (c) { c.disabled = true; });
      setSim('RUNNING', 'warn', 0);
      var next = 0, dur = [3800, 4800, 6000][lvl - 1];
      var startedLvl = lvl;
      simH = NG.runProgress({
        duration: dur,
        onTick: function (p) {
          while (next < SIM_STEPS.length && p >= SIM_STEPS[next][0]) {
            simLine(SIM_STEPS[next][1]); next++;
          }
          setSim(p >= 100 ? 'COMPLETE' : 'RUNNING', p >= 100 ? 'ok' : 'warn', p);
        },
        onDone: function () {
          setSim('COMPLETE', 'ok', 100);
          pushHistory({ t: clock(), lvl: ['LOW', 'MID', 'HIGH'][startedLvl - 1], ms: dur, ok: true });
          toast('Simulation complete');
          endSim(true);
        }
      });
    }
    function abortSim() {
      if (!running) return;
      if (simH) simH.cancel();
      simLine('Simulation aborted by user.');
      setSim('ABORTED', 'bad', 0);
      pushHistory({ t: clock(), lvl: ['LOW', 'MID', 'HIGH'][lvl - 1], ms: 0, ok: false });
      endSim(false);
    }
    on(runBtn, 'click', runSim);
    on(abortBtn, 'click', abortSim);
    chips.forEach(function (c) {
      on(c, 'click', function () {
        if (running) return;
        lvl = parseInt(c.getAttribute('data-lvl'), 10);
        chips.forEach(function (x) { x.setAttribute('aria-pressed', x === c ? 'true' : 'false'); });
      });
    });

    /* --- History --- */
    function pushHistory(item) {
      var h = S.getJSON('history', []); if (!Array.isArray(h)) h = [];
      h.unshift(item); if (h.length > 30) h = h.slice(0, 30);
      S.setJSON('history', h);
      renderHistory();
    }
    function renderHistory() {
      var list = $('#histList'), cnt = $('#histCount');
      if (!list) return;
      var h = S.getJSON('history', []); if (!Array.isArray(h)) h = [];
      if (cnt) cnt.textContent = h.length;
      list.innerHTML = '';
      if (!h.length) { var li = d.createElement('li'); li.className = 'empty'; li.style.display = 'block'; li.textContent = 'Belum ada simulasi.'; list.appendChild(li); return; }
      h.forEach(function (it) {
        var li = d.createElement('li');
        var a = d.createElement('span'); a.textContent = it.t + '  ' + it.lvl;
        var b = d.createElement('span'); b.textContent = it.ok ? 'COMPLETE' : 'ABORTED'; b.className = it.ok ? 'ok' : 'bad';
        li.appendChild(a); li.appendChild(b); list.appendChild(li);
      });
    }
    renderHistory();
    on($('#histClear'), 'click', function () { S.remove('history'); renderHistory(); toast('History cleared'); });

    /* --- Tools --- */
    on($('#diagRun'), 'click', function () {
      var out = $('#diagOut'); if (!out) return;
      var rows = [
        ['Local storage', S.available ? 'OK' : 'FALLBACK', S.available],
        ['Canvas 2D', (function () { try { return !!d.createElement('canvas').getContext('2d'); } catch (e) { return false; } })() ? 'OK' : 'FAIL', true],
        ['Session', S.get('session', '') === '1' ? 'ACTIVE' : 'NONE', S.get('session', '') === '1'],
        ['Viewport', w.innerWidth + 'x' + w.innerHeight, true],
        ['Frame rate', (fpsEl ? fpsEl.textContent : '-'), true]
      ];
      out.innerHTML = '';
      rows.forEach(function (r) {
        var li = d.createElement('li'); var a = d.createElement('span'); a.textContent = r[0];
        var b = d.createElement('b'); b.textContent = r[1]; b.className = r[2] ? 'ok' : 'warn';
        li.appendChild(a); li.appendChild(b); out.appendChild(li);
      });
      out.hidden = false;
      NG.Log.add('LOCAL', 'Diagnostics executed.');
      toast('Diagnostics done');
    });
    on($('#exportLog'), 'click', function () {
      try {
        var txt = NG.Log.all().map(function (e) { return e.t + ' [' + e.tag + '] ' + e.msg; }).join('\n') || '(kosong)';
        var blob = new Blob([txt + '\n'], { type: 'text/plain' });
        var url = w.URL.createObjectURL(blob);
        var a = d.createElement('a'); a.href = url; a.download = 'ninja-glitch-log.txt';
        d.body.appendChild(a); a.click(); d.body.removeChild(a);
        setTimeout(function () { w.URL.revokeObjectURL(url); }, 1500);
        toast('Log exported');
      } catch (e) { toast('Export tidak didukung'); }
    });
    on($('#clearConsole'), 'click', function () {
      NG.Log.clear(); if (con) con.innerHTML = ''; if (simCon) simCon.innerHTML = '';
      NG.Log.add('LOCAL', 'Console cleared.'); toast('Console cleared');
    });
    on($('#replayLoading'), 'click', function () { NG.go('login.html?stage=loading'); });

    /* --- Settings --- */
    var s0 = getSettings();
    $$('.switch[data-setting]').forEach(function (sw) {
      var key = sw.getAttribute('data-setting');
      sw.setAttribute('aria-checked', s0[key] ? 'true' : 'false');
      on(sw, 'click', function () {
        var cur = getSettings(); cur[key] = !cur[key];
        S.setJSON('settings', cur);
        sw.setAttribute('aria-checked', cur[key] ? 'true' : 'false');
        applySettings();
        toast(key.toUpperCase() + ': ' + (cur[key] ? 'ON' : 'OFF'));
      });
    });
    on($('#replayIntro'), 'click', function () { NG.go('index.html?replay=1'); });
    on($('#resetData'), 'click', function () {
      S.clearAll(true); applySettings();
      $$('.switch[data-setting]').forEach(function (sw) { sw.setAttribute('aria-checked', DEF[sw.getAttribute('data-setting')] ? 'true' : 'false'); });
      if (con) con.innerHTML = ''; if (simCon) simCon.innerHTML = '';
      renderHistory(); NG.Log.add('LOCAL', 'Local data reset.'); toast('Local data reset');
    });

    /* --- Logout --- */
    function logout() {
      S.remove('session'); S.remove('authed'); S.remove('fails'); S.remove('lockUntil');
      NG.go('login.html');
    }
    on($('#logoutBtn'), 'click', logout);
    on($('#logoutTop'), 'click', logout);
  }

  /* ---------- Bootstrap ---------- */
  function boot() {
    var page = d.body.getAttribute('data-page');
    try {
      if (page === 'intro') initIntro();
      else if (page === 'login') initLogin();
      else if (page === 'dashboard') initDashboard();
    } catch (e) {
      if (w.console) console.error('[NG] init error', e);
      // Fallback terakhir: jangan biarkan user terjebak
      if (page === 'intro') { var sk = $('#skipIntro'); if (sk) sk.addEventListener('click', function () { NG.go('login.html'); }); setTimeout(function () { NG.go('login.html'); }, 4000); }
    }
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', boot); else boot();
})(window, document);

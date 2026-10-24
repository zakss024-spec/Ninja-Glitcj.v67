/* NINJA GLITCH - storage.js
 * Penyimpanan lokal yang AMAN: tidak pernah melempar error.
 * Urutan: localStorage -> (jika diblokir) memori + window.name (bertahan antar halaman di tab yang sama).
 * Password TIDAK PERNAH disimpan di sini. */
(function (w) {
  'use strict';

  var PREFIX = 'ng_';
  var WN_TAG = 'NGSTORE:';
  var mem = {};
  var lsOK = false;

  try {
    var probe = '__ng_probe__';
    w.localStorage.setItem(probe, '1');
    w.localStorage.removeItem(probe);
    lsOK = true;
  } catch (e) {
    lsOK = false;
  }

  // Fallback: pulihkan dari window.name bila localStorage tidak tersedia
  if (!lsOK) {
    try {
      if (typeof w.name === 'string' && w.name.indexOf(WN_TAG) === 0) {
        mem = JSON.parse(w.name.slice(WN_TAG.length)) || {};
      }
    } catch (e2) {
      mem = {};
    }
  }

  function persistFallback() {
    if (lsOK) return;
    try { w.name = WN_TAG + JSON.stringify(mem); } catch (e) { /* abaikan */ }
  }

  var Storage = {
    available: lsOK,

    get: function (key, def) {
      var v = null;
      try {
        v = lsOK ? w.localStorage.getItem(PREFIX + key) : (Object.prototype.hasOwnProperty.call(mem, key) ? mem[key] : null);
      } catch (e) {
        v = Object.prototype.hasOwnProperty.call(mem, key) ? mem[key] : null;
      }
      return (v === null || v === undefined) ? def : v;
    },

    set: function (key, val) {
      var s = String(val);
      mem[key] = s;
      if (lsOK) {
        try { w.localStorage.setItem(PREFIX + key, s); } catch (e) { /* kuota/diblokir */ }
      } else {
        persistFallback();
      }
    },

    remove: function (key) {
      delete mem[key];
      if (lsOK) {
        try { w.localStorage.removeItem(PREFIX + key); } catch (e) { /* abaikan */ }
      } else {
        persistFallback();
      }
    },

    getJSON: function (key, def) {
      var raw = Storage.get(key, null);
      if (raw === null) return def;
      try { return JSON.parse(raw); } catch (e) { return def; }
    },

    setJSON: function (key, obj) {
      try { Storage.set(key, JSON.stringify(obj)); } catch (e) { /* abaikan */ }
    },

    /* Hapus semua data aplikasi (opsional: pertahankan session) */
    clearAll: function (keepSession) {
      var keep = keepSession ? Storage.get('session', null) : null;
      var keys = ['session', 'authed', 'fails', 'lockUntil', 'settings', 'history', 'logs', 'view'];
      for (var i = 0; i < keys.length; i++) Storage.remove(keys[i]);
      if (keep) Storage.set('session', keep);
    }
  };

  w.NGStorage = Storage;
})(window);

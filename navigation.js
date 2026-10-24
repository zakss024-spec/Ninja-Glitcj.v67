/* NINJA GLITCH - navigation.js
 * Bottom navigation (HOME / GLITCH / TOOLS / SETTINGS) dengan hash routing (#home, #glitch, ...). */
(function (w, d) {
  'use strict';
  var NG = w.NG = w.NG || {};

  NG.Nav = {
    _inited: false,
    current: null,

    init: function (cfg) {
      var self = NG.Nav;
      if (self._inited) return;           // cegah event listener ganda
      self._inited = true;

      var views = cfg.views;
      var fallback = cfg.fallback || views[0];
      var btns = d.querySelectorAll('.nav-btn[data-view]');

      function valid(n) { return views.indexOf(n) > -1; }

      self.show = function (name, opts) {
        if (!valid(name)) name = fallback;
        for (var i = 0; i < views.length; i++) {
          var v = d.getElementById('view-' + views[i]);
          if (v) { if (views[i] === name) v.classList.add('active'); else v.classList.remove('active'); }
        }
        for (var j = 0; j < btns.length; j++) {
          var on = btns[j].getAttribute('data-view') === name;
          btns[j].classList.toggle('active', on);
          if (on) btns[j].setAttribute('aria-current', 'page'); else btns[j].removeAttribute('aria-current');
        }
        var changed = self.current !== name;
        self.current = name;
        if (!opts || !opts.silent) {
          try { if (w.history && history.replaceState) history.replaceState(null, '', '#' + name); } catch (e) { /* abaikan */ }
          w.scrollTo(0, 0);
        }
        if (changed && cfg.onChange) { try { cfg.onChange(name); } catch (e2) { if (w.console) console.warn('[NG] nav', e2); } }
      };

      for (var k = 0; k < btns.length; k++) {
        btns[k].addEventListener('click', function (e) {
          e.preventDefault();
          self.show(this.getAttribute('data-view'));
        });
      }
      w.addEventListener('hashchange', function () {
        var h = (location.hash || '').replace('#', '');
        if (valid(h) && h !== self.current) self.show(h, { silent: true });
      });

      var start = (location.hash || '').replace('#', '');
      self.show(valid(start) ? start : fallback, { silent: true });
    }
  };
})(window, document);

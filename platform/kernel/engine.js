(function () {
  /* Данные концепта подставляет build.mjs из concept.json. */
  var C = window.__CONCEPT__;
  var PERMS = C.perms;
  var TITLES = C.titles;
  var LIGHT = C.light;
  var SNACK = C.snack;
  var SNACK_ONCE = C.snackOnce;
  var MAP = C.map;
  /* Корни tab bar — переключение сбрасывает стек презентаций. */
  var TABS = C.tabs;
  /* Архитектурный родитель (IA) из concept.json. Для экранов с несколькими
     входами приоритет у presentedFrom, зафиксированного в момент открытия. */
  var PARENT = C.parent;

  /* Preview-режим не является частью приложения: это инструмент витрины.
     Состояние сохраняется отдельно для каждого концепта и остаётся ссылочным
     через ?view=ipad — удобно для ревью конкретного планшетного экрана. */
  function initViewport() {
    var toggle = document.querySelector('[data-view-switch]');
    if (!toggle) return;
    var key = 'camo:view:' + C.slug;
    var params = new URLSearchParams(location.search);
    var stored = localStorage.getItem(key);
    var initial = params.get('view') === 'ipad' ? 'ipad' : (stored === 'ipad' ? 'ipad' : 'phone');
    function apply(view, syncUrl) {
      document.querySelectorAll('.device').forEach(function (device) {
        device.classList.toggle('is-ipad', view === 'ipad');
        device.querySelectorAll('.screen').forEach(function (screen) {
          screen.classList.toggle('has-ipad-tabbar', !!screen.querySelector('.tabbar'));
        });
        device.querySelectorAll('.tabbar > [data-go="create"]').forEach(function (action) {
          action.classList.add('is-create-action');
        });
      });
      toggle.querySelectorAll('[data-view]').forEach(function (button) {
        button.setAttribute('aria-pressed', String(button.dataset.view === view));
      });
      localStorage.setItem(key, view);
      if (syncUrl) {
        var next = new URL(location.href);
        if (view === 'ipad') next.searchParams.set('view', 'ipad');
        else next.searchParams.delete('view');
        history.replaceState(null, '', next.pathname + next.search + next.hash);
      }
    }
    toggle.addEventListener('click', function (event) {
      var button = event.target.closest('[data-view]');
      if (button) apply(button.dataset.view, true);
    });
    apply(initial, false);
  }

  function permByKey(key) {
    for (var i = 0; i < PERMS.length; i++) if (PERMS[i][0] === key) return PERMS[i];
    return null;
  }
  function plural(n) {
    var d = n % 10, h = n % 100;
    if (d === 1 && h !== 11) return 'доступ';
    if (d >= 2 && d <= 4 && (h < 12 || h > 14)) return 'доступа';
    return 'доступов';
  }

  /**
   * Один прототип = одно устройство со своим состоянием доступов.
   * На странице их несколько: общий на Overview и по одному на сценарий,
   * поэтому движок — фабрика, а не синглтон.
   */
  function mount(root) {
    var start = root.dataset.start;
    var screens = root.querySelector('.screens');
    var ask = root.querySelector('.sysask');
    var snackbar = root.querySelector('.snackbar');
    var statusbar = root.querySelector('.status');
    /* Журнал: полный на Overview, компактный счётчик на карточке сценария. */
    var ledgerHost = root.dataset.ledger ? document.getElementById(root.dataset.ledger) : null;
    var counter = root.parentNode.querySelector('.proto-count');

    var state = {};
    var presentedFrom = {};
    var pending = null;
    var seq = 0;
    var snackShown = {};
    var snackTimer = null;

    function parentOf(id) { return presentedFrom[id] || PARENT[id] || null; }
    function has(id) { return !!screens.querySelector('#' + root.id + '-' + id); }
    function el(id) { return screens.querySelector('#' + root.id + '-' + id); }
    function curId() {
      var on = screens.querySelector('.screen.is-on');
      return on ? on.dataset.screen : '';
    }
    /* id — предок ofId по цепочке презентаций / PARENT. */
    function isAncestor(id, ofId) {
      var seen = {}, cur = ofId;
      while (cur) {
        if (cur === id) return true;
        if (seen[cur]) break;
        seen[cur] = 1;
        cur = parentOf(cur);
      }
      return false;
    }
    function dismissToward(fromId, toId) {
      var seen = {}, cur = fromId;
      while (cur && cur !== toId) {
        if (seen[cur]) break;
        seen[cur] = 1;
        delete presentedFrom[cur];
        cur = parentOf(cur);
      }
    }

    function renderPerms() {
      var asked = 0;
      for (var k in state) if (state.hasOwnProperty(k)) asked++;
      if (counter) {
        counter.textContent = asked ? 'Запрошено ' + asked + ' ' + plural(asked) : 'Доступы пока не запрашивались';
        counter.classList.toggle('is-zero', asked === 0);
      }
      if (!ledgerHost) return;
      ledgerHost.innerHTML = '';
      var order = PERMS.slice().sort(function (a, b) {
        var ra = state[a[0]], rb = state[b[0]];
        if (ra && rb) return ra.n - rb.n;
        if (ra) return -1;
        if (rb) return 1;
        return PERMS.indexOf(a) - PERMS.indexOf(b);
      });
      order.forEach(function (p) {
        var rec = state[p[0]];
        var s = rec ? rec.answer : 'idle';
        var row = document.createElement('div');
        row.className = 'perm';
        row.dataset.state = s;
        var name = document.createElement('div');
        name.className = 'perm-name';
        name.textContent = p[1];
        var tag = document.createElement('div');
        tag.className = 'perm-state';
        tag.textContent = s === 'granted' ? 'Разрешено' : s === 'denied' ? 'Отклонено' : 'Не запрошено';
        row.appendChild(name);
        row.appendChild(tag);
        if (rec) {
          var where = document.createElement('div');
          where.className = 'perm-where';
          where.textContent = String(rec.n).padStart(2, '0') + ' · экран «' + rec.where + '»';
          row.appendChild(where);
        }
        ledgerHost.appendChild(row);
      });
      var n = document.getElementById('thesis-n');
      if (n) {
        n.textContent = String(asked);
        document.getElementById('thesis-w').textContent = plural(asked);
        document.getElementById('thesis').classList.toggle('is-zero', asked === 0);
      }
    }

    function finishShow(id, next) {
      next.classList.add('is-on');
      if (statusbar) statusbar.classList.toggle('dark-ink', !!LIGHT[id]);
      syncPermUI();
    }
    /**
     * Показать экран. opts.back — возврат по IA (не записывает презентера).
     * Переход к вкладке или к предку текущей цепочки тоже считается возвратом.
     */
    function show(id, opts) {
      opts = opts || {};
      var next = el(id);
      if (!next) { console.warn('нет экрана', id, 'в прототипе', root.id); return; }
      var cur = screens.querySelector('.screen.is-on');
      var cid = curId();
      if (cur === next) { syncPermUI(); return; }
      if (opts.back || TABS[id] || (cid && isAncestor(id, cid))) {
        if (cid) dismissToward(cid, id);
        if (TABS[id]) presentedFrom = {};
      } else if (cid) {
        presentedFrom[id] = cid;
      }
      if (cur) cur.classList.remove('is-on');
      finishShow(id, next);
    }
    /* Уйти с оверлея на цель, не делая цель «поверх» текущего (Cast → урок). */
    function jump(id) {
      var next = el(id);
      if (!next) { console.warn('нет экрана', id, 'в прототипе', root.id); return; }
      var cur = screens.querySelector('.screen.is-on');
      var cid = curId();
      if (cur === next) { syncPermUI(); return; }
      if (cid) dismissToward(cid, id);
      if (TABS[id]) presentedFrom = {};
      else if (PARENT[id] && !presentedFrom[id]) presentedFrom[id] = PARENT[id];
      if (cur) cur.classList.remove('is-on');
      finishShow(id, next);
    }
    function back() {
      var id = curId();
      if (!id || TABS[id]) return;
      var target = parentOf(id);
      /* Сценарный прототип может не содержать архитектурного родителя. */
      while (target && !has(target)) target = PARENT[target];
      if (target) show(target, { back: true });
    }

    /* Список ключей через запятую: фича может ломаться от отказа в любом из них. */
    function anyDenied(csv) {
      return String(csv).split(',').some(function (k) {
        var rec = state[k.trim()];
        return !!rec && rec.answer === 'denied';
      });
    }
    function syncPermUI() {
      root.querySelectorAll('[data-hide-denied]').forEach(function (e) {
        e.classList.toggle('perm-hidden', anyDenied(e.dataset.hideDenied));
      });
      root.querySelectorAll('[data-show-denied]').forEach(function (e) {
        e.classList.toggle('perm-hidden', !anyDenied(e.dataset.showDenied));
      });
      root.querySelectorAll('[data-show-granted]').forEach(function (e) {
        var rec = state[e.dataset.showGranted];
        e.classList.toggle('perm-hidden', !(rec && rec.answer === 'granted'));
      });
      root.querySelectorAll('[data-switch]').forEach(function (e) {
        var rec = state[e.dataset.switch];
        e.classList.toggle('is-on', !!rec && rec.answer === 'granted');
      });
    }

    /**
     * Полоска садится над тем, что прижато к низу активного экрана: над таб-баром,
     * над колонкой кнопок, над подвалом состояния. Фиксированное число тут не годится —
     * на экране с таб-баром снекбар обязан быть выше, а на fullscreen с кнопками он
     * иначе закрывает главное действие. Высоту прижатого блока считаем по факту:
     * .cta-col и .state-foot уже несут safe-area в своём padding.
     */
    function placeSnackbar() {
      var scr = screens.querySelector('.screen.is-on');
      var h = 0;
      if (scr) {
        var edge = scr.getBoundingClientRect().bottom;
        /* Кнопки бывают и в конце прокрутки — такие не «прижаты», и полоску
           поднимать над ними не нужно. Считаем только то, что стоит у кромки. */
        scr.querySelectorAll('.tabbar, .cta-col, .state-foot').forEach(function (el) {
          var r = el.getBoundingClientRect();
          if (Math.abs(r.bottom - edge) <= 4 && r.height > h) h = r.height;
        });
      }
      snackbar.style.bottom = (h ? Math.round(h) + 12 : 50) + 'px';
    }

    /* Одна полоска на две роли: отказ (со ссылкой в Настройки) и подтверждение. */
    function toast(msg, ok) {
      placeSnackbar();
      snackbar.querySelector('.snackbar-text').textContent = msg;
      snackbar.classList.toggle('is-ok', !!ok);
      snackbar.classList.add('is-on');
      clearTimeout(snackTimer);
      snackTimer = setTimeout(function () { snackbar.classList.remove('is-on'); }, ok ? 2600 : 4000);
    }
    function denySnack(key) {
      var msg = SNACK[key];
      if (!msg) return;
      if (SNACK_ONCE[key] && snackShown[key]) return;
      snackShown[key] = true;
      toast(msg, false);
    }

    function markGranted(key) {
      if (state[key]) return;
      var id = curId();
      seq += 1;
      state[key] = { answer: 'granted', n: seq, where: TITLES[id] || id };
      renderPerms();
      syncPermUI();
    }
    function showAlert(key) {
      var p = permByKey(key);
      ask.querySelector('.sysask-title').textContent = p[2];
      ask.querySelector('.sysask-text').textContent = p[3];
      ask.querySelector('[data-answer="deny"]').textContent = p[4] || 'Запретить';
      ask.querySelector('[data-answer="grant"]').textContent = p[5] || 'Разрешить';
      ask.classList.add('is-on');
    }
    /**
     * Запрос доступа. keys — одна цепочка вида "speech+mic": iOS показывает такие
     * алерты подряд, и отказ на любом шаге уводит на fallback-экран.
     */
    function request(keys, thenTo, elseTo) {
      var list = keys.split('+').filter(function (k) { return permByKey(k); });
      if (!list.length) { console.warn('нет доступа', keys); return; }
      var target = elseTo || thenTo;
      var where = TITLES[curId()] || curId();
      /* Уже отвеченные пропускаем: iOS второй раз системный alert не показывает. */
      while (list.length && state[list[0]]) {
        if (state[list[0]].answer !== 'granted') { show(target); denySnack(list[0]); return; }
        list.shift();
      }
      if (!list.length) { show(thenTo); return; }
      pending = { queue: list, then: thenTo, other: target, where: where };
      showAlert(list[0]);
    }

    ask.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-answer]');
      if (!btn || !pending) return;
      var granted = btn.dataset.answer === 'grant';
      var key = pending.queue.shift();
      seq += 1;
      state[key] = { answer: granted ? 'granted' : 'denied', n: seq, where: pending.where };
      renderPerms();
      if (!granted) {
        ask.classList.remove('is-on');
        show(pending.other);
        denySnack(key);
        pending = null;
        return;
      }
      /* Разрешено и в цепочке остались ключи — сразу следующий системный alert. */
      while (pending.queue.length && state[pending.queue[0]]) pending.queue.shift();
      if (pending.queue.length) { showAlert(pending.queue[0]); return; }
      ask.classList.remove('is-on');
      show(pending.then);
      pending = null;
    });

    var SEL = '[data-ask], [data-go], [data-back], [data-activate], [data-jump], [data-toast]';
    screens.addEventListener('click', function (e) {
      var t = e.target.closest(SEL);
      if (!t) return;
      if (t.hasAttribute('data-back')) { back(); return; }
      if (t.hasAttribute('data-ask')) {
        var a = t.dataset.ask.split('|');
        request(a[0], a[1], a[2]);
        return;
      }
      if (t.hasAttribute('data-activate')) {
        var b = t.dataset.activate.split('|');
        markGranted(b[0]);
        show(b[1]);
        return;
      }
      if (t.hasAttribute('data-jump')) { jump(t.dataset.jump); return; }
      if (t.hasAttribute('data-toast')) {
        var c = t.dataset.toast.split('|');
        if (c[1]) jump(c[1]);
        toast(c[0], true);
        return;
      }
      show(t.dataset.go);
    });
    screens.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var t = e.target.closest(SEL);
      if (!t) return;
      e.preventDefault();
      t.click();
    });
    screens.querySelectorAll(SEL).forEach(function (e) {
      if (e.hasAttribute('role')) return;
      e.setAttribute('role', 'button');
      e.setAttribute('tabindex', '0');
      if (!e.getAttribute('aria-label')) {
        var label = (e.textContent || '').trim();
        if (label) e.setAttribute('aria-label', label);
      }
    });
    snackbar.addEventListener('click', function () {
      clearTimeout(snackTimer);
      snackbar.classList.remove('is-on');
    });

    function reset() {
      state = {}; presentedFrom = {}; pending = null; seq = 0; snackShown = {};
      ask.classList.remove('is-on');
      clearTimeout(snackTimer);
      snackbar.classList.remove('is-on');
      renderPerms();
      show(start, { back: true });
    }

    /* Только прямой ребёнок панели: `.controls` — ещё и ядровой класс блока
       управления плеером, и у концепта со звонком или плеером внутри
       прототипа обычный querySelector находит его раньше кнопок панели.
       Тогда «Начать заново» молча перестаёт работать. */
    var controls = root.parentNode.querySelector(':scope > .controls');
    if (controls) controls.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      if (btn.dataset.act === 'reset') reset();
      if (btn.dataset.act === 'hints') {
        var on = btn.getAttribute('aria-pressed') === 'true';
        btn.setAttribute('aria-pressed', String(!on));
        root.classList.toggle('hints', !on);
      }
    });

    /* Стартовое состояние задаёт движок, а не класс, зашитый в разметку экрана. */
    screens.querySelectorAll('.screen.is-on').forEach(function (e) { e.classList.remove('is-on'); });
    renderPerms();
    show(start, { back: true });
    return { show: show, reset: reset, has: has, root: root };
  }

  var protos = {};
  document.querySelectorAll('[data-proto]').forEach(function (root) {
    protos[root.dataset.proto] = mount(root);
  });
  initViewport();

  /* —— вкладки документа —— */
  var nav = document.querySelector('.topnav');
  function openTab(name) {
    document.querySelectorAll('.tabview').forEach(function (s) {
      s.classList.toggle('is-on', s.id === 'tab-' + name);
    });
    nav.querySelectorAll('[data-tab]').forEach(function (b) {
      b.classList.toggle('is-on', b.dataset.tab === name);
    });
    if (location.hash.slice(1) !== name) history.replaceState(null, '', '#' + name);
  }
  nav.addEventListener('click', function (e) {
    var b = e.target.closest('[data-tab]');
    if (!b) return;
    openTab(b.dataset.tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  if (location.hash) {
    var h = location.hash.slice(1);
    if (document.getElementById('tab-' + h)) openTab(h);
  }

  /* —— галерея экранов —— */
  var gallery = document.getElementById('shot-grid');
  if (gallery) {
    MAP.forEach(function (m) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'shot';
      btn.setAttribute('data-shot-go', m[0]);
      btn.innerHTML =
        '<div class="shot-phone">' +
          '<img src="./assets/screenshots/' + m[0] + '.png" alt="' + m[1] + '" loading="lazy" width="375" height="812">' +
        '</div>' +
        '<div class="shot-label">' + m[1] + '</div>' +
        '<div class="shot-meta">' + m[2] + '</div>';
      gallery.appendChild(btn);
    });
    gallery.addEventListener('click', function (e) {
      var card = e.target.closest('[data-shot-go]');
      if (!card) return;
      var id = card.getAttribute('data-shot-go');
      var hero = protos[C.hero];
      if (!hero) return;
      openTab('overview');
      hero.show(id, { back: true });
      hero.root.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }
})();

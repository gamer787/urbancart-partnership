/* Partnership proposal page — behaviour.
   Order: render copy → build hero lockup → (intro) → start page motion. */
(function () {
  'use strict';
  window.__ucReady = true;

  // ?nointro is a one-shot for editing: it skips this load's intro, then drops itself from the
  // address so a later refresh (or a shared link) plays the intro again.
  try {
    if (/[?&]nointro(&|$)/.test(location.search)) history.replaceState(null, '', location.pathname + location.hash);
  } catch (e) {}

  var C = window.CONTENT;
  var root = document.documentElement;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var narrow = matchMedia('(max-width: 720px)');
  var isFile = location.protocol === 'file:';

  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var get = function (obj, path) {
    return path.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, obj);
  };

  /* ── 1. Copy ───────────────────────────────────────────────────────── */
  if (C.meta) {
    if (C.meta.title) document.title = C.meta.title;
    var md = $('meta[name="description"]');
    if (md && C.meta.description) md.setAttribute('content', C.meta.description);
  }
  $$('[data-c]').forEach(function (el) {
    var v = get(C, el.getAttribute('data-c'));
    if (v != null) el.textContent = v;
  });

  /* Headline words rise one by one; *starred* words get the brand gradient. */
  $$('[data-words]').forEach(function (el) {
    var words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', words.join(' ').replace(/\*/g, ''));
    el.innerHTML = words.map(function (w, i) {
      var emph = /^\*.*\*[^\w]*$/.test(w);
      var clean = esc(w.replace(/\*/g, ''));
      return '<span class="w" aria-hidden="true" style="--i:' + i + '"><span' + (emph ? ' class="grad"' : '') + '>' + clean + '</span></span>';
    }).join(' ');
  });

  var S = C.summary;
  if (S.placeholder) $('#draft-chip').hidden = false;
  $('#tracks').innerHTML = S.tracks.map(function (t) {
    return '<article class="track" data-theme="' + esc(t.theme) + '">' +
      '<div class="track-top"><span class="track-n">' + esc(t.n) + '</span><span class="track-chip">' + esc(t.short) + '</span></div>' +
      '<h3>' + esc(t.name) + '</h3>' +
      '<p class="track-text">' + esc(t.text) + '</p>' +
      '<ul class="track-points">' + t.points.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul>' +
      (t.note ? '<p class="track-note">' + esc(t.note) + '</p>' : '') +
      '</article>';
  }).join('');
  $('#recap-lines').innerHTML = C.closing.lines.map(function (l) {
    return '<div><dt>' + esc(l.k) + '</dt><dd>' + esc(l.v) + '</dd></div>';
  }).join('');
  var cta = $('#contact-cta');
  cta.textContent = C.closing.cta;
  cta.href = 'mailto:' + C.closing.email + '?subject=' + encodeURIComponent(C.closing.subject);

  /* ── 2. Lockup (intro stage and hero share one template) ───────────── */
  var P = C.partner;
  var K = P.credit;
  var sparks = (function () { var o = ''; for (var i = 0; i < 14; i++) o += '<i class="spark" style="--a:' + (i * 360 / 14).toFixed(1) + 'deg;--d:' + (1.5 + (i % 3) * 0.55).toFixed(2) + 'em"></i>'; return o; })();
  var markImg = '<img src="assets/logo-hero.png" alt="" width="512" height="512" decoding="async">';
  var typed = function (text, intro) {
    return intro
      ? '<span class="ty"></span><i class="caret"></i><span class="rest">' + esc(text) + '</span>'
      : esc(text);
  };
  var buildLockup = function (id, intro) {
    var el = document.createElement('div');
    el.className = 'lockup' + (intro ? ' is-intro' : '');
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', P.a + ' and ' + P.b + '. ' + P.label + '. ' + K.fromLabel + ' ' + K.from + (K.fromRole ? ', ' + K.fromRole : '') + ', ' + K.toLabel + ' ' + K.to + '.');
    el.innerHTML =
      '<div class="lk-mark">' + markImg + '</div>' +
      '<div class="lk-names" aria-hidden="true"><span class="lk-a">' + typed(P.a, intro) + '</span><span class="lk-x">×' + sparks + '</span><span class="lk-b">' + typed(P.b, intro) + '</span></div>' +
      '<div class="lk-line" aria-hidden="true"></div>' +
      '<div class="lk-label" aria-hidden="true">' + esc(P.label) + '</div>' +
      '<div class="lk-people" aria-hidden="true">' +
        '<span class="pp"><small>' + esc(K.fromLabel) + '</small><b class="scr" data-text="' + esc(K.from) + '">' + esc(K.from) + '</b>' + (K.fromRole ? '<em class="role">(' + esc(K.fromRole) + ')</em>' : '') + '</span>' +
        '<i class="pp-link"></i>' +
        '<span class="pp"><small>' + esc(K.toLabel) + '</small><b class="scr" data-text="' + esc(K.to) + '">' + esc(K.to) + '</b></span>' +
      '</div>';
    return el;
  };
  var heroLockup = $('#hero-lockup');
  heroLockup.appendChild(buildLockup('h', false));

  /* ── 3. Intro ──────────────────────────────────────────────────────── */
  var skipped = false;
  var waiters = [];
  var wait = function (ms) {
    if (skipped) return Promise.resolve();
    return new Promise(function (resolve) {
      var t = setTimeout(done, ms);
      function done() { clearTimeout(t); waiters = waiters.filter(function (f) { return f !== done; }); resolve(); }
      waiters.push(done);
    });
  };
  var skip = function () {
    if (skipped) return;
    skipped = true;
    waiters.slice().forEach(function (f) { f(); });
  };

  var typeInto = function (span, text, per) {
    var ty = $('.ty', span), rest = $('.rest', span), caret = $('.caret', span);
    caret.classList.add('on');
    var i = 0;
    var step = function () {
      if (skipped || i >= text.length) {
        ty.textContent = text;
        rest.textContent = '';
        caret.classList.remove('on');
        return Promise.resolve();
      }
      i++;
      ty.textContent = text.slice(0, i);
      rest.textContent = text.slice(i);
      return wait(per).then(step);
    };
    return step();
  };

  /* Letters scramble through random glyphs, then lock in left to right. The width is pinned
     while it runs so the row never jiggles. */
  var GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&/<>+*';
  var decode = function (el, dur) {
    var text = el.getAttribute('data-text');
    var w = el.getBoundingClientRect().width;
    el.style.visibility = '';
    el.style.display = 'inline-block';
    el.style.width = w + 'px';
    el.style.whiteSpace = 'nowrap';
    var settle = function () { el.textContent = text; el.style.width = ''; el.style.display = ''; };
    var steps = Math.max(1, Math.round(dur / 38)), k = 0;
    var tick = function () {
      if (skipped || k >= steps) { settle(); return Promise.resolve(); }
      k++;
      var keep = Math.floor(text.length * (k / steps));
      var out = '';
      for (var i = 0; i < text.length; i++) {
        out += (i < keep || text[i] === ' ') ? text[i] : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
      return wait(38).then(tick);
    };
    return tick();
  };

  var playIntro = function () {
    var ov = $('#intro');
    var stage = $('.intro-stage', ov);
    window.scrollTo(0, 0); // a restored scroll offset would put the hero lockup off-screen at hand-off
    var lk = buildLockup('i', true);
    stage.appendChild(lk);

    var onSkip = function () { skip(); };
    ['pointerdown', 'keydown', 'wheel', 'touchmove'].forEach(function (ev) {
      window.addEventListener(ev, onSkip, { passive: true, once: true });
    });
    $('#intro-skip').addEventListener('click', onSkip);

    var add = function (c) { lk.classList.add(c); };
    var finish = function () {
      var end = function () {
        root.classList.remove('intro-pending');
        ov.remove();
        startPage();
      };
      // Measure first, then glide the stage onto the hero lockup so intro and page read as one move.
      window.scrollTo(0, 0);
      var a = lk.getBoundingClientRect();
      var h = heroLockup.firstElementChild.getBoundingClientRect();
      var dur = skipped ? 450 : 950;
      ov.classList.add('leaving');
      var done = false;
      var once = function () { if (done) return; done = true; end(); };
      if (!a.width || !h.width || !lk.animate) { setTimeout(once, dur); return; }
      var s = h.width / a.width;
      lk.style.transformOrigin = '0 0';
      var anim = lk.animate(
        [{ transform: 'none' }, { transform: 'translate(' + (h.left - a.left) + 'px,' + (h.top - a.top) + 'px) scale(' + s + ')' }],
        { duration: dur, easing: 'cubic-bezier(0.77, 0, 0.175, 1)', fill: 'forwards' }
      );
      anim.onfinish = once;
      setTimeout(once, dur + 400); // a hidden tab never ticks animation frames
    };

    return (async function () {
      await wait(350);
      add('s-mark'); await wait(900);
      add('s-bolt'); await wait(550);
      await typeInto($('.lk-a', lk), P.a, 46);
      await wait(120);
      add('s-x'); await wait(420);
      await typeInto($('.lk-b', lk), P.b, 40);
      if (!skipped) { add('glitch'); setTimeout(function () { lk.classList.remove('glitch'); }, 560); }
      await wait(260);
      add('s-line'); await wait(380);
      add('s-label'); await wait(420);
      var scr = $$('.scr', lk);
      scr.forEach(function (el) { el.style.visibility = 'hidden'; });
      add('s-people');
      await Promise.all(scr.map(function (el, i) { return wait(i * 180).then(function () { return decode(el, 950); }); }));
      await wait(750);
      if (skipped) {
        ['s-mark', 's-bolt', 's-x', 's-line', 's-label', 's-people'].forEach(add);
        scr.forEach(function (el) { el.textContent = el.getAttribute('data-text'); el.style.width = ''; el.style.display = ''; el.style.visibility = ''; });
        await new Promise(function (r) { setTimeout(r, 280); });
      }
      finish();
    })();
  };

  /* ── 4. Ambient hex field ──────────────────────────────────────────── */
  var hexField = function () {
    var cv = $('#field');
    var ctx = cv.getContext('2d');
    if (!ctx) return;
    var animated = !reduce && !matchMedia('(pointer: coarse)').matches && !narrow.matches;
    var SIDE = 44;
    var W, H, dpr, base, adj = {}, keys = [], pulses = [], last = 0, spawnAt = 0, raf = 0;
    var COLORS = ['51,85,238', '0,204,255', '0,255,136'];
    var keyOf = function (x, y) { return Math.round(x * 10) + '|' + Math.round(y * 10); };

    var build = function () {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = window.innerWidth; H = window.innerHeight;
      if (!W || !H) return; // pane/tab with no size yet; the resize handler rebuilds
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      base = document.createElement('canvas');
      base.width = cv.width; base.height = cv.height;
      var b = base.getContext('2d');
      b.scale(dpr, dpr);
      b.strokeStyle = 'rgba(131,191,255,0.085)';
      b.lineWidth = 1;
      adj = {}; keys = [];
      var seen = {};
      var w = Math.sqrt(3) * SIDE;
      b.beginPath();
      for (var r = -1; r < H / (SIDE * 1.5) + 2; r++) {
        for (var c = -1; c < W / w + 2; c++) {
          var cx = c * w + (r % 2 ? w / 2 : 0), cy = r * SIDE * 1.5;
          var pts = [];
          for (var i = 0; i < 6; i++) {
            var ang = Math.PI / 6 + i * Math.PI / 3;
            pts.push([cx + SIDE * Math.cos(ang), cy + SIDE * Math.sin(ang)]);
          }
          for (var j = 0; j < 6; j++) {
            var p = pts[j], q = pts[(j + 1) % 6];
            var kp = keyOf(p[0], p[1]), kq = keyOf(q[0], q[1]);
            var ek = kp < kq ? kp + '~' + kq : kq + '~' + kp;
            if (seen[ek]) continue;
            seen[ek] = 1;
            b.moveTo(p[0], p[1]); b.lineTo(q[0], q[1]);
            if (!adj[kp]) { adj[kp] = { x: p[0], y: p[1], n: [] }; keys.push(kp); }
            if (!adj[kq]) { adj[kq] = { x: q[0], y: q[1], n: [] }; keys.push(kq); }
            adj[kp].n.push(kq); adj[kq].n.push(kp);
          }
        }
      }
      b.stroke();
      pulses = [];
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.drawImage(base, 0, 0);
    };

    var spawn = function () {
      var inView = keys.filter(function (k) { var v = adj[k]; return v.x > 0 && v.x < W && v.y > 0 && v.y < H && v.n.length > 1; });
      if (!inView.length) return;
      var k = inView[(Math.random() * inView.length) | 0];
      pulses.push({
        cur: k, prev: null, next: adj[k].n[(Math.random() * adj[k].n.length) | 0],
        t: 0, speed: 70 + Math.random() * 60, life: 0, max: 3.5 + Math.random() * 3,
        color: COLORS[(Math.random() * COLORS.length) | 0], trail: [{ x: adj[k].x, y: adj[k].y }]
      });
    };

    var frame = function (now) {
      raf = requestAnimationFrame(frame);
      var dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!base) return;
      if (now > spawnAt && pulses.length < 6) { spawn(); spawnAt = now + 650 + Math.random() * 900; }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.drawImage(base, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      pulses = pulses.filter(function (p) {
        p.life += dt;
        if (p.life > p.max) return false;
        var A = adj[p.cur], B = adj[p.next];
        var len = Math.hypot(B.x - A.x, B.y - A.y) || 1;
        p.t += (p.speed * dt) / len;
        while (p.t >= 1) {
          p.t -= 1;
          p.trail.push({ x: B.x, y: B.y });
          if (p.trail.length > 5) p.trail.shift();
          var from = p.cur; p.prev = from; p.cur = p.next;
          var opts = adj[p.cur].n.filter(function (k) { return k !== from; });
          p.next = opts.length ? opts[(Math.random() * opts.length) | 0] : from;
          A = adj[p.cur]; B = adj[p.next];
          len = Math.hypot(B.x - A.x, B.y - A.y) || 1;
        }
        var head = { x: A.x + (B.x - A.x) * p.t, y: A.y + (B.y - A.y) * p.t };
        var fade = Math.min(1, p.life * 3, (p.max - p.life) * 2);
        var pts = p.trail.concat([head]);
        for (var i = pts.length - 1; i > 0; i--) {
          var al = (i / pts.length) * fade;
          ctx.strokeStyle = 'rgba(' + p.color + ',' + (al * 0.9).toFixed(3) + ')';
          ctx.lineWidth = 1 + (i / pts.length) * 1.2;
          ctx.beginPath(); ctx.moveTo(pts[i - 1].x, pts[i - 1].y); ctx.lineTo(pts[i].x, pts[i].y); ctx.stroke();
        }
        ctx.fillStyle = 'rgba(' + p.color + ',' + fade.toFixed(3) + ')';
        ctx.shadowColor = 'rgb(' + p.color + ')'; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(head.x, head.y, 2.2, 0, 6.283); ctx.fill();
        ctx.shadowBlur = 0;
        return true;
      });
    };

    var start = function () { if (animated && !raf && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); } };
    var stop = function () { if (raf) { cancelAnimationFrame(raf); raf = 0; } };
    build();
    start();
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(build, 200); });
  };

  /* ── 5. Documents: four cards ──────────────────────────────────────── */
  var iconPDF = '<svg viewBox="0 0 54 62" fill="none"><defs><linearGradient id="gp" x1="0" y1="0" x2="54" y2="62" gradientUnits="userSpaceOnUse"><stop stop-color="var(--a1)"/><stop offset="1" stop-color="var(--a2)"/></linearGradient></defs><path d="M6 2h28l14 14v42a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" stroke="url(#gp)" stroke-width="2.5" stroke-linejoin="round"/><path d="M34 2v12a2 2 0 0 0 2 2h12" stroke="url(#gp)" stroke-width="2.5" stroke-linejoin="round"/><path d="M13 30h28M13 38h28M13 46h17" stroke="url(#gp)" stroke-width="2.5" stroke-linecap="round"/></svg>';
  var iconPPT = '<svg viewBox="0 0 54 62" fill="none"><defs><linearGradient id="gs" x1="0" y1="0" x2="54" y2="62" gradientUnits="userSpaceOnUse"><stop stop-color="var(--a1)"/><stop offset="1" stop-color="var(--a2)"/></linearGradient></defs><rect x="2" y="10" width="50" height="34" rx="3" stroke="url(#gs)" stroke-width="2.5"/><path d="M10 36l9-9 7 6 9-12 9 10" stroke="url(#gs)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M27 44v10M19 56h16" stroke="url(#gs)" stroke-width="2.5" stroke-linecap="round"/></svg>';

  var fmtSize = function (n) {
    if (!n) return '';
    if (n < 1024 * 1024) return Math.max(1, Math.round(n / 1024)) + ' KB';
    return (n / 1048576).toFixed(n < 10485760 ? 1 : 0) + ' MB';
  };

  var D = C.documents;
  var grid = $('#docs-grid');
  grid.innerHTML = D.items.map(function (d, i) {
    return '<article class="doc is-soon" data-theme="' + esc(d.theme) + '" data-i="' + i + '">' +
      '<div class="doc-inner">' +
        '<div class="doc-top"><span class="doc-track">' + esc(d.track) + '</span><span class="doc-badge">' + esc(d.kind) + '</span></div>' +
        '<div class="doc-icon" aria-hidden="true">' + ((d.icon || (d.kind === 'PPTX' ? 'slides' : 'doc')) === 'slides' ? iconPPT : iconPDF) + '</div>' +
        '<div class="doc-body"><h3>' + esc(d.title) + '</h3><p>' + esc(d.desc) + '</p></div>' +
        '<div class="doc-foot"><span class="doc-size"></span><span class="doc-action"></span></div>' +
      '</div></article>';
  }).join('');
  var cards = $$('.doc', grid);

  var setCard = function (card, item, ok, size) {
    card.classList.toggle('is-soon', !ok);
    $('.doc-size', card).textContent = ok ? [fmtSize(size), item.pages ? item.pages + ' pages' : ''].filter(Boolean).join(' · ') : '';
    $('.doc-action', card).innerHTML = ok
      ? '<a class="btn" href="downloads/' + encodeURI(item.file) + '" download>Download <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 2v8m0 0L4.5 6.5M8 10l3.5-3.5M3 13h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></a>'
      : '<span class="btn" aria-disabled="true">' + esc(D.soon) + '</span>';
  };

  cards.forEach(function (card, i) { setCard(card, D.items[i], false); });

  /* A file dropped into /downloads lights its card up on the next load.
     file:// pages cannot probe the folder, so they follow `available` in content.js. */
  var probe = function (item) {
    if (isFile) return Promise.resolve({ ok: !!item.available, size: item.size || 0 });
    return fetch('downloads/' + encodeURI(item.file), { method: 'HEAD', cache: 'no-store' }).then(function (r) {
      var type = r.headers.get('content-type') || '';
      if (r.ok && type.indexOf('text/html') === -1) return { ok: true, size: Number(r.headers.get('content-length')) || 0 };
      return { ok: false };
    }).catch(function () { return { ok: !!item.available, size: item.size || 0 }; });
  };
  D.items.forEach(function (item, i) {
    probe(item).then(function (res) { setCard(cards[i], item, res.ok, res.size); });
  });

  /* Pointer tilt with a moving highlight (desktop only). */
  if (fine && !reduce) {
    cards.forEach(function (card) {
      var inner = $('.doc-inner', card), pending = false, ev;
      card.addEventListener('pointermove', function (e) {
        ev = e;
        if (pending) return;
        pending = true;
        requestAnimationFrame(function () {
          pending = false;
          var r = inner.getBoundingClientRect();
          var px = (ev.clientX - r.left) / r.width, py = (ev.clientY - r.top) / r.height;
          inner.style.setProperty('--ry', ((px - 0.5) * 9).toFixed(2) + 'deg');
          inner.style.setProperty('--rx', (-(py - 0.5) * 7).toFixed(2) + 'deg');
          inner.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
          inner.style.setProperty('--my', (py * 100).toFixed(1) + '%');
        });
      });
      card.addEventListener('pointerleave', function () {
        inner.style.setProperty('--rx', '0deg');
        inner.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* Phone: dots follow the swipe. */
  var dots = $('#docs-dots');
  dots.innerHTML = cards.map(function () { return '<i></i>'; }).join('');
  var dotEls = $$('i', dots);
  var syncDots = function () {
    if (!narrow.matches) return;
    var step = cards[0].getBoundingClientRect().width + 14;
    var idx = Math.min(cards.length - 1, Math.round(grid.scrollLeft / step));
    dotEls.forEach(function (d, i) { d.classList.toggle('on', i === idx); });
  };
  grid.addEventListener('scroll', function () { requestAnimationFrame(syncDots); }, { passive: true });
  syncDots();

  /* Deal the cards out of a stack when the grid arrives. */
  var armDeal = function () {
    if (reduce || narrow.matches) return;
    var gr = grid.getBoundingClientRect();
    var cx = gr.left + gr.width / 2, cy = gr.top + gr.height / 2;
    var rot = [-5, 3, -2, 5];
    cards.forEach(function (card, i) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--dx', (cx - (r.left + r.width / 2)).toFixed(1) + 'px');
      card.style.setProperty('--dy', (cy - (r.top + r.height / 2)).toFixed(1) + 'px');
      card.style.setProperty('--r', rot[i % rot.length] + 'deg');
      card.style.setProperty('--z', String(cards.length - i));
      card.classList.add('stacked');
    });
    var release = function () {
      cards.forEach(function (card, i) { setTimeout(function () { card.classList.remove('stacked'); }, i * 130); });
    };
    var io = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { io.disconnect(); release(); }
    }, { threshold: 0.25 });
    io.observe(grid);
    setTimeout(function () { io.disconnect(); release(); }, 20000); // never leave the deck stacked
  };

  /* ── 6. Page motion (reveals, counters, charge line) ───────────────── */
  var started = false;
  var startPage = function () {
    if (started) return;
    started = true;
    $$('[data-stagger]').forEach(function (p) {
      Array.prototype.forEach.call(p.children, function (c, i) { c.setAttribute('data-reveal', ''); c.style.setProperty('--i', i); });
    });

    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        if (e.target.hasAttribute('data-count')) count(e.target);
        io.unobserve(e.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    $$('[data-reveal],[data-words]').forEach(function (el) { io.observe(el); });
    $$('[data-count]').forEach(function (el) { io.observe(el); });

    var count = function (el) {
      var end = Number(el.getAttribute('data-count'));
      if (reduce) { el.textContent = end; return; }
      var t0 = performance.now(), dur = 1300;
      var tick = function (now) {
        var k = Math.min(1, (now - t0) / dur);
        el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(tick); else el.textContent = end;
      };
      el.textContent = '0';
      requestAnimationFrame(tick);
      setTimeout(function () { el.textContent = end; }, dur + 400); // hidden tabs skip frames
    };

    /* charge line */
    var line = $('#charge-line');
    var dotsNav = $$('.cl-dot', line);
    var sections = dotsNav.map(function (a) { return $(a.getAttribute('href')); });
    var ticking = false;
    var update = function () {
      ticking = false;
      var max = root.scrollHeight - window.innerHeight;
      line.style.setProperty('--p', max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)).toFixed(4) : 0);
      var active = 0;
      sections.forEach(function (s, i) { if (s && s.getBoundingClientRect().top < window.innerHeight * 0.45) active = i; });
      dotsNav.forEach(function (d, i) { d.classList.toggle('on', i === active); });
    };
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update);
    update();

    armDeal();
  };

  /* ── 7. Go ─────────────────────────────────────────────────────────── */
  hexField();
  $('#replay').addEventListener('click', function () {
    try { sessionStorage.removeItem('uc-intro-seen'); } catch (e) {}
    try { history.scrollRestoration = 'manual'; } catch (e) {}
    window.scrollTo(0, 0);
    location.reload();
  });

  var begin = function () {
    if (root.classList.contains('intro-pending')) {
      playIntro().catch(function () { root.classList.remove('intro-pending'); startPage(); });
    } else {
      startPage();
    }
  };
  // Card positions are measured for the deal-out, so wait until fonts have settled the layout.
  var ready = document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise(function (r) { setTimeout(r, 1500); })]) : Promise.resolve();
  ready.then(begin);
})();

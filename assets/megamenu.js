/* megamenu.js — apertura por hover (desktop) + click (táctil) + teclado, con intención. */
(function () {
  var triggers = Array.prototype.slice.call(document.querySelectorAll('.has-mega'));
  if (!triggers.length) return;
  var closeTimer;

  function panelFor(t) { return document.getElementById('mega-' + t.getAttribute('data-mega')); }

  function open(t) {
    clearTimeout(closeTimer);
    triggers.forEach(function (o) { if (o !== t) close(o); });
    t.classList.add('open');
    var p = panelFor(t); if (p) p.classList.add('open');
    var a = t.querySelector('a'); if (a) a.setAttribute('aria-expanded', 'true');
  }
  function close(t) {
    t.classList.remove('open');
    var p = panelFor(t); if (p) p.classList.remove('open');
    var a = t.querySelector('a'); if (a) a.setAttribute('aria-expanded', 'false');
  }
  function closeAllSoon() { closeTimer = setTimeout(function () { triggers.forEach(close); }, 140); }

  triggers.forEach(function (t) {
    var p = panelFor(t), a = t.querySelector('a');
    if (a) { a.setAttribute('aria-haspopup', 'true'); a.setAttribute('aria-expanded', 'false'); }

    t.addEventListener('mouseenter', function () { open(t); });
    t.addEventListener('mouseleave', closeAllSoon);
    if (p) {
      p.addEventListener('mouseenter', function () { clearTimeout(closeTimer); });
      p.addEventListener('mouseleave', closeAllSoon);
    }
    // Click/táctil: primer toque abre (sin navegar), segundo navega
    if (a) a.addEventListener('click', function (e) {
      if (!t.classList.contains('open')) { e.preventDefault(); open(t); }
    });
    // Teclado: cerrar al salir el foco del conjunto disparador+panel
    function onFocusOut(e) {
      var to = e.relatedTarget;
      if (to && (t.contains(to) || (p && p.contains(to)))) return;
      closeAllSoon();
    }
    t.addEventListener('focusout', onFocusOut);
    if (p) p.addEventListener('focusout', onFocusOut);
  });

  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') triggers.forEach(close); });
})();

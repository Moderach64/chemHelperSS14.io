(function () {
  'use strict';

  // Всё состояние хранится только в DOM: после обновления страницы всё возвращается как было.
  var zones = Array.prototype.slice.call(document.querySelectorAll('.zone'));
  var btnCollapse = document.getElementById('collapseAll');
  var btnExpand = document.getElementById('expandAll');
  var btnShowHidden = document.getElementById('showHidden');
  var totalLabel = document.getElementById('hiddenTotal');
  var btnStd = document.getElementById('modeStd');
  var btnExp = document.getElementById('modeExp');

  // Оформление: стандартное (карточки) или экспериментальное (формулы)
  function setMode(experimental) {
    document.body.classList.toggle('mode-exp', experimental);
    btnStd.classList.toggle('active', !experimental);
    btnExp.classList.toggle('active', experimental);
    btnStd.setAttribute('aria-pressed', String(!experimental));
    btnExp.setAttribute('aria-pressed', String(experimental));
  }
  btnStd.addEventListener('click', function () { setMode(false); });
  btnExp.addEventListener('click', function () { setMode(true); });

  function setCollapsed(zone, collapsed) {
    zone.classList.toggle('collapsed', collapsed);
    zone.querySelector('.zone-head').setAttribute('aria-expanded', String(!collapsed));
  }

  function restore(scope) {
    scope.querySelectorAll('.is-hidden').forEach(function (el) {
      el.classList.remove('is-hidden');
    });
    refresh();
  }

  // Считаем по стандартным карточкам: у каждого рецепта скрываются обе версии сразу
  function refresh() {
    zones.forEach(function (zone) {
      var n = zone.querySelectorAll('.card.is-hidden').length;
      var chip = zone.querySelector('.hid-chip');
      chip.hidden = n === 0;
      chip.textContent = 'скрыто: ' + n + ' · показать';
    });
    var total = document.querySelectorAll('.card.is-hidden').length;
    totalLabel.textContent = total;
    btnShowHidden.disabled = total === 0;
  }

  // Заголовки категорий: сворачивание и разворачивание
  zones.forEach(function (zone) {
    var head = zone.querySelector('.zone-head');

    var chev = document.createElement('span');
    chev.className = 'chev';
    chev.setAttribute('aria-hidden', 'true');
    chev.textContent = '▾';
    head.insertBefore(chev, head.firstChild);

    var chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'hid-chip';
    chip.hidden = true;
    chip.title = 'Вернуть скрытые рецепты этой категории';
    head.querySelector('.zone-title').insertAdjacentElement('afterend', chip);

    head.setAttribute('role', 'button');
    head.setAttribute('aria-expanded', 'true');
    head.tabIndex = 0;

    function toggle() { setCollapsed(zone, !zone.classList.contains('collapsed')); }

    head.addEventListener('click', function (e) {
      if (e.target.closest('.hid-chip')) return;
      toggle();
    });
    head.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ' ') && e.target === head) {
        e.preventDefault();
        toggle();
      }
    });
    chip.addEventListener('click', function (e) {
      e.stopPropagation();
      restore(zone);
    });
  });

  // Кнопки ✕ на карточках и формулах: рецепт скрывается в обоих оформлениях
  document.querySelectorAll('.card .card-head, .fcard .fh').forEach(function (head) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'hide-btn';
    btn.textContent = '✕';
    btn.title = 'Скрыть рецепт до обновления страницы';
    btn.setAttribute('aria-label', 'Скрыть рецепт');
    head.appendChild(btn);
    btn.addEventListener('click', function () {
      var item = head.closest('.card, .fcard');
      var id = item.getAttribute('data-id');
      var pair = id ? item.closest('.zone').querySelectorAll('[data-id="' + id + '"]') : [item];
      Array.prototype.forEach.call(pair, function (el) { el.classList.add('is-hidden'); });
      refresh();
    });
  });

  // Общая панель
  btnCollapse.addEventListener('click', function () {
    zones.forEach(function (z) { setCollapsed(z, true); });
  });
  btnExpand.addEventListener('click', function () {
    zones.forEach(function (z) { setCollapsed(z, false); });
  });
  btnShowHidden.addEventListener('click', function () { restore(document); });


  // Окно «Журнал изменений»
  var dlg = document.getElementById('changelog');
  var btnToggleAll = document.getElementById('clToggleAll');

  function versions() { return dlg.querySelectorAll('details.ver'); }

  function syncToggleLabel() {
    var allOpen = Array.prototype.every.call(versions(), function (d) { return d.open; });
    btnToggleAll.textContent = allOpen ? 'Свернуть все' : 'Развернуть все';
  }

  document.querySelectorAll('[data-open-changelog]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!dlg.open) dlg.showModal();
      dlg.querySelector('.cl-body').scrollTop = 0;
      syncToggleLabel();
    });
  });
  dlg.querySelector('.cl-close').addEventListener('click', function () { dlg.close(); });
  // клик по затемнённому фону закрывает окно (Esc закрывает встроенно)
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  btnToggleAll.addEventListener('click', function () {
    var open = btnToggleAll.textContent === 'Развернуть все';
    versions().forEach(function (d) { d.open = open; });
    syncToggleLabel();
  });
  versions().forEach(function (d) { d.addEventListener('toggle', syncToggleLabel); });

  refresh();
})();

// ── More menu: pops up directly above the More button ──────────────────────
var moreBtn  = document.getElementById('moreBtn');
var moreMenu = document.getElementById('moreMenu');

function positionMenu() {
  if (!moreBtn || !moreMenu) return;
  var btnRect = moreBtn.getBoundingClientRect();
  // Align left edge of menu with center of button, then clamp to viewport
  var menuWidth = moreMenu.offsetWidth || 220;
  var ideal = btnRect.left + btnRect.width / 2 - menuWidth / 2;
  var clamped = Math.max(8, Math.min(ideal, window.innerWidth - menuWidth - 8));
  moreMenu.style.left  = clamped + 'px';
  moreMenu.style.right = 'auto';
}

function openMenu() {
  positionMenu();
  moreMenu.classList.add('open');
  moreBtn.textContent = 'More ▼';
}

function closeMenu() {
  moreMenu.classList.remove('open');
  if (moreBtn) moreBtn.textContent = 'More ▲';
}

if (moreBtn && moreMenu) {
  moreBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    moreMenu.classList.contains('open') ? closeMenu() : openMenu();
  });

  document.addEventListener('click', function (e) {
    if (!moreMenu.contains(e.target) && e.target !== moreBtn) closeMenu();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  window.addEventListener('resize', function () {
    if (moreMenu.classList.contains('open')) positionMenu();
  });
}

// ── Lightbox ─────────────────────────────────────────────────────────────────
function initLightbox() {
  var overlay  = document.querySelector('.lightbox-overlay');
  if (!overlay) return;
  var img      = overlay.querySelector('.lightbox-img');
  var closeBtn = overlay.querySelector('.lightbox-close');
  var capTitle = overlay.querySelector('.lightbox-caption h3');
  var capDesc  = overlay.querySelector('.lightbox-caption p');

  // Inject prev/next arrows
  var prevBtn = document.createElement('button');
  prevBtn.className = 'lightbox-prev';
  prevBtn.innerHTML = '&#8592;';
  var nextBtn = document.createElement('button');
  nextBtn.className = 'lightbox-next';
  nextBtn.innerHTML = '&#8594;';
  overlay.appendChild(prevBtn);
  overlay.appendChild(nextBtn);

  var items = Array.from(document.querySelectorAll('.gallery-item'));
  var currentIndex = 0;

  function show(index) {
    currentIndex = (index + items.length) % items.length;
    var item  = items[currentIndex];
    var src   = item.dataset.full  || (item.querySelector('img') && item.querySelector('img').src) || '';
    var title = item.dataset.title || '';
    var desc  = item.dataset.desc  || '';
    img.src = src;
    if (capTitle) capTitle.textContent = title;
    if (capDesc)  capDesc.textContent  = desc;
  }

  items.forEach(function (item, i) {
    item.addEventListener('click', function () {
      show(i);
      overlay.classList.add('open');
    });
  });

  prevBtn.addEventListener('click', function (e) { e.stopPropagation(); show(currentIndex - 1); });
  nextBtn.addEventListener('click', function (e) { e.stopPropagation(); show(currentIndex + 1); });

  function close() { overlay.classList.remove('open'); img.src = ''; }
  if (closeBtn) closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
  document.addEventListener('keydown', function (e) {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape')      close();
    if (e.key === 'ArrowLeft')   show(currentIndex - 1);
    if (e.key === 'ArrowRight')  show(currentIndex + 1);
  });
}

document.addEventListener('DOMContentLoaded', initLightbox);

// ── Guest Gate ────────────────────────────────────────────────────────────────
function initGuestGate() {
  var gate = document.getElementById('guestGate');
  if (!gate) return;

  var key = 'guestUnlocked' + location.pathname;
  if (sessionStorage.getItem(key)) { gate.remove(); return; }

  // Inject back button
  var backBtn = document.createElement('button');
  backBtn.className = 'guest-gate-back';
  backBtn.innerHTML = '&times;';
  backBtn.setAttribute('aria-label', 'Go back');
  gate.appendChild(backBtn);

  backBtn.addEventListener('click', function () {
    if (history.length > 1) {
      history.back();
    } else {
      location.href = 'index.html';
    }
  });

  var form   = gate.querySelector('.guest-gate-form');
  var input  = gate.querySelector('.guest-gate-input');
  var error  = gate.querySelector('.guest-gate-error');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (input.value.trim().length > 0) {
      sessionStorage.setItem(key, '1');
      gate.remove();
    } else {
      error.textContent = 'Please enter a password.';
    }
  });
}

document.addEventListener('DOMContentLoaded', initGuestGate);

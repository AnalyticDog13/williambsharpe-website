(function () {
  /* ─ Inject header + sidebars + modal ─ */
  var HEADER = `
<header id="site-header">
  <div class="hdr-left">
    <button id="menu-btn" class="hdr-text-btn" style="background:none;border:none;display:flex;align-items:center;gap:7px;">
      <span class="menu-lines"><span></span><span></span><span></span></span>MENU
    </button>
  </div>
  <a href="index.html" id="logo-link"><img id="lm-logo" src="logo.svg" alt="Luisa Monâ"></a>
  <div class="hdr-right">
    <button id="contact-btn" class="hdr-text-btn">CONTACT</button>
    <a href="account.html" class="hdr-icon" title="Account" aria-label="Account">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
    </a>
    <a href="cart.html" class="hdr-icon" title="Cart" aria-label="Cart" id="lm-cart-link">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
      </svg>
      <span id="cart-badge"></span>
    </a>
  </div>
</header>
<div id="sidebar-overlay"></div>
<div id="lm-sidebar" class="sidebar-panel">
  <div class="sidebar-top"><span class="sidebar-lbl">MENU</span><button class="sidebar-close" id="lm-sidebar-close">CLOSE</button></div>
  <nav id="lm-sidebar-nav">
    <a href="men.html">MEN</a>
    <a href="women.html">WOMEN</a>
    <a href="kids.html">KIDS</a>
    <a href="bags.html">BAGS</a>
    <a href="accessories.html">ACCESSORIES</a>
    <a href="collections.html">COLLECTIONS</a>
    <div class="sidebar-divider"></div>
    <a href="scents.html">SCENTS</a>
    <a href="furniture.html">FURNITURE</a>
    <a href="exhibitions.html">EXHIBITIONS</a>
  </nav>
</div>
<div id="lm-contact-sidebar" class="sidebar-panel">
  <div class="sidebar-top"><span class="sidebar-lbl">CONTACT</span><button class="sidebar-close" id="lm-contact-close">CLOSE</button></div>
  <div style="display:flex;flex-direction:column;flex:1;">
    <a class="contact-email" href="mailto:support@luisamona.com">support@luisamona.com</a>
    <div class="sidebar-divider" style="margin-top:32px;"></div>
    <div class="policy-links">
      <div class="sidebar-divider" style="margin-bottom:16px;"></div>
      <a href="returns.html">RETURN POLICY &amp; REFUNDS</a>
      <a href="shipping.html">SHIPPING</a>
      <a href="faq.html">FREQUENTLY ASKED QUESTIONS</a>
    </div>
  </div>
</div>
<div id="lm-modal-overlay"></div>
<div id="lm-product-modal">
  <button class="modal-close-btn" id="lm-modal-close">CLOSE</button>
  <div class="modal-images">
    <div class="carousel-main" id="lm-carousel"></div>
    <div class="carousel-nav">
      <div class="carousel-btn" id="lm-prev">&#8592;</div>
      <div class="carousel-btn" id="lm-next">&#8594;</div>
    </div>
    <div class="carousel-dots" id="lm-dots"></div>
  </div>
  <div class="modal-detail">
    <div class="modal-name" id="lm-modal-name"></div>
    <div class="modal-price" id="lm-modal-price"></div>
    <div class="modal-desc" id="lm-modal-desc"></div>
    <div id="lm-shop-section">
      <div class="modal-section-label" id="lm-size-label">SELECT SIZE</div>
      <div class="size-grid" id="lm-size-grid"></div>
      <div id="lm-color-section" style="display:none;">
        <div class="modal-section-label">SELECT COLOUR</div>
        <div class="color-swatch-grid" id="lm-color-grid"></div>
        <div class="color-selected-label" id="lm-color-label"></div>
      </div>
      <button class="add-to-cart-btn" id="lm-add-btn" disabled>ADD TO CART</button>
      <div class="modal-feedback" id="lm-feedback">ADDED TO CART</div>
    </div>
    <div id="lm-exhibit-section" style="display:none;">
      <div class="modal-meta-row" id="lm-exhibit-meta"></div>
      <button class="outline-btn" id="lm-exhibit-btn">ENQUIRE ABOUT THIS EXHIBITION</button>
      <div class="modal-feedback" id="lm-exhibit-feedback">ENQUIRY NOTED — WE WILL BE IN TOUCH</div>
    </div>
  </div>
</div>`;

  document.body.insertAdjacentHTML('afterbegin', HEADER);

  /* ─ Cart badge ─ */
  function updateBadge() {
    var n = LMStore.count(), badge = document.getElementById('cart-badge');
    if (!badge) return;
    badge.textContent = n > 0 ? n : '';
    badge.classList.toggle('visible', n > 0);
  }
  document.addEventListener('lmcart', updateBadge);
  updateBadge();

  /* ─ Sidebars ─ */
  var sOverlay = document.getElementById('sidebar-overlay');
  var lmSidebar = document.getElementById('lm-sidebar');
  var lmContact = document.getElementById('lm-contact-sidebar');
  function closeAll() {
    lmSidebar.classList.remove('open');
    lmContact.classList.remove('open');
    sOverlay.classList.remove('open');
  }
  document.getElementById('menu-btn').addEventListener('click', function () { closeAll(); lmSidebar.classList.add('open'); sOverlay.classList.add('open'); });
  document.getElementById('contact-btn').addEventListener('click', function () { closeAll(); lmContact.classList.add('open'); sOverlay.classList.add('open'); });
  document.getElementById('lm-sidebar-close').addEventListener('click', closeAll);
  document.getElementById('lm-contact-close').addEventListener('click', closeAll);
  sOverlay.addEventListener('click', closeAll);

  /* ─ Modal ─ */
  var mOverlay = document.getElementById('lm-modal-overlay');
  var modal = document.getElementById('lm-product-modal');
  var curProduct = null, selSize = null, selColor = null;
  var sizeReqd = false, colorReqd = false;
  var curSlide = 0, slides = [];

  function updateAddBtn() {
    var ok = (!sizeReqd || selSize) && (!colorReqd || selColor);
    document.getElementById('lm-add-btn').disabled = !ok;
  }

  function closeModal() { mOverlay.classList.remove('open'); modal.classList.remove('open'); }

  function goSlide(n) {
    slides[curSlide].classList.remove('active');
    var dots = document.querySelectorAll('.carousel-dot');
    if (dots[curSlide]) dots[curSlide].classList.remove('active');
    curSlide = ((n % slides.length) + slides.length) % slides.length;
    slides[curSlide].classList.add('active');
    if (dots[curSlide]) dots[curSlide].classList.add('active');
  }

  document.getElementById('lm-modal-close').addEventListener('click', closeModal);
  mOverlay.addEventListener('click', closeModal);
  document.getElementById('lm-prev').addEventListener('click', function (e) { e.stopPropagation(); goSlide(curSlide - 1); });
  document.getElementById('lm-next').addEventListener('click', function (e) { e.stopPropagation(); goSlide(curSlide + 1); });

  document.getElementById('lm-add-btn').addEventListener('click', function () {
    if (!curProduct) return;
    var variant = selSize || 'ONE SIZE';
    if (selColor) variant += (selSize ? ' / ' : '') + selColor;
    LMStore.add({ id: curProduct.id, name: curProduct.name, price: curProduct.price, img: curProduct.img, size: variant });
    var fb = document.getElementById('lm-feedback');
    fb.classList.add('show');
    setTimeout(function () { fb.classList.remove('show'); }, 2200);
    updateBadge();
  });

  document.getElementById('lm-exhibit-btn').addEventListener('click', function () {
    var fb = document.getElementById('lm-exhibit-feedback');
    fb.classList.add('show');
    setTimeout(function () { fb.classList.remove('show'); }, 2800);
  });

  function buildCarousel(img) {
    var carousel = document.getElementById('lm-carousel'), dotsEl = document.getElementById('lm-dots');
    carousel.innerHTML = ''; dotsEl.innerHTML = ''; slides = []; curSlide = 0;
    var imgs = [img, null, null, null];
    imgs.forEach(function (src, i) {
      var slide = document.createElement('div');
      slide.className = 'carousel-slide' + (i === 0 ? ' active' : '') + (!src ? ' blank' : '');
      if (src) { slide.innerHTML = '<img src="' + src + '" alt="" loading="eager">'; }
      carousel.appendChild(slide); slides.push(slide);
      var dot = document.createElement('div');
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', (function (idx) { return function () { goSlide(idx); }; })(i));
      dotsEl.appendChild(dot);
    });
  }

  window.LMPage = {
    openModal: function (p) {
      curProduct = p; selSize = null; selColor = null; curSlide = 0;
      document.getElementById('lm-modal-name').textContent = p.name;
      document.getElementById('lm-modal-price').textContent = p.price ? '€' + p.price.toLocaleString() : '';
      document.getElementById('lm-modal-desc').textContent = p.desc || '';
      buildCarousel(p.img);

      var shopSection = document.getElementById('lm-shop-section');
      var exhibitSection = document.getElementById('lm-exhibit-section');

      if (p.type === 'exhibition') {
        shopSection.style.display = 'none';
        exhibitSection.style.display = 'block';
        var meta = '';
        if (p.dates) meta += '<strong>DATES</strong> — ' + p.dates + '<br>';
        if (p.venue) meta += '<strong>VENUE</strong> — ' + p.venue + '<br>';
        if (p.location) meta += '<strong>LOCATION</strong> — ' + p.location;
        document.getElementById('lm-exhibit-meta').innerHTML = meta;
        document.getElementById('lm-exhibit-feedback').classList.remove('show');
      } else {
        shopSection.style.display = 'block';
        exhibitSection.style.display = 'none';
        document.getElementById('lm-feedback').classList.remove('show');

        /* ── Sizes ── */
        var sg = document.getElementById('lm-size-grid');
        var sizeLabel = document.getElementById('lm-size-label');
        sg.innerHTML = '';
        sizeReqd = !!(p.sizes && p.sizes.length);
        if (sizeReqd) {
          sizeLabel.style.display = '';
          sg.style.display = '';
          p.sizes.forEach(function (s) {
            var btn = document.createElement('button');
            btn.className = 'size-btn'; btn.textContent = s;
            btn.addEventListener('click', function () {
              sg.querySelectorAll('.size-btn').forEach(function (b) { b.classList.remove('selected'); });
              btn.classList.add('selected');
              selSize = s;
              updateAddBtn();
            });
            sg.appendChild(btn);
          });
        } else {
          sizeLabel.style.display = 'none';
          sg.style.display = 'none';
          selSize = null;
        }

        /* ── Colours ── */
        var colorSection = document.getElementById('lm-color-section');
        var cg = document.getElementById('lm-color-grid');
        var colorLabel = document.getElementById('lm-color-label');
        cg.innerHTML = ''; colorLabel.textContent = '';
        colorReqd = !!(p.colors && p.colors.length);
        if (colorReqd) {
          colorSection.style.display = 'block';
          p.colors.forEach(function (c) {
            var sw = document.createElement('button');
            sw.className = 'color-swatch';
            sw.style.background = c.hex;
            sw.title = c.name;
            /* light swatches need a visible border */
            var lum = parseInt(c.hex.replace('#',''), 16);
            if (c.hex === '#F1ECE4' || c.hex === '#EDE6DA' || c.hex === '#F5F0E8' || c.light) {
              sw.classList.add('color-swatch--light');
            }
            sw.addEventListener('click', function () {
              cg.querySelectorAll('.color-swatch').forEach(function (s) { s.classList.remove('selected'); });
              sw.classList.add('selected');
              selColor = c.name;
              colorLabel.textContent = c.name;
              updateAddBtn();
            });
            cg.appendChild(sw);
          });
        } else {
          colorSection.style.display = 'none';
          selColor = null;
        }

        updateAddBtn();
      }

      mOverlay.classList.add('open');
      modal.classList.add('open');
    },

    renderGrid: function (products, extraClass) {
      var grid = document.getElementById('product-grid');
      if (!grid) return;
      if (extraClass) grid.className = 'product-grid ' + extraClass;
      products.forEach(function (p) {
        var card = document.createElement('div');
        card.className = 'product-card' + (p.landscape ? ' landscape' : '');
        var infoHtml = '<div class="product-info"><div class="product-name">' + p.name + '</div>';
        if (p.price) infoHtml += '<div class="product-price">€' + p.price.toLocaleString() + '</div>';
        if (p.meta) infoHtml += '<div class="product-meta">' + p.meta + '</div>';
        /* colour dots on the card */
        if (p.colors && p.colors.length) {
          infoHtml += '<div class="card-color-dots">';
          p.colors.forEach(function (c) {
            infoHtml += '<span class="card-color-dot' + (c.light ? ' card-color-dot--light' : '') + '" style="background:' + c.hex + '" title="' + c.name + '"></span>';
          });
          infoHtml += '</div>';
        }
        infoHtml += '</div>';
        card.innerHTML = '<div class="product-img-wrap"><img class="product-img" src="' + p.img + '" alt="' + p.name + '" loading="lazy"></div>' + infoHtml;
        card.addEventListener('click', function () { LMPage.openModal(p); });
        grid.appendChild(card);
      });
    }
  };
})();

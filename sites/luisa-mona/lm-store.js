var LMStore = (function () {
  var KEY = 'lm_cart';
  function get() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function save(cart) { localStorage.setItem(KEY, JSON.stringify(cart)); document.dispatchEvent(new CustomEvent('lmcart')); }
  function add(p) {
    var cart = get(), k = p.id + '|' + (p.size || '');
    var ex = cart.filter(function (i) { return i.k === k; })[0];
    if (ex) { ex.qty++; } else { cart.push({ k: k, id: p.id, name: p.name, price: p.price, img: p.img, size: p.size || '', qty: 1 }); }
    save(cart);
  }
  function remove(k) { save(get().filter(function (i) { return i.k !== k; })); }
  function update(k, d) {
    var cart = get(), item = cart.filter(function (i) { return i.k === k; })[0];
    if (!item) return;
    item.qty += d;
    save(item.qty < 1 ? cart.filter(function (i) { return i.k !== k; }) : cart);
  }
  function count() { return get().reduce(function (s, i) { return s + i.qty; }, 0); }
  return { get: get, add: add, remove: remove, update: update, count: count };
})();

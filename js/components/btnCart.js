window.App = window.App || {};

function renderCartBadge() {
  const btn = document.querySelector('.btn-cart');
  if (!btn) return;

  const count = CartService.getCount();

  let badge = btn.querySelector('.btn-cart__count');
  if (!badge) {
    badge = document.createElement('span');
    badge.className = 'btn-cart__count';
    btn.append(badge);
  }

  badge.textContent = count;
  badge.hidden = count === 0;
}

App.initBtnCart = function () {
  const btn = document.querySelector('.btn-cart');
  if (!btn) return;

  btn.addEventListener('click', () => {
    if (!requireLogin('pages/cart.html')) return;

    location.href = getAssetPath('pages/cart.html');
  });

  renderCartBadge();
  document.addEventListener('cart:change', renderCartBadge);
};

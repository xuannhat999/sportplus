window.App = window.App || {};

App.initBtnCart = function () {
  const btn = document.querySelector('.btn-cart');
  if (!btn) return;
  btn.addEventListener('click', () => console.log('Mở giỏ hàng'));
};

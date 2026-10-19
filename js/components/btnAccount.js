window.App = window.App || {};

App.initBtnAccount = function () {
  const btn = document.querySelector('.btn-account');
  if (!btn) return;
  btn.addEventListener('click', () => console.log('Btn Account clicked'));
};

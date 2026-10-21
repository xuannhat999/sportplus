window.App = window.App || {};

App.initBtnAccount = function () {
  const btn = document.querySelector('.btn-account');
  if (!btn) return;
  btn.addEventListener('click', () => {
    if (!requireLogin('pages/account.html')) return;

    location.href = getAssetPath('pages/account.html');
  });
};

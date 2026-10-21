window.App = window.App || {};

App.initBtnAccount = function () {
  const btn = document.querySelector('.btn-account');
  const menu = document.getElementById('account-menu');
  if (!btn) return;

  const toggleMenu = isOpen => {
    if (!menu) return;

    menu.hidden = !isOpen;
    btn.setAttribute('aria-expanded', String(isOpen));
  };

  const closeMenu = () => toggleMenu(false);

  const fillUserInfo = user => {
    if (!menu) return;

    const nameEl = menu.querySelector('[data-account-name]');
    const emailEl = menu.querySelector('[data-account-email]');

    if (nameEl) nameEl.textContent = user.name || 'Người dùng';
    if (emailEl) emailEl.textContent = user.email || '';
  };

  btn.addEventListener('click', event => {
    event.stopPropagation();

    const user = getCurrentUser();

    // chưa đăng nhập -> sang trang đăng nhập
    if (!user) {
      requireLogin('pages/account.html');
      return;
    }

    fillUserInfo(user);
    toggleMenu(!menu || menu.hidden);
  });

  // click ra ngoài menu -> đóng
  document.addEventListener('click', event => {
    if (!menu || menu.hidden) return;
    if (menu.contains(event.target) || btn.contains(event.target)) return;

    closeMenu();
  });

  // nhấn Escape -> đóng
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });

  // đăng xuất
  const logoutBtn = menu ? menu.querySelector('[data-account-logout]') : null;
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      closeMenu();
      logout();
    });
  }
};

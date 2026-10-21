(function () {
  var headerContainer = document.getElementById('header-container');
  if (!headerContainer) return;

  var root = document.body.dataset.root || '';
  var headerHTML = `
<header class="header" id="header">
  <button class="btn-menu">
    <i class="fa-solid fa-bars btn-menu__icon"></i>
  </button>
  <nav class="left">
    <a href="${root}index.html" class="header__name">SportPlus</a>
  </nav>
  <div class="search-bar">
    <i class="fa-solid fa-magnifying-glass search-bar__icon"></i>
    <form class="search-bar__form" action="${root}pages/products_search.html" method="get">
      <input class="search-bar__input" name="q" type="search" placeholder="Tìm sản phẩm" aria-label="Tìm kiếm sản phẩm">
    </form>
  </div>
  <button class="btn-cart">
    <i class="fa-solid fa-cart-shopping btn-cart__icon"></i>
  </button>

  <div class="account-menu">
    <button class="btn-account" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="account-menu">
      <i class="fa-solid fa-user btn-account__icon"></i>
    </button>

    <div class="account-menu__dropdown" id="account-menu" hidden>
      <div class="account-menu__head">
        <p class="account-menu__name" data-account-name></p>
        <p class="account-menu__email" data-account-email></p>
      </div>

      <a class="account-menu__item" href="${root}pages/account.html">
        <i class="fa-solid fa-user"></i>
        <span>Thông tin tài khoản</span>
      </a>

      <a class="account-menu__item" href="${root}pages/orders.html">
        <i class="fa-solid fa-receipt"></i>
        <span>Lịch sử mua hàng</span>
      </a>

      <button class="account-menu__item account-menu__item--logout" type="button" data-account-logout>
        <i class="fa-solid fa-arrow-right-from-bracket"></i>
        <span>Đăng xuất</span>
      </button>
    </div>
  </div>
  </header>
`;
  headerContainer.innerHTML = headerHTML;
})();

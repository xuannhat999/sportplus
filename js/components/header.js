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
  <label class="search-bar">
    <i class="fa-solid fa-magnifying-glass icon-search"></i>
    <form>
      <input class="search-bar__input" type="search" placeholder="Tìm sản phẩm" aria-label="Tìm kiếm sản phẩm">
    </form>
  </label>
  <button class="btn-cart">
    <i class="fa-solid fa-cart-shopping btn-cart__icon"></i>
  </button>
  <button class="btn-account">
    <i class="fa-solid fa-user btn-account__icon"></i>
  </button>
  </header>
`;
  headerContainer.innerHTML = headerHTML;
})();

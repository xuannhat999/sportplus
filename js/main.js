App.initBtnCart();
App.initBtnAccount();

function initHomePage() {
  const all = ProductService.getAll();

  document.querySelectorAll("[data-rail]").forEach(section => {
    const track = section.querySelector(".all-products--rail");
    if (!track) return;

    const category = section.dataset.rail;
    renderProducts(all.filter(product => product.category === category), { container: track });
  });
}

function initProductDetailPage() {
  const product = ProductService.getAll()[0];
  renderProductDetail(product);
  renderProducts(ProductService.getRelatedProducts());
}

function initProductsSearchPage() {
  initProductFilters();
  renderProducts(ProductService.getRelatedProducts(25));
}

function initAccountPage() {
  App.initAccount();
}

function initCartPage() {
  App.initCart();
}

function initAuthPage() {
  App.initAuth();
}

function initOrdersPage() {
  App.initOrders();
}

function initOrderDetailPage() {
  App.initOrderDetail();
}

function initOrderCompletePage() {
  App.initOrderComplete();
}

const PAGES = {
  home: initHomePage,
  product_detail: initProductDetailPage,
  products_search: initProductsSearchPage,
  account: initAccountPage,
  cart: initCartPage,
  auth: initAuthPage,
  orders: initOrdersPage,
  order_detail: initOrderDetailPage,
  order_complete: initOrderCompletePage
};

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  if (PAGES[page]) PAGES[page]();
});

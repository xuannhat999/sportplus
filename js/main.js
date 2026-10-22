App.initBtnCart();
App.initBtnAccount();

function initHomePage() {
  const all = ProductService.getAll();

  document.querySelectorAll("[data-rail]").forEach(section => {
    const track = section.querySelector(".all-products--rail");
    if (!track) return;

    const category = section.dataset.rail;
    renderProducts(all.filter(p => p.category === category), { container: track });
  });
}

function initProductDetailPage() {
  const id = new URLSearchParams(location.search).get("id");
  const product = ProductService.getById(id);
  renderProductDetail(product);

  const related_products = ProductService.getRelatedProducts(product);
  renderProducts(related_products);

}

function initProductsSearchPage() {
  initProductFilters(ProductService.getAll());
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
  order_complete: initOrderCompletePage,
};

document.addEventListener("DOMContentLoaded", () => {
  initData();

  const page = document.body.dataset.page;
  if (PAGES[page]) PAGES[page]();
});

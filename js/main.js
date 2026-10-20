App.initBtnCart();
App.initBtnAccount();

function initHomePage() {
  renderProductList(ProductService.getAll());
}

function initProductDetailPage() {
  const id = new URLSearchParams(location.search).get("id");
  renderProductDetail(ProductService.getById(id));
}

// TODO: bổ sung initCartPage khi trang giỏ hàng đã có markup
const PAGES = {
  home: initHomePage,
  product_detail: initProductDetailPage
};

document.addEventListener("DOMContentLoaded", () => {
  initData();

  const page = document.body.dataset.page;
  if (PAGES[page]) PAGES[page]();
});

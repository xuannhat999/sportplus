function renderProducts(products) {
  const container = document.getElementById("products");
  const tpl = document.getElementById("products-tpl");
  if (!container || !tpl) return;

  container.innerHTML = "";

  if (!Array.isArray(products) || products.length === 0) {
    container.innerHTML = '<p class="products-empty">Chưa có sản phẩm nào.</p>';
    return;
  }

  const fragment = document.createDocumentFragment();

  products.forEach(p => {
    const node = tpl.content.cloneNode(true);

    const link = node.querySelector(".product");
    link.dataset.id = p.id;
    link.href = `${getAssetPath("pages/product_detail.html")}?id=${p.id}`;

    const image = node.querySelector(".product__image");
    image.src = getAssetPath(productImages(p)[0]);
    image.alt = p.name;

    node.querySelector(".product__name").textContent = p.name;
    node.querySelector(".product__price").textContent = formatPrice(p.price);

    const oldPrice = node.querySelector(".product__price-old");
    if (p.oldPrice > p.price) {
      oldPrice.textContent = formatPrice(p.oldPrice);
      oldPrice.hidden = false;
    }

    fragment.appendChild(node);
  });

  container.appendChild(fragment);
}

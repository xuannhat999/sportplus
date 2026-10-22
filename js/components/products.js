function createProductCard(product, template) {
  const node = template.content.cloneNode(true);

  const link = node.querySelector(".product");
  link.dataset.id = product.id;
  link.href = `${getAssetPath("pages/product_detail.html")}?id=${product.id}`;

  const image = node.querySelector(".product__image");
  const images = productImages(product);
  if (images.length > 0) {
    image.src = getAssetPath(images[0]);
  }
  image.alt = product.name;

  node.querySelector(".product__name").textContent = product.name;
  node.querySelector(".product__price").textContent = formatPrice(product.price);

  const oldPrice = node.querySelector(".product__price-old");
  if (product.oldPrice > product.price) {
    oldPrice.textContent = formatPrice(product.oldPrice);
    oldPrice.hidden = false;
  }

  return node;
}

/**
 * Render danh sách sản phẩm.
 * @param {Array} products danh sách sản phẩm
 * @param {Object} [options]
 * @param {HTMLElement} [options.container] nơi chứa sản phẩm (mặc định #products)
 * @param {HTMLTemplateElement} [options.template] template item (mặc định #products-tpl)
 */
function renderProducts(products, options = {}) {
  const container = options.container || document.getElementById("products");
  const template = options.template || document.getElementById("products-tpl");
  if (!container || !template) return;

  const list = Array.isArray(products) ? products : [];

  // Thông báo "không có sản phẩm" nằm trong section chứa container,
  // fallback về toàn trang nếu container không thuộc section nào.
  const scope = container.closest("section") || document;
  const emptyEl = scope.querySelector("[data-products-empty]")
    || document.querySelector("[data-products-empty]");
  if (emptyEl) {
    emptyEl.hidden = list.length > 0;
  }

  container.replaceChildren();

  const fragment = document.createDocumentFragment();

  list.forEach(product => {
    fragment.appendChild(createProductCard(product, template));
  });

  container.appendChild(fragment);
}

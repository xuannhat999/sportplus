const MIN_QUANTITY = 1;
const MAX_QUANTITY = 99;

function setupQuantity(root) {
  const container = root.querySelector(".p-detail__summary__purchase__quantity__control");
  if (!container) return null;

  const control = App.createQuantityControl({
    value: MIN_QUANTITY,
    min: MIN_QUANTITY,
    max: MAX_QUANTITY
  });

  container.replaceChildren(control.element);

  return control;
}

function renderProductSizes(product, root) {
  const list = root.querySelector(".p-detail__summary__purchase__size-list");
  if (!list) return;

  const sizes = Array.isArray(product.sizes) && product.sizes.length > 0
    ? product.sizes
    : DEFAULT_SIZES;

  list.replaceChildren(...sizes.map((size, index) => {
    const label = document.createElement("label");
    label.className = "p-detail__summary__purchase__size";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "product-size";
    input.value = size;
    input.checked = index === 0;

    const text = document.createElement("span");
    text.textContent = size;

    label.append(input, text);
    return label;
  }));
}

// Thông báo ngắn sau khi thêm vào giỏ hàng
function showPurchaseMessage(root, message) {
  const box = root.querySelector(".p-detail__summary__purchase__message");
  if (!box) return;

  box.textContent = message;
  box.hidden = false;

  clearTimeout(box._timer);
  box._timer = setTimeout(() => {
    box.hidden = true;
  }, 2500);
}

function renderProductDetail(product) {
  const container = document.getElementById("product-detail");
  const tpl = document.getElementById("product-detail-tpl");
  if (!container || !tpl) return;

  if (!product) {
    renderProductNotFound(container);
    return;
  }

  const node = tpl.content.cloneNode(true);

  const root = node.querySelector(".p-detail");
  root.dataset.id = product.id;

  const image = node.querySelector(".p-detail__media__main");
  const images = productImages(product);
  image.src = getAssetPath(images[0]);
  image.alt = product.name;

  const image_other_1 = node.querySelector(".p-detail__media__thumb__1");
  if (images[1]) {
    image_other_1.src = getAssetPath(images[1]);
  } else {
    image_other_1.hidden = true;
  }

  const image_other_2 = node.querySelector(".p-detail__media__thumb__2");
  if (images[2]) {
    image_other_2.src = getAssetPath(images[2]);
  } else {
    image_other_2.hidden = true;
  }

  const brand = node.querySelector(".p-detail__summary__info__brand");
  if (product.brand) {
    brand.textContent = product.brand;
  } else {
    brand.hidden = true;
  }

  node.querySelector(".p-detail__summary__info__name").textContent = product.name;
  node.querySelector(".p-detail__summary__info__price").textContent = formatPrice(product.price);
  node.querySelector(".p-detail__summary__info__season").textContent = product.season;
  node.querySelector(".p-detail__summary__info__kit-type").textContent = product.kit_type;

  const oldPrice = node.querySelector(".p-detail__summary__info__price-old");
  const discount = node.querySelector(".p-detail__summary__info__discount");
  if (product.oldPrice > product.price) {
    oldPrice.textContent = formatPrice(product.oldPrice);
    oldPrice.hidden = false;

    const percent = Math.round((1 - product.price / product.oldPrice) * 100);
    if (percent > 0) {
      discount.textContent = `-${percent}%`;
      discount.hidden = false;
    }
  }

  const meta = node.querySelector(".p-detail__summary__info__meta");
  const metaParts = [CATEGORY_LABELS[product.category], product.team].filter(Boolean);
  if (metaParts.length) {
    meta.textContent = metaParts.join(" - ");
  } else {
    meta.hidden = true;
  }

  renderProductSizes(product, node);
  const quantityControl = setupQuantity(node);

  const addToCartBtn = node.querySelector(".p-detail__summary__purchase__btn-add-to-cart");
  addToCartBtn.dataset.id = product.id;
  addToCartBtn.addEventListener("click", () => {
    if (!requireLogin(`pages/product_detail.html?id=${product.id}`)) return;

    const sizeInput = root.querySelector('input[name="product-size"]:checked');
    const size = sizeInput ? sizeInput.value : DEFAULT_SIZES[0];
    const quantity = quantityControl ? quantityControl.getValue() : MIN_QUANTITY;

    CartService.add(product, size, quantity);
    showPurchaseMessage(root, `Đã thêm ${product.name} vào giỏ hàng.`);
  });

  document.title = `${product.name} - SportPlus`;
  container.replaceChildren(node);
}


function renderProductNotFound(container) {
  const tpl = document.getElementById("product-not-found-tpl");
  if (!tpl) return;

  const node = tpl.content.cloneNode(true);
  const link = node.querySelector("[data-back-home]");
  if (link) link.href = getAssetPath("index.html");

  container.replaceChildren(node);
  document.title = "Không tìm thấy sản phẩm - SportPlus";
}



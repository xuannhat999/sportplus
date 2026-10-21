const CATEGORY_LABELS = {
  international: "Đội tuyển quốc gia",
  club: "Câu lạc bộ"
};

const DEFAULT_SIZES = ["S", "M", "L", "XL", "XXL"];

const MIN_QUANTITY = 1;
const MAX_QUANTITY = 99;

function setupQuantity(root) {
  const input = root.querySelector(".p-detail__summary__purchase__quantity__input");
  const minus = root.querySelector(".p-detail__summary__purchase__quantity__btn-minus");
  const plus = root.querySelector(".p-detail__summary__purchase__quantity__btn-plus");
  if (!input || !minus || !plus) return;

  const clamp = value => Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, value));

  const current = () => {
    const value = Number.parseInt(input.value, 10);
    return Number.isNaN(value) ? MIN_QUANTITY : clamp(value);
  };

  const syncButtons = qty => {
    minus.disabled = qty <= MIN_QUANTITY;
    plus.disabled = qty >= MAX_QUANTITY;
  };

  const apply = value => {
    const qty = clamp(value);
    input.value = qty;
    syncButtons(qty);
  };

  minus.addEventListener("click", () => apply(current() - 1));
  plus.addEventListener("click", () => apply(current() + 1));

  input.addEventListener("input", () => {
    const value = Number.parseInt(input.value, 10);
    if (Number.isNaN(value)) {
      syncButtons(MIN_QUANTITY);
      return;
    }

    if (value < MIN_QUANTITY) input.value = MIN_QUANTITY;
    else if (value > MAX_QUANTITY) input.value = MAX_QUANTITY;

    syncButtons(clamp(value));
  });

  input.addEventListener("blur", () => apply(current()));

  input.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      apply(current());
      input.blur();
    }
  });

  apply(MIN_QUANTITY);
}

function renderProductSizes(product, root) {
  const list = root.querySelector(".p-detail__summary__purchase__size-list");
  if (!list) return;

  const sizes = Array.isArray(product.sizes) && product.sizes.length > 0
    ? product.sizes
    : DEFAULT_SIZES;

  list.replaceChildren(...sizes.map(size => {
    const label = document.createElement("label");
    label.className = "p-detail__summary__purchase__size";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "product-size";
    input.value = size;

    const text = document.createElement("span");
    text.textContent = size;

    label.append(input, text);
    return label;
  }));
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
  setupQuantity(node);

  node.querySelector(".p-detail__summary__purchase__btn-add-to-cart").dataset.id = product.id;

  document.title = `${product.name} - SportPlus`;
  container.replaceChildren(node);
}


function renderProductNotFound(container) {
  container.innerHTML = `
    <div class="p-detail__empty">
      <p>Không tìm thấy sản phẩm.</p>
      <a class="p-detail__back" href="${getAssetPath("index.html")}">← Về trang chủ</a>
    </div>
  `;
  document.title = "Không tìm thấy sản phẩm - SportPlus";
}



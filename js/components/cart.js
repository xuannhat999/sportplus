window.App = window.App || {};

(function () {
  const CART_MIN_QUANTITY = 1;
  const CART_MAX_QUANTITY = 99;

  function getTemplates() {
    return {
      cart: document.getElementById("cart-tpl"),
      row: document.getElementById("cart-row-tpl"),
      empty: document.getElementById("cart-empty-tpl")
    };
  }

  // Bộ chỉnh số lượng chỉ để hiển thị, không xử lý sự kiện
  function createQuantityControl(item) {
    const control = App.createQuantityControl({
      value: item.quantity,
      min: CART_MIN_QUANTITY,
      max: CART_MAX_QUANTITY,
      size: "sm"
    });

    return control.element;
  }

  function fillSizeSelect(select, product, item) {
    const sizes = Array.isArray(product.sizes) && product.sizes.length > 0
      ? product.sizes
      : DEFAULT_SIZES;

    select.replaceChildren(...sizes.map(size => {
      const option = document.createElement("option");
      option.value = size;
      option.textContent = size;
      return option;
    }));

    select.value = item.size;
  }

  function createRow(item, tpl) {
    const product = ProductService.getById(item.productId);
    if (!product) return null;

    const node = tpl.content.cloneNode(true);
    const row = node.querySelector(".cart-table__row");
    row.dataset.id = item.id;

    // ô tick chọn sản phẩm: luôn được chọn, chỉ hiển thị
    const check = row.querySelector("[data-row-check]");
    check.checked = true;
    check.setAttribute("aria-label", `Chọn ${product.name}`);

    // sản phẩm
    const link = row.querySelector("[data-row-link]");
    link.href = getAssetPath("pages/product_detail.html");

    const image = row.querySelector("[data-row-image]");
    image.src = getAssetPath(productImages(product)[0]);
    image.alt = product.name;

    row.querySelector("[data-row-name]").textContent = product.name;
    row.querySelector("[data-row-meta]").textContent = [product.brand, product.team]
      .filter(Boolean)
      .join(" - ");

    // giá + thành tiền
    row.querySelector("[data-row-price]").textContent = formatPrice(product.price);
    row.querySelector("[data-row-total]").textContent = formatPrice(CartService.getLineTotal(item));

    // size + số lượng (tĩnh)
    fillSizeSelect(row.querySelector("[data-row-size]"), product, item);
    row.querySelector("[data-row-quantity]").append(createQuantityControl(item));

    return row;
  }

  function updateSummary(items) {
    const countEl = document.querySelector("[data-summary=\"count\"]");
    const totalEl = document.querySelector("[data-summary=\"total\"]");

    if (countEl) {
      const count = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
      countEl.textContent = `Đã chọn ${count} sản phẩm`;
    }

    if (totalEl) {
      totalEl.textContent = `Tổng cộng: ${formatPrice(CartService.getTotal(items))}`;
    }
  }

  function renderEmpty(container, tpls, text) {
    if (!tpls.empty) return;

    const node = tpls.empty.content.cloneNode(true);
    const empty = node.querySelector(".cart__empty");

    node.querySelector("[data-empty-text]").textContent = text;

    const loginBtn = node.querySelector("[data-empty-login]");
    const link = node.querySelector("[data-empty-link]");

    loginBtn.hidden = false;
    link.hidden = true;

    loginBtn.addEventListener("click", () => {
      location.href = getAssetPath("index.html");
    });

    container.replaceChildren(empty);
  }

  function renderCart() {
    const container = document.getElementById("cart-list");
    if (!container) return;

    const tpls = getTemplates();
    const user = getCurrentUser();

    if (!user) {
      renderEmpty(container, tpls, "Bạn cần đăng nhập để xem giỏ hàng.");
      return;
    }

    const items = CartService.getAll();

    if (!items.length) {
      renderEmpty(container, tpls, "Giỏ hàng của bạn đang trống.");
      return;
    }

    if (!tpls.cart || !tpls.row) return;

    const node = tpls.cart.content.cloneNode(true);

    // thông tin giao hàng (1/3 bên trái) - dùng chung component với trang tài khoản
    App.setupAddressField(node, user);
    App.setupPayMethodField(node, user);
    App.setupEmailField(node, user);
    App.setupPhoneField(node, user);

    node.querySelector(".cart__count").textContent = `${items.length} sản phẩm trong giỏ`;

    // các dòng của giỏ hàng
    const rows = items.map(item => createRow(item, tpls.row)).filter(Boolean);
    node.querySelector("[data-cart-rows]").replaceChildren(...rows);

    // chọn tất cả: luôn được chọn, chỉ hiển thị
    const checkAll = node.querySelector("[data-check-all]");
    if (checkAll) checkAll.checked = true;

    // thanh toán -> chuyển trang hoàn tất đơn hàng
    node.querySelector("[data-action=\"checkout\"]").addEventListener("click", () => {
      location.href = getAssetPath("pages/order_complete.html");
    });

    container.replaceChildren(node);
    updateSummary(items);
  }

  App.initCart = function () {
    renderCart();
  };
})();

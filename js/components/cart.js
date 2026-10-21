window.App = window.App || {};

(function () {
  const CART_MIN_QUANTITY = 1;
  const CART_MAX_QUANTITY = 99;

  const selectedIds = new Set();

  // đang cập nhật số lượng tại chỗ -> không render lại bảng để không mất focus
  let isUpdating = false;

  // thông báo của giỏ hàng, giữ lại qua các lần render lại
  let message = "";
  let messageIsError = false;

  function getSelectedItems(items) {
    return items.filter(item => selectedIds.has(item.id));
  }

  function getTemplates() {
    return {
      cart: document.getElementById("cart-tpl"),
      row: document.getElementById("cart-row-tpl"),
      empty: document.getElementById("cart-empty-tpl")
    };
  }

  // Bộ chỉnh số lượng dùng chung, số lượng được lưu ngay khi thay đổi
  function createQuantityControl(item) {
    const control = App.createQuantityControl({
      value: item.quantity,
      min: CART_MIN_QUANTITY,
      max: CART_MAX_QUANTITY,
      size: "sm",
      onChange: value => updateQuantity(item, value)
    });

    return control.element;
  }

  // Đổi số lượng: lưu và cập nhật tại chỗ (không render lại cả bảng)
  function updateQuantity(item, value) {
    isUpdating = true;
    CartService.updateQuantity(item.id, value);
    isUpdating = false;

    updateRowTotal(item.id);
    updateSummary();
  }

  function updateRowTotal(id) {
    const row = document.querySelector(`.cart-table__row[data-id="${id}"]`);
    if (!row) return;

    const item = CartService.getAll().find(entry => Number(entry.id) === Number(id));
    if (!item) return;

    const cell = row.querySelector("[data-row-total]");
    if (cell) cell.textContent = formatPrice(CartService.getLineTotal(item));
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

    select.addEventListener("change", () => {
      CartService.updateSize(item.id, select.value);
    });
  }

  function createRow(item, tpl) {
    const product = ProductService.getById(item.productId);
    if (!product) return null;

    const node = tpl.content.cloneNode(true);
    const row = node.querySelector(".cart-table__row");
    row.dataset.id = item.id;

    // ô tick chọn sản phẩm thanh toán
    const check = row.querySelector("[data-row-check]");
    check.checked = selectedIds.has(item.id);
    check.setAttribute("aria-label", `Chọn ${product.name}`);
    check.addEventListener("change", () => {
      if (check.checked) selectedIds.add(item.id);
      else selectedIds.delete(item.id);
      updateSummary();
    });

    // sản phẩm
    const link = row.querySelector("[data-row-link]");
    link.href = `${getAssetPath("pages/product_detail.html")}?id=${product.id}`;

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

    // size + số lượng
    fillSizeSelect(row.querySelector("[data-row-size]"), product, item);
    row.querySelector("[data-row-quantity]").append(createQuantityControl(item));

    // xoá
    row.querySelector("[data-row-remove]").addEventListener("click", () => {
      CartService.remove(item.id);
    });

    return row;
  }

  function updateSummary() {
    const items = CartService.getAll();
    const chosen = getSelectedItems(items);

    const countEl = document.querySelector("[data-summary=\"count\"]");
    const totalEl = document.querySelector("[data-summary=\"total\"]");
    const checkAll = document.querySelector("[data-check-all]");

    if (countEl) {
      const count = chosen.reduce((sum, item) => sum + item.quantity, 0);
      countEl.textContent = `Đã chọn ${count} sản phẩm`;
    }

    if (totalEl) {
      totalEl.textContent = `Tổng cộng: ${formatPrice(CartService.getTotal(chosen))}`;
    }

    if (checkAll) {
      checkAll.checked = items.length > 0 && chosen.length === items.length;
      checkAll.indeterminate = chosen.length > 0 && chosen.length < items.length;
    }
  }

  function showCartMessage(text, isError = false) {
    message = text;
    messageIsError = isError;

    applyCartMessage();
  }

  function applyCartMessage() {
    const box = document.querySelector("[data-cart-message]");
    if (!box) return;

    box.textContent = message;
    box.hidden = !message;
    box.classList.toggle("cart__message--error", messageIsError);
  }

  function renderEmpty(container, tpls, text, needLogin) {
    if (!tpls.empty) return;

    const node = tpls.empty.content.cloneNode(true);
    const empty = node.querySelector(".cart__empty");

    node.querySelector("[data-empty-text]").textContent = text;

    const loginBtn = node.querySelector("[data-empty-login]");
    const link = node.querySelector("[data-empty-link]");

    loginBtn.hidden = !needLogin;
    link.hidden = needLogin;

    if (needLogin) {
      loginBtn.addEventListener("click", () => goToAuth("pages/cart.html"));
    } else {
      link.href = getAssetPath("index.html");
    }

    container.replaceChildren(empty);
    applyCartMessage();
  }

  function renderCart() {
    const container = document.getElementById("cart-list");
    if (!container) return;

    const tpls = getTemplates();
    const user = getCurrentUser();

    if (!user) {
      renderEmpty(container, tpls, "Bạn cần đăng nhập để xem giỏ hàng.", true);
      return;
    }

    const items = CartService.getAll();

    if (!items.length) {
      renderEmpty(container, tpls, "Giỏ hàng của bạn đang trống.", false);
      return;
    }

    // bỏ các dòng đã tick mà không còn trong giỏ
    const ids = new Set(items.map(item => item.id));
    for (const id of [...selectedIds]) {
      if (!ids.has(id)) selectedIds.delete(id);
    }

    if (!tpls.cart || !tpls.row) return;

    const node = tpls.cart.content.cloneNode(true);

    // thông tin giao hàng (1/3 bên trái) - dùng chung component với trang tài khoản
    App.setupAddressField(node, user);
    App.setupPayMethodField(node, user);

    node.querySelector(".cart__count").textContent = `${items.length} sản phẩm trong giỏ`;

    // các dòng của giỏ hàng
    const rows = items.map(item => createRow(item, tpls.row)).filter(Boolean);
    node.querySelector("[data-cart-rows]").replaceChildren(...rows);

    // chọn tất cả
    const checkAll = node.querySelector("[data-check-all]");
    checkAll.addEventListener("change", () => {
      selectedIds.clear();
      if (checkAll.checked) items.forEach(item => selectedIds.add(item.id));
      renderCart();
    });

    // xoá các dòng đã chọn
    node.querySelector("[data-action=\"remove-selected\"]").addEventListener("click", () => {
      const chosen = getSelectedItems(CartService.getAll());
      if (!chosen.length) {
        showCartMessage("Chưa chọn sản phẩm nào để xoá.", true);
        return;
      }
      CartService.removeMany(chosen.map(item => item.id));
    });

    // thanh toán -> tạo đơn hàng
    node.querySelector("[data-action=\"checkout\"]").addEventListener("click", () => {
      const chosen = getSelectedItems(CartService.getAll());
      if (!chosen.length) {
        showCartMessage("Hãy chọn ít nhất một sản phẩm để thanh toán.", true);
        return;
      }

      // địa chỉ + phương thức thanh toán lấy từ cột thông tin giao hàng
      const addressInput = node.querySelector('[data-field="address"]');
      const payMethodSelect = node.querySelector('[data-field="pay_method"]');

      const order = createOrder(chosen, {
        address: addressInput ? addressInput.value.trim() : user.address,
        payMethod: payMethodSelect ? payMethodSelect.value : user.pay_method
      }, user);

      // bỏ các sản phẩm đã đặt khỏi giỏ
      CartService.removeMany(chosen.map(item => item.id));
      chosen.forEach(item => selectedIds.delete(item.id));

      // sang trang hoàn tất đơn hàng
      location.href = getAssetPath(`pages/order_complete.html?id=${order.id}`);
    });

    container.replaceChildren(node);
    updateSummary();
    applyCartMessage();
  }

  // Tạo đơn hàng từ các dòng giỏ hàng đã chọn
  function createOrder(items, info, user) {
    const details = items.map(item => {
      const product = ProductService.getById(item.productId);
      if (!product) return null;

      return {
        productId: item.productId,
        name: product.name,
        image: productImages(product)[0],
        size: item.size,
        quantity: item.quantity,
        price: product.price
      };
    }).filter(Boolean);

    return OrderService.create({
      userId: user.id,
      items: details,
      address: info.address,
      payMethod: info.payMethod
    });
  }

  App.initCart = function () {
    renderCart();

    document.addEventListener("cart:change", () => {
      if (isUpdating) return;
      renderCart();
    });

    document.addEventListener("auth:change", renderCart);
  };
})();

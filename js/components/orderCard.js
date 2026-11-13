window.App = window.App || {};

(function () {
  // Markup của 1 đơn hàng nằm trong HTML của các trang (orders / order_complete)
  function getOrderTemplates() {
    return {
      order: document.getElementById("order-tpl"),
      item: document.getElementById("order-item-tpl")
    };
  }

  function formatOrderDate(timestamp) {
    const value = Number(timestamp);
    if (!value) return "";

    return new Date(value).toLocaleString("vi-VN");
  }

  function getOrderStatusLabel(status) {
    return STATUS_LABEL[status] || status || "";
  }

  function getOrderPayMethodLabel(payMethod) {
    return ORDER_PAY_METHOD_LABELS[payMethod] || payMethod || "";
  }

  // 1 dòng sản phẩm trong đơn hàng
  // 1 dòng sản phẩm trong đơn hàng
  function createOrderItem(detail, tpl) {
    const node = tpl.content.cloneNode(true);
    const item = node.querySelector(".order-item");

    const image = item.querySelector('[data-field="image"]');
    if (image) {
      image.src = getAssetPath(detail.image || "");
      image.alt = detail.name || "Sản phẩm";
    }

    const nameEl = item.querySelector('[data-field="name"]');
    if (nameEl) nameEl.textContent = detail.name || "Sản phẩm";

    const metaEl = item.querySelector('[data-field="meta"]');
    if (metaEl) {
      metaEl.textContent = `Size ${detail.size || "M"} · Số lượng: ${detail.quantity || 1} · Đơn giá: ${formatPrice(detail.price || 0)}`;
    }

    const lineTotalEl = item.querySelector('[data-field="lineTotal"]');
    if (lineTotalEl) {
      // Hỗ trợ cả phương thức getLineTotal() lẫn phép tính trực tiếp quantity * price
      const lineTotal = typeof detail.getLineTotal === "function" 
        ? detail.getLineTotal() 
        : (Number(detail.quantity || 1) * Number(detail.price || 0));
      
      lineTotalEl.textContent = formatPrice(lineTotal);
    }

    return item;
  }

  // 1 đơn hàng (dùng chung cho trang lịch sử mua hàng và trang hoàn tất đơn hàng)
  function createOrderCard(order, tpls) {
    const node = tpls.order.content.cloneNode(true);
    const card = node.querySelector(".order");

    const title = card.querySelector(".order__title");
    if (title) title.textContent = `Đơn hàng #${order.id}`;

    const orderId = card.querySelector('[data-field="orderId"]');
    if (orderId) orderId.textContent = `#${order.id}`;

    card.querySelector('[data-field="createdAt"]').textContent = formatOrderDate(order.createdAt);
    card.querySelector('[data-field="total"]').textContent = formatPrice(order.total);
    card.querySelector('[data-field="address"]').textContent = order.address || "Chưa cập nhật";
    card.querySelector('[data-field="payMethod"]').textContent = getOrderPayMethodLabel(order.payMethod);

    const status = card.querySelector('[data-field="status"]');
    status.textContent = getOrderStatusLabel(order.status);
    status.classList.add(`order__status--${order.status}`);

    const detailLink = card.querySelector('[data-field="detailLink"]');
    if (detailLink) {
      detailLink.href = getAssetPath(`pages/order_detail.html?id=${encodeURIComponent(order.id)}`);
    }

    // danh sách sản phẩm trong đơn (trang chi tiết / hoàn tất đơn mới có)
    const itemsList = card.querySelector("[data-order-items]");
    if (itemsList && tpls.item) {
      const items = order.items.map(detail => createOrderItem(detail, tpls.item));
      itemsList.replaceChildren(...items);
    }

    return card;
  }

  App.getOrderTemplates = getOrderTemplates;
  App.createOrderCard = createOrderCard;
})();

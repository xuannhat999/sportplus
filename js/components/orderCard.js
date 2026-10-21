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
  function createOrderItem(detail, tpl) {
    const node = tpl.content.cloneNode(true);
    const item = node.querySelector(".order-item");

    const image = item.querySelector('[data-field="image"]');
    image.src = getAssetPath(detail.image);
    image.alt = detail.name;

    item.querySelector('[data-field="name"]').textContent = detail.name;
    item.querySelector('[data-field="meta"]').textContent =
      `Size ${detail.size} · Số lượng: ${detail.quantity}`;
    item.querySelector('[data-field="lineTotal"]').textContent = formatPrice(detail.getLineTotal());

    return item;
  }

  // 1 đơn hàng (dùng chung cho trang lịch sử mua hàng và trang hoàn tất đơn hàng)
  function createOrderCard(order, tpls) {
    const node = tpls.order.content.cloneNode(true);
    const card = node.querySelector(".order");

    card.querySelector('[data-field="createdAt"]').textContent = formatOrderDate(order.createdAt);
    card.querySelector('[data-field="total"]').textContent = formatPrice(order.total);
    card.querySelector('[data-field="address"]').textContent = order.address || "Chưa cập nhật";
    card.querySelector('[data-field="payMethod"]').textContent = getOrderPayMethodLabel(order.payMethod);

    const status = card.querySelector('[data-field="status"]');
    status.textContent = getOrderStatusLabel(order.status);
    status.classList.add(`order__status--${order.status}`);

    // danh sách sản phẩm trong đơn (cuộn bên trong)
    const items = order.items.map(detail => createOrderItem(detail, tpls.item));
    card.querySelector("[data-order-items]").replaceChildren(...items);

    return card;
  }

  App.getOrderTemplates = getOrderTemplates;
  App.createOrderCard = createOrderCard;
})();

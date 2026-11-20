window.App = window.App || {};

(function () {
  function renderMessage(container, text) {
    const box = document.createElement("div");
    box.className = "orders__empty";

    const icon = document.createElement("i");
    icon.className = "fa-solid fa-receipt orders__empty-icon";

    const message = document.createElement("p");
    message.className = "orders__empty-text";
    message.textContent = text;

    const action = document.createElement("a");
    action.className = "cart__btn cart__btn--primary";
    action.href = getAssetPath("pages/orders.html");
    action.textContent = "Xem lịch sử mua hàng";

    box.append(icon, message, action);
    container.replaceChildren(box);
  }

  function renderOrderDetail() {
    const container = document.getElementById("order-detail");
    if (!container) return;

    const order = OrderService.getFixed();

    if (!order) {
      renderMessage(container, "Không tìm thấy đơn hàng.");
      return;
    }

    const tpls = App.getOrderTemplates();
    if (!tpls.order || !tpls.item) return;

    container.replaceChildren(App.createOrderCard(order, tpls));
  }

  App.initOrderDetail = function () {
    renderOrderDetail();
  };
})();

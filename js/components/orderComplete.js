window.App = window.App || {};

(function () {
  function renderMessage(container, text) {
    container.innerHTML = "";

    const box = document.createElement("div");
    box.className = "order-complete__empty";

    const message = document.createElement("p");
    message.className = "order-complete__empty-text";
    message.textContent = text;

    const link = document.createElement("a");
    link.className = "cart__btn cart__btn--primary";
    link.href = getAssetPath("pages/orders.html");
    link.textContent = "Xem lịch sử mua hàng";

    box.append(message, link);
    container.append(box);
  }

  function renderOrderComplete() {
    const container = document.getElementById("order-complete");
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

  App.initOrderComplete = function () {
    renderOrderComplete();
  };
})();

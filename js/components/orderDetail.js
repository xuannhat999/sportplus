window.App = window.App || {};

(function () {
  function renderMessage(container, text, actionText, actionHref) {
    const box = document.createElement("div");
    box.className = "orders__empty";

    const icon = document.createElement("i");
    icon.className = "fa-solid fa-receipt orders__empty-icon";

    const message = document.createElement("p");
    message.className = "orders__empty-text";
    message.textContent = text;

    const action = document.createElement("a");
    action.className = "cart__btn cart__btn--primary";
    action.href = actionHref;
    action.textContent = actionText;

    box.append(icon, message, action);
    container.replaceChildren(box);
  }

  function renderOrderDetail() {
    const container = document.getElementById("order-detail");
    if (!container) return;

    const user = getCurrentUser();

    if (!user) {
      renderMessage(
        container,
        "Bạn cần đăng nhập để xem chi tiết đơn hàng.",
        "Đăng nhập",
        getAssetPath("pages/auth.html")
      );
      return;
    }

    const id = new URLSearchParams(location.search).get("id");
    const order = id ? OrderService.getById(id, user.id) : null;

    if (!order) {
      renderMessage(
        container,
        "Không tìm thấy đơn hàng.",
        "Xem lịch sử mua hàng",
        getAssetPath("pages/orders.html")
      );
      return;
    }

    const tpls = App.getOrderTemplates();
    if (!tpls.order || !tpls.item) return;

    container.replaceChildren(App.createOrderCard(order, tpls));
  }

  App.initOrderDetail = function () {
    renderOrderDetail();

    document.addEventListener("order:change", renderOrderDetail);
    document.addEventListener("auth:change", renderOrderDetail);
  };
})();

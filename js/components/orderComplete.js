window.App = window.App || {};

(function () {
  function renderMessage(container, text, actionText, actionHref) {
    container.innerHTML = "";

    const box = document.createElement("div");
    box.className = "order-complete__empty";

    const message = document.createElement("p");
    message.className = "order-complete__empty-text";
    message.textContent = text;

    const link = document.createElement("a");
    link.className = "cart__btn cart__btn--primary";
    link.href = actionHref;
    link.textContent = actionText;

    box.append(message, link);
    container.append(box);
  }

  function renderOrderComplete() {
    const container = document.getElementById("order-complete");
    if (!container) return;

    const user = getCurrentUser();

    if (!user) {
      renderMessage(
        container,
        "Bạn cần đăng nhập để xem đơn hàng.",
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

    const card = App.createOrderCard(order, tpls);
    container.replaceChildren(card);
  }

  App.initOrderComplete = function () {
    renderOrderComplete();

    document.addEventListener("auth:change", renderOrderComplete);
  };
})();

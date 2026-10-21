window.App = window.App || {};

(function () {
  function renderEmpty(container, tpls, text, needLogin) {
    if (!tpls.empty) return;

    const node = tpls.empty.content.cloneNode(true);
    const empty = node.querySelector(".orders__empty");

    node.querySelector("[data-empty-text]").textContent = text;

    const loginBtn = empty.querySelector("[data-empty-login]");
    const link = empty.querySelector("[data-empty-link]");

    loginBtn.hidden = !needLogin;
    link.hidden = needLogin;

    if (needLogin) {
      loginBtn.addEventListener("click", () => goToAuth("pages/orders.html"));
    } else {
      link.href = getAssetPath("index.html");
    }

    container.replaceChildren(empty);
  }

  function setOrdersCount(count) {
    const el = document.querySelector("[data-orders-count]");
    if (!el) return;

    el.textContent = count > 0 ? `${count} đơn hàng` : "";
  }

  function renderOrders() {
    const container = document.getElementById("orders-list");
    if (!container) return;

    const tpls = {
      ...App.getOrderTemplates(),
      empty: document.getElementById("orders-empty-tpl")
    };
    const user = getCurrentUser();

    if (!user) {
      renderEmpty(container, tpls, "Bạn cần đăng nhập để xem lịch sử mua hàng.", true);
      setOrdersCount(0);
      return;
    }

    const orders = OrderService.getAll(user.id)
      .sort((a, b) => Number(b.createdAt) - Number(a.createdAt));

    if (!orders.length) {
      renderEmpty(container, tpls, "Bạn chưa có đơn hàng nào.", false);
      setOrdersCount(0);
      return;
    }

    if (!tpls.order || !tpls.item) return;

    const cards = orders.map(order => App.createOrderCard(order, tpls));
    container.replaceChildren(...cards);
    setOrdersCount(orders.length);
  }

  App.initOrders = function () {
    renderOrders();

    document.addEventListener("order:change", renderOrders);
    document.addEventListener("auth:change", renderOrders);
  };
})();

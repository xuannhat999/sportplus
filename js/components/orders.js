window.App = window.App || {};

(function () {
  function renderEmpty(container, tpls, text) {
    if (!tpls.empty) return;

    const node = tpls.empty.content.cloneNode(true);
    const empty = node.querySelector(".orders__empty");

    node.querySelector("[data-empty-text]").textContent = text;

    const loginBtn = empty.querySelector("[data-empty-login]");
    const link = empty.querySelector("[data-empty-link]");

    loginBtn.hidden = true;
    link.hidden = false;
    link.href = getAssetPath("index.html");

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

    const orders = OrderService.getAll()
      .filter(order => !user || Number(order.userId) === Number(user.id))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (!orders.length) {
      renderEmpty(container, tpls, "Bạn chưa có đơn hàng nào.");
      setOrdersCount(0);
      return;
    }

    if (!tpls.order) return;

    const cards = orders.map(order => App.createOrderCard(order, tpls));
    container.replaceChildren(...cards);
    setOrdersCount(orders.length);
  }

  App.initOrders = function () {
    renderOrders();
  };
})();

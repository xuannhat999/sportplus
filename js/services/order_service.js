const ORDER_PAY_METHOD_LABELS = {
  online: "Thanh toán trực tuyến",
  cash: "Thanh toán khi nhận hàng"
};

const OrderService = {
  getRecords() {
    return (typeof ORDERS_SEED !== "undefined" && Array.isArray(ORDERS_SEED))
      ? ORDERS_SEED
      : [];
  },

  getAll() {
    return this.getRecords().map(order => ({ ...order }));
  },

  getFixed() {
    const all = this.getAll();
    if (all.length > 0) return all[0];

    return (typeof ORDER_DETAIL_SEED !== "undefined") ? ORDER_DETAIL_SEED : null;
  },

  getTotalQuantity(order) {
    return (order.items || []).reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  }
};

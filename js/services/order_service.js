const ORDER_KEY = "order";

const ORDER_PAY_METHOD_LABELS = {
  online: "Thanh toán trực tuyến",
  cash: "Thanh toán khi nhận hàng"
};

function notifyOrderChange() {
  document.dispatchEvent(new CustomEvent("order:change"));
}

// Đơn hàng dùng đúng model OrderModel (js/data/models/order_model.js)
function orderToJSON(order) {
  return {
    id: order.id,
    items: order.items.map(item => item.toJSON()),
    total: order.total,
    status: order.status,
    createdAt: order.createdAt,
    history: order.history,
    address: order.address,
    payMethod: order.payMethod,
    userId: order.userId
  };
}

const OrderService = {
  // Các bản ghi đơn hàng đã lưu
  getRecords() {
    const list = Storage.get(ORDER_KEY, []);
    return Array.isArray(list) ? list : [];
  },

  // userId = undefined -> lấy tất cả, có userId -> chỉ lấy đơn của user đó
  getAll(userId) {
    return this.getRecords()
      .map(record => OrderModel.fromJSON(record))
      .filter(Boolean)
      .filter(order => userId === undefined || Number(order.userId) === Number(userId));
  },

  save(records) {
    Storage.set(ORDER_KEY, records);
    notifyOrderChange();

    return records;
  },

  getById(id, userId) {
    return this.getAll(userId).find(order => Number(order.id) === Number(id)) || null;
  },

  // Tạo đơn hàng từ các dòng giỏ hàng đã chọn
  create({ userId, items, address, payMethod }) {
    const records = this.getRecords();
    const id = records.length ? Math.max(...records.map(record => Number(record.id) || 0)) + 1 : 1;

    const orderItems = (items || []).map(item => new OrderDetail({ ...item, orderId: id }));
    const total = orderItems.reduce((sum, item) => sum + item.getLineTotal(), 0);

    const order = new OrderModel(
      id,
      orderItems,
      total,
      undefined,
      undefined,
      undefined,
      address,
      payMethod,
      userId
    );

    records.push(orderToJSON(order));
    this.save(records);

    return order;
  },

  getTotalQuantity(order) {
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  }
};

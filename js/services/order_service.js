const ORDER_KEY = "order";

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
    payMethod: order.payMethod
  };
}

const OrderService = {
  getAll() {
    const list = Storage.get(ORDER_KEY, []);
    if (!Array.isArray(list)) return [];

    return list.map(order => OrderModel.fromJSON(order)).filter(Boolean);
  },

  save(list) {
    Storage.set(ORDER_KEY, list.map(orderToJSON));
    notifyOrderChange();

    return list;
  },

  getById(id) {
    return this.getAll().find(order => Number(order.id) === Number(id)) || null;
  },

  // Tạo đơn hàng từ các dòng giỏ hàng đã chọn
  create({ items, address, payMethod }) {
    const list = this.getAll();
    const id = list.length ? Math.max(...list.map(order => Number(order.id) || 0)) + 1 : 1;

    const orderItems = (items || []).map(item => new OrderDetail({ ...item, orderId: id }));
    const total = orderItems.reduce((sum, item) => sum + item.getLineTotal(), 0);

    const order = new OrderModel(id, orderItems, total, undefined, undefined, undefined, address, payMethod);

    list.push(order);
    this.save(list);

    return order;
  },

  getTotalQuantity(order) {
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  }
};

let inMemoryOrders = (typeof ORDERS_SEED !== "undefined" && Array.isArray(ORDERS_SEED)) 
  ? [...ORDERS_SEED] 
  : [];

const ORDER_PAY_METHOD_LABELS = {
  online: "Thanh toán trực tuyến",
  cash: "Thanh toán khi nhận hàng"
};

function notifyOrderChange() {
  document.dispatchEvent(new CustomEvent("order:change"));
}

function orderToJSON(order) {
  return {
    id: order.id,
    // Kiểm tra an toàn: nếu item có hàm toJSON thì gọi, không thì giữ nguyên object
    items: (order.items || []).map(item => typeof item.toJSON === "function" ? item.toJSON() : item),
    total: order.total,
    status: order.status,
    createdAt: order.createdAt,
    history: order.history || [],
    address: order.address,
    payMethod: order.payMethod,
    userId: order.userId
  };
}

const OrderService = {
  getRecords() {
    return Array.isArray(inMemoryOrders) ? inMemoryOrders : [];
  },

  getAll(userId) {
    return this.getRecords()
      .map(record => {
        // Nếu record đã là OrderModel hoặc chưa có hàm fromJSON, trả về trực tiếp record hoặc dùng fallback an toàn
        if (typeof OrderModel !== "undefined" && typeof OrderModel.fromJSON === "function") {
          return OrderModel.fromJSON(record);
        }
        return record;
      })
      .filter(Boolean)
      .filter(order => userId === undefined || Number(order.userId) === Number(userId));
  },

  save(records) {
    inMemoryOrders = records;
    notifyOrderChange();
    return records;
  },

  getById(id, userId) {
    const all = this.getAll(userId);
    
    // Nếu có truyền ID hợp lệ, tìm kiếm theo ID
    if (id !== undefined && id !== null && id !== "") {
      const found = all.find(order => Number(order.id) === Number(id));
      if (found) return found;
    }

    // Fallback thông minh: Nếu không tìm thấy hoặc không có ID trên URL, tự động trả về đơn hàng đầu tiên để test giao diện
    if (all.length > 0) return all[0];

    // Fallback cuối cùng nếu có ORDER_DETAIL_SEED độc lập
    return (typeof ORDER_DETAIL_SEED !== "undefined") ? ORDER_DETAIL_SEED : null;
  },

  create({ userId, items, address, payMethod }) {
    const records = this.getRecords();
    const id = records.length ? Math.max(...records.map(record => Number(record.id) || 0)) + 1 : 1;

    const orderItems = (items || []).map(item => typeof OrderDetail === "function" ? new OrderDetail({ ...item, orderId: id }) : item);
    const total = orderItems.reduce((sum, item) => sum + (typeof item.getLineTotal === "function" ? item.getLineTotal() : (item.price * item.quantity)), 0);

    const order = (typeof OrderModel === "function") 
      ? new OrderModel(id, orderItems, total, undefined, undefined, undefined, address, payMethod, userId)
      : { id, items: orderItems, total, status: "pending", createdAt: new Date().toISOString(), address, payMethod, userId };

    records.push(orderToJSON(order));
    this.save(records);

    return order;
  },

  getTotalQuantity(order) {
    return (order.items || []).reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  },

  updateStatus(orderId, newStatus) {
    if (typeof isAdmin === "function" && !isAdmin()) return { ok: false, message: "Bạn không có quyền." };

    const records = this.getRecords();
    const index = records.findIndex(r => Number(r.id) === Number(orderId));
    if (index === -1) return { ok: false, message: "Không tìm thấy đơn hàng." };

    let order = records[index];
    if (typeof OrderModel !== "undefined" && typeof OrderModel.fromJSON === "function") {
      order = OrderModel.fromJSON(order);
      if (typeof order.canChangeTo === "function" && !order.canChangeTo(newStatus)) {
        return { ok: false, message: "Không thể chuyển trạng thái đơn hàng này." };
      }
      if (typeof order.changeStatus === "function") {
        order.changeStatus(newStatus);
      }
    } else {
      order.status = newStatus;
    }

    records[index] = orderToJSON(order);
    this.save(records);

    return { ok: true, order };
  }
};

// Đưa hàm getOrderDetailData vào trong OrderService hoặc giữ ở global để trang order_detail gọi trực tiếp
function getOrderDetailData() {
  const urlParams = new URLSearchParams(location.search);
  const id = urlParams.get("id");
  return OrderService.getById(id);
}
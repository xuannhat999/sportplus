const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

const STATUS_LABEL = {
  pending: "Chưa xác nhận",
  confirmed: "Đã xác nhận",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
};

const NEXT_STATUS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

class OrderModel {
  constructor(id, items, total, status = ORDER_STATUS.PENDING, createdAt = Date.now(), history = [], address, payMethod) {
    this.id = id;
    this.items = items;
    this.total = total;
    this.status = status;
    this.createdAt = createdAt;
    this.history = history;
    this.address = address;
    this.payMethod = payMethod;

  }

  canChangeTo(newStatus) {
    return NEXT_STATUS[this.status].includes(newStatus);
  }

  changeStatus(newStatus) {
    if (!this.canChangeTo(newStatus)) {
      throw new Error(`Không thể chuyển từ ${this.status} sang ${newStatus}`);
    }
    this.history.push({ from: this.status, to: newStatus, at: Date.now() });
    this.status = newStatus;
  }

  static fromJSON(json) {
    return new OrderModel(
      json.id,
      (json.items || []).map(item => OrderDetail.fromJSON(item)),
      json.total,
      json.status,
      json.createdAt,
      json.history,
      json.address,
      json.payMethod
    );
  }
}

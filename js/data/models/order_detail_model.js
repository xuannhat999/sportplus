class OrderDetail {
  constructor({ id, orderId, productId, name, image, size, quantity, price } = {}) {
    this.id = Number(id) || 0;
    this.orderId = Number(orderId) || 0;
    this.productId = Number(productId) || 0;
    this.name = String(name || "");
    this.image = String(image || "");
    this.size = String(size || "");
    this.quantity = Number(quantity) || 0;
    this.price = Number(price) || 0;
  }

  // Dựng lại chi tiết đơn hàng từ dữ liệu đã lưu trong localStorage
  static fromJSON(data) {
    if (!data) return null;
    return new OrderDetail(data);
  }

  toJSON() {
    return {
      id: this.id,
      orderId: this.orderId,
      productId: this.productId,
      name: this.name,
      image: this.image,
      size: this.size,
      quantity: this.quantity,
      price: this.price
    };
  }

  getLineTotal() {
    return this.price * this.quantity;
  }
}

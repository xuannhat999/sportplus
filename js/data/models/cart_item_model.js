class CartItem {
  constructor({ id, productId, size, quantity } = {}) {
    this.id = Number(id) || 0;
    this.productId = Number(productId) || 0;
    this.size = String(size || "");
    this.quantity = CartItem.clampQuantity(quantity);
  }

  static clampQuantity(quantity) {
    const value = Number.parseInt(quantity, 10);
    if (Number.isNaN(value)) return 1;
    return Math.min(99, Math.max(1, value));
  }

  static fromJSON(data) {
    if (!data) return null;
    return new CartItem(data);
  }

  toJSON() {
    return {
      id: this.id,
      productId: this.productId,
      size: this.size,
      quantity: this.quantity
    };
  }

  getKey() {
    return `${this.productId}_${this.size}`;
  }

  isSameProduct(productId, size) {
    return this.productId === Number(productId) && this.size === String(size);
  }

  addQuantity(quantity) {
    this.quantity = CartItem.clampQuantity(this.quantity + Number(quantity));
    return this;
  }

  setQuantity(quantity) {
    this.quantity = CartItem.clampQuantity(quantity);
    return this;
  }

  changeSize(size) {
    this.size = String(size);
    return this;
  }

  getLineTotal(price) {
    return Number(price || 0) * this.quantity;
  }
}

const CartService = {
  getKey() {
    const user = getCurrentUser();
    return user ? `user_${user.id}` : null;
  },

  getAll() {
    const key = this.getKey();
    if (!key) return [];

    const seed = typeof CART_SEED !== "undefined" && CART_SEED ? CART_SEED : {};
    const list = seed[key];
    if (!Array.isArray(list)) return [];

    return list.map(item => ({ ...item }));
  },

  getCount() {
    return this.getAll().reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  },

  getLineTotal(item) {
    const product = ProductService.getById(item.productId);
    if (!product) return 0;

    return Number(product.price) * Number(item.quantity || 0);
  },

  getTotal(items) {
    return items.reduce((sum, item) => sum + this.getLineTotal(item), 0);
  }
};

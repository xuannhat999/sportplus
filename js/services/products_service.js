const RELATED_PRODUCTS_LIMIT = 10;

const rawProductSeed = typeof PRODUCTS_SEED !== "undefined" 
  ? PRODUCTS_SEED 
  : (typeof PRODUCTS !== "undefined" ? PRODUCTS : []);

let inMemoryProducts = Array.isArray(rawProductSeed) ? [...rawProductSeed] : [];

const ProductService = {
  getAllRaw() {
    return inMemoryProducts;
  },
  getAll() {
    return inMemoryProducts;
  },
  getById(id) {
    return this.getAll().find(p => p.id === Number(id));
  },
  getRelatedProducts(product, limit = RELATED_PRODUCTS_LIMIT) {
    if (!product) return [];

    const list = this.getAll();
    const currentId = Number(product.id);
    const related = [];
    const usedIds = new Set();

    const criteria = [
      p => p.team === product.team,
      p => p.league === product.league,
      p => p.season === product.season
    ];

    for (const isMatch of criteria) {
      if (related.length >= limit) break;

      for (const item of list) {
        if (related.length >= limit) break;
        if (Number(item.id) === currentId) continue;
        if (usedIds.has(item.id)) continue;
        if (!isMatch(item)) continue;

        usedIds.add(item.id);
        related.push(item);
      }
    }

    return related;
  },
  add(product) {
    const list = this.getAllRaw();
    product.id = list.length ? Math.max(...list.map(p => p.id)) + 1 : 1;
    list.push(product);
    return product;
  },
  update(id, changes) {
    inMemoryProducts = this.getAllRaw().map(p =>
      p.id === Number(id) ? { ...p, ...changes } : p
    );
  },
  remove(id) {
    inMemoryProducts = this.getAllRaw().filter(p => p.id !== Number(id));
  },

  isSold(id) {
    const pid = Number(id);
    const orders = inMemoryOrders;

    return orders.some(order =>
      (order.items || []).some(line => Number(line.productId) === pid)
    );
  },

  hide(id) {
    this.update(id, { is_hidden: true });
  },
  unhide(id) {
    this.update(id, { is_hidden: false });
  }
};
const PRODUCT_KEY = "products";

const RELATED_PRODUCTS_LIMIT = 10;

const ProductService = {
  getAll() {
    return Storage.get(PRODUCT_KEY, []);
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
    const list = this.getAll();
    product.id = list.length ? Math.max(...list.map(p => p.id)) + 1 : 1;
    list.push(product);
    Storage.set(PRODUCT_KEY, list);
    return product;
  },
  update(id, changes) {
    const list = this.getAll().map(p =>
      p.id === Number(id) ? { ...p, ...changes } : p
    );
    Storage.set(PRODUCT_KEY, list);
  },
  remove(id) {
    Storage.set(PRODUCT_KEY, this.getAll().filter(p => p.id !== Number(id)));
  }
};

const PRODUCT_KEY = "products";

const ProductService = {
  getAll() {
    return Storage.get(PRODUCT_KEY, []);
  },
  getById(id) {
    return this.getAll().find(p => p.id === Number(id));
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

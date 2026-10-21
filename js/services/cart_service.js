const CART_KEY_PREFIX = "cart_";

const CART_MIN_QUANTITY = 1;
const CART_MAX_QUANTITY = 99;
const CART_DEFAULT_SIZE = "M";

function notifyCartChange() {
  document.dispatchEvent(new CustomEvent("cart:change"));
}

function getCartKey() {
  const user = getCurrentUser();
  if (!user) return null;

  return `${CART_KEY_PREFIX}${user.id}`;
}

const CartService = {
  getKey: getCartKey,

  getAll() {
    const key = getCartKey();
    if (!key) return [];

    const list = Storage.get(key, []);
    if (!Array.isArray(list)) return [];

    return list.map(item => CartItem.fromJSON(item)).filter(Boolean);
  },

  save(list) {
    const key = getCartKey();
    if (!key) return list;

    Storage.set(key, list.map(item => item.toJSON()));
    notifyCartChange();

    return list;
  },

  findIndex(list, productId, size) {
    return list.findIndex(item => item.isSameProduct(productId, size));
  },

  add(product, size, quantity = 1) {
    const list = this.getAll();
    const productId = Number(product.id);
    const itemSize = String(size || CART_DEFAULT_SIZE).trim();
    const amount = CartItem.clampQuantity(quantity);

    const index = this.findIndex(list, productId, itemSize);

    if (index === -1) {
      const id = list.length ? Math.max(...list.map(item => item.id)) + 1 : 1;
      list.push(new CartItem({ id, productId, size: itemSize, quantity: amount }));
    } else {
      // đã có sẵn sản phẩm + size này -> cộng thêm số lượng
      list[index].addQuantity(amount);
    }

    return this.save(list);
  },

  updateQuantity(id, quantity) {
    const list = this.getAll();
    const item = list.find(entry => entry.id === Number(id));
    if (!item) return list;

    item.setQuantity(quantity);
    return this.save(list);
  },

  updateSize(id, size) {
    const list = this.getAll();
    const index = list.findIndex(entry => entry.id === Number(id));
    if (index === -1) return list;

    const item = list[index];
    const newSize = String(size || "").trim();
    if (!newSize || newSize === item.size) return list;

    const target = this.findIndex(list, item.productId, newSize);

    if (target === -1) {
      item.changeSize(newSize);
    } else {
      // đã có dòng cùng sản phẩm + size này -> gộp số lượng rồi bỏ dòng cũ
      list[target].addQuantity(item.quantity);
      list.splice(index, 1);
    }

    return this.save(list);
  },

  remove(id) {
    return this.save(this.getAll().filter(item => item.id !== Number(id)));
  },

  removeMany(ids) {
    const keys = new Set(ids.map(id => Number(id)));
    return this.save(this.getAll().filter(item => !keys.has(item.id)));
  },

  clear() {
    return this.save([]);
  },

  getCount() {
    return this.getAll().reduce((sum, item) => sum + item.quantity, 0);
  },

  getLineTotal(item) {
    const product = ProductService.getById(item.productId);
    if (!product) return 0;

    return item.getLineTotal(product.price);
  },

  getTotal(items) {
    return items.reduce((sum, item) => sum + this.getLineTotal(item), 0);
  }
};

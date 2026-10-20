function initData() {
  const products = Storage.get(PRODUCT_KEY);
  if (!Array.isArray(products) || products.length === 0) {
    Storage.set(PRODUCT_KEY, PRODUCTS_SEED);
  }
}

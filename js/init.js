const PRODUCT_SEED_VERSION_KEY = "products_seed_version";

function initData() {
  const products = Storage.get(PRODUCT_KEY);
  const version = Storage.get(PRODUCT_SEED_VERSION_KEY);

  const isEmpty = !Array.isArray(products) || products.length === 0;
  const isOutdated = version !== PRODUCTS_SEED_VERSION;

  if (isEmpty || isOutdated) {
    Storage.set(PRODUCT_KEY, PRODUCTS_SEED);
    Storage.set(PRODUCT_SEED_VERSION_KEY, PRODUCTS_SEED_VERSION);
  }
}

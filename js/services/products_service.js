const RELATED_PRODUCTS_LIMIT = 10;

const PRODUCT_SEED = (typeof PRODUCTS_SEED !== "undefined" && Array.isArray(PRODUCTS_SEED))
  ? PRODUCTS_SEED
  : [];

const ProductService = {
  getAll() {
    return PRODUCT_SEED;
  },

  getById(id) {
    return PRODUCT_SEED.find(product => product.id === Number(id)) || null;
  },

  getRelatedProducts(limit = RELATED_PRODUCTS_LIMIT) {
    const related = [];
    for (const item of PRODUCT_SEED) {

      if (related.length >= limit) break;
      related.push(item);
    }
    return related;
  }
};

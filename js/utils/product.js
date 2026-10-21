const DEFAULT_SIZES = ["S", "M", "L", "XL", "XXL"];

function productImages(product) {
  if (Array.isArray(product.images) && product.images.length > 0) return product.images;
  return product.image ? [product.image] : [];
}

// Trả về mảng ảnh của product (hỗ trợ cả field cũ `image`).
function productImages(product) {
  if (Array.isArray(product.images) && product.images.length > 0) return product.images;
  return product.image ? [product.image] : [];
}

const ORDER_DETAIL_SEED = {
  id: 101,
  createdAt: "2026-10-01T10:00:00.000Z",
  status: "pending", // Các trạng thái có thể: pending, shipping, completed, cancelled
  payMethod: "online", // online hoặc cash
  address: "123 Nguyễn Hữu Cảnh, Phường 22, Quận Bình Thạnh, Sài Gòn",
  customer: {
    name: "Administrator",
    email: "admin@sportplus.com",
    phone: "0901234567"
  },
  items: [
    {
      productId: 1,
      name: "Score Draw England 1982 World Cup Home Shirt",
      brand:"Score Draw",
      price: 1120000,
      quantity: 1,
      size: "42",
      image: "assets/images/ao-01.jpg",
      sourceUrl: "https://www.prodirectsport.com/products/score-draw-retro-england-1982-world-cup-home-shirt-124314",
    },
    {
      productId: 2,
      name: "Score Draw England 1990 World Cup Third Shirt",
      brand: "Score Draw",
      price: 1280000,
      quantity: 2,
      size: "M",
      image: "assets/images/ao-02.jpg",
      sourceUrl: "https://www.prodirectsport.com/products/score-draw-england-1990-third-shirt-mens-replica-shirts-blue-white-eng90twcfpyss-158886",

    }
  ],
  shippingFee: 30000,
  discount: 50000,
  total: 980000, // (750k * 1) + (250k * 2) + 30k ship - 50k giảm giá
  history: [
    { status: "pending", time: "2026-10-01 10:00:00", note: "Đơn hàng đã được tạo thành công." },
    { status: "confirmed", time: "2026-10-01 10:05:00", note: "Đã xác nhận thanh toán trực tuyến." }
  ]
};
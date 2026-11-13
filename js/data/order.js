const ORDERS_SEED = [
  {
    id: 101,
    items: [
      { productId: 1, quantity: 2, size: "M", price: 500000 }
    ],
    total: 1000000,
    status: "pending",
    createdAt: "2026-10-01T10:00:00.000Z",
    history: [],
    address: "123 Nguyễn Hữu Cảnh, Bình Thạnh, Sài Gòn",
    payMethod: "online",
    userId: 1
  },
  {
    id: 102,
    items: [
      { productId: 2, quantity: 1, size: "L", price: 650000 }
    ],
    total: 650000,
    status: "pending",
    createdAt: "2026-10-02T14:30:00.000Z",
    history: [],
    address: "456 Lê Văn Việt, TP. Thủ Đức, Sài Gòn",
    payMethod: "cash",
    userId: 1
  }
];
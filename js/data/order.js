const ORDERS_SEED = [
  {
    id: 101,
    items: [
      { productId: 1, quantity: 2, size: "M", price: 500000 }
    ],
    total: 1000000,
    status: "pending",
    createdAt: "2026-10-01 10:00:00",
    history: [],
    address: "123 Nguyen Hue, Quan 1, TP. Ho Chi Minh",
    phone: "0960429570",
    email: "admin1@myshop.vn",
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
    createdAt: "2026-10-02 14:30:00",
    history: [],
    address: "123 Nguyen Hue, Quan 1, TP. Ho Chi Minh",
    phone: "0960429570",
    email: "admin1@myshop.vn",
    payMethod: "cash",
    userId: 1
  }
];
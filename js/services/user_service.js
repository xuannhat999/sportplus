const USERS_SEED_VERSION = 3;
const USER_ROLE_BUYER = "buyer";
const USER_ROLE_ADMIN = "admin";
const AUTH_PAGE_PATH = "pages/auth.html";

// Lấy danh sách user trực tiếp từ file dữ liệu USERS (js/data/users.js)
const rawUserSeed = (typeof USERS !== "undefined" && Array.isArray(USERS)) ? USERS : [];
let inMemoryUsers = rawUserSeed.map(user => ({ ...user, address: getUserAddress(user) }));

// Luôn lấy user đầu tiên làm người dùng hiện tại (hoặc admin mặc định)
function getFirstUser() {
  return inMemoryUsers.length > 0 ? inMemoryUsers[0] : {
    id: 1,
    name: "Default User",
    email: "user@sportplus.com",
    role: USER_ROLE_ADMIN,
    address: "Sài Gòn",
    pay_method: "online",
    is_locked: false
  };
}

let currentSessionUser = getFirstUser();

function getUsers() {
  return inMemoryUsers;
}

function getUserAddress(user) {
  if (!user) return "";
  if (Array.isArray(user.address)) {
    return String(user.address[0] || "").trim();
  }
  return String(user.address || "").trim();
}

function getUserById(id) {
  return getUsers().find(user => Number(user.id) === Number(id)) || null;
}

function findUserByEmail(email) {
  const target = String(email || "").trim().toLowerCase();
  if (!target) return null;
  return getUsers().find(user => String(user.email).trim().toLowerCase() === target) || null;
}

function authenticate(email, password) {
  // Luôn trả về thành công với user đầu tiên trong danh sách
  const user = getFirstUser();
  return { ok: true, user, message: "" };
}

function registerUser({ name, email, password }) {
  const users = getUsers();
  const id = users.length ? Math.max(...users.map(user => Number(user.id) || 0)) + 1 : 1;

  const user = {
    id,
    name: name || "",
    address: "",
    pay_method: "online",
    email: String(email || "").trim(),
    password: String(password || ""),
    role: USER_ROLE_BUYER,
    is_locked: false
  };

  users.push(user);
  return user;
}

function updateUser(id, changes) {
  const users = getUsers();
  const index = users.findIndex(user => Number(user.id) === Number(id));
  if (index === -1) return null;

  users[index] = { ...users[index], ...changes };
  return users[index];
}

function updatePayMethod(id, payMethod) {
  return updateUser(id, { pay_method: payMethod });
}

function updateUserEmail(id, email) {
  return updateUser(id, { email: String(email || "").trim() });
}

function updateUserAddress(id, address) {
  return updateUser(id, { address: String(address || "").trim() });
}

function login(user) {
  // Gán session bằng user được truyền vào, hoặc mặc định là user đầu tiên
  if (user) {
    currentSessionUser = {
      ...user,
      address: getUserAddress(user)
    };
  } else {
    currentSessionUser = getFirstUser();
  }
}

function getCurrentUser() {
  // Luôn trả về user đầu tiên hoặc session hiện tại để hệ thống luôn nhận diện đã đăng nhập
  if (!currentSessionUser) {
    currentSessionUser = getFirstUser();
  }
  return currentSessionUser;
}

function isLoggedIn() {
  return true; // Luôn coi như đã đăng nhập
}

function goToAuth(redirectPath) {
  const target = redirectPath || "index.html";
  location.href = getAssetPath(`${AUTH_PAGE_PATH}?redirect=${encodeURIComponent(target)}`);
}

function requireLogin(redirectPath) {
  return true; // Không cần chặn đăng nhập
}

function logout() {
  // Giữ nguyên hoặc quay về trang chủ
  const home = typeof getAssetPath === "function" ? getAssetPath("pages/auth.html") : "pages/auth.html";
  location.replace(home);
}

function isAdmin() {
  const user = getCurrentUser();
  // Nếu muốn user đầu tiên có quyền admin luôn, bạn có thể trả về true trực tiếp
  return !!user && (user.role === USER_ROLE_ADMIN || true);
}
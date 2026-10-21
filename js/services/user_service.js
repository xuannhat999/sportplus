const AUTH_KEY = 'currentUser';

function login(user) {
  const { id, name, email, role } = user;
  localStorage.setItem(AUTH_KEY, JSON.stringify({ id, name, email, role }));
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY));
  } catch {
    return null;
  }
}

function isLoggedIn() {
  return getCurrentUser() !== null;
}

function logout() {
  localStorage.removeItem(AUTH_KEY);
  location.replace('index.html');
}

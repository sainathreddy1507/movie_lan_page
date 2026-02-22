// Auth utilities - check login state, logout
function getCurrentUser() {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

function logout() {
  localStorage.removeItem('user');
  window.location.href = '/login';
}

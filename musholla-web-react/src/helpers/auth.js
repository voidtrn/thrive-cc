import { getDB } from './store';

const SESSION_KEY = 'musholla_session';

// Hak akses per role. admin = semua modul.
const ACL = {
  admin: ['dashboard', 'content', 'activities', 'inventory', 'zis', 'officers'],
  bendahara: ['dashboard', 'zis', 'inventory'],
  marbot: ['dashboard', 'content', 'activities'],
};

export function login(username, password) {
  const user = getDB().users.find((u) => u.username === username && u.password === password);
  if (!user) return null;
  const session = { username: user.username, role: user.role, name: user.name };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function logout() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function currentUser() {
  const raw = sessionStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function can(role, module) {
  return (ACL[role] || []).includes(module);
}

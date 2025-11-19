export async function getUsers() {
  try {
    const res = await fetch("/api/", { credentials: "include" });
    if (!res.ok) return [];
    const body = await res.json().catch(() => []);
    return Array.isArray(body) ? body : [];
  } catch (err) {
    console.error("Failed to fetch users", err);
    return [];
  }
}

export async function getUsersMap() {
  const users = await getUsers();
  const map = {};
  (users || []).forEach((u) => {
    if (u && u.id) map[u.id] = u.username || u.email || String(u.id);
  });
  return map;
}

export default { getUsers, getUsersMap };

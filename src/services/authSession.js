// Flask's login response uses access_token, not token.
export function persistLogin(data, storage) {
  if (typeof data?.access_token !== "string" || !data.access_token.trim()) {
    throw new Error("Login response is missing an access token.");
  }
  storage.setItem("token", data.access_token);
  return { id: data.id, name: data.username, email: data.email, role: data.role };
}

export function isCurrentSession(storage, token) {
  return storage.getItem("token") === token;
}

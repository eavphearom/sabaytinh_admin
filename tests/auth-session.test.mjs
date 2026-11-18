import test, { beforeEach } from "node:test";
import assert from "node:assert/strict";
import apiClient, { SESSION_EXPIRED_EVENT, ACCESS_DENIED_EVENT } from "../src/services/apiClient.js";
import { persistLogin, isCurrentSession } from "../src/services/authSession.js";

const storage = new Map();
globalThis.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: (key) => storage.delete(key),
};
globalThis.window = new EventTarget();
let expired = 0, denied = 0;
window.addEventListener(SESSION_EXPIRED_EVENT, () => expired++);
window.addEventListener(ACCESS_DENIED_EVENT, () => denied++);
beforeEach(() => { storage.clear(); expired = 0; denied = 0; });
const login = () => persistLogin({access_token: "valid-test-token", username: "Admin", role: "ADMIN"}, localStorage);
const fail = (status, duringRequest) => async (config) => {
  duringRequest?.();
  throw Object.assign(new Error("Mock response"), {config, response: {status}});
};

test("Flask access_token and username map to the persisted session", () => {
  assert.equal(login().name, "Admin");
  assert.equal(localStorage.getItem("token"), "valid-test-token");
});
test("missing token cannot create an apparently authenticated session", () => {
  assert.throws(() => persistLogin({role: "ADMIN"}, localStorage));
  assert.equal(localStorage.getItem("token"), null);
});
test("sidebar API requests all attach the valid persisted token", async () => {
  login();
  for (const url of ["/admin/banners", "/admin/brands", "/admin/categories", "/admin/products"]) {
    await apiClient.get(url, {adapter: async (config) => {
      assert.equal(config.headers.Authorization, "Bearer valid-test-token");
      return {data: {}, status: 200, config, headers: {}};
    }});
  }
  assert.equal(expired, 0);
  assert.equal(localStorage.getItem("token"), "valid-test-token");
});
test("401 triggers existing re-authentication flow", async () => {
  login();
  await assert.rejects(apiClient.get("/admin/brands", {adapter: fail(401)}));
  assert.equal(expired, 1);
  assert.equal(localStorage.getItem("token"), null);
});
test("403 requests access-denied UI without clearing the session", async () => {
  login();
  await assert.rejects(apiClient.get("/admin/brands", {adapter: fail(403)}));
  assert.equal(denied, 1);
  assert.equal(expired, 0);
  assert.equal(localStorage.getItem("token"), "valid-test-token");
});
test("late 401 and 403 responses do not affect a replacement session", async () => {
  for (const status of [401, 403]) {
    login();
    await assert.rejects(apiClient.get("/admin/brands", {adapter: fail(status, () => localStorage.setItem("token", "new-session"))}));
    assert.equal(localStorage.getItem("token"), "new-session");
    assert.equal(isCurrentSession(localStorage, "valid-test-token"), false);
  }
  assert.equal(expired, 0);
  assert.equal(denied, 0);
});
test("invalid login does not invalidate an existing session", async () => {
  login();
  await assert.rejects(apiClient.post("/auth/login", {}, {adapter: fail(401)}));
  assert.equal(expired, 0);
});
test("temporary API failures preserve tokens", async () => {
  login();
  await assert.rejects(apiClient.get("/admin/brands", {adapter: fail(503)}));
  assert.equal(expired, 0);
  assert.equal(localStorage.getItem("token"), "valid-test-token");
});

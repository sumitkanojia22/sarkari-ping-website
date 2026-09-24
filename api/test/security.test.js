import test from "node:test";
import assert from "node:assert/strict";
import hashToken from "../utils/hashToken.js";
import { getRefreshTokenCookieOptions } from "../utils/cookieOptions.js";

test("refresh tokens are hashed deterministically and never stored as plaintext", () => {
  const token = "refresh-token-value";
  const hash = hashToken(token);

  assert.notEqual(hash, token);
  assert.equal(hash, hashToken(token));
  assert.match(hash, /^[a-f0-9]{64}$/);
});

test("refresh cookie is secure in production", () => {
  const previousEnvironment = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";

  const options = getRefreshTokenCookieOptions();
  assert.equal(options.httpOnly, true);
  assert.equal(options.secure, true);
  assert.equal(options.sameSite, "strict");

  process.env.NODE_ENV = previousEnvironment;
});

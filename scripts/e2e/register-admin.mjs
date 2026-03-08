import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const baseUrl = process.env.SYNAPSE_E2E_BASE_URL ?? "http://127.0.0.1:8080";
const dataDir = process.env.SYNAPSE_E2E_DATA_DIR ?? "/tmp/synapse-admin-e2e";
const username = process.env.SYNAPSE_E2E_ADMIN_USER ?? "admin";
const password = process.env.SYNAPSE_E2E_ADMIN_PASSWORD ?? "supersecret";
const sharedSecretPath = process.env.SYNAPSE_E2E_SHARED_SECRET_PATH ?? path.join(dataDir, "registration_shared_secret");

const loginPayload = {
  type: "m.login.password",
  user: username,
  password,
  identifier: {
    type: "m.id.user",
    user: username,
  },
};

const loginResponse = await fetch(`${baseUrl}/_matrix/client/r0/login`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(loginPayload),
});

if (loginResponse.ok) {
  process.exit(0);
}

const sharedSecret = fs.readFileSync(sharedSecretPath, "utf8").trim();
const nonceResponse = await fetch(`${baseUrl}/_synapse/admin/v1/register`);

if (!nonceResponse.ok) {
  throw new Error(`Failed to fetch Synapse registration nonce: HTTP ${nonceResponse.status}`);
}

const { nonce } = await nonceResponse.json();
const mac = crypto
  .createHmac("sha1", sharedSecret)
  .update(nonce)
  .update("\u0000")
  .update(username)
  .update("\u0000")
  .update(password)
  .update("\u0000")
  .update("admin")
  .digest("hex");

const registerResponse = await fetch(`${baseUrl}/_synapse/admin/v1/register`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    nonce,
    username,
    password,
    admin: true,
    mac,
  }),
});

if (!registerResponse.ok) {
  throw new Error(`Failed to register Synapse admin user: HTTP ${registerResponse.status}`);
}

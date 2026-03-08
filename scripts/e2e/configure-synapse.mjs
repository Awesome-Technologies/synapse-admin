import fs from "node:fs";

const filePath = process.argv[2];

if (!filePath) {
  throw new Error("Usage: node configure-synapse.mjs <homeserver.yaml>");
}

const upsertScalar = (content, key, value) => {
  const pattern = new RegExp(`^${key}:.*$`, "m");
  const line = `${key}: ${value}`;
  return pattern.test(content) ? content.replace(pattern, line) : `${content.trimEnd()}\n${line}\n`;
};

const replaceTrustedKeyServers = content => {
  const pattern = /^trusted_key_servers:\n(?:[ \t].*\n)*/m;
  const block = "trusted_key_servers: []\n";
  return pattern.test(content) ? content.replace(pattern, block) : `${content.trimEnd()}\n${block}`;
};

let content = fs.readFileSync(filePath, "utf8");

content = upsertScalar(content, "enable_registration", "false");
content = upsertScalar(content, "registration_shared_secret_path", '"/data/registration_shared_secret"');
content = upsertScalar(content, "suppress_key_server_warning", "true");
content = replaceTrustedKeyServers(content);

fs.writeFileSync(filePath, content);

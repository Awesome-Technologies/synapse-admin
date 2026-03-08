const [url, timeoutArg] = process.argv.slice(2);

if (!url) {
  throw new Error("Usage: node wait-for-url.mjs <url> [timeoutMs]");
}

const timeoutMs = Number(timeoutArg ?? "60000");
const startedAt = Date.now();

for (;;) {
  try {
    const response = await fetch(url);
    if (response.ok) {
      process.exit(0);
    }
  } catch {
    // Keep polling until the timeout is reached.
  }

  if (Date.now() - startedAt > timeoutMs) {
    throw new Error(`Timed out waiting for ${url}`);
  }

  await new Promise(resolve => setTimeout(resolve, 1000));
}

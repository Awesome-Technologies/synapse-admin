const {createRequire} = require(`module`);
const fs = require(`fs`);
const path = require(`path`);

const workspaceRoot = path.resolve(__dirname, `../../../../`);
const workspaceRequire = createRequire(path.join(workspaceRoot, `package.json`));
const {resolveModuleName: resolvePnPModuleName} = workspaceRequire(`ts-pnp`);
const debugLogPath = path.join(workspaceRoot, `.yarn/sdks/typescript/sdk-user.log`);

const wrappedExports = new WeakMap();

function debugLog(...args) {
  try {
    fs.appendFileSync(debugLogPath, `${new Date().toISOString()} ${args.join(` `)}\n`);
  } catch {}
}

function wrapResolver(target, property) {
  const original = target[property];
  if (typeof original !== `function`) {
    return original;
  }

  return function patchedResolver(request, issuer, compilerOptions, host, ...rest) {
    let result;
    try {
      result = original.call(this, request, issuer, compilerOptions, host, ...rest);
    } catch (error) {
      debugLog(`original-${property}-throw`, request, issuer, error && (error.stack || error.message || String(error)));
      throw error;
    }

    if (result?.resolvedModule || result?.resolvedTypeReferenceDirective) {
      return result;
    }

    try {
      return resolvePnPModuleName(
        request,
        issuer,
        compilerOptions,
        host,
        (nextRequest, nextIssuer, nextOptions, nextHost) =>
          original.call(this, nextRequest, nextIssuer, nextOptions, nextHost, ...rest)
      );
    } catch (error) {
      debugLog(`pnp-${property}-throw`, request, issuer, error && (error.stack || error.message || String(error)));
      throw error;
    }
  };
}

module.exports = exports => {
  if (!exports || (typeof exports !== `object` && typeof exports !== `function`)) {
    return exports;
  }

  if (wrappedExports.has(exports)) {
    return wrappedExports.get(exports);
  }

  const proxy = new Proxy(exports, {
    get(target, property, receiver) {
      if (property === `resolveModuleName` || property === `resolveTypeReferenceDirective`) {
        return wrapResolver(target, property);
      }

      return Reflect.get(target, property, receiver);
    },
  });

  wrappedExports.set(exports, proxy);
  return proxy;
};

process.on(`uncaughtException`, error => {
  debugLog(`uncaughtException`, error && (error.stack || error.message || String(error)));
});

process.on(`unhandledRejection`, error => {
  debugLog(`unhandledRejection`, error && (error.stack || error.message || String(error)));
});

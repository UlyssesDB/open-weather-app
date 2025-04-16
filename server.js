// Custom server.js to bypass Next.js Node.js version check
import { createServer } from "http";
import { parse } from "url";
import next from "next";

// Disable the Node.js version check
process.env.NEXT_TELEMETRY_DISABLED = "1";

// Create the Next.js app
const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

// Monkey patch the version check in Next.js
const originalRequire = module.require;
module.require = function (path) {
  if (path === "semver") {
    const semver = originalRequire(path);
    const originalSatisfies = semver.satisfies;
    semver.satisfies = function (version, range) {
      if (range.includes("node")) {
        return true;
      }
      return originalSatisfies(version, range);
    };
    return semver;
  }
  return originalRequire(path);
};

// Create the Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});

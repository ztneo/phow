/**
 * Runner for the purple-site visual verification.
 *
 * Starts a temporary Vite dev server (port 4173), waits for it to answer,
 * runs verify-purple-site.mjs against it, then shuts the server down.
 * Works standalone locally and in CI without any pre-running preview.
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = 4173;
const URL_TO_CHECK = `http://localhost:${PORT}/`;
const START_TIMEOUT_MS = 30_000;
const CHILD = path.join(ROOT, "verify-purple-site.mjs");

// Point the check script at the temporary server.
process.env.VERIFY_BASE_URL = URL_TO_CHECK;

function waitForServer(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    const attempt = async () => {
      try {
        const res = await fetch(url);
        if (res.ok) return resolve();
      } catch {
        // server not up yet
      }
      if (Date.now() > deadline) {
        return reject(new Error(`Server at ${url} did not become ready in ${timeoutMs}ms`));
      }
      setTimeout(attempt, 300);
    };
    attempt();
  });
}

const server = spawn("bun", ["x", "vite", "--port", String(PORT), "--strictPort"], {
  cwd: ROOT,
  stdio: ["ignore", "inherit", "inherit"],
});

let exitCode = 1;
try {
  await waitForServer(URL_TO_CHECK, START_TIMEOUT_MS);
  const child = spawn("bun", [CHILD], {
    cwd: ROOT,
    stdio: "inherit",
    env: { ...process.env, VERIFY_BASE_URL: URL_TO_CHECK },
  });
  exitCode = await new Promise((resolve) => child.on("close", resolve));
} catch (err) {
  console.error(String(err));
} finally {
  server.kill("SIGTERM");
  await new Promise((r) => setTimeout(r, 300));
  if (!server.killed) server.kill("SIGKILL");
}

process.exit(exitCode);

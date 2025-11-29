/**
 * Kill Next.js Dev Server Script
 *
 * Kills any existing Next.js dev server running on port 3000
 * before starting E2E tests to ensure clean test environment.
 *
 * Usage: node scripts/kill-dev-server.mjs
 */

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function killDevServer() {
  console.log("🔍 Checking for existing Next.js dev server on port 3000...");

  try {
    // Windows: Find process using port 3000
    const { stdout } = await execAsync("netstat -ano | findstr :3000");

    if (stdout) {
      const lines = stdout
        .split("\n")
        .filter((line) => line.includes("LISTENING"));

      for (const line of lines) {
        // Extract PID from netstat output
        const match = line.match(/\s+(\d+)\s*$/);
        if (match) {
          const pid = match[1];
          console.log(`   Found process ${pid} using port 3000`);

          try {
            await execAsync(`taskkill /F /PID ${pid}`);
            console.log(`   ✅ Killed process ${pid}`);
          } catch (err) {
            console.log(`   ⚠️  Could not kill process ${pid}:`, err.message);
          }
        }
      }
    } else {
      console.log("   ✅ No server running on port 3000");
    }
  } catch (error) {
    // No process found is OK
    if (!error.message.includes("command failed")) {
      console.log("   ✅ No server running on port 3000");
    }
  }
}

killDevServer()
  .then(() => {
    console.log("✅ Dev server cleanup complete\n");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error:", err.message);
    process.exit(1);
  });

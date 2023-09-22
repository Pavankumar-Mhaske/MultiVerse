// TODO: test this code with the chatgpt for any bugs and repair options if needed
// The child_process module in Node.js provides methods for spawning child processes, and spawnSync is one of those methods. It allows you to execute shell commands synchronously, capturing the output and exit status of the command.
import { spawnSync } from "child_process";
// Importing 'os' Module (Operating System Module):
import os from "os";
// Importing 'fs' Module (File System Module):
import fs from "fs";

// Function to run commands depending on the OS
const runCommand = (command, args) => {
  const isWindows = os.platform() === "win32";
  const shell = isWindows ? true : false;
  const commandArgs = isWindows ? ["/C", command, ...args] : [...args];

  const result = spawnSync(isWindows ? "cmd" : command, commandArgs, {
    stdio: "inherit",
    shell,
  });

  return result.status;
  /**
   * result.status ===0  : The command executed successfully
   * result.status !==0  : The command failed to execute
   */
};

// Function to prepare Husky
const prepareHusky = () => {
  // Run husky install
  const huskyInstallStatus = runCommand("npx", ["husky", "install"]);

  // Check if .husky directory exists, if not, create it
  fs.mkdir(".husky", (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log(".husky directory created successfully!");
    }
  });

  // Set permissions for husky on macOS/Linux
  if (os.platform() !== "win32") {
    const setPermissionsStatus = runCommand("chmod", ["-R", "ug+x", ".husky"]);
    if (setPermissionsStatus !== 0) {
      console.error("Setting permissions failed");
      process.exit(1);
    }
  }

  // Exit with appropriate status code based on husky install status
  if (huskyInstallStatus === 0) {
    console.log("Husky preparation executed successfully!");
    process.exit(0);
  } else {
    console.error("Husky installation failed");
    process.exit(1);
  }
};

prepareHusky();

/**
 *  In a typical setup, the prepare.js file is included in the prepare script in the package.json file. This means that the script will be run automatically when you run npm install or npm ci.
 * {
 *   "scripts": {
 *     "prepare": "node prepare.js"
 *   }
 * }
 */

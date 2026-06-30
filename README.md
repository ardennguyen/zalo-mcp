# 🤖 Zalo Model Context Protocol (MCP) Server & CLI

This package provides a self-contained, isolated **Model Context Protocol (MCP)** server and command-line interface (CLI) to automate Zalo personal accounts and Zalo Official Accounts (OA) API v3.0. It allows AI agents (like Claude Code, Cursor, and others) to interact directly with Zalo.

### What is the difference between `zalo-mcp` and `zalo-agent-cli`?
*   **`zalo-agent-cli`**: This is the core automation engine and logic library. It does all the heavy lifting for Zalo's APIs, handles authentication, and contains the actual MCP server source code.
*   **`zalo-mcp`** (This Repository): This is a lightweight deployment wrapper. It doesn't contain any core code. Instead, its job is to give you a 1-click isolated environment. It safely pulls the core `zalo-agent-cli` engine into a local sandboxed folder, manages the required Python/Node environments, and provides the actual config files (`.env`, `mcp-server.js`) that Claude or Cursor will execute so your global computer environment remains entirely untouched.

---

## 📋 Prerequisites

Before running the installer, ensure your system has the following installed:
*   **Node.js**: Version 20 or higher (Required for the core MCP server).
*   **Python**: Version 3.8 or higher (Optional, but required if you want the server to generate PDF reports and data visualizations).
*   **Git**: Required to pull the latest versions of the dependencies.

---

## 🚀 Quick Start (One-Line Installation)

To keep your host system clean and isolated, all dependencies are installed locally in an isolated folder. You can install the server anywhere on your system using a single command:

**macOS / Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/ardennguyen/zalo-mcp/main/zalo-mcp.sh | bash -s install
```

**Windows (PowerShell):**
```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; irm https://raw.githubusercontent.com/ardennguyen/zalo-mcp/main/zalo-mcp.ps1 | Out-File $env:TEMP\zalo-mcp.ps1; & $env:TEMP\zalo-mcp.ps1 install
```

### What the installer does:
1. Creates a `zalo-mcp` directory in your current location.
2. Downloads the necessary wrapper scripts and configurations.
3. Installs Node.js dependencies into a local `node_modules/` folder.
4. Creates an isolated Python virtual environment (`venv/`) for PDF generation and reporting.
5. Sets up your `.env` configuration file.

*(Note: During setup, you may be prompted to enter a Zalo OA Webhook Port and Zalo MCP HTTP Port if running interactively. You can also manually edit `.env` later).*

---

## 🔑 Authentication Flows

All authentication details are kept strictly local and secure on your machine.

### A. Personal Zalo Account (Unofficial API)
To log in with a personal Zalo account:
1. Run the login command:
   ```bash
   npx zalo-agent login
   ```
2. A QR code will print in your terminal.
3. Open the **Zalo app on your mobile phone** and scan the QR code using the **Zalo QR Scanner** (do not use your phone's default camera app).
4. Confirm the login on your phone.

> [!IMPORTANT]
> **Credential Storage Location:**  
> Your personal session credentials are encrypted and stored at `~/.zalo-agent-cli/` (with safe `0600` permissions).  
>
> **Safety Notice:** This is an unofficial API. While the library implements stealth measures, there is a risk of account ban. Do not use your primary personal account for heavy spam.

---

### B. Zalo Official Account (OA) (Official API v3.0)
To log in with a Zalo Official Account (secure, official API):
1. Run the Official Account initialization wizard:
   ```bash
   npx zalo-agent oa init --app-id <YOUR_APP_ID> --secret <YOUR_APP_SECRET>
   ```
2. Follow the prompt to authorize the app via your browser.
3. If you are deploying on a headless VPS, you can run:
   ```bash
   npx zalo-agent oa login --app-id <YOUR_APP_ID> --secret <YOUR_APP_SECRET> --callback-host https://your-domain.com
   ```

> [!IMPORTANT]
> **Credential Storage Location:**  
> Your Zalo OA Access Token and Refresh Token are stored at `~/.zalo-agent/oa-credentials.json` (with safe `0600` permissions).  
>
> OA Access Tokens expire after 25 hours. You can refresh them anytime by running:
> ```bash
> npx zalo-agent oa refresh
> ```

---

## 🤖 AI Agent Integration (MCP)

To hook up this Zalo MCP server to your AI clients, configure them to run this server in stdio mode:

### 1. Claude Code
Add the following block to your `mcpServers` configuration in `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "zalo": {
      "command": "node",
      "args": ["/absolute/path/to/zalo-mcp/mcp-server.js"],
      "cwd": "/absolute/path/to/zalo-mcp"
    }
  }
}
```

### 2. Cursor / Other Clients
Add a new MCP server in your editor settings:
*   **Name:** `zalo`
*   **Type:** `stdio`
*   **Command:** `node /absolute/path/to/zalo-mcp/mcp-server.js`

---

## 🛠️ Management & Updates

### Updating Dependencies
If a new version of the Zalo automation engine is released, or if you want to pull updates for Node.js modules or Python packages safely:
*   **Windows**: Run `.\zalo-mcp.ps1 update`
*   **macOS / Linux**: Run `./zalo-mcp.sh update`

### Cleaning the Environment
To completely wipe all installed dependencies (`node_modules` and `venv`) so you can start fresh:
*   **Windows**: Run `.\zalo-mcp.ps1 clean`
*   **macOS / Linux**: Run `./zalo-mcp.sh clean`

### Manual Initialization
If you cloned this repository manually without using the one-line installer, you can initialize the environment by running:
*   **Windows**: Run `.\zalo-mcp.ps1 init`
*   **macOS / Linux**: Run `./zalo-mcp.sh init`

---

## 🧰 Architecture & Components

This repository is a clean distribution wrapper. It does not contain any core developer source code. Instead, it relies on NPM and virtual environments to dynamically pull the engine.

*   **`package.json`**: Configured as a consumer setup. It resolves the core engine directly from GitHub (`"zalo-agent-cli": "github:ardennguyen/zalo-agent-cli"`).
*   **`zalo-mcp.sh` / `zalo-mcp.ps1`**: Orchestrates the local Node and Python environments.
*   **`mcp-server.js`**: The tiny entry point that loads environment configs and executes `zalo-agent mcp start`.

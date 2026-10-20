<p align="center">
  <img src="https://raw.githubusercontent.com/ardennguyen/zalo-agent-cli/main/assets/mascot.png" width="120" alt="zalo-mcp mascot" />
</p>

# zalo-mcp

Gói cài đặt độc lập **Model Context Protocol (MCP)** server và CLI wrapper cho Zalo. Cho phép cài đặt toàn cục qua `npm` hoặc triển khai trong môi trường đóng gói (sandbox) 1-click giúp AI agents (Claude Code, Cursor) tự động hóa Zalo Personal & Official Account mà không làm rác máy tính của bạn. Cả hai cách cài đặt đều cung cấp lệnh `zalo-mcp` trực tiếp trên terminal.

[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

**[Tiếng Việt](#bắt-đầu-nhanh)** | **[English](#english)**

> [!TIP]
> **Sự khác biệt giữa `zalo-mcp` và `zalo-agent-cli`?**
> - **`zalo-agent-cli`**: Là bộ mã nguồn lõi (engine). Xử lý toàn bộ logic API, login, và chứa mã nguồn thật sự của MCP Server.
> - **`zalo-mcp` (Repo này)**: Là vỏ bọc triển khai nhanh (deployment & CLI wrapper). Nó không chứa mã nguồn lõi mà chuyển tiếp toàn bộ lệnh CLI và khởi chạy MCP Server từ `@ardennguyen/zalo-agent-cli`. Dù bạn cài toàn cục (`npm i -g @ardennguyen/zalo-mcp`) hay dùng script 1-click tạo thư mục biệt lập (tự động `npm link` và cấu hình `.env`), bạn đều có thể chạy lệnh `zalo-mcp` ở bất kỳ đâu.

---

## 📋 Yêu cầu hệ thống

Trước khi cài đặt, hãy đảm bảo máy bạn đã có:
*   **Node.js**: Phiên bản 22 trở lên (Bắt buộc cho MCP server và CLI).
*   **Git**: Cần thiết để clone các bản cập nhật phụ thuộc.
*   **`@ardennguyen/zalo-agent-cli`**: `zalo-mcp` 2.0.5 trở lên cần engine `>=2.5.0` (gói tự cài đúng phiên bản). Engine 2.5.0 trở lên có đủ tool MCP mới nhất và các cờ `--webhook` / `--webhook-secret`; tool và cờ mới của engine chỉ dùng được qua `zalo-mcp` sau khi bạn cập nhật (`.zalo-mcp.ps1 update` / `./zalo-mcp.sh update`, hoặc `npm install -g @ardennguyen/zalo-mcp@latest` nếu cài toàn cục).

---

## 🚀 Bắt đầu nhanh

Bạn có thể chọn **Cách 1 (Cài đặt toàn cục qua npm)** hoặc **Cách 2 (Cài đặt thư mục biệt lập 1 dòng lệnh)**. Cả hai cách đều đăng ký lệnh `zalo-mcp` vào `PATH` để bạn sử dụng ở mọi nơi.

### Cách 1: Cài đặt toàn cục qua npm (Global CLI)

```bash
npm install -g @ardennguyen/zalo-mcp
```

### Cách 2: Cài đặt thư mục cách ly (1 dòng lệnh)

Mọi phụ thuộc (dependencies) sẽ được tải vào một thư mục cách ly (`zalo-mcp/`), tạo file `.env` và tự động liên kết lệnh `zalo-mcp` toàn cục (`npm link`). Bạn có thể cài đặt ở bất kỳ đâu trên máy tính chỉ với 1 lệnh duy nhất:

**macOS / Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/ardennguyen/zalo-mcp/main/zalo-mcp.sh | bash -s install
```

**Windows (PowerShell):**
```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; irm https://raw.githubusercontent.com/ardennguyen/zalo-mcp/main/zalo-mcp.ps1 | Out-File $env:TEMP\zalo-mcp.ps1; & $env:TEMP\zalo-mcp.ps1 install
```

#### Trình cài đặt 1-click sẽ làm gì?
1. Tạo thư mục `zalo-mcp` tại vị trí hiện tại.
2. Tải các file wrapper và cấu hình.
3. Cài đặt các gói Node.js vào thư mục `node_modules/` cục bộ.
4. Liên kết lệnh `zalo-mcp` toàn cục (`npm link`) để chạy từ mọi thư mục.
5. Tạo file cấu hình `.env` cho Port (`ZALO_MCP_HTTP_PORT`, `ZALO_OA_WEBHOOK_PORT`).

> [!TIP]
> **Phân tách file `.env` được khuyến nghị:** Chỉ nên dùng `zalo-mcp/.env` để cấu hình **PORT** (`ZALO_MCP_HTTP_PORT`, `ZALO_OA_WEBHOOK_PORT`). Các biến môi trường điều hướng thư mục lưu trữ (`ZALO_CREDENTIALS_DIR`, `ZALO_DATA_DIR`, `ZALO_MEDIA_DIR`, `ZALO_OA_DIR`) và cấu hình engine nên đặt tại `~/.zalo-agent-cli/.env` (`<CONFIG_DIR>/.env`) để cả `zalo-mcp` lẫn `zalo-agent` luôn đọc chung một nguồn cấu hình duy nhất.

---

### Sử dụng lệnh `zalo-mcp`

Sau khi cài đặt (bằng Cách 1 hoặc Cách 2), bạn có thể chạy `zalo-mcp` trực tiếp từ bất kỳ đâu trong PowerShell, CMD, hoặc Bash mà không cần `cd` vào thư mục cài đặt hay dùng `npm run`:

```powershell
# Khởi chạy MCP server (mặc định: stdio, hoặc thêm --http 3847)
zalo-mcp
zalo-mcp --account <ID>
zalo-mcp --http 3847 --auth <token> --account <ID> --host 0.0.0.0

# Chuyển tiếp mọi lệnh CLI của zalo-agent-cli (hỗ trợ --account <ID> cho từng lệnh)
zalo-mcp login
zalo-mcp account list
zalo-mcp --account <ID> msg list --json
zalo-mcp --account <ID> listen
zalo-mcp oa init --app-id <YOUR_APP_ID> --secret <YOUR_APP_SECRET>
zalo-mcp --help
```

---

## 🔑 Đăng nhập & Xác thực

Mọi thông tin xác thực đều được lưu cục bộ và an toàn trên máy của bạn.

### A. Zalo Cá Nhân (API Không chính thức)
1. Chạy lệnh đăng nhập:
   ```bash
   zalo-mcp login
   ```
   *(Hoặc `npm run login` nếu chạy trong thư mục cài đặt 1-click).*
2. Một mã QR sẽ hiển thị trên terminal. Mở **app Zalo trên điện thoại > Quét mã QR** (đừng dùng camera thường của điện thoại).

> [!IMPORTANT]
> **Vị trí lưu trữ Credentials:** Mặc định tại `~/.zalo-agent-cli/` (quyền `0600`). Có thể tách riêng credentials, database (`zalo.db`), và media sang các ổ đĩa khác nhau bằng cách khai báo `ZALO_CREDENTIALS_DIR`, `ZALO_DATA_DIR`, `ZALO_MEDIA_DIR` trong `~/.zalo-agent-cli/.env` (`<CONFIG_DIR>/.env`).
> **Cảnh báo:** Đây là API không chính thức, tài khoản cá nhân của bạn có thể bị khóa (ban) nếu dùng để spam liên tục. Không nên dùng nick chính.

### B. Zalo Official Account (API v3.0 Chính thức)
1. Khởi tạo kết nối OA:
   ```bash
   zalo-mcp oa init --app-id <YOUR_APP_ID> --secret <YOUR_APP_SECRET>
   ```
   *(Hoặc `npm run oa:init -- --app-id <YOUR_APP_ID> --secret <YOUR_APP_SECRET>` trong thư mục cài đặt).*
2. Làm theo hướng dẫn trên trình duyệt để ủy quyền ứng dụng.

> [!IMPORTANT]
> **Vị trí lưu trữ Credentials:** Mặc định tại `~/.zalo-agent/oa-credentials.json` (hoặc tùy chỉnh qua `ZALO_OA_DIR` trong `~/.zalo-agent-cli/.env`).
> OA Access Tokens hết hạn sau 25 giờ. Refresh bất cứ lúc nào bằng lệnh: `zalo-mcp oa refresh` (hoặc `npm run oa:refresh`).

---

## 🤖 Tích hợp AI Agent (MCP)

Khi chạy `zalo-mcp` (hoặc `node mcp-server.js`) **không có tên lệnh con** (chỉ kèm các cờ như `--account`, `--http`, `--auth`, `--host`, `--config`, `-w/--webhook`, `--webhook-secret`, `--no-self-heal`, `--no-delivered-receipts`), chương trình sẽ tự động khởi chạy `zalo-agent mcp start`. Xem chi tiết [Ghim tài khoản (`--account <ID>`)](docs/account-pinning.vi.md).

### 1. Claude Code (`~/.claude/settings.json`)

**Sử dụng lệnh `zalo-mcp` toàn cục (1 tài khoản):**
```json
{
  "mcpServers": {
    "zalo": {
      "command": "zalo-mcp",
      "args": []
    }
  }
}
```

**Chạy nhiều tài khoản Zalo live cùng lúc (Multi-Account):**
Mỗi tài khoản có database (`zalo.db`), thư mục media và `daemon.lock` tách biệt. Khai báo mỗi tài khoản là một MCP server kèm `--account <ID>` (lấy ID từ `zalo-mcp account list`) — cả hai tài khoản sẽ hoạt động song song mà không ghi đè `accounts.json`:
```json
{
  "mcpServers": {
    "zalo-shop-a": {
      "command": "zalo-mcp",
      "args": ["--account", "101"]
    },
    "zalo-shop-b": {
      "command": "zalo-mcp",
      "args": ["--account", "202"]
    }
  }
}
```
*(Trên VPS chạy HTTP mode, khởi chạy mỗi tài khoản trên một port riêng: `zalo-mcp --account <ID> --http 3847 --auth <token> --host 0.0.0.0`. Khi gọi lệnh CLI song song, truyền `zalo-mcp --account <ID> <lệnh>` hoặc đặt biến `ZALO_ACCOUNT=<ID>`.)*

**Hoặc trỏ trực tiếp tới thư mục cài đặt 1-click:**
```json
{
  "mcpServers": {
    "zalo": {
      "command": "node",
      "args": ["/đường/dẫn/tuyệt/đối/zalo-mcp/mcp-server.js"],
      "cwd": "/đường/dẫn/tuyệt/đối/zalo-mcp"
    }
  }
}
```

### 2. Cursor
Thêm MCP server mới trong settings của Cursor:
*   **Name:** `zalo`
*   **Type:** `stdio`
*   **Command:** `zalo-mcp` *(hoặc `zalo-mcp --account <ID>`, hoặc `node /đường/dẫn/tuyệt/đối/zalo-mcp/mcp-server.js`)*

---

## 🛠️ Quản lý & Cập nhật

**Nếu cài đặt toàn cục qua npm:**
*   **Cập nhật:** `npm install -g @ardennguyen/zalo-mcp@latest`
*   **Gỡ cài đặt:** `npm uninstall -g @ardennguyen/zalo-mcp`

**Nếu dùng thư mục cài đặt 1-click:**
*   **Cập nhật bản mới nhất** (Cập nhật engine, node_modules và làm mới liên kết `zalo-mcp`):
    *   **Windows**: `.\zalo-mcp.ps1 update`
    *   **macOS / Linux**: `./zalo-mcp.sh update`
*   **Dọn dẹp môi trường** (Gỡ liên kết CLI và xóa sạch `node_modules` để cài lại từ đầu):
    *   **Windows**: `.\zalo-mcp.ps1 clean`
    *   **macOS / Linux**: `./zalo-mcp.sh clean`

---

## 📖 Tài liệu đầy đủ

**[Wiki → github.com/ardennguyen/zalo-agent-cli/wiki](https://github.com/ardennguyen/zalo-agent-cli/wiki)**

Hướng dẫn chi tiết cho tất cả lệnh, thiết lập MCP, cache cục bộ, Official Account API và nhiều hơn nữa — cả tiếng Việt lẫn tiếng Anh.

## Giấy phép

zalo-mcp © 2026 Arden Nguyen Duc Huy được cấp phép theo [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/). Xem [LICENSE](LICENSE) và [NOTICE](NOTICE).

- **Miễn phí cho mục đích phi thương mại**: cá nhân, học thuật, nghiên cứu. **Không cấp phép cho mục đích thương mại** — ví dụ dùng trong sản phẩm thương mại, để cung cấp dịch vụ có thu phí, hoặc trong hoạt động kinh doanh của một công ty. Muốn xin giấy phép thương mại, hãy [mở một issue](https://github.com/ardennguyen/zalo-mcp/issues).
- **Ghi công**: khi chia sẻ dự án này hoặc một phần của nó (nguyên bản hay đã sửa đổi, kể cả bên trong dự án khác), hãy ghi công theo mẫu trong [NOTICE](NOTICE), nêu rõ bạn có sửa đổi hay không, và dẫn link giấy phép.
- **Chia sẻ tương tự (ShareAlike)**: bản sửa đổi được chia sẻ phải dùng CC BY-NC-SA 4.0 (hoặc phiên bản mới hơn, hoặc giấy phép tương thích do Creative Commons liệt kê).
- Các phần dẫn xuất từ phần mềm MIT — bản phân phối `zalo-mcp` gốc của PhucMPham — vẫn thuộc giấy phép MIT; xem [NOTICE](NOTICE). Gói này cài `@ardennguyen/zalo-agent-cli` từ npm; engine đó có `LICENSE` và `NOTICE` riêng.
- Các phiên bản phát hành trước thay đổi này (1.0.16 trở về trước) được phát hành theo giấy phép MIT và giữ nguyên các điều khoản đó.

---



---

## English

Self-contained **Model Context Protocol (MCP)** server and CLI wrapper for Zalo. Install globally via `npm` or use the 1-click sandboxed deployment script so AI agents (Claude Code, Cursor) can automate Zalo Personal & Official Accounts without cluttering your host system. Both installation methods provide the `zalo-mcp` command directly in your terminal.

> [!TIP]
> **What is the difference between `zalo-mcp` and `zalo-agent-cli`?**
> - **`zalo-agent-cli`**: The core automation engine. It handles all API logic, authentication, CLI commands, and contains the actual MCP server source code.
> - **`zalo-mcp` (This Repo)**: The lightweight deployment and CLI wrapper. It contains no core engine code—it launches the MCP server and forwards all CLI subcommands to `@ardennguyen/zalo-agent-cli`. Whether you install it globally (`npm i -g @ardennguyen/zalo-mcp`) or use the 1-click script (which sets up a sandboxed folder with `.env` and runs `npm link`), you can run `zalo-mcp` from any directory.

### 📋 Prerequisites

*   **Node.js**: v22 or higher (required for MCP server and CLI).
*   **Git**: Required to pull dependencies.
*   **`@ardennguyen/zalo-agent-cli`**: `zalo-mcp` 2.0.5 and later needs engine `>=2.5.0` (the package installs a matching version). Engine 2.5.0 and later carries the newest MCP tools and the `--webhook` / `--webhook-secret` flags; a new engine tool or flag reaches `zalo-mcp` once you update (`.zalo-mcp.ps1 update` / `./zalo-mcp.sh update`, or `npm install -g @ardennguyen/zalo-mcp@latest` for a global install).

### 🚀 Quick Start

Choose **Option 1 (Global npm install)** or **Option 2 (One-Line Sandboxed Folder Install)**. Both methods register the `zalo-mcp` command on your `PATH`.

#### Option 1: Global npm Install (Global CLI)

```bash
npm install -g @ardennguyen/zalo-mcp
```

#### Option 2: One-Line Sandboxed Installation

Downloads all dependencies into an isolated `./zalo-mcp` folder, configures `.env` for ports (`ZALO_MCP_HTTP_PORT`, `ZALO_OA_WEBHOOK_PORT`), and links the `zalo-mcp` CLI command globally (`npm link`):

**macOS / Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/ardennguyen/zalo-mcp/main/zalo-mcp.sh | bash -s install
```

**Windows (PowerShell):**
```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; irm https://raw.githubusercontent.com/ardennguyen/zalo-mcp/main/zalo-mcp.ps1 | Out-File $env:TEMP\zalo-mcp.ps1; & $env:TEMP\zalo-mcp.ps1 install
```

> [!TIP]
> **Recommended `.env` split:** Keep `zalo-mcp/.env` for **PORT settings only** (`ZALO_MCP_HTTP_PORT`, `ZALO_OA_WEBHOOK_PORT`). Place storage directory overrides (`ZALO_CREDENTIALS_DIR`, `ZALO_DATA_DIR`, `ZALO_MEDIA_DIR`, `ZALO_OA_DIR`) and engine settings in `~/.zalo-agent-cli/.env` (`<CONFIG_DIR>/.env`) so both `zalo-mcp` and `zalo-agent` share a single source of truth.

#### Using the `zalo-mcp` Command

Once installed (via Option 1 or Option 2), you can run `zalo-mcp` directly from anywhere in PowerShell, CMD, or Bash without `cd`-ing into an installation folder or using `npm run`:

```powershell
# Start the MCP server (default: stdio, or pass --http 3847)
zalo-mcp
zalo-mcp --account <ID>
zalo-mcp --http 3847 --auth <token> --account <ID> --host 0.0.0.0

# Pass any zalo-agent-cli command and arguments right through (with optional --account <ID>)
zalo-mcp login
zalo-mcp account list
zalo-mcp --account <ID> msg list --json
zalo-mcp --account <ID> listen
zalo-mcp oa init --app-id <YOUR_APP_ID> --secret <YOUR_APP_SECRET>
zalo-mcp --help
```

### 🔑 Authentication

#### A. Personal Zalo Account (Unofficial API)
1. Run the login command:
   ```bash
   zalo-mcp login
   ```
   *(Or `npm run login` inside a 1-click deployment directory).*
2. Scan the printed QR code using the Zalo app on your phone.

> [!IMPORTANT]
> **Credentials Storage:** Defaults to `~/.zalo-agent-cli/` (`0600` permissions). To separate credentials, the SQLite database (`zalo.db`), and media onto different volumes, set `ZALO_CREDENTIALS_DIR`, `ZALO_DATA_DIR`, and `ZALO_MEDIA_DIR` in `~/.zalo-agent-cli/.env` (`<CONFIG_DIR>/.env`).
> **Safety Notice:** This uses an unofficial API. Your personal account can get banned if heavily abused for spam.

#### B. Zalo Official Account (Official API v3.0)
1. Initialize OA credentials:
   ```bash
   zalo-mcp oa init --app-id <YOUR_APP_ID> --secret <YOUR_APP_SECRET>
   ```
   *(Or `npm run oa:init -- --app-id <YOUR_APP_ID> --secret <YOUR_APP_SECRET>` inside the deployment directory).*
2. Follow the browser prompt.
Refresh tokens anytime with: `zalo-mcp oa refresh` (or `npm run oa:refresh`).

> [!IMPORTANT]
> **Credentials Storage:** Defaults to `~/.zalo-agent/oa-credentials.json` (or customized via `ZALO_OA_DIR` in `~/.zalo-agent-cli/.env`).

### 🤖 AI Agent Integration (MCP)

When invoked with **no subcommand** (or only MCP server flags such as `--account`, `--http`, `--auth`, `--host`, `--config`, `-w/--webhook`, `--webhook-secret`, `--no-self-heal`, `--no-delivered-receipts`), `zalo-mcp` starts the MCP server (`zalo-agent mcp start`). See [Account Pinning (`--account <ID>`)](docs/account-pinning.md) for details.

**Claude Code (`~/.claude/settings.json`):**

*Using the global `zalo-mcp` command (single account):*
```json
{
  "mcpServers": {
    "zalo": {
      "command": "zalo-mcp",
      "args": []
    }
  }
}
```

*Running multiple live Zalo accounts simultaneously (Multi-Account):*
Each account has its own isolated SQLite cache (`zalo.db`), media folder, and `daemon.lock`. Declare one `mcpServers` entry per account with `--account <ID>` (from `zalo-mcp account list`) — both accounts run live in parallel without mutating `accounts.json`:
```json
{
  "mcpServers": {
    "zalo-shop-a": {
      "command": "zalo-mcp",
      "args": ["--account", "101"]
    },
    "zalo-shop-b": {
      "command": "zalo-mcp",
      "args": ["--account", "202"]
    }
  }
}
```
*(For HTTP mode on a VPS, run each account on its own port: `zalo-mcp --account <ID> --http 3847 --auth <token> --host 0.0.0.0`. For concurrent CLI calls, pass `zalo-mcp --account <ID> <command>` or set `ZALO_ACCOUNT=<ID>`.)*

*Or pointing directly to the 1-click deployment directory:*
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

**Cursor:** Add new MCP server (`stdio`) -> `zalo-mcp` *(or `zalo-mcp --account <ID>`, or `node /absolute/path/to/zalo-mcp/mcp-server.js`)*.

### 🛠️ Management Commands

*   **Global npm install:**
    *   **Update:** `npm install -g @ardennguyen/zalo-mcp@latest`
    *   **Uninstall:** `npm uninstall -g @ardennguyen/zalo-mcp`
*   **1-click deployment folder:**
    *   **Update Deps & CLI Link:** `.\zalo-mcp.ps1 update` or `./zalo-mcp.sh update`
    *   **Clean Env & Unlink CLI:** `.\zalo-mcp.ps1 clean` or `./zalo-mcp.sh clean`

### 📖 Documentation

**[Full Wiki → github.com/ardennguyen/zalo-agent-cli/wiki](https://github.com/ardennguyen/zalo-agent-cli/wiki)**

Detailed guides for all commands, MCP setup, local cache, Official Account API, and more — available in both English and Tiếng Việt.

---

## License

zalo-mcp © 2026 Arden Nguyen Duc Huy is licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/). See [LICENSE](LICENSE) and [NOTICE](NOTICE).

- **Free for non-commercial use** (personal, academic, research). **Commercial use is not licensed** — for example in a commercial product, to provide paid services, or in a company's business operations. To request a commercial license, [open an issue](https://github.com/ardennguyen/zalo-mcp/issues).
- **Credit required:** if you share this project or any part of it, as-is or modified (including inside another project), credit it as shown in [NOTICE](NOTICE), say whether you made changes, and link to the license.
- **ShareAlike:** shared modifications must be released under CC BY-NC-SA 4.0 (or a later version, or a compatible license listed by Creative Commons).
- Portions derived from MIT-licensed software — the original `zalo-mcp` distribution by PhucMPham — remain under the MIT License; see [NOTICE](NOTICE). This package installs `@ardennguyen/zalo-agent-cli` from npm; that engine carries its own `LICENSE` and `NOTICE`.
- Versions published before this change (1.0.16 and earlier) were released under the MIT License and keep those terms.

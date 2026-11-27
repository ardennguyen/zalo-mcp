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
*   **Node.js**: Phiên bản 22.19 trở lên (Bắt buộc cho MCP server và CLI; engine 3.0 yêu cầu `>=22.19.0`).
*   **Git**: Cần thiết để clone các bản cập nhật phụ thuộc.
*   **`@ardennguyen/zalo-agent-cli`**: `zalo-mcp` 2.2.0 cài đúng engine `3.6.0`. Mỗi bản wrapper ghim đúng một phiên bản engine đã được thử cùng nó, ghi chính xác trong `package.json` (không phải một khoảng phiên bản): `npm install -g`, trình cài 1-click và lệnh `update` đều cài đúng phiên bản đó, không phải bản engine mới nhất trên npm. Engine 3.0.0 chạy trên lớp giao thức Zalo riêng (không còn zca-js), và cung cấp **37 MCP tool**: mọi lệnh CLI đều có một thao tác MCP, kể cả các lệnh Official Account, ZBS và Social qua `zalo_official`. Tool và cờ mới của engine chỉ dùng được qua `zalo-mcp` sau khi bạn cập nhật (`.\zalo-mcp.ps1 update` / `./zalo-mcp.sh update`, hoặc `npm install -g @ardennguyen/zalo-mcp@latest` nếu cài toàn cục). Các wrapper 2.0.5–2.0.9 chạy engine 2.5.x. Lịch sử phiên bản: [CHANGELOG.md](CHANGELOG.md).

> [!IMPORTANT]
> **Engine 3.0 đã đổi hợp đồng MCP.** Client viết cho 2.x cần đổi theo:
> - **Mỗi id một tên:** tin nhắn là `msgId` (không còn `id` hay `messageId`), người dùng là `userId` (không còn `uid`), người gửi một tin là `senderId`. `zalo_view_media` nhận `msgId`, `zalo_delete_message` nhận `senderId`.
> - **`threadType` là `"dm"` hoặc `"group"`** ở cả đầu vào lẫn kết quả; số bị từ chối.
> - **Mọi id là chuỗi**, kể cả id nhỏ.
> - **Thao tác phá hủy được hỏi trước.** `zalo_undo`, `zalo_delete_message`, `zalo_group` `leave`, … cần `confirm: true` (`dryRun: true` để xem trước). `confirmMode` trong `mcp-config.json` (hoặc `ZALO_MCP_CONFIRM_MODE`) quyết định ai xác nhận: `agent` (mặc định; lần đầu gặp thao tác được bảo vệ, agent được dặn hỏi bạn muốn xử lý thế nào), `human` (server tự hỏi bạn: qua MCP elicitation với stdio, còn lại bằng một trang phê duyệt dùng một lần có link trong kết quả, dùng được cả qua HTTP) hoặc `off`.
> - Các tool mới, `zalo_friend`, `zalo_group` và `zalo_send_message` từ chối tham số không nhận thay vì bỏ qua.

> [!IMPORTANT]
> **Engine 3.0 còn đổi cách nó chạy:**
> - **Một phiên đăng nhập web cho mỗi tài khoản.** Server chính là phiên web đó: đăng nhập QR vào Zalo **trên trình duyệt** bằng cùng tài khoản sẽ đăng xuất server. **Điện thoại và ứng dụng Zalo trên máy tính** là các phiên riêng, chạy song song được. Hãy đọc và trả lời trên điện thoại hoặc ứng dụng máy tính bên cạnh server, không mở tài khoản trên trình duyệt.
> - **Dữ liệu được mã hóa khi lưu:** phiên đăng nhập, cơ sở dữ liệu tin nhắn `zalo.db` và media được niêm phong bằng khóa của từng tài khoản (DPAPI trên Windows, keychain trên macOS, passphrase trên VPS). Lệnh 3.0 đầu tiên chuyển dữ liệu cũ ngay tại chỗ, không giữ bản rõ. Đọc và sao lưu bằng `zalo-mcp db query` / `zalo-mcp db backup`, không mở `zalo.db` bằng `sqlite3`.
> - **Presence on-demand** là mặc định của server HTTP: socket Zalo đóng sau 5 phút rảnh và mở lại ở lần gọi tool hay chờ tin kế tiếp; tin đến trong lúc đó được bù khi kết nối lại. MCP qua stdio vẫn luôn kết nối. Cần thời gian thực (webhook ngay lập tức): `ZALO_PRESENCE_MODE=always-on`.
> - **Tên theo biệt danh trước:** mọi kết quả gọi một người bằng biệt danh bạn đặt cho họ, rồi tên Zalo (như Zalo hiển thị). `senderName` giờ ưu tiên biệt danh; giá trị gốc nằm ở `senderAlias` và `senderZaloName`.
> - **Rời nhóm là xóa lịch sử cục bộ của nhóm** (tự rời, bị mời ra, bị chặn, nhóm giải tán), như Zalo làm; sự kiện `group_gone` báo điều đó. Muốn giữ: `groups.onLeave: "keep"` trong `storage.json`.
> - **Lệnh CLI phá hủy cần `--yes`:** `account export`, `logout`, `account remove`, `db export --plaintext`, `msg undo`, `group leave`, … không làm gì và thoát mã 2 nếu thiếu nó; `--dry-run` cho xem trước.

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
5. Tạo file cấu hình `.env` cho Port (`ZALO_MCP_HTTP_PORT`): port mà `zalo-mcp --http` dùng khi không ghi port. Không có `--http`, server chạy stdio: trình cài chỉ ghi port, không bật HTTP. Riêng `ZALO_MCP_HTTP_PORT` đặt trong biến môi trường thật hoặc trong `~/.zalo-agent-cli/.env` thì engine hiểu là "chạy HTTP trên port này", kể cả khi không có `--http`.

> [!TIP]
> **Phân tách file `.env` được khuyến nghị:** Chỉ nên dùng `zalo-mcp/.env` để cấu hình **PORT** (`ZALO_MCP_HTTP_PORT`). Các biến môi trường điều hướng thư mục lưu trữ (`ZALO_CREDENTIALS_DIR`, `ZALO_DATA_DIR`, `ZALO_MEDIA_DIR`, `ZALO_OA_DIR`) và cấu hình engine nên đặt tại `~/.zalo-agent-cli/.env` (`<CONFIG_DIR>/.env`) để cả `zalo-mcp` lẫn `zalo-agent` luôn đọc chung một nguồn cấu hình duy nhất.

> [!NOTE]
> **Cài từ `git clone` với npm 10:** `npm ci` cài theo `package-lock.json` của repo, và npm 10 khi cài theo lock file sẽ build module cơ sở dữ liệu của engine từ mã nguồn: cần trình biên dịch C/C++ (Linux: `build-essential` và `python3`; macOS: Xcode Command Line Tools; Windows: Visual Studio Build Tools). Không có trình biên dịch thì dùng `npm install --no-package-lock` (cách trình cài 1-click và `update` làm), hoặc npm 12 (bản CI dùng). Engine vẫn đúng phiên bản được ghim vì `package.json` ghim chính xác.

---

### Sử dụng lệnh `zalo-mcp`

Sau khi cài đặt (bằng Cách 1 hoặc Cách 2), bạn có thể chạy `zalo-mcp` trực tiếp từ bất kỳ đâu trong PowerShell, CMD, hoặc Bash mà không cần `cd` vào thư mục cài đặt hay dùng `npm run`:

```powershell
# Khởi chạy MCP server (mặc định: stdio; --http dùng port trong .env, hoặc --http 3847)
zalo-mcp
zalo-mcp --account <ID>
zalo-mcp --http 3847 --account <ID>      # HTTP trên 127.0.0.1; token lấy từ ZALO_MCP_AUTH_TOKEN (xem dưới)

# Chuyển tiếp mọi lệnh CLI của zalo-agent-cli (hỗ trợ --account <ID> cho từng lệnh)
zalo-mcp login
zalo-mcp account list
zalo-mcp --account <ID> msg list --json
zalo-mcp --account <ID> listen
zalo-mcp oa init --app-id <YOUR_APP_ID> --secret <YOUR_APP_SECRET>
zalo-mcp --help
```

> [!WARNING]
> **Token của HTTP nằm trong file, không bao giờ trên dòng lệnh.** `--auth <token>` hiện trong `ps` và lịch sử shell. Đặt `ZALO_MCP_AUTH_TOKEN=<token>` (hoặc `ZALO_MCP_AUTH_TOKEN_<ID>=` cho từng tài khoản) trong `~/.zalo-agent-cli/.env`, chỉ user của bạn đọc được (`chmod 600`). Tạo token: `openssl rand -hex 32`. Đừng dùng `--host 0.0.0.0`: trong mạng LAN hãy bind địa chỉ LAN và mở firewall cho subnet đó; ra internet thì đặt sau một proxy TLS. Bộ cấu hình mẫu: [máy bàn / LAN qua HTTP](https://github.com/ardennguyen/zalo-agent-cli/blob/main/docs/config-samples/use-cases/b-desktop-lan-http/README.vi.md), [VPS](https://github.com/ardennguyen/zalo-agent-cli/blob/main/docs/config-samples/use-cases/c-vps-few-accounts/README.vi.md).

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
3. Sau đó đừng đăng nhập tài khoản này vào Zalo trên trình duyệt: nó sẽ đăng xuất phiên của `zalo-mcp`. Điện thoại và ứng dụng Zalo trên máy tính vẫn dùng bình thường.

> [!IMPORTANT]
> **Vị trí lưu trữ Credentials:** Mặc định tại `~/.zalo-agent-cli/` (quyền `0600`, niêm phong bằng khóa của tài khoản từ 3.0). Có thể tách riêng credentials, database (`zalo.db`), và media sang các ổ đĩa khác nhau bằng cách khai báo `ZALO_CREDENTIALS_DIR`, `ZALO_DATA_DIR`, `ZALO_MEDIA_DIR` trong `~/.zalo-agent-cli/.env` (`<CONFIG_DIR>/.env`).
> **Cảnh báo:** Đây là API không chính thức, tài khoản cá nhân của bạn có thể bị khóa (ban) nếu dùng để spam liên tục. Không nên dùng nick chính.

### B. Zalo Official Account (API v3.0 Chính thức)
1. Khởi tạo kết nối OA:
   ```bash
   zalo-mcp oa init --app-id <YOUR_APP_ID> --secret <YOUR_APP_SECRET>
   ```
   *(Hoặc `npm run oa:init -- --app-id <YOUR_APP_ID> --secret <YOUR_APP_SECRET>` trong thư mục cài đặt).*
2. Làm theo hướng dẫn trên trình duyệt để ủy quyền ứng dụng.

> [!IMPORTANT]
> **Vị trí lưu trữ Credentials:** Mặc định tại `~/.zalo-agent/oa-credentials.json`, mỗi OA một bản ghi theo `--oa-id` (hoặc tùy chỉnh thư mục qua `ZALO_OA_DIR` trong `~/.zalo-agent-cli/.env`). Lệnh `zbs` dùng chung đăng nhập OA đó; lệnh `social` lưu đăng nhập riêng ở `social-credentials.json` cùng thư mục, mỗi `--profile` một bản ghi. Webhook OA/ZBS: `zalo-mcp oa listen --secret <OA_SECRET_KEY>` (thêm `--verify-file <file.html>` hoặc `--verify-meta '<meta …>'` để xác thực domain, `--app-id <id>` khi chưa lưu App ID).
> OA Access Tokens hết hạn sau 25 giờ. Refresh bất cứ lúc nào bằng lệnh: `zalo-mcp oa refresh` (hoặc `npm run oa:refresh`).

---

## 🤖 Tích hợp AI Agent (MCP)

Khi chạy `zalo-mcp` (hoặc `node mcp-server.js`) **không có tên lệnh con** (chỉ kèm các cờ như `--account`, `--http`, `--auth`, `--host`, `--public-url`, `--cert`/`--key`, `--config`, `-w/--webhook`, `--webhook-secret`, `--no-self-heal`, `--no-delivered-receipts`, `--log-level`), chương trình sẽ tự động khởi chạy `zalo-agent mcp start` (`--auth` vẫn dùng được nhưng làm lộ token trong `ps`; hãy dùng `ZALO_MCP_AUTH_TOKEN`). Dòng log khởi động che giá trị của `--auth`, `--client-secret`, `--webhook-secret` và `--webhook`. Xem chi tiết [Ghim tài khoản (`--account <ID>`)](docs/account-pinning.vi.md).

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
*(Trên VPS: chạy engine trực tiếp dưới systemd, mỗi tài khoản một unit `zalo-mcp@<ID>` trên một port riêng của 127.0.0.1, token nằm trong file env của tài khoản đó (`/etc/zalo-mcp/accounts/<ID>.env`, quyền 600), Caddy phía trước cho TLS. `zalo-agent fleet generate` sinh ra unit, file env (kèm token) và Caddyfile; làm theo [bộ cấu hình VPS](https://github.com/ardennguyen/zalo-agent-cli/blob/main/docs/config-samples/use-cases/c-vps-few-accounts/README.vi.md) và [docs/deployment.vi.md](https://github.com/ardennguyen/zalo-agent-cli/blob/main/docs/deployment.vi.md). Khi gọi lệnh CLI song song, truyền `zalo-mcp --account <ID> <lệnh>` hoặc đặt biến `ZALO_ACCOUNT=<ID>`.)*

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

*   **Node.js**: v22.19 or higher (required for MCP server and CLI; engine 3.0 needs `>=22.19.0`).
*   **Git**: Required to pull dependencies.
*   **`@ardennguyen/zalo-agent-cli`**: `zalo-mcp` 2.2.0 installs engine `3.6.0` exactly. Each wrapper release pins the one engine version it was tested with, as an exact version in `package.json` (not a range): `npm install -g`, the 1-click installer and `update` all install exactly that version, not the newest engine on npm. Engine 3.0.0 runs on its own Zalo protocol layer (no zca-js), and serves **37 MCP tools**: every CLI command has an MCP action, the Official Account, ZBS and Social commands included through `zalo_official`. A new engine tool or flag reaches `zalo-mcp` once you update (`.\zalo-mcp.ps1 update` / `./zalo-mcp.sh update`, or `npm install -g @ardennguyen/zalo-mcp@latest` for a global install). Wrappers 2.0.5–2.0.9 run engine 2.5.x. Version history: [CHANGELOG.md](CHANGELOG.md).

> [!IMPORTANT]
> **Engine 3.0 changed the MCP contract.** A client written for 2.x must switch:
> - **One name per id:** a message is `msgId` (no `id` or `messageId`), a user is `userId` (no `uid`), a message's author is `senderId`. `zalo_view_media` takes `msgId`, `zalo_delete_message` takes `senderId`.
> - **`threadType` is `"dm"` or `"group"`** in inputs and replies; a number is refused.
> - **Every id is a string**, small ones too.
> - **Destructive actions are asked about first.** `zalo_undo`, `zalo_delete_message`, `zalo_group` `leave`, … need `confirm: true` (`dryRun: true` previews). `confirmMode` in `mcp-config.json` (or `ZALO_MCP_CONFIRM_MODE`) decides who confirms: `agent` (default; the first time it meets a guarded action, the agent is told to ask you how to handle them), `human` (the server asks you itself: by MCP elicitation under stdio, otherwise on a one-time approve page whose link is in the reply, which works over HTTP too) or `off`.
> - The new tools, `zalo_friend`, `zalo_group` and `zalo_send_message` refuse an input they do not take instead of ignoring it.

> [!IMPORTANT]
> **Engine 3.0 also changes how it runs:**
> - **One web login per account.** The server is that login: a QR login into Zalo **in a browser** with the same account signs the server out. The **phone and the Zalo desktop app** are separate logins that coexist with it. Read and reply on the phone or in the desktop app beside the server; do not open the account in a browser.
> - **Data is encrypted at rest:** the saved login, the message database `zalo.db` and media are sealed under each account's keys (DPAPI on Windows, the keychain on macOS, a passphrase on a VPS). The first 3.0 command converts existing data in place and keeps no plaintext copy. Read and back up with `zalo-mcp db query` / `zalo-mcp db backup`, not `sqlite3`.
> - **On-demand presence** is the default for an HTTP server: the Zalo socket closes after 5 idle minutes and opens again on the next tool call or wait; what arrived meanwhile is caught up on reconnect. MCP over stdio stays connected. For real time (immediate webhooks): `ZALO_PRESENCE_MODE=always-on`.
> - **Names are alias-first:** every reply names a person by the alias you set for them, then their Zalo name (as Zalo's own apps do). `senderName` is now alias-first; the raw values are in `senderAlias` and `senderZaloName`.
> - **Leaving a group deletes its local history** (left, removed, blocked, or the group disbanded), as Zalo does; a `group_gone` event says so. To keep it: `groups.onLeave: "keep"` in `storage.json`.
> - **Destructive CLI commands need `--yes`:** `account export`, `logout`, `account remove`, `db export --plaintext`, `msg undo`, `group leave`, … do nothing and exit 2 without it; `--dry-run` previews.

### 🚀 Quick Start

Choose **Option 1 (Global npm install)** or **Option 2 (One-Line Sandboxed Folder Install)**. Both methods register the `zalo-mcp` command on your `PATH`.

#### Option 1: Global npm Install (Global CLI)

```bash
npm install -g @ardennguyen/zalo-mcp
```

#### Option 2: One-Line Sandboxed Installation

Downloads all dependencies into an isolated `./zalo-mcp` folder, configures `.env` for ports (`ZALO_MCP_HTTP_PORT`, the port `zalo-mcp --http` uses when given none; without `--http` the server speaks stdio: the installer writes a port, it does not turn HTTP on), and links the `zalo-mcp` CLI command globally (`npm link`):

**macOS / Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/ardennguyen/zalo-mcp/main/zalo-mcp.sh | bash -s install
```

**Windows (PowerShell):**
```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; irm https://raw.githubusercontent.com/ardennguyen/zalo-mcp/main/zalo-mcp.ps1 | Out-File $env:TEMP\zalo-mcp.ps1; & $env:TEMP\zalo-mcp.ps1 install
```

> [!TIP]
> **Recommended `.env` split:** Keep `zalo-mcp/.env` for **PORT settings only** (`ZALO_MCP_HTTP_PORT`). Place storage directory overrides (`ZALO_CREDENTIALS_DIR`, `ZALO_DATA_DIR`, `ZALO_MEDIA_DIR`, `ZALO_OA_DIR`) and engine settings in `~/.zalo-agent-cli/.env` (`<CONFIG_DIR>/.env`) so both `zalo-mcp` and `zalo-agent` share a single source of truth. Only the folder's `.env` port waits for `--http`: `ZALO_MCP_HTTP_PORT` set in the real environment or in `~/.zalo-agent-cli/.env` tells the engine to serve HTTP on that port even without `--http`.

> [!NOTE]
> **Installing from a `git clone` with npm 10:** `npm ci` installs by the repo's `package-lock.json`, and npm 10 installing by a lock file builds the engine's database module from source: it needs a C/C++ compiler (Linux: `build-essential` and `python3`; macOS: the Xcode Command Line Tools; Windows: the Visual Studio Build Tools). Without one, run `npm install --no-package-lock` (what the 1-click installer and `update` do), or use npm 12 (the one CI uses). The engine is still the pinned version: `package.json` pins it exactly.

#### Using the `zalo-mcp` Command

Once installed (via Option 1 or Option 2), you can run `zalo-mcp` directly from anywhere in PowerShell, CMD, or Bash without `cd`-ing into an installation folder or using `npm run`:

```powershell
# Start the MCP server (default: stdio; --http uses the .env port, or pass --http 3847)
zalo-mcp
zalo-mcp --account <ID>
zalo-mcp --http 3847 --account <ID>      # HTTP on 127.0.0.1; the token comes from ZALO_MCP_AUTH_TOKEN (below)

# Pass any zalo-agent-cli command and arguments right through (with optional --account <ID>)
zalo-mcp login
zalo-mcp account list
zalo-mcp --account <ID> msg list --json
zalo-mcp --account <ID> listen
zalo-mcp oa init --app-id <YOUR_APP_ID> --secret <YOUR_APP_SECRET>
zalo-mcp --help
```

> [!WARNING]
> **The HTTP token goes in a file, never on the command line.** `--auth <token>` shows in `ps` and in your shell history. Put `ZALO_MCP_AUTH_TOKEN=<token>` (or `ZALO_MCP_AUTH_TOKEN_<ID>=` per account) in `~/.zalo-agent-cli/.env`, readable by your user only (`chmod 600`). Make one with `openssl rand -hex 32`. Do not use `--host 0.0.0.0`: on a LAN bind the LAN address and open the firewall to that subnet; for the internet put a TLS proxy in front. Ready-made sets: [desktop / LAN over HTTP](https://github.com/ardennguyen/zalo-agent-cli/blob/main/docs/config-samples/use-cases/b-desktop-lan-http/README.md), [VPS](https://github.com/ardennguyen/zalo-agent-cli/blob/main/docs/config-samples/use-cases/c-vps-few-accounts/README.md).

### 🔑 Authentication

#### A. Personal Zalo Account (Unofficial API)
1. Run the login command:
   ```bash
   zalo-mcp login
   ```
   *(Or `npm run login` inside a 1-click deployment directory).*
2. Scan the printed QR code using the Zalo app on your phone.
3. Then do not log this account into Zalo in a browser: that signs `zalo-mcp` out. The phone and the Zalo desktop app keep working.

> [!IMPORTANT]
> **Credentials Storage:** Defaults to `~/.zalo-agent-cli/` (`0600` permissions, sealed under the account's keys since 3.0). To separate credentials, the SQLite database (`zalo.db`), and media onto different volumes, set `ZALO_CREDENTIALS_DIR`, `ZALO_DATA_DIR`, and `ZALO_MEDIA_DIR` in `~/.zalo-agent-cli/.env` (`<CONFIG_DIR>/.env`).
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
> **Credentials Storage:** Defaults to `~/.zalo-agent/oa-credentials.json`, one record per OA (`--oa-id`); move the folder with `ZALO_OA_DIR` in `~/.zalo-agent-cli/.env`. The `zbs` commands use that OA login; the `social` commands keep their own login in `social-credentials.json` in the same folder, one record per `--profile`. OA/ZBS webhook: `zalo-mcp oa listen --secret <OA_SECRET_KEY>` (add `--verify-file <file.html>` or `--verify-meta '<meta …>'` for domain verification, and `--app-id <id>` when no App ID is saved).

### 🤖 AI Agent Integration (MCP)

When invoked with **no subcommand** (or only MCP server flags such as `--account`, `--http`, `--auth`, `--host`, `--public-url`, `--cert`/`--key`, `--config`, `-w/--webhook`, `--webhook-secret`, `--no-self-heal`, `--no-delivered-receipts`, `--log-level`), `zalo-mcp` starts the MCP server (`zalo-agent mcp start`; `--auth` still works but shows the token in `ps`: prefer `ZALO_MCP_AUTH_TOKEN`). The startup log line masks the values of `--auth`, `--client-secret`, `--webhook-secret` and `--webhook`. See [Account Pinning (`--account <ID>`)](docs/account-pinning.md) for details.

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
*(On a VPS: run the engine itself under systemd, one `zalo-mcp@<ID>` unit per account on its own 127.0.0.1 port, its token in that account's env file (`/etc/zalo-mcp/accounts/<ID>.env`, mode 600), Caddy in front for TLS. `zalo-agent fleet generate` writes the units, the env files (tokens included) and the Caddyfile; follow the [VPS set](https://github.com/ardennguyen/zalo-agent-cli/blob/main/docs/config-samples/use-cases/c-vps-few-accounts/README.md) and [docs/deployment.md](https://github.com/ardennguyen/zalo-agent-cli/blob/main/docs/deployment.md). For concurrent CLI calls, pass `zalo-mcp --account <ID> <command>` or set `ZALO_ACCOUNT=<ID>`.)*

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

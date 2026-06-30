<p align="center">
  <img src="https://raw.githubusercontent.com/ardennguyen/zalo-agent-cli/main/assets/mascot.png" width="120" alt="zalo-mcp mascot" />
</p>
# zalo-mcp

Gói cài đặt độc lập **Model Context Protocol (MCP)** server cho Zalo. Môi trường đóng gói (sandbox) 1-click giúp AI agents (Claude Code, Cursor) tự động hóa Zalo Personal & Official Account mà không làm rác máy tính của bạn.

**[Tiếng Việt](#bắt-đầu-nhanh)** | **[English](#english)**

> [!TIP]
> **Sự khác biệt giữa `zalo-mcp` và `zalo-agent-cli`?**
> - **`zalo-agent-cli`**: Là bộ mã nguồn lõi (engine). Xử lý toàn bộ logic API, login, và chứa mã nguồn thật sự của MCP Server.
> - **`zalo-mcp` (Repo này)**: Là vỏ bọc triển khai nhanh (deployment wrapper). Nó không chứa mã nguồn lõi. Thay vào đó, nó dùng lệnh tự động tạo ra một thư mục cục bộ an toàn, kéo engine về, tải Node/Python, cấu hình `.env` để Claude/Cursor có thể chạy ngay lập tức mà hệ thống của bạn hoàn toàn sạch sẽ.

---

## 📋 Yêu cầu hệ thống

Trước khi chạy trình cài đặt, hãy đảm bảo máy bạn đã có:
*   **Node.js**: Phiên bản 20 trở lên (Bắt buộc cho MCP server).
*   **Python**: Phiên bản 3.8 trở lên (Tùy chọn, cần thiết nếu muốn server tự render biểu đồ hoặc PDF report).
*   **Git**: Cần thiết để clone các bản cập nhật phụ thuộc.

---

## 🚀 Bắt đầu nhanh (Cài đặt 1 dòng lệnh)

Mọi phụ thuộc (dependencies) sẽ được tải vào một thư mục cách ly. Bạn có thể cài đặt server ở bất kỳ đâu trên máy tính chỉ với 1 lệnh duy nhất:

**macOS / Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/ardennguyen/zalo-mcp/main/zalo-mcp.sh | bash -s install
```

**Windows (PowerShell):**
```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; irm https://raw.githubusercontent.com/ardennguyen/zalo-mcp/main/zalo-mcp.ps1 | Out-File $env:TEMP\zalo-mcp.ps1; & $env:TEMP\zalo-mcp.ps1 install
```

### Trình cài đặt sẽ làm gì?
1. Tạo thư mục `zalo-mcp` tại vị trí hiện tại.
2. Tải các file wrapper và cấu hình.
3. Cài đặt các gói Node.js vào thư mục `node_modules/` cục bộ.
4. Tạo môi trường ảo Python biệt lập (`venv/`).
5. Tạo file cấu hình `.env`.

*(Lưu ý: Bạn có thể được hỏi nhập Port nếu chạy ở chế độ tương tác, hoặc bạn có thể tự sửa `.env` sau).*

---

## 🔑 Đăng nhập & Xác thực

Mọi thông tin xác thực đều được lưu cục bộ và an toàn trên máy của bạn.

### A. Zalo Cá Nhân (API Không chính thức)
1. Chạy lệnh đăng nhập:
   ```bash
   npx zalo-agent login
   ```
2. Một mã QR sẽ hiển thị trên terminal. Mở **app Zalo trên điện thoại > Quét mã QR** (đừng dùng camera thường của điện thoại).

> [!IMPORTANT]
> **Vị trí lưu trữ Credentials:** Lưu mã hóa tại `~/.zalo-agent-cli/` (quyền `0600`).
> **Cảnh báo:** Đây là API không chính thức, tài khoản cá nhân của bạn có thể bị khóa (ban) nếu dùng để spam liên tục. Không nên dùng nick chính.

### B. Zalo Official Account (API v3.0 Chính thức)
1. Khởi tạo kết nối OA:
   ```bash
   npx zalo-agent oa init --app-id <YOUR_APP_ID> --secret <YOUR_APP_SECRET>
   ```
2. Làm theo hướng dẫn trên trình duyệt để ủy quyền ứng dụng.

> [!IMPORTANT]
> **Vị trí lưu trữ Credentials:** Lưu an toàn tại `~/.zalo-agent/oa-credentials.json`.
> OA Access Tokens hết hạn sau 25 giờ. Refresh bất cứ lúc nào bằng lệnh: `npx zalo-agent oa refresh`

---

## 🤖 Tích hợp AI Agent (MCP)

Đảm bảo cấu hình AI client của bạn trỏ tới file `mcp-server.js` trong thư mục cài đặt `zalo-mcp`.

### 1. Claude Code
Thêm đoạn sau vào `mcpServers` trong `~/.claude/settings.json`:
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
*   **Command:** `node /đường/dẫn/tuyệt/đối/zalo-mcp/mcp-server.js`

---

## 🛠️ Quản lý & Cập nhật

**Cập nhật bản mới nhất:** (Cập nhật engine, node_modules, python deps)
*   **Windows**: `.\zalo-mcp.ps1 update`
*   **macOS / Linux**: `./zalo-mcp.sh update`

**Dọn dẹp môi trường:** (Xóa sạch mọi deps để cài lại từ đầu)
*   **Windows**: `.\zalo-mcp.ps1 clean`
*   **macOS / Linux**: `./zalo-mcp.sh clean`

---



---

## English

Self-contained **Model Context Protocol (MCP)** server installer for Zalo. A 1-click sandboxed deployment that enables AI agents (Claude Code, Cursor) to automate Zalo Personal & Official Accounts without cluttering your host system.

> [!TIP]
> **What is the difference between `zalo-mcp` and `zalo-agent-cli`?**
> - **`zalo-agent-cli`**: The core automation engine. It does all the heavy lifting, API logic, auth, and contains the actual MCP server source code.
> - **`zalo-mcp` (This Repo)**: The lightweight deployment wrapper. It contains no core code. Instead, its 1-click script safely pulls the engine into a local sandboxed folder, sets up Node/Python, and configures `.env` so Claude/Cursor can run instantly while keeping your global system pristine.

### 📋 Prerequisites

*   **Node.js**: v20 or higher.
*   **Python**: v3.8 or higher (Optional, for rendering charts and PDFs).
*   **Git**: Required to pull dependencies.

### 🚀 Quick Start (One-Line Installation)

**macOS / Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/ardennguyen/zalo-mcp/main/zalo-mcp.sh | bash -s install
```

**Windows (PowerShell):**
```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; irm https://raw.githubusercontent.com/ardennguyen/zalo-mcp/main/zalo-mcp.ps1 | Out-File $env:TEMP\zalo-mcp.ps1; & $env:TEMP\zalo-mcp.ps1 install
```

### 🔑 Authentication

#### A. Personal Zalo Account (Unofficial API)
1. Run the login command:
   ```bash
   npx zalo-agent login
   ```
2. Scan the printed QR code using the Zalo app on your phone.

> [!IMPORTANT]
> **Safety Notice:** This uses an unofficial API. Your personal account can get banned if heavily abused for spam.

#### B. Zalo Official Account (Official API v3.0)
1. Initialize OA credentials:
   ```bash
   npx zalo-agent oa init --app-id <YOUR_APP_ID> --secret <YOUR_APP_SECRET>
   ```
2. Follow the browser prompt.
Refresh tokens anytime with: `npx zalo-agent oa refresh`

### 🤖 AI Agent Integration (MCP)

Configure your AI clients to run the server in stdio mode:

**Claude Code (`~/.claude/settings.json`):**
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

**Cursor:** Add new MCP server: `stdio` -> `node /absolute/path/to/zalo-mcp/mcp-server.js`

### 🛠️ Management Commands

*   **Update Deps:** `.\zalo-mcp.ps1 update` or `./zalo-mcp.sh update`
*   **Clean Env:** `.\zalo-mcp.ps1 clean` or `./zalo-mcp.sh clean`

---

## License
[MIT](LICENSE)

# Ngữ cảnh dự án

[English](PROJECT-CONTEXT.md)

Cập nhật: 2026-10-15. Branch: `fix/forward-account-id`; base: `b2f8e80`.

Thay đổi source kiểm tra và chuyển toàn bộ ID tài khoản trong launcher. Engine
vẫn quản lý tra tài khoản, xác thực, reconnect và danh sách tool MCP.
Không migration database hay credentials.

Trạng thái: đã code cục bộ; 15 test launcher offline thành công. Chưa deploy
hay test tài khoản thật. Vẫn ghim engine 2.0.0 đã phát hành; cần bản engine chứa
PR #3 được phát hành rồi wrapper cập nhật pin. Xem
[cách dùng, kiến trúc, kiểm thử và triển khai](docs/account-pinning.vi.md).

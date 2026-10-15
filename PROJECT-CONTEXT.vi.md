# Ngữ cảnh dự án

[English](PROJECT-CONTEXT.md)

Cập nhật: 2026-10-15. Branch: `fix/forward-account-id`; base: `b2f8e80`.

Thay đổi source kiểm tra và chuyển toàn bộ ID tài khoản trong launcher. Engine
vẫn quản lý tra tài khoản, xác thực, reconnect và danh sách tool MCP.
Không migration database hay credentials.

Trạng thái: đã code cục bộ; 15 test launcher offline thành công. Chưa deploy
hay test tài khoản thật. Dependency engine là ^2.0.1; cần cài bản engine đã phát
hành chứa PR #3. Đề xuất engine 2.1.0 và wrapper 1.1.0 sau merge; chưa phát hành
phiên bản nào trong công việc này.
Điều kiện chặn phát hành: npm mới có 2.0.0; tạo lockfile ^2.0.1 báo ETARGET.
PR giữ draft; tạo lại lockfile cũ sau khi engine phát hành và kiểm tra cài đặt
trước merge. Xem
[cách dùng, kiến trúc, kiểm thử và triển khai](docs/account-pinning.vi.md).

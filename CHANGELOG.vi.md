# Lịch sử thay đổi

[English](CHANGELOG.md)

## Chưa phát hành — 2026-10-15

- Chuyển `--account <ID>` và `--account=<ID>` không ép kiểu số.
- Từ chối ID sai/lặp trước khi cài hay đăng nhập; không thử lại bằng tài khoản
  mặc định khi engine từ chối tùy chọn.
- Thêm 15 test launcher offline. Nhận engine ^2.0.1 thay vì cố định 2.0.0;
  vẫn cần bản engine tương lai đã phát hành có hỗ trợ ghim tài khoản.
- Đề xuất upstream phát hành engine 2.1.0 và wrapper 1.1.0 sau merge.

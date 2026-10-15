# Release notes và chuẩn bị phát hành

[English](README.md)

[Notes 1.1.0 đề xuất](v1.1.0.vi.md) theo bố cục
[notes 1.0.16 đã phát hành](https://github.com/ardennguyen/zalo-mcp/releases/tag/v1.0.16):
tên gói/version, kết quả chính, điểm nổi bật, thay đổi engine, cập nhật và giới
hạn. Đây là bản nháp, chưa phát hành. Giữ CHANGELOG.md cho lịch sử source;
không cần file project-context riêng ở gốc.

## Thứ tự phát hành, không cần máy coding của maintainer

1. Merge tính năng engine đã review vào `v2.0-dev`. Dùng template chuẩn bị engine
   để tạo PR version/lockfile, review và merge; đưa lên main theo chính sách
   upstream. Tạo tag/release đúng version qua giao diện GitHub; `publish.yml`
   hiện có sẽ publish lên npm.
2. Khi npm có engine thỏa `^2.0.1` **và chứa các tính năng yêu cầu**, tạo lại
   lockfile wrapper trên GitHub-hosted runner. Review/merge PR version/lockfile
   vào `v1.1.0`, rồi đưa lên main và tag release wrapper. Không phát hành wrapper
   khi dependency chưa cài được.
3. Dán notes vào GitHub Release, bỏ dòng đề xuất sau khi xác nhận tính năng và
   kiểm thử đúng với tag. Chỉ nâng deploy bằng quy trình update wrapper đã hướng dẫn.

Đã xác minh ngày 2026-10-15: upstream có nhánh `v1.1.0` và PR #1 đã trỏ vào đó.
Engine 2.1.0 đã phát hành trên npm, thỏa `^2.0.1`. Lockfile wrapper đã resolve
engine 2.1.0; yêu cầu cài đặt, test launcher cùng CI thành công trước khi
merge. CI dùng Node 22, khớp major thấp nhất package hỗ trợ. Không cần tạo nhánh
hay máy coding của maintainer; vẫn cần chuẩn bị version wrapper trước khi tag.

## Đồng bộ lockfile

`package.json` khai báo `^2.0.1`; package-lock.json phải ghi `version`, `resolved`,
`integrity` thật từ npm. Không chép lockfile engine sang wrapper vì hai đồ thị
dependency khác nhau. Merge/đồng bộ nhánh đích mới nhất qua PR trước, rồi chạy
resolver npm trong source wrapper:

```bash
npm install --package-lock-only --ignore-scripts --no-audit --no-fund
npm ci
npm test
```

Commit cả hai manifest trên branch PR nếu có thay đổi. `npm ci` kiểm tra lock,
không sửa lệch. Không tự điền integrity hay đổi dependency sang Git branch.
ETARGET thì chờ engine được publish; đổi base branch không làm xuất hiện phiên
bản còn thiếu trên registry.

Với PR fork hiện tại, nhanh nhất là contributor tạo lại và push lockfile lên
chính PR đó sau khi engine phát hành; maintainer chỉ review/merge trên GitHub.
Không cần máy coding upstream hay thiết lập bot.

## Workflow Actions đề xuất

[prepare-release.yml](prepare-release.yml) là **template**, chưa hoạt động.
Gửi một lần vào `.github/workflows/prepare-release.yml` trên default branch
upstream. Sau đó maintainer chọn **Actions → Prepare release PR → Run workflow**,
nhập `1.1.0`, review PR `chore/release-1.1.0` → `v1.1.0`. Workflow:

- checkout nhánh upstream tin cậy, đặt dải ^2.0.1 yêu cầu, dừng nếu npm chưa
  có engine tương thích đã phát hành;
- cập nhật package version/lockfile thật, chạy `npm ci` và kiểm tra offline,
  xuất artifact chứa hai manifest;
- chỉ commit/push manifest lên branch mới và mở PR; không push thẳng nhánh
  release, tag, publish hay sửa deploy.

Có thể chuẩn bị manifest trước khi merge feature PR #1: review/merge PR manifest,
đồng bộ PR #1 với base đó và bắt buộc CI cuối. Nếu base wrapper cũ chưa có script
test, lần chuẩn bị chỉ kiểm tra cài đặt và CLI engine, không chứng minh launcher
đã qua test. Chưa tag khi feature PR và kiểm tra tích hợp chưa xong.

Thiết lập upstream một lần: nhánh đích tồn tại, workflow có trên default branch,
repo cho Actions tạo PR với `contents: write` / `pull-requests: write`. Chuẩn bị
không cần npm publish token. GitHub có thể yêu cầu **Approve workflows to run**
cho CI của PR bot. Không force-push branch chuẩn bị đã có; review PR đó.
Template không chạy code fork với token quyền ghi.

Hiện chỉ kiểm tra tĩnh YAML/shell, chưa cài/chạy trên upstream. Giữ nguyên
workflow publish và cấu hình npm OIDC/token hiện có.

Nguồn: [npm install](https://docs.npmjs.com/cli/v11/commands/npm-install/),
[npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci/),
[chạy Actions thủ công](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow),
[GITHUB_TOKEN và CI của PR](https://docs.github.com/en/actions/concepts/security/github_token).

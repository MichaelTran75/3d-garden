#!/bin/bash
# Đưa bản mới lên GitHub Pages: ./publish.sh "mô tả thay đổi"
# 1) tách lại từ "../3D garden.html" (bản gốc 1 file — nơi sửa mã và chạy test) · 2) commit + push.
# Mỗi tệp đóng dấu ?v=<băm nội dung> ⇒ trình duyệt chỉ tải lại tệp nào thật sự đổi.
set -e
cd "$(dirname "$0")"
python3 build.py
git add -A
if git diff --cached --quiet; then echo "Không có thay đổi."; exit 0; fi
git commit -q -m "${1:-Cập nhật trang}"
git push -q
echo "Đã đẩy lên. Trang cập nhật sau ~1 phút: https://michaeltran75.github.io/3d-garden/"

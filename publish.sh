#!/bin/bash
# Đưa bản mới lên GitHub Pages: ./publish.sh "mô tả thay đổi"
# Nơi sửa mã: src/ (xem src/app/manifest.txt). Script: kéo bản mới nhất về · dựng lại (trang Pages + "../3D garden.html") · commit · push.
set -e
cd "$(dirname "$0")"
for p in index.html css js models; do git checkout -q -- "$p" 2>/dev/null || true; done   # tệp dựng sẵn sẽ dựng lại, bỏ bản cũ để kéo về không vướng
git pull -q --rebase --autostash
python3 build.py --check
git add -A
if git diff --cached --quiet; then echo "Không có thay đổi."; exit 0; fi
git commit -q -m "${1:-Cập nhật trang}"
git -c http.postBuffer=157286400 push -q   # bộ đệm gửi lớn: lần đẩy có tệp mẫu GLB ~1,4 MB từng bị GitHub ngắt ("unexpected disconnect")
echo "Đã đẩy lên. Trang cập nhật sau ~1 phút: https://michaeltran75.github.io/3d-garden/"

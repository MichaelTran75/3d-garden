#!/bin/bash
# Xem trên máy đúng bản sẽ lên GitHub Pages: dựng lại từ src/ rồi chạy máy chủ cục bộ
cd "$(dirname "$0")"
python3 build.py || exit 1
( sleep 1; open "http://localhost:8001/" ) &
exec python3 -m http.server 8001

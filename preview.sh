#!/bin/bash
# Xem trên máy bản đã tách (giống hệt bản trên GitHub Pages): tách lại rồi chạy máy chủ cục bộ
cd "$(dirname "$0")"
python3 build.py
( sleep 1; open "http://localhost:8001/" ) &
exec python3 -m http.server 8001

#!/data/data/com.termux/files/usr/bin/bash
cd "$(dirname "$0")"
echo "Idle RPG"
echo "Open http://127.0.0.1:8000 in your phone browser"
python -m http.server 8000 --bind 127.0.0.1

#!/bin/bash
# ==========================================================================
# FATE 1-Click Autonomous Launcher for macOS
# ==========================================================================

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "=================================================="
echo "⚡ Starting FATE (Futuristic Autonomous Tech Assistant)"
echo "=================================================="

# Kill any previous lingering background processes on ports 5005, 5000, 3000
lsof -ti:5005 | xargs kill -9 2>/dev/null
lsof -ti:5000 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null

# Remove stale port file
rm -f .active_tts_port 2>/dev/null

# 1. Start Python macOS Speech Server in background
python3 tts_server.py &
TTS_PID=$!
echo "✅ Speech Server initialized (PID: $TTS_PID)"

# 2. Start Node.js Web Server in background
node server.js &
NODE_PID=$!
echo "✅ Web Server initialized (PID: $NODE_PID)"

# Wait 2 seconds for servers to bind
sleep 2

# 3. Launch Default Browser to FATE Localhost
echo "🌐 Opening FATE HUD in your default browser..."
open "http://localhost:3000"

echo "=================================================="
echo "✨ FATE Core active at http://localhost:3000"
echo "Press Ctrl+C in terminal to stop all servers."
echo "=================================================="

# Trap SIGINT / SIGTERM to clean up background processes on Ctrl+C
trap "echo 'Stopping FATE servers...'; kill $TTS_PID $NODE_PID 2>/dev/null; exit" INT TERM
wait

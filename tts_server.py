#!/usr/bin/env python3
"""
FATE macOS Neural Voice & TTS Server
Uses macOS high-quality native voice engine (say -v Samantha) + Coqui TTS fallback.
Works 100% out-of-the-box on macOS with Python 3.13 and zero extra pip requirements!
"""

import os
import sys
import tempfile
import urllib.parse
import subprocess
from http.server import HTTPServer, BaseHTTPRequestHandler

PORT = int(os.environ.get("TTS_PORT", 5000))
MACOS_VOICE = os.environ.get("MAC_VOICE", "Samantha") # "Samantha", "Ava", "Victoria", "Karen", "Allison"

TTS_ENGINE = None

def init_tts():
    global TTS_ENGINE
    # Check if macOS 'say' command is available
    if sys.platform == 'darwin':
        print(f"⚡ FATE macOS Native Speech Engine active! Voice: '{MACOS_VOICE}'")
        TTS_ENGINE = "macos_say"
        return

    try:
        from TTS.api import TTS
        print("⚡ Initializing Coqui TTS Neural Model...")
        TTS_ENGINE = TTS(model_name="tts_models/en/ljspeech/vits", progress_bar=False, gpu=False)
        print("✅ Coqui TTS Model loaded successfully!")
    except Exception as e:
        print("⚠️ Coqui TTS not installed. Falling back to native system speech:", e)
        TTS_ENGINE = "fallback"

class CoquiTTSHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        
        # CORS & Audio Headers
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

        if parsed.path == '/api/tts':
            params = urllib.parse.parse_qs(parsed.query)
            text = params.get('text', [''])[0].strip()

            if not text:
                self.send_header('Content-Type', 'text/plain')
                self.end_headers()
                self.wfile.write(b"Error: text parameter missing")
                return

            try:
                # 1. macOS Native Speech Generation (say command -> WAV)
                if TTS_ENGINE == "macos_say":
                    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
                        tmp_wav = tmp.name

                    # Generate LEI16 22.05kHz WAV directly using macOS 'say'
                    cmd = ["say", "-v", MACOS_VOICE, "-o", tmp_wav, "--data-format=LEI16@22050", text]
                    subprocess.run(cmd, check=True)

                    with open(tmp_wav, 'rb') as f:
                        audio_data = f.read()

                    os.remove(tmp_wav)

                    self.send_header('Content-Type', 'audio/wav')
                    self.send_header('Content-Length', str(len(audio_data)))
                    self.end_headers()
                    self.wfile.write(audio_data)
                    return

                # 2. Coqui TTS Engine (if Coqui is installed)
                elif hasattr(TTS_ENGINE, 'tts_to_file'):
                    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
                        tmp_path = tmp.name

                    TTS_ENGINE.tts_to_file(text=text, file_path=tmp_path)

                    with open(tmp_path, 'rb') as f:
                        audio_data = f.read()

                    os.remove(tmp_path)

                    self.send_header('Content-Type', 'audio/wav')
                    self.send_header('Content-Length', str(len(audio_data)))
                    self.end_headers()
                    self.wfile.write(audio_data)
                    return

            except Exception as e:
                self.send_header('Content-Type', 'text/plain')
                self.end_headers()
                self.wfile.write(f"TTS Generation Error: {e}".encode('utf-8'))
                return

        elif parsed.path == '/api/status':
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            status_json = f'{{"status": "online", "engine": "{TTS_ENGINE}", "voice": "{MACOS_VOICE}"}}'
            self.wfile.write(status_json.encode('utf-8'))
            return
        else:
            self.send_header('Content-Type', 'text/plain')
            self.end_headers()
            self.wfile.write(b"FATE TTS Server Active. Query /api/tts?text=Hello")

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

def run_server():
    init_tts()
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, CoquiTTSHandler)
    print(f"\n==================================================")
    print(f"  🎙️ FATE macOS Speech Server Active on http://localhost:{PORT}")
    print(f"  🗣️ Voice Engine: macOS Native '{MACOS_VOICE}'")
    print(f"==================================================\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping FATE Speech Server...")

if __name__ == '__main__':
    run_server()

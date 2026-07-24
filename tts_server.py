#!/usr/bin/env python3
"""
FATE macOS Neural Voice & TTS Server
Supports dynamic voice selection and automatic port fallback (5005, 5006...).
Works 100% out-of-the-box on macOS with Python 3.13 and zero extra pip requirements!
"""

import os
import sys
import tempfile
import urllib.parse
import subprocess
import socket
from http.server import HTTPServer, BaseHTTPRequestHandler

PORT = int(os.environ.get("TTS_PORT", 5005))
DEFAULT_VOICE = os.environ.get("MAC_VOICE", "Samantha")

TTS_ENGINE = None

def init_tts():
    global TTS_ENGINE
    if sys.platform == 'darwin':
        print(f"⚡ FATE macOS Native Speech Engine active! Default Voice: '{DEFAULT_VOICE}'")
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
            voice = params.get('voice', [DEFAULT_VOICE])[0].strip()

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

                    cmd = ["say", "-v", voice, "-o", tmp_wav, "--data-format=LEI16@22050", text]
                    res = subprocess.run(cmd, capture_output=True)

                    if res.returncode != 0 and voice != "Samantha":
                        cmd = ["say", "-v", "Samantha", "-o", tmp_wav, "--data-format=LEI16@22050", text]
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
            status_json = f'{{"status": "online", "engine": "{TTS_ENGINE}", "voice": "{DEFAULT_VOICE}"}}'
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

class ReusableHTTPServer(HTTPServer):
    def server_bind(self):
        self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        super().server_bind()

def start_server_with_fallback(port, max_tries=10):
    init_tts()
    for current_port in range(port, port + max_tries):
        try:
            server_address = ('', current_port)
            httpd = ReusableHTTPServer(server_address, CoquiTTSHandler)
            print(f"\n==================================================")
            print(f"  🎙️ FATE macOS Speech Server Active on http://localhost:{current_port}")
            print(f"  🗣️ Default Voice: macOS '{DEFAULT_VOICE}'")
            print(f"==================================================\n")
            
            # Write active TTS port to a temporary file for server.js to auto-detect
            with open(os.path.join(os.path.dirname(__file__), ".active_tts_port"), "w") as f:
                f.write(str(current_port))
                
            httpd.serve_forever()
            return
        except OSError as e:
            if e.errno in (48, 98): # Address in use
                print(f"Port {current_port} busy, retrying on port {current_port + 1}...")
                continue
            else:
                raise e

if __name__ == '__main__':
    start_server_with_fallback(PORT)

#!/usr/bin/env python3
"""
FATE macOS Neural Voice & TTS Server
Supports macOS Native Hindi Voice ('Lekha') and English Voices ('Samantha', 'Ava', 'Daniel', 'Rishi').
"""

import os
import sys
import tempfile
import urllib.parse
import subprocess
import re
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
    TTS_ENGINE = "fallback"

class CoquiTTSHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        
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
                # If text contains Devanagari Hindi characters, automatically use macOS native Hindi voice 'Lekha'
                if re.search(r'[\u0900-\u097F]', text):
                    voice = "Lekha"

                if TTS_ENGINE == "macos_say":
                    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
                        tmp_wav = tmp.name

                    cmd = ["say", "-v", voice, "-o", tmp_wav, "--data-format=LEI16@22050", text]
                    res = subprocess.run(cmd, capture_output=True)

                    # Fallback to Lekha or Samantha if requested voice returns non-zero
                    if (res.returncode != 0 or os.path.getsize(tmp_wav) == 0) and voice != "Lekha":
                        cmd = ["say", "-v", "Lekha", "-o", tmp_wav, "--data-format=LEI16@22050", text]
                        res = subprocess.run(cmd, capture_output=True)

                    if res.returncode != 0 or os.path.getsize(tmp_wav) == 0:
                        cmd = ["say", "-v", "Samantha", "-o", tmp_wav, "--data-format=LEI16@22050", text]
                        res = subprocess.run(cmd, capture_output=True)

                    with open(tmp_wav, 'rb') as f:
                        audio_data = f.read()

                    os.remove(tmp_wav)

                    self.send_header('Content-Type', 'audio/wav')
                    self.send_header('Content-Length', str(len(audio_data)))
                    self.end_headers()
                    self.wfile.write(audio_data)
                    return

            except Exception as e:
                print("TTS Processing error:", e)
                self.send_header('Content-Type', 'text/plain')
                self.end_headers()
                self.wfile.write(f"TTS Error: {str(e)}".encode('utf-8'))
                return

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

def run_server(port):
    active_port_file = os.path.join(os.path.dirname(__file__), '.active_tts_port')
    try:
        server_address = ('127.0.0.1', port)
        httpd = HTTPServer(server_address, CoquiTTSHandler)
        print(f"✅ FATE TTS Server running on http://127.0.0.1:{port}")
        
        with open(active_port_file, 'w') as f:
            f.write(str(port))

        httpd.serve_forever()
    except OSError as e:
        if e.errno == 48:
            print(f"Port {port} busy, attempting next port {port + 1}...")
            run_server(port + 1)
        else:
            raise e

if __name__ == '__main__':
    init_tts()
    run_server(PORT)

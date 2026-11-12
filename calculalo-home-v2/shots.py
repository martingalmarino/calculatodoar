#!/usr/bin/env python3
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, fmt, *args):
        pass


server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
Thread(target=server.serve_forever, daemon=True).start()
url = f"http://127.0.0.1:{server.server_address[1]}/"
out = ROOT / "capturas"
out.mkdir(exist_ok=True)

shots = [
    ("home-desktop.png", 1440, 900),
    ("home-mobile.png", 390, 844),
]

with sync_playwright() as p:
    browser = p.chromium.launch(channel="chrome")
    for name, w, h in shots:
        page = browser.new_page(viewport={"width": w, "height": h}, device_scale_factor=1)
        page.goto(url, wait_until="networkidle")
        page.evaluate("document.fonts.ready")
        page.wait_for_timeout(250)
        dest = out / name
        page.screenshot(path=str(dest), full_page=True, type="png")
        print("ok", dest)
        page.close()
    browser.close()

server.shutdown()

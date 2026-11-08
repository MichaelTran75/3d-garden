import http.server, os, sys, urllib.parse
PORT, ROOT = int(sys.argv[1]), sys.argv[2]
class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)
    def log_message(self, *a): pass
    def end_headers(self):
        self.send_header('Document-Policy', 'js-profiling'); self.send_header('Cache-Control', 'no-store'); super().end_headers()
    def do_POST(self):
        query = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
        name = os.path.basename(query.get('name', ['shot.png'])[0])
        data = self.rfile.read(int(self.headers.get('Content-Length', 0)))
        os.makedirs(os.path.join(ROOT, 'shots'), exist_ok=True)
        with open(os.path.join(ROOT, 'shots', name), 'wb') as f:
            f.write(data)
        self.send_response(200); self.end_headers(); self.wfile.write(b'ok')
http.server.ThreadingHTTPServer(('127.0.0.1', PORT), Handler).serve_forever()

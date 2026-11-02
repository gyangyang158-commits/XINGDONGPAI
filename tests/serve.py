from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import argparse
ROOT = Path(__file__).resolve().parents[1]
class Handler(SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass
    def do_GET(self):
        if any(part.startswith('.') for part in self.path.split('?')[0].split('/') if part):
            self.send_error(404); return
        super().do_GET()
parser=argparse.ArgumentParser();parser.add_argument('--port',type=int,default=8772)
args=parser.parse_args()
print(f'Local prototype: http://127.0.0.1:{args.port}/xingdongpai-room-optimized.html',flush=True)
ThreadingHTTPServer(('127.0.0.1',args.port),partial(Handler,directory=str(ROOT))).serve_forever()

"""Download the optional local foreground model; never runs when opening the page."""
from pathlib import Path
import urllib.request,json,hashlib
ROOT=Path(__file__).resolve().parents[1]
TARGET=ROOT/'.cache/models/u2netp.onnx'
MD5='8e83ca70e441ab06c318d82300c84806'
def verified(data):return hashlib.md5(data).hexdigest()==MD5
if TARGET.exists() and verified(TARGET.read_bytes()):
    print('U2NetP is already installed and verified.')
else:
    direct='https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2netp.onnx'
    try:
        with urllib.request.urlopen(direct,timeout=60) as r:data=r.read()
    except Exception:
        req=urllib.request.Request('https://api.github.com/repos/danielgatis/rembg/releases/tags/v0.0.0',headers={'User-Agent':'XDP-local-cutout'})
        with urllib.request.urlopen(req,timeout=25) as r:release=json.load(r)
        asset=next(a for a in release['assets'] if a['name']=='u2netp.onnx')
        req=urllib.request.Request(asset['url'],headers={'User-Agent':'XDP-local-cutout','Accept':'application/octet-stream'})
        with urllib.request.urlopen(req,timeout=60) as r:data=r.read()
    if not verified(data):raise SystemExit('Model checksum mismatch; no model was installed.')
    TARGET.parent.mkdir(parents=True,exist_ok=True);TARGET.write_bytes(data)
    print('Verified local U2NetP model installed:',len(data),'bytes')

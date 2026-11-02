"""Local U2NetP foreground removal. Reads JSON stdin, returns JSON stdout."""
import sys,json,base64,io,os
from pathlib import Path
import numpy as np
from PIL import Image,ImageOps,ImageChops
import onnxruntime as ort

def cutout(data,model):
    if not data.startswith(('data:image/png;base64,','data:image/jpeg;base64,','data:image/webp;base64,')):
        raise ValueError('Unsupported image format')
    raw=base64.b64decode(data.split(',',1)[1],validate=True)
    if len(raw)>8*1024*1024:raise ValueError('Image exceeds 8 MB')
    image=Image.open(io.BytesIO(raw))
    if image.width*image.height>20000000:raise ValueError('Image exceeds 20 million pixels')
    original=ImageOps.exif_transpose(image).convert('RGBA');original.thumbnail((1600,1600));image=original.convert('RGB')
    sample=np.asarray(image.resize((320,320)),dtype=np.float32)/255.0
    sample=(sample-np.array([.485,.456,.406],dtype=np.float32))/np.array([.229,.224,.225],dtype=np.float32)
    tensor=np.transpose(sample,(2,0,1))[None].astype(np.float32)
    options=ort.SessionOptions();options.intra_op_num_threads=2;options.inter_op_num_threads=1
    session=ort.InferenceSession(str(model),sess_options=options,providers=['CPUExecutionProvider'])
    result=session.run(None,{session.get_inputs()[0].name:tensor})[0][0,0]
    mask=((result-result.min())/max(float(result.max()-result.min()),1e-8)*255).astype(np.uint8)
    alpha=Image.fromarray(mask).resize(image.size,Image.Resampling.LANCZOS)
    output=image.convert('RGBA');output.putalpha(ImageChops.multiply(alpha,original.getchannel('A')))
    buffer=io.BytesIO();output.save(buffer,format='PNG')
    return {'image':'data:image/png;base64,'+base64.b64encode(buffer.getvalue()).decode('ascii'),'width':image.width,'height':image.height}

if __name__=='__main__':
    try:
        payload=json.load(sys.stdin);print(json.dumps(cutout(payload['image'],Path(sys.argv[1]))))
    except Exception as error:
        print(json.dumps({'error':'本机抠图失败，请检查图片或模型配置。'}));sys.exit(1)

"""Render the current XINGDONGPAI interaction map to matching PNG and SVG."""
from pathlib import Path
from html import escape
from functools import lru_cache
import math
import xml.etree.ElementTree as ET
from PIL import Image, ImageDraw, ImageFont

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs'
W,H,S=1760,1870,2
C={'bg':'#F8F4FC','ink':'#47364F','muted':'#786780','line':'#B19ABC','border':'#E3D9EB','purple':'#795896','purple_fill':'#EEE4F7','blue':'#597A99','blue_fill':'#EAF2F9','gold':'#8D703B','gold_fill':'#FAF0DB','green':'#547764','green_fill':'#EAF4ED','white':'#FFFFFF'}
img=Image.new('RGB',(W*S,H*S),C['bg'])
d=ImageDraw.Draw(img)
svg=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" role="img" aria-labelledby="title desc"><title id="title">星动派完整交互逻辑图</title><desc id="desc">桌面与手机共用五个导航。创作台分助手、模板、上传素材，原位预览后加入灵感池；同类五张结构化灵感卡可凝聚，经主办提名、本地排版、成员投票、主办截止和最终确认后归档。已完成稿件可以直接上传评审。角色与投票仍为前端原型。</desc>']
FONT=Path('C:/Windows/Fonts/msyh.ttc')
BOLD=Path('C:/Windows/Fonts/msyhbd.ttc')
@lru_cache(None)
def font(size,bold=False): return ImageFont.truetype(str(BOLD if bold else FONT),round(size*S))
def text(x,y,value,size=23,color=None,bold=False,anchor='start',max_width=None):
    color=color or C['ink']; f=font(size,bold)
    if max_width is not None:
        assert f.getlength(value)/S<=max_width, f'Text overflow: {value}'
    d.text((round(x*S),round(y*S)),value,font=f,fill=color,anchor='ms' if anchor=='middle' else 'ls')
    svg.append(f'<text x="{x}" y="{y}" font-family="Microsoft YaHei,PingFang SC,sans-serif" font-size="{size}" font-weight="{600 if bold else 400}" fill="{color}" text-anchor="{anchor}">{escape(value)}</text>')
def rect(x,y,w,h,fill,stroke=None,r=16,width=1.5):
    d.rounded_rectangle(tuple(round(v*S) for v in (x,y,x+w,y+h)),radius=round(r*S),fill=fill,outline=stroke,width=round(width*S) if stroke else 1)
    svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}"'+(f' stroke="{stroke}" stroke-width="{width}"' if stroke else '')+'/>')
def line(points,color=None,width=2.5,arrow=False,dashed=False):
    color=color or C['line']; coords=[(round(x*S),round(y*S)) for x,y in points]
    if dashed:
        for (x1,y1),(x2,y2) in zip(points,points[1:]):
            length=math.hypot(x2-x1,y2-y1)
            if not length: continue
            ux,uy=(x2-x1)/length,(y2-y1)/length
            for start in range(0,math.ceil(length),17):
                end=min(start+9,length)
                d.line([(round((x1+ux*start)*S),round((y1+uy*start)*S)),(round((x1+ux*end)*S),round((y1+uy*end)*S))],fill=color,width=round(width*S))
    else:d.line(coords,fill=color,width=round(width*S),joint='curve')
    svg.append('<polyline points="'+' '.join(f'{x},{y}' for x,y in points)+f'" fill="none" stroke="{color}" stroke-width="{width}" stroke-linejoin="round"'+(' stroke-dasharray="9 8"' if dashed else '')+'/>')
    if arrow:
        (x1,y1),(x2,y2)=points[-2:];a=math.atan2(y2-y1,x2-x1)
        p=[(x2,y2),(x2-12*math.cos(a)+6*math.sin(a),y2-12*math.sin(a)-6*math.cos(a)),(x2-12*math.cos(a)-6*math.sin(a),y2-12*math.sin(a)+6*math.cos(a))]
        d.polygon([(round(x*S),round(y*S)) for x,y in p],fill=color)
        svg.append('<polygon points="'+' '.join(f'{x:.2f},{y:.2f}' for x,y in p)+f'" fill="{color}"/>')
def node(x,y,w,h,title,body=(),role='成员',kind='purple',filled=False,title_size=28,body_size=23):
    if body: assert 99+(len(body)-1)*28+5 <= h-5, f'Vertical text overflow: {title}'
    fill=C[kind] if filled else C.get(kind+'_fill',C['white'])
    ink=C['white'] if filled else C['ink'];secondary='#F5ECFB' if filled else C['muted']
    rect(x,y,w,h,fill,None if filled else C['border'],16)
    text(x+22,y+27,role,18,'#E9DDF3' if filled else C.get(kind,C['muted']),True,max_width=w-44)
    text(x+22,y+64,title,title_size,ink,True,max_width=w-44)
    for i,v in enumerate(body):text(x+22,y+99+i*28,v,body_size,secondary,max_width=w-44)

rect(0,0,W,H,C['bg'],r=0)
text(64,80,'星动派 · 完整交互逻辑图',46,bold=True)
text(64,125,'按当前实现绘制：原位创作与发布，协作评审后由主办确认。',24,C['muted'])
# Navigation is a set of entries, not a mandatory five-step sequence.
for i,label in enumerate(['概览','灵感池','创作台','评审','讨论']):
    x=74+i*328
    rect(x,166,300,62,C['purple_fill'] if i==2 else C['white'],C['border'],12)
    text(x+150,207,label,27,C['purple'] if i==2 else C['ink'],i==2,'middle')
text(74,265,'五个一级入口 · 桌面与手机一致',21,C['muted'])
# Two process regions.
rect(48,334,790,1164,C['white'],C['border'],22)
rect(914,334,798,1164,C['white'],C['border'],22)
text(74,310,'01  创作与发布',31,C['purple'],True)
text(940,310,'02  评审与定稿',31,C['purple'],True)
for x,title,sub in [(74,'助手起稿','文字 / 语音输入'),(326,'选模板','选择现成版式'),(578,'上传素材','原图 / 手绘 / 参考')]:
    rect(x,370,240,110,C['purple_fill'],C['border'],14)
    text(x+20,414,title,27,bold=True,max_width=200)
    text(x+20,451,sub,21,C['muted'],max_width=200)
for cx in [194,446,698]:line([(cx,480),(cx,506)],arrow=True)
node(74,512,240,166,'生成方案',['本地：不联网','在线 AI：文字授权','语音：麦克风授权'],'系统 / 授权','blue',title_size=25,body_size=19)
node(326,512,240,166,'同页完整预览',['选中不自动发布','无需跳出再返回'],'系统','blue',title_size=24,body_size=19)
node(578,512,240,166,'读取与校验',['检查格式与大小','失败原位提示','修改后重新提交'],'系统','blue',title_size=25,body_size=19)
for cx in [194,446,698]:line([(cx,678),(cx,714)])
line([(194,714),(698,714)])
line([(446,714),(446,744)],arrow=True)
node(184,750,520,112,'同页检查与修改',['改标题只更新预览，不整页重绘'],'成员',title_size=29,body_size=23)
line([(446,862),(446,916)],arrow=True)
text(470,901,'确认后发布',20,C['muted'])
node(184,922,520,112,'加入灵感池',['保留署名、来源与完整预览'],'成员','purple',True,title_size=30,body_size=24)
line([(446,1034),(446,1082)],arrow=True)
node(184,1088,520,118,'原位成功反馈',['查看投稿，或继续创作'],'系统','green',title_size=29,body_size=23)
text(108,1248,'已发布后只改字 → 更新原卡片',25,C['green'],True,max_width=680)
text(108,1286,'保留卡片 ID、署名、支持与评论，不重复投稿。',22,C['muted'],max_width=680)
line([(84,1310),(802,1310)],C['border'],1.5)
text(108,1351,'快捷开始：已有完整稿件',24,C['blue'],True)
node(184,1368,520,112,'上传并提交评审',['校验原图与说明，直接进入评审池'],'成员','blue',title_size=28,body_size=22)
# Pool material feeds the consensus sequence. No crossing with the direct-review shortcut.
line([(704,978),(868,978),(868,423),(972,423)],C['purple'],2.8,True)
# Review / consensus chain.
node(980,370,670,112,'同类结构化灵感卡 ≥ 5 张',['仅计结构化灵感卡，未满则继续收集'],'系统检查','blue')
node(980,530,670,112,'整理来源 → 主办提名',['整理最多 3 个方向，主办选择 1 个'],'系统 / 主办','gold')
node(980,690,670,112,'生成 3 套排版示意',['本地 SVG 候选，不冒充人物生图'],'系统','blue')
node(980,836,670,172,'成员投票 → 主办截止',['须先交结构化灵感卡；一人一票','至少 5 人后可截止，截止前隐藏票数','平票由主办公开裁决'],'成员 / 主办','gold',body_size=22)
node(980,1040,670,112,'稿件评审',['接收推荐稿或完整稿件，统一查看与反馈'],'成员','purple')
node(980,1200,670,112,'主办确认最终版',['已有推荐稿后确认；改选必须说明原因'],'主办','gold')
node(980,1360,670,112,'查看交付与归档',['保留最终版与共创记录；正式交付待后端'],'系统 / 原型','green',body_size=22)
for bottom,top in [(482,530),(642,690),(802,836),(1008,1040),(1152,1200),(1312,1360)]:line([(1315,bottom),(1315,top-6)],arrow=True)
# Existing finished artwork can enter review directly, without first completing idea generation.
line([(704,1424),(890,1424),(890,1096),(972,1096)],C['blue'],2.8,True,True)
# Cross-cutting room tools.
text(74,1542,'贯穿全程',25,C['ink'],True)
rect(64,1570,1632,120,'#F0EAF7',None,18)
for x,title,body in [(94,'房间讨论','保留原文，当前仅本页记录'),(645,'我的贡献','查看署名、来源与已提交内容'),(1190,'权限与状态','授权、失败重试、主办确认保留')]:
    text(x,1614,title,26,bold=True)
    text(x,1655,body,21,C['muted'],max_width=475)
for x,key,label in [(74,'purple','成员操作'),(450,'blue','系统 / 本地处理'),(900,'gold','主办确认'),(1290,'green','成功 / 归档')]:
    rect(x,1721,18,18,C[key],r=5)
    text(x+30,1738,label,21,C['muted'])
text(74,1800,'实现边界：房间数据刷新后重置；在线 AI 需本机网关；角色与投票权限目前仍为前端演示。',22,C['muted'],max_width=1620)
text(74,1837,'服务端账号、数据库、真实多人同步与正式文件交付尚未上线。',22,C['muted'],max_width=1620)
svg.append('</svg>')
source=''.join(svg);ET.fromstring(source)
OUT.mkdir(exist_ok=True)
(OUT/'xingdongpai-interaction-map.svg').write_text(source,encoding='utf8')
img.save(OUT/'xingdongpai-interaction-map.png',dpi=(240,240),optimize=True)
print(OUT/'xingdongpai-interaction-map.png')
print(OUT/'xingdongpai-interaction-map.svg')
print(f'PNG: {img.width} x {img.height}')

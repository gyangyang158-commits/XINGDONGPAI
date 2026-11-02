"""Generate the original, editable poster studies used by the template picker."""
from pathlib import Path
import base64,json,math
from xml.sax.saxutils import escape
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/posters';OUT.mkdir(exist_ok=True)
FONT='XDP Poster Serif, Noto Serif SC, Songti SC, serif'
SANS='Geist, Microsoft YaHei, sans-serif'
def text(x,y,s,size=20,fill='#29486B',family=FONT,anchor='start',spacing=0,weight=600):
 return f'<text x="{x}" y="{y}" fill="{fill}" font-family="{family}" font-size="{size}" font-weight="{weight}" text-anchor="{anchor}" letter-spacing="{spacing}">{escape(s)}</text>'
def line(x,y,X,Y,color,op=1):return f'<path d="M{x} {y}H{X}" stroke="{color}" opacity="{op}"/>' if y==Y else f'<path d="M{x} {y}L{X} {Y}" stroke="{color}" opacity="{op}"/>'
def flower(x,y,r,petal,core,stroke=None,n=7,rot=0):
 p=f'<g transform="translate({x} {y}) rotate({rot})">'
 for i in range(n):
  # Unequal rounded lobes, drawn as a cut-paper form rather than an emoji.
  a=i*360/n;w=r*.38*(1+.08*math.sin(i*2));h=r*(.93+.08*math.cos(i*3))
  p+=f'<path transform="rotate({a:.2f})" d="M-3 7 C{-w:.2f} {-h*.24:.2f} {-w:.2f} {-h*.94:.2f} 0 {-h:.2f} C{w*.94:.2f} {-h*1.08:.2f} {w*1.16:.2f} {-h*.17:.2f} 3 7Z" fill="{petal}"'+(f' stroke="{stroke}" stroke-width=".65"' if stroke else '')+'/>'
 p+=f'<ellipse rx="{r*.18}" ry="{r*.16}" fill="{core}"/>'
 return p+'</g>'
def leaf(x,y,scale,color,rot=0):return f'<path transform="translate({x} {y}) rotate({rot}) scale({scale})" d="M0 0C-15-45-72-58-79-54C-69-11-25 7 0 0Z" fill="{color}"/>'
def star(x,y,r,color,rot=0):return f'<path transform="translate({x} {y}) rotate({rot})" d="M0 {-r}C{r*.09} {-r*.11} {r*.12} {-r*.09} {r} 0C{r*.12} {r*.09} {r*.09} {r*.12} 0 {r}C{-r*.09} {r*.12} {-r*.12} {r*.09} {-r} 0C{-r*.12} {-r*.09} {-r*.09} {-r*.12} 0 {-r}Z" fill="{color}"/>'
def wrap(key,bg,body,title):
 # Gradient belongs to selected flower/star shapes, never to all text or the entire UI.
 for color in ('#B69ACC','#B69CCB','#BDA4D5'):
  body=body.replace(f'fill="{color}"',f'fill="url(#shade-{key})"')
 defs=f'<defs><linearGradient id="shade-{key}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#E3D8F1"/><stop offset="1" stop-color="#AD91C9"/></linearGradient></defs>'
 return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="600" height="800" role="img" aria-label="{escape(title)}"><title>{escape(title)}</title>{defs}<rect width="600" height="800" fill="{bg}"/>{body}</svg>'

posters={}
# 01. Lulu-purple paper, large quiet Song type and three expressive cut-paper flowers.
c='#58436F';b=''
b+=text(46,49,'赵露思 · 生日生咖',15,c,SANS,spacing=1)+text(554,49,'01 / BLOOM',10,c,SANS,'end',1)
b+=line(46,68,554,68,c,.35)
b+=text(44,155,'把今天，',73,c,spacing=2)+text(44,247,'留给喜欢。',73,c,spacing=2)
b+='<path d="M273 680C221 579 238 456 178 416 M290 679C371 570 405 490 420 390 M286 676C309 581 339 540 314 498" fill="none" stroke="#8A79A0" stroke-width="3"/>'
b+=leaf(265,605,.75,'#C0B1D0',-28)+leaf(353,539,.9,'#C0B1D0',143)+leaf(231,532,.6,'#A897BD',12)
b+=flower(180,422,91,'#FAF6F1','#C0A9D9',None,7,-16)+flower(425,383,106,'#B69ACC','#F3E7C8',None,6,12)+flower(313,518,69,'#CEC1E3','#58436F',None,7,5)
b+=text(47,712,'这是属于我们的晴天。',25,c)+line(46,743,554,743,c,.35)
b+=text(46,771,'HAPPY BIRTHDAY / TOGETHER',10,c,SANS,spacing=1.7)+text(554,771,'11.09',13,c,SANS,'end',1)
posters['lilac-bloom']=wrap('lilac-bloom','#E6DDF3',b,'露紫花笺 · 赵露思生日生咖海报模板')
# 02. Cream correspondence, botanical line drawing and soft purple bloom.
c='#6D527F';b=''
b+=text(300,52,'A LETTER FOR YOUR BIRTHDAY',10,c,SANS,'middle',2.3)
b+=text(300,147,'见字如面',76,c,anchor='middle',spacing=6)+text(300,188,'把没说完的喜欢，写进一朵花里。',18,c,anchor='middle')
b+='<path d="M302 607C328 516 292 454 304 373" stroke="#8B7B98" stroke-width="3" fill="none"/>'
b+=leaf(310,526,1.15,'#B0A1BF',-15)+leaf(314,481,.93,'#C6BACF',150)
b+=flower(303,366,135,'#B69CCB','#EAD7B6','#9578AF',9,-5)
b+='<path d="M266 588q35-30 67-1l-18 39-25-3Z" fill="#D9CFE4" opacity=".55"/>'
b+=line(70,640,530,640,c,.25)+text(300,686,'赵露思，生日快乐。',26,c,anchor='middle',spacing=2)
b+=text(300,724,'今年也在，和你一起过。',18,c,anchor='middle')
b+=text(52,771,'FAN LETTER / 11.09',10,c,SANS,spacing=1.2)+text(548,771,'生日生咖',11,c,SANS,'end',1)
posters['lilac-letter']=wrap('lilac-letter','#F0EBF5',b,'紫调来信 · 花朵与信笺式生日海报模板')
# 03. A joyful café print: crisp type, a striped takeaway cup and a ribbon.
c='#665084';b=''
b+=text(46,48,'赵露思 · 生日生咖',15,c,SANS,spacing=1)+text(554,48,'A HAPPY DAY',10,c,SANS,'end',1.7)
b+=text(44,145,'今天只管',75,c,SANS,spacing=-1)+text(44,267,'开 心。',113,c,SANS,spacing=0)
b+=star(497,181,42,'#9675B2',12)+star(118,319,19,'#F9F1DA',13)
b+='<g transform="translate(176 348) rotate(-7 120 115)"><path d="M18 29h205l-21 203q-84 24-165 0Z" fill="#FBF2DF"/><path d="M24 75h194M28 107h187M32 139h180M35 171h173" stroke="#B198CC" stroke-width="14"/><rect x="7" y="13" width="226" height="24" rx="8" fill="#665084"/><rect x="31" y="0" width="179" height="17" rx="6" fill="#665084"/><path d="M118 54c-76-68-91 32-7 14m16-13c81-62 92 37 8 16M118 64l-33 60m42-57 44 53" fill="none" stroke="#F3E6D2" stroke-width="12" stroke-linecap="round"/></g>'
b+=star(486,557,24,'#665084',25)+line(46,657,554,657,c,.45)
b+=text(47,706,'和你，一起过生日。',30,c)+text(46,765,'COFFEE, CAKE & ALL OUR LOVE',10,c,SANS,spacing=1.3)+text(554,765,'11.09',15,c,SANS,'end')
posters['lilac-party']=wrap('lilac-party','#C7B4DF',b,'奶紫派对 · 咖啡杯与撞色生日海报模板')
# 04. Misty lilac garden; generous reading rhythm with a pair of daisies.
c='#564868';b=''
b+=text(47,48,'FAN PROJECT / 自然生长的喜欢',11,c,SANS,spacing=1.2)
b+=text(42,190,'晴 日',116,c,spacing=7)+text(49,244,'和你，一起过生日。',27,c,spacing=2)
b+='<path d="M215 645C197 514 162 458 176 386 M250 641C328 520 390 498 412 427" fill="none" stroke="#8E7E9D" stroke-width="4"/>'
b+=leaf(211,585,1.05,'#B1A3BF',14)+leaf(307,553,.85,'#C4B5D0',154)
b+=flower(178,383,87,'#FFFCED','#C5B0D8',None,10,3)+flower(412,430,97,'#D1C1E2','#8B739F',None,9,-17)
b+=text(355,620,'今天也在',22,c)+text(355,657,'今年也在',22,c)+line(47,710,553,710,c,.3)
b+=text(47,755,'赵露思 · 生日生咖',21,c)+text(553,755,'11 / 09',12,c,SANS,'end',1)
posters['lilac-day']=wrap('lilac-day','#E5E0EE',b,'晨雾花园 · 花园与自然色生日海报模板')
# 05. Midnight print, soft lavender starbursts instead of generic neon bloom.
c='#F3EAD8';b=''
b+=text(47,49,'FOR YOU / AND ALL THE LITTLE LIGHTS',10,c,SANS,spacing=1.5)
b+=text(44,151,'这一刻，',72,c,spacing=2)+text(44,242,'为你亮着。',72,c,spacing=2)
for i in range(43):
 x=38+(i*127)%524;y=285+(i*83)%345;r=1 if i%4 else 1.8
 b+=f'<circle cx="{x}" cy="{y}" r="{r}" fill="#CEC2DD" opacity="{.3+(i%4)*.14}"/>'
b+='<path d="m122 550 130-162 174 109 83-154" fill="none" stroke="#AFA1C3" stroke-opacity=".5" stroke-width="1.2"/>'
b+=star(253,390,80,'#BDA4D5',13)+star(429,495,111,'#F3EAD8',-8)+star(123,548,30,'#BDA4D5')+star(507,342,25,'#F3EAD8',15)
b+=text(47,682,'所有微小的光，都为你而来。',22,c)+line(46,719,554,719,c,.4)+text(47,760,'赵露思 · 生日生咖',22,c)+text(554,760,'11.09',13,c,SANS,'end',1)
posters['violet-night']=wrap('violet-night','#352D4B',b,'紫夜星图 · 深蓝星图生日海报模板')
# 06. A deliberate photo-led layout. The source photo slot is honest and replaceable.
c='#685379';b=''
b+=text(47,54,'OUR LITTLE ALBUM',10,c,SANS,spacing=2)+text(554,54,'06 / PHOTO',10,c,SANS,'end',1.5)
b+=text(45,147,'生日这页',74,c,spacing=4)+text(48,185,'赵露思 · 生日生咖',15,c,SANS,spacing=1)
b+='<rect x="50" y="215" width="500" height="400" fill="#FFFDF9" stroke="#CCBDD9"/><rect x="68" y="233" width="464" height="364" fill="#D8CBE7"/>'
b+='__PHOTO_SLOT__'
b+='<path d="M69 243h22v-4H69Zm440 0h22v-4h-22ZM69 587h22v-4H69Zm440 0h22v-4h-22Z" fill="#AC96C0"/>'
b+=text(48,664,'和你拍一张，',29,c)+text(48,708,'一起留住今天。',29,c)+line(47,743,553,743,c,.3)+text(47,775,'PHOTO STUDY / 照片待替换',10,c,SANS,spacing=1)+text(553,775,'11.09',13,c,SANS,'end')
posters['lilac-photo']=wrap('lilac-photo','#EDE6F3',b,'露紫相册 · 可替换原图的生日海报模板')
photoPlaceholder='<g fill="#887395" text-anchor="middle" font-family="Geist,Microsoft YaHei,sans-serif"><path d="M276 348h48v39h-48Zm7 31 10-11 9 8 7-7 8 10" fill="none" stroke="#A38FB3" stroke-width="1.6"/><text x="300" y="425" font-size="20">把你的原图放在这里</text><text x="300" y="455" font-size="10" letter-spacing="2">YOUR PHOTO / 01</text></g>'
fontData=base64.b64encode((ROOT/'assets/fonts/PosterSerif-Subset.ttf').read_bytes()).decode()
fontStyle=f'<style>@font-face{{font-family:"XDP Poster Serif";src:url("data:font/ttf;base64,{fontData}") format("truetype");font-weight:600}}</style>'
for key,svg in posters.items():
 export=svg.replace('__PHOTO_SLOT__',photoPlaceholder).replace('</title>','</title>'+fontStyle,1)
 (OUT/f'{key}.svg').write_text(export,encoding='utf-8')
# Inline registry keeps HTML file:// use working, with one shared font loaded by studio.css.
js='/* Original SVG poster studies for 星动派. No portrait assets or network images. */\nconst POSTER_ART='+json.dumps(posters,ensure_ascii=False)+';\n'
js+='const POSTER_PHOTO_PLACEHOLDER='+json.dumps(photoPlaceholder,ensure_ascii=False)+';\n'
js+='''let posterInstance=0;
function posterSVG(key, options={}) {
 const safe = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const photo = options.photoUrl && /^data:image\\/(?:png|jpeg|webp);base64,/.test(options.photoUrl)
   ? `<image x="68" y="233" width="464" height="364" href="${safe(options.photoUrl)}" preserveAspectRatio="xMidYMid slice"/>`
   : POSTER_PHOTO_PLACEHOLDER;
 const suffix='-'+(++posterInstance);
 return (POSTER_ART[key] || POSTER_ART['lilac-bloom']).replace('__PHOTO_SLOT__',photo).replace(/id="([^"]+)"/g,(_,id)=>`id="${id}${suffix}"`).replace(/url\\(#([^)]+)\\)/g,(_,id)=>`url(#${id}${suffix})`);
}
'''
(ROOT/'assets/posters.js').write_text(js,encoding='utf-8')
print('Generated',len(posters),'poster SVGs and the shared registry.')

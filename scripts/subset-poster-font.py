from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools import subset
from fontTools.varLib.instancer import instantiateVariableFont
chars='赵露思生日快乐咖把今天留给喜欢这是属于我们的晴见字如面没说完写进一朵花里只管开心和你起过自然生长种在场每薄荷晚风星光所有微小都为而来这页原图放图片待替换拍张住蓝调笺奶油信桃色派对晴相册同行愿温柔印刷参考构想月份'
import xml.etree.ElementTree as ET
for svg in Path('assets/posters').glob('*.svg'):
 for el in ET.parse(svg).iter():
  if el.tag.endswith('}text'): chars += ''.join(el.itertext())
font=TTFont(r'C:/Windows/Fonts/NotoSerifSC-VF.ttf')
opt=subset.Options();opt.recalc_bounds=True;opt.name_IDs=[0,1,2,3,4,5,6,13,14];opt.name_legacy=True;opt.name_languages=['*']
sub=subset.Subsetter(options=opt);sub.populate(text=chars+''.join(chr(x) for x in range(32,127))+'，。·、：！？—（）/');sub.subset(font)
if 'fvar' in font:font=instantiateVariableFont(font,{'wght':600},inplace=True)
for record in font['name'].names:
 if record.nameID in (1,4,6):
  value={1:'XDP Poster Serif',4:'XDP Poster Serif SemiBold',6:'XDPPosterSerif-SemiBold'}[record.nameID]
  record.string=value.encode(record.getEncoding(),errors='replace')
font.save('assets/fonts/PosterSerif-Subset.ttf')
base=Path('assets/fonts/OFL.txt').read_text(encoding='utf-8');license_body=base[base.index('This Font Software'):]
Path('assets/fonts/PosterSerif-OFL.txt').write_text('Noto Serif SC subset, locally renamed XDP Poster Serif.\nOriginal copyright: © 2017-2023 Adobe (http://www.adobe.com/).\nSubset derived from the installed NotoSerifSC-VF.ttf; glyphs limited to the bundled poster copy.\n\n'+license_body,encoding='utf-8')
print('Poster display font subset:',Path('assets/fonts/PosterSerif-Subset.ttf').stat().st_size,'bytes')

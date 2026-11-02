// Build a shareable HTML without a package manager or runtime network requests.
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
let html=fs.readFileSync(path.join(root,'xingdongpai-room-optimized.html'),'utf8');
let css=fs.readFileSync(path.join(root,'assets/studio.css'),'utf8').replace(/^\uFEFF/,'');
css=css.replace(/url\('fonts\/([^']+\.ttf)'\)/g,(_,name)=>`url('data:font/ttf;base64,${fs.readFileSync(path.join(root,'assets/fonts',name)).toString('base64')}')`);
const js=fs.readFileSync(path.join(root,'assets/studio.js'),'utf8').replace(/^\uFEFF/,'').replace(/<\/script/gi,'<\\/script');
if(!html.includes('<link rel="stylesheet" href="assets/studio.css">')||!html.includes('<script src="assets/studio.js"></script>'))throw Error('Expected source asset tags not found');
html=html.replace('<link rel="stylesheet" href="assets/studio.css">',()=>`<style>\n${css}\n</style>`).replace('<script src="assets/studio.js"></script>',()=>`<script>\n${js}\n</script>`);
const posters=fs.readFileSync(path.join(root,'assets/posters.js'),'utf8').replace(/<\/script/gi,'<\\/script');
html=html.replace('<script src="assets/posters.js"></script>',()=>`<script>\n${posters}\n</script>`);
for(const asset of ['assistant-core','workspace','remix','voice','effects/atmosphere']){
 const source=fs.readFileSync(path.join(root,'assets',asset+'.js'),'utf8').replace(/<\/script/gi,'<\\/script');
 html=html.replace(`<script src="assets/${asset}.js"></script>`,()=>`<script>\n${source}\n</script>`);
}
html=html.replace('<link rel="stylesheet" href="assets/workspace.css">',()=>`<style>\n${fs.readFileSync(path.join(root,'assets/workspace.css'),'utf8')}\n</style>`);
html=html.replace('<link rel="stylesheet" href="assets/effects/atmosphere.css">',()=>`<style>\n${fs.readFileSync(path.join(root,'assets/effects/atmosphere.css'),'utf8')}\n</style>`);
html=html.replace('<link rel="stylesheet" href="assets/remix.css">',()=>`<style>\n${fs.readFileSync(path.join(root,'assets/remix.css'),'utf8')}\n</style>`);
const shaderLicense=fs.readFileSync(path.join(root,'assets/effects/SHADERS-LICENSE.txt'),'utf8').replace(/--/g,'—');
html=html.replace('</head>',`<!-- Shader Effects Inc. visual research attribution; local implementation.\n${shaderLicense}\n-->\n</head>`);
const license=fs.readFileSync(path.join(root,'assets/fonts/OFL.txt'),'utf8').replace(/--/g,'—')+'\n'+fs.readFileSync(path.join(root,'assets/fonts/PosterSerif-OFL.txt'),'utf8').replace(/--/g,'—');
html=html.replace('</head>',`<!-- Embedded Geist fonts: SIL Open Font License.\n${license}\n-->\n</head>`);
const out=path.join(root,'dist','xingdongpai-room-studio.html');fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,html);fs.writeFileSync(path.join(root,'dist','xingdongpai-room-mobile-fixed.html'),html);console.log(out);

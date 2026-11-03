'use strict';
const {createServer,config}=require('../scripts/serve-studio.cjs');
let server;
module.exports=async function handler(req,res){
 if(!server){const cfg=config();if(!cfg.publicOrigin||(cfg.accessMode!=='public'&&(!cfg.sessionSecret||cfg.sessionSecret.length<32))){res.statusCode=503;res.setHeader('Content-Type','application/json; charset=utf-8');return res.end(JSON.stringify({error:'部署配置不完整，请检查公网源和会话密钥。'}));}server=createServer(cfg);}
 // Vercel may have parsed the body before invoking a Node function. Keep one raw-byte input contract.
 if(req.body!==undefined){const bytes=Buffer.isBuffer(req.body)?req.body:Buffer.from(typeof req.body==='string'?req.body:JSON.stringify(req.body));req[Symbol.asyncIterator]=async function*(){yield bytes;};}
 await new Promise(resolve=>{res.once('finish',resolve);res.once('close',resolve);server.emit('request',req,res);});
};

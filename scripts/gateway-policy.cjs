'use strict';
const {createHash,createHmac,randomBytes,timingSafeEqual}=require('node:crypto');
const SESSION_SECONDS=12*60*60;
const error=(status,message)=>Object.assign(Error(message),{status});
function deploymentConfig(env){
 const host=env.HOST||'127.0.0.1',publicOrigin=env.XDP_PUBLIC_ORIGIN||'',accessCode=env.XDP_ACCESS_CODE||'',accessMode=env.XDP_ACCESS_MODE||'code';
 if(!['code','public'].includes(accessMode))throw Error('XDP_ACCESS_MODE 只能是 code 或 public。');
 if(publicOrigin){let u;try{u=new URL(publicOrigin);}catch{throw Error('XDP_PUBLIC_ORIGIN 必须是完整 HTTPS 源地址。');}
  if(u.protocol!=='https:'||u.origin!==publicOrigin||u.username||u.password)throw Error('XDP_PUBLIC_ORIGIN 必须是 HTTPS 源地址，不能包含路径或末尾斜杠。');
  if(accessMode==='code'&&accessCode.length<24)throw Error('公网模式必须配置至少 24 字符的随机 XDP_ACCESS_CODE。');
 }
 if(!publicOrigin&&!['127.0.0.1','localhost','::1'].includes(host))throw Error('非本机监听必须同时配置 XDP_PUBLIC_ORIGIN 和 XDP_ACCESS_CODE。');
 return {host,publicOrigin,accessCode,accessMode};
}
async function readJSON(req,limit=16000){
 if(!/^application\/json\b/i.test(req.headers['content-type']||''))throw error(415,'需要 JSON 请求。');
 if(Number(req.headers['content-length'])>limit)throw error(413,'请求内容过大。');
 const chunks=[];let size=0;
 for await(const chunk of req){size+=chunk.length;if(size>limit)throw error(413,'请求内容过大。');chunks.push(chunk);}
 let value;try{value=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw error(400,'请求不是有效 JSON。');}
 if(!value||typeof value!=='object'||Array.isArray(value))throw error(400,'请求必须是 JSON 对象。');return value;
}
function createPolicy(cfg){
 const deployed=!!cfg.publicOrigin,accessRequired=deployed&&cfg.accessMode!=='public';
 if(deployed)deploymentConfig({HOST:cfg.host||'127.0.0.1',XDP_PUBLIC_ORIGIN:cfg.publicOrigin,XDP_ACCESS_CODE:cfg.accessCode,XDP_ACCESS_MODE:cfg.accessMode});
 if(cfg.sessionSecret&&cfg.sessionSecret.length<32)throw Error('XDP_SESSION_SECRET 至少需要 32 字符。');
 const secret=cfg.sessionSecret?createHash('sha256').update(cfg.sessionSecret).digest():randomBytes(32),loginAttempts=[],apiRequests=[];
 const digest=x=>createHash('sha256').update(x).digest();
 const equal=(a,b)=>typeof a==='string'&&typeof b==='string'&&timingSafeEqual(digest(a),digest(b));
 const sign=value=>createHmac('sha256',secret).update(value).digest('base64url');
 const cookie=(value,age=SESSION_SECONDS)=>'__Host-xdp_session='+value+'; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age='+age;
 function origin(req){
  const host=req.headers.host||'';
  if(!host||/[\\\s/@#?]/.test(host))throw error(403,'请求来源不被允许。');
  let local;try{local=new URL('http://'+host);}catch{throw error(403,'请求来源不被允许。');}
  const expected=deployed?cfg.publicOrigin:'http://'+host;
  if(deployed?local.host!==new URL(expected).host:!['127.0.0.1','localhost','[::1]'].includes(local.hostname))throw error(403,'请求来源不被允许。');
  if(req.headers.origin&&req.headers.origin!==expected)throw error(403,'仅允许同源访问。');
  if(req.headers['sec-fetch-site']==='cross-site')throw error(403,'不允许跨站访问。');
  if(!req.url?.startsWith('/')||req.url.startsWith('//'))throw error(400,'请求地址格式不正确。');
  return expected;
 }
 function authorized(req){
  if(!accessRequired)return true;
  const bearer=/^Bearer (.+)$/.exec(req.headers.authorization||'');if(bearer&&equal(bearer[1],cfg.accessCode))return true;
  const token=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('__Host-xdp_session='))?.slice(19)||'';
  const [expires,nonce,signature,...rest]=token.split('.'),payload=expires+'.'+nonce;
  return rest.length===0&&/^\d+$/.test(expires)&&/^[A-Za-z0-9_-]{24}$/.test(nonce||'')&&Number(expires)>Date.now()&&Number(expires)<=Date.now()+SESSION_SECONDS*1000&&equal(signature,sign(payload));
 }
 function limit(times,max,window){const now=Date.now();while(times.length&&now-times[0]>=window)times.shift();if(times.length>=max)throw error(429,'请求过于频繁，请稍后再试。');times.push(now);}
 function login(code){limit(loginAttempts,10,60000);if(!equal(code,cfg.accessCode))throw error(401,'访问码不正确。');const value=(Date.now()+SESSION_SECONDS*1000)+'.'+randomBytes(18).toString('base64url');return cookie(value+'.'+sign(value));}
 return {deployed,accessRequired,origin,authorized,login,logout:()=>cookie('',0),limitAPI:()=>{if(deployed)limit(apiRequests,30,60000);}};
}
module.exports={deploymentConfig,createPolicy,readJSON};

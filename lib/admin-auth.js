const crypto=require('crypto');
const b64=value=>Buffer.from(value).toString('base64url');
function sign(data){return crypto.createHmac('sha256',process.env.ADMIN_SESSION_SECRET||'').update(data).digest('base64url')}
function createSession(){const payload=b64(JSON.stringify({exp:Date.now()+8*60*60*1000,csrf:crypto.randomBytes(24).toString('hex')}));return `${payload}.${sign(payload)}`}
function readSession(req){const raw=(req.headers.cookie||'').split(';').map(v=>v.trim()).find(v=>v.startsWith('portfolio_admin='))?.slice(16);if(!raw)return null;const [payload,signature]=raw.split('.'),expected=payload?sign(payload):'';if(!payload||!signature||signature.length!==expected.length||!crypto.timingSafeEqual(Buffer.from(signature),Buffer.from(expected)))return null;try{const data=JSON.parse(Buffer.from(payload,'base64url').toString());return data.exp>Date.now()?data:null}catch{return null}}
function verifyPassword(password){const saved=process.env.ADMIN_PASSWORD_HASH||'',parts=saved.split(':');if(parts.length!==2)return false;const actual=crypto.scryptSync(password,parts[0],64).toString('hex');return actual.length===parts[1].length&&crypto.timingSafeEqual(Buffer.from(actual),Buffer.from(parts[1]))}
module.exports={createSession,readSession,verifyPassword};

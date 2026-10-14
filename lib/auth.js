import {createHmac,timingSafeEqual} from 'node:crypto';
const name='rph_admin';
function signature(data){return createHmac('sha256',process.env.SESSION_SECRET||'').update(data).digest('hex')}
export function validSession(req){if(!process.env.SESSION_SECRET||!process.env.ADMIN_PASSWORD)return false;const raw=req.cookies.get(name)?.value||'';const [exp,sig]=raw.split('.');if(!exp||!sig||!/^[0-9a-f]{64}$/.test(sig)||Number(exp)<Date.now())return false;const expected=signature(exp);return timingSafeEqual(Buffer.from(sig),Buffer.from(expected))}
export function issueSession(){const exp=String(Date.now()+8*60*60*1000);return {name,value:`${exp}.${signature(exp)}`,options:{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/',maxAge:8*60*60}}}
export function originAllowed(req){const origin=req.headers.get('origin');if(!origin)return false;try{return new URL(origin).host===req.headers.get('host')}catch{return false}}

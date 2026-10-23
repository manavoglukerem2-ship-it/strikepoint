const http=require('http'),fs=require('fs'),path=require('path'),{WebSocketServer}=require('ws');
const DB=path.join(__dirname,'board.json');let K={};try{K=JSON.parse(fs.readFileSync(DB,'utf8'))}catch{}
const srv=http.createServer((q,s)=>{s.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});s.end(fs.readFileSync(path.join(__dirname,'index.html')))});
const wss=new WebSocketServer({server:srv});let dirty=0;
function bc(){const list=Object.entries(K).filter(([n,v])=>v.k>0).map(([n,v])=>({n,k:v.k,r:v.r})).sort((a,b)=>b.k-a.k).slice(0,5);
 const m=JSON.stringify({t:'lb',list,on:wss.clients.size});wss.clients.forEach(c=>c.readyState===1&&c.send(m))}
wss.on('connection',ws=>{
 ws.on('message',d=>{let m;try{m=JSON.parse(d)}catch{return}
  if(m.t==='hi'){const n=String(m.n||'?').slice(0,14);ws.n=n;K[n]=K[n]||{k:0};K[n].r=m.r|0;K[n].k=Math.max(K[n].k,Math.min(m.tk|0,100000))}
  else if(m.t==='k'&&ws.n&&K[ws.n]){K[ws.n].k++;dirty=1}
  bc()});
 ws.on('close',bc)});
setInterval(()=>{if(dirty){dirty=0;fs.writeFile(DB,JSON.stringify(K),()=>{})}},5000);
const P=process.env.PORT||3000;srv.listen(P,()=>console.log('http://localhost:'+P));

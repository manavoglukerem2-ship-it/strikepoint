const http=require('http'),fs=require('fs'),path=require('path'),{WebSocketServer}=require('ws');
const DB=path.join(__dirname,'board.json'),ID=/^[a-z]{2}\d{6}$/;let K={};try{K=JSON.parse(fs.readFileSync(DB,'utf8'))}catch{}
for(const k in K)if(!ID.test(k))delete K[k];
const srv=http.createServer((q,s)=>{s.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});s.end(fs.readFileSync(path.join(__dirname,'index.html')))});
const wss=new WebSocketServer({server:srv});let dirty=0;
const L=()=>String.fromCharCode(97+Math.random()*26|0),gen=()=>{let i;do i=L()+L()+(100000+Math.random()*900000|0);while(K[i]);return i};
const online=()=>{const s=new Set();wss.clients.forEach(c=>c.id&&s.add(c.id));return s};
const pub=(i,on)=>({id:i,n:K[i].n,k:K[i].k,r:K[i].r,lv:K[i].lv,av:K[i].av,on:on.has(i)});
function bc(){const on=online(),list=Object.keys(K).filter(i=>K[i].k>0).sort((a,b)=>K[b].k-K[a].k).slice(0,50).map(i=>pub(i,on));
 const m=JSON.stringify({t:'lb',list,on:wss.clients.size});wss.clients.forEach(c=>c.readyState===1&&c.send(m))}
wss.on('connection',ws=>{const tx=o=>ws.send(JSON.stringify(o));
 ws.on('message',d=>{let m;try{m=JSON.parse(d)}catch{return}
  if(m.t==='hi'){let id=String(m.id||''),tok=String(m.tok||'').slice(0,40);
   if(!ID.test(id)||(K[id]&&K[id].tok!==tok)){id=gen();tx({t:'id',id})}
   const o=K[id]=K[id]||{k:0};o.tok=tok;o.n=String(m.n||'?').slice(0,14);o.r=m.r|0;o.lv=m.lv|0;o.av=m.av|0;o.k=Math.max(o.k,Math.min(m.tk|0,100000));ws.id=id;dirty=1}
  else if(m.t==='k'&&ws.id&&K[ws.id]){K[ws.id].k++;dirty=1}
  else if(m.t==='find'){const q=String(m.q||'').toLowerCase().trim().slice(0,20),on=online();if(q)tx({t:'found',list:Object.keys(K).filter(i=>i===q||String(K[i].n).toLowerCase().includes(q)).slice(0,8).map(i=>pub(i,on))})}
  else if(m.t==='get'&&Array.isArray(m.ids)){const on=online();tx({t:'ppl',list:m.ids.slice(0,50).filter(i=>K[i]).map(i=>pub(i,on))})}
  bc()});
 ws.on('close',bc)});
setInterval(()=>{if(dirty){dirty=0;fs.writeFile(DB,JSON.stringify(K),()=>{})}},5000);
const P=process.env.PORT||3000;srv.listen(P,()=>console.log('http://localhost:'+P));

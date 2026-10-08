/* Safe local-only preview server. No uploads, transactions or analytics. */
'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../dist');
const port=Number(process.env.TIERSHEET_PORT||8713);
if(!Number.isInteger(port)||port<1024||port>65535)throw new Error('Invalid TIERSHEET_PORT.');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8'};
http.createServer((req,res)=>{
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);res.end('Method not allowed');return;}
  let pathname;
  try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch(e){res.writeHead(400);res.end('Bad URL');return;}
  const filename=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!filename.startsWith(root+path.sep)){res.writeHead(403);res.end('Forbidden');return;}
  try{
    if(!fs.statSync(filename).isFile())throw new Error();
    res.writeHead(200,{'Content-Type':types[path.extname(filename)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Cache-Control':'no-store'});
    if(req.method==='HEAD')res.end();else fs.createReadStream(filename).pipe(res);
  }catch(e){res.writeHead(404);res.end('Not found');}
}).listen(port,'127.0.0.1',()=>console.log('Local preview: http://127.0.0.1:'+port+' — no public deployment.'));

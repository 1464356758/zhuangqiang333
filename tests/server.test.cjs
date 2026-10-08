/* Test a child server in this process's own network namespace. No public hosting. */
'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{spawn}=require('node:child_process'),http=require('node:http'),path=require('node:path');
test('local preview rejects write methods, traversal and malformed URLs',async()=>{
 const child=spawn(process.execPath,[path.resolve(__dirname,'../scripts/serve.cjs')],{env:{...process.env,TIERSHEET_PORT:'8741'}});
 try{
  await new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>reject(new Error('Local server did not start')),10000);
   child.stdout.on('data',b=>{if(b.toString().includes('Local preview:')){clearTimeout(timer);resolve();}});child.on('error',reject);child.on('exit',code=>{clearTimeout(timer);reject(new Error('Server exit '+code));});
  });
  async function request(url,method='GET'){
   return new Promise((resolve,reject)=>{
    const q=http.request({hostname:'127.0.0.1',port:8741,path:url,method},r=>{let data='';r.on('data',b=>data+=b);r.on('end',()=>resolve({status:r.statusCode,headers:r.headers,data}));});q.on('error',reject);q.end();
   });
  }
  const good=await request('/');assert.equal(good.status,200);assert.match(good.data,/TierSheet/);assert.equal(good.headers['x-content-type-options'],'nosniff');
  assert.equal((await request('/','POST')).status,405);
  assert.equal((await request('/..%2Fsrc%2Fconfig.js')).status,403);
  assert.equal((await request('/%FF')).status,400);
  assert.equal((await request('/missing.html')).status,404);
 }finally{child.kill('SIGTERM');}
});

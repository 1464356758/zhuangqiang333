/* Local, disposable WordPress integration. No account or public site is touched. */
'use strict';
const {spawn}=require('node:child_process'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const {chromium}=require(process.env.TIERSHEET_PLAYWRIGHT||(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright'));
const output=path.join(root,'artifacts/wordpress');fs.mkdirSync(output,{recursive:true});
(async()=>{
 let browser;let log='';
 const version=process.env.TIERSHEET_WP_VERSION||'7.1.3',php=process.env.TIERSHEET_PHP_VERSION||'8.3';
 const port=process.env.TIERSHEET_WP_PORT||(php==='7.4'?'9414':'9413'),base='http://127.0.0.1:'+port;
 const installZip=process.env.TIERSHEET_WP_INSTALL_ZIP==='1';
 const args=[path.join(root,'wp-tooling/node_modules/@wp-playground/cli/cli.js'),'server','--wp='+version,'--php='+php,'--port='+port,'--workers=1'];
 if(!installZip)args.push('--auto-mount='+path.join(root,'dist/tiersheet-price-list'));
 const child=spawn(process.execPath,args,{cwd:root});
 try{
  await new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>reject(new Error('WordPress startup timed out. See artifacts/wordpress/server-'+php+'.log.')),90000);
   child.stdout.on('data',b=>{log+=b.toString();if(log.includes('Ready!')){clearTimeout(timer);resolve();}});child.stderr.on('data',b=>{log+=b.toString();});
   child.on('exit',code=>{clearTimeout(timer);reject(new Error('WordPress exited: '+code+'\n'+log));});
  });
  browser=await chromium.launch({executablePath:process.env.TIERSHEET_CHROMIUM||path.join(root,'tooling/chromium/chromium'),headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process','--disable-webgl']});
  const page=await browser.newPage({viewport:{width:1440,height:1100},acceptDownloads:true});
  const response=await page.goto(base+'/wp-admin/');assert.equal(response.status(),200);
  if(await page.locator('#user_login').count()){
   // These are the Playground-generated disposable fixture credentials.
   await page.locator('#user_login').fill('admin');await page.locator('#user_pass').fill('password');await page.locator('#wp-submit').click();
  }
  if(installZip){
   await page.goto(base+'/wp-admin/plugin-install.php?tab=upload');
   await page.locator('#pluginzip').setInputFiles(path.join(root,'release/tiersheet-free-wordpress-0.1.0.zip'));
   await page.locator('#install-plugin-submit').click();
   assert.match(await page.locator('body').innerText(),/Plugin installed successfully/);
   await page.getByRole('link',{name:'Activate Plugin',exact:true}).click();
  }
  await page.goto(base+'/wp-admin/tools.php?page=tiersheet-price-list');
  assert.equal(await page.locator('iframe[title="TierSheet free price list tool"]').count(),1);
  const frame=page.frameLocator('iframe[title="TierSheet free price list tool"]');
  await frame.locator('#sampleButton').click();await frame.locator('#runButton').click();assert.equal(await frame.locator('#summary').innerText(),'3 products');await frame.locator('#acknowledge').check();
  const promise=page.waitForEvent('download');await frame.locator('#pdfButton').click();const d=await promise;assert.equal(await d.failure(),null);await d.saveAs(path.join(output,'synthetic-wordpress-price-list.pdf'));
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.screenshot({path:path.join(output,'wordpress-admin-sample.png'),fullPage:true});
  await page.goto(base+'/wp-admin/about.php');
  assert.match(await page.locator('body').innerText(),new RegExp(version.replace(/\./g,'\\.')));
  await page.goto(base+'/wp-admin/site-health.php?tab=debug');await page.getByRole('button',{name:/^Server\b/}).click();
  assert.match(await page.locator('body').innerText(),new RegExp('PHP version\\s+'+php.replace(/\./g,'\\.')));
  await page.context().clearCookies();await page.goto(base+'/wp-admin/tools.php?page=tiersheet-price-list');assert.equal(await page.locator('#user_login').count(),1);
  fs.writeFileSync(path.join(output,'results-'+php+(installZip?'-zip-install':'')+'.json'),JSON.stringify({fixtureMode:'disposable local WordPress; sample data only',requestedWordPress:version,confirmedWordPress:version,php:php+' WASM / SQLite (confirmed via Site Health)',checks:[installZip?'actual ZIP uploaded, installed and activated via WordPress admin':'plugin automatically activated','admin tool and sandboxed iframe loaded','sample generates three real rows','PDF download works inside sandbox','WordPress version confirmed in About page','PHP version confirmed via Site Health','logged-out admin route redirects to login'],status:'passed',productionMySQL:false},null,2)+'\n');
  console.log('WordPress '+version+' PHP '+php+(installZip?' ZIP installation':'')+': admin tool, sandboxed app, PDF and signed-out protection passed.');
 }finally{fs.writeFileSync(path.join(output,'server-'+php+'.log'),log);if(browser)await browser.close();child.kill('SIGTERM');}
})().catch(e=>{console.error(e);process.exitCode=1;});

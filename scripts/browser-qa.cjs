/* Real browser tests with synthetic CSV fixtures. Not customer or income evidence. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
const {chromium}=require(process.env.TIERSHEET_PLAYWRIGHT || (process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES ? process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright' : 'playwright'));
const output=path.join(root,'artifacts/browser');fs.mkdirSync(output,{recursive:true});
const checks=[];
const file=(name,text)=>({name,mimeType:'text/csv',buffer:Buffer.isBuffer(text)?text:Buffer.from(text)});
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.TIERSHEET_CHROMIUM||path.join(root,'tooling/chromium/chromium'),headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process','--disable-webgl']});
 const page=await browser.newPage({viewport:{width:1440,height:1100},acceptDownloads:true});
 const errors=[],network=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url());});
 async function check(name,fn){await fn();checks.push({name,status:'passed'});console.log('PASS '+name);}
 async function fresh(edition='index.html'){await page.goto(pathToFileURL(path.join(root,'dist',edition)).href);}
 async function download(id,name){const promise=page.waitForEvent('download');await page.locator('#'+id).click();const d=await promise;assert.equal(await d.failure(),null);const dest=path.join(output,name||d.suggestedFilename());await d.saveAs(dest);return fs.readFileSync(dest);}
 async function load(id,name,text){await page.locator('#'+id).setInputFiles(file(name,text));await page.waitForFunction(()=>!document.querySelector('#runButton').disabled);}
 try{
  await check('sample tiers, exact discounts and override preview',async()=>{
   await fresh();await page.locator('#sampleButton').click();await page.locator('#runButton').click();
   assert.equal(await page.locator('#summary').innerText(),'5 products · 3 price tiers');
   assert.match(await page.locator('#dataBadge').innerText(),/Sample data/);
   await page.locator('#tierSelect').selectOption('1');assert.equal(await page.locator('#previewRows tr').first().locator('td').nth(2).innerText(),'11.25');
   await page.locator('#tierSelect').selectOption('2');assert.equal(await page.locator('#previewRows tr').nth(1).locator('td').nth(2).innerText(),'6.00');
   assert.equal(await page.locator('#zipButton').isDisabled(),true);await page.locator('#acknowledge').check();assert.equal(await page.locator('#zipButton').isDisabled(),false);
  });
  await check('actual CSV, HTML, templates and three-PDF ZIP downloads',async()=>{
   const csv=await download('csvButton','sample-wholesale.csv');assert.match(csv.toString('utf8'),/"TEA-02","Loose leaf tea","6.00"/);
   const html=await download('htmlButton','sample-price-lists.html');assert.match(html.toString(),/<h2>Wholesale · USD<\/h2>/);
   const zip=await download('zipButton','sample-batch.zip');assert.equal(zip.readUInt32LE(0),0x04034b50);
   await download('templateButton','sample-templates.zip');assert.match(await page.locator('#status').innerText(),/ZIP created/);
   await page.screenshot({path:path.join(output,'tiersheet-desktop.png'),fullPage:true});
  });
  await check('changed options invalidate every export',async()=>{
   await page.locator('#currency').fill('EUR');assert.equal(await page.locator('#results').isVisible(),false);assert.equal(await page.locator('#zipButton').isDisabled(),true);
   await page.locator('#runButton').click();assert.equal(await page.locator('#acknowledge').isChecked(),false);assert.match(await page.locator('#previewTier').innerText(),/EUR/);
  });
  await check('uploaded comma/quote/Unicode data and spreadsheet-safe HTML/CSV',async()=>{
   await fresh();await load('productsFile','synthetic-products.csv','SKU,Name,Price\nABC,"Tea, \"\"green\"\"",10.05\nFORM,"=SUM(1,2)",1.00\nZH,茶具,8.00\nHTML,<img src=x onerror=alert(1)>,2.00\n');
   await load('tiersFile','synthetic-tiers.csv','Tier,DiscountPercent\nDealer,10\n');await page.locator('#runButton').click();await page.locator('#acknowledge').check();
   assert.equal(await page.locator('#previewRows tr').first().locator('td').nth(2).innerText(),'9.05');
   assert.equal(await page.locator('#previewRows img').count(),0);
   const csv=await download('csvButton','synthetic-safe.csv');assert.match(csv.toString('utf8'),/茶具/);assert.match(csv.toString('utf8'),/"'=SUM\(1,2\)"/);
   const html=await download('htmlButton','synthetic-safe.html');assert.match(html.toString(),/&lt;img src=x onerror=alert\(1\)&gt;/);assert.equal(await page.locator('#dataBadge').innerText(),'Offline · Files stay on this device');
  });
  await check('duplicate SKU and unknown override block exports',async()=>{
   await load('productsFile','synthetic-duplicates.csv','SKU,Name,Price\nABC,One,10.00\nABC,Two,20.00\n');await page.locator('#runButton').click();assert.match(await page.locator('#issueSummary').innerText(),/error/);assert.equal(await page.locator('#zipButton').isDisabled(),true);
   await load('productsFile','synthetic-one.csv','SKU,Name,Price\nABC,One,10.00\n');await load('overridesFile','synthetic-bad-override.csv','Tier,SKU,Price\nDealer,MISSING,5.00\n');await page.locator('#runButton').click();assert.match(await page.locator('#issues').innerText(),/Unknown SKU/);assert.equal(await page.locator('#results').isVisible(),false);
  });
  await check('invalid UTF-8 and malformed CSV do not retain old data',async()=>{
   await load('productsFile','synthetic-invalid.csv',Buffer.from([83,75,85,44,78,97,109,101,44,80,114,105,99,101,10,255]));assert.match(await page.locator('#status').innerText(),/UTF-8/);
   await page.locator('#runButton').click();assert.match(await page.locator('#status').innerText(),/Choose a products CSV/);
   await load('productsFile','synthetic-malformed.csv','SKU,Name,Price\nABC,"unclosed,10.00\n');assert.match(await page.locator('#status').innerText(),/quote/i);
  });
  await check('PDF overflow gives a clear error; CSV fallback works',async()=>{
   await fresh();await load('productsFile','synthetic-long.csv','SKU,Name,Price\nABC,'+'W'.repeat(240)+',10.00\n');await load('tiersFile','synthetic-tiers.csv','Tier,DiscountPercent\nDealer,0\n');await page.locator('#runButton').click();await page.locator('#acknowledge').check();
   await page.locator('#zipButton').click();await page.waitForFunction(()=>!document.querySelector('#runButton').disabled);assert.match(await page.locator('#status').innerText(),/does not fit PDF rows/);
   await page.locator('#includePDF').uncheck();await download('zipButton','synthetic-long-csv-only.zip');assert.match(await page.locator('#status').innerText(),/ZIP created/);
  });
  await check('mobile layout and local file use',async()=>{
   await fresh();await page.setViewportSize({width:390,height:844});await page.locator('#sampleButton').click();await page.locator('#runButton').click();
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);
   await page.screenshot({path:path.join(output,'tiersheet-mobile.png'),fullPage:true});
  });
  await check('complete free edition exports over one hundred products',async()=>{
   await page.setViewportSize({width:1440,height:1100});await fresh('free.html');
   const rows=['SKU,Name,Price',...Array.from({length:101},(_,i)=>'TEST-'+String(i+1).padStart(3,'0')+',Synthetic product '+(i+1)+',12.50')].join('\n');
   await load('productsFile','synthetic-101-products.csv',rows);await page.locator('#runButton').click();assert.equal(await page.locator('#summary').innerText(),'101 products');await page.locator('#acknowledge').check();
   const csv=await download('csvButton','synthetic-free-101.csv');assert.match(csv.toString(),/TEST-101/);
   await download('pdfButton','synthetic-free-101.pdf');assert.match(await page.locator('#status').innerText(),/PDF created/);
   await page.screenshot({path:path.join(output,'tiersheet-free-desktop.png'),fullPage:true});
  });
  await check('sales closed; no external requests or JavaScript errors',async()=>{
   await fresh();assert.equal(await page.locator('#buyLink').isVisible(),false);await page.locator('.support details').evaluate(e=>e.open=true);assert.match(await page.locator('#purchaseStatus').innerText(),/Sales are not open/);
   assert.deepEqual(errors,[]);assert.deepEqual(network,[]);
  });
  await check('publication draft links to working free app and keeps checkout closed',async()=>{
   await fresh('site/index.html');assert.equal(await page.locator('#buyLink').isVisible(),false);assert.match(await page.locator('#purchaseStatus').innerText(),/Sales are not open/);
   assert.equal(await page.locator('img').evaluate(i=>i.complete&&i.naturalWidth>0),true);
   await page.locator('a[href="free.html"]').first().click();await page.locator('#sampleButton').click();await page.locator('#runButton').click();assert.equal(await page.locator('#summary').innerText(),'3 products');
   assert.equal(await page.locator('#batchInfoLink').isVisible(),false);assert.deepEqual(errors,[]);assert.deepEqual(network,[]);
  });
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({date:new Date().toISOString(),fixtureMode:'synthetic; not customer activity',browser:browser.version(),checks,externalRequests:network,pageErrors:errors},null,2)+'\n');
  console.log('Browser QA: '+checks.length+' passed. Downloads and screenshots are real outputs from synthetic fixtures.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

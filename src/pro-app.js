/* Original standalone UI. No live payment is enabled by default. */
(function(){
  'use strict';
  const C=TierSheetCommon,P=TierSheetPro,A=TierSheetArchive,U=TierSheetUI,$=U.byId;
  let productsText='',tiersText='',overridesText='',table=null,result=null,meta=null,revision=0,sample=false,busy=false;
  function status(message,error){U.text('status',message);$('status').classList.toggle('error',!!error);}
  function errorMessage(e){return(e.row?'Row '+e.row+' · ':'')+e.message;}
  function invalidate(){
    revision++;result=null;$('results').hidden=true;$('empty').hidden=false;$('summary').hidden=true;
    U.renderIssues([]);setExports(false);
  }
  function setExports(on){for(const id of['zipButton','csvButton','htmlButton'])$(id).disabled=!on;}
  function updateExports(){setExports(!!result&&!result.hasErrors&&$('acknowledge').checked&&!busy);}
  function setBusy(value){busy=value;for(const id of['productsFile','tiersFile','overridesFile','sampleButton','templateButton','runButton','skuColumn','nameColumn','priceColumn','business','currency','precision','issued','validUntil','tierSelect','includePDF'])$(id).disabled=value;updateExports();}
  function showBadge(){U.text('dataBadge',sample?'Sample data · Not customer activity':'Offline · Files stay on this device');$('dataBadge').classList.toggle('sample',sample);}
  async function loadFile(kind){
    const myRevision=++revision;
    const file=$(kind+'File').files[0];
    if(!file){
      if(kind==='products'){productsText='';table=null;$('mapping').hidden=true;}
      if(kind==='tiers')tiersText='';
      if(kind==='overrides')overridesText='';
      invalidate();status('File removed. Build again after selecting your files.');return;
    }
    invalidate();const currentRevision=revision;sample=false;showBadge();
    setBusy(true);
    try{
      const content=await U.fileText(file);
      if(currentRevision!==revision)return;
      const parsed=C.parseCSV(content);
      if(kind==='products'){productsText=content;table=parsed;U.mappingOptions(table);}
      if(kind==='tiers')tiersText=content;
      if(kind==='overrides')overridesText=content;
      status(file.name+' loaded. Nothing uploaded.');
    }catch(e){
      if(kind==='products'){productsText='';table=null;$('mapping').hidden=true;}
      if(kind==='tiers')tiersText='';
      if(kind==='overrides')overridesText='';
      status(errorMessage(e),true);
    }finally{setBusy(false);}
  }
  for(const kind of['products','tiers','overrides'])$(kind+'File').addEventListener('change',()=>loadFile(kind));
  for(const id of['skuColumn','nameColumn','priceColumn','business','currency','precision','issued','validUntil'])$(id).addEventListener('input',()=>{invalidate();status('Options changed. Build again to update the prices.');});
  $('acknowledge').addEventListener('change',updateExports);
  $('sampleButton').addEventListener('click',()=>{
    invalidate();sample=true;showBadge();for(const id of['productsFile','tiersFile','overridesFile'])$(id).value='';
    productsText='SKU,Name,Price\nMUG-01,Stoneware mug,12.50\nTEA-02,Loose leaf tea,8.00\nTIN-03,Gift tin,19.95\nBAG-04,Cotton tote,10.00\nSPOON-05,Bamboo spoon,4.25\n';
    tiersText='Tier,DiscountPercent\nRetail,0\nDealer,10\nWholesale,20\n';
    overridesText='Tier,SKU,Price\nWholesale,TEA-02,6.00\n';
    table=C.parseCSV(productsText);U.mappingOptions(table);$('business').value='Sample Supply';$('currency').value='USD';$('precision').value='2';$('acknowledge').checked=false;
    status('Sample files loaded: 5 products, 3 tiers and 1 specific price. Click Build price lists.');
  });
  $('templateButton').addEventListener('click',()=>{
    U.download('tiersheet-csv-templates.zip',A.zip([
      {name:'products.csv',data:'SKU,Name,Price\r\nMUG-01,Sample mug,12.50\r\n'},
      {name:'tiers.csv',data:'Tier,DiscountPercent\r\nRetail,0\r\nDealer,10\r\n'},
      {name:'overrides.csv',data:'Tier,SKU,Price\r\nDealer,MUG-01,11.00\r\n'},
      {name:'README.txt',data:'SAMPLE DATA ONLY. Replace every sample before sharing. UTF-8 CSV. Products: SKU,Name,Price. Tiers: Tier,DiscountPercent (0-100, max two decimals). Overrides: Tier,SKU,Price; price wins over discount. Do not use outputs as store-import files. No tax or currency conversion is calculated.'}
    ]),'application/zip');
  });
  $('runButton').addEventListener('click',()=>{
    invalidate();$('acknowledge').checked=false;
    try{
      if(!table||!productsText)throw new C.InputError('FILE','Choose a products CSV or try the sample.');
      if(!tiersText)throw new C.InputError('FILE','Choose a price tiers CSV.');
      meta=U.metadata();
      const productResult=C.normalizeProducts(table,{precision:Number($('precision').value),mapping:U.chosenMapping()});
      const tiers=P.loadTiers(C.parseCSV(tiersText));
      result=P.buildPriceLists(productResult,tiers,overridesText?C.parseCSV(overridesText):null,{currency:$('currency').value});
      U.renderIssues(result.issues);
      if(result.hasErrors){status('Fix the input errors before generating price lists.',true);return;}
      const select=$('tierSelect');select.replaceChildren();
      result.lists.forEach((l,i)=>{const option=document.createElement('option');option.value=String(i);option.textContent=l.name+' · '+(l.basisPoints/100)+'% discount';select.appendChild(option);});
      U.renderPreview(result.lists[0],meta);$('empty').hidden=true;$('summary').hidden=false;
      U.text('summary',result.productCount+' products · '+result.lists.length+' price tiers');
      status('Ready to review. '+result.overrideCount+' specific price override(s). '+(sample?'These are sample outputs.':''));
      updateExports();
    }catch(e){result=null;setExports(false);status(errorMessage(e),true);}
  });
  $('tierSelect').addEventListener('change',()=>{if(result)U.renderPreview(result.lists[Number($('tierSelect').value)],meta);});
  $('csvButton').addEventListener('click',()=>{
    if(!result||!$('acknowledge').checked)return;const list=result.lists[Number($('tierSelect').value)];U.download(list.fileStem+'.csv',P.listCSV(list),'text/csv;charset=utf-8');
  });
  $('htmlButton').addEventListener('click',()=>{if(result&&$('acknowledge').checked)U.download('price-lists.html',U.htmlReport(result.lists,meta,result.issues),'text/html;charset=utf-8');});
  $('zipButton').addEventListener('click',async()=>{
    if(!result||!$('acknowledge').checked||busy)return;
    const active=result,activeMeta=meta,atRevision=revision;setBusy(true);
    try{
      const includePDF=$('includePDF').checked;
      const totalPages=active.lists.reduce((n,l)=>n+Math.ceil(l.lines.length/24),0);
      if(includePDF&&totalPages>100)throw new Error('The batch exceeds 100 PDF pages. Choose CSV/HTML-only export or split your products file.');
      const files=[];
      for(let i=0;i<active.lists.length;i++){
        const list=active.lists[i];files.push({name:list.fileStem+'.csv',data:P.listCSV(list)});
        if(includePDF){status('Rendering '+list.name+' ('+(i+1)+'/'+active.lists.length+')…');files.push({name:list.fileStem+'.pdf',data:await U.renderPDF(list,activeMeta,(page,total)=>status('Rendering '+list.name+' · page '+page+'/'+total+'…'))});}
      }
      if(atRevision!==revision)throw new Error('Inputs changed during export. Build the lists again.');
      files.push({name:'price-source-audit.csv',data:P.auditCSV(active)});
      files.push({name:'price-lists.html',data:U.htmlReport(active.lists,activeMeta,active.issues)});
      files.push({name:'manifest.json',data:JSON.stringify({version:'0.1.0',sampleData:sample,generatedAt:new Date().toISOString(),currency:active.currency,precision:active.precision,products:active.productCount,tiers:active.lists.map(l=>({name:l.name,fileStem:l.fileStem,discountPercent:l.basisPoints/100,rows:l.lines.length})),overrideCount:active.overrideCount,pdf:includePDF?'A4, 150 DPI image pages':'excluded by user',rounding:'half up',exchangeConversion:false},null,2)});
      U.download('tiersheet-price-lists.zip',A.zip(files),'application/zip');
      status('ZIP created: '+active.lists.length+' price tiers. '+(sample?'Sample data — not customer activity.':'Keep a copy before sharing.'));
    }catch(e){status(errorMessage(e),true);}
    finally{setBusy(false);}
  });
  const cfg=globalThis.TierSheetConfig||{};
  try{
    const url=new URL(cfg.checkoutUrl);
    const allowed=['creem.io','www.creem.io','checkout.creem.io','l.creem.io'];
    const valid=cfg.paymentMode==='live'&&url.protocol==='https:'&&!url.username&&!url.password&&!url.port&&allowed.includes(url.hostname)&&cfg.sellerName&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cfg.supportEmail||'');
    if(valid){$('buyLink').href=url.href;$('buyLink').hidden=false;U.text('purchaseStatus','$19 one-time. Seller: '+cfg.sellerName+' · Support: '+cfg.supportEmail+'. Payment and delivery are handled by Creem.');}
  }catch(e){/* An unset or invalid checkout stays closed. */}
  U.initializeDates();
})();

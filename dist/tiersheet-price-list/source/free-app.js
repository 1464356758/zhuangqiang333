/* Complete free single-list edition. GPL-2.0-or-later. No paid feature code. */
(function(){
  'use strict';
  const C=TierSheetCommon,A=TierSheetArchive,U=TierSheetUI,$=U.byId;
  let table=null,list=null,issues=[],meta=null,busy=false;
  function status(msg,error){U.text('status',msg);$('status').classList.toggle('error',!!error);}
  function invalidate(){list=null;$('results').hidden=true;$('empty').hidden=false;$('summary').hidden=true;U.renderIssues([]);enabled();}
  function enabled(){for(const id of['csvButton','htmlButton','pdfButton'])$(id).disabled=!list||!$('acknowledge').checked||busy;}
  function lock(on){busy=on;for(const id of['productsFile','runButton','sampleButton','templateButton','skuColumn','nameColumn','priceColumn','business','currency','precision','issued','validUntil'])$(id).disabled=on;enabled();}
  $('productsFile').addEventListener('change',async()=>{
    invalidate();table=null;lock(true);$('mapping').hidden=true;
    try{table=C.parseCSV(await U.fileText($('productsFile').files[0]));U.mappingOptions(table);U.text('dataBadge','Offline · Files stay on this device');$('dataBadge').classList.remove('sample');status('File loaded locally. Review the columns.');}
    catch(e){status((e.row?'Row '+e.row+' · ':'')+e.message,true);}
    finally{lock(false);}
  });
  for(const id of['skuColumn','nameColumn','priceColumn','business','currency','precision','issued','validUntil'])$(id).addEventListener('input',()=>{invalidate();status('Options changed. Build again to update the list.');});
  $('acknowledge').addEventListener('change',enabled);
  $('sampleButton').addEventListener('click',()=>{
    invalidate();$('productsFile').value='';
    table=C.parseCSV('SKU,Name,Price\nMUG-01,Sample mug,12.50\nTEA-02,Sample tea,8.00\nTIN-03,Sample gift tin,19.95\n');
    U.mappingOptions(table);$('business').value='Sample Supply';$('currency').value='USD';$('precision').value='2';U.text('dataBadge','Sample data · Not customer activity');$('dataBadge').classList.add('sample');status('Sample loaded. Click Build price list.');
  });
  $('templateButton').addEventListener('click',()=>U.download('products-template.csv','SKU,Name,Price\r\nMUG-01,Sample mug,12.50\r\n','text/csv;charset=utf-8'));
  $('runButton').addEventListener('click',()=>{
    invalidate();$('acknowledge').checked=false;
    try{
      if(!table)throw new C.InputError('FILE','Choose a products CSV or try the sample.');
      meta=U.metadata();
      const r=C.normalizeProducts(table,{precision:Number($('precision').value),mapping:U.chosenMapping()});
      issues=r.issues;U.renderIssues(issues);
      if(issues.some(i=>i.severity==='error')){status('Fix input errors before exporting.',true);return;}
      list={name:'Price list',currency:C.normalizeCurrency($('currency').value),precision:r.precision,lines:r.products};
      U.renderPreview(list,meta);$('empty').hidden=true;$('summary').hidden=false;U.text('summary',r.products.length+' products');status('Complete list ready to review and export.');enabled();
    }catch(e){status((e.row?'Row '+e.row+' · ':'')+e.message,true);}
  });
  $('csvButton').addEventListener('click',()=>{if(list&&$('acknowledge').checked)U.download('price-list.csv',C.toCSV([['SKU','Name','Unit price','Currency'],...list.lines.map(p=>[p.sku,p.name,C.formatMoney(p.price,list.precision),list.currency])]),'text/csv;charset=utf-8');});
  $('htmlButton').addEventListener('click',()=>{if(list&&$('acknowledge').checked)U.download('price-list.html',U.htmlReport([list],meta,issues),'text/html;charset=utf-8');});
  $('pdfButton').addEventListener('click',async()=>{
    if(!list||!$('acknowledge').checked||busy)return;lock(true);
    try{U.download('price-list.pdf',await U.renderPDF(list,meta,(page,total)=>status('Rendering PDF page '+page+'/'+total+'…')),'application/pdf');status('PDF created. Check it before sharing.');}
    catch(e){status(e.message,true);}finally{lock(false);}
  });
  const cfg=globalThis.TierSheetFreeConfig||{};
  try{
    const url=new URL(cfg.productInfoUrl);
    if(url.protocol==='https:'&&!url.username&&!url.password&&!url.port&&cfg.sellerName&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cfg.supportEmail||'')){
      $('batchInfoLink').href=url.href;$('batchInfoLink').hidden=false;
      U.text('batchStatus','Need different price tiers? Compare the separately sold batch edition. All functions in this free edition remain free.');
    }
  }catch(e){/* An unset public product page stays hidden. */}
  U.initializeDates();
})();

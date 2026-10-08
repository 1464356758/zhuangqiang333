/* Original browser UI/PDF rendering shared by the two editions. */
(function(root){
  'use strict';
  const C=root.TierSheetCommon,A=root.TierSheetArchive;
  function byId(id){return document.getElementById(id);}
  function text(id,value){const el=byId(id);if(el)el.textContent=value;}
  function download(name,data,mime){
    const url=URL.createObjectURL(new Blob([data],{type:mime||'application/octet-stream'}));
    const link=document.createElement('a');link.href=url;link.download=name;link.click();
    setTimeout(()=>URL.revokeObjectURL(url),1500);
  }
  async function fileText(file){
    if(!file)throw new C.InputError('FILE','Select a CSV file first.');
    if(file.size>25*1024*1024)throw new C.InputError('CSV_SIZE','Use a file below 25 MB.');
    try{return new TextDecoder('utf-8',{fatal:true}).decode(await file.arrayBuffer());}
    catch(e){if(e instanceof C.InputError)throw e;throw new C.InputError('CSV_ENCODING','This file is not valid UTF-8. Export a UTF-8 CSV.');}
  }
  function renderIssues(issues){
    const box=byId('issues');box.replaceChildren();
    const errors=issues.filter(i=>i.severity==='error').length;
    text('issueSummary',issues.length?(errors+' error(s), '+(issues.length-errors)+' notice(s)'):'No input problems found.');
    for(const item of issues.slice(0,100)){
      const li=document.createElement('li');li.className=item.severity;
      li.textContent=(item.source?item.source+' · ':'')+'row '+item.row+' · '+item.field+' — '+item.message;box.appendChild(li);
    }
    if(issues.length>100){const li=document.createElement('li');li.textContent='Showing the first 100 items. Resolve these and run again.';box.appendChild(li);}
  }
  function mappingOptions(table){
    const aliases={skuColumn:['sku','variant sku','stock code','货号'],nameColumn:['name','title','product name','商品名称'],priceColumn:['price','regular price','variant price','单价']};
    for(const [id,names]of Object.entries(aliases)){
      const select=byId(id);select.replaceChildren();
      const empty=document.createElement('option');empty.value='';empty.textContent='Choose column';select.appendChild(empty);
      for(const h of table.headers){const option=document.createElement('option');option.value=h;option.textContent=h;select.appendChild(option);}
      const matches=table.headers.filter(h=>names.includes(h.toLowerCase()));
      select.value=matches.length===1?matches[0]:'';
    }
    byId('mapping').hidden=false;
  }
  function chosenMapping(){
    const result={sku:byId('skuColumn').value,name:byId('nameColumn').value,price:byId('priceColumn').value};
    if(Object.values(result).some(x=>!x))throw new C.InputError('MAPPING','Select SKU, name and price columns.');
    return result;
  }
  function metadata(){
    const business=byId('business').value.trim();
    if(business.length>100)throw new C.InputError('BUSINESS','Business heading must be under 101 characters.');
    const issued=byId('issued').value,until=byId('validUntil').value;
    for(const date of[issued,until]){
      if(date&&(!/^\d{4}-\d{2}-\d{2}$/.test(date)||new Date(date+'T00:00:00Z').toISOString().slice(0,10)!==date))throw new C.InputError('DATE','Choose a valid date.');
    }
    if(issued&&until&&until<issued)throw new C.InputError('DATE','Valid-until date is before issue date.');
    return{business,issued,until};
  }
  function renderPreview(list,meta){
    const tbody=byId('previewRows');tbody.replaceChildren();
    text('previewHeading',meta.business||'Wholesale price list');
    text('previewTier',list.name+' · '+list.currency);
    text('previewDate',(meta.issued?'Issued '+meta.issued:'')+(meta.until?' · Valid until '+meta.until:''));
    for(const p of list.lines.slice(0,60)){
      const tr=document.createElement('tr');
      for(const value of[p.sku,p.name,C.formatMoney(p.price,list.precision)]){
        const td=document.createElement('td');td.textContent=value;tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
    text('previewLimit',list.lines.length>60?'Preview shows 60 rows; export includes all '+list.lines.length+' rows.':'All '+list.lines.length+' products shown.');
    byId('results').hidden=false;
  }
  function htmlReport(lists,meta,issues){
    const e=C.escapeHTML;
    return '<!doctype html><html lang="en"><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; img-src data:"><title>TierSheet price lists</title><style>body{font:14px system-ui,sans-serif;color:#17312b;max-width:1000px;margin:40px auto;padding:0 24px}section{break-before:page}table{width:100%;border-collapse:collapse}td,th{padding:10px;border-bottom:1px solid #ddd;text-align:left}td:last-child,th:last-child{text-align:right}small{color:#576760}li{margin:8px 0}@media print{body{margin:0}.screen{display:none}}</style><h1>'+e(meta.business||'Wholesale price lists')+'</h1><p>'+e('Issued '+meta.issued+(meta.until?' · Valid until '+meta.until:''))+'</p><p class="screen">Prices use the selected source column, tier discount and explicit overrides. No currency conversion is performed. CSV files are spreadsheet-safe reports.</p>'+(issues.length?'<aside class="screen"><h2>Input notices</h2><ul>'+issues.map(i=>'<li>'+e((i.source||'products')+' row '+i.row+' — '+i.message)+'</li>').join('')+'</ul></aside>':'')+lists.map(l=>'<section><h2>'+e(l.name+' · '+l.currency)+'</h2><table><thead><tr><th>SKU</th><th>Product</th><th>Unit price</th></tr></thead><tbody>'+l.lines.map(p=>'<tr><td>'+e(p.sku)+'</td><td>'+e(p.name)+'</td><td>'+e(C.formatMoney(p.price,l.precision))+'</td></tr>').join('')+'</tbody></table></section>').join('')+'<p><small>Generated locally with TierSheet 0.1.0. Check the preview before sharing.</small></p></html>';
  }
  function wrapped(ctx,text,maxWidth){
    const lines=[];let line='';
    for(const character of String(text).replace(/\s+/g,' ')){
      const candidate=line+character;
      if(ctx.measureText(candidate).width>maxWidth&&line){lines.push(line);line=character;}else line=candidate;
    }
    if(line)lines.push(line);return lines;
  }
  async function renderPDF(list,meta,progress){
    const perPage=24,total=Math.ceil(list.lines.length/perPage);
    if(!total||total>100)throw new Error('PDF export supports up to 100 pages per file. Use CSV-only export for larger lists.');
    const canvas=document.createElement('canvas');canvas.width=1240;canvas.height=1754;
    const ctx=canvas.getContext('2d',{alpha:false});
    if(!ctx)throw new Error('Canvas is unavailable; use HTML/CSV export.');
    const pages=[];
    for(let page=0;page<total;page++){
      ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle='#123b2e';ctx.fillRect(0,0,canvas.width,18);
      ctx.fillStyle='#173b2f';ctx.font='bold 42px Arial, sans-serif';
      const heading=wrapped(ctx,meta.business||'Wholesale price list',1080);
      if(heading.length>2)throw new Error('Business heading is too wide for the PDF. Shorten it.');
      heading.forEach((s,i)=>ctx.fillText(s,80,92+i*45));
      ctx.font='25px Arial, sans-serif';
      const tierHeading=list.name+' · '+list.currency;
      if(ctx.measureText(tierHeading).width>1080)throw new Error('Price-tier name is too wide for the PDF. Shorten the tier name or use CSV/HTML-only export.');
      ctx.fillText(tierHeading,80,190);
      ctx.fillStyle='#596a62';ctx.font='19px Arial, sans-serif';
      ctx.fillText((meta.issued?'Issued '+meta.issued:'')+(meta.until?'   |   Valid until '+meta.until:''),80,226);
      ctx.fillStyle='#edf3ee';ctx.fillRect(80,253,1080,42);
      ctx.fillStyle='#173b2f';ctx.font='bold 20px Arial, sans-serif';
      ctx.fillText('SKU',92,281);ctx.fillText('Product',330,281);
      ctx.textAlign='right';ctx.fillText('Unit price · '+list.currency,1148,281);ctx.textAlign='left';
      const rows=list.lines.slice(page*perPage,(page+1)*perPage);
      for(let r=0;r<rows.length;r++){
        const item=rows[r],y=326+r*55;
        ctx.fillStyle='#dfe7e1';ctx.fillRect(80,y+34,1080,1);
        ctx.fillStyle='#344a3e';ctx.font='17px Arial, sans-serif';
        const skuLines=wrapped(ctx,item.sku,225);
        ctx.font='22px Arial, sans-serif';const nameLines=wrapped(ctx,item.name,560);
        if(skuLines.length>2||nameLines.length>2)throw new Error('Text does not fit PDF rows (SKU '+item.sku+'). Shorten text or select CSV/HTML-only export.');
        ctx.font='17px Arial, sans-serif';skuLines.forEach((s,i)=>ctx.fillText(s,92,y-4+i*21));
        ctx.font='22px Arial, sans-serif';nameLines.forEach((s,i)=>ctx.fillText(s,330,y-4+i*24));
        ctx.font='22px Arial, sans-serif';const priceText=C.formatMoney(item.price,list.precision);
        if(ctx.measureText(priceText).width>235)throw new Error('Price does not fit the PDF column (SKU '+item.sku+'). Use CSV/HTML-only export.');
        ctx.textAlign='right';ctx.fillText(priceText,1148,y+4);ctx.textAlign='left';
      }
      ctx.fillStyle='#66766c';ctx.font='18px Arial, sans-serif';
      ctx.fillText('Price list · '+list.lines.length+' products',80,1679);
      ctx.textAlign='right';ctx.fillText((page+1)+' / '+total,1160,1679);ctx.textAlign='left';
      const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',0.92));
      if(!blob)throw new Error('PDF image rendering failed.');
      pages.push({jpeg:new Uint8Array(await blob.arrayBuffer()),width:canvas.width,height:canvas.height});
      if(progress)progress(page+1,total);
      await new Promise(resolve=>setTimeout(resolve,0));
    }
    return A.imagePDF(pages);
  }
  function initializeDates(){
    const d=new Date();
    byId('issued').value=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  }
  root.TierSheetUI={byId,text,download,fileText,renderIssues,mappingOptions,chosenMapping,metadata,renderPreview,htmlReport,renderPDF,initializeDates};
})(globalThis);

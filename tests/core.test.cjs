'use strict';
// All inputs here are artificial unit-test fixtures, never business evidence.
const test=require('node:test'),assert=require('node:assert/strict');
const C=require('../src/common.js'),P=require('../src/pro-core.js'),A=require('../src/archive.js');
const products=text=>C.normalizeProducts(C.parseCSV(text),{precision:2});
test('RFC-style quoting, BOM, escaped quotes, multiline fields and physical source rows',()=>{
  const t=C.parseCSV('\uFEFFSKU,Name,Price\r\n001,"Mug, large",12.50\r\n002,"Two\r\nlines ""quoted""",8.00\r\n003,Last,1.00\r\n');
  assert.equal(t.records[0].values.SKU,'001');assert.equal(t.records[1].values.Name,'Two\nlines "quoted"');assert.equal(t.records[2].row,5);
});
test('semicolon and tab formats preserve quoted separators',()=>{
  assert.equal(C.parseCSV('SKU;Name;Price\n001;"A;B";1.00').delimiter,';');
  assert.equal(C.parseCSV('SKU\tName\tPrice\n001\tA\t1.00').delimiter,'\t');
});
test('reject broken quotes, short rows, duplicate headers and invalid encoding',()=>{
  for(const text of['SKU,Name,Price\nA,"unclosed,1.00','SKU,Name,Price\nA,x"y,1.00','SKU,Name,Price\nA,"x"oops,1.00','SKU,Name,Price\nA,x','SKU,sku,Price\nA,A,1','SKU,Name,Price\nA,\uFFFD,1']){
    assert.throws(()=>C.parseCSV(text),C.InputError);
  }
});
test('prototype-shaped headers remain plain own data',()=>{
  const t=C.parseCSV('__proto__,constructor,Price\nA,B,1.00');
  assert.equal(Object.getPrototypeOf(t.records[0].values),null);assert.equal(t.records[0].values.__proto__,'A');
});
test('price arithmetic is exact, preserves precision and rejects ambiguity',()=>{
  assert.equal(C.parseMoney('999999999999.99',2),99999999999999n);
  assert.equal(C.formatMoney(1250n,2),'12.50');assert.equal(C.formatMoney(15n,0),'15');
  for(const v of['1,000','1,25','$1.25','-1','1e3','NaN','Infinity','','1.234'])assert.throws(()=>C.parseMoney(v,2));
  assert.equal(C.parseMoney('1.2300',2),123n);
  assert.throws(()=>C.parseMoney('1',-1));
});
test('discount rounding is half up at selected minor-unit precision',()=>{
  assert.equal(P.discounted(1995n,P.parseDiscount('10')),1796n);
  assert.equal(P.discounted(1n,P.parseDiscount('50')),1n);
  assert.equal(P.discounted(100n,P.parseDiscount('33.33')),67n);
  assert.equal(P.discounted(99999999999999n,0),99999999999999n);
  assert.equal(P.discounted(100n,10000),0n);
  for(const v of['-1','100.01','10.001','10%','1e2'])assert.throws(()=>P.parseDiscount(v));
});
test('duplicate, empty and case-near SKUs give row-traceable issues',()=>{
  const r=products('SKU,Name,Price\nA,One,1.00\nA,Two,2.00\na,Three,3.00\n,Blank,4.00');
  assert.ok(r.issues.some(i=>i.code==='SKU_DUPLICATE'&&i.row===3));
  assert.ok(r.issues.some(i=>i.code==='SKU_CASE'&&i.row===4));
  assert.ok(r.issues.some(i=>i.code==='SKU_EMPTY'&&i.row===5));
});
test('ambiguous price mapping is explicit, not guessed',()=>{
  const t=C.parseCSV('SKU,Name,Price,Regular price\nA,Mug,1.00,2.00');
  assert.throws(()=>C.normalizeProducts(t,{precision:2}),/multiple candidates/);
  const r=C.normalizeProducts(t,{precision:2,mapping:{sku:'SKU',name:'Name',price:'Regular price'}});
  assert.equal(r.products[0].price,200n);
});
test('specific SKU override wins; its source is retained',()=>{
  const r=P.buildPriceLists(products('SKU,Name,Price\n001,Mug,12.50\n002,Tea,8.00'),P.loadTiers(C.parseCSV('Tier,DiscountPercent\nDealer,10\nWholesale,20')),C.parseCSV('Tier,SKU,Price\nWholesale,002,6.00'),{currency:'usd'});
  assert.equal(r.hasErrors,false);assert.equal(r.lists[0].lines[0].price,1125n);assert.equal(r.lists[1].lines[1].price,600n);assert.equal(r.lists[1].lines[1].overridden,true);
  assert.match(P.auditCSV(r),/Override/);assert.equal(r.currency,'USD');
});
test('unknown, duplicate or malformed overrides block the whole output',()=>{
  for(const body of['NoTier,001,1.00','Dealer,unknown,1.00','Dealer,001,1.00\nDealer,001,2.00','Dealer,001,"1,00"']){
    const r=P.buildPriceLists(products('SKU,Name,Price\n001,Mug,12.50'),P.loadTiers(C.parseCSV('Tier,DiscountPercent\nDealer,10')),C.parseCSV('Tier,SKU,Price\n'+body),{currency:'USD'});
    assert.equal(r.hasErrors,true);assert.equal(r.lists.length,0);
  }
});
test('tier names, generated file stems and precision bounds are safe',()=>{
  assert.throws(()=>P.loadTiers(C.parseCSV('Tier,DiscountPercent\nA,10\nA,20')));
  assert.equal(C.slug('../../Dealer',0),'01-dealer');
  assert.equal(C.slug('批发客户',0),'01-price-tier');
  assert.equal(C.slug('Dealer',1),'02-dealer');
  assert.throws(()=>C.normalizeCurrency('US<script>'));
});
test('formula-like CSV text is neutralised and HTML data escaped',()=>{
  for(const v of['=HYPERLINK("bad")',' +cmd','@SUM(A1)','-1+1','\t=1'])assert.ok(C.safeCell(v).startsWith('"\''),v);
  assert.equal(C.escapeHTML('<img src=x onerror="alert(1)">'),'&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
  assert.equal(C.safeCell('Mug, "large"'),'"Mug, ""large"""');
});
test('CRC32 known external reference and ZIP filename protection',()=>{
  assert.equal(A.crc32('123456789'),0xCBF43926);
  for(const name of['../secret','x/y','../','a\\b'])assert.throws(()=>A.zip([{name,data:'x'}]));
  assert.throws(()=>A.zip([{name:'x.csv',data:'a'},{name:'x.csv',data:'b'}]));
  const z=A.zip([{name:'01-price.csv',data:C.toCSV([['SKU','Name'],['001','商品']])}],new Date('2026-10-08T00:00:00Z'));
  assert.equal(new DataView(z.buffer).getUint32(0,true),0x04034B50);
  assert.equal(new DataView(z.buffer).getUint32(z.length-22,true),0x06054B50);
});
test('PDF writer refuses incomplete JPEGs and unsafe dimensions',()=>{
  assert.throws(()=>A.imagePDF([]));assert.throws(()=>A.imagePDF([{jpeg:new Uint8Array([1,2,3]),width:1,height:1}]));
  assert.throws(()=>A.imagePDF([{jpeg:new Uint8Array([255,216,255,217]),width:-1,height:10}]));
});
test('large CSV processes all rows; no payment-related row truncation',()=>{
  const body=Array.from({length:5000},(_,i)=>String(i).padStart(6,'0')+',Product '+i+',12.50').join('\n');
  const r=products('SKU,Name,Price\n'+body);
  assert.equal(r.products.length,5000);assert.equal(r.products[4999].sku,'004999');assert.equal(r.issues.length,0);
});
test('zero prices are explicit notices; 100% discount is visibly flagged',()=>{
  const base=products('SKU,Name,Price\nA,Sample,0.00');
  assert.ok(base.issues.some(i=>i.code==='PRICE_ZERO'));
  const r=P.buildPriceLists(base,P.loadTiers(C.parseCSV('Tier,DiscountPercent\nFree,100')),null,{currency:'USD'});
  assert.equal(r.hasErrors,false);assert.ok(r.issues.some(i=>i.code==='TIER_FREE'));
});

/* Original standalone batch edition. See LICENSES.md. */
(function (root, factory) {
  const api = factory(typeof module === 'object' && module.exports ? require('./common.js') : root.TierSheetCommon);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.TierSheetPro = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (C) {
  'use strict';
  function parseDiscount(input) {
    const t = String(input).trim();
    if (!/^\d{1,3}(?:\.\d{1,2})?$/.test(t)) throw new C.InputError('DISCOUNT', 'Use a discount between 0 and 100 with at most two decimal places.');
    const units = C.parseMoney(t, 2);
    if (units > 10000n) throw new C.InputError('DISCOUNT', 'Discount cannot exceed 100%.');
    return Number(units);
  }
  function discounted(price, basisPoints) {
    if (typeof price !== 'bigint' || price < 0n || !Number.isInteger(basisPoints) || basisPoints < 0 || basisPoints > 10000) throw new C.InputError('DISCOUNT', 'Invalid discount inputs.');
    return (price * BigInt(10000 - basisPoints) + 5000n) / 10000n;
  }
  function loadTiers(table) {
    const nameKey = C.findHeader(table, ['tier'], null, 'Tier');
    const discountKey = C.findHeader(table, ['discountpercent', 'discount percent', 'discount_pct'], null, 'DiscountPercent');
    if (!table.records.length) throw new C.InputError('TIERS_EMPTY', 'Add at least one price tier.');
    if (table.records.length > 20) throw new C.InputError('TIERS_LIMIT', 'This local memory-safe version supports at most 20 tiers per export.');
    const seen = new Set();
    return table.records.map((r, index) => {
      const name = r.values[nameKey].trim();
      if (!name || name.length > 80 || /[\x00-\x1f]/.test(name)) throw new C.InputError('TIER_NAME', 'Use a tier name of 1–80 characters without control characters.', r.row);
      if (seen.has(name)) throw new C.InputError('TIER_DUPLICATE', 'Duplicate price tier: ' + name, r.row);
      seen.add(name);
      let basisPoints;
      try { basisPoints = parseDiscount(r.values[discountKey]); } catch(e) { e.row=r.row; throw e; }
      return {name, basisPoints, fileStem:C.slug(name, index), sourceRow:r.row};
    });
  }
  function buildPriceLists(productResult, tiers, overrideTable, options) {
    options = options || {};
    const currency = C.normalizeCurrency(options.currency || 'USD');
    const precision = productResult.precision;
    const issues = productResult.issues.slice();
    const tierNames = new Set(tiers.map(t=>t.name));
    const productMap = new Map(productResult.products.map(p=>[p.sku,p]));
    const overrides = new Map();
    if (overrideTable) {
      const tk = C.findHeader(overrideTable,['tier'],null,'Tier');
      const sk = C.findHeader(overrideTable,['sku'],null,'SKU');
      const pk = C.findHeader(overrideTable,['price'],null,'Price');
      for (const r of overrideTable.records) {
        const tier = r.values[tk].trim(), sku = r.values[sk].trim();
        const key = JSON.stringify([tier,sku]);
        let problem;
        if (!tierNames.has(tier)) problem = 'Unknown tier: ' + tier;
        else if (!productMap.has(sku)) problem = 'Unknown SKU: ' + sku;
        else if (overrides.has(key)) problem = 'Duplicate tier/SKU override.';
        if (problem) { issues.push({severity:'error',code:'OVERRIDE_REFERENCE',row:r.row,field:'Tier/SKU',source:'overrides',message:problem}); continue; }
        try {
          const value=C.parseMoney(r.values[pk],precision);
          overrides.set(key,value);
          if (value===0n) issues.push({severity:'warning',code:'OVERRIDE_ZERO',row:r.row,field:pk,source:'overrides',message:'Zero override price; confirm it is intended.'});
        } catch(e) {issues.push({severity:'error',code:e.code,row:r.row,field:pk,source:'overrides',message:e.message});}
      }
    }
    const hasErrors = issues.some(i=>i.severity==='error');
    const lists = hasErrors ? [] : tiers.map(t => {
      const lines = productResult.products.map(p=>{
        const key = JSON.stringify([t.name,p.sku]);
        const overridden = overrides.has(key);
        const price = overridden ? overrides.get(key) : discounted(p.price,t.basisPoints);
        return {sku:p.sku,name:p.name,price,basePrice:p.price,overridden,sourceRow:p.sourceRow};
      });
      if(t.basisPoints===10000) issues.push({severity:'warning',code:'TIER_FREE',row:t.sourceRow,field:'DiscountPercent',source:'tiers',message:'This tier discounts all non-overridden products to zero.'});
      return {...t,currency,precision,lines};
    });
    return {lists,issues,hasErrors,currency,precision,productCount:productResult.products.length,overrideCount:overrides.size};
  }
  function listCSV(list) {
    return C.toCSV([['SKU','Name','Unit price','Currency','Price tier','Price source'],...list.lines.map(p=>[p.sku,p.name,C.formatMoney(p.price,list.precision),list.currency,list.name,p.overridden?'Override':'Tier discount'])]);
  }
  function auditCSV(result) {
    return C.toCSV([['Tier','SKU','Input row','Base unit price','Final unit price','Currency','Source'],...result.lists.flatMap(t=>t.lines.map(p=>[t.name,p.sku,p.sourceRow,C.formatMoney(p.basePrice,t.precision),C.formatMoney(p.price,t.precision),t.currency,p.overridden?'Override':'Discount']))]);
  }
  return {parseDiscount,discounted,loadTiers,buildPriceLists,listCSV,auditCSV};
});

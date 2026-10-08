/* Local evidence ledger, not a live checkout or an automatic payment verifier. */
'use strict';
const fs=require('node:fs');
function summarise(events){
  const seen=new Set(),orders=new Map(),currency={},visitors=new Set(),users=new Set(),intents=new Set();
  let visitObserved=false,useObserved=false,intentObserved=false,excludedTestEvents=0;
  function amount(v){if(!Number.isSafeInteger(v)||v<0)throw new Error('Amounts must be non-negative integer minor units.');return v;}
  function wallet(code){
    if(!/^[A-Z]{3}$/.test(code||''))throw new Error('Use a three-letter currency.');
    return currency[code]||(currency[code]={paidGrossMinor:0,salesTaxMinor:0,transactionFeesMinor:0,refundNetMinor:0,otherCostMinor:0,payoutFeesMinor:0,settledReceivedMinor:0});
  }
  for(const e of events){
    if(e.mode==='test'){excludedTestEvents++;continue;}
    if(e.mode!=='live')throw new Error('Each event needs explicit mode test or live.');
    if(!e.event_id||!e.evidence_ref||!e.occurred_at||Number.isNaN(Date.parse(e.occurred_at)))throw new Error('Live events require event_id, timestamp and a traceable evidence reference.');
    if(seen.has(e.event_id))continue;seen.add(e.event_id);
    if(['visit','use','intent'].includes(e.type)){
      if(!e.subject_id)throw new Error('An observation needs a pseudonymous subject ID.');
      if(e.type==='visit'){visitObserved=true;visitors.add(e.subject_id);}
      if(e.type==='use'){useObserved=true;users.add(e.subject_id);}
      if(e.type==='intent'){intentObserved=true;intents.add(e.subject_id);}
      continue;
    }
    const w=wallet(e.currency);
    if(e.type==='payment'){
      if(!e.order_id||orders.has(e.order_id))throw new Error('Missing or duplicate live order.');
      const gross=amount(e.gross_minor),tax=amount(e.tax_minor),fee=amount(e.fee_minor);
      if(gross===0)throw new Error('Zero-value approvals or test orders are not a paid user.');
      if(tax+fee>gross)throw new Error('Tax and fees exceed gross payment.');
      orders.set(e.order_id,{currency:e.currency,gross,tax,refunded:0});
      w.paidGrossMinor+=gross;w.salesTaxMinor+=tax;w.transactionFeesMinor+=fee;
    }else if(e.type==='refund'){
      const order=orders.get(e.order_id),gross=amount(e.gross_minor),tax=amount(e.tax_minor),extra=amount(e.extra_fee_minor);
      if(!order||order.currency!==e.currency||tax>gross||order.refunded+gross>order.gross)throw new Error('Refund does not reconcile to a recorded payment.');
      if(tax>order.tax)throw new Error('Refunded tax exceeds original tax.');
      order.refunded+=gross;order.tax-=tax;w.refundNetMinor+=gross-tax;w.transactionFeesMinor+=extra;
    }else if(e.type==='cost'){w.otherCostMinor+=amount(e.amount_minor);}
    else if(e.type==='settlement'){w.settledReceivedMinor+=amount(e.received_minor);w.payoutFeesMinor+=amount(e.fee_minor);}
    else throw new Error('Unknown event type.');
  }
  for(const w of Object.values(currency)){
    w.accrualGrossProfitMinor=w.paidGrossMinor-w.salesTaxMinor-w.transactionFeesMinor-w.refundNetMinor-w.otherCostMinor-w.payoutFeesMinor;
  }
  return{
    evidenceStatus:'Only recorded, supplied evidence is counted; this tool does not independently verify receipts.',
    uniqueVisitors:visitObserved?visitors.size:null,
    actualUsers:useObserved?users.size:null,
    statedIntentCount:intentObserved?intents.size:null,
    successfulPaymentCount:orders.size,
    refundedOrders:[...orders.values()].filter(o=>o.refunded>0).length,
    excludedTestEvents,
    currency,
    conversionRate:visitObserved&&visitors.size?orders.size/visitors.size:null,
    noExchangeConversion:true
  };
}
module.exports={summarise};
if(require.main===module){
  const input=process.argv[2];
  if(!input){console.error('Usage: node operations/ledger.cjs PATH_TO_PRIVATE_JSONL');process.exitCode=1;}
  else{
    try{const lines=fs.readFileSync(input,'utf8').split(/\r?\n/).filter(l=>l.trim());const events=lines.map(l=>JSON.parse(l));console.log(JSON.stringify(summarise(events),null,2));}
    catch(e){console.error(e.message);process.exitCode=1;}
  }
}

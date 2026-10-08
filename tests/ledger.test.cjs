'use strict';
// Synthetic in-memory scenarios below do NOT constitute real orders.
const test=require('node:test'),assert=require('node:assert/strict'),{summarise}=require('../operations/ledger.cjs');
function fixture(event_id,type,rest){return{event_id,type,mode:'live',evidence_ref:'UNIT-TEST-ONLY-NOT-REAL',occurred_at:'2026-10-08T00:00:00Z',...rest};}
test('empty ledger preserves unknown traffic and zero payments',()=>{
  const r=summarise([]);assert.equal(r.uniqueVisitors,null);assert.equal(r.actualUsers,null);assert.equal(r.successfulPaymentCount,0);assert.deepEqual(r.currency,{});
});
test('test payments and platform zero-value approvals never count as paid users',()=>{
  const r=summarise([{mode:'test',type:'payment',gross_minor:1000},{mode:'test',type:'visit'}]);assert.equal(r.successfulPaymentCount,0);assert.equal(r.uniqueVisitors,null);assert.equal(r.excludedTestEvents,2);
  assert.throws(()=>summarise([fixture('zero','payment',{order_id:'Z',currency:'USD',gross_minor:0,tax_minor:0,fee_minor:0})]),/Zero-value/);
});
test('replay event is idempotent, duplicate order is rejected',()=>{
  const a=fixture('p1','payment',{order_id:'O1',currency:'USD',gross_minor:2280,tax_minor:380,fee_minor:129});
  assert.equal(summarise([a,a]).successfulPaymentCount,1);
  assert.throws(()=>summarise([a,{...a,event_id:'p2'}]),/duplicate live order/);
});
test('profit and settled cash remain distinct; fees/refund cost included',()=>{
  const r=summarise([
    fixture('p','payment',{order_id:'O',currency:'USD',gross_minor:2280,tax_minor:380,fee_minor:129}),
    fixture('r','refund',{order_id:'O',currency:'USD',gross_minor:1140,tax_minor:190,extra_fee_minor:0}),
    fixture('c','cost',{currency:'USD',amount_minor:100}),
    fixture('s','settlement',{currency:'USD',received_minor:500,fee_minor:70})
  ]);
  assert.equal(r.currency.USD.accrualGrossProfitMinor,651);assert.equal(r.currency.USD.settledReceivedMinor,500);assert.equal(r.refundedOrders,1);
});
test('currencies are never silently exchanged or summed',()=>{
  const r=summarise([fixture('d','cost',{currency:'USD',amount_minor:100}),fixture('y','cost',{currency:'CNY',amount_minor:100})]);
  assert.equal(r.currency.USD.accrualGrossProfitMinor,-100);assert.equal(r.currency.CNY.accrualGrossProfitMinor,-100);assert.equal(r.noExchangeConversion,true);
});
test('missing evidence and excessive refunds are rejected',()=>{
  assert.throws(()=>summarise([{mode:'live',type:'payment'}]),/evidence/);
  assert.throws(()=>summarise([fixture('r','refund',{order_id:'none',currency:'USD',gross_minor:100,tax_minor:0,extra_fee_minor:0})]));
});

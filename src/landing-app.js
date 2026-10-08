/* Public landing-page metadata. Never contains an API secret or confirms a payment. */
(function(){
 'use strict';
 const cfg=globalThis.TierSheetConfig||{},email=cfg.supportEmail||'';
 const identity=cfg.sellerName&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
 if(identity){
  document.getElementById('sellerDetails').textContent='Seller: '+cfg.sellerName;
  const link=document.createElement('a');link.href='mailto:'+email;link.textContent=email;
  const support=document.getElementById('supportDetails');support.textContent='Support and product feedback: ';support.appendChild(link);
 }
 try{
  const url=new URL(cfg.checkoutUrl);
  if(identity&&cfg.paymentMode==='live'&&url.protocol==='https:'&&!url.username&&!url.password&&!url.port&&['creem.io','www.creem.io','checkout.creem.io','l.creem.io'].includes(url.hostname)){
   const link=document.getElementById('buyLink');link.href=url.href;link.hidden=false;
   document.getElementById('purchaseStatus').textContent='$19 one-time. Check your total, any applicable tax and delivery details on Creem before paying.';
  }
 }catch(e){/* No configured checkout: keep sales closed. */}
})();

/* Original archive/PDF writer; dual-licensed shared code. See LICENSES.md. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;else root.TierSheetArchive=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const encoder=new TextEncoder();
  function bytes(v){return typeof v==='string'?encoder.encode(v):v instanceof Uint8Array?v:new Uint8Array(v);}
  function concat(parts){
    const size=parts.reduce((n,p)=>n+p.length,0),out=new Uint8Array(size);
    let cursor=0;for(const p of parts){out.set(p,cursor);cursor+=p.length;}return out;
  }
  const crcTable=Array.from({length:256},(_,n)=>{for(let i=0;i<8;i++)n=(n&1)?0xEDB88320^(n>>>1):n>>>1;return n>>>0;});
  function crc32(data){let c=0xFFFFFFFF;for(const b of bytes(data))c=crcTable[(c^b)&255]^(c>>>8);return(c^0xFFFFFFFF)>>>0;}
  function zip(files,date){
    if(!Array.isArray(files)||!files.length||files.length>65535)throw new Error('ZIP file count is invalid.');
    date=date||new Date();
    const year=Math.max(1980,Math.min(2107,date.getFullYear()));
    const day=((year-1980)<<9)|((date.getMonth()+1)<<5)|date.getDate();
    const time=(date.getHours()<<11)|(date.getMinutes()<<5)|Math.floor(date.getSeconds()/2);
    const local=[],central=[],names=new Set();let offset=0;
    for(const f of files){
      if(typeof f.name!=='string'||!/^[-a-zA-Z0-9_.]+$/.test(f.name)||f.name.includes('..')||f.name.length>120||names.has(f.name))throw new Error('Unsafe or duplicate ZIP filename.');
      names.add(f.name);
      const name=bytes(f.name),data=bytes(f.data),crc=crc32(data);
      if(data.length>0xFFFFFFFF||offset>0xFFFFFFFF)throw new Error('ZIP exceeds supported size.');
      const l=new Uint8Array(30),lv=new DataView(l.buffer);
      lv.setUint32(0,0x04034B50,true);lv.setUint16(4,20,true);lv.setUint16(6,0x800,true);
      lv.setUint16(10,time,true);lv.setUint16(12,day,true);lv.setUint32(14,crc,true);
      lv.setUint32(18,data.length,true);lv.setUint32(22,data.length,true);lv.setUint16(26,name.length,true);
      local.push(l,name,data);
      const c=new Uint8Array(46),cv=new DataView(c.buffer);
      cv.setUint32(0,0x02014B50,true);cv.setUint16(4,20,true);cv.setUint16(6,20,true);cv.setUint16(8,0x800,true);
      cv.setUint16(12,time,true);cv.setUint16(14,day,true);cv.setUint32(16,crc,true);
      cv.setUint32(20,data.length,true);cv.setUint32(24,data.length,true);cv.setUint16(28,name.length,true);
      cv.setUint32(42,offset,true);central.push(c,name);offset+=l.length+name.length+data.length;
    }
    const directory=concat(central),end=new Uint8Array(22),v=new DataView(end.buffer);
    v.setUint32(0,0x06054B50,true);v.setUint16(8,files.length,true);v.setUint16(10,files.length,true);
    v.setUint32(12,directory.length,true);v.setUint32(16,offset,true);
    return concat([...local,directory,end]);
  }
  function imagePDF(pages){
    if(!Array.isArray(pages)||!pages.length||pages.length>100)throw new Error('PDF needs 1–100 pages.');
    const objects=[];
    objects[1]=bytes('<< /Type /Catalog /Pages 2 0 R >>');
    objects[2]=bytes('<< /Type /Pages /Count '+pages.length+' /Kids ['+pages.map((_,i)=>(3+3*i)+' 0 R').join(' ')+'] >>');
    pages.forEach((p,i)=>{
      const jpeg=bytes(p.jpeg);
      if(jpeg.length<4||jpeg[0]!==255||jpeg[1]!==216||jpeg[jpeg.length-2]!==255||jpeg[jpeg.length-1]!==217)throw new Error('PDF page is not a complete JPEG.');
      if(!Number.isInteger(p.width)||!Number.isInteger(p.height)||p.width<1||p.height<1||p.width>10000||p.height>10000)throw new Error('Invalid PDF image dimensions.');
      const page=3+3*i,img=page+1,stream=page+2;
      objects[page]=bytes('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Im0 '+img+' 0 R >> >> /Contents '+stream+' 0 R >>');
      objects[img]=concat([bytes('<< /Type /XObject /Subtype /Image /Width '+p.width+' /Height '+p.height+' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+jpeg.length+' >>\nstream\n'),jpeg,bytes('\nendstream')]);
      const content=bytes('q\n595.28 0 0 841.89 0 0 cm\n/Im0 Do\nQ\n');
      objects[stream]=concat([bytes('<< /Length '+content.length+' >>\nstream\n'),content,bytes('endstream')]);
    });
    const pieces=[bytes('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n')],offsets=[0];let total=pieces[0].length;
    for(let n=1;n<objects.length;n++){
      const piece=concat([bytes(n+' 0 obj\n'),objects[n],bytes('\nendobj\n')]);
      offsets[n]=total;total+=piece.length;pieces.push(piece);
    }
    const start=total;
    const xref='xref\n0 '+objects.length+'\n0000000000 65535 f \n'+offsets.slice(1).map(n=>String(n).padStart(10,'0')+' 00000 n \n').join('')+'trailer\n<< /Size '+objects.length+' /Root 1 0 R >>\nstartxref\n'+start+'\n%%EOF\n';
    pieces.push(bytes(xref));return concat(pieces);
  }
  return{bytes,concat,crc32,zip,imagePDF};
});

/* Build self-contained offline HTML editions and a free WordPress package. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),out=path.join(root,'dist');
fs.mkdirSync(out,{recursive:true});
function inline(entry){
  let html=fs.readFileSync(path.join(root,'web',entry),'utf8'),hashes=[];
  const css=fs.readFileSync(path.join(root,'web/styles.css'),'utf8');
  const styleHash=crypto.createHash('sha256').update(css).digest('base64');
  html=html.replace('<link rel="stylesheet" href="styles.css">','<style>'+css+'</style>');
  html=html.replace(/<script src="([^"]+)"><\/script>/g,(_,src)=>{
    const file=path.resolve(root,'web',src);
    if(!file.startsWith(path.join(root,'src')+path.sep))throw new Error('Unexpected script path.');
    const js=fs.readFileSync(file,'utf8').replace(/<\/script/gi,'<\\/script');
    hashes.push("'sha256-"+crypto.createHash('sha256').update(js).digest('base64')+"'");
    return '<script>'+js+'</script>';
  });
  html=html.replace("script-src 'self'","script-src "+hashes.join(' ')).replace("style-src 'self'","style-src 'sha256-"+styleHash+"'");
  return html;
}
fs.writeFileSync(path.join(out,'index.html'),inline('pro.html'));
fs.writeFileSync(path.join(out,'free.html'),inline('free.html'));
fs.copyFileSync(path.join(root,'web/legal.html'),path.join(out,'legal.html'));
const pluginOut=path.join(out,'tiersheet-price-list');
fs.mkdirSync(pluginOut,{recursive:true});
fs.writeFileSync(path.join(pluginOut,'free.html'),inline('free.html'));
for(const name of['tiersheet-price-list.php','readme.txt','COPYING'])fs.copyFileSync(path.join(root,'wordpress/tiersheet-price-list',name),path.join(pluginOut,name));
const sourceOut=path.join(pluginOut,'source');fs.mkdirSync(sourceOut,{recursive:true});
for(const name of['common.js','archive.js','ui-common.js','free-config.js','free-app.js'])fs.copyFileSync(path.join(root,'src',name),path.join(sourceOut,name));
fs.copyFileSync(path.join(root,'web/free.html'),path.join(sourceOut,'free.html'));
fs.copyFileSync(path.join(root,'web/styles.css'),path.join(sourceOut,'styles.css'));
fs.writeFileSync(path.join(sourceOut,'BUILD.md'),'# Free edition source\n\nThese original, readable JavaScript sources are GPL-2.0-or-later. free.html in the package is an unminified self-contained build. No batch edition code is included. Rebuild with scripts/build.cjs in the project repository; no third-party dependency is needed.\n');
fs.copyFileSync(path.join(root,'LICENSES.md'),path.join(pluginOut,'LICENSES.md'));
const siteOut=path.join(out,'site');fs.mkdirSync(siteOut,{recursive:true});
fs.writeFileSync(path.join(siteOut,'index.html'),inline('landing.html'));
fs.writeFileSync(path.join(siteOut,'free.html'),inline('free.html'));
fs.copyFileSync(path.join(root,'web/legal.html'),path.join(siteOut,'legal.html'));
const screenshots=path.join(root,'docs/screenshots');
if(fs.existsSync(screenshots)){
 fs.mkdirSync(path.join(siteOut,'screenshots'),{recursive:true});
 for(const name of['tiersheet-desktop.png','tiersheet-free-desktop.png'])if(fs.existsSync(path.join(screenshots,name)))fs.copyFileSync(path.join(screenshots,name),path.join(siteOut,'screenshots',name));
}
console.log('Built offline editions, the free WordPress package and dist/site publication draft.');

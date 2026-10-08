/* Optional development-only browser setup. Nothing here ships in either edition. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createReadStream, createWriteStream} from 'node:fs';
import {createBrotliDecompress} from 'node:zlib';
import {pipeline} from 'node:stream/promises';
import {execFileSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..');
const source=path.join(root,'tooling/node_modules/@sparticuz/chromium/bin');
const dest=path.join(root,'tooling/chromium');
await fs.mkdir(dest,{recursive:true});
for(const name of ['chromium','fonts.tar','swiftshader.tar']){
  const output=path.join(dest,name);
  await pipeline(createReadStream(path.join(source,name+'.br')),createBrotliDecompress(),createWriteStream(output));
  if(name.endsWith('.tar')){
    // Python's data filter rejects path traversal and ignores archive ownership.
    execFileSync('python3',['-c',"import sys,tarfile; tarfile.open(sys.argv[1]).extractall(sys.argv[2],filter='data')",output,dest]);
    await fs.unlink(output);
  }
}
await fs.chmod(path.join(dest,'chromium'),0o700);
console.log('Prepared development-only Chromium at tooling/chromium/chromium.');

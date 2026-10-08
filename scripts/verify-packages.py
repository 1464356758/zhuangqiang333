"""Check the actual release files and ensure no private/tooling content ships."""
from pathlib import Path
from zipfile import ZipFile
import hashlib, json
ROOT = Path(__file__).resolve().parents[1]
checks = json.loads((ROOT/'release/checksums.json').read_text())
results=[]
for entry in checks:
    p=ROOT/'release'/entry['file']
    assert hashlib.sha256(p.read_bytes()).hexdigest()==entry['sha256']
    with ZipFile(p) as z:
        assert z.testzip() is None
        names=z.namelist()
        assert len(names)==len(set(names))
        assert not any(n.startswith('/') or '..' in n.split('/') for n in names)
        assert not any(x in n.split('/') for n in names for x in ('private','node_modules','tooling','wp-tooling'))
        if 'free-wordpress' in p.name:
            assert 'tiersheet-price-list/COPYING' in names
            assert 'GNU GENERAL PUBLIC LICENSE' in z.read('tiersheet-price-list/COPYING').decode()
            assert not any(n.endswith(('pro-core.js','pro-app.js','config.js')) and not n.endswith('free-config.js') for n in names)
            html=z.read('tiersheet-price-list/free.html').decode()
            assert 'TierSheetPro' not in html and 'paymentMode' not in html
            assert 'connect-src' in html and "connect-src 'none'" in html
            assert 'Tested up to: 7.1.3' in z.read('tiersheet-price-list/readme.txt').decode()
        if 'public-site' in p.name:
            assert set(('index.html','free.html','legal.html','screenshots/tiersheet-desktop.png')).issubset(names)
            assert 'Sales are not open' in z.read('index.html').decode()
            assert 'TierSheetPro' not in z.read('free.html').decode()
        if 'project-' in p.name:
            assert z.read('tiersheet-project/operations/actual-events.jsonl').strip()==b''
            assert 'tiersheet-project/DEPLOY.md' in names
            assert 'tiersheet-project/scripts/wordpress-qa.cjs' in names
    results.append({'file':p.name,'sha256':entry['sha256'],'status':'passed'})
out=ROOT/'artifacts/package-validation.json'
out.write_text(json.dumps(results,indent=2)+'\n')
print('Verified all four release ZIPs, hashes, GPL/source split and private/tooling exclusion.')

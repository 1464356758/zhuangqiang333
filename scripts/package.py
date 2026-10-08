"""Create source, standalone, and free WordPress ZIPs; no uploads."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import hashlib
import json
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "release"
OUT.mkdir(exist_ok=True)
def archive(name, files):
    with ZipFile(OUT / name, "w", ZIP_DEFLATED) as z:
        for source, relative in files:
            z.write(source, relative)
    return {"file": name, "sha256": hashlib.sha256((OUT / name).read_bytes()).hexdigest()}
results = []
results.append(archive("tiersheet-standalone-0.1.0.zip", [(ROOT/"dist"/p, p) for p in ("index.html","legal.html")] + [(ROOT/p, p) for p in ("TUTORIAL.md","LICENSES.md")]))
plugin = ROOT/"dist/tiersheet-price-list"
results.append(archive("tiersheet-free-wordpress-0.1.0.zip", [(p, "tiersheet-price-list/"+p.relative_to(plugin).as_posix()) for p in sorted(plugin.rglob("*")) if p.is_file()]))
site = ROOT/"dist/site"
results.append(archive("tiersheet-public-site-0.1.0.zip", [(p, p.relative_to(site).as_posix()) for p in sorted(site.rglob("*")) if p.is_file()]))
allowed = ("src","web","scripts","tests","research","operations","wordpress","dist","docs")
files = [(p, "tiersheet-project/"+p.name) for p in sorted(ROOT.glob("*")) if p.is_file()]
for folder in allowed:
    for p in sorted((ROOT/folder).rglob("*")):
        if p.is_file() and not any(x in p.parts for x in ("private","node_modules")):
            files.append((p, "tiersheet-project/"+p.relative_to(ROOT).as_posix()))
results.append(archive("tiersheet-project-0.1.0.zip", files))
(OUT/"checksums.json").write_text(json.dumps(results, indent=2)+"\n", encoding="utf-8")
print(json.dumps(results, indent=2))

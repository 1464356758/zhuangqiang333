"""Validate actual browser downloads. Synthetic fixtures are never income evidence."""
from pathlib import Path
from zipfile import ZipFile
from io import BytesIO, StringIO
import csv, json
from pypdf import PdfReader
ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "artifacts/browser"
OUT = ROOT / "artifacts/pdf"
OUT.mkdir(parents=True, exist_ok=True)
def readcsv(data):
    return list(csv.DictReader(StringIO(data.decode("utf-8-sig"))))
def verify_pdf(data, pages):
    p = PdfReader(BytesIO(data), strict=True)
    assert len(p.pages) == pages
    for page in p.pages:
        assert abs(float(page.mediabox.width)-595.28) < .02
        assert abs(float(page.mediabox.height)-841.89) < .02
        image = page["/Resources"]["/XObject"]["/Im0"]
        assert image["/Width"] == 1240 and image["/Height"] == 1754
        assert image["/Filter"] == "/DCTDecode"
    return len(p.pages)
reports = []
with ZipFile(ART/"sample-batch.zip") as z:
    assert z.testzip() is None
    names = z.namelist()
    assert len(names) == 9 and len(set(names)) == 9
    assert not any(".." in n or "/" in n or "\\" in n for n in names)
    manifest = json.loads(z.read("manifest.json"))
    assert manifest["sampleData"] is True
    assert manifest["products"] == 5 and len(manifest["tiers"]) == 3
    expected = {"Retail":["12.50","8.00","19.95","10.00","4.25"],
                "Dealer":["11.25","7.20","17.96","9.00","3.83"],
                "Wholesale":["10.00","6.00","15.96","8.00","3.40"]}
    for tier in manifest["tiers"]:
        stem = tier["fileStem"]
        rows = readcsv(z.read(stem+".csv"))
        assert [r["Unit price"] for r in rows] == expected[tier["name"]]
        data = z.read(stem+".pdf")
        verify_pdf(data, 1)
        (OUT/(stem+".pdf")).write_bytes(data)
    audit = readcsv(z.read("price-source-audit.csv"))
    assert len(audit) == 15
    override = [r for r in audit if r["SKU"] == "TEA-02" and r["Tier"] == "Wholesale"]
    assert len(override) == 1 and override[0]["Source"] == "Override"
    reports.append("ZIP CRC, 9 files, all 15 prices, override audit and 3 A4 PDFs verified")
with ZipFile(ART/"synthetic-long-csv-only.zip") as z:
    assert z.testzip() is None
    assert not any(n.endswith('.pdf') for n in z.namelist())
    assert json.loads(z.read("manifest.json"))["pdf"] == "excluded by user"
    reports.append("Long-name CSV-only fallback produces a complete valid ZIP")
with ZipFile(ART/"sample-templates.zip") as z:
    assert z.testzip() is None and len(z.namelist()) == 4
    assert "SAMPLE DATA ONLY" in z.read("README.txt").decode()
assert len(readcsv((ART/"synthetic-free-101.csv").read_bytes())) == 101
verify_pdf((ART/"synthetic-free-101.pdf").read_bytes(), 5)
reports.append("Free edition includes all 101 records and 5 PDF pages")
(OUT/"validation.json").write_text(json.dumps({"fixtureMode":"synthetic; not customer evidence","checks":reports},indent=2)+"\n")
print("\n".join(reports))

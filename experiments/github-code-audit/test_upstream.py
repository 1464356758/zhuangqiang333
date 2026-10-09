"""Local integration checks against unchanged MIT-licensed invoice2data source.

All PDFs are synthetic fixtures, never orders, invoices submitted for payment,
or commercial evidence. No extraction result is mocked. The socket guard
rejects Python socket connections made during the tests; it is not an OS sandbox.
"""
from pathlib import Path
from tempfile import TemporaryDirectory
import logging
import socket
import sys
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT / 'invoice2data' / 'src'))

from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.cidfonts import UnicodeCIDFont
from reportlab.pdfgen.canvas import Canvas
from invoice2data import extract_data, NoTemplateFoundError, RequiredFieldsMissingError
from invoice2data.extract.invoice_template import InvoiceTemplate
from invoice2data.input import pdfium

logging.getLogger('invoice2data').setLevel(logging.CRITICAL)


def template(chinese=False):
    if chinese:
        vendor = '测试供应商'
        fields = {
            'invoice_number': r'账单编号:\s*(DEMO-\d+)',
            'date': r'日期:\s*(\d{4}-\d{2}-\d{2})',
            'amount': r'合计:\s*([\d.,]+)',
        }
    else:
        vendor = 'Demo Vendor Test'
        fields = {
            'invoice_number': r'Invoice No:\s*(DEMO-\d+)',
            'date': r'Date:\s*(\d{4}-\d{2}-\d{2})',
            'amount': r'Total:\s*([\d.,]+)',
        }
    return InvoiceTemplate({
        'issuer': vendor,
        'keywords': [vendor],
        'exclude_keywords': [],
        'template_name': 'synthetic-chinese' if chinese else 'synthetic-english',
        'fields': fields,
        'options': {'currency': 'CNY', 'date_formats': ['%Y-%m-%d']},
    })


def create_pdf(path, lines, chinese=False):
    font = 'Helvetica'
    if chinese:
        font = 'STSong-Light'
        if font not in pdfmetrics.getRegisteredFontNames():
            pdfmetrics.registerFont(UnicodeCIDFont(font))
    c = Canvas(str(path))
    c.setTitle('Synthetic test fixture - NOT A REAL INVOICE')
    c.setFont('Helvetica', 12)
    c.drawString(48, 790, 'SYNTHETIC TEST ONLY - NO REAL TRANSACTION')
    c.setFont(font, 12)
    for index, line in enumerate(lines):
        c.drawString(48, 755 - 24 * index, line)
    c.save()


class UpstreamIntegrationChecks(unittest.TestCase):
    def setUp(self):
        self.temp = TemporaryDirectory(prefix='invoice2data_source_audit_')
        self.addCleanup(self.temp.cleanup)
        self.pdf = Path(self.temp.name) / 'synthetic.pdf'
        self.network_guard = patch.object(
            socket.socket, 'connect',
            side_effect=AssertionError('Network access forbidden in this local test'),
        )
        self.network_guard.start()
        self.addCleanup(self.network_guard.stop)

    def extract(self, chinese=False):
        return extract_data(
            str(self.pdf), templates=[template(chinese)], input_module=pdfium,
            ai_fallback=False, raise_on_error=True,
        )

    def test_text_pdf_and_thousands_separator(self):
        create_pdf(self.pdf, [
            'Demo Vendor Test', 'Invoice No: DEMO-001',
            'Date: 2026-10-09', 'Total: 1,234.56',
        ])
        result = self.extract()
        self.assertEqual(result['invoice_number'], 'DEMO-001')
        self.assertEqual(result['date'].isoformat(), '2026-10-09T00:00:00')
        self.assertEqual(result['amount'], 1234.56)
        self.assertEqual(result['currency'], 'CNY')

    def test_chinese_text_pdf_with_explicit_template(self):
        create_pdf(self.pdf, [
            '测试供应商', '账单编号: DEMO-002',
            '日期: 2026-10-09', '合计: 88.50',
        ], chinese=True)
        result = self.extract(chinese=True)
        self.assertEqual(result['invoice_number'], 'DEMO-002')
        self.assertEqual(result['amount'], 88.50)
        self.assertEqual(result['currency'], 'CNY')

    def test_missing_required_amount_is_reported(self):
        create_pdf(self.pdf, [
            'Demo Vendor Test', 'Invoice No: DEMO-003', 'Date: 2026-10-09',
        ])
        with self.assertRaises(RequiredFieldsMissingError):
            self.extract()

    def test_unknown_vendor_is_reported(self):
        create_pdf(self.pdf, [
            'Unmatched Vendor', 'Invoice No: DEMO-004',
            'Date: 2026-10-09', 'Total: 42.00',
        ])
        with self.assertRaises(NoTemplateFoundError):
            self.extract()


if __name__ == '__main__':
    unittest.main(verbosity=2)

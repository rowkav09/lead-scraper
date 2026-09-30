import csv
import importlib.util
import sys
import tempfile
import types
import unittest
from dataclasses import fields
from pathlib import Path

# Export tests need no installed browser or network. Only its unused import is stubbed.
try:
    import playwright.sync_api
except ImportError:
    sys.modules['playwright'] = types.ModuleType('playwright')
    stub = types.ModuleType('playwright.sync_api')
    stub.sync_playwright = None
    stub.Page = object
    sys.modules['playwright.sync_api'] = stub
spec = importlib.util.spec_from_file_location('scraper', Path(__file__).parents[1] / 'google_maps_scraper.py')
scraper = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = scraper
spec.loader.exec_module(scraper)

class ExportTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.path = Path(self.temp.name) / 'out.csv'
    def rows(self):
        with self.path.open(newline='') as f:
            reader = csv.DictReader(f)
            return reader.fieldnames, list(reader)
    def test_single_result_retains_every_field(self):
        scraper.save_places_to_csv([scraper.Place(name='Acme', phone_number='020 0001')], str(self.path))
        header, rows = self.rows()
        self.assertEqual(header, [f.name for f in fields(scraper.Place)])
        self.assertEqual(rows[0]['phone_number'], '020 0001')
    def test_append_runs_keep_full_schema_and_alignment(self):
        scraper.save_places_to_csv([scraper.Place(name=f'A{i}', phone_number=f'020 {i}') for i in range(2)], str(self.path))
        scraper.save_places_to_csv([scraper.Place(name=f'B{i}', website=f'b{i}.example', phone_number=f'030 {i}') for i in range(2)], str(self.path), append=True)
        header, rows = self.rows()
        self.assertEqual(header, [f.name for f in fields(scraper.Place)])
        self.assertEqual(len(rows), 4)
        self.assertEqual(rows[2]['website'], 'b0.example')
        self.assertEqual(rows[2]['phone_number'], '030 0')
        self.assertNotIn(None, rows[2])
    def test_legacy_subset_header_refuses_append_without_changing_file(self):
        self.path.write_text('name,phone_number\nOld,020 001\n')
        before = self.path.read_bytes()
        with self.assertRaises(ValueError):
            scraper.save_places_to_csv([scraper.Place(name='New', website='new.example')], str(self.path), append=True)
        self.assertEqual(self.path.read_bytes(), before)

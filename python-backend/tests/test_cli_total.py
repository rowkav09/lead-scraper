import contextlib
import importlib.util
import io
import sys
import types
import unittest
from pathlib import Path
from unittest.mock import patch

try:
    import playwright.sync_api
except ImportError:
    sys.modules['playwright'] = types.ModuleType('playwright')
    stub = types.ModuleType('playwright.sync_api')
    stub.sync_playwright = None
    stub.Page = object
    sys.modules['playwright.sync_api'] = stub

spec = importlib.util.spec_from_file_location('scraper_cli', Path(__file__).parents[1] / 'google_maps_scraper.py')
scraper = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = scraper
spec.loader.exec_module(scraper)


class CliTotalTests(unittest.TestCase):
    def test_nonpositive_total_is_rejected_before_scraping(self):
        for total in ('0', '-1', '-20'):
            with self.subTest(total=total):
                stderr = io.StringIO()
                with patch.object(sys, 'argv', ['scraper', '-s', 'Plumber in London', '-t', total]), \
                     patch.object(scraper, 'scrape_places', return_value=[]) as scrape, \
                     patch.object(scraper, 'save_places_to_csv') as save, \
                     contextlib.redirect_stderr(stderr):
                    with self.assertRaises(SystemExit) as error:
                        scraper.main()
                self.assertEqual(error.exception.code, 2)
                self.assertIn('total must be a positive integer', stderr.getvalue())
                scrape.assert_not_called()
                save.assert_not_called()

    def test_positive_total_reaches_scraper_unchanged(self):
        with patch.object(sys, 'argv', ['scraper', '-s', 'Plumber in London', '-t', '5']), \
             patch.object(scraper, 'scrape_places', return_value=[]) as scrape, \
             patch.object(scraper, 'save_places_to_csv'):
            scraper.main()
        scrape.assert_called_once_with('Plumber in London', 5)


if __name__ == '__main__':
    unittest.main()

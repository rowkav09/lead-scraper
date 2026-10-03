import importlib.util
import sys
import types
import unittest
from pathlib import Path

try:
    import playwright.sync_api
except ImportError:
    sys.modules['playwright'] = types.ModuleType('playwright')
    stub = types.ModuleType('playwright.sync_api')
    stub.sync_playwright = None
    stub.Page = object
    sys.modules['playwright.sync_api'] = stub
spec = importlib.util.spec_from_file_location('scraper_scroll', Path(__file__).parents[1] / 'google_maps_scraper.py')
scraper = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = scraper
spec.loader.exec_module(scraper)


class FakePage:
    """Results list that loads 5 more items a moment after each scroll, up to `available`."""
    def __init__(self, available, start=5, delay_ms=1500):
        self.available, self.loaded, self.delay_ms = available, start, delay_ms
        self.pending_at = None
        self.clock = 0
        self.mouse = types.SimpleNamespace(wheel=self._wheel)

    def _wheel(self, x, y):
        if self.loaded < self.available:
            self.pending_at = self.clock + self.delay_ms

    def _tick(self):
        if self.pending_at is not None and self.clock >= self.pending_at:
            self.loaded = min(self.available, self.loaded + 5)
            self.pending_at = None

    def wait_for_selector(self, *a, **k):
        pass

    def wait_for_timeout(self, ms):
        self.clock += ms
        self._tick()

    def locator(self, xpath):
        page = self
        return types.SimpleNamespace(count=lambda: page.loaded)


class ScrollTests(unittest.TestCase):
    def test_keeps_scrolling_while_results_load_slowly(self):
        page = FakePage(available=20)
        self.assertEqual(scraper.scroll_results(page, 20), 20)

    def test_stops_when_the_list_really_ends(self):
        page = FakePage(available=12)
        self.assertEqual(scraper.scroll_results(page, 50), 12)

    def test_stops_once_enough_are_loaded(self):
        page = FakePage(available=100)
        self.assertGreaterEqual(scraper.scroll_results(page, 10), 10)


if __name__ == '__main__':
    unittest.main()

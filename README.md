# Lead Scraper

Lead Scraper is a full-stack web application for generating business leads by scraping publicly available data based on a business category and geographic location.

The project consists of a Next.js frontend and a Python-based scraping backend.

---

## Overview

Lead Scraper allows users to:

- Enter a business category (e.g. plumbers, cafés, car washes)
- Enter a target location
- Scrape publicly available business listings
- View results in a structured table
- Export results as a CSV file

The scraper does not rely on official APIs.

---

## Tech Stack

Frontend:
- Next.js
- React
- Tailwind CSS

Backend:
- Python
- requests
- beautifulsoup4

---

## Architecture

The frontend handles user input, displays results, and manages CSV export.

The backend performs the scraping logic and processes raw data into structured lead information before returning it to the frontend.

---

## Notes

- The included scraper is basic and may require improvements for production use.
- Large-scale scraping may require headless browsers (e.g. Selenium or Playwright).
- Proxies and anti-bot handling may be necessary depending on usage.

---

## Future Improvements

- Additional data sources
- Database integration
- Authentication system
- API endpoints
- Improved validation and error handling

---

## License

GPL-3.0 License. See the LICENSE file for details.

---

## Author

rowkav09

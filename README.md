# Lead Scraper Web App

A professional web app for scraping business leads from Google Maps (no API, direct scraping). Enter a company category and area to get a table of results and download as CSV. Built with Next.js, Tailwind CSS, and a Python backend.

## Features
- Input company category and area
- Scrapes Google Maps (no API)
- Results in a table and downloadable CSV
- Clean, professional UI
- Ready for Vercel deployment
- Python backend for scraping (future: Facebook, more)

## Local Development
1. Install Node.js, npm, and Python 3.13+
2. Install dependencies:
	```
	npm install
	```
3. Install Python packages:
	```
	pip install requests beautifulsoup4
	```
4. Run the dev server:
	```
	npm run dev
	```
5. Open http://localhost:3000

## Deploying to Vercel
- Deploy as a Next.js app
- Ensure Python is available in your deployment environment (Vercel serverless functions may require custom setup or use a separate backend for Python)

## Notes
- The Google Maps scraper is a placeholder. For real scraping, use Selenium/Playwright and handle anti-bot measures.
- Extendable for Facebook and other sources.

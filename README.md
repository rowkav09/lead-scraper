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


## Deploying to GitHub Pages

1. Ensure your app only uses static features (no API routes, no server-side rendering).
2. Build and export the static site:
	```
	npm run build
	npm run export
	```
	This will output static files to the `out/` directory.
3. Deploy to GitHub Pages:
	```
	npm run gh-pages
	```
	This uses the `gh-pages` package to push the `out/` directory to the `gh-pages` branch.
4. In your GitHub repository settings, set GitHub Pages to serve from the `gh-pages` branch (or `/docs` folder if you prefer to copy files there).

**Note:** If your repository is not at the root domain (e.g., `username.github.io/repo`), set `basePath` in `next.config.ts` to your repo name (e.g., `/lead-scraper`).

## Notes
- The Google Maps scraper is a placeholder. For real scraping, use Selenium/Playwright and handle anti-bot measures.
- Extendable for Facebook and other sources.

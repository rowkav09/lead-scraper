from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dataclasses import asdict
from concurrent.futures import ThreadPoolExecutor
import asyncio
import logging

from google_maps_scraper import scrape_places

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

app = FastAPI(title="MapLeads Scraper API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

executor = ThreadPoolExecutor(max_workers=2)


class ScrapeRequest(BaseModel):
    category: str
    location: str
    total: int = 10


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/scrape")
async def scrape(req: ScrapeRequest):
    if not req.category.strip() or not req.location.strip():
        raise HTTPException(status_code=400, detail="category and location are required")

    req.total = max(1, min(req.total, 100))
    search_for = f"{req.category.strip()} in {req.location.strip()}"

    logging.info(f"Starting scrape: '{search_for}', total={req.total}")

    loop = asyncio.get_event_loop()
    try:
        places = await loop.run_in_executor(
            executor,
            lambda: scrape_places(search_for, req.total),
        )
        return {
            "data": [asdict(p) for p in places],
            "count": len(places),
            "search": search_for,
        }
    except Exception as e:
        logging.error(f"Scrape failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

import { NextRequest, NextResponse } from 'next/server';

const SCRAPER_API_URL = process.env.SCRAPER_API_URL || 'http://localhost:8000';

export async function POST(req: NextRequest): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Expected a JSON object' }, { status: 400 });
  }
  const { category, location, total } = body as Record<string, unknown>;

  if (!category || !location) {
    return NextResponse.json({ error: 'Missing category or location' }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${SCRAPER_API_URL}/scrape`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, location, total: total ?? 10 }),
    });

    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });
  } catch (err) {
    console.error('Scraper proxy error:', err);
    return NextResponse.json(
      { error: 'Could not reach the scraper backend. Is it running?' },
      { status: 502 }
    );
  }
}

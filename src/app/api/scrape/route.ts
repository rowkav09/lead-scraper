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

  if (typeof category !== 'string' || typeof location !== 'string' || !category.trim() || !location.trim()) {
    return NextResponse.json({ error: 'Missing category or location' }, { status: 400 });
  }
  if (total !== undefined && total !== null && !Number.isInteger(total)) {
    return NextResponse.json({ error: 'total must be a whole number' }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${SCRAPER_API_URL}/scrape`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, location, total: total ?? 10 }),
    });

    const data = await upstream.json();
    if (!upstream.ok && data && typeof data === 'object' && !('error' in data)) {
      // FastAPI reports failures as { detail }, but the page reads { error }.
      const detail = (data as { detail?: unknown }).detail;
      const error = typeof detail === 'string' && detail ? detail : 'The scraper rejected the request.';
      return NextResponse.json({ error }, { status: upstream.status });
    }
    return NextResponse.json(data, { status: upstream.status });
  } catch (err) {
    console.error('Scraper proxy error:', err);
    return NextResponse.json(
      { error: 'Could not reach the scraper backend. Is it running?' },
      { status: 502 }
    );
  }
}

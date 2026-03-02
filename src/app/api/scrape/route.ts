import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export async function POST(req: NextRequest): Promise<Response> {
  const { category, location } = await req.json();
  if (!category || !location) {
    return NextResponse.json({ error: 'Missing category or location' }, { status: 400 });
  }

  const outputFile = path.join(process.cwd(), 'python-backend', 'output.csv');
  const scriptPath = path.join(process.cwd(), 'python-backend', 'google_maps_scraper.py');

  // Remove old output file if exists
  if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);

  return await new Promise<Response>((resolve) => {
    const py = spawn('python', [scriptPath, category, location, outputFile]);
    let error = '';
    py.stderr.on('data', (data) => {
      error += data.toString();
    });
    py.on('close', (code) => {
      if (code !== 0) {
        resolve(NextResponse.json({ error: error || 'Python script failed' }, { status: 500 }));
      } else {
        const csv = fs.readFileSync(outputFile, 'utf-8');
        resolve(NextResponse.json({ csv }));
      }
    });
  });
}

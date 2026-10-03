const PHONE_LIKE = /^\+?[\d\s().-]+$/;

function cell(value: unknown): string {
  let text = String(value ?? "");
  // Stop spreadsheets from running scraped text as a formula, but leave phone numbers alone.
  if (/^[=+\-@\t\r]/.test(text) && !PHONE_LIKE.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export function leadsToCsv<T extends Record<string, unknown>>(rows: T[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(","), ...rows.map((row) => headers.map((h) => cell(row[h])).join(","))];
  return "\ufeff" + lines.join("\r\n");
}

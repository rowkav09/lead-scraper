export function formatWebsite(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/i, "").split("/")[0];
}

export function websiteHref(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

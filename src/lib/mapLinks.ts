export interface Coordinates {
  readonly lat: number;
  readonly lon: number;
}

/** Half-width of the embedded map in degrees: roughly a 600 m wide view. */
const EMBED_SPAN_DEGREES = 0.004;

/** OpenStreetMap embed URL with a marker on the given point. */
export function osmEmbedUrl({ lat, lon }: Coordinates): string {
  const d = EMBED_SPAN_DEGREES;
  const bbox = [lon - d, lat - d / 2, lon + d, lat + d / 2]
    .map((n) => n.toFixed(5))
    .join(',');
  const marker = `${lat.toFixed(5)},${lon.toFixed(5)}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${encodeURIComponent(marker)}`;
}

/** Opens the default maps app on phones, Google Maps in the browser elsewhere. */
export function directionsUrl(address: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}

import { describe, expect, it } from 'vitest';
import { directionsUrl, osmEmbedUrl } from './mapLinks';

describe('osmEmbedUrl', () => {
  const url = new URL(osmEmbedUrl({ lat: 50.9429, lon: 5.1606 }));

  it('points to the OpenStreetMap embed', () => {
    expect(url.origin + url.pathname).toBe(
      'https://www.openstreetmap.org/export/embed.html',
    );
  });

  it('centres the bounding box on the point', () => {
    const [west, south, east, north] = url.searchParams
      .get('bbox')!
      .split(',')
      .map(Number);
    expect((west + east) / 2).toBeCloseTo(5.1606, 4);
    expect((south + north) / 2).toBeCloseTo(50.9429, 4);
  });

  it('places a marker on the point', () => {
    expect(url.searchParams.get('marker')).toBe('50.94290,5.16060');
  });
});

describe('directionsUrl', () => {
  it('encodes the address as destination', () => {
    expect(directionsUrl('Ursulinenstraat 1, 3540 Herk-de-Stad')).toBe(
      'https://www.google.com/maps/dir/?api=1&destination=Ursulinenstraat%201%2C%203540%20Herk-de-Stad',
    );
  });
});

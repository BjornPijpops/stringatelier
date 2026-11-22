/** Prefixes an internal path with the configured Astro base (needed on GitHub Pages). */
export function withBase(
  path: string,
  base: string = import.meta.env.BASE_URL,
): string {
  const cleanBase = base.replace(/\/+$/, '');
  const cleanPath = path.replace(/^\/+/, '');
  return cleanPath ? `${cleanBase}/${cleanPath}` : `${cleanBase}/`;
}

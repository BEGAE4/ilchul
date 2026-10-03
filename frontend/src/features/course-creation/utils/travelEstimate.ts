type Coord = { lat: number; lng: number };

// Mirrors the geometric estimate used for recommendations. Final preview/save are verified by the server.
export function estimateLegMinutes(from: Coord, to: Coord, transport?: string): number {
  const radians = (n: number) => n * Math.PI / 180;
  const h = Math.sin(radians(to.lat - from.lat) / 2) ** 2
    + Math.cos(radians(from.lat)) * Math.cos(radians(to.lat)) * Math.sin(radians(to.lng - from.lng) / 2) ** 2;
  const km = 6371 * 2 * Math.asin(Math.min(1, Math.sqrt(h)));
  if (km < 0.01) return 0;
  const speed = transport === '도보' ? 4 : transport === '대중교통' ? 15 : 25;
  const allowance = transport === '도보' ? 2 : transport === '대중교통' ? 10 : 5;
  return Math.ceil(km * 1.5 / speed * 60) + allowance;
}

export function estimateRoundTripMinutes(origin: Coord, stops: Coord[], transport?: string): number {
  if (!stops.length) return 0;
  let previous = origin;
  let total = 0;
  for (const stop of stops) {
    total += estimateLegMinutes(previous, stop, transport);
    previous = stop;
  }
  return total + estimateLegMinutes(previous, origin, transport);
}

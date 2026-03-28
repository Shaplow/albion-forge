export const CITIES = [
  'Lymhurst',
  'Bridgewatch',
  'Fort Sterling',
  'Martlock',
  'Thetford',
  'Caerleon',
  'Black Market',
] as const;

export type City = (typeof CITIES)[number];

// Albion Online Data Project base URLs (West = Europe+Amérique, East = Asie/Océanie)
export const AODP_BASE_WEST = 'https://www.albion-online-data.com/api/v2';
export const AODP_BASE_EAST = 'https://east.albion-online-data.com/api/v2';

export function aodpBase(server: 'west' | 'east'): string {
  return server === 'east' ? AODP_BASE_EAST : AODP_BASE_WEST;
}

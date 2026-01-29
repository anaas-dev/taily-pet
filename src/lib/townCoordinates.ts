// Approximate center coordinates for Cyprus towns
// These are used as defaults when sitters haven't set their location

export interface TownCoordinate {
  name: string;
  lat: number;
  lng: number;
}

export const townCoordinates: Record<string, TownCoordinate> = {
  nicosia: { name: "Nicosia", lat: 35.1856, lng: 33.3823 },
  limassol: { name: "Limassol", lat: 34.6786, lng: 33.0413 },
  larnaca: { name: "Larnaca", lat: 34.9229, lng: 33.6232 },
  paphos: { name: "Paphos", lat: 34.7754, lng: 32.4245 },
  famagusta: { name: "Famagusta", lat: 35.1174, lng: 33.9420 },
  kyrenia: { name: "Kyrenia", lat: 35.3417, lng: 33.3192 },
  paralimni: { name: "Paralimni", lat: 35.0383, lng: 33.9822 },
  aradippou: { name: "Aradippou", lat: 34.9500, lng: 33.5833 },
  strovolos: { name: "Strovolos", lat: 35.1333, lng: 33.3500 },
  lakatamia: { name: "Lakatamia", lat: 35.1167, lng: 33.3167 },
  latsia: { name: "Latsia", lat: 35.1000, lng: 33.3833 },
  "agios-dometios": { name: "Agios Dometios", lat: 35.1667, lng: 33.3333 },
  "kato-polemidia": { name: "Kato Polemidia", lat: 34.7000, lng: 33.0000 },
  aglandjia: { name: "Aglandjia", lat: 35.1500, lng: 33.4000 },
  "ayia-napa": { name: "Ayia Napa", lat: 34.9833, lng: 33.9833 },
  protaras: { name: "Protaras", lat: 35.0167, lng: 34.0500 },
  polis: { name: "Polis", lat: 35.0367, lng: 32.4244 },
  pegeia: { name: "Pegeia", lat: 34.8833, lng: 32.3833 },
  geroskipou: { name: "Geroskipou", lat: 34.7594, lng: 32.4525 },
};

// Default center of Cyprus
export const cyprusCenter = { lat: 35.1264, lng: 33.4299 };
export const defaultZoom = 9;

// Get approximate coordinates for a town (with slight randomization for privacy)
export const getApproximateCoordinates = (
  town: string,
  existingLat?: number | null,
  existingLng?: number | null
): { lat: number; lng: number } => {
  // If sitter has set their approximate location, use it
  if (existingLat !== null && existingLat !== undefined && 
      existingLng !== null && existingLng !== undefined) {
    return { lat: existingLat, lng: existingLng };
  }

  // Otherwise, use town center with small random offset (approx 500m-1km)
  const normalizedTown = town.toLowerCase().replace(/\s+/g, "-");
  const townCoord = townCoordinates[normalizedTown];

  if (townCoord) {
    // Add small random offset for privacy (approximately 0.5-1km radius)
    const latOffset = (Math.random() - 0.5) * 0.018; // ~1km in latitude
    const lngOffset = (Math.random() - 0.5) * 0.018; // ~1km in longitude
    return {
      lat: townCoord.lat + latOffset,
      lng: townCoord.lng + lngOffset,
    };
  }

  // Fallback to Cyprus center
  return cyprusCenter;
};

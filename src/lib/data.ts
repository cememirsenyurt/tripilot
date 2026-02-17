/**
 * Seed data and mock API helpers for Tripilot.
 * Destinations, sample trips, bucket list items, and mock flight/hotel generators.
 */

import type { Trip, BucketListItem, Destination, Flight, Hotel, ItineraryDay } from "./types";

/* ── Popular destinations (map pins) ─────────────────────────── */

export const DESTINATIONS: Destination[] = [
  { id: "d-1", name: "Paris", country: "France", coords: { lat: 48.8566, lng: 2.3522 }, rating: 4.8, description: "City of Light — art, cuisine, and iconic landmarks" },
  { id: "d-2", name: "Tokyo", country: "Japan", coords: { lat: 35.6762, lng: 139.6503 }, rating: 4.9, description: "Where ancient temples meet neon-lit streets" },
  { id: "d-3", name: "New York", country: "USA", coords: { lat: 40.7128, lng: -74.006 }, rating: 4.7, description: "The city that never sleeps" },
  { id: "d-4", name: "Bali", country: "Indonesia", coords: { lat: -8.3405, lng: 115.092 }, rating: 4.8, description: "Tropical paradise of rice terraces and temples" },
  { id: "d-5", name: "Barcelona", country: "Spain", coords: { lat: 41.3874, lng: 2.1686 }, rating: 4.7, description: "Gaudí architecture and Mediterranean vibes" },
  { id: "d-6", name: "Cape Town", country: "South Africa", coords: { lat: -33.9249, lng: 18.4241 }, rating: 4.6, description: "Where mountains meet the ocean" },
  { id: "d-7", name: "Kyoto", country: "Japan", coords: { lat: 35.0116, lng: 135.7681 }, rating: 4.9, description: "Imperial capital of zen gardens and geisha" },
  { id: "d-8", name: "Santorini", country: "Greece", coords: { lat: 36.3932, lng: 25.4615 }, rating: 4.8, description: "Blue domes and sunset views over the caldera" },
  { id: "d-9", name: "Machu Picchu", country: "Peru", coords: { lat: -13.1631, lng: -72.545 }, rating: 4.9, description: "Lost city of the Incas above the clouds" },
  { id: "d-10", name: "Dubai", country: "UAE", coords: { lat: 25.2048, lng: 55.2708 }, rating: 4.5, description: "Futuristic skyline in the desert" },
  { id: "d-11", name: "Rome", country: "Italy", coords: { lat: 41.9028, lng: 12.4964 }, rating: 4.8, description: "Eternal city of history, art, and pasta" },
  { id: "d-12", name: "Reykjavik", country: "Iceland", coords: { lat: 64.1466, lng: -21.9426 }, rating: 4.7, description: "Gateway to glaciers, geysers, and northern lights" },
  { id: "d-13", name: "Marrakech", country: "Morocco", coords: { lat: 31.6295, lng: -7.9811 }, rating: 4.5, description: "Vibrant souks, palaces, and Sahara excursions" },
  { id: "d-14", name: "Sydney", country: "Australia", coords: { lat: -33.8688, lng: 151.2093 }, rating: 4.7, description: "Harbour city of beaches and opera" },
  { id: "d-15", name: "Istanbul", country: "Turkey", coords: { lat: 41.0082, lng: 28.9784 }, rating: 4.6, description: "Where East meets West across the Bosphorus" },
];

/* ── Sample trips ────────────────────────────────────────────── */

export const SAMPLE_TRIPS: Trip[] = [
  {
    id: "trip-1",
    destination: "Kyoto",
    country: "Japan",
    coords: { lat: 35.0116, lng: 135.7681 },
    startDate: "2026-04-10",
    endDate: "2026-04-14",
    totalBudget: 2800,
    status: "planned",
    days: [
      {
        day: 1, date: "2026-04-10", title: "Arrival & Eastern Kyoto",
        activities: [
          { time: "10:00", activity: "Arrive at Kansai Airport, train to Kyoto", location: "Kyoto Station", coords: { lat: 34.9856, lng: 135.7585 }, type: "transport" },
          { time: "14:00", activity: "Visit Fushimi Inari Shrine (thousands of orange torii gates)", location: "Fushimi Inari", coords: { lat: 34.9671, lng: 135.7727 }, type: "sightseeing" },
          { time: "18:00", activity: "Dinner in Gion district — try kaiseki cuisine", location: "Gion", coords: { lat: 35.0036, lng: 135.7747 }, type: "food" },
        ],
      },
      {
        day: 2, date: "2026-04-11", title: "Bamboo & Temples",
        activities: [
          { time: "08:00", activity: "Arashiyama Bamboo Grove (go early to beat crowds)", location: "Arashiyama", coords: { lat: 35.0094, lng: 135.6722 }, type: "sightseeing" },
          { time: "11:00", activity: "Tenryū-ji Temple and garden", location: "Tenryū-ji", coords: { lat: 35.0155, lng: 135.6745 }, type: "sightseeing" },
          { time: "13:00", activity: "Lunch — matcha and soba noodles", location: "Arashiyama", coords: { lat: 35.0135, lng: 135.6780 }, type: "food" },
          { time: "15:00", activity: "Kinkaku-ji (Golden Pavilion)", location: "Kinkaku-ji", coords: { lat: 35.0394, lng: 135.7292 }, type: "sightseeing" },
        ],
      },
      {
        day: 3, date: "2026-04-12", title: "Tea & Culture",
        activities: [
          { time: "09:00", activity: "Tea ceremony experience in a traditional machiya house", location: "Higashiyama", coords: { lat: 34.9986, lng: 135.7809 }, type: "activity" },
          { time: "12:00", activity: "Nishiki Market food tour", location: "Nishiki Market", coords: { lat: 35.0051, lng: 135.7649 }, type: "food" },
          { time: "15:00", activity: "Philosopher's Path walk", location: "Philosopher's Path", coords: { lat: 35.0270, lng: 135.7945 }, type: "sightseeing" },
        ],
      },
      {
        day: 4, date: "2026-04-13", title: "Day Trip to Nara",
        activities: [
          { time: "09:00", activity: "Train to Nara (45 min)", location: "Nara", coords: { lat: 34.6851, lng: 135.8048 }, type: "transport" },
          { time: "10:30", activity: "Nara Park — feed the sacred deer", location: "Nara Park", coords: { lat: 34.6851, lng: 135.8430 }, type: "activity" },
          { time: "12:00", activity: "Tōdai-ji Temple — world's largest bronze Buddha", location: "Tōdai-ji", coords: { lat: 34.6889, lng: 135.8398 }, type: "sightseeing" },
        ],
      },
      {
        day: 5, date: "2026-04-14", title: "Cherry Blossoms & Departure",
        activities: [
          { time: "07:00", activity: "Morning walk along Kamogawa River (cherry blossoms)", location: "Kamogawa", coords: { lat: 35.0000, lng: 135.7700 }, type: "sightseeing" },
          { time: "10:00", activity: "Last-minute souvenir shopping at Teramachi Street", location: "Teramachi", coords: { lat: 35.0069, lng: 135.7637 }, type: "activity" },
          { time: "14:00", activity: "Train to Kansai Airport, departure", location: "Kyoto Station", coords: { lat: 34.9856, lng: 135.7585 }, type: "transport" },
        ],
      },
    ],
  },
];

/* ── Sample bucket list ──────────────────────────────────────── */

export const SAMPLE_BUCKET_LIST: BucketListItem[] = [
  { id: "bl-1", destination: "Santorini", country: "Greece", coords: { lat: 36.3932, lng: 25.4615 }, notes: "Watch sunset from Oia, blue dome photos", addedAt: "2026-01-15", priority: "next" },
  { id: "bl-2", destination: "Machu Picchu", country: "Peru", coords: { lat: -13.1631, lng: -72.545 }, notes: "Hike the Inca Trail, need to book permits early", addedAt: "2026-01-20", priority: "dream" },
  { id: "bl-3", destination: "Reykjavik", country: "Iceland", coords: { lat: 64.1466, lng: -21.9426 }, notes: "Northern lights, Blue Lagoon, Golden Circle", addedAt: "2026-02-01", priority: "someday" },
];

/* ── Mock flight generator ───────────────────────────────────── */

const AIRLINES = ["Delta", "United", "Emirates", "Japan Airlines", "Lufthansa", "Turkish Airlines", "Singapore Airlines", "British Airways", "Air France", "Qantas"];

export function generateFlights(from: string, to: string, date: string): Flight[] {
  const count = 4 + Math.floor(Math.random() * 3);
  return Array.from({ length: count }, (_, i) => {
    const depHour = 6 + Math.floor(Math.random() * 14);
    const durationH = 2 + Math.floor(Math.random() * 14);
    const durationM = Math.floor(Math.random() * 60);
    const arrHour = (depHour + durationH) % 24;
    const stops = durationH > 8 ? (Math.random() > 0.4 ? 1 : 0) : 0;
    const basePrice = 200 + durationH * 60 + Math.floor(Math.random() * 300);

    return {
      id: `fl-${date}-${i}`,
      airline: AIRLINES[Math.floor(Math.random() * AIRLINES.length)],
      from,
      to,
      departTime: `${String(depHour).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
      arriveTime: `${String(arrHour).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
      duration: `${durationH}h ${durationM}m`,
      stops,
      price: Math.round(basePrice / 10) * 10,
      class: "economy" as const,
    };
  }).sort((a, b) => a.price - b.price);
}

/* ── Mock hotel generator ────────────────────────────────────── */

const HOTEL_PREFIXES = ["Grand", "Royal", "The", "Hotel", "Boutique", "Park", "Azure", "Golden"];
const HOTEL_SUFFIXES = ["Palace", "Inn", "Suites", "Resort", "Lodge", "House", "Gardens", "Residence"];
const AMENITIES_POOL = ["Free WiFi", "Pool", "Spa", "Gym", "Breakfast", "Restaurant", "Bar", "Room Service", "Parking", "Airport Shuttle", "Rooftop Terrace", "Ocean View"];

export function generateHotels(location: string): Hotel[] {
  const count = 4 + Math.floor(Math.random() * 3);
  return Array.from({ length: count }, (_, i) => {
    const stars = 3 + Math.floor(Math.random() * 3);
    const rating = Math.round((3.5 + Math.random() * 1.5) * 10) / 10;
    const price = stars === 5 ? 180 + Math.floor(Math.random() * 250) : stars === 4 ? 100 + Math.floor(Math.random() * 150) : 50 + Math.floor(Math.random() * 80);
    const amenityCount = 3 + Math.floor(Math.random() * 4);
    const shuffled = [...AMENITIES_POOL].sort(() => Math.random() - 0.5);

    return {
      id: `ht-${location.slice(0, 3)}-${i}`,
      name: `${HOTEL_PREFIXES[Math.floor(Math.random() * HOTEL_PREFIXES.length)]} ${location} ${HOTEL_SUFFIXES[Math.floor(Math.random() * HOTEL_SUFFIXES.length)]}`,
      location,
      rating,
      stars,
      pricePerNight: Math.round(price / 5) * 5,
      amenities: shuffled.slice(0, amenityCount),
    };
  }).sort((a, b) => b.rating - a.rating);
}

/* ── ID helper ───────────────────────────────────────────────── */

let _counter = Date.now();
export function uid(): string {
  return `t-${++_counter}`;
}

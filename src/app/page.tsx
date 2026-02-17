"use client";

import { useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import { MessageSquare, Plane, Hotel, Star, MapPin, DollarSign, Check, X, Clock, UtensilsCrossed } from "lucide-react";
import { TripPanel } from "@/components/TripPanel";
import { DESTINATIONS, SAMPLE_TRIPS, SAMPLE_BUCKET_LIST, uid } from "@/lib/data";
import type { Trip, BucketListItem, Booking, LatLng, Destination, Flight, Hotel as HotelType, Restaurant } from "@/lib/types";

/* Leaflet must be client-only — no SSR */
const WorldMap = dynamic(() => import("@/components/WorldMap"), { ssr: false });

/* ═══════════════════════════════════════════════════════════════
   Main App
   ═══════════════════════════════════════════════════════════════ */

export default function App() {
  const [trips, setTrips] = useState<Trip[]>(SAMPLE_TRIPS);
  const [bucketList, setBucketList] = useState<BucketListItem[]>(SAMPLE_BUCKET_LIST);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<"trips" | "bucket" | "bookings">("trips");
  const [flyTo, setFlyTo] = useState<LatLng | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  /* Trip markers for the map */
  const tripMarkers = useMemo(() => {
    if (!selectedTrip) return [];
    return selectedTrip.days.flatMap((day) =>
      day.activities.map((act) => ({
        coords: act.coords,
        label: `Day ${day.day}: ${act.activity}`,
        type: act.type,
      }))
    );
  }, [selectedTrip]);

  const handleSelectTrip = useCallback((trip: Trip) => {
    setSelectedTrip(trip);
    setFlyTo(trip.coords);
  }, []);

  const handleDestinationClick = useCallback((dest: Destination) => {
    setFlyTo(dest.coords);
  }, []);

  const handleRemoveBucketItem = useCallback((id: string) => {
    setBucketList((prev) => prev.filter((b) => b.id !== id));
  }, []);

  /* ═══════════════════════════════════════════════════════════
     CopilotKit — Readables (share state with the AI)
     ═══════════════════════════════════════════════════════════ */

  useCopilotReadable({
    description:
      "The user's planned trips. Each trip has: destination, country, coords, startDate, endDate, days (array of itinerary days with activities), totalBudget, and status (planned/booked/completed).",
    value: trips,
  });

  useCopilotReadable({
    description:
      "The user's travel bucket list. Each item has: destination, country, coords, notes, priority (dream/next/someday).",
    value: bucketList,
  });

  useCopilotReadable({
    description:
      "The user's bookings (flights and hotels). Each has: type, itemName, price, status (pending/confirmed/cancelled), details.",
    value: bookings,
  });

  useCopilotReadable({
    description:
      "Popular world destinations with coordinates, ratings, and descriptions. Use these for suggestions.",
    value: DESTINATIONS,
  });

  /* ═══════════════════════════════════════════════════════════
     CopilotKit — Actions (what the AI can DO)
     ═══════════════════════════════════════════════════════════ */

  /* ── 1. Plan a Trip ──────────────────────────────────────── */

  useCopilotAction({
    name: "planTrip",
    description:
      "Create a detailed day-by-day trip itinerary. Use when the user asks to plan, create, or suggest a trip. Include real place names, coordinates, activities, and budget estimates. The trip will appear on the map and in the trips panel.",
    parameters: [
      { name: "destination", type: "string", description: "Main destination city", required: true },
      { name: "country", type: "string", description: "Country name", required: true },
      { name: "lat", type: "number", description: "Latitude of the destination", required: true },
      { name: "lng", type: "number", description: "Longitude of the destination", required: true },
      { name: "startDate", type: "string", description: "Start date (YYYY-MM-DD)", required: true },
      { name: "endDate", type: "string", description: "End date (YYYY-MM-DD)", required: true },
      { name: "totalBudget", type: "number", description: "Estimated total budget in USD", required: true },
      { name: "daysJson", type: "string", description: 'JSON array of itinerary days. Each: {"day":1,"date":"YYYY-MM-DD","title":"Day title","activities":[{"time":"09:00","activity":"Description","location":"Place name","lat":0,"lng":0,"type":"sightseeing|food|transport|hotel|activity"}]}', required: true },
    ],
    handler: async (args: {
      destination: string;
      country: string;
      lat: number;
      lng: number;
      startDate: string;
      endDate: string;
      totalBudget: number;
      daysJson: string;
    }) => {
      let days;
      try {
        const raw = JSON.parse(args.daysJson);
        days = raw.map((d: Record<string, unknown>) => ({
          day: d.day,
          date: d.date,
          title: d.title,
          activities: (d.activities as Record<string, unknown>[]).map((a) => ({
            time: a.time,
            activity: a.activity,
            location: a.location,
            coords: { lat: a.lat as number, lng: a.lng as number },
            type: a.type,
          })),
        }));
      } catch {
        return { error: true, message: "Failed to parse itinerary data" };
      }

      const trip: Trip = {
        id: uid(),
        destination: args.destination,
        country: args.country,
        coords: { lat: args.lat, lng: args.lng },
        startDate: args.startDate,
        endDate: args.endDate,
        days,
        totalBudget: args.totalBudget,
        status: "planned",
      };

      setTrips((prev) => [trip, ...prev]);
      setSelectedTrip(trip);
      setFlyTo({ lat: args.lat, lng: args.lng });
      setActiveTab("trips");

      return { ok: true, tripId: trip.id, destination: args.destination, days: days.length };
    },
    render: ({ status, result }) => {
      if (status === "inProgress")
        return (
          <RenderCard>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-500" />
              <span className="text-sm text-gray-600">Planning your trip...</span>
            </div>
          </RenderCard>
        );

      if (result?.error)
        return <RenderCard variant="error">{result.message}</RenderCard>;

      return (
        <RenderCard>
          <div className="flex items-center gap-2">
            <span className="text-lg">✈️</span>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Trip to {result?.destination} planned!
              </p>
              <p className="text-xs text-gray-500">
                {result?.days} days — check the map & trips panel
              </p>
            </div>
          </div>
        </RenderCard>
      );
    },
  });

  /* ── 2. Search Flights ──────────────────────────────────── */

  useCopilotAction({
    name: "searchFlights",
    description:
      "Search for flights between two cities. YOU must provide real flight data based on your knowledge — use actual airlines that fly this route, realistic prices, real flight durations, and accurate departure/arrival times. Return 4-6 options sorted by price. Use when the user asks about flights, airfare, or how to get somewhere.",
    parameters: [
      { name: "from", type: "string", description: "Departure city", required: true },
      { name: "to", type: "string", description: "Arrival city", required: true },
      { name: "date", type: "string", description: "Travel date (YYYY-MM-DD)", required: true },
      { name: "resultsJson", type: "string", description: 'JSON array of real flights. Each: {"airline":"Delta","from":"NYC","to":"Tokyo","departTime":"14:30","arriveTime":"17:45+1","duration":"14h 15m","stops":0,"price":890,"class":"economy"}. Use REAL airlines that fly this route, realistic prices for the season, and accurate flight times.', required: true },
    ],
    handler: async (args: { from: string; to: string; date: string; resultsJson: string }) => {
      let flights: Flight[] = [];
      try {
        const raw = JSON.parse(args.resultsJson);
        flights = raw.map((f: Record<string, unknown>, i: number) => ({
          id: `fl-${i}`,
          airline: f.airline,
          from: f.from || args.from,
          to: f.to || args.to,
          departTime: f.departTime,
          arriveTime: f.arriveTime,
          duration: f.duration,
          stops: f.stops ?? 0,
          price: f.price,
          class: f.class || "economy",
        }));
      } catch {
        return { error: true, message: "Failed to parse flight data" };
      }
      return { flights, from: args.from, to: args.to, date: args.date };
    },
    render: ({ status, result }) => {
      if (status === "inProgress")
        return (
          <RenderCard>
            <div className="flex items-center gap-2">
              <Plane className="h-4 w-4 animate-pulse text-indigo-500" />
              <span className="text-sm text-gray-600">Searching flights...</span>
            </div>
          </RenderCard>
        );

      if (!result?.flights)
        return <RenderCard>No flights found.</RenderCard>;
      const flights: Flight[] = result.flights;

      return (
        <RenderCard>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-indigo-600">
            ✈️ Flights: {result.from} → {result.to}
          </p>
          <p className="mb-3 text-[11px] text-gray-400">{result.date}</p>
          <div className="space-y-2">
            {flights.slice(0, 5).map((f: Flight) => (
              <div
                key={f.id}
                className="flex items-center gap-3 rounded-lg border border-gray-100 p-2.5 hover:border-indigo-200 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-900">{f.airline}</span>
                    {f.stops === 0 && (
                      <span className="rounded bg-green-50 px-1 py-0.5 text-[10px] font-bold text-green-600">Direct</span>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-gray-500">
                    <span>{f.departTime}</span>
                    <span className="text-gray-300">→</span>
                    <span>{f.arriveTime}</span>
                    <span className="text-gray-300">·</span>
                    <Clock className="h-3 w-3" />
                    <span>{f.duration}</span>
                    {f.stops > 0 && <span className="text-amber-500">({f.stops} stop)</span>}
                  </div>
                </div>
                <p className="text-sm font-bold text-indigo-600">${f.price}</p>
              </div>
            ))}
          </div>
        </RenderCard>
      );
    },
  });

  /* ── 3. Search Hotels ───────────────────────────────────── */

  useCopilotAction({
    name: "searchHotels",
    description:
      "Search for hotels in a city. YOU must provide real hotel data — use actual hotel names that exist in that city, real ratings from review sites, realistic prices for the area, and real amenities. Return 4-6 options. Use when the user asks about hotels, accommodation, or where to stay.",
    parameters: [
      { name: "location", type: "string", description: "City to search hotels in", required: true },
      { name: "resultsJson", type: "string", description: 'JSON array of real hotels. Each: {"name":"Park Hyatt Tokyo","location":"Shinjuku","rating":4.8,"stars":5,"pricePerNight":450,"amenities":["Pool","Spa","Gym","Restaurant","Bar"]}. Use REAL hotel names that exist in this city, accurate star ratings, realistic prices per night in USD, and actual amenities they offer.', required: true },
    ],
    handler: async (args: { location: string; resultsJson: string }) => {
      let hotels: HotelType[] = [];
      try {
        const raw = JSON.parse(args.resultsJson);
        hotels = raw.map((h: Record<string, unknown>, i: number) => ({
          id: `ht-${i}`,
          name: h.name,
          location: (h.location as string) || args.location,
          rating: h.rating,
          stars: h.stars,
          pricePerNight: h.pricePerNight,
          amenities: h.amenities || [],
        }));
      } catch {
        return { error: true, message: "Failed to parse hotel data" };
      }
      return { hotels, location: args.location };
    },
    render: ({ status, result }) => {
      if (status === "inProgress")
        return (
          <RenderCard>
            <div className="flex items-center gap-2">
              <Hotel className="h-4 w-4 animate-pulse text-indigo-500" />
              <span className="text-sm text-gray-600">Finding hotels...</span>
            </div>
          </RenderCard>
        );

      if (!result?.hotels)
        return <RenderCard>No hotels found.</RenderCard>;
      const hotels: HotelType[] = result.hotels;

      return (
        <RenderCard>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-indigo-600">
            🏨 Hotels in {result.location}
          </p>
          <div className="space-y-2">
            {hotels.slice(0, 5).map((h: HotelType) => (
              <div
                key={h.id}
                className="rounded-lg border border-gray-100 p-2.5 hover:border-indigo-200 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-900">{h.name}</p>
                    <div className="mt-0.5 flex items-center gap-1">
                      {Array.from({ length: h.stars }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                      ))}
                      <span className="ml-1 text-[11px] text-gray-500">{h.rating}/5</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-indigo-600">${h.pricePerNight}</p>
                    <p className="text-[10px] text-gray-400">/night</p>
                  </div>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {h.amenities.slice(0, 4).map((a) => (
                    <span
                      key={a}
                      className="rounded bg-gray-50 px-1.5 py-0.5 text-[10px] text-gray-500"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </RenderCard>
      );
    },
  });

  /* ── 4. Search Restaurants ────────────────────────────────── */

  useCopilotAction({
    name: "searchRestaurants",
    description:
      "Search for restaurants in a city. YOU must provide real restaurant data — use actual restaurant names that exist, real cuisine types, accurate ratings, and realistic price levels. Return 4-6 options. Use when the user asks about restaurants, food, where to eat, or dining.",
    parameters: [
      { name: "location", type: "string", description: "City to search restaurants in", required: true },
      { name: "cuisine", type: "string", description: "Cuisine type filter (optional, e.g. 'sushi', 'italian')", required: false },
      { name: "resultsJson", type: "string", description: 'JSON array of real restaurants. Each: {"name":"Sukiyabashi Jiro","cuisine":"Sushi","location":"Ginza, Tokyo","rating":4.9,"priceLevel":"$$$$","description":"Legendary 3-Michelin-star sushi counter","mustTry":"Omakase tasting menu"}. Use REAL restaurant names, accurate ratings, and honest descriptions.', required: true },
    ],
    handler: async (args: { location: string; cuisine?: string; resultsJson: string }) => {
      let restaurants: Restaurant[] = [];
      try {
        const raw = JSON.parse(args.resultsJson);
        restaurants = raw.map((r: Record<string, unknown>, i: number) => ({
          id: `rest-${i}`,
          name: r.name,
          cuisine: r.cuisine,
          location: (r.location as string) || args.location,
          rating: r.rating,
          priceLevel: r.priceLevel || "$$",
          description: r.description,
          mustTry: r.mustTry,
        }));
      } catch {
        return { error: true, message: "Failed to parse restaurant data" };
      }
      return { restaurants, location: args.location };
    },
    render: ({ status, result }) => {
      if (status === "inProgress")
        return (
          <RenderCard>
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="h-4 w-4 animate-pulse text-orange-500" />
              <span className="text-sm text-gray-600">Finding restaurants...</span>
            </div>
          </RenderCard>
        );

      if (result?.error)
        return <RenderCard variant="error">{result.message}</RenderCard>;
      if (!result?.restaurants)
        return <RenderCard>No restaurants found.</RenderCard>;

      const restaurants: Restaurant[] = result.restaurants;
      return (
        <RenderCard>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-orange-600">
            🍽️ Restaurants in {result.location}
          </p>
          <div className="space-y-2">
            {restaurants.slice(0, 6).map((r: Restaurant) => (
              <div
                key={r.id}
                className="rounded-lg border border-gray-100 p-2.5 hover:border-orange-200 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-gray-900">{r.name}</p>
                      <span className="rounded bg-orange-50 px-1.5 py-0.5 text-[10px] font-bold text-orange-600">
                        {r.cuisine}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-gray-500">{r.description}</p>
                    {r.mustTry && (
                      <p className="mt-0.5 text-[11px] text-orange-600 italic">
                        Must try: {r.mustTry}
                      </p>
                    )}
                  </div>
                  <div className="ml-2 text-right shrink-0">
                    <p className="text-xs font-bold text-gray-900">⭐ {r.rating}</p>
                    <p className="text-[11px] font-semibold text-gray-500">{r.priceLevel}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </RenderCard>
      );
    },
  });

  /* ── 5. Add to Bucket List ──────────────────────────────── */

  useCopilotAction({
    name: "addToBucketList",
    description:
      "Add a destination to the user's travel bucket list. Use when the user mentions wanting to visit, save, or bookmark a place.",
    parameters: [
      { name: "destination", type: "string", description: "Place name", required: true },
      { name: "country", type: "string", description: "Country", required: true },
      { name: "lat", type: "number", description: "Latitude", required: true },
      { name: "lng", type: "number", description: "Longitude", required: true },
      { name: "notes", type: "string", description: "Short notes or reason", required: false },
      { name: "priority", type: "string", description: "Priority: dream, next, or someday", required: true },
    ],
    handler: async (args: {
      destination: string;
      country: string;
      lat: number;
      lng: number;
      notes?: string;
      priority: string;
    }) => {
      const item: BucketListItem = {
        id: uid(),
        destination: args.destination,
        country: args.country,
        coords: { lat: args.lat, lng: args.lng },
        notes: args.notes,
        addedAt: new Date().toISOString().split("T")[0],
        priority: (args.priority as BucketListItem["priority"]) || "someday",
      };
      setBucketList((prev) => [item, ...prev]);
      setFlyTo({ lat: args.lat, lng: args.lng });
      setActiveTab("bucket");
      return { ok: true, destination: args.destination };
    },
    render: ({ status, result }) => {
      if (status === "inProgress")
        return <RenderCard>Adding to bucket list...</RenderCard>;
      return (
        <RenderCard>
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-medium text-gray-900">
              {result?.destination} added to bucket list!
            </span>
          </div>
        </RenderCard>
      );
    },
  });

  /* ── 5. Book Trip (Human-in-the-Loop) ───────────────────── */

  const [pendingBooking, setPendingBooking] = useState<{
    type: "flight" | "hotel";
    itemName: string;
    price: number;
    details: string;
  } | null>(null);

  useCopilotAction({
    name: "bookTrip",
    description:
      "Book a flight or hotel. This requires user confirmation before completing (human-in-the-loop). Use when the user wants to book, reserve, or purchase travel.",
    parameters: [
      { name: "type", type: "string", description: "flight or hotel", required: true },
      { name: "itemName", type: "string", description: "Name of the flight/hotel", required: true },
      { name: "price", type: "number", description: "Total price in USD", required: true },
      { name: "details", type: "string", description: "Booking details summary", required: true },
    ],
    handler: async (args: {
      type: string;
      itemName: string;
      price: number;
      details: string;
    }) => {
      setPendingBooking({
        type: args.type as "flight" | "hotel",
        itemName: args.itemName,
        price: args.price,
        details: args.details,
      });
      return {
        needsApproval: true,
        type: args.type,
        itemName: args.itemName,
        price: args.price,
      };
    },
    render: ({ status, result }) => {
      if (status === "inProgress")
        return <RenderCard>Preparing booking...</RenderCard>;

      if (result?.needsApproval) {
        return (
          <RenderCard variant="warning">
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-amber-600">
              Confirm Booking
            </p>
            <div className="flex items-center gap-2">
              <span className="text-lg">{result.type === "flight" ? "✈️" : "🏨"}</span>
              <div>
                <p className="text-sm font-semibold text-gray-900">{result.itemName}</p>
                <p className="text-lg font-bold text-indigo-600">${result.price}</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => {
                  if (pendingBooking) {
                    const booking: Booking = {
                      id: uid(),
                      ...pendingBooking,
                      status: "confirmed",
                    };
                    setBookings((prev) => [booking, ...prev]);
                    setPendingBooking(null);
                    setActiveTab("bookings");
                  }
                }}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-green-600 py-2 text-xs font-semibold text-white hover:bg-green-700 transition-colors"
              >
                <Check className="h-3.5 w-3.5" /> Confirm & Pay
              </button>
              <button
                onClick={() => setPendingBooking(null)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gray-100 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <X className="h-3.5 w-3.5" /> Cancel
              </button>
            </div>
          </RenderCard>
        );
      }

      return (
        <RenderCard>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-gray-900">
              Booking confirmed!
            </span>
          </div>
        </RenderCard>
      );
    },
  });

  /* ── 6. Create Visual Card ──────────────────────────────── */

  useCopilotAction({
    name: "createTripCard",
    description:
      "Create a visual comparison or summary card. Use for comparing destinations, showing trip summaries, budget breakdowns, or travel tips. Pick the best type: comparison, summary, budget, or tips.",
    parameters: [
      { name: "type", type: "string", description: "Card type: comparison, summary, budget, or tips", required: true },
      { name: "title", type: "string", description: "Card title", required: true },
      { name: "dataJson", type: "string", description: 'JSON array of items. Each: {"label":"Name","value":"display value","sublabel":"subtitle","color":"#hex"}', required: true },
    ],
    handler: async (args: { type: string; title: string; dataJson: string }) => args,
    render: ({ status, args }) => {
      if (status === "inProgress")
        return <RenderCard>Creating card...</RenderCard>;

      let items: { label: string; value: string; sublabel?: string; color?: string }[] = [];
      try {
        items = JSON.parse(String(args.dataJson || "[]"));
      } catch {
        return <RenderCard variant="error">Failed to parse card data.</RenderCard>;
      }

      return (
        <RenderCard>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-indigo-600">
            {String(args.title)}
          </p>
          <div className={`grid gap-2 ${items.length <= 2 ? "grid-cols-2" : items.length <= 4 ? "grid-cols-2" : "grid-cols-3"}`}>
            {items.map((item, i) => (
              <div
                key={i}
                className="rounded-lg border border-gray-100 p-2.5 text-center"
                style={{ borderTopColor: item.color || "#6366F1", borderTopWidth: 3 }}
              >
                <p className="text-xs font-bold text-gray-900">{item.label}</p>
                <p className="mt-1 text-lg font-bold" style={{ color: item.color || "#6366F1" }}>
                  {item.value}
                </p>
                {item.sublabel && (
                  <p className="mt-0.5 text-[10px] text-gray-400">{item.sublabel}</p>
                )}
              </div>
            ))}
          </div>
        </RenderCard>
      );
    },
  });

  /* ═══════════════════════════════════════════════════════════
     Render
     ═══════════════════════════════════════════════════════════ */

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Panel */}
      <div className="w-[340px] shrink-0 border-r border-gray-200 shadow-sm">
        <TripPanel
          trips={trips}
          bucketList={bucketList}
          bookings={bookings}
          onSelectTrip={handleSelectTrip}
          onRemoveBucketItem={handleRemoveBucketItem}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      {/* Map */}
      <div className="relative flex-1">
        <WorldMap
          destinations={DESTINATIONS}
          trips={selectedTrip ? [selectedTrip] : []}
          bucketList={bucketList}
          tripMarkers={tripMarkers}
          onDestinationClick={handleDestinationClick}
          flyTo={flyTo}
        />

        {/* Top-left overlay: selected trip info */}
        {selectedTrip && (
          <div className="absolute left-4 top-4 z-10 rounded-xl bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-indigo-500" />
              <p className="text-sm font-semibold text-gray-900">
                {selectedTrip.destination}, {selectedTrip.country}
              </p>
            </div>
            <div className="mt-1 flex items-center gap-3 text-[11px] text-gray-500">
              <span>{selectedTrip.days.length} days</span>
              <span className="flex items-center gap-0.5">
                <DollarSign className="h-3 w-3" />
                {selectedTrip.totalBudget.toLocaleString()}
              </span>
              <span>{selectedTrip.startDate}</span>
            </div>
            <button
              onClick={() => setSelectedTrip(null)}
              className="mt-2 text-[11px] font-medium text-indigo-500 hover:text-indigo-700"
            >
              Clear selection
            </button>
          </div>
        )}

        {/* Bottom-left: hint */}
        <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 rounded-full bg-white/90 px-3.5 py-2 shadow-md backdrop-blur-sm">
          <MessageSquare className="h-4 w-4 text-indigo-500" />
          <span className="text-xs text-gray-500">
            Open the AI sidebar to plan your trip →
          </span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Shared render card for CopilotKit generative UI
   ═══════════════════════════════════════════════════════════════ */

function RenderCard({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant?: "error" | "warning";
}) {
  const border =
    variant === "error"
      ? "border-red-200 bg-red-50/50"
      : variant === "warning"
        ? "border-amber-200 bg-amber-50/50"
        : "border-gray-200 bg-white";
  return (
    <div className={`rounded-lg border p-3 text-left shadow-sm ${border}`}>
      {children}
    </div>
  );
}

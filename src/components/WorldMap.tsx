"use client";

import { useEffect, useRef, useState } from "react";
import type L from "leaflet";
import type { LatLng, Destination, Trip, BucketListItem } from "@/lib/types";

interface WorldMapProps {
  destinations: Destination[];
  trips: Trip[];
  bucketList: BucketListItem[];
  tripMarkers: { coords: LatLng; label: string; type: string }[];
  onDestinationClick?: (dest: Destination) => void;
  flyTo?: LatLng | null;
}

/**
 * Leaflet world map, dynamically imported to avoid SSR issues.
 * Shows destination pins, trip routes, and bucket list markers.
 */
export default function WorldMap({
  destinations,
  trips,
  bucketList,
  tripMarkers,
  onDestinationClick,
  flyTo,
}: WorldMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const markersRef = useRef<L.LayerGroup | null>(null);

  /* Initialize map */
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    import("leaflet").then((L) => {
      const map = L.map(containerRef.current!, {
        center: [25, 10],
        zoom: 2.5,
        minZoom: 2,
        maxZoom: 18,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        { maxZoom: 19 }
      ).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);
      L.control.attribution({ position: "bottomleft" }).addTo(map).addAttribution(
        '&copy; <a href="https://carto.com/">CARTO</a>'
      );

      markersRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      setReady(true);
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  /* Update markers when data changes */
  useEffect(() => {
    if (!ready || !mapRef.current || !markersRef.current) return;

    import("leaflet").then((L) => {
      const group = markersRef.current!;
      group.clearLayers();

      const createIcon = (emoji: string, size: number) =>
        L.divIcon({
          html: `<div style="font-size:${size}px;filter:drop-shadow(0 2px 3px rgba(0,0,0,0.3));cursor:pointer">${emoji}</div>`,
          className: "",
          iconSize: [size, size],
          iconAnchor: [size / 2, size],
        });

      /* Destination pins */
      destinations.forEach((d) => {
        const marker = L.marker([d.coords.lat, d.coords.lng], {
          icon: createIcon("📍", 24),
        });
        marker.bindTooltip(
          `<strong>${d.name}</strong><br/>${d.country}<br/>⭐ ${d.rating ?? ""}`,
          { direction: "top", offset: [0, -12] }
        );
        if (onDestinationClick) {
          marker.on("click", () => onDestinationClick(d));
        }
        group.addLayer(marker);
      });

      /* Bucket list pins */
      bucketList.forEach((b) => {
        const marker = L.marker([b.coords.lat, b.coords.lng], {
          icon: createIcon("⭐", 22),
        });
        marker.bindTooltip(
          `<strong>${b.destination}</strong><br/>Bucket list: ${b.priority}`,
          { direction: "top", offset: [0, -12] }
        );
        group.addLayer(marker);
      });

      /* Trip itinerary pins */
      tripMarkers.forEach((m) => {
        const emoji = m.type === "food" ? "🍜" : m.type === "hotel" ? "🏨" : m.type === "transport" ? "✈️" : m.type === "activity" ? "🎯" : "📸";
        const marker = L.marker([m.coords.lat, m.coords.lng], {
          icon: createIcon(emoji, 20),
        });
        marker.bindTooltip(`<strong>${m.label}</strong>`, {
          direction: "top",
          offset: [0, -10],
        });
        group.addLayer(marker);
      });

      /* Trip route lines */
      trips.forEach((trip) => {
        const allCoords: [number, number][] = [];
        trip.days.forEach((day) => {
          day.activities.forEach((act) => {
            allCoords.push([act.coords.lat, act.coords.lng]);
          });
        });
        if (allCoords.length > 1) {
          L.polyline(allCoords, {
            color: "#6366F1",
            weight: 2,
            opacity: 0.5,
            dashArray: "8 6",
          }).addTo(group);
        }
      });
    });
  }, [ready, destinations, trips, bucketList, tripMarkers, onDestinationClick]);

  /* Fly to location */
  useEffect(() => {
    if (!ready || !mapRef.current || !flyTo) return;
    mapRef.current.flyTo([flyTo.lat, flyTo.lng], 12, { duration: 1.5 });
  }, [ready, flyTo]);

  return (
    <div ref={containerRef} className="h-full w-full" />
  );
}

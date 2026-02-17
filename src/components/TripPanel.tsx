"use client";

import { useState } from "react";
import {
  MapPin,
  Calendar,
  Star,
  Plane,
  ChevronDown,
  ChevronUp,
  Trash2,
  Globe,
} from "lucide-react";
import type { Trip, BucketListItem, Booking } from "@/lib/types";

interface TripPanelProps {
  trips: Trip[];
  bucketList: BucketListItem[];
  bookings: Booking[];
  onSelectTrip: (trip: Trip) => void;
  onRemoveBucketItem: (id: string) => void;
  activeTab: "trips" | "bucket" | "bookings";
  onTabChange: (tab: "trips" | "bucket" | "bookings") => void;
}

const priorityColors = {
  next: "bg-green-100 text-green-700",
  dream: "bg-purple-100 text-purple-700",
  someday: "bg-gray-100 text-gray-600",
};

export function TripPanel({
  trips,
  bucketList,
  bookings,
  onSelectTrip,
  onRemoveBucketItem,
  activeTab,
  onTabChange,
}: TripPanelProps) {
  const [expandedTrip, setExpandedTrip] = useState<string | null>(null);

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Logo / Header */}
      <div className="border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-lg">
            🌍
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Tripilot</h1>
            <p className="text-[11px] text-gray-400">AI Travel Planner</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        {(["trips", "bucket", "bookings"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
              activeTab === tab
                ? "border-b-2 border-indigo-500 text-indigo-600"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab === "trips" && `Trips (${trips.length})`}
            {tab === "bucket" && `Bucket List (${bucketList.length})`}
            {tab === "bookings" && `Bookings (${bookings.length})`}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scroll-thin p-4">
        {/* ── Trips ──────────────────────────────────────── */}
        {activeTab === "trips" && (
          <div className="space-y-3">
            {trips.length === 0 && (
              <div className="py-12 text-center">
                <Globe className="mx-auto h-10 w-10 text-gray-200" />
                <p className="mt-3 text-sm text-gray-400">No trips yet</p>
                <p className="mt-1 text-xs text-gray-300">
                  Ask the AI to plan one!
                </p>
              </div>
            )}
            {trips.map((trip) => (
              <div
                key={trip.id}
                className="rounded-xl border border-gray-100 bg-gray-50/50 overflow-hidden transition-all hover:border-indigo-200"
              >
                <button
                  onClick={() => {
                    onSelectTrip(trip);
                    setExpandedTrip(expandedTrip === trip.id ? null : trip.id);
                  }}
                  className="flex w-full items-start gap-3 p-3.5 text-left"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-lg">
                    ✈️
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {trip.destination}, {trip.country}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2 text-[11px] text-gray-400">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {trip.startDate} → {trip.endDate}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-[11px]">
                      <span className="text-gray-500">
                        {trip.days.length} days
                      </span>
                      <span className="font-semibold text-indigo-600">
                        ${trip.totalBudget.toLocaleString()}
                      </span>
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                          trip.status === "booked"
                            ? "bg-green-100 text-green-700"
                            : trip.status === "completed"
                              ? "bg-gray-100 text-gray-500"
                              : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {trip.status}
                      </span>
                    </div>
                  </div>
                  {expandedTrip === trip.id ? (
                    <ChevronUp className="h-4 w-4 text-gray-300 shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-300 shrink-0" />
                  )}
                </button>

                {expandedTrip === trip.id && (
                  <div className="border-t border-gray-100 px-3.5 pb-3.5 pt-2">
                    {trip.days.map((day) => (
                      <div key={day.day} className="mt-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                          Day {day.day} — {day.title}
                        </p>
                        {day.activities.map((act, i) => (
                          <div
                            key={i}
                            className="mt-1 flex items-start gap-2 text-[11px] text-gray-600"
                          >
                            <span className="mt-0.5 shrink-0 text-gray-300">
                              {act.time}
                            </span>
                            <span>{act.activity}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Bucket List ────────────────────────────────── */}
        {activeTab === "bucket" && (
          <div className="space-y-2.5">
            {bucketList.length === 0 && (
              <div className="py-12 text-center">
                <Star className="mx-auto h-10 w-10 text-gray-200" />
                <p className="mt-3 text-sm text-gray-400">
                  Bucket list is empty
                </p>
                <p className="mt-1 text-xs text-gray-300">
                  Tell the AI to add places!
                </p>
              </div>
            )}
            {bucketList.map((item) => (
              <div
                key={item.id}
                className="group flex items-start gap-3 rounded-xl border border-gray-100 p-3 transition-all hover:border-purple-200 hover:bg-purple-50/30"
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-purple-400" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.destination}
                    </p>
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${priorityColors[item.priority]}`}
                    >
                      {item.priority}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">{item.country}</p>
                  {item.notes && (
                    <p className="mt-1 text-[11px] text-gray-500 italic">
                      {item.notes}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => onRemoveBucketItem(item.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-3.5 w-3.5 text-gray-300 hover:text-red-400" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── Bookings ───────────────────────────────────── */}
        {activeTab === "bookings" && (
          <div className="space-y-2.5">
            {bookings.length === 0 && (
              <div className="py-12 text-center">
                <Plane className="mx-auto h-10 w-10 text-gray-200" />
                <p className="mt-3 text-sm text-gray-400">No bookings yet</p>
                <p className="mt-1 text-xs text-gray-300">
                  Book flights & hotels through the AI
                </p>
              </div>
            )}
            {bookings.map((b) => (
              <div
                key={b.id}
                className="flex items-center gap-3 rounded-xl border border-gray-100 p-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-sm">
                  {b.type === "flight" ? "✈️" : "🏨"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {b.itemName}
                  </p>
                  <p className="text-[11px] text-gray-400">{b.details}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">
                    ${b.price}
                  </p>
                  <span
                    className={`text-[10px] font-bold ${
                      b.status === "confirmed"
                        ? "text-green-600"
                        : b.status === "cancelled"
                          ? "text-red-500"
                          : "text-amber-600"
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

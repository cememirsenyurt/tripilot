/** A geographic point on the map */
export interface LatLng {
  lat: number;
  lng: number;
}

/** A destination pin on the world map */
export interface Destination {
  id: string;
  name: string;
  country: string;
  coords: LatLng;
  image?: string;
  description?: string;
  rating?: number;
}

/** A single day in a trip itinerary */
export interface ItineraryDay {
  day: number;
  date: string;
  title: string;
  activities: {
    time: string;
    activity: string;
    location: string;
    coords: LatLng;
    type: "sightseeing" | "food" | "transport" | "hotel" | "activity";
  }[];
}

/** A full trip plan */
export interface Trip {
  id: string;
  destination: string;
  country: string;
  coords: LatLng;
  startDate: string;
  endDate: string;
  days: ItineraryDay[];
  totalBudget: number;
  status: "planned" | "booked" | "completed";
  coverImage?: string;
}

/** A bucket list item */
export interface BucketListItem {
  id: string;
  destination: string;
  country: string;
  coords: LatLng;
  notes?: string;
  addedAt: string;
  priority: "dream" | "next" | "someday";
}

/** Flight search result */
export interface Flight {
  id: string;
  airline: string;
  from: string;
  to: string;
  departTime: string;
  arriveTime: string;
  duration: string;
  stops: number;
  price: number;
  class: "economy" | "business" | "first";
}

/** Hotel search result */
export interface Hotel {
  id: string;
  name: string;
  location: string;
  rating: number;
  stars: number;
  pricePerNight: number;
  amenities: string[];
  image?: string;
}

/** Restaurant search result */
export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  location: string;
  rating: number;
  priceLevel: "$" | "$$" | "$$$" | "$$$$";
  description: string;
  mustTry?: string;
}

/** A booking */
export interface Booking {
  id: string;
  type: "flight" | "hotel";
  itemName: string;
  price: number;
  status: "pending" | "confirmed" | "cancelled";
  details: string;
}

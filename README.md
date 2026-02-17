# Tripilot

An AI travel planner built on **CopilotKit Cloud**. A full-screen world map with an AI copilot that plans trips, searches real flights/hotels/restaurants, manages a bucket list, and handles mock bookings with a checkout flow — all with generative UI rendered directly in the chat.

---

## Setup

```bash
git clone https://github.com/cememirsenyurt/tripilot.git
cd tripilot
npm install
```

Create a `.env` file:

```env
NEXT_PUBLIC_COPILOTKIT_PUBLIC_API_KEY=your_copilotkit_cloud_key
```

```bash
npm run dev
```

Open [localhost:3000](http://localhost:3000). Click the chat icon to open the AI sidebar.

---

## What I Built

A travel planner where the AI copilot is a **first-class participant** — it doesn't just answer questions, it takes actions that update the map, create trips, and process bookings in real time.

### The CopilotKit Integration

This project uses **CopilotKit Cloud** (`publicApiKey`) — zero backend, no self-hosted runtime. CopilotKit handles the LLM on their infrastructure.

**Shared state** (`useCopilotReadable`): The AI sees the user's trips, bucket list, bookings, and a curated list of world destinations. It references this data naturally in conversation.

**7 actions with generative UI** (`useCopilotAction` + `render`):

| Action | What It Does | Generative UI |
|---|---|---|
| `planTrip` | Day-by-day itinerary with real GPS coords | Trip card + map pins + route lines |
| `searchFlights` | Real airlines, routes, prices from AI knowledge | Flight comparison cards with direct/stop badges |
| `searchHotels` | Real hotel names, ratings, amenities | Hotel listing with star ratings |
| `searchRestaurants` | Real restaurants, cuisines, must-try dishes | Restaurant cards with price levels |
| `addToBucketList` | Pin destinations on the map | Star confirmation + map pin |
| `bookTrip` | Queue items for checkout | "Proceed to Checkout" button (human-in-the-loop) |
| `createTripCard` | Visual comparisons, budgets, tips | Grid cards with colored headers |

**Human-in-the-loop**: The `bookTrip` action doesn't auto-complete. It renders a "Proceed to Checkout" button in the chat. Clicking it opens a checkout modal with pre-filled card info, a processing animation, and a confirmation screen. The user controls when money moves.

**Key design decision — AI as search engine**: Instead of integrating external flight/hotel APIs (which would require API keys, OAuth flows, and rate limits), the AI uses its own knowledge to provide real data. GPT-4o knows real hotel names, real airlines that fly specific routes, realistic prices, and accurate ratings. The actions accept structured JSON from the AI and render it as rich UI. This is simpler, requires zero external dependencies, and produces more conversational results.

### Architecture

```
src/
├── app/
│   ├── page.tsx              # Orchestrator — state, 7 CopilotKit hooks, layout
│   ├── providers.tsx         # CopilotKit Cloud provider + sidebar config
│   ├── layout.tsx            # Root layout (Inter font, Leaflet CSS)
│   └── globals.css           # Tailwind + CopilotKit overrides
├── components/
│   ├── WorldMap.tsx           # Leaflet map (dynamic import, SSR-safe)
│   ├── TripPanel.tsx          # Left panel — trips, bucket list, bookings tabs
│   └── CheckoutModal.tsx      # 3-step mock checkout (review → process → confirm)
└── lib/
    ├── types.ts               # All TypeScript interfaces
    └── data.ts                # Seed destinations + sample trip/bucket list
```

**Why this structure:**
- **`page.tsx` as orchestrator**: All CopilotKit hooks live here because they need access to state setters. The hooks are the app's brain — `useCopilotReadable` shares context, `useCopilotAction` defines capabilities. Keeping them together makes the AI's relationship to state explicit.
- **Components are pure UI**: `WorldMap`, `TripPanel`, `CheckoutModal` receive props and render. No business logic, no CopilotKit awareness. Testable in isolation.
- **`lib/` is data + types**: Types in one file, seed data in another. Zero runtime logic. The AI generates all flight/hotel/restaurant data — no mock generators needed.
- **Dynamic import for Leaflet**: `next/dynamic` with `ssr: false` prevents `window is not defined` errors. The map initializes client-side with a `cancelled` flag to handle React strict mode double-mounting.

---

## What I'd Improve With More Time

- **AG-UI protocol** — wire up a LangGraph agent for multi-step trip planning (compare 3 cities → pick best → plan itinerary → book, all in one conversation)
- **Real APIs** — plug Amadeus/Kiwi.com for live flight prices, Google Places for restaurant data
- **Persistent storage** — save trips and bookings to a database so they survive page refresh
- **Drag-and-drop itinerary** — reorder days and activities on the trip panel
- **Map interactions** — click-to-add destinations, draw custom routes, drag pins
- **Calendar view** — show itinerary days on a calendar grid

## AI Tools Used

Built with **Cursor** (AI coding assistant). Used for:
- Scaffolding the Next.js project and component structure
- Implementing CopilotKit Cloud hooks based on their SDK docs
- Building the Leaflet map integration with dynamic imports
- Designing the checkout modal flow

All architectural decisions (Cloud over self-hosted, AI-as-search-engine, `handler`+`render` pattern, dynamic imports) were made deliberately after researching CopilotKit's documentation and examples.

---

## Tech Stack

- **Next.js 15** — App Router, TypeScript, standalone output
- **Tailwind CSS 4** — utility-first styling
- **CopilotKit Cloud** — `@copilotkit/react-core`, `@copilotkit/react-ui`
- **Leaflet** — interactive world map (CARTO Voyager tiles, no API key)
- **Lucide React** — icons

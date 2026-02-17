# Tripilot

An AI travel planner built on **CopilotKit Cloud**. A world map with an AI copilot sidebar that plans trips, searches flights and hotels, manages a bucket list, and handles bookings — all with generative UI rendered directly in the chat.

**Repo:** [github.com/cememirsenyurt/tripilot](https://github.com/cememirsenyurt/tripilot)

---

## What I Built

A full-screen world map with a left panel (trips, bucket list, bookings) and a CopilotKit-powered AI sidebar. The AI doesn't just answer questions — it takes actions that update the map and UI in real time.

### CopilotKit Integration (the core)

| Feature | Implementation |
|---|---|
| **CopilotKit Cloud** | `publicApiKey` — zero backend setup, CopilotKit handles the LLM |
| **Shared State** | `useCopilotReadable` exposes trips, bucket list, bookings, and world destinations to the AI |
| **Generative UI** | 6 `useCopilotAction` hooks with custom `render` functions that display flight cards, hotel listings, trip summaries, and booking confirmations inline in the chat |
| **Human-in-the-Loop** | `bookTrip` action requires explicit user approval before confirming a booking |
| **Map Integration** | AI-planned trips automatically show as pins and route lines on the Leaflet world map |

### CopilotKit Actions

| Action | What it does | Generative UI |
|---|---|---|
| `planTrip` | Creates a day-by-day itinerary with real coordinates | Trip confirmation card, map pins & routes |
| `searchFlights` | Returns flight options with airlines, times, prices | Flight comparison cards with direct/stop badges |
| `searchHotels` | Returns hotel options with ratings and amenities | Hotel listing cards with star ratings |
| `addToBucketList` | Saves a destination with priority level | Star confirmation card, map pin |
| `bookTrip` | Initiates a booking with confirmation UI | Approve/Cancel buttons (human-in-the-loop) |
| `createTripCard` | Flexible visual cards for comparisons, budgets, tips | Grid cards with colored headers |

---

## Architecture

```
src/
├── app/
│   ├── page.tsx           # Orchestrator: state, CopilotKit hooks, layout
│   ├── providers.tsx      # CopilotKit Cloud provider + sidebar config
│   ├── layout.tsx         # Root layout with Inter font + Leaflet CSS
│   └── globals.css        # Tailwind + map styles
├── components/
│   ├── WorldMap.tsx       # Leaflet map (dynamic import, SSR-safe)
│   └── TripPanel.tsx      # Left panel: trips, bucket list, bookings
└── lib/
    ├── types.ts           # All TypeScript interfaces
    └── data.ts            # Seed data + mock flight/hotel generators
```

**Key decisions:**
- **CopilotKit Cloud** over self-hosted runtime — simpler architecture, no API key management, CopilotKit handles the LLM
- **Dynamic import** for Leaflet — avoids `window is not defined` SSR errors
- **Mock generators** for flights/hotels — returns realistic randomized data so the app works without external API keys
- **All state in React** — trips, bucket list, and bookings live in `useState` and are shared with the AI via `useCopilotReadable`

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

Run:

```bash
npm run dev
```

Open [localhost:3000](http://localhost:3000). Click the chat icon to open the AI sidebar.

---

## What I'd Improve With More Time

- **Real flight/hotel APIs** — plug in Amadeus or Kiwi.com for live pricing
- **AG-UI protocol** — connect a LangGraph agent for multi-step trip planning with tool chaining
- **Persistent storage** — save trips and bookings to a database
- **Drag-and-drop itinerary** — reorder days and activities visually
- **Map interactions** — click-to-add destinations, draw custom routes
- **Mobile responsive** — current layout is desktop-only

## AI Tools Used

Built with **Cursor** (AI coding assistant). Used for:
- Scaffolding the project and component structure
- Implementing CopilotKit Cloud hooks based on their SDK docs
- Building the Leaflet map integration with dynamic imports
- Generating realistic mock data for flights and hotels

All architectural decisions (Cloud vs self-hosted, mock generators vs external APIs, action/render patterns) were made deliberately.

---

## Tech Stack

- **Next.js 15** — App Router, standalone output
- **TypeScript** — end-to-end type safety
- **Tailwind CSS 4** — utility-first styling
- **CopilotKit Cloud** — `@copilotkit/react-core`, `@copilotkit/react-ui`
- **Leaflet + react-leaflet** — interactive world map (CARTO Voyager tiles)
- **Lucide React** — icon library

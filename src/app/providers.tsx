"use client";

import "@copilotkit/react-ui/styles.css";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";

/**
 * CopilotKit Cloud provider.
 * Uses publicApiKey — no self-hosted runtime needed.
 * CopilotKit Cloud handles the LLM (GPT-4o) on their infrastructure.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const apiKey = process.env.NEXT_PUBLIC_COPILOTKIT_PUBLIC_API_KEY ?? "";

  return (
    <CopilotKit publicApiKey={apiKey}>
      <CopilotSidebar
        labels={{
          title: "Tripilot AI",
          initial:
            "Hey! I'm your AI travel planner. Tell me where you want to go and I'll plan your dream trip — flights, hotels, day-by-day itinerary, all on the map. Try: \"Plan a 5-day trip to Tokyo\"",
        }}
        defaultOpen={false}
        clickOutsideToClose={false}
        instructions={`You are Tripilot, an expert AI travel planner. You have access to the user's bucket list, current trips, and a world map.

When the user asks you to PLAN a trip, use the planTrip action. Create a detailed day-by-day itinerary with real destinations, coordinates, and activities. Include mix of popular and hidden-gem spots.

When the user asks about FLIGHTS, use searchFlights to show realistic flight options with prices, airlines, and times.

When the user asks about HOTELS, use searchHotels to show hotel options with ratings, prices, and amenities.

When the user wants to ADD a place to their bucket list, use addToBucketList.

When the user wants to BOOK something, use bookTrip which requires their confirmation (human-in-the-loop).

When the user asks to VISUALIZE or COMPARE trips, use createTripCard to render beautiful visual cards.

Always be specific with real place names, realistic prices (USD), actual coordinates, and practical travel advice. You can see the user's existing trips and bucket list — reference them naturally.

Be enthusiastic about travel! Use your knowledge of real destinations, cuisines, cultures, and logistics.`}
      >
        {children}
      </CopilotSidebar>
    </CopilotKit>
  );
}

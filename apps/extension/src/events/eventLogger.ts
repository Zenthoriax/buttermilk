// FILE: apps/extension/src/tracking/eventLogger.ts

// Adjust this relative path depending on how your monorepo is linked.
// If you have a package.json dependency like "@outcognito/event-schema", use that instead!
import { OutcognitoEventSchema, OutcognitoEvent } from "../../../../packages/event-schema/src/index";
/**
 * Validates raw data against the Zod schema and saves it to a persistent event log.
 */
export async function logValidatedEvent(rawData: unknown): Promise<boolean> {
  // 1. Validate the incoming data against your schema
  const validationResult = OutcognitoEventSchema.safeParse(rawData);

  if (!validationResult.success) {
    // If it fails, drop the data and log exactly why it failed
    console.error("🚨 [Event Logger] Schema Validation Failed! Data dropped.", validationResult.error.format());
    return false;
  }

  const validEvent: OutcognitoEvent = validationResult.data;

  try {
    // 2. Fetch the existing event log from Chrome Storage
    const storage = await chrome.storage.local.get({ eventLog: [] });
    const currentEvents: OutcognitoEvent[] = storage.eventLog;

    // 3. Add the new, validated event to the array
    currentEvents.push(validEvent);

    // Optional: Keep the log from growing infinitely large (e.g., keep last 1000 events)
    if (currentEvents.length > 1000) {
      currentEvents.shift(); 
    }

    // 4. Save the updated log back to storage
    await chrome.storage.local.set({ eventLog: currentEvents });
    
    console.log(`✅ [Event Logger] Successfully logged validated event: ${validEvent.eventType}`);
    return true;

  } catch (error) {
    console.error("🚨 [Event Logger] Failed to save validated event to storage:", error);
    return false;
  }
}
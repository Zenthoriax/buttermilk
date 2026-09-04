import { createReturnEvent } from "../events/eventFactory";
import { logValidatedEvent } from "../events/eventLogger";

interface Visit {
  domain: string;
  time: number;
}

export async function analyzePatterns(domain: string, category: string) {
  const now = Date.now();
  const FIVE_MINUTES_MS = 5 * 60 * 1000;

  // 1. Pull the history from Chrome's session storage instead of a local variable!
  const storage = await chrome.storage.session.get({ globalHistory: [] });
  let history: Visit[] = storage.globalHistory;

  // 2. Record the new visit
  history.push({ domain, time: now });

  // 3. Prune visits older than 5 minutes
  history = history.filter((v: Visit) => now - v.time <= FIVE_MINUTES_MS);
  
  // 4. Save it safely back to session storage before the Service Worker dies
  await chrome.storage.session.set({ globalHistory: history });

  const count = history.length;
  if (count < 3) return; 

  // 5. Analyze "Thrashing"
  let rapidSwitches = 0;
  for (let i = 1; i < count; i++) {
    if (history[i].time - history[i-1].time < 15000) {
      rapidSwitches++;
    }
  }

  // 6. Calculate Roastability
  let roastScore = 0.2; 
  if (rapidSwitches >= 2) {
     roastScore += (rapidSwitches * 0.3);
  } else {
     roastScore += ((count - 3) * 0.05); 
  }
  roastScore = Math.min(roastScore, 1.0);

  if (count >= 5 || rapidSwitches >= 2) {
    const eventPayload = createReturnEvent(domain, category, count, 300, roastScore);
    await logValidatedEvent(eventPayload);
    
    console.log(`🔥 [Pattern Engine] Thrashing detected! Total Switches: ${count}. Rapid Switches: ${rapidSwitches}. Frustration Score: ${roastScore}`);
  }
}
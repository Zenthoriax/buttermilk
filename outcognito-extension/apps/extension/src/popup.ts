import { getDailyStats } from "./storage/storage";

/**
 * Converts raw seconds into a readable string (e.g., "12m 34s")
 */
function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

async function initPopup() {
  const stats = await getDailyStats();

  // 1. Update Total Active Time
  const totalTimeEl = document.getElementById("total-time");
  if (totalTimeEl) {
    totalTimeEl.textContent = formatTime(stats.activeSeconds);
  }

  // 2. Update AI Visits
  const aiVisitsEl = document.getElementById("ai-visits");
  if (aiVisitsEl) {
    aiVisitsEl.textContent = stats.aiVisits.toString();
  }

  // 3. Update Category Breakdown
  const containerEl = document.getElementById("category-container");
  if (!containerEl) return;

  // Clear any existing content
  containerEl.innerHTML = "";

  const categories = Object.entries(stats.categorySeconds);
  if (categories.length === 0) {
    containerEl.innerHTML = "<p style='color: var(--text-muted); font-size: 0.9rem;'>No browsing data yet today.</p>";
    return;
  }

  // Sort categories by time spent (descending)
  categories.sort((a, b) => b[1] - a[1]);

  // Find the maximum time to calculate relative bar widths
  const maxTime = categories[0][1];

  for (const [category, seconds] of categories) {
    // Ensure even small values get at least a 5% sliver of a bar so they are visible
    const percentage = Math.max(5, Math.round((seconds / maxTime) * 100));

    // Create the standard DOM wrapper for the category item
    const itemDiv = document.createElement("div");
    
    // Header containing name and time
    const headerDiv = document.createElement("div");
    headerDiv.className = "category-item";
    
    const nameSpan = document.createElement("span");
    nameSpan.textContent = category.charAt(0).toUpperCase() + category.slice(1);
    
    const timeSpan = document.createElement("span");
    timeSpan.textContent = formatTime(seconds);

    headerDiv.appendChild(nameSpan);
    headerDiv.appendChild(timeSpan);

    // Visual bar using standard div styling
    const bgDiv = document.createElement("div");
    bgDiv.className = "bar-bg";

    const fillDiv = document.createElement("div");
    fillDiv.className = "bar-fill";
    fillDiv.style.width = `${percentage}%`;

    bgDiv.appendChild(fillDiv);

    // Assemble the components
    itemDiv.appendChild(headerDiv);
    itemDiv.appendChild(bgDiv);

    containerEl.appendChild(itemDiv);
  }
}

// Run the initialization as soon as the popup's HTML has loaded
document.addEventListener("DOMContentLoaded", initPopup);
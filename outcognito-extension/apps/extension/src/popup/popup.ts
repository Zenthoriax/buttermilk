import { getDailyStats } from "../storage/storage";

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

  // 3. Update Category Breakdown Bars
  const containerEl = document.getElementById("category-container");
  if (!containerEl) return;

  containerEl.innerHTML = "";

  const categories = Object.entries(stats.categorySeconds);
  if (categories.length === 0) {
    containerEl.innerHTML = "<p style='color: var(--text-muted); font-size: 0.9rem;'>No browsing data yet today.</p>";
    return;
  }

  // Sort by highest time first
  categories.sort((a, b) => b[1] - a[1]);
  const maxTime = categories[0][1];

  for (const [category, seconds] of categories) {
    const percentage = Math.max(5, Math.round((seconds / maxTime) * 100));

    const itemDiv = document.createElement("div");
    
    const headerDiv = document.createElement("div");
    headerDiv.className = "category-item";
    
    const nameSpan = document.createElement("span");
    nameSpan.textContent = category.charAt(0).toUpperCase() + category.slice(1);
    
    const timeSpan = document.createElement("span");
    timeSpan.textContent = formatTime(seconds);

    headerDiv.appendChild(nameSpan);
    headerDiv.appendChild(timeSpan);

    const bgDiv = document.createElement("div");
    bgDiv.className = "bar-bg";

    const fillDiv = document.createElement("div");
    fillDiv.className = "bar-fill";
    fillDiv.style.width = `${percentage}%`;

    bgDiv.appendChild(fillDiv);
    itemDiv.appendChild(headerDiv);
    itemDiv.appendChild(bgDiv);

    containerEl.appendChild(itemDiv);
  }
}

// Initial load when popup opens
initPopup().catch(console.error);

// Listen for real-time updates from the background worker
chrome.storage.local.onChanged.addListener((changes) => {
  if (changes.dailyStats) {
    initPopup().catch(console.error);
  }
});
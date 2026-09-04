// 1. Helper function to format seconds into readable text
function formatTime(totalSeconds: number): string {
  if (!totalSeconds) return "0s";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

// 2. Create the container
const container = document.createElement("div");
container.id = "outcognito-glass-root";

// 3. Build the standard DOM structure (No Canvas allowed)
container.innerHTML = `
  <div class="outcognito-header">Outcognito</div>
  
  <div class="outcognito-stats-grid">
    <div class="outcognito-stat-box">
      <div class="outcognito-label">Total Time</div>
      <div class="outcognito-value" id="outcognito-total-time">0s</div>
    </div>
    <div class="outcognito-stat-box">
      <div class="outcognito-label">AI Time</div>
      <div class="outcognito-value" id="outcognito-ai-time">0s</div>
    </div>
    <div class="outcognito-stat-box full-width">
      <div class="outcognito-label">Tab Switches</div>
      <div class="outcognito-value" id="outcognito-tab-switches">0</div>
    </div>
  </div>

  <div class="outcognito-header" style="font-size: 11px; margin-top: 4px;">Time By Niche</div>
  <div class="outcognito-categories-section" id="outcognito-category-bars">
    <!-- Bars will be injected here dynamically -->
  </div>
`;

// 4. Inject into the webpage
document.body.appendChild(container);

// 5. Listen for toggle commands and populate data
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "TOGGLE_DASHBOARD") {
    container.classList.toggle("active");
    
    if (container.classList.contains("active")) {
      chrome.runtime.sendMessage({ type: "GET_DAILY_STATS" }, (response) => {
        if (response?.success && response.data) {
          const stats = response.data;
          
          // A. Update Top Stats
          const aiSeconds = stats.categorySeconds?.['ai'] || 0;
          document.getElementById("outcognito-total-time")!.innerText = formatTime(stats.activeSeconds);
          document.getElementById("outcognito-ai-time")!.innerText = formatTime(aiSeconds);
          document.getElementById("outcognito-tab-switches")!.innerText = (stats.tabSwitches || 0).toString();

          // B. Build Category Bars
          const barsContainer = document.getElementById("outcognito-category-bars")!;
          barsContainer.innerHTML = ''; // Clear previous bars

          if (!stats.categorySeconds || Object.keys(stats.categorySeconds).length === 0) {
            barsContainer.innerHTML = '<div class="outcognito-label" style="text-align:center; opacity:0.5;">No data yet</div>';
            return;
          }

          // Sort categories by time spent (highest to lowest)
          const sortedCategories = Object.entries(stats.categorySeconds)
            .sort((a, b) => (b[1] as number) - (a[1] as number));

          // Generate a DOM bar for each category
          sortedCategories.forEach(([category, seconds]) => {
            const sec = seconds as number;
            // Calculate width percentage relative to total active time
            const percent = stats.activeSeconds > 0 ? (sec / stats.activeSeconds) * 100 : 0;

            barsContainer.innerHTML += `
              <div class="outcognito-category-row">
                <div class="outcognito-category-header">
                  <span>${category}</span>
                  <span>${formatTime(sec)}</span>
                </div>
                <div class="outcognito-bar-bg">
                  <div class="outcognito-bar-fill" style="width: ${percent}%;"></div>
                </div>
              </div>
            `;
          });
        }
      });
    }
  }
});
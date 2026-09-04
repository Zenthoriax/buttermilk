// 1. Create the container
const container = document.createElement("div");
container.id = "outcognito-glass-root";

// 2. Build the standard DOM structure (No Canvas)
container.innerHTML = `
  <div class="outcognito-header">Outcognito</div>
  
  <div class="outcognito-stat-box">
    <div class="outcognito-label">Total AI Visits</div>
    <div class="outcognito-value" id="outcognito-ai-visits">0</div>
  </div>

  <div class="outcognito-stat-box">
    <div class="outcognito-label">Tab Switches</div>
    <div class="outcognito-value" id="outcognito-tab-switches">0</div>
  </div>
`;

// 3. Inject into the webpage
document.body.appendChild(container);

// 4. Listen for toggle commands from the Background Worker
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "TOGGLE_DASHBOARD") {
    container.classList.toggle("active");
    
    // If we just opened it, fetch fresh stats via your Local API!
    if (container.classList.contains("active")) {
      chrome.runtime.sendMessage({ type: "GET_DAILY_STATS" }, (response) => {
        if (response?.success && response.data) {
          document.getElementById("outcognito-ai-visits")!.innerText = response.data.aiVisits.toString();
          document.getElementById("outcognito-tab-switches")!.innerText = response.data.tabSwitches.toString();
        }
      });
    }
  }
});
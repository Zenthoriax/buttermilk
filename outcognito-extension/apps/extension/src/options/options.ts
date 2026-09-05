document.addEventListener("DOMContentLoaded", () => {
  const clearBtn = document.getElementById("btn-clear-data") as HTMLButtonElement | null;
  const statusMsg = document.getElementById("status-msg") as HTMLParagraphElement | null;

  if (!clearBtn) return;

  clearBtn.addEventListener("click", async () => {
    try {
      // Completely remove the daily tracking data from Chrome's database
      await chrome.storage.local.remove("dailyStats");
      
      // Update the UI to show success
      if (statusMsg) {
        statusMsg.textContent = "Data successfully cleared. Starting fresh!";
        statusMsg.style.color = "#03dac6"; // Success green
        
        // Clear the message after 3 seconds
        setTimeout(() => {
          statusMsg.textContent = "";
        }, 3000);
      }
    } catch (error) {
      console.error("Failed to clear data:", error);
      if (statusMsg) {
        statusMsg.textContent = "Error clearing data. Check console.";
        statusMsg.style.color = "#cf6679"; // Error red
      }
    }
  });
});
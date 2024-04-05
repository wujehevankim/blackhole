// Listen for the DOMContentLoaded event to ensure the DOM is fully loaded before attempting to apply styles or effects
document.addEventListener('DOMContentLoaded', () => {
  // Check if the current domain is one of the stored domains and should have effects applied
  chrome.storage.local.get('domains', (data) => {
      const currentDomain = new URL(window.location.href).hostname;
      const matchedDomain = Object.keys(data.domains || {}).find(domain => currentDomain.endsWith(domain));
      
      if (matchedDomain && data.domains[matchedDomain]) {
          // If the current domain matches a stored domain, apply the general stylesheet
          const link = document.createElement("link");
          link.href = chrome.runtime.getURL("main.css");
          link.type = "text/css";
          link.rel = "stylesheet";
          document.head.appendChild(link);

          // After applying the general stylesheet, check and apply specific effects based on user preferences
          applyEffects();
      }
  });
});

// Function to apply or remove effects based on stored user preferences
function applyEffects() {
  chrome.storage.local.get('effects', (data) => {
      const body = document.body;
      // Toggle classes based on the effects that are set to true in storage
      body.classList.toggle('grayscale', !!data.effects.grayscale);
      body.classList.toggle('horizontal-flip', !!data.effects['horizontal-flip']);
      body.classList.toggle('vertical-flip', !!data.effects['vertical-flip']);
      body.classList.toggle('mosaic', !!data.effects.mosaic);
  });
}

// Listen for a message from popup.js indicating that the effects settings have been updated
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateEffects") {
      applyEffects(); // Re-apply effects based on the potentially updated preferences
  }
});

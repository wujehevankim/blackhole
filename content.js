// Listen for the DOMContentLoaded event to ensure the DOM is fully loaded before attempting to apply styles or effects
document.addEventListener('DOMContentLoaded', () => {
  // Check if the current domain is one of the stored domains and should have effects applied
  chrome.storage.local.get('domains', (data) => {
      // Extract the hostname from the current page's URL
      const currentDomain = new URL(window.location.href).hostname;
      // Check if the current domain matches any of the domains stored in 'domains'
      const matchedDomain = Object.keys(data.domains || {}).find(domain => currentDomain.endsWith(domain));
      
      // If there is a match and the matched domain is configured to have effects applied
      if (matchedDomain && data.domains[matchedDomain]) {
          // Create a <link> element to link the general stylesheet
          const link = document.createElement("link");
          link.href = chrome.runtime.getURL("main.css"); // Set the href to the URL of the main.css file in the extension
          link.type = "text/css"; // Set the MIME type for the link element
          link.rel = "stylesheet"; // Specify the relationship as a stylesheet
          document.head.appendChild(link); // Add the <link> element to the <head> of the document

          // After applying the general stylesheet, check and apply specific effects based on user preferences
          applyEffects();
      }
  });
});



// Function to apply or remove effects based on stored user preferences
function applyEffects() {
  chrome.storage.local.get('effects', (data) => {
      const body = document.body; // Shortcut to access the document's body
      // For each effect (e.g., grayscale, flip), toggle the class on the body element if the effect is enabled
      body.classList.toggle('grayscale', !!data.effects.grayscale); // Toggle 'grayscale' class
      body.classList.toggle('horizontal-flip', !!data.effects['horizontal-flip']); // Toggle 'horizontal-flip' class
      body.classList.toggle('vertical-flip', !!data.effects['vertical-flip']); // Toggle 'vertical-flip' class
      body.classList.toggle('mosaic', !!data.effects.mosaic); // Toggle 'mosaic' class
  });
}



// Listen for a message from popup.js indicating that the effects settings have been updated
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Check if the message action is to update the effects
  if (request.action === "updateEffects") {
      applyEffects(); // Call applyEffects to re-apply effects based on the potentially updated preferences
  }
});

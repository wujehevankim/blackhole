// Listen for when the extension is installed or updated.
chrome.runtime.onInstalled.addListener(() => {
  // Retrieve the 'domains' object from local storage, or initialize it as an empty object if it doesn't exist.
    chrome.storage.local.get({domains: {}}, (result) => {
      // Check if the 'domains' object is empty by checking the length of its keys array.
      if (Object.keys(result.domains).length === 0) { // Check if domains object is empty
        // Initialize with default domains set to true
        // This initializes the storage with a predefined list of domains, setting their value to true.
        chrome.storage.local.set({
          domains: {
            'youtube.com': true,
            'instagram.com': true,
            'facebook.com': true
          }
        });
      }
    });
  });
  




chrome.action.onClicked.addListener(() => {
    // Query all tabs
    chrome.tabs.query({}, (tabs) => {
        // Iterate through the list of tabs
        tabs.forEach((tab) => {
            // Check if the tab has an ID and a URL (indicating it's a valid, loaded web page)
            if (tab.id && tab.url) {
                // Execute the script on each tab
                chrome.scripting.executeScript({
                    target: {tabId: tab.id},
                    files: ['content.js']
                });
            }
        });
    });
});





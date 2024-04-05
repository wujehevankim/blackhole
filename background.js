chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get({domains: {}}, (result) => {
      if (Object.keys(result.domains).length === 0) { // Check if domains object is empty
        // Initialize with default domains set to true
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
  
  chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });
  });
  
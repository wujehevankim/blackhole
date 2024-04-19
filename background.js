// AS SOON AS POPUP IS OPENED FOR THE FIRST TIME
function setDefaultToggleStates() {
    chrome.storage.local.get('toggleStates', function (result) {
        if (!result.toggleStates) {  // Check if the toggleStates object is not already set
            const defaultToggleStates = {
                grayscale: false,
                mosaic: false,
                verticalFlip: false,
                horizontalFlip: false
            };
            chrome.storage.local.set({toggleStates: defaultToggleStates}, function() {
                if (chrome.runtime.lastError) {
                    console.error('Error setting default toggle states:', chrome.runtime.lastError);
                } else {
                    console.log('Default toggle states set successfully.');
                }
            });
        }
    });
}
// Call this function when the extension is loaded or reloaded
setDefaultToggleStates();






// FOR RELOADING, REFRESHING, OR OPENING UP A NEW TAB
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    // Ensures the tab's URL is fully loaded
    //console.log("Tab updated:", tabId, changeInfo, tab);
    //console.log(tab.url);
    if (changeInfo.status === 'complete') {
        console.log('trying out checkDomainAndApplyStyles');
        checkDomainAndApplyStyles(tab.url);
    }
});


// FOR NAVIGATING TO AN EXISTING TAB (AKA "SWITCHING TABS")
chrome.tabs.onActivated.addListener(function(activeInfo) {
    // Use the tabId with the activeInfo object to get the tab object
    chrome.tabs.get(activeInfo.tabId, function(tab) {
        if (!chrome.runtime.lastError && tab.url && tab.status === 'complete') {
            console.log('Tab activated:', tab);
            checkDomainAndApplyStyles(tab.url);
        } else if (chrome.runtime.lastError) {
            console.error('Error retrieving tab information:', chrome.runtime.lastError);
        }
    });
});


// FOR MAKING THE TOGGLE EFFECT HAPPEN ~ON~ THE TAB I AM CURRENTLY ON
// Listener for changes in chrome storage (for example, when toggle states change)
chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (let key in changes) {
        let storageChange = changes[key];
        console.log('Storage key "%s" in namespace "%s" changed. ' +
                    'Old value was "%s", new value is "%s".',
                    key, namespace, storageChange.oldValue, storageChange.newValue);
    }

    // Apply styles immediately to the currently active tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0] && tabs[0].url) {
            checkDomainAndApplyStyles(tabs[0].url);
        }
    });
});




function checkDomainAndApplyStyles(url) {
    try {
        let newUrl = new URL(url);
        //console.log('url is ' + newUrl);
        let domain = newUrl.hostname.replace(/^www\./, ''); // Strips 'www' from the URL to standardize
        //console.log('domain is ' + domain);
        
        /*
        chrome.storage.local.get(['domains'], function(result) {
            if (result.domains) {
                console.log('Stored domains: ' + result.domains); // Logs the stored domains if they exist
            } else {
                console.log('No stored domains found.'); // Logs if there are no stored domains
            }
        });
        */

        
        chrome.storage.local.get(['domains', 'toggleStates'], function (result) {
            if (result.domains && result.domains.includes(domain)) {
                
                
                console.log('domain ' + domain + ' extracted from ' + newUrl + ' is one of the saved domains');
                console.log('Stored domains: ' + result.domains);
                console.log('trying out ' + 'applyStylesToTab now');
                applyStylesToTab(domain, result.toggleStates);
            }
            else {
                console.log('current tab is not one of the saved domains');
            }
        });
        
    } catch (error) {
        console.error('Error extracting domain from URL:', error);
    }
}



function applyStylesToTab(domain, toggleStates) {
    let cssStyles = '';

    // Generate CSS styles based on toggleStates
    if (toggleStates.grayscale) {
        cssStyles += 'body { filter: grayscale(100%); }';
        console.log('Applied grayscale filter.');
    }
    else if (toggleStates.mosaic) {
        cssStyles += 'body { filter: blur(10px); }';
        console.log('Applied mosaic blur.');
    }
    else if (toggleStates.verticalFlip) {
        cssStyles += 'body { transform: scaleY(-1); }';
        console.log('Applied vertical flip.');
    }
    else if (toggleStates.horizontalFlip) {
        cssStyles += 'body { transform: scaleX(-1); }';
        console.log('Applied horizontal flip.');
    }
    else {
        //nothing
    }

    // Check if any styles were generated
    if (cssStyles !== '') {
        // Apply the styles to the active tab
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            console.log('Applying styles to tab:', tabs[0]);
            chrome.scripting.insertCSS({
                target: {tabId: tabs[0].id},
                css: cssStyles
            }, function() {
                if (chrome.runtime.lastError) {
                    console.error('Failed to insert CSS:', chrome.runtime.lastError);
                } else {
                    console.log('CSS successfully injected.');
                }
            });
        });
    } else {
        console.log('No styles to apply.');
    }
}



chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    // Ensures the tab's URL is fully loaded
    //console.log("Tab updated:", tabId, changeInfo, tab);
    //console.log(tab.url);
    if (changeInfo.status === 'complete') {
        console.log('trying out checkDomainAndApplyStyles');
        checkDomainAndApplyStyles(tab.url);
    }
});

function checkDomainAndApplyStyles(url) {
    try {
        let newUrl = new URL(url);
        //console.log('url is ' + newUrl);
        let domain = newUrl.hostname.replace(/^www\./, ''); // Strips 'www' from the URL to standardize
        //console.log('domain is ' + domain);
        chrome.storage.local.get(['domains'], function(result) {
            if (result.domains) {
                console.log('Stored domains: ' + result.domains); // Logs the stored domains if they exist
            } else {
                console.log('No stored domains found.'); // Logs if there are no stored domains
            }
        });
        
        //chrome.storage.local.get(['domains', 'toggleStates'], function (result) {
        //    let isDomainOneOfTheSavedDomains = result.domains.includes(domain);
        //    console.log(isDomainOneOfTheSavedDomains);
            //if (result.domains && result.domains.includes(domain)) {
            //    applyStylesToTab(domain, result.toggleStates);
            //}
        //});
        
    } catch (error) {
        console.error('Error extracting domain from URL:', error);
    }
}



function applyStylesToTab(domain, toggleStates) {
    let cssStyles = '';

    if (toggleStates.grayscale) {
        cssStyles += 'body { filter: grayscale(100%); }';
    }
    if (toggleStates.mosaic) {
        cssStyles += 'body { filter: blur(10px); }';
    }
    if (toggleStates.verticalFlip) {
        cssStyles += 'body { transform: scaleY(-1); }';
    }
    if (toggleStates.horizontalFlip) {
        cssStyles += 'body { transform: scaleX(-1); }';
    }

    if (cssStyles !== '') {
        chrome.tabs.insertCSS({code: cssStyles});
    }
}

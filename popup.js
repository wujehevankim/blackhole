// PURPOSE 1:
// - Listen for DOM content to be fully loaded
// - Setup button listeners and input handling
// - Manage domain storage and display


// Listens for the complete loading of the DOM content of the popup.html
document.addEventListener('DOMContentLoaded', function () {
    

    
    // Retrieves the 'Add' button element from the document
    const addButton = document.getElementById('add');
    // Retrieves the input field where users enter URLs
    const input = document.getElementById('domain');
    // Retrieves the div element where domains will be displayed
    const domainsListDiv = document.getElementById('domainsList');


    








    // PURPOSE 2:
    // - Load and display previously stored domains when the popup is opened

    // Retrieves stored domains from local storage when the popup loads
    chrome.storage.local.get(['domains'], function (result) {
        if (result.domains) {
            // If stored domains exist, display them using the displayDomains function
            displayDomains(result.domains);
        }
    });








    // PURPOSE 3:
    // - Add new domains when the user clicks the 'Add' button
    
    // Adds an event listener to the 'Add' button for click events
    addButton.addEventListener('click', function () {
        // Retrieves the value from the input field (URL provided by the user)
        const url = input.value;
        // Extracts the domain from the URL
        const domain = extractDomain(url);
        // If a valid domain is extracted, store it using the storeDomain function
        if (domain) {
            storeDomain(domain);
            messageBox.style.display = 'none'; // Hide message box if the URL was valid
        } else {
            // Show error message
            showMessage('Please enter a valid URL.<br>It must start with "http://", "https://", or "www."');

        }
    });








    // Function to show message
    function showMessage(message) {
        const messageBox = document.getElementById('messageBox');
        messageBox.innerHTML = message;
        messageBox.style.display = 'block'; // Show the message box
        setTimeout(() => {
            messageBox.style.display = 'none'; // Automatically hide the message after 3 seconds
        }, 3000);
}



    
    
    // PURPOSE 4:
    // - Extract the domain name from a given URL

    // Function to extract the domain from a URL
    // after dinner: change it so that it accepts links starting with https://www. http://www. or www. only
    function extractDomain(url) {
        try {
            // Check if the URL starts with "www." and prepend "http://" to make it a valid URL
            if (url.startsWith('www.')) {
                url = 'http://' + url;
            }
            // Ensure that the URL starts with "http://" or "https://"
            if (!url.match(/^https?:\/\//)) {
                console.error('URL must start with "http://" or "https://"');
                return null;
            }
    
            const newUrl = new URL(url);
            const hostname = newUrl.hostname;
    
            // Use regex to validate the hostname format
            const domainPattern = /^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;
            if (!domainPattern.test(hostname)) {
                console.error('Invalid domain format:', hostname);
                return null;
            }
    
            // Return the hostname without "www."
            return hostname.replace(/^www\./, '');
        } catch (error) {
            console.error('Invalid URL:', error);
            return null;
        }
    }
    
    
    
    



    





    // PURPOSE 5:
    // - Store a new domain in the local storage

    // Function to store the domain
    function storeDomain(domain) {
        chrome.storage.local.get(['domains'], function (result) {
            let domains = Array.isArray(result.domains) ? result.domains : [];
            console.log('Retrieved domains:', domains); // Check what was retrieved
    
            if (!domains.includes(domain)) {
                domains.push(domain);
                domains.sort();
                console.log('Updated domains to be saved:', domains); // Verify domains before saving
    
                chrome.storage.local.set({domains: domains}, function () {
                    if (chrome.runtime.lastError) {
                        console.error('Error saving domains:', chrome.runtime.lastError); // Check for errors when saving
                    } else {
                        console.log('Domains successfully saved:', domains); // Confirmation of save
                        displayDomains(domains);
                    }
                });
            }
        });
    }
    





    // PURPOSE 6:
    // - Display the list of domains in the popup
    // Function to display domains
    function displayDomains(domains) {
        // Clears the current contents of the domains display div
        domainsListDiv.innerHTML = ''; 
        // Loops through each domain in the list
        domains.forEach(function (domain) {
            // Creates a new div element for each domain
            const domainDiv = document.createElement('div');
            domainDiv.className = 'domain-item'; // Apply the CSS class for styling
            domainDiv.textContent = domain;
            domainDiv.title = domain; // Set title for tooltip on hover
            domainDiv.style.marginLeft = '10px';
            domainDiv.style.marginBottom = '0px';
            
            // adding ellipsis when it's too long
            let displayText = domain.length > 15 ? domain.substring(0, 15) + '...' : domain;
            domainDiv.textContent = displayText;
            
    
            // Creates a new button element for removing the domain
            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'x';
            removeBtn.style.marginRight = '20px'; // Keep the margin for spacing the button, if needed
            removeBtn.style.marginBottom = '13px';
            removeBtn.style.cursor = 'pointer';
            removeBtn.onclick = function () {
                removeDomain(domain);
            };
    
            // Append the remove button to the domainDiv
            domainDiv.appendChild(removeBtn);
    
            // Append the domainDiv to the domains list container
            domainsListDiv.appendChild(domainDiv);
        });
    }
    






    // PURPOSE 7:
    // - remove the selected domain from the stored list and update the display accordingly.
    function removeDomain(domainToRemove) {
        chrome.storage.local.get(['domains'], function (result) {
            let domains = Array.isArray(result.domains) ? result.domains : [];
            // Filter out the domain to be removed
            const filteredDomains = domains.filter(domain => domain !== domainToRemove);
    
            // Update the stored domains
            chrome.storage.local.set({domains: filteredDomains}, function () {
                if (chrome.runtime.lastError) {
                    console.error('Error removing domain:', chrome.runtime.lastError);
                } else {
                    console.log('Domain removed successfully:', domainToRemove);
                    console.log('Saved domains now after removal:', filteredDomains);
                    displayDomains(filteredDomains); // Update the display
                    
                }
            });
        });
    }


    

    


});



















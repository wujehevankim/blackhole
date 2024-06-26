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
            displayDomains(result.domains);
        } else {
            displayDomains([]); // Pass an empty array if no domains are found
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
        if (domains.length === 0){
            domainsListDiv.innerHTML = "<div style='padding: 20px 0; color: #ccc; text-align: center;'>What websites are distracting you?</div>";
        }
        else{
            domains.forEach(function (domain) {
                // Creates a new div element for each domain
                const domainDiv = document.createElement('div');
                domainDiv.className = 'domain-item'; // Apply the CSS class for styling
                domainDiv.textContent = domain;
                domainDiv.title = domain; // Set title for tooltip on hover
                domainDiv.style.marginLeft = '10px';
                domainDiv.style.marginBottom = '0px';
                domainDiv.style.color = '#ccc';
                
                // adding ellipsis when it's too long
                let displayText = domain.length > 15 ? domain.substring(0, 15) + '...' : domain;
                domainDiv.textContent = displayText;
                
        
                // Creates a new button element for removing the domain
                const removeBtn = document.createElement('button');
                //removeBtn.textContent = 'x';
                removeBtn.innerHTML = '&#x2715;'; // Multiplication sign
                removeBtn.style.fontSize = '12px';
                removeBtn.style.marginRight = '20px'; // Keep the margin for spacing the button, if needed
                removeBtn.style.marginBottom = '10px';
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






    




    
    
    
    /*
    const effectToggles = document.querySelectorAll('.effect-toggle');
    chrome.storage.local.get(['domains', 'toggleStates'], function (result) {
        if (result.domains) {
            displayDomains(result.domains);
        }
        if (result.toggleStates) {
            updateToggleStates(result.toggleStates);
        }
    });

    // Set up listeners for each toggle and initialize their state
    effectToggles.forEach(toggle => {
        toggle.addEventListener('change', function () {
            const updatedStates = {};
            effectToggles.forEach(t => {
                updatedStates[t.id] = t.checked;
            });
            storeToggleStates(updatedStates);
            logToggleStates();
        });
    })

    function updateToggleStates(toggleStates) {
        for (const [key, value] of Object.entries(toggleStates)) {
            const toggle = document.getElementById(key);
            if (toggle) {
                toggle.checked = value;
            }
        }
    }

    function storeToggleStates(toggleStates) {
        chrome.storage.local.set({ toggleStates: toggleStates }, function () {
            if (chrome.runtime.lastError) {
                console.error('Error saving toggle states:', chrome.runtime.lastError);
            } else {
                console.log('Toggle states successfully saved:', toggleStates);
            }
        });
    }

    function logToggleStates() {
        chrome.storage.local.get('toggleStates', function (result) {
            if (result.toggleStates) {
                console.log('Current toggle states:');
                for (const [key, value] of Object.entries(result.toggleStates)) {
                    console.log(`${key}: ${value ? 'ON' : 'OFF'}`);
                }
            }
        });
    }
    
    
    */






    // ONLY ALLOWING ONE TOGGLE AT A TIME
    const effectToggles = document.querySelectorAll('.effect-toggle');
    chrome.storage.local.get(['domains', 'toggleStates'], function (result) {
        if (result.domains) {
            displayDomains(result.domains);
        }
        if (result.toggleStates) {
            updateToggleStates(result.toggleStates);
        }
    });

    // Set up listeners for each toggle and initialize their state
    effectToggles.forEach(toggle => {
        toggle.addEventListener('change', function () {
            if (this.checked) {
                // Uncheck all other toggles
                effectToggles.forEach(t => {
                    if (t.id !== this.id) {
                        t.checked = false;
                    }
                });
            }
            // Update states after changes
            updateAndStoreToggleStates();
        });
    });

    function updateAndStoreToggleStates() {
        const updatedStates = {};
        effectToggles.forEach(t => {
            updatedStates[t.id] = t.checked;
        });
        storeToggleStates(updatedStates);
        logToggleStates();
    }

    function updateToggleStates(toggleStates) {
        for (const [key, value] of Object.entries(toggleStates)) {
            const toggle = document.getElementById(key);
            if (toggle) {
                toggle.checked = value;
            }
        }
    }

    function storeToggleStates(toggleStates) {
        chrome.storage.local.set({ toggleStates: toggleStates }, function () {
            if (chrome.runtime.lastError) {
                console.error('Error saving toggle states:', chrome.runtime.lastError);
            } else {
                console.log('Toggle states successfully saved:', toggleStates);
            }
        });
    }

    function logToggleStates() {
        chrome.storage.local.get('toggleStates', function (result) {
            if (result.toggleStates) {
                console.log('Current toggle states:');
                for (const [key, value] of Object.entries(result.toggleStates)) {
                    console.log(`${key}: ${value ? 'ON' : 'OFF'}`);
                }
            }
        });
    }



    //FOR SHOWING YEAR IN THE BOTTOM COPYRIGHT
    const currentYearSpan = document.getElementById('current-year');
    const currentYear = new Date().getFullYear(); // Get the current year
    currentYearSpan.textContent = currentYear;

    


});



















document.addEventListener('DOMContentLoaded', () => {
    const addButton = document.getElementById('add');
    const removeButton = document.getElementById('remove');
    const domainInput = document.getElementById('domain');
    const domainsList = document.getElementById('domainsList');
    const effectCheckboxes = document.querySelectorAll('.effect-toggle'); 

    // Function to update the list of domains from storage
    function updateListDisplay() {
        chrome.storage.local.get(['domains'], (data) => {
            domainsList.innerHTML = ''; // Clear the list
            Object.entries(data.domains || {}).forEach(([domain, isEnabled]) => {
                const label = document.createElement('label');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = isEnabled;
                checkbox.value = domain;
                checkbox.className = 'domain-checkbox';
                checkbox.onchange = () => toggleDomain(domain, checkbox.checked);
                label.appendChild(checkbox);
                label.append(' ' + domain);
                domainsList.appendChild(label);
                domainsList.appendChild(document.createElement('br'));
            });
        });
    }

    // Function to toggle the enabled state of a domain
    function toggleDomain(domain, isEnabled) {
        chrome.storage.local.get('domains', (data) => {
            const updatedDomains = { ...data.domains, [domain]: isEnabled };
            chrome.storage.local.set({ domains: updatedDomains }, updateListDisplay);
        });
    }

    // Function to add a new domain
    addButton.onclick = () => {
        let domain = new URL('http://' + domainInput.value.toLowerCase()).hostname;
        domain = domain.replace(/^www\./, ''); // Remove 'www.' if present

        chrome.storage.local.get('domains', (data) => {
            const updatedDomains = { ...data.domains, [domain]: true };
            chrome.storage.local.set({ domains: updatedDomains }, () => {
                domainInput.value = ''; // Clear input field
                updateListDisplay(); // Update the list display
            });
        });
    };

    // Function to remove selected domains
    removeButton.onclick = () => {
        chrome.storage.local.get('domains', (data) => {
            const domains = data.domains;
            document.querySelectorAll('.domain-checkbox:checked').forEach(checkbox => {
                delete domains[checkbox.value]; // Remove the domain
            });

            chrome.storage.local.set({ domains }, updateListDisplay); // Update the list display
        });
    };

    // Function to save selected effects
    function saveSelectedEffects() {
        const effects = {};
        effectCheckboxes.forEach(checkbox => {
            effects[checkbox.id] = checkbox.checked; // Use checkbox ID as the key
        });
        chrome.storage.local.set({ effects }, () => {
            // Optionally, send a message to content scripts to apply effects immediately
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {action: "updateEffects"});
            });
        });
    }

    // Function to load and apply effect preferences
    function loadEffectPreferences() {
        chrome.storage.local.get('effects', (data) => {
            effectCheckboxes.forEach(checkbox => {
                checkbox.checked = !!data.effects[checkbox.id]; // Apply the saved preferences
            });
        });
    }

    // Attach change event listeners to effect checkboxes
    effectCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', saveSelectedEffects); // Save preferences on change
    });

    // Initialize the display of stored domains and effect preferences on DOM load
    updateListDisplay();
    loadEffectPreferences();
});

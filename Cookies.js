export function enableAutoSave(selector, storageKey) {
    const element = document.querySelector(selector);
    if (!element) return;

    const savedData = JSON.parse(localStorage.getItem(storageKey)) || {};

    // Check if it's a FORM
    if (element.tagName === 'FORM') {
        // Load all saved inputs
        Object.keys(savedData).forEach(name => {
            const input = element.querySelector(`[name="${name}"]`);
            if (input) {
                if (input.type === 'checkbox' || input.type === 'radio') {
                    input.checked = savedData[name];
                } else {
                    input.value = savedData[name];
                }
            }
        });

        // Save on input change
        element.addEventListener('input', (e) => {
            if (!e.target.name) return;
            const currentData = JSON.parse(localStorage.getItem(storageKey)) || {};
            if (e.target.type === 'checkbox' || e.target.type === 'radio') {
                currentData[e.target.name] = e.target.checked;
            } else {
                currentData[e.target.name] = e.target.value;
            }
            localStorage.setItem(storageKey, JSON.stringify(currentData));
        });

    } else {
        // Single input or textarea
        if (savedData.value) {
            element.value = savedData.value;
        }

        element.addEventListener('input', () => {
            localStorage.setItem(storageKey, JSON.stringify({ value: element.value }));
        });
    }
}

// Clear saved data
export function clearAutoSave(storageKey) {
    localStorage.removeItem(storageKey);
}

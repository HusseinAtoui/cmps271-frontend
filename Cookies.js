// Auto-save entire form
export function enableAutoSave(formSelector, storageKey) {
    const form = document.querySelector(formSelector);
    if (!form) return;
  
    // Load saved data
    const savedData = JSON.parse(localStorage.getItem(storageKey)) || {};
  
    Object.keys(savedData).forEach(name => {
      const input = form.querySelector(`[name="${name}"]`);
      if (input) {
        if (input.type === 'checkbox' || input.type === 'radio') {
          input.checked = savedData[name];
        } else {
          input.value = savedData[name];
        }
      }
    });
  
    // Save data on input change
    form.addEventListener('input', (e) => {
      if (!e.target.name) return;
      const currentData = JSON.parse(localStorage.getItem(storageKey)) || {};
      if (e.target.type === 'checkbox' || e.target.type === 'radio') {
        currentData[e.target.name] = e.target.checked;
      } else {
        currentData[e.target.name] = e.target.value;
      }
      localStorage.setItem(storageKey, JSON.stringify(currentData));
    });
  }
  
  export function clearAutoSave(storageKey) {
    localStorage.removeItem(storageKey);
  }
export function Autosave(inputSelector, storageKey) {
    const inputElement = document.querySelector(inputSelector);
    if (!inputElement) return;
  
    // Load saved data
    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
      inputElement.value = savedData;
    }
  
    // Save data on input
    inputElement.addEventListener('input', () => {
      localStorage.setItem(storageKey, inputElement.value);
    });
  }
  
  export function clearAutosave(storageKey) {
    localStorage.removeItem(storageKey);
  }
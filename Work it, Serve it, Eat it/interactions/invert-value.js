// Simple digit inverter with debugging
console.log("Invert script loaded");

function invertDigits(str) {
  // Get only digits and reverse them
  const digits = str.replace(/\D/g, '');
  return digits.split('').reverse().join('');
}

function updateValue3() {
  const valueEl = document.getElementById('value');
  const value3El = document.getElementById('value3');
  
  console.log("updateValue3 called");
  console.log("value element:", valueEl);
  console.log("value3 element:", value3El);
  
  if (!valueEl || !value3El) {
    console.error("Elements not found!");
    return;
  }
  
  const text = valueEl.textContent || valueEl.innerText || '';
  console.log("Original value text:", text);
  
  const inverted = invertDigits(text);
  console.log("Inverted:", inverted);
  
  value3El.textContent = inverted;
}

// Try multiple approaches to ensure it works
function init() {
  console.log("Init called");
  updateValue3();
  
  // Watch for changes
  const valueEl = document.getElementById('value');
  if (valueEl) {
    const observer = new MutationObserver(() => {
      console.log("Value changed!");
      updateValue3();
    });
    
    observer.observe(valueEl, {
      childList: true,
      characterData: true,
      subtree: true,
      characterDataOldValue: true
    });
    
    console.log("Observer attached");
  }
}

// Try to run on different load events
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Also make it available globally for manual testing
window.updateValue3 = updateValue3;
window.testInvert = function(num) {
  document.getElementById('value').textContent = num;
  updateValue3();
};

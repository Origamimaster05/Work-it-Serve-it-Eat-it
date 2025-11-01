let lastSecond = -1;
let lastMinute = -1;
let minuteHandRotation = 0;
let hourHandRotation = 0;
let totalSeconds = 0;
let totalMinutes = 0;
let totalHours = 0;

function updateClockHands() {
    const now = new Date();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const milliseconds = now.getMilliseconds();
    
    // Track seconds passing (only if lastSecond was set and changed)
    if (lastSecond !== -1 && lastSecond !== seconds) {
        totalSeconds++;
        
        // Detect when seconds roll over from 59 to 0
        if (lastSecond === 59 && seconds === 0) {
            minuteHandRotation += 360; // Add full rotation
            totalMinutes++; // Increment total minutes
        }
    }
    lastSecond = seconds;
    
    // Detect when minutes roll over from 59 to 0
    if (lastMinute === 59 && minutes === 0) {
        hourHandRotation += 360; // Add full rotation
        totalHours++; // Increment total hours
    }
    lastMinute = minutes;
    
    // Calculate angles (0 degrees is at 12 o'clock)
    // Hour hand: shows minutes - continuous rotation without reset
    const hourAngle = hourHandRotation + (minutes * 6) + (seconds * 0.15) + (milliseconds * 0.00025);
    
    // Minute hand: shows seconds - continuous rotation without reset
    const minuteAngle = minuteHandRotation + (seconds * 6) + (milliseconds * 0.006);
    
    // Update the transform attributes
    const hourHand = document.getElementById('hour-hand');
    const minuteHand = document.getElementById('minute-hand');
    
    if (hourHand) {
        hourHand.setAttribute('transform', `rotate(${hourAngle} 389.5 389.5)`);
    }
    
    if (minuteHand) {
        minuteHand.setAttribute('transform', `rotate(${minuteAngle} 389.5 389.5)`);
    }
    
    // Update the value2 element with cumulative time
    const value2Element = document.getElementById('value2');
    if (value2Element) {
        const displayText = `${totalHours} ${totalMinutes} ${totalSeconds}`;
        value2Element.textContent = displayText;
        value2Element.innerHTML = displayText; // Try both textContent and innerHTML
        // Force visibility with inline styles
        value2Element.style.color = '#000000';
        value2Element.style.fontSize = '1.2vh';
        value2Element.style.fontWeight = 'bold';
        value2Element.style.display = 'block';
        value2Element.style.visibility = 'visible';
        value2Element.style.opacity = '1';
        // Only log occasionally to avoid console spam
        if (totalSeconds % 5 === 0 && milliseconds < 100) {
            console.log('Updated display:', displayText);
        }
    } else {
        console.log('value2 element lost!');
    }
}

// Initialize the display immediately
function initializeDisplay() {
    const value2Element = document.getElementById('value2');
    if (value2Element) {
        const displayText = `${totalHours} ${totalMinutes} ${totalSeconds}`;
        value2Element.textContent = displayText;
        value2Element.innerHTML = displayText; // Try both textContent and innerHTML
        // Force visibility with inline styles
        value2Element.style.color = '#000000';
        value2Element.style.fontSize = '1.2vh';
        value2Element.style.fontWeight = 'bold';
        value2Element.style.display = 'block';
        value2Element.style.visibility = 'visible';
        value2Element.style.opacity = '1';
        console.log('Display initialized with:', displayText);
    } else {
        console.log('value2 element not found!');
    }
}

// Add smooth transition to clock hands
function initClockHands() {
    const hourHand = document.getElementById('hour-hand');
    const minuteHand = document.getElementById('minute-hand');
    
    if (hourHand) {
        hourHand.style.transition = 'transform 0.5s linear';
    }
    
    if (minuteHand) {
        minuteHand.style.transition = 'transform 0.5s linear';
    }
}

// Keep track of our interval so we don't create multiple
let updateInterval = null;
let observer = null;

// Initialize function that ensures display is updated
function initialize() {
    console.log('Initializing clock...');
    initClockHands();
    initializeDisplay();
    updateClockHands();
    
    // Clear any existing interval
    if (updateInterval) {
        clearInterval(updateInterval);
    }
    
    // Update more frequently for smoother movement (every 50ms)
    updateInterval = setInterval(updateClockHands, 50);
    
    // Set up MutationObserver to protect value2 from being cleared
    const value2Element = document.getElementById('value2');
    if (value2Element && !observer) {
        observer = new MutationObserver(function(mutations) {
            // If the content was cleared, restore it immediately
            const currentContent = value2Element.textContent;
            const expectedContent = `${totalHours} ${totalMinutes} ${totalSeconds}`;
            if (currentContent !== expectedContent) {
                console.log('Content was changed, restoring...');
                value2Element.textContent = expectedContent;
                value2Element.style.color = '#000000';
                value2Element.style.fontSize = '1.2vh';
                value2Element.style.fontWeight = 'bold';
                value2Element.style.display = 'block';
                value2Element.style.visibility = 'visible';
                value2Element.style.opacity = '1';
            }
        });
        
        // Observe changes to the element
        observer.observe(value2Element, {
            childList: true,
            characterData: true,
            subtree: true
        });
        console.log('MutationObserver set up to protect value2');
    }
    
    console.log('Clock interval started');
}

// Try multiple initialization strategies to ensure it works
if (document.readyState === 'loading') {
    // DOM is still loading
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    // DOM is already ready
    initialize();
}

// Also try after delays as fallbacks to ensure other scripts don't interfere
setTimeout(initialize, 100);
setTimeout(initialize, 500);
setTimeout(initialize, 1000);
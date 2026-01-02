// Content script for PingID page - detects and extracts the PingID number
console.log('Ping ID Extension content script loaded for:', window.location.href);

// Global flag to prevent sending the same number twice
let numberAlreadySent = false;

// Function to extract PingID number from the page
function extractPingIDNumber() {
  const numberElement = document.querySelector('.numbermatching');

  if (numberElement) {
    const numberText = numberElement.textContent.trim();
    // Extract the numeric part (should be a 2-digit number between 10-99)
    const match = numberText.match(/\d{2}/);

    if (match) {
      const number = parseInt(match[0], 10);
      if (number >= 10 && number <= 99) {
        console.log('Extracted PingID number:', number);
        return number;
      }
    }
  }

  return null;
}

// Function to send number to background script
function sendNumberToBackground(pingNumber) {
  // Check if number was already sent
  if (numberAlreadySent) {
    console.log('Number already sent, skipping duplicate submission');
    return;
  }

  console.log('Sending PingID number to background:', pingNumber);
  numberAlreadySent = true;

  chrome.runtime.sendMessage({
    action: 'pingNumberDetected',
    number: pingNumber,
    timestamp: new Date().toISOString()
  }, function (response) {
    if (response && response.success) {
      console.log('PingID number sent to background script successfully');
    }
  });
}

// Main page load handler
function handlePageLoad() {
  console.log('Page loaded, searching for PingID number...');

  // Wait a bit for dynamic content to load
  setTimeout(() => {
    const pingNumber = extractPingIDNumber();

    if (pingNumber) {
      console.log('Found PingID number:', pingNumber);
      sendNumberToBackground(pingNumber);
    } else {
      console.log('No PingID number found on page');
    }
  }, 1000); // Wait 1 second for page to fully render
}

// Wait for page to be fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', handlePageLoad);
} else {
  // Page already loaded
  handlePageLoad();
}

// Also listen for any dynamic changes
const observer = new MutationObserver((mutations) => {
  const pingNumber = extractPingIDNumber();
  if (pingNumber) {
    observer.disconnect(); // Stop observing once we find it
    sendNumberToBackground(pingNumber);
  }
});

// Start observing after initial load
setTimeout(() => {
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}, 500);

// Listen for messages from popup or background script
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  switch (request.action) {
    case 'extractNumber':
      const number = extractPingIDNumber();
      sendResponse({
        success: true,
        number: number
      });
      break;

    default:
      sendResponse({ error: 'Unknown action' });
  }
  return true; // Keep channel open for async response
});
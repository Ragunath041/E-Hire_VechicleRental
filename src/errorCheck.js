// Error Check Script
// This script will log any uncaught errors to help identify issues

window.addEventListener('error', function(event) {
  console.error('ERROR DETECTED:', {
    message: event.message,
    source: event.filename,
    lineNo: event.lineno,
    colNo: event.colno,
    error: event.error
  });
});

// Console error overrides for detailed logging
const originalConsoleError = console.error;
console.error = function() {
  originalConsoleError.apply(console, ['CONSOLE ERROR:'].concat(Array.from(arguments)));
};

// Check all images for loading errors
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.complete || img.naturalHeight === 0) {
        console.error('IMAGE LOAD ERROR:', img.src);
      }
    });
  }, 2000);
});

console.log('Error checking script loaded and running'); 
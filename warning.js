/**
 * Warning Page Script
 * Handles display and interaction for phishing warning page
 */

'use strict';

/**
 * Safely escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHTML(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Initialize warning page when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
  try {
    // Parse URL parameters
    const params = new URLSearchParams(window.location.search);
    const blockedURL = params.get('blocked');
    const reasonsJSON = params.get('reasons');
    const scoreParam = params.get('score');

    // Validate parameters
    if (!blockedURL) {
      console.error('[Phishing Detection] No blocked URL provided');
      displayFallbackMessage();
      return;
    }

    // Display blocked URL with safety checks
    displayBlockedURL(blockedURL);

    // Display suspicion score
    displaySuspicionScore(scoreParam);

    // Display reasons
    displayReasons(reasonsJSON);

    // Set up button handlers
    setupButtonHandlers(blockedURL);

  } catch (error) {
    console.error('[Phishing Detection] Warning page initialization error:', error);
    displayFallbackMessage();
  }
});

/**
 * Display blocked URL safely
 * @param {string} blockedURL - The blocked URL
 */
function displayBlockedURL(blockedURL) {
  try {
    const urlElement = document.getElementById('blocked-url-text');
    if (!urlElement) return;

    // Decode and validate URL
    let decodedURL = decodeURIComponent(blockedURL);

    // Validate it's a proper URL
    try {
      new URL(decodedURL);
    } catch (e) {
      decodedURL = 'Invalid URL';
    }

    // Use textContent for safety (prevents XSS)
    urlElement.textContent = decodedURL;
  } catch (error) {
    console.error('[Phishing Detection] Error displaying URL:', error);
  }
}

/**
 * Display suspicion score with visual indicator
 * @param {string} scoreParam - Score parameter from URL
 */
function displaySuspicionScore(scoreParam) {
  try {
    const scoreElement = document.getElementById('score-value');
    const circleElement = document.getElementById('score-circle');

    if (!scoreElement || !circleElement) return;

    // Parse and validate score
    let score = parseInt(scoreParam);
    if (isNaN(score) || score < 0) score = 0;
    if (score > 100) score = 100;

    scoreElement.textContent = score;

    // Update circular progress indicator
    const scoreDeg = (score / 100) * 360;
    circleElement.style.setProperty('--score-deg', scoreDeg + 'deg');

  } catch (error) {
    console.error('[Phishing Detection] Error displaying score:', error);
  }
}

/**
 * Display threat reasons
 * @param {string} reasonsJSON - JSON string of reasons
 */
function displayReasons(reasonsJSON) {
  try {
    const reasonsList = document.getElementById('reasons-list');
    if (!reasonsList) return;

    reasonsList.innerHTML = '';

    if (!reasonsJSON) {
      addReasonItem(reasonsList, 'No specific reasons provided');
      return;
    }

    // Parse reasons with error handling
    let reasons = [];
    try {
      const decoded = decodeURIComponent(reasonsJSON);
      reasons = JSON.parse(decoded);
    } catch (e) {
      console.error('[Phishing Detection] Error parsing reasons:', e);
      addReasonItem(reasonsList, 'Error loading threat details');
      return;
    }

    // Validate reasons is an array
    if (!Array.isArray(reasons) || reasons.length === 0) {
      addReasonItem(reasonsList, 'No specific reasons provided');
      return;
    }

    // Display each reason safely
    reasons.forEach(reason => {
      if (reason && typeof reason === 'string') {
        addReasonItem(reasonsList, reason);
      }
    });

  } catch (error) {
    console.error('[Phishing Detection] Error displaying reasons:', error);
    const reasonsList = document.getElementById('reasons-list');
    if (reasonsList) {
      reasonsList.innerHTML = '<li>Error loading threat details</li>';
    }
  }
}

/**
 * Add a reason item to the list safely
 * @param {HTMLElement} list - The list element
 * @param {string} text - The reason text
 */
function addReasonItem(list, text) {
  try {
    const li = document.createElement('li');
    li.textContent = text; // Use textContent for safety
    list.appendChild(li);
  } catch (error) {
    console.error('[Phishing Detection] Error adding reason item:', error);
  }
}

/**
 * Set up button event handlers
 * @param {string} blockedURL - The blocked URL
 */
function setupButtonHandlers(blockedURL) {
  try {
    // Go back button
    const goBackButton = document.getElementById('go-back');
    if (goBackButton) {
      goBackButton.addEventListener('click', handleGoBack);
    }

    // Report issue button
    const reportButton = document.getElementById('report-issue');
    if (reportButton) {
      reportButton.addEventListener('click', handleReportIssue);
    }

    // Proceed anyway button
    const proceedButton = document.getElementById('proceed-anyway');
    if (proceedButton) {
      proceedButton.addEventListener('click', () => handleProceedAnyway(blockedURL));
    }
  } catch (error) {
    console.error('[Phishing Detection] Error setting up button handlers:', error);
  }
}

/**
 * Handle go back action
 */
function handleGoBack() {
  try {
    // Try to go back in history
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // If no history, navigate to a safe page
      window.location.href = 'about:blank';
    }
  } catch (error) {
    console.error('[Phishing Detection] Error navigating back:', error);
    // Fallback to blank page
    window.location.href = 'about:blank';
  }
}

/**
 * Handle report false positive
 */
function handleReportIssue() {
  try {
    alert(
      '📝 Report False Positive\n\n' +
      'To report a false positive:\n\n' +
      '1. Take a screenshot of this page\n' +
      '2. Note the blocked URL\n' +
      '3. Open an issue at:\n' +
      '   github.com/Raoof128/RTPDBE/issues\n\n' +
      'Thank you for helping improve our detection!'
    );
  } catch (error) {
    console.error('[Phishing Detection] Error showing report dialog:', error);
  }
}

/**
 * Handle proceed anyway action
 * @param {string} blockedURL - The blocked URL to proceed to
 */
function handleProceedAnyway(blockedURL) {
  try {
    if (!blockedURL) {
      alert('Error: No URL to proceed to');
      return;
    }

    // Show final warning
    const confirmProceed = confirm(
      '⚠️ FINAL WARNING ⚠️\n\n' +
      'You are about to visit a website flagged as potentially dangerous.\n\n' +
      '❌ DO NOT:\n' +
      '  • Enter passwords or personal information\n' +
      '  • Download files\n' +
      '  • Click on suspicious links\n' +
      '  • Provide payment information\n\n' +
      '⚠️ PROCEED AT YOUR OWN RISK ⚠️\n\n' +
      'Are you absolutely sure you want to proceed?'
    );

    if (!confirmProceed) {
      return;
    }

    // Add to whitelist and redirect
    if (chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['whitelistedSites'], (data) => {
        try {
          // Check for storage errors
          if (chrome.runtime.lastError) {
            console.error('[Phishing Detection] Storage error:', chrome.runtime.lastError.message);
            proceedWithoutWhitelist(blockedURL);
            return;
          }

          const whitelist = data.whitelistedSites || [];

          // Validate and extract domain
          try {
            const decodedURL = decodeURIComponent(blockedURL);
            const url = new URL(decodedURL);
            const domain = url.hostname;

            // Add to whitelist if not already present
            if (!whitelist.includes(domain)) {
              whitelist.push(domain);
            }

            // Save whitelist
            chrome.storage.local.set({ whitelistedSites: whitelist }, () => {
              if (chrome.runtime.lastError) {
                console.error('[Phishing Detection] Error saving whitelist:', chrome.runtime.lastError.message);
              }

              // Proceed to URL
              window.location.href = decodedURL;
            });
          } catch (urlError) {
            console.error('[Phishing Detection] Invalid URL:', urlError);
            proceedWithoutWhitelist(blockedURL);
          }
        } catch (error) {
          console.error('[Phishing Detection] Error processing whitelist:', error);
          proceedWithoutWhitelist(blockedURL);
        }
      });
    } else {
      // Chrome storage not available
      proceedWithoutWhitelist(blockedURL);
    }
  } catch (error) {
    console.error('[Phishing Detection] Error in proceed anyway:', error);
    alert('Error: Unable to proceed');
  }
}

/**
 * Proceed to URL without whitelisting (fallback)
 * @param {string} blockedURL - The URL to proceed to
 */
function proceedWithoutWhitelist(blockedURL) {
  try {
    const decodedURL = decodeURIComponent(blockedURL);
    window.location.href = decodedURL;
  } catch (error) {
    console.error('[Phishing Detection] Error proceeding to URL:', error);
    alert('Error: Unable to navigate to the requested URL');
  }
}

/**
 * Display fallback message when parameters are missing
 */
function displayFallbackMessage() {
  try {
    const contentArea = document.querySelector('.warning-content');
    if (contentArea) {
      contentArea.innerHTML = `
        <div style="text-align: center; padding: 40px;">
          <h2>Warning Page Error</h2>
          <p>Unable to load warning details.</p>
          <button onclick="window.history.back()" style="margin-top: 20px; padding: 10px 20px;">
            Go Back
          </button>
        </div>
      `;
    }
  } catch (error) {
    console.error('[Phishing Detection] Error displaying fallback:', error);
  }
}

console.log('[Phishing Detection] Warning page loaded');

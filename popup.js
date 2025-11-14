/**
 * Popup Script for Extension UI
 * Handles popup interface, statistics display, and user interactions
 */

'use strict';

/**
 * Safely escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHTML(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Initialize popup when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await loadState();
    setupEventListeners();
    await loadCurrentTab();
  } catch (error) {
    console.error('[Phishing Detection] Popup initialization error:', error);
    displayError('Failed to initialize popup');
  }
});

/**
 * Load and display current extension state
 */
async function loadState() {
  try {
    const data = await chrome.storage.local.get([
      'enabled',
      'detectionStats',
      'blockedSites'
    ]);

    // Update protection toggle
    const toggle = document.getElementById('protection-toggle');
    if (toggle) {
      const enabled = data.enabled !== false; // Default to true
      if (enabled) {
        toggle.classList.add('active');
      } else {
        toggle.classList.remove('active');
      }
    }

    // Update statistics
    const stats = data.detectionStats || { totalChecks: 0, threatsBlocked: 0 };
    const totalChecksEl = document.getElementById('total-checks');
    const threatsBlockedEl = document.getElementById('threats-blocked');

    if (totalChecksEl) totalChecksEl.textContent = stats.totalChecks.toLocaleString();
    if (threatsBlockedEl) threatsBlockedEl.textContent = stats.threatsBlocked.toLocaleString();

    // Display blocked sites
    const blockedSites = data.blockedSites || [];
    displayBlockedSites(blockedSites);

  } catch (error) {
    console.error('[Phishing Detection] Error loading state:', error);
    displayError('Failed to load extension state');
  }
}

/**
 * Display list of blocked sites
 * @param {Array} sites - Array of blocked site objects
 */
function displayBlockedSites(sites) {
  const blockedList = document.getElementById('blocked-list');
  if (!blockedList) return;

  try {
    if (!sites || sites.length === 0) {
      blockedList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🎉</div>
          <div>No threats detected yet!</div>
        </div>
      `;
      return;
    }

    blockedList.innerHTML = '';

    // Show most recent 10 sites first
    const recentSites = sites.slice(-10).reverse();

    recentSites.forEach(site => {
      try {
        const item = document.createElement('div');
        item.className = 'blocked-item';

        // Safely escape domain name
        const safeDomain = escapeHTML(site.domain || 'Unknown');
        const safeScore = parseInt(site.score) || 0;
        const timeAgo = getTimeAgo(site.timestamp);

        // Create element using textContent for safety
        const domainDiv = document.createElement('div');
        domainDiv.className = 'blocked-domain';
        domainDiv.textContent = site.domain || 'Unknown';

        const timeDiv = document.createElement('div');
        timeDiv.className = 'blocked-time';
        timeDiv.textContent = `${timeAgo} • Score: ${safeScore}/100`;

        item.appendChild(domainDiv);
        item.appendChild(timeDiv);

        blockedList.appendChild(item);
      } catch (error) {
        console.error('[Phishing Detection] Error displaying site:', error);
      }
    });
  } catch (error) {
    console.error('[Phishing Detection] Error displaying blocked sites:', error);
    blockedList.innerHTML = '<div class="empty-state"><div>Error loading blocked sites</div></div>';
  }
}

/**
 * Calculate time ago from timestamp
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @returns {string} - Human-readable time ago string
 */
function getTimeAgo(timestamp) {
  try {
    if (!timestamp || isNaN(timestamp)) return 'Unknown';

    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 0) return 'Just now';

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days !== 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    return 'Just now';
  } catch (error) {
    console.error('[Phishing Detection] Error calculating time ago:', error);
    return 'Unknown';
  }
}

/**
 * Load and analyze current active tab
 */
async function loadCurrentTab() {
  const currentUrlEl = document.getElementById('current-url');
  const statusEl = document.getElementById('site-status');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.url) {
      if (currentUrlEl) currentUrlEl.textContent = 'No active tab';
      return;
    }

    // Parse URL safely
    let hostname = 'Unknown';
    try {
      const url = new URL(tab.url);
      hostname = url.hostname;
    } catch (e) {
      hostname = 'Unable to parse URL';
    }

    if (currentUrlEl) {
      currentUrlEl.textContent = hostname;
    }

    // Check URL safety
    if (chrome.runtime && chrome.runtime.id) {
      chrome.runtime.sendMessage(
        { action: 'checkURL', url: tab.url },
        (response) => {
          // Check for errors
          if (chrome.runtime.lastError) {
            console.error('[Phishing Detection] Message error:', chrome.runtime.lastError.message);
            return;
          }

          if (!statusEl) return;

          if (response && response.analysis) {
            const analysis = response.analysis;

            if (analysis.suspicious) {
              statusEl.textContent = '⚠️ Suspicious';
              statusEl.className = 'site-status dangerous';
            } else if (analysis.suspicionScore > 20) {
              statusEl.textContent = '⚡ Caution';
              statusEl.className = 'site-status suspicious';
            } else {
              statusEl.textContent = '✓ Safe';
              statusEl.className = 'site-status safe';
            }
          } else {
            statusEl.textContent = '? Unknown';
            statusEl.className = 'site-status';
          }
        }
      );
    }
  } catch (error) {
    console.error('[Phishing Detection] Error loading current tab:', error);
    if (currentUrlEl) currentUrlEl.textContent = 'Unable to access';
  }
}

/**
 * Set up event listeners for UI interactions
 */
function setupEventListeners() {
  try {
    // Protection toggle
    const toggle = document.getElementById('protection-toggle');
    if (toggle) {
      toggle.addEventListener('click', handleToggleProtection);
    }

    // Clear history button
    const clearButton = document.getElementById('clear-history');
    if (clearButton) {
      clearButton.addEventListener('click', handleClearHistory);
    }

    // Whitelist site button
    const whitelistButton = document.getElementById('whitelist-site');
    if (whitelistButton) {
      whitelistButton.addEventListener('click', handleWhitelistSite);
    }
  } catch (error) {
    console.error('[Phishing Detection] Error setting up event listeners:', error);
  }
}

/**
 * Handle protection toggle
 */
async function handleToggleProtection() {
  try {
    const toggle = document.getElementById('protection-toggle');
    if (!toggle) return;

    const currentState = toggle.classList.contains('active');
    const newState = !currentState;

    // Update UI immediately for responsiveness
    if (newState) {
      toggle.classList.add('active');
    } else {
      toggle.classList.remove('active');
    }

    // Save to storage
    await chrome.storage.local.set({ enabled: newState });

    // Update badge
    if (chrome.action) {
      if (newState) {
        await chrome.action.setBadgeText({ text: '' });
        await chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' });
      } else {
        await chrome.action.setBadgeText({ text: 'OFF' });
        await chrome.action.setBadgeBackgroundColor({ color: '#999999' });
      }
    }

    console.log(`[Phishing Detection] Protection ${newState ? 'enabled' : 'disabled'}`);
  } catch (error) {
    console.error('[Phishing Detection] Error toggling protection:', error);
    displayError('Failed to toggle protection');
  }
}

/**
 * Handle clear history action
 */
async function handleClearHistory() {
  try {
    const confirmed = confirm('Are you sure you want to clear the blocked sites history?');

    if (!confirmed) return;

    await chrome.storage.local.set({
      blockedSites: [],
      detectionStats: {
        totalChecks: 0,
        threatsBlocked: 0,
        lastUpdate: Date.now()
      }
    });

    // Reload state to update UI
    await loadState();

    console.log('[Phishing Detection] History cleared');
  } catch (error) {
    console.error('[Phishing Detection] Error clearing history:', error);
    displayError('Failed to clear history');
  }
}

/**
 * Handle whitelist site action
 */
async function handleWhitelistSite() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.url) {
      alert('Unable to access current tab');
      return;
    }

    // Parse URL
    let domain = null;
    try {
      const url = new URL(tab.url);
      domain = url.hostname;
    } catch (e) {
      alert('Unable to parse current URL');
      return;
    }

    if (!domain) {
      alert('Invalid domain');
      return;
    }

    // Get current whitelist
    const data = await chrome.storage.local.get(['whitelistedSites']);
    const whitelist = data.whitelistedSites || [];

    // Check if already whitelisted
    if (whitelist.includes(domain)) {
      alert(`${domain} is already whitelisted.`);
      return;
    }

    // Add to whitelist
    whitelist.push(domain);
    await chrome.storage.local.set({ whitelistedSites: whitelist });

    alert(`✓ ${domain} has been added to the whitelist.`);

    console.log(`[Phishing Detection] Whitelisted: ${domain}`);
  } catch (error) {
    console.error('[Phishing Detection] Error whitelisting site:', error);
    displayError('Failed to whitelist site');
  }
}

/**
 * Display error message
 * @param {string} message - Error message to display
 */
function displayError(message) {
  console.error('[Phishing Detection]', message);
  // You could add UI error display here
}

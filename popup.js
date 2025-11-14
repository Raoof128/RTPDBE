// Popup script

document.addEventListener('DOMContentLoaded', async () => {
  // Load current state
  await loadState();

  // Set up event listeners
  setupEventListeners();

  // Load current tab info
  await loadCurrentTab();
});

async function loadState() {
  const data = await chrome.storage.local.get(['enabled', 'detectionStats', 'blockedSites']);

  // Update toggle
  const toggle = document.getElementById('protection-toggle');
  if (data.enabled !== false) {
    toggle.classList.add('active');
  } else {
    toggle.classList.remove('active');
  }

  // Update stats
  const stats = data.detectionStats || { totalChecks: 0, threatsBlocked: 0 };
  document.getElementById('total-checks').textContent = stats.totalChecks;
  document.getElementById('threats-blocked').textContent = stats.threatsBlocked;

  // Update blocked sites list
  const blockedSites = data.blockedSites || [];
  displayBlockedSites(blockedSites);
}

function displayBlockedSites(sites) {
  const blockedList = document.getElementById('blocked-list');

  if (sites.length === 0) {
    blockedList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🎉</div>
        <div>No threats detected yet!</div>
      </div>
    `;
    return;
  }

  blockedList.innerHTML = '';
  // Show most recent first
  const recentSites = sites.slice(-10).reverse();

  recentSites.forEach(site => {
    const item = document.createElement('div');
    item.className = 'blocked-item';

    const timeAgo = getTimeAgo(site.timestamp);

    item.innerHTML = `
      <div class="blocked-domain">${site.domain || 'Unknown'}</div>
      <div class="blocked-time">${timeAgo} • Score: ${site.score}/100</div>
    `;

    blockedList.appendChild(item);
  });
}

function getTimeAgo(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
}

async function loadCurrentTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (tab && tab.url) {
      const url = new URL(tab.url);
      document.getElementById('current-url').textContent = url.hostname;

      // Check if this URL is suspicious
      chrome.runtime.sendMessage({ action: 'checkURL', url: tab.url }, (response) => {
        if (response && response.analysis) {
          const status = document.getElementById('site-status');
          if (response.analysis.suspicious) {
            status.textContent = '⚠️ Suspicious';
            status.className = 'site-status dangerous';
          } else if (response.analysis.suspicionScore > 20) {
            status.textContent = '⚡ Caution';
            status.className = 'site-status suspicious';
          } else {
            status.textContent = '✓ Safe';
            status.className = 'site-status safe';
          }
        }
      });
    } else {
      document.getElementById('current-url').textContent = 'No active tab';
    }
  } catch (e) {
    document.getElementById('current-url').textContent = 'Unable to access';
  }
}

function setupEventListeners() {
  // Protection toggle
  document.getElementById('protection-toggle').addEventListener('click', async () => {
    const toggle = document.getElementById('protection-toggle');
    const currentState = toggle.classList.contains('active');
    const newState = !currentState;

    if (newState) {
      toggle.classList.add('active');
    } else {
      toggle.classList.remove('active');
    }

    await chrome.storage.local.set({ enabled: newState });

    // Update badge
    if (newState) {
      chrome.action.setBadgeText({ text: '' });
      chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' });
    } else {
      chrome.action.setBadgeText({ text: 'OFF' });
      chrome.action.setBadgeBackgroundColor({ color: '#999999' });
    }
  });

  // Clear history
  document.getElementById('clear-history').addEventListener('click', async () => {
    if (confirm('Are you sure you want to clear the blocked sites history?')) {
      await chrome.storage.local.set({
        blockedSites: [],
        detectionStats: {
          totalChecks: 0,
          threatsBlocked: 0,
          lastUpdate: Date.now()
        }
      });
      await loadState();
    }
  });

  // Whitelist current site
  document.getElementById('whitelist-site').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (tab && tab.url) {
      try {
        const url = new URL(tab.url);
        const domain = url.hostname;

        const data = await chrome.storage.local.get(['whitelistedSites']);
        const whitelist = data.whitelistedSites || [];

        if (!whitelist.includes(domain)) {
          whitelist.push(domain);
          await chrome.storage.local.set({ whitelistedSites: whitelist });
          alert(`${domain} has been added to the whitelist.`);
        } else {
          alert(`${domain} is already whitelisted.`);
        }
      } catch (e) {
        alert('Unable to whitelist this site.');
      }
    }
  });
}

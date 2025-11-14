/**
 * Background Service Worker for Real-Time Phishing Detection
 * Handles URL analysis, navigation monitoring, and threat detection
 */

'use strict';

// Configuration constants
const CONFIG = {
  MAX_STORED_BLOCKED_SITES: 100,
  SUSPICION_THRESHOLD: 50,
  NAVIGATION_DEBOUNCE_MS: 100,
  LEGITIMATE_DOMAIN_DISTANCE_THRESHOLD: 3
};

// Known phishing indicators database
const PHISHING_KEYWORDS = [
  'verify', 'account', 'suspend', 'confirm', 'update', 'secure',
  'banking', 'paypal', 'amazon', 'signin', 'login', 'password',
  'urgent', 'immediately', 'click here', 'verify your account',
  'limited time', 'act now', 'suspended', 'unusual activity'
];

const LEGITIMATE_DOMAINS = [
  'google.com', 'facebook.com', 'amazon.com', 'paypal.com',
  'microsoft.com', 'apple.com', 'netflix.com', 'instagram.com',
  'twitter.com', 'linkedin.com', 'github.com', 'stackoverflow.com',
  'reddit.com', 'wikipedia.org', 'youtube.com', 'gmail.com'
];

const SUSPICIOUS_TLDS = [
  '.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.work',
  '.click', '.link', '.download', '.racing', '.science'
];

// Debounce map for navigation events
const navigationDebounce = new Map();

/**
 * Initialize extension state on installation
 */
chrome.runtime.onInstalled.addListener(async (details) => {
  try {
    const existingData = await chrome.storage.local.get([
      'enabled',
      'blockedSites',
      'whitelistedSites',
      'detectionStats'
    ]);

    // Only set defaults if not already set (preserve data on update)
    const defaultData = {
      enabled: existingData.enabled !== undefined ? existingData.enabled : true,
      blockedSites: existingData.blockedSites || [],
      whitelistedSites: existingData.whitelistedSites || [],
      detectionStats: existingData.detectionStats || {
        totalChecks: 0,
        threatsBlocked: 0,
        lastUpdate: Date.now()
      }
    };

    await chrome.storage.local.set(defaultData);
    await updateBadge();

    if (details.reason === 'install') {
      console.log('[Phishing Detection] Extension installed successfully');
    } else if (details.reason === 'update') {
      console.log(`[Phishing Detection] Extension updated to version ${chrome.runtime.getManifest().version}`);
    }
  } catch (error) {
    console.error('[Phishing Detection] Installation error:', error);
  }
});

/**
 * Extract domain from URL with error handling
 * @param {string} url - The URL to extract domain from
 * @returns {string|null} - The domain or null if invalid
 */
function extractDomain(url) {
  try {
    if (!url || typeof url !== 'string') return null;
    const urlObj = new URL(url);
    return urlObj.hostname.toLowerCase();
  } catch (e) {
    return null;
  }
}

/**
 * Calculate Levenshtein distance between two strings
 * Used for detecting lookalike domains
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} - Edit distance between strings
 */
function levenshteinDistance(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix = Array(len2 + 1).fill(null).map(() => Array(len1 + 1).fill(0));

  for (let i = 0; i <= len1; i++) matrix[0][i] = i;
  for (let j = 0; j <= len2; j++) matrix[j][0] = j;

  for (let j = 1; j <= len2; j++) {
    for (let i = 1; i <= len1; i++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j - 1][i] + 1,     // deletion
        matrix[j][i - 1] + 1,     // insertion
        matrix[j - 1][i - 1] + cost  // substitution
      );
    }
  }

  return matrix[len2][len1];
}

/**
 * Check if domain is similar to a legitimate domain
 * @param {string} domain - Domain to check
 * @returns {Object|null} - Match info or null
 */
function checkLookalikeDomain(domain) {
  if (!domain) return null;

  for (const legitDomain of LEGITIMATE_DOMAINS) {
    // Check for exact subdomain match (e.g., paypal.example.com)
    if (domain.includes(legitDomain) && domain !== legitDomain) {
      // Check if it's a suspicious subdomain usage
      const parts = domain.split('.');
      const legitParts = legitDomain.split('.');

      // If legitimate domain appears in subdomain position, it's suspicious
      if (domain.endsWith(legitDomain)) {
        // e.g., fake-paypal.com vs paypal.com - legitimate subdomain
        continue;
      } else if (domain.includes(legitDomain + '.')) {
        // e.g., paypal.com.fake.com - very suspicious
        return {
          domain: legitDomain,
          reason: `Suspicious use of "${legitDomain}" in domain name`
        };
      }
    }

    // Check for typosquatting using edit distance
    const distance = levenshteinDistance(domain, legitDomain);
    if (distance > 0 && distance <= CONFIG.LEGITIMATE_DOMAIN_DISTANCE_THRESHOLD) {
      return {
        domain: legitDomain,
        reason: `Very similar to legitimate domain "${legitDomain}" (typosquatting)`
      };
    }
  }

  return null;
}

/**
 * Analyze URL for phishing indicators
 * @param {string} url - URL to analyze
 * @returns {Object} - Analysis result with suspicion score and reasons
 */
function checkSuspiciousURL(url) {
  const domain = extractDomain(url);
  if (!domain) {
    return { suspicious: false, suspicionScore: 0, reasons: [], domain: null };
  }

  const reasons = [];
  let suspicionScore = 0;

  try {
    // Check for IP address instead of domain
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$|^\[?[0-9a-fA-F:]+\]?$/;
    if (ipPattern.test(domain)) {
      reasons.push('Uses IP address instead of domain name');
      suspicionScore += 40;
    }

    // Check for excessive subdomains (more than 4 parts)
    const domainParts = domain.split('.');
    if (domainParts.length > 4) {
      reasons.push(`Excessive number of subdomains (${domainParts.length} levels)`);
      suspicionScore += 20;
    }

    // Check for homograph attacks (non-ASCII characters)
    if (/[^\x00-\x7F]/.test(domain)) {
      reasons.push('Contains non-ASCII characters (possible homograph attack)');
      suspicionScore += 50;
    }

    // Check for suspicious TLDs
    const hasSuspiciousTLD = SUSPICIOUS_TLDS.some(tld => domain.endsWith(tld));
    if (hasSuspiciousTLD) {
      const tld = SUSPICIOUS_TLDS.find(tld => domain.endsWith(tld));
      reasons.push(`Uses suspicious top-level domain: ${tld}`);
      suspicionScore += 30;
    }

    // Check for lookalike domains
    const lookalike = checkLookalikeDomain(domain);
    if (lookalike) {
      reasons.push(lookalike.reason);
      suspicionScore += 60;
    }

    // Check for excessive hyphens
    const hyphenCount = (domain.match(/-/g) || []).length;
    if (hyphenCount > 2) {
      reasons.push(`Excessive hyphens in domain name (${hyphenCount})`);
      suspicionScore += 15;
    }

    // Check for long numeric sequences
    if (/\d{5,}/.test(domain)) {
      reasons.push('Contains long numeric sequences');
      suspicionScore += 20;
    }

    // Check URL length
    if (url.length > 200) {
      reasons.push(`Extremely long URL (${url.length} characters)`);
      suspicionScore += 25;
    }

    // Check for @ symbol (URL obfuscation technique)
    if (url.includes('@')) {
      reasons.push('Contains @ symbol (possible URL obfuscation)');
      suspicionScore += 50;
    }

    // Check for data: or javascript: URLs
    if (url.startsWith('data:') || url.startsWith('javascript:')) {
      reasons.push('Uses suspicious URL scheme');
      suspicionScore += 70;
    }

    // Check for phishing keywords in URL
    const lowerURL = url.toLowerCase();
    const keywordMatches = PHISHING_KEYWORDS.filter(keyword =>
      lowerURL.includes(keyword)
    );

    if (keywordMatches.length >= 2) {
      reasons.push(`Contains ${keywordMatches.length} phishing-related keywords`);
      suspicionScore += keywordMatches.length * 10;
    }

    // Check for shortened URLs (common in phishing)
    const shortenerDomains = ['bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'ow.ly'];
    if (shortenerDomains.some(shortener => domain.includes(shortener))) {
      reasons.push('Uses URL shortening service');
      suspicionScore += 10;
    }

  } catch (error) {
    console.error('[Phishing Detection] Error analyzing URL:', error);
  }

  return {
    suspicious: suspicionScore >= CONFIG.SUSPICION_THRESHOLD,
    suspicionScore,
    reasons,
    domain
  };
}

/**
 * Check if URL is whitelisted
 * @param {string} url - URL to check
 * @returns {Promise<boolean>} - True if whitelisted
 */
async function isWhitelisted(url) {
  try {
    const data = await chrome.storage.local.get(['whitelistedSites']);
    const whitelist = data.whitelistedSites || [];
    const domain = extractDomain(url);

    if (!domain) return false;

    // Check for exact domain match or parent domain match
    return whitelist.some(whitelistedDomain => {
      return domain === whitelistedDomain || domain.endsWith('.' + whitelistedDomain);
    });
  } catch (error) {
    console.error('[Phishing Detection] Error checking whitelist:', error);
    return false;
  }
}

/**
 * Check if URL should be skipped
 * @param {string} url - URL to check
 * @returns {boolean} - True if should skip
 */
function shouldSkipURL(url) {
  if (!url || typeof url !== 'string') return true;

  const skipPrefixes = [
    'chrome://',
    'chrome-extension://',
    'about:',
    'edge://',
    'brave://',
    'vivaldi://',
    'opera://'
  ];

  return skipPrefixes.some(prefix => url.startsWith(prefix));
}

/**
 * Handle navigation events with debouncing
 */
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  try {
    // Only check main frame navigations
    if (details.frameId !== 0) return;

    const url = details.url;
    const tabId = details.tabId;

    // Skip internal URLs
    if (shouldSkipURL(url)) return;

    // Debounce rapid navigation events
    const debounceKey = `${tabId}-${url}`;
    const now = Date.now();
    const lastCheck = navigationDebounce.get(debounceKey);

    if (lastCheck && (now - lastCheck) < CONFIG.NAVIGATION_DEBOUNCE_MS) {
      return;
    }
    navigationDebounce.set(debounceKey, now);

    // Clean old debounce entries (older than 5 seconds)
    for (const [key, timestamp] of navigationDebounce.entries()) {
      if (now - timestamp > 5000) {
        navigationDebounce.delete(key);
      }
    }

    // Check if protection is enabled
    const settings = await chrome.storage.local.get(['enabled']);
    if (settings.enabled === false) return;

    // Check if whitelisted
    if (await isWhitelisted(url)) {
      return;
    }

    // Analyze URL
    const analysis = checkSuspiciousURL(url);

    // Update statistics
    const stats = await chrome.storage.local.get(['detectionStats']);
    const currentStats = stats.detectionStats || {
      totalChecks: 0,
      threatsBlocked: 0,
      lastUpdate: Date.now()
    };
    currentStats.totalChecks++;
    currentStats.lastUpdate = Date.now();

    if (analysis.suspicious) {
      currentStats.threatsBlocked++;

      // Store blocked site
      const blocked = await chrome.storage.local.get(['blockedSites']);
      const blockedSites = blocked.blockedSites || [];

      blockedSites.push({
        url,
        domain: analysis.domain,
        reasons: analysis.reasons,
        score: analysis.suspicionScore,
        timestamp: Date.now()
      });

      // Keep only recent blocked sites
      const recentBlocked = blockedSites.slice(-CONFIG.MAX_STORED_BLOCKED_SITES);

      await chrome.storage.local.set({
        blockedSites: recentBlocked,
        detectionStats: currentStats
      });

      // Redirect to warning page
      const warningURL = chrome.runtime.getURL('warning.html') +
        '?blocked=' + encodeURIComponent(url) +
        '&reasons=' + encodeURIComponent(JSON.stringify(analysis.reasons)) +
        '&score=' + analysis.suspicionScore;

      try {
        await chrome.tabs.update(tabId, { url: warningURL });
      } catch (updateError) {
        console.error('[Phishing Detection] Error updating tab:', updateError);
      }

      console.log(`[Phishing Detection] Blocked suspicious site: ${url} (score: ${analysis.suspicionScore})`);
    } else {
      // Update stats even for safe sites
      await chrome.storage.local.set({ detectionStats: currentStats });
    }
  } catch (error) {
    console.error('[Phishing Detection] Navigation handler error:', error);
  }
});

/**
 * Analyze page content for phishing indicators
 * @param {Object} data - Page analysis data from content script
 * @returns {Object} - Analysis result
 */
function analyzePageContent(data) {
  let suspicionScore = 0;
  const warnings = [];

  try {
    // Check for password input without HTTPS
    if (data.hasPasswordField && !data.isHTTPS) {
      warnings.push('Password field on non-HTTPS page');
      suspicionScore += 60;
    }

    // Check for suspicious form actions
    if (data.hasSuspiciousFormAction) {
      warnings.push('Form submits to external domain');
      suspicionScore += 40;
    }

    // Check for excessive external links
    if (data.externalLinksRatio !== undefined && data.externalLinksRatio > 0.7) {
      warnings.push(`High ratio of external links (${Math.round(data.externalLinksRatio * 100)}%)`);
      suspicionScore += 30;
    }

    // Check for hidden iframes
    if (data.hasHiddenIframes) {
      warnings.push('Contains hidden iframes');
      suspicionScore += 50;
    }
  } catch (error) {
    console.error('[Phishing Detection] Content analysis error:', error);
  }

  return {
    suspicious: suspicionScore >= CONFIG.SUSPICION_THRESHOLD,
    suspicionScore,
    warnings
  };
}

/**
 * Message handler for content script and popup communication
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    if (request.action === 'analyzeContent') {
      const contentAnalysis = analyzePageContent(request.data);
      sendResponse({ analysis: contentAnalysis });
    } else if (request.action === 'checkURL') {
      const urlAnalysis = checkSuspiciousURL(request.url);
      sendResponse({ analysis: urlAnalysis });
    } else {
      sendResponse({ error: 'Unknown action' });
    }
  } catch (error) {
    console.error('[Phishing Detection] Message handler error:', error);
    sendResponse({ error: error.message });
  }

  return true; // Keep message channel open for async response
});

/**
 * Update extension badge based on enabled state
 */
async function updateBadge() {
  try {
    const data = await chrome.storage.local.get(['enabled']);
    const enabled = data.enabled !== false; // Default to true

    if (enabled) {
      await chrome.action.setBadgeText({ text: '' });
      await chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' });
    } else {
      await chrome.action.setBadgeText({ text: 'OFF' });
      await chrome.action.setBadgeBackgroundColor({ color: '#999999' });
    }
  } catch (error) {
    console.error('[Phishing Detection] Badge update error:', error);
  }
}

/**
 * Listen for storage changes to update badge
 */
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.enabled) {
    updateBadge();
  }
});

// Initialize badge on startup
updateBadge();

console.log('[Phishing Detection] Background service worker initialized');

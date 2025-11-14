// Background Service Worker for Real-Time Phishing Detection

// Initialize extension state
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    enabled: true,
    blockedSites: [],
    whitelistedSites: [],
    detectionStats: {
      totalChecks: 0,
      threatsBlocked: 0,
      lastUpdate: Date.now()
    }
  });
  console.log('Phishing Detection Extension installed');
});

// Known phishing indicators database
const PHISHING_KEYWORDS = [
  'verify', 'account', 'suspend', 'confirm', 'update', 'secure',
  'banking', 'paypal', 'amazon', 'signin', 'login', 'password',
  'urgent', 'immediately', 'click here', 'verify your account'
];

const LEGITIMATE_DOMAINS = [
  'google.com', 'facebook.com', 'amazon.com', 'paypal.com',
  'microsoft.com', 'apple.com', 'netflix.com', 'instagram.com',
  'twitter.com', 'linkedin.com', 'github.com', 'stackoverflow.com'
];

// URL analysis functions
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    return null;
  }
}

function checkSuspiciousURL(url) {
  const domain = extractDomain(url);
  if (!domain) return { suspicious: false, reasons: [] };

  const reasons = [];
  let suspicionScore = 0;

  // Check for IP address instead of domain
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(domain)) {
    reasons.push('Uses IP address instead of domain name');
    suspicionScore += 40;
  }

  // Check for excessive subdomains
  const subdomains = domain.split('.');
  if (subdomains.length > 4) {
    reasons.push('Excessive number of subdomains');
    suspicionScore += 20;
  }

  // Check for homograph attacks (lookalike characters)
  if (/[а-яА-Я]/.test(domain)) {
    reasons.push('Contains Cyrillic characters (possible homograph attack)');
    suspicionScore += 50;
  }

  // Check for suspicious TLDs
  const suspiciousTLDs = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top'];
  if (suspiciousTLDs.some(tld => domain.endsWith(tld))) {
    reasons.push('Uses suspicious top-level domain');
    suspicionScore += 30;
  }

  // Check for lookalike domains
  LEGITIMATE_DOMAINS.forEach(legitDomain => {
    if (domain.includes(legitDomain) && domain !== legitDomain) {
      const distance = levenshteinDistance(domain, legitDomain);
      if (distance < 3) {
        reasons.push(`Lookalike domain similar to ${legitDomain}`);
        suspicionScore += 60;
      }
    }
  });

  // Check for excessive hyphens
  const hyphens = (domain.match(/-/g) || []).length;
  if (hyphens > 2) {
    reasons.push('Excessive hyphens in domain name');
    suspicionScore += 15;
  }

  // Check for suspicious patterns
  if (domain.match(/\d{5,}/)) {
    reasons.push('Contains long numeric sequences');
    suspicionScore += 20;
  }

  // Check URL length
  if (url.length > 200) {
    reasons.push('Extremely long URL');
    suspicionScore += 25;
  }

  // Check for @ symbol (can hide real domain)
  if (url.includes('@')) {
    reasons.push('Contains @ symbol (possible URL obfuscation)');
    suspicionScore += 50;
  }

  // Check for phishing keywords in URL
  const lowerURL = url.toLowerCase();
  let keywordMatches = 0;
  PHISHING_KEYWORDS.forEach(keyword => {
    if (lowerURL.includes(keyword)) {
      keywordMatches++;
    }
  });
  if (keywordMatches >= 2) {
    reasons.push(`Contains multiple phishing-related keywords (${keywordMatches})`);
    suspicionScore += keywordMatches * 10;
  }

  return {
    suspicious: suspicionScore >= 50,
    suspicionScore,
    reasons,
    domain
  };
}

// Levenshtein distance for similarity checking
function levenshteinDistance(str1, str2) {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

// Check if site is whitelisted
async function isWhitelisted(url) {
  const data = await chrome.storage.local.get(['whitelistedSites']);
  const whitelist = data.whitelistedSites || [];
  const domain = extractDomain(url);
  return whitelist.some(site => domain && domain.includes(site));
}

// Monitor navigation events
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId !== 0) return; // Only check main frame

  const data = await chrome.storage.local.get(['enabled']);
  if (!data.enabled) return;

  const url = details.url;

  // Skip chrome:// and extension URLs
  if (url.startsWith('chrome://') || url.startsWith('chrome-extension://')) {
    return;
  }

  // Check if whitelisted
  if (await isWhitelisted(url)) {
    return;
  }

  // Analyze URL
  const analysis = checkSuspiciousURL(url);

  // Update stats
  const stats = await chrome.storage.local.get(['detectionStats']);
  const currentStats = stats.detectionStats || { totalChecks: 0, threatsBlocked: 0 };
  currentStats.totalChecks++;

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

    await chrome.storage.local.set({
      blockedSites: blockedSites.slice(-100), // Keep last 100
      detectionStats: currentStats
    });

    // Redirect to warning page
    chrome.tabs.update(details.tabId, {
      url: chrome.runtime.getURL('warning.html') + '?blocked=' + encodeURIComponent(url) +
           '&reasons=' + encodeURIComponent(JSON.stringify(analysis.reasons)) +
           '&score=' + analysis.suspicionScore
    });
  } else {
    await chrome.storage.local.set({ detectionStats: currentStats });
  }
});

// Message handler for content script communication
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzeContent') {
    const contentAnalysis = analyzePageContent(request.data);
    sendResponse({ analysis: contentAnalysis });
  } else if (request.action === 'checkURL') {
    const urlAnalysis = checkSuspiciousURL(request.url);
    sendResponse({ analysis: urlAnalysis });
  }
  return true;
});

// Analyze page content for phishing indicators
function analyzePageContent(data) {
  let suspicionScore = 0;
  const warnings = [];

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
  if (data.externalLinksRatio > 0.7) {
    warnings.push('High ratio of external links');
    suspicionScore += 30;
  }

  // Check for hidden iframes
  if (data.hasHiddenIframes) {
    warnings.push('Contains hidden iframes');
    suspicionScore += 50;
  }

  return {
    suspicious: suspicionScore >= 50,
    suspicionScore,
    warnings
  };
}

// Badge update
async function updateBadge() {
  const data = await chrome.storage.local.get(['enabled', 'detectionStats']);
  if (data.enabled) {
    chrome.action.setBadgeText({ text: '' });
    chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' });
  } else {
    chrome.action.setBadgeText({ text: 'OFF' });
    chrome.action.setBadgeBackgroundColor({ color: '#999999' });
  }
}

// Update badge on startup
updateBadge();

# Developer API Documentation

Complete reference for developers working with or extending the Real-Time Phishing Detection Extension.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Core Modules](#core-modules)
- [Public APIs](#public-apis)
- [Internal Functions](#internal-functions)
- [Extension Points](#extension-points)
- [Message Protocol](#message-protocol)
- [Storage Schema](#storage-schema)
- [Events](#events)
- [Testing APIs](#testing-apis)

---

## Architecture Overview

```
┌─────────────────────────────────────┐
│         Browser Environment          │
├─────────────────────────────────────┤
│                                      │
│  ┌──────────┐       ┌──────────┐   │
│  │  Popup   │◄─────►│ Warning  │   │
│  │   UI     │       │   Page   │   │
│  └────┬─────┘       └─────┬────┘   │
│       │                   │         │
│       └────────┬──────────┘         │
│                │                     │
│          ┌─────▼──────┐             │
│          │ Background │             │
│          │  Service   │             │
│          │  Worker    │             │
│          └─────┬──────┘             │
│                │                     │
│         ┌──────▼───────┐            │
│         │   Content    │            │
│         │   Script     │            │
│         └──────────────┘            │
│                                      │
└─────────────────────────────────────┘
```

---

## Core Modules

### background.js

**Purpose:** Central detection logic and state management

**Key Exports:**
- `checkSuspiciousURL(url)` - Main detection function
- `analyzePageContent(data)` - Content analysis
- `isWhitelisted(url)` - Whitelist checking

**Dependencies:**
- Chrome Extension APIs
- Local storage

### content.js

**Purpose:** Page content analysis and user interface

**Key Functions:**
- `analyzePage()` - Analyze current page
- `displayWarningBanner(analysis)` - Show warning
- `setupObserver()` - Monitor DOM changes

**Injection:** `document_start` in all frames

### popup.js

**Purpose:** Extension popup interface

**Key Functions:**
- `loadState()` - Load extension state
- `displayBlockedSites()` - Render history
- `handleToggleProtection()` - Toggle enable/disable

### warning.js

**Purpose:** Warning page for blocked sites

**Key Functions:**
- `displayBlockedURL()` - Show URL safely
- `displaySuspicionScore()` - Show score
- `handleProceedAnyway()` - Whitelist and proceed

---

## Public APIs

### Detection API

#### `checkSuspiciousURL(url: string): AnalysisResult`

Analyzes a URL for phishing indicators.

**Parameters:**
- `url` (string): The URL to analyze

**Returns:** `AnalysisResult`
```typescript
interface AnalysisResult {
  suspicious: boolean;      // true if score >= 50
  suspicionScore: number;   // 0-100
  reasons: string[];        // Array of detection reasons
  domain: string | null;    // Extracted domain
}
```

**Example:**
```javascript
const result = checkSuspiciousURL('http://192.168.1.1/paypal');
// {
//   suspicious: true,
//   suspicionScore: 60,
//   reasons: ['Uses IP address', 'Contains phishing keywords'],
//   domain: '192.168.1.1'
// }
```

#### `analyzePageContent(data: PageData): ContentAnalysis`

Analyzes page content for phishing indicators.

**Parameters:**
```typescript
interface PageData {
  isHTTPS: boolean;
  hasPasswordField: boolean;
  hasSuspiciousFormAction: boolean;
  externalLinksRatio: number;  // 0.0 - 1.0
  hasHiddenIframes: boolean;
}
```

**Returns:** `ContentAnalysis`
```typescript
interface ContentAnalysis {
  suspicious: boolean;
  suspicionScore: number;
  warnings: string[];
}
```

**Example:**
```javascript
const analysis = analyzePageContent({
  isHTTPS: false,
  hasPasswordField: true,
  hasSuspiciousFormAction: false,
  externalLinksRatio: 0.3,
  hasHiddenIframes: false
});
// {
//   suspicious: true,
//   suspicionScore: 60,
//   warnings: ['Password field on non-HTTPS page']
// }
```

---

## Internal Functions

### Utility Functions

#### `extractDomain(url: string): string | null`

Safely extracts domain from URL.

**Parameters:**
- `url` (string): URL to parse

**Returns:** Domain string or `null` if invalid

**Example:**
```javascript
extractDomain('https://example.com/path') // 'example.com'
extractDomain('invalid-url')              // null
```

#### `levenshteinDistance(str1: string, str2: string): number`

Calculates edit distance between two strings.

**Used for:** Typosquatting detection

**Time Complexity:** O(m*n)

**Example:**
```javascript
levenshteinDistance('paypal', 'paypa1')  // 1
levenshteinDistance('google', 'g00gle')  // 2
```

#### `escapeHTML(text: string): string`

Escapes HTML to prevent XSS.

**Example:**
```javascript
escapeHTML('<script>alert("xss")</script>')
// '&lt;script&gt;alert("xss")&lt;/script&gt;'
```

---

## Extension Points

### Adding New Detection Heuristics

To add a new heuristic to `checkSuspiciousURL()`:

```javascript
// In background.js, checkSuspiciousURL() function

// Your new heuristic
if (/* your condition */) {
  reasons.push('Your reason description');
  suspicionScore += 25;  // Your score adjustment
}
```

**Guidelines:**
- Score between 10-70 (50 is threshold)
- Clear, user-friendly reason message
- Avoid false positives
- Test thoroughly

### Adding Content Checks

To add checks in `analyzePageContent()`:

```javascript
// In background.js, analyzePageContent() function

if (data.yourNewCheck) {
  warnings.push('Your warning message');
  suspicionScore += 30;
}
```

### Custom Configuration

Override defaults by editing `CONFIG` object:

```javascript
const CONFIG = {
  MAX_STORED_BLOCKED_SITES: 100,
  SUSPICION_THRESHOLD: 50,  // Lower = more sensitive
  NAVIGATION_DEBOUNCE_MS: 100,
  LEGITIMATE_DOMAIN_DISTANCE_THRESHOLD: 3
};
```

---

## Message Protocol

### Content Script → Background

**analyzeContent**
```javascript
chrome.runtime.sendMessage({
  action: 'analyzeContent',
  data: {
    isHTTPS: boolean,
    hasPasswordField: boolean,
    hasSuspiciousFormAction: boolean,
    externalLinksRatio: number,
    hasHiddenIframes: boolean
  }
}, (response) => {
  // response.analysis contains ContentAnalysis
});
```

**checkURL**
```javascript
chrome.runtime.sendMessage({
  action: 'checkURL',
  url: string
}, (response) => {
  // response.analysis contains AnalysisResult
});
```

### Message Handler (Background)

```javascript
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzeContent') {
    const analysis = analyzePageContent(request.data);
    sendResponse({ analysis });
  } else if (request.action === 'checkURL') {
    const analysis = checkSuspiciousURL(request.url);
    sendResponse({ analysis });
  }
  return true;  // Keep channel open
});
```

---

## Storage Schema

### chrome.storage.local

```typescript
interface StorageSchema {
  // Protection enabled/disabled
  enabled: boolean;

  // Blocked sites history (last 100)
  blockedSites: Array<{
    url: string;
    domain: string;
    reasons: string[];
    score: number;
    timestamp: number;
  }>;

  // Whitelisted domains
  whitelistedSites: string[];

  // Usage statistics
  detectionStats: {
    totalChecks: number;
    threatsBlocked: number;
    lastUpdate: number;
  };
}
```

### Reading Storage

```javascript
chrome.storage.local.get(['enabled', 'blockedSites'], (data) => {
  if (chrome.runtime.lastError) {
    console.error('Storage error:', chrome.runtime.lastError);
    return;
  }

  const enabled = data.enabled !== false;  // Default true
  const blockedSites = data.blockedSites || [];

  // Use data...
});
```

### Writing Storage

```javascript
chrome.storage.local.set({
  enabled: true,
  detectionStats: {
    totalChecks: 100,
    threatsBlocked: 5,
    lastUpdate: Date.now()
  }
}, () => {
  if (chrome.runtime.lastError) {
    console.error('Storage error:', chrome.runtime.lastError);
  }
});
```

---

## Events

### Navigation Events

```javascript
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  // Only main frame
  if (details.frameId !== 0) return;

  const url = details.url;
  const tabId = details.tabId;

  // Analyze and potentially block
  const analysis = checkSuspiciousURL(url);
  if (analysis.suspicious) {
    // Redirect to warning page
    chrome.tabs.update(tabId, { url: warningPageURL });
  }
});
```

### Storage Change Events

```javascript
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.enabled) {
    const enabled = changes.enabled.newValue;
    updateBadge(enabled);
  }
});
```

---

## Testing APIs

### Manual Testing

```javascript
// In console (popup or background service worker)

// Test URL analysis
chrome.runtime.sendMessage({
  action: 'checkURL',
  url: 'http://192.168.1.1/test'
}, console.log);

// Test content analysis
chrome.runtime.sendMessage({
  action: 'analyzeContent',
  data: {
    isHTTPS: false,
    hasPasswordField: true,
    hasSuspiciousFormAction: false,
    externalLinksRatio: 0.5,
    hasHiddenIframes: false
  }
}, console.log);

// Read storage
chrome.storage.local.get(null, console.log);

// Clear storage
chrome.storage.local.clear();
```

### Unit Testing (Future)

```javascript
// Jest test example
describe('checkSuspiciousURL', () => {
  test('detects IP addresses', () => {
    const result = checkSuspiciousURL('http://192.168.1.1/');
    expect(result.suspicious).toBe(true);
    expect(result.reasons).toContain('Uses IP address');
  });
});
```

---

## Performance Considerations

### Optimization Tips

1. **Debounce rapid events**
   ```javascript
   const debounce = new Map();
   const key = `${tabId}-${url}`;
   if (debounce.has(key)) return;
   debounce.set(key, Date.now());
   ```

2. **Minimize storage operations**
   ```javascript
   // Bad: Multiple reads
   const data1 = await chrome.storage.local.get(['enabled']);
   const data2 = await chrome.storage.local.get(['whitelist']);

   // Good: Single read
   const data = await chrome.storage.local.get(['enabled', 'whitelist']);
   ```

3. **Efficient DOM queries**
   ```javascript
   // Cache results
   const forms = document.querySelectorAll('form');
   // Use cached result multiple times
   ```

---

## Security Guidelines

### Input Validation

```javascript
// Always validate URLs
try {
  const urlObj = new URL(userInput);
  // Proceed with valid URL
} catch (e) {
  // Handle invalid URL
  return null;
}
```

### XSS Prevention

```javascript
// Never use innerHTML with user data
element.innerHTML = userInput;  // ❌ BAD

// Use textContent
element.textContent = userInput;  // ✅ GOOD

// Or escape HTML
element.innerHTML = escapeHTML(userInput);  // ✅ GOOD
```

### Error Handling

```javascript
// Always check chrome.runtime.lastError
chrome.storage.local.get(['data'], (result) => {
  if (chrome.runtime.lastError) {
    console.error('Error:', chrome.runtime.lastError.message);
    return;
  }
  // Safe to use result
});
```

---

## Chrome Extension APIs Used

### Core APIs

- **chrome.runtime**
  - `.sendMessage()` - Message passing
  - `.onMessage` - Message handler
  - `.getURL()` - Get extension resources
  - `.lastError` - Error checking

- **chrome.storage.local**
  - `.get()` - Read storage
  - `.set()` - Write storage
  - `.clear()` - Clear storage
  - `.onChanged` - Listen for changes

- **chrome.tabs**
  - `.query()` - Find tabs
  - `.update()` - Modify tabs

- **chrome.webNavigation**
  - `.onBeforeNavigate` - Intercept navigation

- **chrome.action**
  - `.setBadgeText()` - Update badge
  - `.setBadgeBackgroundColor()` - Badge color

---

## Examples

### Complete Custom Heuristic

```javascript
// Add to checkSuspiciousURL() in background.js

// Detect sites with "login" + "urgent" combo
const hasLogin = lowerURL.includes('login');
const hasUrgent = lowerURL.includes('urgent');

if (hasLogin && hasUrgent) {
  reasons.push('Suspicious combination: login + urgent');
  suspicionScore += 35;
}
```

### Custom Content Check

```javascript
// Add to analyzePage() in content.js

// Check for excessive password fields (credential harvesting)
const passwordFields = document.querySelectorAll('input[type="password"]');
if (passwordFields.length > 3) {
  data.excessivePasswordFields = true;
}

// Add to analyzePageContent() in background.js
if (data.excessivePasswordFields) {
  warnings.push('Excessive password fields detected');
  suspicionScore += 40;
}
```

---

## Debugging Tips

### Enable Verbose Logging

```javascript
// Add at top of background.js
const DEBUG = true;

function debugLog(...args) {
  if (DEBUG) {
    console.log('[Debug]', ...args);
  }
}

// Use throughout code
debugLog('Analyzing URL:', url);
```

### Inspect Service Worker

1. Go to `chrome://extensions/`
2. Find extension
3. Click "Service Worker" (inspect)
4. View console logs

### Test Detection Logic

```javascript
// In service worker console
const testURLs = [
  'http://192.168.1.1/test',
  'http://paypa1.com',
  'http://example.tk'
];

testURLs.forEach(url => {
  const result = checkSuspiciousURL(url);
  console.log(url, '->', result.suspicionScore, result.reasons);
});
```

---

## Resources

- [Chrome Extension API Reference](https://developer.chrome.com/docs/extensions/reference/)
- [Manifest V3 Migration](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [WebExtensions API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:
- Code style
- Testing requirements
- Documentation standards
- Pull request process

---

**Last Updated:** 2025-11-14
**Version:** 1.0.1

[⬆ Back to Top](#developer-api-documentation)

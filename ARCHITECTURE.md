# Architecture Documentation

This document provides a comprehensive overview of the Real-Time Phishing Detection Browser Extension's architecture, design decisions, and implementation details.

## Table of Contents

- [High-Level Overview](#high-level-overview)
- [Component Architecture](#component-architecture)
- [Data Flow](#data-flow)
- [Module Descriptions](#module-descriptions)
- [Detection Algorithms](#detection-algorithms)
- [Storage Schema](#storage-schema)
- [Security Architecture](#security-architecture)
- [Performance Considerations](#performance-considerations)
- [Extension APIs Used](#extension-apis-used)
- [Design Decisions](#design-decisions)

## High-Level Overview

The extension follows a **multi-layer security architecture** with three main components:

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser UI                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Popup UI   │    │   Warning    │    │   Content    │  │
│  │  (popup.js)  │    │    Page      │    │   Script     │  │
│  │              │    │ (warning.js) │    │ (content.js) │  │
│  └──────┬───────┘    └──────────────┘    └──────┬───────┘  │
│         │                                         │          │
│         └─────────────────┬─────────────────────┘          │
│                           │                                  │
│                  ┌────────▼────────┐                        │
│                  │   Background    │                        │
│                  │ Service Worker  │                        │
│                  │ (background.js) │                        │
│                  └────────┬────────┘                        │
│                           │                                  │
│                  ┌────────▼────────┐                        │
│                  │  Chrome APIs    │                        │
│                  │  - Storage      │                        │
│                  │  - Tabs         │                        │
│                  │  - WebNav       │                        │
│                  └─────────────────┘                        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Architecture Style

- **Event-Driven**: Components communicate via Chrome extension message passing
- **Layered**: Clear separation between UI, logic, and data layers
- **Client-Side Only**: No server communication, all processing local
- **Service Worker Based**: Uses Manifest V3 service worker pattern

## Component Architecture

### 1. Background Service Worker (`background.js`)

**Role:** Central hub for all extension logic

**Responsibilities:**
- URL analysis and threat detection
- Navigation event monitoring
- Message routing between components
- State management
- Statistics tracking

**Key Functions:**
- `checkSuspiciousURL(url)` - Main detection algorithm
- `isWhitelisted(url)` - Whitelist checking
- `analyzePageContent(data)` - Content analysis
- `updateBadge()` - Badge state management

**Lifecycle:** Persistent service worker, restarts on events

### 2. Content Script (`content.js`)

**Role:** Page analysis and user warnings

**Responsibilities:**
- Analyze page content (forms, iframes, links)
- Display warning banners
- Monitor form submissions
- Detect dynamic content changes

**Injection:** Injected into all pages at `document_start`

**Key Functions:**
- `analyzePage()` - Page content analysis
- `displayWarningBanner()` - Show inline warnings
- `setupObserver()` - DOM mutation monitoring

**Lifecycle:** Injected per page, isolated from page scripts

### 3. Popup UI (`popup.js`, `popup.html`)

**Role:** User interface and settings

**Responsibilities:**
- Display statistics
- Show blocked sites
- Toggle protection on/off
- Manage whitelist
- Display current site status

**Communication:** Messages to background worker

**Lifecycle:** Opens/closes with popup

### 4. Warning Page (`warning.js`, `warning.html`)

**Role:** Full-page warning for blocked sites

**Responsibilities:**
- Display threat details
- Show suspicion score
- Provide action buttons (go back, proceed anyway)
- Handle whitelist additions

**Navigation:** Replaces dangerous page navigation

**Lifecycle:** One instance per blocked navigation

## Data Flow

### Navigation Interception Flow

```
User Clicks Link
       │
       ▼
webNavigation.onBeforeNavigate Event
       │
       ▼
Background: checkSuspiciousURL()
       │
       ├───→ Score < 50: Allow
       │                  │
       │                  ▼
       │            Navigation Proceeds
       │
       └───→ Score ≥ 50: Block
                      │
                      ▼
                 Update Stats
                      │
                      ▼
                 Store in History
                      │
                      ▼
                Redirect to warning.html
                      │
                      ▼
                Warning Page Displayed
                      │
         ┌────────────┼────────────┐
         │            │            │
         ▼            ▼            ▼
     Go Back    Proceed Anyway  Report
         │            │            │
         │            ▼            │
         │      Add to Whitelist  │
         │            │            │
         └────────────┴────────────┘
```

### Content Analysis Flow

```
Page Loads
     │
     ▼
Content Script Injected
     │
     ▼
analyzePage()
     │
     ├─→ Check for password fields
     ├─→ Check form actions
     ├─→ Count external links
     └─→ Detect hidden iframes
     │
     ▼
Send Analysis to Background
     │
     ▼
Background: analyzePageContent()
     │
     ├───→ Score < 50: No Action
     │
     └───→ Score ≥ 50: Return Warning
              │
              ▼
         displayWarningBanner()
```

### Message Passing Flow

```
Content Script          Background Worker          Popup
     │                         │                     │
     │─── analyzeContent ─────→│                     │
     │                         │                     │
     │←──── response ──────────│                     │
     │                         │                     │
     │                         │←── checkURL ────────│
     │                         │                     │
     │                         │──── response ───────→│
```

## Module Descriptions

### background.js (15KB)

**Configuration Constants:**
```javascript
const CONFIG = {
  MAX_STORED_BLOCKED_SITES: 100,
  SUSPICION_THRESHOLD: 50,
  NAVIGATION_DEBOUNCE_MS: 100,
  LEGITIMATE_DOMAIN_DISTANCE_THRESHOLD: 3
};
```

**Detection Databases:**
- `PHISHING_KEYWORDS` - Common phishing terms
- `LEGITIMATE_DOMAINS` - Known legitimate domains for comparison
- `SUSPICIOUS_TLDS` - High-risk top-level domains

**Key Algorithms:**
- `levenshteinDistance()` - String similarity (typosquatting detection)
- `checkLookalikeDomain()` - Legitimate domain impersonation detection
- `checkSuspiciousURL()` - Main URL analysis (15+ heuristics)

### content.js (13KB)

**Analysis Functions:**
- `analyzePage()` - Page content analysis
- `displayWarningBanner()` - Warning UI injection
- `setupObserver()` - MutationObserver for dynamic content
- `setupFormMonitoring()` - Form submission interception

**Safety Features:**
- Extension context invalidation handling
- Document.body existence checks
- Comprehensive error boundaries

### popup.js (11KB)

**UI Functions:**
- `loadState()` - Load and display current state
- `displayBlockedSites()` - Render blocked sites list
- `loadCurrentTab()` - Get and analyze current tab
- `handleToggleProtection()` - Toggle enable/disable
- `escapeHTML()` - XSS prevention utility

**Security:**
- All user data displayed via `textContent`
- HTML escaping for necessary HTML rendering
- Input validation throughout

### warning.js (9.8KB)

**Display Functions:**
- `displayBlockedURL()` - Show blocked URL safely
- `displaySuspicionScore()` - Render score with visualization
- `displayReasons()` - List threat reasons
- `handleProceedAnyway()` - Whitelist and navigate

**Safety:**
- URL validation before display
- JSON parsing with error handling
- XSS prevention via textContent

## Detection Algorithms

### URL Analysis Heuristics

The `checkSuspiciousURL()` function uses multiple heuristics:

| Heuristic | Score | Example |
|-----------|-------|---------|
| IP Address | +40 | `http://192.168.1.1/login` |
| Non-ASCII Characters | +50 | `http://раура1.com` (Cyrillic) |
| Suspicious TLD | +30 | `.tk`, `.ml`, `.xyz` |
| Lookalike Domain | +60 | `paypa1.com` vs `paypal.com` |
| Excessive Subdomains | +20 | `a.b.c.d.e.f.com` (>4 levels) |
| Excessive Hyphens | +15 | `pay-pal-secure.com` (>2) |
| Long Numbers | +20 | Domain with 5+ consecutive digits |
| Long URL | +25 | URL >200 characters |
| @ Symbol | +50 | `http://google.com@evil.com` |
| Suspicious Scheme | +70 | `javascript:`, `data:` |
| Multiple Keywords | +10 each | "verify", "urgent", "suspend" |
| URL Shortener | +10 | bit.ly, tinyurl.com |

**Threshold:** Score ≥ 50 = Blocked

### Content Analysis Heuristics

The `analyzePageContent()` function analyzes:

| Check | Score | Detection |
|-------|-------|-----------|
| Password on HTTP | +60 | `<input type="password">` on http:// |
| External Form Action | +40 | Form submits to different domain |
| High External Links | +30 | >70% links to external domains |
| Hidden Iframes | +50 | Iframes with display:none or 0 size |

**Threshold:** Score ≥ 50 = Warning Banner

### Levenshtein Distance Algorithm

Used for typosquatting detection:

```javascript
function levenshteinDistance(str1, str2) {
  // Dynamic programming approach
  // Time Complexity: O(m*n)
  // Space Complexity: O(m*n)

  // Creates matrix of edit distances
  // Returns minimum edits needed to transform str1 to str2
}
```

**Application:**
- Compare user domain to legitimate domains
- Distance ≤ 3 = Potential typosquatting
- Example: `paypa1.com` vs `paypal.com` = distance 1

## Storage Schema

### Chrome Local Storage

```javascript
{
  // Protection status
  "enabled": boolean,

  // Blocked sites history (last 100)
  "blockedSites": [
    {
      "url": string,
      "domain": string,
      "reasons": string[],
      "score": number,
      "timestamp": number
    }
  ],

  // Whitelisted domains
  "whitelistedSites": string[],

  // Usage statistics
  "detectionStats": {
    "totalChecks": number,
    "threatsBlocked": number,
    "lastUpdate": number
  }
}
```

**Storage Limits:**
- Chrome Local Storage: ~5MB limit
- Blocked sites: Limited to 100 entries (auto-prune)
- Whitelist: Unlimited but practical limit ~1000 domains

## Security Architecture

### Defense Layers

1. **Input Validation Layer**
   - URL parsing with try-catch
   - JSON parsing with validation
   - Type checking for all inputs

2. **XSS Prevention Layer**
   - `textContent` usage for user data
   - `escapeHTML()` function for HTML rendering
   - Content Security Policy enforcement

3. **Error Handling Layer**
   - Try-catch around all critical operations
   - `chrome.runtime.lastError` checks
   - Graceful degradation

4. **Permission Layer**
   - Minimal permissions requested
   - Host permissions required for protection
   - No unnecessary API access

### Threat Model

**Threats We Protect Against:**
- ✅ Phishing websites
- ✅ Typosquatting attacks
- ✅ Homograph attacks
- ✅ URL obfuscation
- ✅ Suspicious content (forms on HTTP, hidden iframes)

**Threats to the Extension:**
- ✅ XSS attacks (via malicious domain names)
- ✅ Code injection (via CSP)
- ✅ Storage tampering (via validation)
- ✅ Race conditions (via debouncing)

## Performance Considerations

### Optimization Strategies

1. **Navigation Debouncing**
   - 100ms debounce window
   - Prevents duplicate checks
   - Auto-cleanup of old entries

2. **Storage Optimization**
   - Batch storage operations
   - Limit stored entries (100 blocked sites)
   - Minimize redundant reads

3. **DOM Operations**
   - Query selector caching where possible
   - Minimize reflows
   - Efficient mutation observer

4. **Algorithm Efficiency**
   - Levenshtein: O(m*n) but short strings
   - URL parsing: O(1) with caching
   - Heuristic checks: O(n) where n is small

### Performance Metrics

- **Page Load Impact:** <100ms typically
- **Memory Usage:** ~10-15MB for service worker
- **Storage Usage:** ~100KB typical, ~500KB maximum
- **CPU Impact:** Minimal, event-driven

## Extension APIs Used

### Chrome APIs

| API | Usage | Purpose |
|-----|-------|---------|
| `chrome.runtime` | Message passing | Component communication |
| `chrome.storage.local` | Data persistence | Store settings and history |
| `chrome.tabs` | Tab management | Get current tab info |
| `chrome.webNavigation` | Navigation events | Intercept page navigation |
| `chrome.action` | Extension icon | Badge and popup |
| `chrome.alarms` | (Future use) | Periodic maintenance |

### Web APIs

| API | Usage | Purpose |
|-----|-------|---------|
| `URL()` | URL parsing | Safe URL handling |
| `MutationObserver` | DOM monitoring | Detect dynamic content |
| `localStorage` | N/A | Not used (chrome.storage instead) |

## Design Decisions

### Why Manifest V3?

- **Modern standard** - Google's current requirement
- **Service worker** - Better performance than persistent background pages
- **Security** - Stricter CSP and permission model
- **Future-proof** - MV2 being deprecated

### Why Local-Only?

- **Privacy** - No data collection
- **Performance** - No network latency
- **Reliability** - Works offline
- **Security** - No data leaks possible

### Why Multiple Heuristics?

- **Accuracy** - Single heuristics have high false positive/negative rates
- **Robustness** - Attackers can't bypass all checks
- **Scoring** - Weighted scoring allows tuning
- **Explainability** - Users see specific reasons

### Why Service Worker vs Background Page?

- **MV3 Requirement** - Google mandates service workers
- **Performance** - Event-driven, doesn't run constantly
- **Memory** - Terminates when idle
- **Battery** - Better for mobile/laptops

### Why Not Use External APIs?

- **Privacy** - Would require sending URLs externally
- **Speed** - Network latency
- **Reliability** - API downtime = extension broken
- **Cost** - Many APIs charge per request

### Why Debouncing?

- **Race Conditions** - Multiple rapid navigations
- **Performance** - Avoid duplicate checks
- **UX** - Prevent multiple warning pages

## Extension Lifecycle

### Installation

```
Extension Installed
       │
       ▼
chrome.runtime.onInstalled fires
       │
       ▼
Initialize default storage
       │
       ▼
Set enabled = true
       │
       ▼
Update badge
       │
       ▼
Ready to protect
```

### Navigation Handling

```
User navigates
       │
       ▼
onBeforeNavigate fires
       │
       ├→ Check: enabled?
       ├→ Check: whitelisted?
       ├→ Check: internal URL?
       │
       ▼
Analyze URL
       │
       ├→ Safe: Allow
       └→ Dangerous: Block
              │
              ▼
         Show warning
```

### Service Worker Lifecycle

```
Event occurs
       │
       ▼
Service worker wakes
       │
       ▼
Handle event
       │
       ▼
(30 seconds idle)
       │
       ▼
Service worker terminates
```

## Code Organization

### File Structure

```
RTPDBE/
├── manifest.json         # Extension configuration
├── background.js         # Service worker (15KB)
├── content.js           # Content script (13KB)
├── popup.html           # Popup UI structure
├── popup.js             # Popup logic (11KB)
├── warning.html         # Warning page structure
├── warning.js           # Warning page logic (10KB)
├── icons/               # Extension icons
├── generate-icons.js    # Icon generation utility
└── docs/                # Documentation
    ├── README.md
    ├── ARCHITECTURE.md  # This file
    ├── TESTING.md
    ├── CONTRIBUTING.md
    ├── SECURITY.md
    └── PRIVACY.md
```

### Module Dependencies

```
popup.js ────────┐
                 │
content.js ──────┼────→ background.js ──→ Chrome APIs
                 │              │
warning.js ──────┘              │
                                ▼
                          Local Storage
```

## Future Architecture Considerations

### Potential Enhancements

1. **Machine Learning Integration**
   - TensorFlow.js for local ML
   - Train on phishing patterns
   - Still local-only

2. **Reputation API Integration**
   - Optional external API lookup
   - Privacy-preserving (hash URLs)
   - Opt-in only

3. **Automated Testing**
   - Jest for unit tests
   - Puppeteer for integration tests
   - CI/CD pipeline

4. **Internationalization**
   - chrome.i18n API
   - Multiple language support
   - Locale-specific detection

5. **Advanced Analytics**
   - Local-only analytics
   - Pattern detection
   - False positive tracking

### Scalability Considerations

Current architecture scales well because:
- Event-driven (no constant processing)
- Local-only (no server bottleneck)
- Efficient algorithms (optimized heuristics)
- Storage limits (auto-pruning)

Potential limits:
- Chrome extension storage (5MB)
- Service worker memory (handled by Chrome)
- Levenshtein with very long domains (rare)

## Conclusion

The extension's architecture prioritizes:

1. **Privacy** - Local-only operation
2. **Security** - Multiple defense layers
3. **Performance** - Optimized algorithms
4. **Reliability** - Comprehensive error handling
5. **Maintainability** - Clear separation of concerns

This architecture achieves effective phishing protection while respecting user privacy and maintaining excellent performance.

---

**Version:** 1.0.1
**Last Updated:** 2025-11-14
**Author:** RTPDBE Contributors

# Testing Guide for Real-Time Phishing Detection Extension

This document provides comprehensive testing procedures and test cases for the phishing detection extension.

## Table of Contents

1. [Setup for Testing](#setup-for-testing)
2. [Unit Test Cases](#unit-test-cases)
3. [Integration Tests](#integration-tests)
4. [Edge Cases](#edge-cases)
5. [Performance Testing](#performance-testing)
6. [Security Testing](#security-testing)
7. [Browser Compatibility](#browser-compatibility)

## Setup for Testing

### Prerequisites

1. Install the extension in developer mode
2. Open browser console (F12) to view logs
3. Ensure all extension permissions are granted

### Enable Logging

The extension uses console logging with prefix `[Phishing Detection]`. Filter console by this prefix to see extension logs.

## Unit Test Cases

### 1. URL Analysis Tests

#### Test Case 1.1: IP Address Detection

**Test URLs:**
- `http://192.168.1.1/login.php`
- `http://10.0.0.1/paypal-verify`
- `http://[2001:0db8:85a3:0000:0000:8a2e:0370:7334]/`

**Expected Result:**
- ✅ Should be flagged as suspicious
- ✅ Reason: "Uses IP address instead of domain name"
- ✅ Suspicion score: ≥40

#### Test Case 1.2: Suspicious TLD Detection

**Test URLs:**
- `http://example.tk`
- `http://bank-verify.ml`
- `http://secure-login.xyz`

**Expected Result:**
- ✅ Should be flagged with TLD warning
- ✅ Reason: "Uses suspicious top-level domain"
- ✅ Suspicion score increase: +30

#### Test Case 1.3: Lookalike Domain Detection

**Test URLs:**
- `http://paypa1.com` (with number 1 instead of 'l')
- `http://goog1e.com`
- `http://paypal.com.phishing.com`

**Expected Result:**
- ✅ Should detect typosquatting/suspicious domain usage
- ✅ High suspicion score (≥60)
- ✅ Clear reason explaining the similarity

#### Test Case 1.4: Excessive Subdomains

**Test URLs:**
- `http://secure.login.verify.account.paypal.example.com`
- `http://a.b.c.d.e.com`

**Expected Result:**
- ✅ Flagged for excessive subdomains
- ✅ Reason includes subdomain count
- ✅ Suspicion score increase: +20

#### Test Case 1.5: URL Obfuscation

**Test URLs:**
- `http://google.com@phishing.com`
- `http://verylongurl...` (>200 characters)

**Expected Result:**
- ✅ @ symbol detection: +50 score
- ✅ Long URL detection: +25 score

#### Test Case 1.6: Phishing Keywords

**Test URLs:**
- `http://example.com/verify-account-urgent`
- `http://bank-suspend-confirm.com`

**Expected Result:**
- ✅ Multiple keyword detection (≥2 keywords)
- ✅ Score increase: keywords × 10

### 2. Content Analysis Tests

#### Test Case 2.1: Non-HTTPS Password Field

**Test Procedure:**
1. Create test HTML page:
```html
<!DOCTYPE html>
<html>
<body>
  <form>
    <input type="password" name="pwd">
    <button type="submit">Submit</button>
  </form>
</body>
</html>
```
2. Serve over HTTP (not HTTPS)
3. Load page

**Expected Result:**
- ✅ Warning banner appears
- ✅ Message: "Password field on non-HTTPS page"
- ✅ Suspicion score: +60

#### Test Case 2.2: External Form Action

**Test HTML:**
```html
<form action="http://external-domain.com/process" method="POST">
  <input type="text" name="data">
  <button type="submit">Submit</button>
</form>
```

**Expected Result:**
- ✅ Flagged as suspicious form action
- ✅ User warned on submission
- ✅ Can cancel submission

#### Test Case 2.3: Hidden Iframes

**Test HTML:**
```html
<iframe src="http://tracking.com" style="display:none;"></iframe>
<iframe src="http://evil.com" width="0" height="0"></iframe>
```

**Expected Result:**
- ✅ Detected as hidden iframes
- ✅ Warning displayed
- ✅ Suspicion score: +50

#### Test Case 2.4: High External Link Ratio

**Test HTML:**
```html
<!-- 70%+ links to external domains -->
<a href="http://external1.com">Link 1</a>
<a href="http://external2.com">Link 2</a>
<a href="http://external3.com">Link 3</a>
<a href="http://current-domain.com">Link 4</a>
```

**Expected Result:**
- ✅ High external link ratio detected
- ✅ Percentage shown in warning
- ✅ Suspicion score: +30

### 3. Whitelist Tests

#### Test Case 3.1: Add to Whitelist

**Procedure:**
1. Navigate to a flagged site
2. Click "Proceed Anyway"
3. Confirm warning
4. Navigate to same site again

**Expected Result:**
- ✅ Site added to whitelist
- ✅ Second visit: no warning
- ✅ Visible in extension popup

#### Test Case 3.2: Subdomain Whitelisting

**Procedure:**
1. Whitelist `example.com`
2. Visit `sub.example.com`

**Expected Result:**
- ✅ Subdomain also whitelisted
- ✅ No warning for subdomain

#### Test Case 3.3: Manual Whitelist

**Procedure:**
1. Open popup
2. Navigate to a site
3. Click "Whitelist Current Site"

**Expected Result:**
- ✅ Confirmation message
- ✅ Site added to whitelist
- ✅ Persists across sessions

### 4. Statistics Tests

#### Test Case 4.1: Counter Increment

**Procedure:**
1. Note current statistics
2. Navigate to several websites
3. Check statistics

**Expected Result:**
- ✅ "Sites Checked" increases for each navigation
- ✅ "Threats Blocked" increases only for flagged sites
- ✅ Counts persist across popup open/close

#### Test Case 4.2: Clear History

**Procedure:**
1. Block some sites
2. Open popup
3. Click "Clear History"
4. Confirm

**Expected Result:**
- ✅ All counters reset to 0
- ✅ Blocked sites list empty
- ✅ Whitelist unchanged

### 5. UI/UX Tests

#### Test Case 5.1: Protection Toggle

**Procedure:**
1. Open popup
2. Click protection toggle OFF
3. Navigate to suspicious site
4. Turn protection back ON

**Expected Result:**
- ✅ Toggle visually changes
- ✅ Badge shows "OFF"
- ✅ No blocking when OFF
- ✅ Blocking resumes when ON

#### Test Case 5.2: Warning Banner

**Procedure:**
1. Load page with suspicious content
2. Observe warning banner

**Expected Result:**
- ✅ Banner appears at top
- ✅ Content pushed down (not hidden)
- ✅ Dismiss button works
- ✅ Padding restored on dismiss

#### Test Case 5.3: Warning Page

**Procedure:**
1. Navigate to blocked site

**Expected Result:**
- ✅ Warning page displayed
- ✅ URL shown correctly
- ✅ Score displayed
- ✅ Reasons listed
- ✅ All buttons functional

## Integration Tests

### Test Case I.1: Background ↔ Content Script

**Procedure:**
1. Load page with suspicious content
2. Check console for both scripts

**Expected Result:**
- ✅ Content script sends analysis
- ✅ Background receives and responds
- ✅ No message errors

### Test Case I.2: Background ↔ Popup

**Procedure:**
1. Open popup
2. Check URL analysis
3. Toggle settings

**Expected Result:**
- ✅ Popup gets current state
- ✅ Settings save to background
- ✅ Badge updates

### Test Case I.3: Navigation Flow

**Procedure:**
1. Click link to suspicious site
2. Observe full flow

**Expected Result:**
- ✅ Navigation intercepted
- ✅ URL analyzed
- ✅ Stats updated
- ✅ Redirected to warning page

## Edge Cases

### Edge Case 1: Very Fast Navigation

**Procedure:**
1. Rapidly click between multiple sites

**Expected Result:**
- ✅ No duplicate checks (debouncing works)
- ✅ No race conditions
- ✅ Correct final state

### Edge Case 2: Invalid URLs

**Test URLs:**
- `javascript:alert('test')`
- `data:text/html,<script>alert('test')</script>`
- `not-a-url`

**Expected Result:**
- ✅ No crashes
- ✅ Proper error handling
- ✅ Logged errors visible

### Edge Case 3: Extension Update

**Procedure:**
1. Use extension
2. Update to new version
3. Check state

**Expected Result:**
- ✅ Settings preserved
- ✅ Statistics preserved
- ✅ Whitelist preserved
- ✅ No errors

### Edge Case 4: Storage Full

**Procedure:**
1. Block 100+ sites (limit)
2. Block another site

**Expected Result:**
- ✅ Oldest entries removed
- ✅ Last 100 kept
- ✅ No storage errors

### Edge Case 5: Offline Usage

**Procedure:**
1. Disconnect internet
2. Navigate to cached sites

**Expected Result:**
- ✅ Analysis still works
- ✅ No network dependency
- ✅ All features functional

### Edge Case 6: Page Without Body

**Procedure:**
1. Navigate to bare HTML: `<html><head><title>Test</title></head></html>`

**Expected Result:**
- ✅ No crashes
- ✅ Observer doesn't start
- ✅ Error logged

### Edge Case 7: Dynamic Content Loading

**Procedure:**
1. Visit SPA (Single Page Application)
2. Navigate within app
3. Observe detection

**Expected Result:**
- ✅ Mutation observer detects changes
- ✅ Dynamically added forms detected
- ✅ Re-analysis triggered

### Edge Case 8: Unicode Domains (IDN)

**Test URLs:**
- `http://раура1.com` (Cyrillic)
- `http://аррӏе.com` (Homograph)

**Expected Result:**
- ✅ Non-ASCII characters detected
- ✅ Flagged as homograph attack
- ✅ High suspicion score (+50)

## Performance Testing

### Performance Test 1: Page Load Impact

**Procedure:**
1. Measure page load time without extension
2. Enable extension
3. Measure page load time again
4. Compare

**Expected Result:**
- ✅ Impact < 100ms for typical pages
- ✅ No visible delay
- ✅ No blocking of page render

### Performance Test 2: Memory Usage

**Procedure:**
1. Check extension memory in task manager
2. Navigate to 20+ sites
3. Check memory again

**Expected Result:**
- ✅ Memory stable
- ✅ No memory leaks
- ✅ Debounce map cleanup works

### Performance Test 3: Multiple Tabs

**Procedure:**
1. Open 10+ tabs with extension
2. Navigate in each tab
3. Monitor performance

**Expected Result:**
- ✅ All tabs function correctly
- ✅ No slowdown
- ✅ Independent analysis per tab

## Security Testing

### Security Test 1: XSS Prevention

**Test Data:**
- Domain: `<script>alert('xss')</script>.com`
- Reason: `<img src=x onerror=alert('xss')>`

**Expected Result:**
- ✅ No script execution
- ✅ Content properly escaped
- ✅ Displayed as text only

### Security Test 2: Storage Injection

**Procedure:**
1. Try to inject malicious data into storage
2. Reload extension

**Expected Result:**
- ✅ Validation prevents injection
- ✅ Extension remains functional
- ✅ No security errors

### Security Test 3: Message Validation

**Procedure:**
1. Send invalid messages to background script

**Expected Result:**
- ✅ Unknown actions handled gracefully
- ✅ Error returned
- ✅ No crashes

## Browser Compatibility

### Chrome/Chromium-based Browsers

**Test in:**
- Chrome (latest)
- Microsoft Edge
- Brave Browser
- Vivaldi

**Expected Result:**
- ✅ Full functionality
- ✅ No console errors
- ✅ All features work

### Firefox

**Known Limitations:**
- Manifest V3 support varies by version
- Some APIs may behave differently

**Expected Result:**
- ✅ Core functionality works
- ✅ Warning displayed
- ✅ Settings persist

## Automated Test Ideas

For future development, consider implementing:

1. **Jest Unit Tests** for pure functions:
   - `levenshteinDistance()`
   - `checkSuspiciousURL()`
   - `extractDomain()`

2. **Puppeteer/Selenium Tests** for integration:
   - Navigation flows
   - Form submission blocking
   - Warning page display

3. **Performance Monitoring**:
   - Page load timing
   - Memory profiling
   - CPU usage tracking

## Reporting Issues

When reporting bugs, include:

1. Browser version
2. Extension version
3. Steps to reproduce
4. Expected vs actual behavior
5. Console logs (with `[Phishing Detection]` filter)
6. Screenshots if applicable

## Test Checklist

Before each release, verify:

- [ ] All unit tests pass
- [ ] Integration tests pass
- [ ] Edge cases handled
- [ ] No console errors on clean install
- [ ] Performance acceptable
- [ ] Security tests pass
- [ ] Works in target browsers
- [ ] Documentation updated

---

**Last Updated:** Version 1.0.1
**Tested By:** Development Team
**Test Date:** 2025-11-14

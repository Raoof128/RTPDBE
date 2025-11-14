# Privacy Policy

**Last Updated:** November 14, 2025
**Effective Date:** November 14, 2025
**Version:** 1.0.1

## Introduction

Your privacy is critically important to us. This Privacy Policy explains how the Real-Time Phishing Detection Browser Extension ("the Extension", "we", "our") handles your data.

**Key Points:**
- ✅ **No data collection** - We don't collect any personal information
- ✅ **Local operation only** - All processing happens on your device
- ✅ **No external servers** - We don't send data anywhere
- ✅ **No tracking** - We don't track your browsing activity
- ✅ **Open source** - You can verify our claims by reviewing the code

## What Data We Access

### Data We Access (But Never Collect)

The Extension requires access to certain data to function, but **this data never leaves your device**:

#### 1. Browsing URLs
- **What:** URLs of websites you visit
- **Why:** To analyze them for phishing indicators
- **Where:** Analyzed locally on your device
- **Stored:** Never transmitted, only temporarily analyzed

#### 2. Page Content
- **What:** HTML content of pages you visit
- **Why:** To detect suspicious forms, iframes, and links
- **Where:** Analyzed in the browser
- **Stored:** Not stored or transmitted

#### 3. Form Data (Metadata Only)
- **What:** Presence of password fields, form actions, form structure
- **Why:** To detect phishing attempts
- **Where:** Analyzed locally
- **Stored:** Never stored or transmitted
- **Note:** We never see or store the actual data you enter in forms

## What Data We Store Locally

The Extension stores minimal data in your browser's local storage:

### 1. Settings
```json
{
  "enabled": true/false
}
```
- **Purpose:** Remember if protection is enabled or disabled
- **Location:** Browser local storage
- **Retention:** Until manually cleared or extension uninstalled

### 2. Statistics
```json
{
  "totalChecks": 123,
  "threatsBlocked": 5,
  "lastUpdate": 1234567890
}
```
- **Purpose:** Display usage statistics in the popup
- **Location:** Browser local storage
- **Contains:** No personal information, just counts
- **Retention:** Until manually cleared

### 3. Blocked Sites History
```json
[
  {
    "url": "http://suspicious-site.com",
    "domain": "suspicious-site.com",
    "reasons": ["Uses IP address"],
    "score": 60,
    "timestamp": 1234567890
  }
]
```
- **Purpose:** Show recently blocked sites
- **Location:** Browser local storage
- **Retention:** Last 100 entries, can be cleared anytime
- **Contents:** URLs of blocked sites only (no personal data)

### 4. Whitelist
```json
[
  "trusted-site.com",
  "another-safe-site.com"
]
```
- **Purpose:** Remember sites you've marked as safe
- **Location:** Browser local storage
- **Retention:** Until manually removed
- **Contents:** Domain names only

## What We DO NOT Do

### We DO NOT:

- ❌ **Collect personal information** - No names, emails, addresses, etc.
- ❌ **Track browsing history** - We don't store your browsing history
- ❌ **Send data to servers** - Everything stays on your device
- ❌ **Use analytics** - No Google Analytics, no tracking pixels
- ❌ **Share data with third parties** - There's no data to share
- ❌ **Sell your data** - We don't have any data to sell
- ❌ **Use cookies** - No cookies or tracking mechanisms
- ❌ **Access form inputs** - We detect forms but don't read what you type
- ❌ **Store passwords** - Never, ever
- ❌ **Access your bookmarks** - We don't need or request this permission
- ❌ **Access your downloads** - We don't monitor downloads
- ❌ **Use fingerprinting** - No device fingerprinting

## How We Protect Your Privacy

### 1. Local-Only Operation
All phishing detection algorithms run entirely in your browser. No URLs, page content, or any other data is sent to external servers.

### 2. Minimal Permissions
We only request the permissions absolutely necessary:
- `tabs` - To check URLs of tabs you navigate to
- `storage` - To store settings locally
- `webNavigation` - To intercept navigation to suspicious sites
- `alarms` - For periodic maintenance tasks
- `<all_urls>` - To protect you on all websites

We **do not** request:
- `history` - Don't need your browsing history
- `cookies` - Don't need cookie access
- `downloads` - Don't monitor downloads
- `bookmarks` - Don't need bookmark access

### 3. No Network Requests
The Extension makes **zero network requests**. You can verify this by:
- Checking the Network tab in browser DevTools
- Reviewing the source code (it's open source)
- Using a network monitor

### 4. Open Source Transparency
Our code is fully open source on GitHub. Anyone can:
- Review the code to verify our privacy claims
- Audit security practices
- Suggest improvements
- Fork and modify

### 5. Content Security Policy
We enforce a strict Content Security Policy that prevents:
- Loading external scripts
- Making external network requests
- Using inline scripts or eval()

## Permissions Explained

### Why We Need Each Permission

| Permission | Why We Need It | What We Don't Do With It |
|------------|----------------|-------------------------|
| `tabs` | Check URLs of pages you visit for phishing | We don't track which sites you visit or how long you spend on them |
| `storage` | Save your settings and whitelist locally | We don't sync data to any server |
| `webNavigation` | Block navigation to dangerous sites | We don't log your browsing history |
| `alarms` | Periodic cleanup of old data | We don't use it for tracking |
| `<all_urls>` | Protect you on any website | We only analyze URLs when you navigate, don't monitor content |

## Data Retention

### How Long We Keep Data

| Data Type | Retention Period | How to Delete |
|-----------|------------------|---------------|
| Settings | Until extension uninstalled | Clear browser extension data |
| Statistics | Until manually cleared | Click "Clear History" in popup |
| Blocked Sites | Last 100 entries only | Click "Clear History" in popup |
| Whitelist | Until manually removed | Remove sites individually or clear all data |

### How to Delete All Data

**Option 1: Clear Extension Data**
1. Open the extension popup
2. Click "Clear History"
3. Confirm

**Option 2: Uninstall Extension**
1. Go to browser extensions page
2. Remove the extension
3. All data is automatically deleted

**Option 3: Clear Browser Data**
1. Go to browser settings
2. Clear browsing data
3. Select "Site settings" or "Extension data"

## Third-Party Services

**We do not use any third-party services.**

No analytics, no crash reporting, no ad networks, no external APIs.

## Children's Privacy

The Extension does not knowingly collect data from anyone, including children under 13. Since we don't collect any data at all, the Extension is safe for all ages.

## International Users

Since all data is processed and stored locally on your device, there are no international data transfers. Your data never leaves your device, regardless of your location.

## Changes to This Privacy Policy

We may update this Privacy Policy from time to time. When we do:

1. We'll update the "Last Updated" date at the top
2. We'll document changes in CHANGELOG.md
3. Significant changes will be announced in release notes

**How You'll Know:**
- Check the extension's version number
- Review CHANGELOG.md in the GitHub repository
- Read release notes when updating

## California Privacy Rights (CCPA)

If you're a California resident, you have rights under CCPA. However, since we don't collect any personal information:

- **Right to Know:** There's no data to disclose
- **Right to Delete:** No data to delete (besides local storage you control)
- **Right to Opt-Out of Sale:** We don't sell any data

## European Privacy Rights (GDPR)

If you're in the EU, you have rights under GDPR. Since we don't collect or process personal data:

- **Right to Access:** No personal data collected
- **Right to Rectification:** No data to correct
- **Right to Erasure:** You can clear local data anytime
- **Right to Data Portability:** Export settings via browser tools
- **Right to Object:** You can uninstall anytime

**Legal Basis:** We don't process personal data, so no legal basis is required under GDPR.

## Security

While we don't collect data, we take security seriously:

### Security Measures

1. **XSS Prevention** - All user inputs are sanitized
2. **Content Security Policy** - Prevents code injection
3. **Input Validation** - All data is validated
4. **Error Handling** - Comprehensive error handling prevents data leaks
5. **Regular Audits** - Code is regularly reviewed for vulnerabilities

See [SECURITY.md](SECURITY.md) for our security policy.

## Your Rights and Choices

### You Can:

- ✅ **Disable the Extension** - Turn off protection anytime
- ✅ **Whitelist Sites** - Mark sites as safe
- ✅ **Clear Data** - Delete local data anytime
- ✅ **Uninstall** - Remove completely with no trace
- ✅ **Review Code** - Inspect source code on GitHub
- ✅ **Fork and Modify** - Create your own version

### You Don't Need To:

- ❌ **Create an account** - No account required
- ❌ **Provide personal info** - No personal info collected
- ❌ **Opt out of tracking** - No tracking to opt out of
- ❌ **Accept cookies** - No cookies used
- ❌ **Read complex privacy policies** - It's simple: we don't collect data

## Technical Details

### Data Flow Diagram

```
You Visit Website
       ↓
Extension Analyzes URL (Locally)
       ↓
       ├─→ Safe: Allow navigation
       └─→ Suspicious: Show warning
              ↓
              ├─→ Go Back: Safe
              └─→ Proceed Anyway: Add to whitelist (locally)
```

**Note:** At no point does data leave your device.

### Storage Location

All data is stored in:
```
Browser Local Storage → Your Device Only
```

Not in cloud, not on servers, just your device.

## Verification

### How to Verify Our Claims

1. **Check Network Activity:**
   - Open DevTools → Network tab
   - Use the extension
   - Observe: No network requests

2. **Review Source Code:**
   - Visit: https://github.com/Raoof128/RTPDBE
   - Search for: "fetch", "XMLHttpRequest", "axios"
   - Result: No network code found

3. **Inspect Storage:**
   - Open DevTools → Application → Storage
   - Check: Only local settings stored

4. **Monitor Permissions:**
   - Check extension permissions
   - Confirm: Only essential permissions

## Contact

### Questions About Privacy?

- **GitHub Issues:** [Create an issue](https://github.com/Raoof128/RTPDBE/issues) with label "privacy"
- **Email:** See repository for contact information
- **Security Issues:** See [SECURITY.md](SECURITY.md)

### Request Data (Spoiler: There Is None)

If you want to know what data we have about you, the answer is simple: **None**.

You can verify this by checking your browser's local storage for the extension.

## Transparency Report

We're committed to transparency. Here's what we've never done:

| Action | Count |
|--------|-------|
| Data collected | 0 |
| Data shared with third parties | 0 |
| Government data requests received | 0 |
| User data sold | 0 |
| Tracking cookies placed | 0 |
| Analytics events sent | 0 |

## Summary (TL;DR)

**In Plain English:**

This extension:
- ✅ Works entirely on your device
- ✅ Doesn't send any data anywhere
- ✅ Doesn't track you
- ✅ Doesn't collect personal information
- ✅ Can be verified (it's open source)

**That's it. Simple as that.**

---

## Legal

This Privacy Policy is effective as of the date stated at the top and will remain in effect except with respect to any changes in its provisions in the future, which will be in effect immediately after being posted on this page.

We reserve the right to update or change our Privacy Policy at any time and you should check this Privacy Policy periodically.

---

**Questions? Concerns? Found a privacy issue?**

Please let us know by:
- Creating an issue on GitHub
- Reviewing our [SECURITY.md](SECURITY.md) for security concerns

---

**Last Updated:** November 14, 2025

Your privacy is important. We're committed to protecting it by simply not collecting data in the first place. 🛡️

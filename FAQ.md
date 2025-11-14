# Frequently Asked Questions (FAQ)

Common questions and answers about the Real-Time Phishing Detection Extension.

## Table of Contents

- [General Questions](#general-questions)
- [Installation & Setup](#installation--setup)
- [Features & Functionality](#features--functionality)
- [Privacy & Security](#privacy--security)
- [Troubleshooting](#troubleshooting)
- [Advanced Usage](#advanced-usage)
- [Contributing](#contributing)

---

## General Questions

### What is this extension?

A browser extension that provides real-time protection against phishing websites using advanced heuristic analysis. It analyzes URLs and page content to detect phishing attempts before they can harm you.

### Is it really free?

Yes! The extension is completely free and open source under the MIT License. No subscriptions, no hidden costs, no premium features locked behind paywalls.

### Which browsers are supported?

- ✅ Chrome (and Chromium-based browsers)
- ✅ Microsoft Edge
- ✅ Brave Browser
- ✅ Vivaldi
- ✅ Firefox (with limitations)

### How does it differ from built-in browser protection?

| Feature | This Extension | Browser Built-in |
|---------|---------------|------------------|
| Detection Methods | 12+ heuristics | Database lookup |
| Privacy | 100% local | May phone home |
| Customization | Full control | Limited |
| False Positive Handling | Easy whitelist | Harder to override |
| Open Source | Yes | No |

---

## Installation & Setup

### How do I install it?

See our [INSTALL.md](INSTALL.md) guide for detailed instructions. Quick version:

1. Clone/download the repository
2. Open `chrome://extensions/`
3. Enable Developer mode
4. Click "Load unpacked"
5. Select the RTPDBE folder

### Do I need to configure anything after installation?

No! The extension works out of the box with sensible defaults. However, you can:
- Toggle protection on/off
- Manage whitelisted sites
- Clear history

### Why do I need to generate icons?

The repository includes an SVG icon that needs to be converted to PNG format for browsers. You can:
- Run `node generate-icons.js` (requires Node.js)
- Open `icons/generate-icons.html` in your browser
- The generated PNGs are already included if you cloned recently

### Can I use this on multiple devices?

Yes! Install it on each device. Note that settings don't sync between devices (privacy feature - no cloud storage).

---

## Features & Functionality

### How does phishing detection work?

The extension uses multiple detection methods:

1. **URL Analysis** (12+ heuristics)
   - IP addresses, suspicious TLDs, typosquatting, etc.

2. **Content Analysis**
   - Password fields on HTTP, external form actions, hidden iframes

3. **Behavioral Monitoring**
   - Form submissions, dynamic content changes

Each check adds to a suspicion score. If the score ≥ 50/100, the site is blocked.

### What happens when a phishing site is detected?

1. Navigation is immediately blocked
2. You're redirected to a warning page
3. The warning shows:
   - The blocked URL
   - Suspicion score (0-100)
   - Specific reasons for blocking
4. You can choose to:
   - Go back to safety
   - Report a false positive
   - Proceed anyway (not recommended)

### What are false positives?

A false positive occurs when a legitimate site is incorrectly flagged as phishing. If this happens:

1. Click "Report False Positive" on the warning page
2. OR add the site to your whitelist
3. OR report it on [GitHub](https://github.com/Raoof128/RTPDBE/issues/new?template=false_positive.md)

### How do I whitelist a site?

**Method 1:** Via Warning Page
- When blocked, click "Proceed Anyway"
- Confirm the final warning
- Site is automatically whitelisted

**Method 2:** Via Popup
- Click the extension icon
- Click "Whitelist Current Site"
- Confirm

**Method 3:** Manual
- Open the popup
- View current whitelisted sites in settings

### Can I see why a site was blocked?

Yes! The warning page shows:
- **Suspicion Score** (e.g., 65/100)
- **Specific Reasons** (e.g., "Uses IP address", "Contains phishing keywords")
- **Time** of detection

### Does it slow down my browsing?

No. Performance impact:
- **Page Load:** <100ms typically
- **Memory:** ~10-15MB
- **CPU:** Minimal (event-driven)

Most users won't notice any slowdown.

### Does it work on all websites?

Yes, except:
- `chrome://` internal pages (browser restriction)
- `chrome-extension://` other extensions
- `about:` pages

These are skipped automatically.

### Can I use it alongside other security extensions?

Yes! This extension is compatible with:
- Ad blockers (uBlock Origin, AdBlock)
- Password managers (LastPass, 1Password)
- VPNs
- Other security tools

---

## Privacy & Security

### Does the extension collect my data?

**NO.** We collect **zero data**. Everything operates locally on your device.

What we **DON'T** do:
- ❌ Track browsing history
- ❌ Collect URLs
- ❌ Send data to servers
- ❌ Use analytics
- ❌ Place cookies

See our [Privacy Policy](PRIVACY.md) for full details.

### How can I verify this?

1. **Check Network Activity**
   - Open DevTools → Network tab
   - Use the extension
   - Observe: Zero network requests

2. **Review Source Code**
   - It's open source on GitHub
   - Search for network code
   - You won't find any

3. **Inspect Storage**
   - DevTools → Application → Storage
   - See only local settings

### Is my browsing history sent anywhere?

**No.** URLs are analyzed locally and immediately discarded. Nothing is stored except:
- Last 100 blocked sites (locally, for your reference)
- Your whitelist (locally)
- Statistics counts (locally)

### What permissions does it need and why?

| Permission | Purpose | What We Don't Do |
|------------|---------|------------------|
| `tabs` | Check URLs | Don't track which sites you visit |
| `storage` | Save settings | Don't sync to cloud |
| `webNavigation` | Block threats | Don't log history |
| `<all_urls>` | Protect everywhere | Only check when navigating |

### How secure is the extension itself?

We follow security best practices:
- ✅ XSS prevention (all inputs sanitized)
- ✅ Content Security Policy (strict CSP)
- ✅ No eval() or dynamic code
- ✅ Input validation everywhere
- ✅ Comprehensive error handling

Security audits welcome! See [SECURITY.md](SECURITY.md).

### Can this extension steal my passwords?

**No.** The extension:
- Doesn't read password input values
- Only detects presence of password fields
- Never accesses what you type
- Cannot read clipboard

### What if the extension has a vulnerability?

Report it responsibly:
1. **DON'T** create public issues
2. **DO** follow our [Security Policy](SECURITY.md)
3. We'll respond within 48 hours
4. We'll credit you in the fix

---

## Troubleshooting

### The extension isn't working

**Checklist:**
- [ ] Extension enabled? (check popup)
- [ ] Protection toggle ON?
- [ ] Browser supports Manifest V3?
- [ ] Icons generated? (see console for errors)
- [ ] Try reloading the extension

**Console Check:**
1. Open DevTools (F12)
2. Console tab
3. Filter by `[Phishing Detection]`
4. Check for errors

### A legitimate site is being blocked (false positive)

**Quick Fix:**
- Whitelist the site (see "How do I whitelist a site?" above)

**Long-term Fix:**
- Report it: [False Positive Template](https://github.com/Raoof128/RTPDBE/issues/new?template=false_positive.md)
- We'll adjust detection rules

### The extension isn't blocking a known phishing site (false negative)

Please report it:
1. Go to [GitHub Issues](https://github.com/Raoof128/RTPDBE/issues)
2. Provide the URL (if safe to share)
3. Describe why it's phishing
4. We'll improve detection

### Icons aren't showing

**Problem:** Extension icon appears as puzzle piece

**Solutions:**
1. Generate icons: `node generate-icons.js`
2. OR open `icons/generate-icons.html`
3. Reload extension
4. Icons should appear

### Stats aren't updating

**Problem:** "Sites Checked" counter stuck

**Solutions:**
- Is protection enabled?
- Try navigating to a new site
- Click extension icon to refresh
- Reload extension if still stuck

### Whitelist isn't working

**Problem:** Whitelisted site still blocked

**Possible causes:**
1. Wrong domain format (use just `example.com`, not full URL)
2. Subdomain not matching (whitelist parent domain)
3. Extension reloaded (whitelist cleared - this shouldn't happen)

**Fix:**
- Re-add to whitelist
- Check spelling
- Open console for errors

### Extension slowing down browser

**Unlikely but possible:**

1. Check memory usage (Task Manager)
2. Clear blocked sites history (popup → Clear History)
3. Restart browser
4. Report performance issue on GitHub

### Popup won't open

**Solutions:**
- Right-click extension icon → Inspect Popup
- Check console for errors
- Reload extension
- Restart browser

---

## Advanced Usage

### Can I customize detection thresholds?

Yes! Edit `background.js`:

```javascript
const CONFIG = {
  SUSPICION_THRESHOLD: 50,  // Change this (0-100)
  // ...
};
```

Lower = more sensitive (more false positives)
Higher = less sensitive (might miss some threats)

### Can I add custom phishing keywords?

Yes! Edit `background.js`:

```javascript
const PHISHING_KEYWORDS = [
  'verify', 'account', // existing
  'your-custom-keyword',  // add here
];
```

### Can I disable specific detection rules?

Yes, comment out sections in `checkSuspiciousURL()` function in `background.js`.

Example:
```javascript
// Disable IP address detection
/* if (ipPattern.test(domain)) {
  reasons.push('Uses IP address');
  suspicionScore += 40;
} */
```

### Can I export my whitelist?

Currently manual:
1. Open DevTools (F12)
2. Console tab
3. Run: `chrome.storage.local.get(['whitelistedSites'], console.log)`
4. Copy the output

### Can I import a whitelist?

Currently manual:
1. Open DevTools Console
2. Run:
```javascript
chrome.storage.local.set({
  whitelistedSites: ['site1.com', 'site2.com', ...]
});
```

### Can I disable warnings for specific pages?

Use the whitelist feature. Unfortunately, page-specific (rather than domain-specific) whitelisting isn't currently supported.

---

## Contributing

### How can I contribute?

Many ways! See [CONTRIBUTING.md](CONTRIBUTING.md):
- Report bugs
- Suggest features
- Improve documentation
- Write code
- Add translations
- Create tests

### I found a bug. Where do I report it?

[GitHub Issues](https://github.com/Raoof128/RTPDBE/issues/new?template=bug_report.md) with the bug report template.

### I have a feature idea

[Feature Request Template](https://github.com/Raoof128/RTPDBE/issues/new?template=feature_request.md) - we'd love to hear it!

### Can I add new detection methods?

Yes! Fork the repository, add your detection method, and submit a pull request. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### How do I set up a development environment?

See [CONTRIBUTING.md](CONTRIBUTING.md) → Development Setup section.

### Do I need to know JavaScript?

For code contributions, yes. But you can contribute in other ways:
- Documentation
- Testing
- Translations
- Design
- Ideas

---

## Still Have Questions?

- 📖 **Read:** [Full Documentation](#documentation)
- 💬 **Discuss:** [GitHub Discussions](https://github.com/Raoof128/RTPDBE/discussions)
- 🐛 **Report:** [GitHub Issues](https://github.com/Raoof128/RTPDBE/issues)
- 📧 **Contact:** See repository for contact information

---

**Last Updated:** 2025-11-14
**Version:** 1.0.1

[⬆ Back to Top](#frequently-asked-questions-faq)

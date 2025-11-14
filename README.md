# Real-Time Phishing Detection Browser Extension

A powerful browser extension that provides real-time protection against phishing websites using advanced heuristic analysis and intelligent URL scanning.

## Features

### 🛡️ Real-Time Protection
- **Automatic URL Analysis**: Every website is automatically scanned before loading
- **Content Inspection**: Analyzes page content for suspicious patterns and phishing indicators
- **Instant Blocking**: Dangerous sites are blocked immediately with detailed warnings

### 🔍 Advanced Detection Algorithms

The extension uses multiple detection methods:

1. **URL-Based Detection**
   - IP address detection (phishing sites often use IPs instead of domains)
   - Suspicious TLD detection (.tk, .ml, .ga, etc.)
   - Homograph attack detection (lookalike Unicode characters)
   - Lookalike domain detection (similar to legitimate sites)
   - Excessive subdomain detection
   - Long URL and suspicious pattern detection
   - Keyword analysis for phishing-related terms

2. **Content-Based Detection**
   - Password fields on non-HTTPS pages
   - Suspicious form actions (submitting to external domains)
   - Hidden iframe detection
   - External link ratio analysis

3. **Behavioral Analysis**
   - Form submission monitoring
   - Dynamic content analysis
   - Real-time DOM monitoring

### 📊 User Interface

- **Popup Dashboard**: View statistics, blocked sites, and manage settings
- **Warning Page**: Detailed threat information when a phishing site is detected
- **Inline Warnings**: Visual alerts on suspicious pages
- **Site Status Indicator**: Real-time safety status of current website

## Installation

### Chrome/Edge/Brave

1. Download or clone this repository
   ```bash
   git clone https://github.com/Raoof128/RTPDBE.git
   cd RTPDBE
   ```

2. Convert SVG icons to PNG (required for Chrome):
   ```bash
   # Option 1: Use an online converter like cloudconvert.com
   # Upload icons/icon.svg and convert to 16x16, 48x48, and 128x128 PNG

   # Option 2: Use ImageMagick (if installed)
   convert icons/icon.svg -resize 16x16 icons/icon16.png
   convert icons/icon.svg -resize 48x48 icons/icon48.png
   convert icons/icon.svg -resize 128x128 icons/icon128.png
   ```

3. Open Chrome and navigate to `chrome://extensions/`

4. Enable "Developer mode" (toggle in top-right corner)

5. Click "Load unpacked"

6. Select the `RTPDBE` directory

7. The extension is now installed and active!

### Firefox

1. Download or clone this repository

2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`

3. Click "Load Temporary Add-on"

4. Select the `manifest.json` file from the RTPDBE directory

5. The extension is now installed (note: temporary installation)

For permanent Firefox installation, the extension needs to be signed by Mozilla.

## Usage

### Basic Usage

1. **Automatic Protection**: Once installed, the extension automatically protects you
2. **View Status**: Click the extension icon to see protection status and statistics
3. **Access Settings**: Use the popup to enable/disable protection and manage whitelists

### Managing Blocked Sites

- **View History**: Click the extension icon to see recently blocked sites
- **Clear History**: Use the "Clear History" button in the popup
- **Whitelist Sites**: If a site is incorrectly flagged, whitelist it using the popup

### Understanding Threat Scores

The extension assigns a suspicion score (0-100) to each website:

- **0-20**: Safe - No significant threats detected
- **21-49**: Caution - Some suspicious indicators present
- **50+**: Dangerous - High likelihood of phishing attempt

### Warning Page Actions

When a phishing site is blocked, you have three options:

1. **Go Back to Safety** (Recommended): Navigate away from the dangerous site
2. **Report False Positive**: Help improve detection accuracy
3. **Proceed Anyway** (Not Recommended): Continue to the site (adds to whitelist)

## Configuration

### Storage Structure

The extension stores data locally:

```javascript
{
  enabled: true/false,              // Protection status
  blockedSites: [],                 // List of blocked sites
  whitelistedSites: [],            // User-approved sites
  detectionStats: {
    totalChecks: 0,
    threatsBlocked: 0,
    lastUpdate: timestamp
  }
}
```

### Customization

You can modify detection sensitivity by adjusting thresholds in `background.js`:

```javascript
// Line ~45: Adjust suspicion score thresholds
if (suspicionScore >= 50) {  // Change 50 to make more/less sensitive
  // Block site
}
```

## Technical Details

### Architecture

```
┌─────────────────┐
│  Manifest v3    │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼──┐  ┌──▼─────┐
│ BG   │  │Content │
│Worker│◄─┤ Script │
└───┬──┘  └────────┘
    │
┌───▼────┐
│ Popup  │
│   UI   │
└────────┘
```

### Files

- `manifest.json`: Extension configuration
- `background.js`: Main detection logic and URL monitoring (service worker)
- `content.js`: Page content analysis and DOM monitoring
- `popup.html/js`: User interface
- `warning.html/js`: Blocking page displayed for phishing sites
- `icons/`: Extension icons

### Permissions

- `tabs`: Access tab information for URL checking
- `storage`: Store settings and blocked site history
- `webNavigation`: Monitor navigation events
- `webRequest`: Intercept and analyze web requests
- `alarms`: Periodic updates and cleanup
- `<all_urls>`: Access all websites for protection

## Security & Privacy

### Data Collection

This extension **does NOT**:
- Send your browsing data to external servers
- Track your activity
- Collect personal information
- Share data with third parties

### Local Operation

All analysis is performed locally on your device:
- URL checking happens in real-time without external API calls
- Detection algorithms run entirely in the browser
- All data is stored locally using Chrome storage API

### Open Source

This extension is open source. You can review the code to verify:
- No external network requests for tracking
- No data collection mechanisms
- Transparent detection algorithms

## Known Limitations

1. **False Positives**: Heuristic analysis may occasionally flag legitimate sites
   - Solution: Use the whitelist feature for trusted sites

2. **New Phishing Sites**: Zero-day phishing sites may not be detected immediately
   - The extension uses pattern matching, not a database

3. **Sophisticated Attacks**: Advanced phishing techniques may bypass detection
   - Always verify website legitimacy manually for sensitive operations

4. **Performance**: May add slight delay to page loads (typically <100ms)

## Best Practices

Even with this extension, follow these security practices:

1. ✅ **Verify URLs**: Always check the domain name before entering credentials
2. ✅ **Use HTTPS**: Look for the padlock icon in the address bar
3. ✅ **Check Emails**: Be cautious with unexpected emails asking for personal info
4. ✅ **Update Software**: Keep your browser and extensions up to date
5. ✅ **Two-Factor Auth**: Enable 2FA on important accounts
6. ✅ **Password Manager**: Use unique passwords for each site

## Development

### Building from Source

```bash
# Clone repository
git clone https://github.com/Raoof128/RTPDBE.git
cd RTPDBE

# Create icon files (requires ImageMagick)
convert icons/icon.svg -resize 16x16 icons/icon16.png
convert icons/icon.svg -resize 48x48 icons/icon48.png
convert icons/icon.svg -resize 128x128 icons/icon128.png

# Load in browser (see Installation section)
```

### Testing

Test the extension with known phishing examples:

```javascript
// In browser console on a test page:
chrome.runtime.sendMessage({
  action: 'checkURL',
  url: 'http://192.168.1.1/paypal-verify.php'
}, console.log);
```

### Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Troubleshooting

### Extension Not Working

1. **Check if enabled**: Click the extension icon and verify protection is ON
2. **Reload extension**: Go to `chrome://extensions` and click reload
3. **Check permissions**: Ensure all required permissions are granted
4. **Clear cache**: Clear extension storage and restart browser

### False Positives

If legitimate sites are blocked:

1. Click "Report False Positive" on the warning page
2. Add the site to your whitelist
3. File an issue on GitHub with the URL and reason

### Performance Issues

If the extension slows down browsing:

1. Clear blocked sites history
2. Reduce detection sensitivity in `background.js`
3. Disable and re-enable the extension

## License

MIT License - See LICENSE file for details

## Disclaimer

This extension provides additional security but is not a replacement for:
- Common sense and cautious browsing
- Antivirus software
- Regular security updates
- Secure password practices

The developers are not responsible for any damages resulting from:
- False negatives (missed phishing sites)
- False positives (blocked legitimate sites)
- Any security breaches while using this extension

## Support

- **Issues**: Report bugs on GitHub Issues
- **Questions**: Open a discussion on GitHub
- **Updates**: Watch the repository for updates

## Changelog

### Version 1.0.0 (2025-11-14)
- Initial release
- Real-time URL analysis
- Content-based detection
- Popup UI with statistics
- Warning page for blocked sites
- Whitelist management
- Local-only operation (no external API calls)

## Acknowledgments

- Inspired by common phishing detection techniques
- Built with modern web extension APIs (Manifest V3)
- Uses heuristic analysis for offline protection

---

**Stay safe online! 🛡️**

Made with ❤️ for a safer internet

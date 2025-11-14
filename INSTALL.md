# Installation Guide

## Quick Start

### Step 1: Generate Icons

Before installing the extension, you need to create the PNG icon files:

#### Option A: Using the HTML Generator (Easiest)

1. Open `icons/generate-icons.html` in your web browser
2. Click "Download All Icons"
3. Save the three PNG files (icon16.png, icon48.png, icon128.png) to the `icons/` folder

#### Option B: Using ImageMagick (Command Line)

If you have ImageMagick installed:

```bash
cd icons
convert icon.svg -resize 16x16 icon16.png
convert icon.svg -resize 48x48 icon48.png
convert icon.svg -resize 128x128 icon128.png
```

#### Option C: Using an Online Converter

1. Go to https://cloudconvert.com/svg-to-png
2. Upload `icons/icon.svg`
3. Convert to PNG at sizes: 16x16, 48x48, and 128x128
4. Download and save as icon16.png, icon48.png, icon128.png in the `icons/` folder

### Step 2: Install in Browser

#### Chrome / Edge / Brave

1. Open your browser and navigate to:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
   - Brave: `brave://extensions/`

2. Enable "Developer mode" using the toggle in the top-right corner

3. Click "Load unpacked"

4. Navigate to and select the `RTPDBE` folder

5. The extension icon should appear in your browser toolbar

6. Click the extension icon to verify it's working

#### Firefox

1. Navigate to `about:debugging#/runtime/this-firefox`

2. Click "Load Temporary Add-on"

3. Navigate to the `RTPDBE` folder and select `manifest.json`

4. The extension is now loaded (Note: This is temporary and will be removed when Firefox restarts)

For permanent installation in Firefox:
- The extension needs to be signed by Mozilla
- Submit to https://addons.mozilla.org for review and signing

### Step 3: Verify Installation

1. Click the extension icon in your browser toolbar
2. You should see the popup with:
   - Protection Status toggle (should be ON)
   - Statistics showing "0 Sites Checked" and "0 Threats Blocked"
   - Current site information

3. Test the extension:
   - Visit a website
   - The "Sites Checked" counter should increase
   - Try navigating to test URLs with suspicious patterns

## Troubleshooting

### Icons Not Showing

**Problem**: Extension icon appears as a puzzle piece or default icon

**Solution**:
1. Make sure you've generated the PNG icons (see Step 1)
2. Verify the files exist: `icons/icon16.png`, `icons/icon48.png`, `icons/icon128.png`
3. Reload the extension from the extensions page

### Extension Not Loading

**Problem**: Error when trying to load the extension

**Solutions**:
1. Check that you selected the correct folder (the one containing `manifest.json`)
2. Verify all required files exist:
   - manifest.json
   - background.js
   - content.js
   - popup.html
   - popup.js
   - warning.html
   - warning.js
   - icons/ folder with PNG files

### Permission Errors

**Problem**: Extension requests unexpected permissions

**Explanation**: The extension requires several permissions for protection:
- `tabs`: To monitor navigation and check URLs
- `storage`: To save settings and blocked site history
- `webNavigation`: To intercept navigation before pages load
- `webRequest`: To analyze requests
- `<all_urls>`: To protect you on all websites

All processing is done locally - no data is sent to external servers.

### Not Blocking Test Sites

**Problem**: Suspicious URLs aren't being blocked

**Solutions**:
1. Verify protection is enabled (check the toggle in popup)
2. Check if the site is whitelisted (clear whitelist if needed)
3. The site might not trigger the detection threshold
4. Try with more obviously suspicious URLs like: `http://192.168.1.1/paypal-login.php`

## Updating the Extension

### Manual Updates

1. Download/pull the latest code
2. Go to your browser's extensions page
3. Click the refresh/reload icon on the extension card
4. Verify the version number updated

### Keeping Data

Your settings and blocked sites history are preserved during updates.

To reset to defaults:
1. Click the extension icon
2. Click "Clear History"
3. Or disable and re-enable the extension

## Uninstallation

### Chrome / Edge / Brave

1. Go to the extensions page
2. Click "Remove" on the Phishing Detection extension
3. Confirm removal

All locally stored data will be deleted.

### Firefox

1. Go to `about:addons`
2. Find the extension
3. Click "Remove"
4. Confirm removal

## Advanced Configuration

### Changing Detection Sensitivity

Edit `background.js` and modify the threshold on line ~150:

```javascript
if (analysis.suspicious) {  // If suspicionScore >= 50
```

Change the threshold value in the `checkSuspiciousURL` function:

```javascript
return {
  suspicious: suspicionScore >= 50,  // Lower = more sensitive, Higher = less sensitive
  suspicionScore,
  reasons,
  domain
};
```

### Adding Custom Phishing Keywords

Edit `background.js` and add to the `PHISHING_KEYWORDS` array:

```javascript
const PHISHING_KEYWORDS = [
  'verify', 'account', 'suspend',
  'your-custom-keyword',  // Add here
  // ... rest of keywords
];
```

### Adding Legitimate Domains

Edit `background.js` and add to the `LEGITIMATE_DOMAINS` array:

```javascript
const LEGITIMATE_DOMAINS = [
  'google.com', 'facebook.com',
  'yourtrustedsite.com',  // Add here
  // ... rest of domains
];
```

After making changes, reload the extension from the browser's extensions page.

## Getting Help

- **Issues**: https://github.com/Raoof128/RTPDBE/issues
- **Discussions**: https://github.com/Raoof128/RTPDBE/discussions
- **Documentation**: See README.md

## Security Note

This extension:
- ✅ Operates entirely locally (no external servers)
- ✅ Does not collect or transmit your browsing data
- ✅ Does not track your activity
- ✅ Is open source (review the code yourself)

Your privacy and security are our top priorities.

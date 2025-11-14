# Changelog

All notable changes to the Real-Time Phishing Detection Browser Extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2025-11-14

### Added
- Comprehensive error handling throughout all modules
- Detailed JSDoc documentation for all functions
- Configuration constants object for easy tuning
- Extended list of suspicious TLDs and phishing keywords
- URL shortener detection (bit.ly, tinyurl.com, etc.)
- Support for IPv6 addresses in detection
- Detection for javascript: and data: URL schemes
- Storage change listener for badge updates
- Debouncing for navigation events to prevent duplicate checks
- Fallback mechanisms for all critical operations
- ARIA labels for accessibility
- Content Security Policy in manifest
- Comprehensive testing documentation (TESTING.md)
- This CHANGELOG.md file

### Changed
- **manifest.json**
  - Version bumped to 1.0.1
  - Removed unused `webRequest` permission
  - Added author and homepage_url metadata
  - Added Content Security Policy
  - Added default_title for action
  - Set all_frames to false for content scripts
  - Added module type for background service worker

- **background.js**
  - Complete rewrite with improved architecture
  - Fixed whitelist logic: now uses exact domain matching instead of partial includes
  - Fixed lookalike domain detection logic
  - Improved Levenshtein distance calculation (optimized)
  - Added proper default value handling for enabled state
  - Added comprehensive error handling with try-catch blocks
  - Added navigation debouncing to prevent duplicate checks
  - Added shouldSkipURL() function for internal URLs
  - Improved logging with consistent prefixes
  - Added detection for more edge cases (IPv6, data:, javascript: URLs)
  - Better storage handling with single reads where possible
  - Added automatic cleanup of old debounce entries

- **content.js**
  - Complete rewrite with improved structure
  - Added check for extension context invalidation
  - Fixed observer setup to handle missing document.body
  - Improved banner dismissal with proper padding restoration
  - Added debouncing for page re-analysis
  - Enhanced error handling throughout
  - Added chrome.runtime.lastError checks
  - Improved XSS prevention with proper HTML escaping
  - Better form submission monitoring
  - Added accessibility attributes to warning banner

- **popup.js**
  - Complete rewrite with improved structure
  - Added XSS prevention with escapeHTML() function
  - Fixed potential XSS vulnerability in displayBlockedSites()
  - Improved error handling for all async operations
  - Added chrome.runtime.lastError checks
  - Better validation of tab URLs
  - Improved time ago calculation with edge cases
  - Used textContent instead of innerHTML for user data
  - Added proper locale formatting for numbers
  - Better fallback handling for missing elements

- **warning.js**
  - Complete rewrite with improved validation
  - Added comprehensive URL validation
  - Improved parameter parsing with error handling
  - Added escapeHTML() function for XSS prevention
  - Better handling of missing parameters
  - Added fallback message for errors
  - Improved chrome.runtime.lastError checks
  - Better URL decoding with validation
  - Enhanced whitelist saving with error handling
  - Improved button handlers with error boundaries

### Fixed
- **Critical Fixes**
  - XSS vulnerability in popup blocked sites display
  - Race condition in navigation event handling
  - Memory leak in debounce map (now auto-cleans old entries)
  - Extension context invalidation errors in content script
  - Observer setup before document.body exists
  - Banner padding not restored on dismiss

- **Logic Fixes**
  - Whitelist matching now uses exact domain or subdomain matching
  - Lookalike domain detection no longer triggers false positives
  - Default enabled state now properly handled (defaults to true)
  - Form action URL parsing handles relative URLs correctly
  - Badge updates when settings change via storage listener

- **Error Handling Fixes**
  - All chrome.storage operations now check for errors
  - All chrome.tabs operations wrapped in try-catch
  - All chrome.runtime.sendMessage calls check lastError
  - URL parsing wrapped in try-catch throughout
  - JSON parsing with proper error handling
  - DOM operations check for element existence

### Security
- Added XSS prevention throughout all UI components
- Used textContent instead of innerHTML for user-provided data
- Added HTML escaping functions where innerHTML is necessary
- Improved input validation for all user inputs
- Added Content Security Policy to manifest
- Validated all URL parameters before use
- Sanitized all data before storage

### Performance
- Optimized Levenshtein distance calculation
- Added debouncing for navigation events (100ms)
- Reduced redundant storage reads
- Improved mutation observer efficiency
- Better memory management with map cleanup
- Optimized DOM operations

### Documentation
- Added comprehensive TESTING.md with test cases
- Added CHANGELOG.md (this file)
- Added JSDoc comments to all functions
- Improved code comments throughout
- Better error messages in console logs
- Added detailed inline documentation

## [1.0.0] - 2025-11-14

### Added
- Initial release
- Real-time URL analysis with multiple heuristics
- Content-based phishing detection
- Background service worker for navigation monitoring
- Content script for dynamic page analysis
- Warning page for blocked sites
- Popup UI with statistics and settings
- Whitelist functionality
- Local-only operation (no external API calls)
- IP address detection
- Suspicious TLD identification
- Homograph attack detection
- Lookalike domain detection
- Excessive subdomain detection
- Phishing keyword analysis
- Non-HTTPS password field detection
- Suspicious form action detection
- Hidden iframe detection
- Extension icons in multiple sizes
- Comprehensive README documentation
- Installation guide (INSTALL.md)
- MIT License
- Icon generator utilities

---

## Version Numbering

- **MAJOR** version when you make incompatible API changes
- **MINOR** version when you add functionality in a backward compatible manner
- **PATCH** version when you make backward compatible bug fixes

## Links

- [GitHub Repository](https://github.com/Raoof128/RTPDBE)
- [Issue Tracker](https://github.com/Raoof128/RTPDBE/issues)
- [Documentation](https://github.com/Raoof128/RTPDBE/blob/main/README.md)

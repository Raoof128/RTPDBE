/**
 * Content Script for Real-Time Page Analysis
 * Analyzes page content for phishing indicators and displays warnings
 */

(function() {
  'use strict';

  // Avoid running multiple times
  if (window.phishingDetectorInjected) {
    console.log('[Phishing Detection] Content script already injected');
    return;
  }
  window.phishingDetectorInjected = true;

  // Skip execution on extension pages and internal URLs
  if (window.location.protocol === 'chrome-extension:' ||
      window.location.protocol === 'chrome:' ||
      window.location.protocol === 'about:') {
    return;
  }

  // Debounce timer for page analysis
  let analyzePageTimer = null;

  /**
   * Analyze current page for phishing indicators
   */
  function analyzePage() {
    try {
      // Check if document and body exist
      if (!document || !document.body) {
        console.warn('[Phishing Detection] Document body not available');
        return;
      }

      const isHTTPS = window.location.protocol === 'https:';
      const currentDomain = window.location.hostname;

      // Check for password fields
      const passwordFields = document.querySelectorAll('input[type="password"]');
      const hasPasswordField = passwordFields.length > 0;

      // Check for suspicious form actions
      let hasSuspiciousFormAction = false;
      const forms = document.querySelectorAll('form');

      forms.forEach(form => {
        const action = form.getAttribute('action');
        if (action) {
          try {
            const actionURL = new URL(action, window.location.href);
            if (actionURL.hostname !== currentDomain && actionURL.hostname !== '') {
              hasSuspiciousFormAction = true;
            }
          } catch (e) {
            // Invalid URL - might be relative or malformed
            console.debug('[Phishing Detection] Invalid form action:', action);
          }
        }
      });

      // Check external links ratio
      const allLinks = document.querySelectorAll('a[href]');
      let externalLinks = 0;

      allLinks.forEach(link => {
        try {
          const linkURL = new URL(link.href);
          if (linkURL.hostname !== currentDomain) {
            externalLinks++;
          }
        } catch (e) {
          // Invalid URL
          console.debug('[Phishing Detection] Invalid link:', link.href);
        }
      });

      const externalLinksRatio = allLinks.length > 0 ? externalLinks / allLinks.length : 0;

      // Check for hidden iframes
      const iframes = document.querySelectorAll('iframe');
      let hasHiddenIframes = false;

      iframes.forEach(iframe => {
        try {
          const style = window.getComputedStyle(iframe);
          if (style.display === 'none' ||
              style.visibility === 'hidden' ||
              style.opacity === '0' ||
              iframe.offsetWidth === 0 ||
              iframe.offsetHeight === 0) {
            hasHiddenIframes = true;
          }
        } catch (e) {
          console.debug('[Phishing Detection] Error checking iframe:', e);
        }
      });

      // Send analysis to background script
      if (chrome.runtime && chrome.runtime.id) {
        chrome.runtime.sendMessage({
          action: 'analyzeContent',
          data: {
            isHTTPS,
            hasPasswordField,
            hasSuspiciousFormAction,
            externalLinksRatio,
            hasHiddenIframes
          }
        }, (response) => {
          // Check for chrome.runtime.lastError
          if (chrome.runtime.lastError) {
            console.error('[Phishing Detection] Message error:', chrome.runtime.lastError.message);
            return;
          }

          if (response && response.analysis && response.analysis.suspicious) {
            displayWarningBanner(response.analysis);
          }
        });
      }
    } catch (error) {
      console.error('[Phishing Detection] Error analyzing page:', error);
    }
  }

  /**
   * Display inline warning banner for suspicious content
   * @param {Object} analysis - Analysis result from background script
   */
  function displayWarningBanner(analysis) {
    try {
      // Check if banner already exists
      if (document.getElementById('phishing-warning-banner')) {
        return;
      }

      // Check if body exists
      if (!document.body) {
        console.warn('[Phishing Detection] Cannot display banner - no body element');
        return;
      }

      const banner = document.createElement('div');
      banner.id = 'phishing-warning-banner';
      banner.setAttribute('role', 'alert');
      banner.setAttribute('aria-live', 'assertive');

      // Use inline styles to avoid CSP issues
      banner.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, #ff4444, #cc0000);
        color: white;
        padding: 15px 20px;
        z-index: 2147483647;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
        font-size: 14px;
        line-height: 1.5;
        border-bottom: 3px solid #990000;
      `;

      // Safely escape HTML in warnings
      const escapedWarnings = (analysis.warnings || []).map(w =>
        String(w).replace(/</g, '&lt;').replace(/>/g, '&gt;')
      ).join(' • ');

      banner.innerHTML = `
        <div style="max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 200px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                <path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16v2h2v-2h-2zm0-6v4h2v-4h-2z"/>
              </svg>
              <strong style="font-size: 16px;">⚠️ PHISHING WARNING</strong>
            </div>
            <div style="margin-top: 8px; margin-left: 34px;">
              This website has been flagged as potentially dangerous. Suspicion score: ${Math.round(analysis.suspicionScore)}/100
              <div style="margin-top: 5px; font-size: 12px; opacity: 0.9;">
                ${escapedWarnings || 'Multiple suspicious indicators detected'}
              </div>
            </div>
          </div>
          <button id="close-warning-banner" aria-label="Dismiss warning" style="
            background: rgba(255,255,255,0.2);
            border: 1px solid rgba(255,255,255,0.5);
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            margin-left: 20px;
            margin-top: 10px;
            transition: background 0.2s;
          ">
            Dismiss
          </button>
        </div>
      `;

      // Insert banner
      document.body.insertBefore(banner, document.body.firstChild);

      // Add close button functionality
      const closeButton = document.getElementById('close-warning-banner');
      if (closeButton) {
        closeButton.addEventListener('click', () => {
          banner.remove();
          // Restore original padding
          if (document.body.style.paddingTop) {
            const currentPadding = parseInt(document.body.style.paddingTop) || 0;
            const bannerHeight = banner.offsetHeight || 0;
            document.body.style.paddingTop = Math.max(0, currentPadding - bannerHeight) + 'px';
          }
        });

        // Hover effects
        closeButton.addEventListener('mouseenter', () => {
          closeButton.style.background = 'rgba(255,255,255,0.3)';
        });

        closeButton.addEventListener('mouseleave', () => {
          closeButton.style.background = 'rgba(255,255,255,0.2)';
        });
      }

      // Adjust body padding to prevent content from being hidden
      const bannerHeight = banner.offsetHeight;
      const originalPaddingTop = parseInt(window.getComputedStyle(document.body).paddingTop) || 0;
      document.body.style.paddingTop = (originalPaddingTop + bannerHeight) + 'px';

    } catch (error) {
      console.error('[Phishing Detection] Error displaying banner:', error);
    }
  }

  /**
   * Set up mutation observer for dynamic content
   */
  function setupObserver() {
    try {
      // Only observe if body exists
      if (!document.body) {
        // Retry when body is available
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', setupObserver);
        }
        return;
      }

      const observer = new MutationObserver((mutations) => {
        let shouldReanalyze = false;

        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) { // Element node
              const tagName = node.tagName;
              if (tagName === 'FORM' || tagName === 'INPUT' || tagName === 'IFRAME') {
                shouldReanalyze = true;
              }

              // Check child elements
              if (node.querySelectorAll) {
                try {
                  if (node.querySelectorAll('form').length > 0 ||
                      node.querySelectorAll('input[type="password"]').length > 0 ||
                      node.querySelectorAll('iframe').length > 0) {
                    shouldReanalyze = true;
                  }
                } catch (e) {
                  console.debug('[Phishing Detection] Error in querySelector:', e);
                }
              }
            }
          });
        });

        if (shouldReanalyze) {
          // Debounce re-analysis
          if (analyzePageTimer) {
            clearTimeout(analyzePageTimer);
          }
          analyzePageTimer = setTimeout(analyzePage, 500);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      console.log('[Phishing Detection] Mutation observer active');
    } catch (error) {
      console.error('[Phishing Detection] Observer setup error:', error);
    }
  }

  /**
   * Monitor form submissions for external domain warnings
   */
  function setupFormMonitoring() {
    try {
      document.addEventListener('submit', (e) => {
        try {
          const form = e.target;
          if (!form || form.tagName !== 'FORM') return;

          const action = form.getAttribute('action');
          const currentDomain = window.location.hostname;

          if (!action) return;

          const actionURL = new URL(action, window.location.href);

          if (actionURL.hostname !== currentDomain && actionURL.hostname !== '') {
            const confirmSubmit = confirm(
              '⚠️ SECURITY WARNING\n\n' +
              'This form is submitting data to a different domain:\n' +
              actionURL.hostname + '\n\n' +
              'This could be a phishing attempt. Are you sure you want to continue?'
            );

            if (!confirmSubmit) {
              e.preventDefault();
              e.stopPropagation();
              console.log('[Phishing Detection] Form submission blocked by user');
            }
          }
        } catch (error) {
          console.error('[Phishing Detection] Error checking form submission:', error);
        }
      }, true);

      console.log('[Phishing Detection] Form monitoring active');
    } catch (error) {
      console.error('[Phishing Detection] Form monitoring setup error:', error);
    }
  }

  /**
   * Initialize content script
   */
  function initialize() {
    try {
      // Set up form monitoring immediately
      setupFormMonitoring();

      // Analyze page when DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          analyzePage();
          setupObserver();
        });
      } else {
        analyzePage();
        setupObserver();
      }

      // Re-analyze after page fully loads (for dynamic content)
      window.addEventListener('load', () => {
        setTimeout(analyzePage, 1000);
      });

      console.log('[Phishing Detection] Content script initialized');
    } catch (error) {
      console.error('[Phishing Detection] Initialization error:', error);
    }
  }

  // Start initialization
  initialize();

})();

// Content Script for Real-Time Page Analysis

(function() {
  'use strict';

  // Avoid running multiple times
  if (window.phishingDetectorInjected) return;
  window.phishingDetectorInjected = true;

  // Analyze current page
  function analyzePage() {
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
          // Invalid URL
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
      }
    });
    const externalLinksRatio = allLinks.length > 0 ? externalLinks / allLinks.length : 0;

    // Check for hidden iframes
    const iframes = document.querySelectorAll('iframe');
    let hasHiddenIframes = false;
    iframes.forEach(iframe => {
      const style = window.getComputedStyle(iframe);
      if (style.display === 'none' || style.visibility === 'hidden' ||
          style.opacity === '0' || iframe.offsetWidth === 0 || iframe.offsetHeight === 0) {
        hasHiddenIframes = true;
      }
    });

    // Send analysis to background script
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
      if (response && response.analysis && response.analysis.suspicious) {
        displayWarningBanner(response.analysis);
      }
    });
  }

  // Display inline warning banner
  function displayWarningBanner(analysis) {
    // Check if banner already exists
    if (document.getElementById('phishing-warning-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'phishing-warning-banner';
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

    banner.innerHTML = `
      <div style="max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between;">
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16v2h2v-2h-2zm0-6v4h2v-4h-2z"/>
            </svg>
            <strong style="font-size: 16px;">⚠️ PHISHING WARNING</strong>
          </div>
          <div style="margin-top: 8px; margin-left: 34px;">
            This website has been flagged as potentially dangerous. Suspicion score: ${analysis.suspicionScore}/100
            <div style="margin-top: 5px; font-size: 12px; opacity: 0.9;">
              ${analysis.warnings.join(' • ')}
            </div>
          </div>
        </div>
        <button id="close-warning-banner" style="
          background: rgba(255,255,255,0.2);
          border: 1px solid rgba(255,255,255,0.5);
          color: white;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          margin-left: 20px;
          transition: background 0.2s;
        " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
          Dismiss
        </button>
      </div>
    `;

    document.body.insertBefore(banner, document.body.firstChild);

    // Add close button functionality
    document.getElementById('close-warning-banner').addEventListener('click', () => {
      banner.remove();
    });

    // Adjust body padding to prevent content from being hidden
    const originalPaddingTop = document.body.style.paddingTop;
    document.body.style.paddingTop = (parseInt(originalPaddingTop) || 0) + banner.offsetHeight + 'px';
  }

  // Monitor DOM changes for dynamically added forms
  const observer = new MutationObserver((mutations) => {
    let shouldReanalyze = false;
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1) { // Element node
          if (node.tagName === 'FORM' || node.tagName === 'INPUT' || node.tagName === 'IFRAME') {
            shouldReanalyze = true;
          }
          if (node.querySelectorAll &&
              (node.querySelectorAll('form').length > 0 ||
               node.querySelectorAll('input[type="password"]').length > 0 ||
               node.querySelectorAll('iframe').length > 0)) {
            shouldReanalyze = true;
          }
        }
      });
    });

    if (shouldReanalyze) {
      setTimeout(analyzePage, 500); // Debounce
    }
  });

  // Start observing
  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Analyze page when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', analyzePage);
  } else {
    analyzePage();
  }

  // Re-analyze after page fully loads (for dynamic content)
  window.addEventListener('load', () => {
    setTimeout(analyzePage, 1000);
  });

  // Monitor form submissions
  document.addEventListener('submit', (e) => {
    const form = e.target;
    const action = form.getAttribute('action');
    const currentDomain = window.location.hostname;

    try {
      const actionURL = new URL(action || window.location.href, window.location.href);
      if (actionURL.hostname !== currentDomain) {
        const confirmSubmit = confirm(
          '⚠️ SECURITY WARNING\n\n' +
          'This form is submitting data to a different domain:\n' +
          actionURL.hostname + '\n\n' +
          'This could be a phishing attempt. Are you sure you want to continue?'
        );
        if (!confirmSubmit) {
          e.preventDefault();
        }
      }
    } catch (error) {
      console.error('Error checking form action:', error);
    }
  }, true);

  console.log('Phishing Detection: Content script loaded');
})();

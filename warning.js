// Warning page script

document.addEventListener('DOMContentLoaded', () => {
  // Parse URL parameters
  const params = new URLSearchParams(window.location.search);
  const blockedURL = params.get('blocked');
  const reasonsJSON = params.get('reasons');
  const score = parseInt(params.get('score')) || 0;

  // Display blocked URL
  if (blockedURL) {
    document.getElementById('blocked-url-text').textContent = decodeURIComponent(blockedURL);
  }

  // Display suspicion score
  document.getElementById('score-value').textContent = score;
  const scoreDeg = (score / 100) * 360;
  document.getElementById('score-circle').style.setProperty('--score-deg', scoreDeg + 'deg');

  // Display reasons
  if (reasonsJSON) {
    try {
      const reasons = JSON.parse(decodeURIComponent(reasonsJSON));
      const reasonsList = document.getElementById('reasons-list');
      reasonsList.innerHTML = '';

      if (reasons && reasons.length > 0) {
        reasons.forEach(reason => {
          const li = document.createElement('li');
          li.textContent = reason;
          reasonsList.appendChild(li);
        });
      } else {
        reasonsList.innerHTML = '<li>No specific reasons provided</li>';
      }
    } catch (e) {
      console.error('Error parsing reasons:', e);
    }
  }

  // Go back button
  document.getElementById('go-back').addEventListener('click', () => {
    window.history.back();
  });

  // Report false positive
  document.getElementById('report-issue').addEventListener('click', () => {
    alert(
      'To report a false positive:\n\n' +
      '1. Take a screenshot of this page\n' +
      '2. Note the blocked URL\n' +
      '3. Contact the extension developer\n\n' +
      'Thank you for helping improve our detection!'
    );
  });

  // Proceed anyway (with additional warning)
  document.getElementById('proceed-anyway').addEventListener('click', () => {
    const confirmProceed = confirm(
      '⚠️ FINAL WARNING ⚠️\n\n' +
      'You are about to visit a website flagged as potentially dangerous.\n\n' +
      'DO NOT:\n' +
      '- Enter passwords or personal information\n' +
      '- Download files\n' +
      '- Click on suspicious links\n' +
      '- Provide payment information\n\n' +
      'Are you absolutely sure you want to proceed?'
    );

    if (confirmProceed) {
      // Add to whitelist and redirect
      chrome.storage.local.get(['whitelistedSites'], (data) => {
        const whitelist = data.whitelistedSites || [];
        try {
          const url = new URL(decodeURIComponent(blockedURL));
          whitelist.push(url.hostname);
          chrome.storage.local.set({ whitelistedSites: whitelist }, () => {
            window.location.href = decodeURIComponent(blockedURL);
          });
        } catch (e) {
          window.location.href = decodeURIComponent(blockedURL);
        }
      });
    }
  });
});

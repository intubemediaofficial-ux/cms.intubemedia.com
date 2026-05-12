/* Bainsla Music - Dynamic Content Loader
   Loads content from admin panel API and updates the website */
(function() {
  'use strict';
  const API_URL = '/api/frontend-data.php';

  async function loadContent() {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) return;
      const data = await res.json();
      if (data.settings) updateSettings(data.settings);
    } catch(e) {
      // silently fail - static content will be shown
    }
  }

  function updateSettings(s) {
    if (s.phone) {
      document.querySelectorAll('[data-phone]').forEach(el => {
        el.textContent = s.phone;
        if (el.href) el.href = 'tel:' + s.phone.replace(/\s/g, '');
      });
    }
    if (s.email) {
      document.querySelectorAll('[data-email]').forEach(el => {
        el.textContent = s.email;
        if (el.href) el.href = 'mailto:' + s.email;
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadContent);
  } else {
    loadContent();
  }
})();

// Dynamic Content Loader - loads admin-managed content on live website
(function() {
  const API_URL = '/admin/api.php';

  async function loadData(type) {
    try {
      const res = await fetch(API_URL + '?action=load&type=' + type);
      return await res.json();
    } catch(e) { return null; }
  }

  // Load Donor Wall ticker
  async function loadDonorWall() {
    const donors = await loadData('donorWall');
    if (!donors || donors.length === 0) return;
    const tickers = document.querySelectorAll('.donor-ticker-row, .ticker-row');
    if (tickers.length === 0) return;
    const html = donors.map(d => `<div class="donor-item"><span class="donor-name">${d.name}</span><span class="donor-amount">₹${Number(d.amount).toLocaleString()}</span><span class="donor-time">${d.time}</span></div>`).join('');
    tickers.forEach(t => { t.innerHTML = html + html; });
  }

  // Load Bank Details on donate page
  async function loadBankDetails() {
    const bank = await loadData('bankDetails');
    if (!bank || !bank.bankName) return;
    // Update bank details on page if elements exist
    const bankSection = document.querySelector('.bank-details, .payment-info');
    if (bankSection) {
      const fields = bankSection.querySelectorAll('[data-field]');
      fields.forEach(f => { if (bank[f.dataset.field]) f.textContent = bank[f.dataset.field]; });
    }
  }

  // Load Razorpay and activate payment button
  async function loadRazorpay() {
    const rzp = await loadData('razorpay');
    if (!rzp || !rzp.keyId) return;
    // Add Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.head.appendChild(script);

    // Find donate buttons and attach Razorpay
    script.onload = function() {
      document.querySelectorAll('.razorpay-btn, [data-razorpay]').forEach(btn => {
        btn.style.display = 'inline-flex';
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          const amount = btn.dataset.amount || document.querySelector('#donateAmount')?.value || 500;
          const options = {
            key: rzp.keyId,
            amount: parseInt(amount) * 100,
            currency: 'INR',
            name: rzp.name || 'Hope 4 Kids Care Foundation',
            description: rzp.description || 'Donation',
            image: rzp.logo || '',
            handler: function(response) {
              alert('Thank you! Payment successful. ID: ' + response.razorpay_payment_id);
            },
            prefill: {},
            theme: { color: '#1d4ed8' }
          };
          const pay = new Razorpay(options);
          pay.open();
        });
      });
    };
  }

  // Load Gallery
  async function loadGallery() {
    const gallery = await loadData('gallery');
    if (!gallery || gallery.length === 0) return;
    const grid = document.querySelector('.gallery-grid, .gallery-container, #dynamicGallery');
    if (!grid) return;
    grid.innerHTML = gallery.map(p => `<div class="gallery-item"><img src="${p.url}" alt="${p.caption || ''}" loading="lazy"><div class="gallery-overlay"><p>${p.caption || ''}</p></div></div>`).join('');
  }

  // Load Settings (phone, email, social links)
  async function loadSettings() {
    const settings = await loadData('settings');
    if (!settings || !settings.phone) return;
    // Update phone numbers
    document.querySelectorAll('[data-phone], .phone-number').forEach(el => { el.textContent = settings.phone; });
    document.querySelectorAll('a[href*="tel:"]').forEach(a => { a.href = 'tel:' + settings.phone.replace(/\s/g, ''); });
    // Update emails
    document.querySelectorAll('[data-email], .email-address').forEach(el => { el.textContent = settings.email; });
    // Update WhatsApp
    document.querySelectorAll('a[href*="wa.me"]').forEach(a => { a.href = 'https://wa.me/' + settings.whatsapp; });
    // Update social links
    if (settings.fb) document.querySelectorAll('a[href*="facebook"]').forEach(a => { a.href = settings.fb; });
    if (settings.insta) document.querySelectorAll('a[href*="instagram"]').forEach(a => { a.href = settings.insta; });
    if (settings.yt) document.querySelectorAll('a[href*="youtube"]').forEach(a => { a.href = settings.yt; });
  }

  // Load Banner/Homepage content
  async function loadBanner() {
    const banner = await loadData('bannerContent');
    if (!banner || !banner.title1) return;
    const heroTitle = document.querySelector('.hero-title, .hero h1');
    if (heroTitle) heroTitle.innerHTML = banner.title1 + ' <span>' + banner.title2 + '</span>';
    const heroSub = document.querySelector('.hero-subtitle, .hero p');
    if (heroSub) heroSub.textContent = banner.subtitle;
  }

  // Initialize on page load
  document.addEventListener('DOMContentLoaded', function() {
    loadDonorWall();
    loadSettings();
    // Page-specific loading
    if (window.location.pathname.includes('donate')) { loadBankDetails(); loadRazorpay(); }
    if (window.location.pathname.includes('gallery')) { loadGallery(); }
    if (window.location.pathname === '/' || window.location.pathname.includes('index')) { loadBanner(); loadRazorpay(); }
  });
})();

// Dynamic Content Loader for Bainsla Music Website
// Fetches data from admin panel API and updates page content
(function() {
    const API_URL = '/api/frontend-data.php';
    
    async function loadDynamicContent() {
        try {
            const res = await fetch(API_URL);
            if (!res.ok) return;
            const data = await res.json();
            if (!data || !data.videos) return;
            
            updateVideos(data.videos);
            updateChannels(data.channels);
            updateTestimonials(data.testimonials);
            updateStats(data.stats);
            updateSettings(data.settings);
            updateDirectors(data.directors);
        } catch(e) {
            // Silently fail - static content remains
        }
    }

    function updateVideos(videos) {
        if (!videos || !videos.length) return;
        const videoSection = document.querySelector('[id*="videos"]') || 
            findSectionByHeading('Hit Videos');
        if (!videoSection) return;
        
        const videoLinks = videoSection.querySelectorAll('a[href*="youtube.com/watch"]');
        videos.forEach((video, i) => {
            if (videoLinks[i]) {
                videoLinks[i].href = `https://www.youtube.com/watch?v=${video.video_id}`;
                const img = videoLinks[i].querySelector('img');
                if (img) img.src = `https://img.youtube.com/vi/${video.video_id}/hqdefault.jpg`;
                const titleEl = videoLinks[i].querySelector('div > div');
                if (titleEl && titleEl.childNodes[0]) titleEl.childNodes[0].textContent = video.title;
            }
        });
    }

    function updateChannels(channels) {
        if (!channels || !channels.length) return;
        const section = findSectionByHeading('Partner Channels');
        if (!section) return;
        const links = section.querySelectorAll('a[href*="youtube.com/@"]');
        channels.forEach((ch, i) => {
            if (links[i]) {
                links[i].href = ch.url;
                const h4 = links[i].querySelector('h4');
                if (h4) h4.textContent = ch.name;
            }
        });
    }

    function updateTestimonials(testimonials) {
        if (!testimonials || !testimonials.length) return;
        // Testimonials are rendered statically, dynamic update optional
    }

    function updateStats(stats) {
        if (!stats) return;
        // Stats counters are animated via JS already
    }

    function updateSettings(settings) {
        if (!settings) return;
        // Update phone/email links
        const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
        phoneLinks.forEach(l => { l.href = `tel:${settings.phone}`; l.textContent = settings.phone; });
        
        const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
        emailLinks.forEach(l => { l.href = `mailto:${settings.email}`; l.textContent = settings.email; });
        
        const waLink = document.querySelector('a[href*="wa.me"]');
        if (waLink && settings.whatsapp) {
            waLink.href = `https://wa.me/${settings.whatsapp}?text=Hi%2C%20I%20want%20to%20know%20about%20your%20services`;
        }
    }

    function updateDirectors(directors) {
        // Directors section is relatively static
    }

    function findSectionByHeading(text) {
        const headings = document.querySelectorAll('h2');
        for (let h of headings) {
            if (h.textContent.includes(text)) {
                return h.closest('section');
            }
        }
        return null;
    }

    // Load when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadDynamicContent);
    } else {
        loadDynamicContent();
    }
})();

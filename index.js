/* ============================================
 * ProVance - Optimized Index Script
 * بدون parallax أو particles اللي بيسببوا لاج
 * ============================================ */

(function () {
    'use strict';

    // ============================================
    // Helpers
    // ============================================
    function $(id) { return document.getElementById(id); }

    function scrollToTop() {
        // طريقة موحدة تشتغل على كل المتصفحات
        try { window.scrollTo({ top: 0, behavior: 'instant' }); } catch (e) {
            window.scrollTo(0, 0);
        }
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    }

    // ============================================
    // Page Switching
    // ============================================
    function showPage(hideId, showId) {
        const hide = $(hideId);
        const show = $(showId);
        if (!hide || !show) return;

        hide.classList.remove('active');
        hide.style.display = 'none';

        show.classList.add('active');
        show.style.display = 'block';

        scrollToTop();
        // استدعاء scrollToTop مرة تانية بعد render
        requestAnimationFrame(scrollToTop);
    }

    function showSelection() {
        showPage('welcomePage', 'selectionScreen');
    }

    function showWelcome() {
        showPage('selectionScreen', 'welcomePage');
    }

    function scrollToAbout() {
        const el = $('aboutSection');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // ============================================
    // Counter Animation (محسّنة جداً)
    // ============================================
    function animateCounters() {
        const counters = document.querySelectorAll('.stat-number');
        if (!counters.length) return;

        counters.forEach(el => {
            const target = parseInt(el.dataset.target || '0', 10);
            if (!target) return;

            const duration = 1500;
            const startTime = performance.now();

            function step(now) {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // easing function
                const eased = 1 - Math.pow(1 - progress, 3);
                const value = Math.floor(target * eased);
                el.textContent = value.toLocaleString('ar-EG');

                if (progress < 1) {
                    requestAnimationFrame(step);
                }
            }

            requestAnimationFrame(step);
        });
    }

    // ============================================
    // Card Click Handler
    // ============================================
    function setupCards() {
        const cards = document.querySelectorAll('.user-card');

        cards.forEach(card => {
            const url = card.dataset.url;
            if (!url) return;

            card.addEventListener('click', function (e) {
                // منع الضغط المتكرر
                if (card.dataset.clicked === 'true') return;
                card.dataset.clicked = 'true';

                // تأثير بصري بسيط
                card.style.transform = 'scale(0.97)';
                card.style.opacity = '0.85';

                // التحويل بعد فترة قصيرة جداً
                setTimeout(() => {
                    window.location.href = url;
                }, 150);
            });
        });
    }

    // ============================================
    // Init
    // ============================================
    function init() {
        // Buttons
        const startBtn = $('mainStartBtn');
        if (startBtn) startBtn.addEventListener('click', showSelection);

        const discoverBtn = $('discoverBtn');
        if (discoverBtn) discoverBtn.addEventListener('click', scrollToAbout);

        const backBtn = $('backBtn');
        if (backBtn) backBtn.addEventListener('click', showWelcome);

        // Cards
        setupCards();

        // Counters - استنى شوية بعد التحميل عشان أداء أحسن
        setTimeout(animateCounters, 300);
    }

    // ============================================
    // Start
    // ============================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

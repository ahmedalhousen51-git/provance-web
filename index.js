// ===== عرض/إخفاء شاشة الاختيار =====
function showSelectionScreen() {
    const welcomePage = document.getElementById('welcomePage');
    const selectionScreen = document.getElementById('selectionScreen');
 
    if (welcomePage && selectionScreen) {
        welcomePage.classList.remove('active');
        selectionScreen.classList.add('active');
        // يشتغل على Android و iOS
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        window.scrollTo(0, 0);
    }
}
 
function hideSelectionScreen() {
    const welcomePage = document.getElementById('welcomePage');
    const selectionScreen = document.getElementById('selectionScreen');
 
    if (welcomePage && selectionScreen) {
        selectionScreen.classList.remove('active');
        welcomePage.classList.add('active');
    }
}
 
// ===== التمرير لقسم "من نحن" =====
function scrollToAbout() {
    const aboutSection = document.getElementById('aboutSection');
    if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
}
 
// ===== عند تحميل الصفحة =====
document.addEventListener('DOMContentLoaded', function () {
 
    // زر "ابدأ الآن مجاناً"
    const mainStartBtn = document.getElementById('mainStartBtn');
    if (mainStartBtn) {
        mainStartBtn.addEventListener('click', showSelectionScreen);
    }
 
    // زر "اكتشف المزيد" (scroll-btn)
    const scrollBtn = document.querySelector('.scroll-btn');
    if (scrollBtn) {
        scrollBtn.addEventListener('click', scrollToAbout);
    }
 
    // زر "رجوع"
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', hideSelectionScreen);
    }
 
    // بطاقات الاختيار (.user-card)
    const userCards = document.querySelectorAll('.user-card');
    userCards.forEach(card => {
        card.addEventListener('click', function () {
            const url = this.getAttribute('data-url');
            if (url) {
                // أنيميشن نقر
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = '';
                    window.location.href = url;
                }, 300);
            }
        });
 
        // hover effects
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-10px) scale(1.03)';
        });
        card.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
 
    // أنيميشن الأرقام (counter)
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(el => {
        const target = parseInt(el.getAttribute('data-target'));
        if (!target) return;
        let current = 0;
        const increment = Math.ceil(target / 60);
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            el.textContent = current.toLocaleString('ar-EG');
        }, 30);
    });
 
    // أنيميشن ظهور الصفحة
    document.body.classList.add('loaded');
});
 
// ===== تأثير الشعار =====
const logo = document.querySelector('.logo');
if (logo) {
    setInterval(() => {
        logo.style.textShadow = `
            0 0 10px rgba(255, 215, 0, 0.7),
            0 0 20px rgba(255, 215, 0, 0.5),
            0 0 30px rgba(255, 215, 0, 0.3)
        `;
        setTimeout(() => {
            logo.style.textShadow = '0 0 10px rgba(255, 215, 0, 0.5)';
        }, 1000);
    }, 3000);
}

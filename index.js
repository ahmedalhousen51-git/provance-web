// ===== دالة الـ scroll لأعلى - متوافقة مع كل الموبايلات =====
function scrollToTop() {
    try { window.scrollTo({ top: 0, behavior: 'instant' }); } catch(e) {}
    try { window.scrollTo(0, 0); } catch(e) {}
    try { document.documentElement.scrollTop = 0; } catch(e) {}
    try { document.body.scrollTop = 0; } catch(e) {}
}

// ===== عرض شاشة الاختيار =====
function showSelectionScreen() {
    var welcomePage = document.getElementById('welcomePage');
    var selectionScreen = document.getElementById('selectionScreen');
    if (!welcomePage || !selectionScreen) return;

    welcomePage.classList.remove('active');
    welcomePage.style.display = 'none';

    selectionScreen.classList.add('active');
    selectionScreen.style.display = 'block';

    // نرجع لأعلى - بنجربها تلات مرات عشان iOS و Samsung
    scrollToTop();
    setTimeout(scrollToTop, 50);
    setTimeout(scrollToTop, 200);
}

// ===== إخفاء شاشة الاختيار =====
function hideSelectionScreen() {
    var welcomePage = document.getElementById('welcomePage');
    var selectionScreen = document.getElementById('selectionScreen');
    if (!welcomePage || !selectionScreen) return;

    selectionScreen.classList.remove('active');
    selectionScreen.style.display = 'none';

    welcomePage.classList.add('active');
    welcomePage.style.display = 'block';

    scrollToTop();
}

// ===== التمرير لقسم اكتشف المزيد =====
function scrollToAbout() {
    var aboutSection = document.getElementById('aboutSection');
    if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// ===== عند تحميل الصفحة =====
document.addEventListener('DOMContentLoaded', function () {

    // ---- زر "ابدأ الآن مجاناً" ----
    var mainStartBtn = document.getElementById('mainStartBtn');
    if (mainStartBtn) {
        mainStartBtn.addEventListener('click', showSelectionScreen);
    }

    // ---- زر "اكتشف المزيد" ----
    var scrollBtn = document.querySelector('.scroll-btn');
    if (scrollBtn) {
        scrollBtn.addEventListener('click', scrollToAbout);
    }

    // ---- زر "رجوع" ----
    var backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', hideSelectionScreen);
    }

    // ---- بطاقات الاختيار ----
    var userCards = document.querySelectorAll('.user-card');
    for (var i = 0; i < userCards.length; i++) {
        (function(card) {

            // *** المشكلة الأساسية: الـ button جوا البطاقة بيعمل أحداث تانية
            // نوقفه تماماً ونخلي البطاقة كلها هي اللي تتحكم
            var btn = card.querySelector('.select-btn');
            if (btn) {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation(); // منع الحدث من الانتشار
                    e.preventDefault();
                });
            }

            // الضغط على البطاقة كلها هو اللي ينقل
            card.addEventListener('click', function(e) {
                // لو الضغطة جت من الـ button، نتجاهلها هنا
                // واحنا بالفعل وقفناها فوق بالـ stopPropagation
                var url = card.getAttribute('data-url');
                if (url) {
                    // أنيميشن بسيط
                    card.style.opacity = '0.7';
                    setTimeout(function() {
                        window.location.href = url;
                    }, 150);
                }
            });

            // Hover effects للكمبيوتر بس
            card.addEventListener('mouseenter', function() {
                card.style.transform = 'translateY(-10px) scale(1.03)';
            });
            card.addEventListener('mouseleave', function() {
                card.style.transform = 'translateY(0) scale(1)';
            });

        })(userCards[i]);
    }

    // ---- أنيميشن الأرقام ----
    var statNumbers = document.querySelectorAll('.stat-number');
    for (var j = 0; j < statNumbers.length; j++) {
        (function(el) {
            var target = parseInt(el.getAttribute('data-target'));
            if (!target) return;
            var current = 0;
            var increment = Math.ceil(target / 60);
            var timer = setInterval(function() {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                el.textContent = current.toLocaleString('ar-EG');
            }, 30);
        })(statNumbers[j]);
    }

    document.body.classList.add('loaded');
});

// ===== تأثير الشعار =====
var logo = document.querySelector('.logo');
if (logo) {
    setInterval(function() {
        logo.style.textShadow = '0 0 10px rgba(255, 215, 0, 0.7), 0 0 20px rgba(255, 215, 0, 0.5), 0 0 30px rgba(255, 215, 0, 0.3)';
        setTimeout(function() {
            logo.style.textShadow = '0 0 10px rgba(255, 215, 0, 0.5)';
        }, 1000);
    }, 3000);
}

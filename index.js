// دالة اختيار نوع المستخدم
function selectUserType(type) {
    // أنيميشن النقر على البطاقة
    const card = event.currentTarget;
    card.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
        card.style.transform = '';
        
        // الانتقال إلى صفحة التسجيل المناسبة
        if (type === 'student') {
            window.location.href = 'student-register.html';
        } else if (type === 'company') {
            // توجيه الشركات إلى صفحة تسجيل الدخول أولاً
            window.location.href = 'company-login.html';
        }
    }, 300);
}

// أنيميشن عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // إضافة event listeners للبطاقات
    const studentCard = document.querySelector('.student-card');
    const companyCard = document.querySelector('.company-card');
    
    if (studentCard) {
        studentCard.addEventListener('click', function() {
            selectUserType('student');
        });
    }
    
    if (companyCard) {
        companyCard.addEventListener('click', function() {
            selectUserType('company');
        });
    }
    
    // إضافة تأثيرات تفاعلية إضافية
    const cards = document.querySelectorAll('.choice-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.05)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
});

// تأثيرات إضافية للشعار
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

// دالة احتياطية في حال لم تعمل الأحداث
window.selectUserType = selectUserType;
// ============================================
// Elements Selection
// ============================================
const forgotForm = document.getElementById('forgotPasswordForm');
const submitBtn = document.getElementById('submitBtn');
const emailInput = document.getElementById('resetEmail');
const successMessage = document.getElementById('successMessage');
const forgotFormElement = document.querySelector('.forgot-form');
const forgotHeader = document.querySelector('.forgot-header');
const forgotIcon = document.querySelector('.forgot-icon');
const resendLink = document.getElementById('resendLink');

// ============================================
// Form Validation
// ============================================
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showError(message) {
    const errorElement = document.getElementById('emailError');
    const inputElement = document.getElementById('resetEmail');
    
    errorElement.textContent = message;
    errorElement.classList.add('show');
    inputElement.style.borderColor = 'var(--error-color)';
    
    // Shake animation
    inputElement.style.animation = 'shake 0.5s';
    setTimeout(() => {
        inputElement.style.animation = '';
    }, 500);
}

function hideError() {
    const errorElement = document.getElementById('emailError');
    const inputElement = document.getElementById('resetEmail');
    
    errorElement.classList.remove('show');
    inputElement.style.borderColor = 'var(--border-color)';
}

// Add shake animation
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

// ============================================
// Form Submit
// ============================================
forgotForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    
    // Reset errors
    hideError();
    
    // Validate
    if (!email) {
        showError('البريد الإلكتروني مطلوب');
        return;
    }
    
    if (!validateEmail(email)) {
        showError('البريد الإلكتروني غير صحيح');
        return;
    }
    
    // Show loading
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    // إرسال إيميل إعادة التعيين فعلياً عبر Supabase
    (async () => {
        try {
            const sb = (window.ProVance && window.ProVance.sb)
                || (window.supabase && window.supabase.createClient(
                    'https://jrwazyrdzmbcnddpxxrf.supabase.co',
                    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impyd2F6eXJkem1iY25kZHB4eHJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MzUyMzksImV4cCI6MjA5MjExMTIzOX0.KaZt3Xb-9zjjwlSYnCvQQVxzDgbcOxdmnpg9wsUsqQI'
                ));

            const redirectTo = window.location.href.replace(/[?#].*$/, '').replace(/[^/]*$/, 'company-reset-password.html');
            const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo });

            if (error) {
                console.error(error);
                showError('حدث خطأ، حاول مرة أخرى');
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
                return;
            }

            // نجح - اعرض رسالة النجاح
            forgotFormElement.style.display = 'none';
            forgotHeader.style.display = 'none';
            forgotIcon.style.display = 'none';
            successMessage.classList.add('show');
            document.getElementById('sentEmail').textContent = email;
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        } catch (err) {
            console.error(err);
            showError('خطأ في الاتصال، حاول مرة أخرى');
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    })();
});

// ============================================
// Resend Link
// ============================================
resendLink.addEventListener('click', function(e) {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    
    if (!email || !validateEmail(email)) {
        showError('الرجاء إدخال بريد إلكتروني صحيح أولاً');
        return;
    }
    
    // Disable temporarily
    this.style.pointerEvents = 'none';
    this.style.opacity = '0.5';
    this.textContent = 'جاري الإرسال...';

    const linkEl = this;
    (async () => {
        try {
            const sb = (window.ProVance && window.ProVance.sb)
                || (window.supabase && window.supabase.createClient(
                    'https://jrwazyrdzmbcnddpxxrf.supabase.co',
                    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impyd2F6eXJkem1iY25kZHB4eHJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MzUyMzksImV4cCI6MjA5MjExMTIzOX0.KaZt3Xb-9zjjwlSYnCvQQVxzDgbcOxdmnpg9wsUsqQI'
                ));
            const redirectTo = window.location.href.replace(/[?#].*$/, '').replace(/[^/]*$/, 'company-reset-password.html');
            await sb.auth.resetPasswordForEmail(email, { redirectTo });
            showNotification('تم إعادة إرسال الرابط بنجاح!');
        } catch (err) {
            showNotification('حدث خطأ، حاول مرة أخرى');
        }
        linkEl.style.pointerEvents = 'auto';
        linkEl.style.opacity = '1';
        linkEl.textContent = 'أعد الإرسال';
    })();
});

// ============================================
// Notification
// ============================================
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 30px;
        right: 30px;
        background: linear-gradient(135deg, #51cf66 0%, #37b24d 100%);
        color: white;
        padding: 18px 25px;
        border-radius: 12px;
        box-shadow: 0 15px 50px rgba(81, 207, 102, 0.5);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 12px;
        font-weight: 600;
        animation: slideInRight 0.5s ease-out;
    `;
    
    notification.innerHTML = `
        <i class="fas fa-check-circle" style="font-size: 24px;"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    const animStyle = document.createElement('style');
    animStyle.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(animStyle);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.5s ease-out';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// ============================================
// Input Focus Effect
// ============================================
emailInput.addEventListener('focus', function() {
    this.parentElement.style.transform = 'translateY(-2px)';
    this.parentElement.style.transition = 'transform 0.3s ease';
});

emailInput.addEventListener('blur', function() {
    this.parentElement.style.transform = 'translateY(0)';
});

// ============================================
// Page Load Animation
// ============================================
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.6s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// ============================================
// Elements Selection
// ============================================
const loginForm = document.getElementById('studentLoginForm');
const submitBtn = document.querySelector('.submit-btn');
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
const forgotPasswordLink = document.getElementById('forgotPassword');
const forgotModal = document.getElementById('forgotModal');
const closeModal = document.getElementById('closeModal');
const forgotForm = document.getElementById('forgotForm');
const modalOverlay = document.querySelector('.modal-overlay');

// ============================================
// بيانات المستخدمين المسجلين (بدلاً من قاعدة البيانات)
// ============================================
const registeredUsers = [
    { email: 'student1@example.com', password: 'password123', name: 'أحمد محمد' },
    { email: 'student2@example.com', password: 'password123', name: 'فاطمة أحمد' },
    { email: 'admin@example.com', password: 'admin123', name: 'محمد علي' }
];

// ============================================
// Toggle Password Visibility
// ============================================
togglePassword.addEventListener('click', function() {
    const type = passwordInput.getAttribute('type');
    
    if (type === 'password') {
        passwordInput.setAttribute('type', 'text');
        this.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
        passwordInput.setAttribute('type', 'password');
        this.innerHTML = '<i class="fas fa-eye"></i>';
    }
});

// ============================================
// Form Validation
// ============================================
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showError(inputId, message) {
    const errorElement = document.getElementById(inputId + 'Error');
    const inputElement = document.getElementById(inputId);
    
    errorElement.textContent = message;
    errorElement.classList.add('show');
    inputElement.style.borderColor = 'var(--error-color)';
    
    // Shake animation
    inputElement.style.animation = 'shake 0.5s';
    setTimeout(() => {
        inputElement.style.animation = '';
    }, 500);
}

function hideError(inputId) {
    const errorElement = document.getElementById(inputId + 'Error');
    const inputElement = document.getElementById(inputId);
    
    errorElement.classList.remove('show');
    inputElement.style.borderColor = 'var(--border-color)';
}

// Shake animation
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
// Form Submit - التعديلات الأساسية هنا
// ============================================
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Reset errors
    hideError('email');
    hideError('password');
    
    // Validate
    let isValid = true;
    
    if (!email) {
        showError('email', 'البريد الإلكتروني مطلوب');
        isValid = false;
    } else if (!validateEmail(email)) {
        showError('email', 'البريد الإلكتروني غير صحيح');
        isValid = false;
    }
    
    if (!password) {
        showError('password', 'كلمة المرور مطلوبة');
        isValid = false;
    } else if (password.length < 6) {
        showError('password', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل');
        isValid = false;
    }
    
    if (!isValid) return;
    
    // Show loading
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    // التحقق من صحة بيانات الدخول مقابل المستخدمين المسجلين
    const user = registeredUsers.find(u => u.email === email && u.password === password);
    
    if (user) {
        // تخزين بيانات المستخدم
        localStorage.setItem('userType', 'student');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userName', user.name);
        localStorage.setItem('isLoggedIn', 'true');
        if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
        }
        
        // إظهار رسالة النجاح
        showSuccessNotification('تم تسجيل الدخول بنجاح!');
        
        // إعادة التوجيه
        setTimeout(() => {
            window.location.href = 'internship.html';
        }, 1500);
    } else {
        // إظهار خطأ في بيانات الدخول
        showError('email', 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
        showError('password', 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
        
        // إعادة تعيين الزر
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
});

// ============================================
// Success Notification
// ============================================
function showSuccessNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 30px;
        right: 30px;
        background: linear-gradient(135deg, #51cf66 0%, #37b24d 100%);
        color: white;
        padding: 20px 30px;
        border-radius: 15px;
        box-shadow: 0 15px 50px rgba(81, 207, 102, 0.5);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 15px;
        font-weight: 600;
        animation: slideInRight 0.5s ease-out;
    `;
    
    notification.innerHTML = `
        <i class="fas fa-check-circle" style="font-size: 28px;"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    const animStyle = document.createElement('style');
    animStyle.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(animStyle);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.5s ease-out';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// ============================================
// Forgot Password Modal
// ============================================
forgotPasswordLink.addEventListener('click', function(e) {
    e.preventDefault();
    forgotModal.classList.add('active');
    document.body.style.overflow = 'hidden';
});

closeModal.addEventListener('click', closeForgotModal);
modalOverlay.addEventListener('click', closeForgotModal);

function closeForgotModal() {
    forgotModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Forgot Form Submit
forgotForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const resetEmail = document.getElementById('resetEmail').value.trim();
    
    if (!resetEmail || !validateEmail(resetEmail)) {
        alert('الرجاء إدخال بريد إلكتروني صحيح');
        return;
    }
    
    const modalBtn = this.querySelector('.modal-btn');
    modalBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
    modalBtn.disabled = true;
    
    setTimeout(() => {
        showSuccessNotification('تم إرسال رابط الاستعادة إلى بريدك');
        closeForgotModal();
        forgotForm.reset();
        modalBtn.innerHTML = '<span>إرسال رابط الاستعادة</span><i class="fas fa-paper-plane"></i>';
        modalBtn.disabled = false;
    }, 2000);
});

// ============================================
// Social Login Functions - محاكاة احترافية
// ============================================

// محاكاة نافذة اختيار الحساب
function showAccountSelection(provider) {
    const accounts = [
        { name: 'أحمد محمد', email: 'ahmed.social@example.com' },
        { name: 'فاطمة أحمد', email: 'fatima.social@example.com' },
        { name: 'محمد علي', email: 'mohamed.social@example.com' }
    ];
    
    const modal = document.createElement('div');
    modal.className = 'social-account-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 15px; width: 400px; max-width: 90%; text-align: center;">
            <h3 style="margin-bottom: 20px; color: #333;">اختر حساب ${provider}</h3>
            <div style="margin-bottom: 20px;">
                ${accounts.map(account => `
                    <div class="account-option" style="padding: 15px; border: 1px solid #ddd; margin: 10px 0; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 10px;" 
                         data-email="${account.email}" data-name="${account.name}">
                        <div style="width: 40px; height: 40px; background: #667eea; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white;">
                            ${account.name.charAt(0)}
                        </div>
                        <div style="text-align: right; flex: 1;">
                            <div style="font-weight: bold; color: #333;">${account.name}</div>
                            <div style="color: #666; font-size: 14px;">${account.email}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <button id="closeAccountModal" style="padding: 10px 20px; background: #f8f9fa; border: 1px solid #ddd; border-radius: 8px; cursor: pointer;">إلغاء</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // إضافة مستمعي الأحداث
    modal.querySelectorAll('.account-option').forEach(option => {
        option.addEventListener('click', function() {
            const email = this.getAttribute('data-email');
            const name = this.getAttribute('data-name');
            modal.remove();
            completeSocialLogin(provider, email, name);
        });
    });
    
    modal.querySelector('#closeAccountModal').addEventListener('click', function() {
        modal.remove();
    });
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// إكمال عملية تسجيل الدخول الاجتماعي
function completeSocialLogin(provider, email, name) {
    // تخزين بيانات المستخدم
    localStorage.setItem('userType', 'student');
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userName', name);
    localStorage.setItem('loginMethod', provider);
    localStorage.setItem('isLoggedIn', 'true');
    
    // إظهار رسالة النجاح
    showSuccessNotification(`مرحباً ${name}! تم تسجيل الدخول عبر ${provider} بنجاح`);
    
    // إعادة التوجيه إلى صفحة الانترن شيب
    setTimeout(() => {
        window.location.href = 'internship.html';
    }, 2000);
}

// Facebook Login Functionality
function handleFacebookLogin() {
    // إظهار حالة التحميل
    const facebookBtn = document.querySelector('.social-btn.facebook');
    const originalContent = facebookBtn.innerHTML;
    facebookBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الاتصال...';
    facebookBtn.disabled = true;
    
    // محاكاة اتصال Facebook
    setTimeout(() => {
        // إعادة تعيين الزر
        facebookBtn.innerHTML = originalContent;
        facebookBtn.disabled = false;
        
        // عرض نافذة اختيار الحساب
        showAccountSelection('Facebook');
    }, 1500);
}

// Google Login Functionality
function handleGoogleLogin() {
    // إظهار حالة التحميل
    const googleBtn = document.querySelector('.social-btn.google');
    const originalContent = googleBtn.innerHTML;
    googleBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الاتصال...';
    googleBtn.disabled = true;
    
    // محاكاة اتصال Google
    setTimeout(() => {
        // إعادة تعيين الزر
        googleBtn.innerHTML = originalContent;
        googleBtn.disabled = false;
        
        // عرض نافذة اختيار الحساب
        showAccountSelection('Google');
    }, 1500);
}

// ============================================
// Social Login Event Listeners
// ============================================
const socialButtons = document.querySelectorAll('.social-btn');

socialButtons.forEach(btn => {
    btn.addEventListener('click', function() {
        if (this.classList.contains('facebook')) {
            handleFacebookLogin();
            return;
        }
        if (this.classList.contains('google')) {
            handleGoogleLogin();
            return;
        }
        if (this.classList.contains('linkedin')) {
            showSuccessNotification('سيتم تفعيل LinkedIn قريباً');
        }
    });
});

// ============================================
// Input Focus Effects
// ============================================
const inputs = document.querySelectorAll('.input-group input');

inputs.forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.style.transform = 'translateY(-2px)';
        this.parentElement.style.transition = 'transform 0.3s ease';
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.style.transform = 'translateY(0)';
    });
});

// ============================================
// Check Login Status
// ============================================
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        // إذا كان المستخدم مسجل الدخول بالفعل، إعادة توجيهه إلى صفحة الانترن شيب
        window.location.href = 'internship.html';
    }
}

// ============================================
// Remember Me Functionality
// ============================================
function loadRememberedUser() {
    const rememberMe = localStorage.getItem('rememberMe');
    if (rememberMe === 'true') {
        const savedEmail = localStorage.getItem('userEmail');
        if (savedEmail) {
            document.getElementById('email').value = savedEmail;
            document.getElementById('rememberMe').checked = true;
        }
    }
}

// ============================================
// Page Load Animation
// ============================================
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.6s ease';
        document.body.style.opacity = '1';
    }, 100);
    
    // التحقق من حالة الدخول عند تحميل الصفحة
    checkLoginStatus();
    
    // تحميل بيانات المستخدم المحفوظة
    loadRememberedUser();
});

// ============================================
// Logout Function
// ============================================
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('loginMethod');
    // إعادة التوجيه إلى صفحة الدخول
    window.location.href = 'student-login.html';
}

// ============================================
// Real-time Validation
// ============================================
document.getElementById('email').addEventListener('input', function() {
    const email = this.value.trim();
    if (email && !validateEmail(email)) {
        showError('email', 'البريد الإلكتروني غير صحيح');
    } else {
        hideError('email');
    }
});

document.getElementById('password').addEventListener('input', function() {
    const password = this.value;
    if (password && password.length < 6) {
        showError('password', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل');
    } else {
        hideError('password');
    }
});
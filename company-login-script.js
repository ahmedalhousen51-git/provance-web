// ============================================
// 🚀 PROVANCE CONTROL - نظام تسجيل الدخول للشركات
// ============================================

// ============================================
// Configuration - API Keys
// ============================================
const CONFIG = {
    // Google OAuth Client ID
    GOOGLE_CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
    
    // Facebook App ID
    FACEBOOK_APP_ID: 'YOUR_FACEBOOK_APP_ID',
    
    // للتجربة: استخدم وضع Demo
    DEMO_MODE: true,
    
    // تعطيل التسجيل التلقائي - هذا يحل المشكلة
    DISABLE_AUTO_LOGIN: true
};

// ============================================
// Elements Selection
// ============================================
const loginForm = document.getElementById('companyLoginForm');
const submitBtn = document.querySelector('.submit-btn');
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
const googleLoginBtn = document.getElementById('googleLoginBtn');
const facebookLoginBtn = document.getElementById('facebookLoginBtn');

// ============================================
// Initialize
// ============================================
window.onload = function() {
    // التحكم في التسجيل التلقائي - هذا يحل المشكلة
    if (CONFIG.DISABLE_AUTO_LOGIN) {
        console.log('🛑 التسجيل التلقائي معطل - يجب تسجيل الدخول يدوياً');
    } else {
        checkExistingSession();
    }
    
    // Initialize Social Login SDKs
    initializeGoogleLogin();
    initializeFacebookLogin();
    
    // Load saved email if "Remember Me" was checked
    loadSavedCredentials();
    
    // إضافة أنيميشن للصفحة
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.8s ease';
        document.body.style.opacity = '1';
    }, 100);
};

// ============================================
// Check Existing Session (معدل - يحل المشكلة)
// ============================================
function checkExistingSession() {
    const currentCompany = localStorage.getItem('currentCompany');
    if (currentCompany) {
        console.log('🔍 تم العثور على جلسة نشطة، يتم التوجيه...');
        setTimeout(() => {
            window.location.href = 'company-dashboard.html';
        }, 100);
    }
}

// ============================================
// Load Saved Credentials
// ============================================
function loadSavedCredentials() {
    const savedEmail = localStorage.getItem('savedEmail');
    const rememberMe = localStorage.getItem('rememberMe');
    
    if (savedEmail && rememberMe === 'true') {
        document.getElementById('email').value = savedEmail;
        document.getElementById('rememberMe').checked = true;
    }
}

// ============================================
// Google Login Setup
// ============================================
function initializeGoogleLogin() {
    if (CONFIG.DEMO_MODE) {
        console.log('%c🔵 Google Login: Demo Mode Active', 'color: #4285F4; font-weight: bold;');
        return;
    }
    
    // تحميل Google Identity Services
    if (typeof google !== 'undefined') {
        google.accounts.id.initialize({
            client_id: CONFIG.GOOGLE_CLIENT_ID,
            callback: handleGoogleResponse,
            auto_select: false,
            cancel_on_tap_outside: true
        });
    }
}

function handleGoogleResponse(response) {
    console.log('Google ID Token:', response.credential);
    
    // فك تشفير Token للحصول على بيانات المستخدم
    const userInfo = parseJwt(response.credential);
    console.log('User Info:', userInfo);
    
    // إنشاء شركة من بيانات Google
    const company = {
        id: Date.now(),
        companyName: userInfo.name,
        email: userInfo.email,
        companyField: 'تكنولوجيا المعلومات',
        logo: userInfo.picture,
        registrationDate: new Date().toISOString(),
        loginMethod: 'google',
        status: 'active'
    };
    
    // حفظ الشركة
    saveCompanySession(company);
    
    showSuccessNotification(`مرحباً ${userInfo.name}! تم تسجيل الدخول بنجاح`);
    
    setTimeout(() => {
        window.location.href = 'company-dashboard.html';
    }, 1500);
}

// ============================================
// Facebook Login Setup
// ============================================
function initializeFacebookLogin() {
    if (CONFIG.DEMO_MODE) {
        console.log('%c🔵 Facebook Login: Demo Mode Active', 'color: #1877F2; font-weight: bold;');
        return;
    }
    
    // تهيئة Facebook SDK
    window.fbAsyncInit = function() {
        FB.init({
            appId: CONFIG.FACEBOOK_APP_ID,
            cookie: true,
            xfbml: true,
            version: 'v18.0'
        });
        
        FB.AppEvents.logPageView();
    };
}

function handleFacebookResponse(response) {
    console.log('Facebook Response:', response);
    
    if (response.status === 'connected') {
        // الحصول على معلومات المستخدم
        FB.api('/me', { fields: 'name,email,picture' }, function(userInfo) {
            console.log('Facebook User Info:', userInfo);
            
            // إنشاء شركة من بيانات Facebook
            const company = {
                id: Date.now(),
                companyName: userInfo.name,
                email: userInfo.email || `facebook_${userInfo.id}@provance.com`,
                companyField: 'تكنولوجيا المعلومات',
                logo: userInfo.picture.data.url,
                registrationDate: new Date().toISOString(),
                loginMethod: 'facebook',
                status: 'active'
            };
            
            // حفظ الشركة
            saveCompanySession(company);
            
            showSuccessNotification(`مرحباً ${userInfo.name}! تم تسجيل الدخول بنجاح`);
            
            setTimeout(() => {
                window.location.href = 'company-dashboard.html';
            }, 1500);
        });
    } else {
        showErrorNotification('فشل تسجيل الدخول عبر Facebook');
    }
}

// ============================================
// Google Login Button Click
// ============================================
googleLoginBtn.addEventListener('click', function() {
    const originalHTML = this.innerHTML;
    this.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>جاري التحميل...</span>';
    this.disabled = true;
    
    if (CONFIG.DEMO_MODE) {
        // وضع التجربة (Demo)
        setTimeout(() => {
            const demoCompany = {
                id: Date.now(),
                companyName: 'شركة ProVance التجريبية',
                email: 'demo.google@provance.com',
                companyField: 'تكنولوجيا المعلومات',
                logo: 'https://ui-avatars.com/api/?name=ProVance&background=00D9FF&color=fff&size=200',
                registrationDate: new Date().toISOString(),
                loginMethod: 'google-demo',
                status: 'active',
                primaryPhone: '+966500000000',
                inquiryEmail: 'info@provance.com',
                companyLocation: 'الرياض، السعودية',
                website: 'https://provance.com'
            };
            
            // حفظ الشركة
            saveCompanySession(demoCompany);
            
            showSuccessNotification(`مرحباً ${demoCompany.companyName}! تم تسجيل الدخول بنجاح (وضع تجريبي)`);
            
            setTimeout(() => {
                window.location.href = 'company-dashboard.html';
            }, 1500);
        }, 1500);
    } else {
        // الوضع الحقيقي
        if (typeof google !== 'undefined') {
            google.accounts.id.prompt((notification) => {
                if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                    this.innerHTML = originalHTML;
                    this.disabled = false;
                    showErrorNotification('تم إلغاء تسجيل الدخول');
                }
            });
        } else {
            showErrorNotification('خطأ في تحميل Google Login');
            this.innerHTML = originalHTML;
            this.disabled = false;
        }
    }
});

// ============================================
// Facebook Login Button Click (محفوظ كما هو)
// ============================================
facebookLoginBtn.addEventListener('click', function() {
    const originalHTML = this.innerHTML;
    this.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>جاري التحميل...</span>';
    this.disabled = true;
    
    if (CONFIG.DEMO_MODE) {
        // وضع التجربة (Demo)
        setTimeout(() => {
            const demoCompany = {
                id: Date.now(),
                companyName: 'شركة Facebook التجريبية',
                email: 'demo.facebook@provance.com',
                companyField: 'التسويق الرقمي',
                logo: 'https://ui-avatars.com/api/?name=Facebook+Company&background=1877F2&color=fff&size=200',
                registrationDate: new Date().toISOString(),
                loginMethod: 'facebook-demo',
                status: 'active',
                primaryPhone: '+966500000001',
                inquiryEmail: 'contact@facebook-demo.com',
                companyLocation: 'جدة، السعودية',
                website: 'https://facebook-demo.com'
            };
            
            // حفظ الشركة
            saveCompanySession(demoCompany);
            
            showSuccessNotification(`مرحباً ${demoCompany.companyName}! تم تسجيل الدخول بنجاح (وضع تجريبي)`);
            
            setTimeout(() => {
                window.location.href = 'company-dashboard.html';
            }, 1500);
        }, 1500);
    } else {
        // الوضع الحقيقي
        if (typeof FB !== 'undefined') {
            FB.login(handleFacebookResponse, {
                scope: 'public_profile,email',
                return_scopes: true
            });
        } else {
            showErrorNotification('خطأ في تحميل Facebook Login');
            this.innerHTML = originalHTML;
            this.disabled = false;
        }
    }
});

// ============================================
// Save Company Session
// ============================================
function saveCompanySession(company) {
    // حفظ الشركة الحالية
    localStorage.setItem('currentCompany', JSON.stringify(company));
    
    // إضافة الشركة إلى قائمة الشركات المسجلة إذا لم تكن موجودة
    let companies = JSON.parse(localStorage.getItem('companies') || '[]');
    
    const existingIndex = companies.findIndex(c => c.email === company.email);
    
    if (existingIndex === -1) {
        // شركة جديدة
        companies.push(company);
    } else {
        // تحديث بيانات الشركة الموجودة
        companies[existingIndex] = { ...companies[existingIndex], ...company };
    }
    
    localStorage.setItem('companies', JSON.stringify(companies));
    
    console.log('✅ Company session saved:', company.companyName);
    return true;
}

// ============================================
// Toggle Password Visibility
// ============================================
togglePassword.addEventListener('click', function() {
    const type = passwordInput.getAttribute('type');
    
    if (type === 'password') {
        passwordInput.setAttribute('type', 'text');
        this.innerHTML = '<i class="fas fa-eye-slash"></i>';
        this.style.color = '#00D9FF';
    } else {
        passwordInput.setAttribute('type', 'password');
        this.innerHTML = '<i class="fas fa-eye"></i>';
        this.style.color = '';
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
    
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
    
    inputElement.style.borderColor = 'var(--error-color)';
    inputElement.style.animation = 'shake 0.5s';
    
    setTimeout(() => {
        inputElement.style.animation = '';
    }, 500);
}

function hideError(inputId) {
    const errorElement = document.getElementById(inputId + 'Error');
    const inputElement = document.getElementById(inputId);
    
    if (errorElement) {
        errorElement.classList.remove('show');
    }
    
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
// Form Submit (Email/Password)
// ============================================
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Clear previous errors
    hideError('email');
    hideError('password');
    
    let isValid = true;
    
    // Validate email
    if (!email) {
        showError('email', 'البريد الإلكتروني مطلوب');
        isValid = false;
    } else if (!validateEmail(email)) {
        showError('email', 'البريد الإلكتروني غير صحيح');
        isValid = false;
    }
    
    // Validate password
    if (!password) {
        showError('password', 'كلمة المرور مطلوبة');
        isValid = false;
    } else if (password.length < 6) {
        showError('password', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل');
        isValid = false;
    }
    
    if (!isValid) return;
    
    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>جاري تسجيل الدخول...</span>';
    
    // Simulate API call
    setTimeout(() => {
        // Get registered companies
        const companies = JSON.parse(localStorage.getItem('companies') || '[]');
        
        // Find company with matching email and password
        const company = companies.find(c => 
            c.email === email && c.password === password
        );
        
        if (company) {
            // Login successful
            console.log('✅ Login successful:', company.companyName);
            
            // Save current company session
            const sessionCompany = {
                ...company,
                lastLogin: new Date().toISOString()
            };
            
            saveCompanySession(sessionCompany);
            
            // Save email if remember me is checked
            if (rememberMe) {
                localStorage.setItem('savedEmail', email);
                localStorage.setItem('rememberMe', 'true');
            } else {
                localStorage.removeItem('savedEmail');
                localStorage.removeItem('rememberMe');
            }
            
            showSuccessNotification(`مرحباً بك ${company.companyName}!`);
            
            setTimeout(() => {
                window.location.href = 'company-dashboard.html';
            }, 1500);
            
        } else {
            // Login failed
            console.log('❌ Login failed: Invalid credentials');
            
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i><span>تسجيل الدخول</span>';
            
            showErrorNotification('البريد الإلكتروني أو كلمة المرور غير صحيحة');
            
            // Shake the form
            loginForm.style.animation = 'shake 0.5s';
            setTimeout(() => {
                loginForm.style.animation = '';
            }, 500);
        }
    }, 1500);
});

// ============================================
// Helper Functions
// ============================================
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('Error parsing JWT:', e);
        return null;
    }
}

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
        font-family: 'Cairo', sans-serif;
    `;
    
    notification.innerHTML = `
        <i class="fas fa-check-circle" style="font-size: 28px;"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    const animStyle = document.createElement('style');
    animStyle.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(400px); opacity: 0; }
        }
    `;
    document.head.appendChild(animStyle);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.5s ease-out';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// ============================================
// Error Notification
// ============================================
function showErrorNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 30px;
        right: 30px;
        background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
        color: white;
        padding: 20px 30px;
        border-radius: 15px;
        box-shadow: 0 15px 50px rgba(255, 107, 107, 0.5);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 15px;
        font-weight: 600;
        animation: slideInRight 0.5s ease-out;
        font-family: 'Cairo', sans-serif;
    `;
    
    notification.innerHTML = `
        <i class="fas fa-exclamation-circle" style="font-size: 28px;"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.5s ease-out';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// ============================================
// Input Focus Effects
// ============================================
const inputs = document.querySelectorAll('.input-group input');

inputs.forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.style.transform = 'translateY(-2px)';
        this.parentElement.style.transition = 'transform 0.3s ease';
        this.parentElement.style.boxShadow = '0 5px 15px rgba(0, 217, 255, 0.2)';
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.style.transform = 'translateY(0)';
        this.parentElement.style.boxShadow = '';
    });
    
    // Clear error on input
    input.addEventListener('input', function() {
        hideError(this.id);
    });
});

// ============================================
// Console Info
// ============================================
console.log('%c🚀 ProVance Login System', 'color: #00D9FF; font-size: 20px; font-weight: bold;');
console.log('%c✅ Auto-login: ' + (CONFIG.DISABLE_AUTO_LOGIN ? 'DISABLED 🛑' : 'ENABLED ✅'), 'color: ' + (CONFIG.DISABLE_AUTO_LOGIN ? '#ff6b6b' : '#51cf66') + '; font-size: 14px;');
console.log('%c🔧 Demo Mode: ' + (CONFIG.DEMO_MODE ? 'ON' : 'OFF'), 'color: #ffd700; font-size: 14px;');

// Show registered companies count (for debugging)
const companies = JSON.parse(localStorage.getItem('companies') || '[]');
console.log(`%c📊 عدد الشركات المسجلة: ${companies.length}`, 'color: #339af0; font-size: 12px;');

if (companies.length > 0) {
    console.log('%c📋 الشركات المسجلة:', 'color: #51cf66; font-size: 12px;');
    companies.forEach((c, i) => {
        console.log(`   ${i + 1}. ${c.companyName} (${c.email}) - ${c.loginMethod || 'email'}`);
    });
}
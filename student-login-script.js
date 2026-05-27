// ============================================
// Supabase Configuration
// ============================================
const SUPABASE_URL = 'https://jrwazyrdzmbcnddpxxrf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impyd2F6eXJkem1iY25kZHB4eHJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MzUyMzksImV4cCI6MjA5MjExMTIzOX0.KaZt3Xb-9zjjwlSYnCvQQVxzDgbcOxdmnpg9wsUsqQI';

// تحميل مكتبة Supabase
const supabaseScript = document.createElement('script');
supabaseScript.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
supabaseScript.onload = function() {
    window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    initApp();
};
document.head.appendChild(supabaseScript);

// ============================================
// Elements Selection
// ============================================
const loginForm = document.getElementById('studentLoginForm');
const submitBtn = document.querySelector('.submit-btn');
const togglePasswordBtn = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
const forgotPasswordLink = document.getElementById('forgotPassword');
const forgotModal = document.getElementById('forgotModal');
const closeModal = document.getElementById('closeModal');
const forgotForm = document.getElementById('forgotForm');
const modalOverlay = document.querySelector('.modal-overlay');

// ============================================
// Shake Animation
// ============================================
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    @keyframes slideInRight {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);

// ============================================
// Toggle Password Visibility
// ============================================
togglePasswordBtn.addEventListener('click', function() {
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
// Validation Functions
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
    if (inputElement) {
        inputElement.style.borderColor = 'var(--error-color)';
        inputElement.style.animation = 'shake 0.5s';
        setTimeout(() => { inputElement.style.animation = ''; }, 500);
    }
}

function hideError(inputId) {
    const errorElement = document.getElementById(inputId + 'Error');
    const inputElement = document.getElementById(inputId);
    if (errorElement) errorElement.classList.remove('show');
    if (inputElement) inputElement.style.borderColor = 'var(--border-color)';
}

// ============================================
// Notifications
// ============================================
function showSuccessNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed; top: 30px; right: 30px;
        background: linear-gradient(135deg, #51cf66 0%, #37b24d 100%);
        color: white; padding: 20px 30px; border-radius: 15px;
        box-shadow: 0 15px 50px rgba(81,207,102,0.5);
        z-index: 10000; display: flex; align-items: center;
        gap: 15px; font-weight: 600; animation: slideInRight 0.5s ease-out;
    `;
    notification.innerHTML = `<i class="fas fa-check-circle" style="font-size:28px;"></i><span>${message}</span>`;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.5s ease-out';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

function showErrorNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed; top: 30px; right: 30px;
        background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
        color: white; padding: 20px 30px; border-radius: 15px;
        box-shadow: 0 15px 50px rgba(255,107,107,0.5);
        z-index: 10000; display: flex; align-items: center;
        gap: 15px; font-weight: 600; animation: slideInRight 0.5s ease-out;
    `;
    notification.innerHTML = `<i class="fas fa-exclamation-triangle" style="font-size:28px;"></i><span>${message}</span>`;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.5s ease-out';
        setTimeout(() => notification.remove(), 500);
    }, 4000);
}

// ============================================
// Main Login Form - Supabase
// ============================================
loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    hideError('email');
    hideError('password');

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

    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    try {
        const { data, error } = await window.supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            // ترجمة رسائل الخطأ للعربية
            let errorMsg = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
            if (error.message.includes('Email not confirmed')) {
                errorMsg = 'يرجى تأكيد بريدك الإلكتروني أولاً - تحقق من inbox بتاعك';
            } else if (error.message.includes('Too many requests')) {
                errorMsg = 'محاولات كثيرة جداً، انتظر قليلاً ثم حاول مرة أخرى';
            }
            showError('email', errorMsg);
            showError('password', errorMsg);
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            return;
        }

        // نجاح تسجيل الدخول
        const user = data.user;

        // ══════════════════════════════════════════════════════════
        // 🛡️ LAYER 3: تطبيق البيانات المحفوظة من وقت التسجيل
        // دلوقتي المستخدم authenticated → UPDATE مضمون
        // ══════════════════════════════════════════════════════════
        try {
            const pendingRaw   = localStorage.getItem('pending_profile_data');
            const pendingEmail = localStorage.getItem('pending_profile_email');

            if (pendingRaw && pendingEmail && pendingEmail.toLowerCase() === email.toLowerCase()) {
                console.log('🔄 Layer 3: Applying pending registration data...');
                const p = JSON.parse(pendingRaw);

                const { error: syncErr } = await window.supabaseClient
                    .from('student')
                    .update({
                        full_name:        p.full_name        || null,
                        phone:            p.phone            || null,
                        birth_date:       p.birth_date       || null,
                        gender:           p.gender           || null,
                        photo:            p.photo            || null,
                        country:          p.country          || 'مصر',
                        city:             p.city             || null,
                        address:          p.address          || null,
                        education_level:  p.education_level  || null,
                        university:       p.university       || null,
                        faculty:          p.faculty          || null,
                        study_year:       p.study_year       || null,
                        year_of_study:    p.study_year       || null,
                        gpa:              p.gpa              || null,
                        skills:           Array.isArray(p.skills)           ? p.skills           : [],
                        interested_fields: Array.isArray(p.interested_fields) ? p.interested_fields : [],
                        linkedin:         p.linkedin         || null,
                        github:           p.github           || null,
                        portfolio:        p.portfolio        || null,
                        cv_url:           p.cv_url           || null,
                        status:           'active',
                        training_status:  'not_started',
                        updated_at:       new Date().toISOString()
                    })
                    .eq('user_id', user.id);

                if (syncErr) {
                    console.warn('Layer 3 sync failed:', syncErr.message);
                    // لو فشل UPDATE → جرب UPSERT
                    const { error: upsertErr } = await window.supabaseClient
                        .from('student')
                        .upsert({
                            user_id:          user.id,
                            full_name:        p.full_name        || email.split('@')[0],
                            email:            email,
                            phone:            p.phone            || null,
                            birth_date:       p.birth_date       || null,
                            gender:           p.gender           || null,
                            photo:            p.photo            || null,
                            country:          p.country          || 'مصر',
                            city:             p.city             || null,
                            address:          p.address          || null,
                            education_level:  p.education_level  || null,
                            university:       p.university       || null,
                            faculty:          p.faculty          || null,
                            study_year:       p.study_year       || null,
                            year_of_study:    p.study_year       || null,
                            gpa:              p.gpa              || null,
                            skills:           Array.isArray(p.skills) ? p.skills : [],
                            interested_fields: Array.isArray(p.interested_fields) ? p.interested_fields : [],
                            linkedin:         p.linkedin         || null,
                            github:           p.github           || null,
                            portfolio:        p.portfolio        || null,
                            status:           'active',
                            training_status:  'not_started',
                            updated_at:       new Date().toISOString()
                        }, { onConflict: 'user_id' });

                    if (!upsertErr) {
                        console.log('✅ Layer 3: UPSERT succeeded');
                        localStorage.removeItem('pending_profile_data');
                        localStorage.removeItem('pending_profile_email');
                    } else {
                        console.error('Layer 3 UPSERT also failed:', upsertErr.message);
                    }
                } else {
                    console.log('✅ Layer 3: Data synced successfully');
                    localStorage.removeItem('pending_profile_data');
                    localStorage.removeItem('pending_profile_email');
                }
            }
        } catch (syncEx) {
            console.warn('Layer 3 sync exception:', syncEx.message);
        }

        // جيب اسم المستخدم من جدول student (الاسم الصح)
        const { data: studentData } = await window.supabaseClient
            .from('student')
            .select('full_name')
            .eq('user_id', user.id)
            .single();

        const userName = studentData?.full_name || user.email.split('@')[0];

        localStorage.setItem('userType', 'student');
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userName', userName);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userId', user.id);
        if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
        } else {
            localStorage.removeItem('rememberMe');
        }

        showSuccessNotification(`أهلاً ${userName}! تم تسجيل الدخول بنجاح 🎉`);
        setTimeout(() => {
            window.location.href = 'student-internship.html';
        }, 1500);

    } catch (err) {
        showErrorNotification('حدث خطأ في الاتصال، تحقق من الإنترنت وحاول مرة أخرى');
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
});

// ============================================
// Forgot Password - Supabase
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

forgotForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const resetEmail = document.getElementById('resetEmail').value.trim();

    if (!resetEmail || !validateEmail(resetEmail)) {
        alert('الرجاء إدخال بريد إلكتروني صحيح');
        return;
    }

    const modalBtn = this.querySelector('.modal-btn');
    const originalText = modalBtn.textContent;
    modalBtn.textContent = 'جاري الإرسال...';
    modalBtn.disabled = true;

    try {
        const { error } = await window.supabaseClient.auth.resetPasswordForEmail(resetEmail, {
            redirectTo: window.location.origin + '/student-login.html'
        });

        if (error) {
            alert('حدث خطأ، تحقق من البريد الإلكتروني وحاول مرة أخرى');
        } else {
            alert('✅ تم إرسال رابط إعادة تعيين كلمة المرور لبريدك الإلكتروني');
            closeForgotModal();
        }
    } catch (err) {
        alert('حدث خطأ في الاتصال');
    }

    modalBtn.textContent = originalText;
    modalBtn.disabled = false;
});

// ============================================
// Init App
// ============================================
function initApp() {
    checkLoginStatus();
    loadRememberedUser();
}

function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        window.location.href = 'student-internship.html';
    }
}

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
});

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

// ============================================
// Logout Function (للاستخدام في باقي الصفحات)
// ============================================
function logout() {
    if (window.supabaseClient) {
        window.supabaseClient.auth.signOut();
    }
    localStorage.clear();
    window.location.href = 'student-login.html';
}

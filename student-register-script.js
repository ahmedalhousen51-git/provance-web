// ============================================
// Global Variables & Configuration
// ============================================
const CONFIG = {
    totalSteps: 4,
    maxPhotoSize: 2 * 1024 * 1024, // 2MB
    minPasswordLength: 8,
    minAge: 18,
    maxAge: 30
};

let state = {
    currentStep: 1,
    studentPhotoData: null,
    formData: {},
    contractAgreed: false
};

// ============================================
// Initialize Application
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('%c🎓 ProVance Student Registration System', 'color: #00D9FF; font-size: 24px; font-weight: bold;');
    
    initializeApp();
});

function initializeApp() {
    updateProgressBar();
    updateNavigationButtons();
    attachEventListeners();
    initializeProgressDots();
    initializeDateInput();
    
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            checkPasswordStrength();
            checkPasswordMatch();
        });
    }
    
    const confirmPasswordInput = document.getElementById('confirmPassword');
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', checkPasswordMatch);
    }
    
    const contractCheckbox = document.getElementById('contractAgreement');
    if (contractCheckbox) {
        contractCheckbox.addEventListener('change', function() {
            state.contractAgreed = this.checked;
        });
    }
}

// ============================================
// Date Input with Auto-Formatting
// ============================================
function initializeDateInput() {
    const birthDateInput = document.getElementById('birthDate');
    if (!birthDateInput) return;

    birthDateInput.type = 'text';
    birthDateInput.setAttribute('inputmode', 'numeric');
    birthDateInput.setAttribute('pattern', '[0-9/]*');
    birthDateInput.setAttribute('dir', 'rtl');
    birthDateInput.placeholder = 'يوم/شهر/سنة (مثال: 15/05/2000)';

    birthDateInput.addEventListener('input', function(e) {
        formatDateInput(e.target);
        calculateAge();
    });

    birthDateInput.addEventListener('blur', calculateAge);
    
    birthDateInput.addEventListener('keypress', function(e) {
        const char = String.fromCharCode(e.keyCode || e.which);
        if (!/[\d/]/.test(char) && e.keyCode !== 8) {
            e.preventDefault();
        }
    });
}

function formatDateInput(input) {
    let value = input.value.replace(/[^0-9]/g, '');
    
    if (value.length > 2 && value.length <= 4) {
        value = value.substring(0, 2) + '/' + value.substring(2);
    } else if (value.length > 4) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4) + '/' + value.substring(4, 8);
    }
    
    input.value = value;
}

// ============================================
// Age Calculation
// ============================================
function calculateAge() {
    const birthDateInput = document.getElementById('birthDate');
    const ageDisplay = document.getElementById('ageDisplay');
    
    if (!birthDateInput || !ageDisplay) return;
    
    const birthDate = birthDateInput.value.trim();
    
    if (!birthDate) {
        ageDisplay.textContent = 'العمر: -- سنة';
        ageDisplay.className = 'age-display age-neutral';
        return;
    }
    
    let dateParts;
    if (birthDate.includes('/')) {
        dateParts = birthDate.split('/');
    } else if (birthDate.includes('-')) {
        dateParts = birthDate.split('-');
    } else {
        ageDisplay.textContent = 'العمر: -- سنة (استخدم يوم/شهر/سنة)';
        ageDisplay.className = 'age-display age-invalid';
        return;
    }
    
    if (dateParts.length === 3) {
        const day = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]);
        const year = parseInt(dateParts[2]);
        
        if (isNaN(day) || isNaN(month) || isNaN(year) || day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > new Date().getFullYear()) {
            ageDisplay.textContent = 'العمر: -- سنة (تاريخ غير صحيح)';
            ageDisplay.className = 'age-display age-invalid';
            return;
        }
        
        const birthDateObj = new Date(year, month - 1, day);
        
        if (isNaN(birthDateObj.getTime()) || birthDateObj.getDate() !== day || birthDateObj.getMonth() !== month - 1) {
            ageDisplay.textContent = 'العمر: -- سنة (تاريخ غير صحيح)';
            ageDisplay.className = 'age-display age-invalid';
            return;
        }
        
        const today = new Date();
        let age = today.getFullYear() - birthDateObj.getFullYear();
        const monthDiff = today.getMonth() - birthDateObj.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
            age--;
        }
        
        ageDisplay.textContent = `العمر: ${age} سنة`;
        
        if (age < CONFIG.minAge) {
            ageDisplay.className = 'age-display age-invalid';
        } else if (age >= CONFIG.minAge && age <= CONFIG.maxAge) {
            ageDisplay.className = 'age-display age-valid';
        } else {
            ageDisplay.className = 'age-display age-invalid';
        }
    } else {
        ageDisplay.textContent = 'العمر: -- سنة (استخدم يوم/شهر/سنة)';
        ageDisplay.className = 'age-display age-invalid';
    }
}

function calculateAgeFromDate(birthDate) {
    if (!birthDate) return 0;
    
    let dateParts;
    if (birthDate.includes('/')) {
        dateParts = birthDate.split('/');
    } else if (birthDate.includes('-')) {
        dateParts = birthDate.split('-');
    } else {
        return 0;
    }
    
    if (dateParts.length !== 3) return 0;
    
    const day = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]);
    const year = parseInt(dateParts[2]);
    
    if (isNaN(day) || isNaN(month) || isNaN(year)) return 0;
    
    const birth = new Date(year, month - 1, day);
    const today = new Date();
    
    if (isNaN(birth.getTime())) return 0;
    
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    return age;
}

// ============================================
// Event Listeners
// ============================================
function attachEventListeners() {
    const photoInput = document.getElementById('studentPhoto');
    if (photoInput) {
        photoInput.addEventListener('change', previewPhoto);
    }
    
    const form = document.getElementById('studentRegisterForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    const requiredInputs = document.querySelectorAll('input[required], select[required]');
    requiredInputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
    });
}

// ============================================
// Field Validation
// ============================================
function validateField(field) {
    const fieldId = field.id;
    const value = field.value.trim();
    
    switch (fieldId) {
        case 'fullName':
            if (!value) {
                showFieldError(field, 'الاسم الثلاثي مطلوب');
            } else {
                const nameParts = value.split(' ').filter(part => part.trim().length > 0);
                if (nameParts.length < 3) {
                    showFieldError(field, 'يرجى إدخال الاسم الثلاثي الكامل (الاسم الأول، اسم الأب، اسم الجد)');
                } else {
                    clearFieldError(field);
                }
            }
            break;
            
        case 'email':
            if (!value) {
                showFieldError(field, 'البريد الإلكتروني مطلوب');
            } else if (!validateEmail(value)) {
                showFieldError(field, 'البريد الإلكتروني غير صحيح');
            } else {
                clearFieldError(field);
            }
            break;
            
        case 'birthDate':
            if (!value) {
                showFieldError(field, 'تاريخ الميلاد مطلوب');
            } else {
                const age = calculateAgeFromDate(value);
                if (age < CONFIG.minAge || age > CONFIG.maxAge) {
                    showFieldError(field, `يجب أن يكون عمرك بين ${CONFIG.minAge} و ${CONFIG.maxAge} سنة`);
                } else {
                    clearFieldError(field);
                }
            }
            break;
            
        case 'phone':
            if (!value) {
                showFieldError(field, 'رقم الهاتف مطلوب');
            } else if (!validatePhone(value)) {
                showFieldError(field, 'رقم الهاتف غير صحيح');
            } else {
                clearFieldError(field);
            }
            break;
            
        case 'password':
            if (!value) {
                showFieldError(field, 'كلمة المرور مطلوبة');
            } else if (value.length < CONFIG.minPasswordLength) {
                showFieldError(field, `كلمة المرور يجب أن تكون ${CONFIG.minPasswordLength} أحرف على الأقل`);
            } else {
                clearFieldError(field);
            }
            break;
            
        case 'confirmPassword':
            const password = document.getElementById('password').value;
            if (!value) {
                showFieldError(field, 'تأكيد كلمة المرور مطلوب');
            } else if (value !== password) {
                showFieldError(field, 'كلمة المرور غير متطابقة');
            } else {
                clearFieldError(field);
            }
            break;
    }
}

function showFieldError(field, message) {
    let errorElement = document.getElementById(`${field.id}Error`);
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.id = `${field.id}Error`;
        errorElement.className = 'error-message';
        field.parentNode.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    errorElement.classList.add('show');
    field.classList.add('error');
}

function clearFieldError(field) {
    const errorElement = document.getElementById(`${field.id}Error`);
    if (errorElement) {
        errorElement.classList.remove('show');
    }
    field.classList.remove('error');
}

// ============================================
// Progress Management
// ============================================
function updateProgressBar() {
    const progressFill = document.getElementById('progressFill');
    const currentStepSpan = document.getElementById('currentStep');
    const totalStepsSpan = document.getElementById('totalSteps');
    
    if (progressFill) {
        const progress = (state.currentStep / CONFIG.totalSteps) * 100;
        progressFill.style.width = progress + '%';
    }
    
    if (currentStepSpan) {
        currentStepSpan.textContent = state.currentStep;
    }
    
    if (totalStepsSpan) {
        totalStepsSpan.textContent = CONFIG.totalSteps;
    }
}

function initializeProgressDots() {
    const dots = document.querySelectorAll('.progress-dot');
    dots.forEach((dot, index) => {
        dot.addEventListener('click', function() {
            const targetStep = index + 1;
            if (targetStep < state.currentStep || validateStepsUpTo(targetStep - 1)) {
                goToStep(targetStep);
            }
        });
    });
}

function updateProgressDots() {
    const dots = document.querySelectorAll('.progress-dot');
    dots.forEach((dot, index) => {
        const step = index + 1;
        dot.classList.remove('active', 'completed');
        
        if (step < state.currentStep) {
            dot.classList.add('completed');
        } else if (step === state.currentStep) {
            dot.classList.add('active');
        }
    });
}

// ============================================
// Step Navigation
// ============================================
function nextStep() {
    if (!validateCurrentStep()) {
        return;
    }
    
    if (state.currentStep < CONFIG.totalSteps) {
        state.currentStep++;
        showStep(state.currentStep);
        
        if (state.currentStep === CONFIG.totalSteps - 1) {
            generateSummary();
        }
    }
}

function previousStep() {
    if (state.currentStep > 1) {
        state.currentStep--;
        showStep(state.currentStep);
    }
}

function goToStep(step) {
    if (step >= 1 && step <= CONFIG.totalSteps) {
        state.currentStep = step;
        showStep(step);
        
        if (step === CONFIG.totalSteps - 1) {
            generateSummary();
        }
    }
}

function showStep(step) {
    document.querySelectorAll('.form-step').forEach(s => {
        s.classList.remove('active');
    });
    
    const currentStepElement = document.querySelector(`.form-step[data-step="${step}"]`);
    if (currentStepElement) {
        currentStepElement.classList.add('active');
    }
    
    updateProgressBar();
    updateNavigationButtons();
    updateProgressDots();
    
    setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
}

function updateNavigationButtons() {
    const btnPrev = document.getElementById('btnPrev');
    const btnNext = document.getElementById('btnNext');
    const btnSubmit = document.getElementById('btnSubmit');
    
    if (btnPrev) {
        if (state.currentStep === 1) {
            btnPrev.classList.add('hidden');
        } else {
            btnPrev.classList.remove('hidden');
        }
    }
    
    if (state.currentStep === CONFIG.totalSteps) {
        if (btnNext) btnNext.classList.add('hidden');
        if (btnSubmit) btnSubmit.classList.remove('hidden');
    } else {
        if (btnNext) btnNext.classList.remove('hidden');
        if (btnSubmit) btnSubmit.classList.add('hidden');
    }
}

// ============================================
// Form Validation
// ============================================
function validateCurrentStep() {
    const validators = {
        1: validateStep1,
        2: validateStep2,
        3: validateStep3,
        4: validateStep4
    };
    
    const validator = validators[state.currentStep];
    return validator ? validator() : true;
}

function validateStepsUpTo(step) {
    for (let i = 1; i <= step; i++) {
        const validators = {
            1: validateStep1,
            2: validateStep2,
            3: validateStep3,
            4: validateStep4
        };
        
        const validator = validators[i];
        if (validator && !validator(true)) {
            return false;
        }
    }
    return true;
}

function validateStep1(silent = false) {
    const fullName = getValue('fullName');
    const email = getValue('email');
    const birthDate = getValue('birthDate');
    const phone = getValue('phone');
    const address = getValue('address');
    const password = getValue('password');
    const confirmPassword = getValue('confirmPassword');
    
    if (!fullName) {
        return showError('الاسم الثلاثي مطلوب', 'يجب إدخال الاسم الثلاثي الكامل', silent);
    }
    
    const nameParts = fullName.split(' ').filter(part => part.trim().length > 0);
    if (nameParts.length < 3) {
        return showError(
            'الاسم الثلاثي غير مكتمل',
            'يجب إدخال الاسم الثلاثي الكامل (الاسم الأول، اسم الأب، اسم الجد)',
            silent
        );
    }
    
    if (!email) {
        return showError('البريد الإلكتروني مطلوب', 'يجب إدخال بريد إلكتروني صحيح', silent);
    }
    
    if (!validateEmail(email)) {
        return showError(
            'البريد الإلكتروني غير صحيح',
            'تأكد من كتابة البريد الإلكتروني بالشكل الصحيح (مثال: student@example.com)',
            silent
        );
    }
    
    if (!birthDate) {
        return showError('تاريخ الميلاد مطلوب', 'يجب إدخال تاريخ الميلاد', silent);
    }
    
    const age = calculateAgeFromDate(birthDate);
    if (age < CONFIG.minAge || age > CONFIG.maxAge) {
        return showError(
            'العمر غير مناسب',
            `يجب أن يكون عمرك بين ${CONFIG.minAge} و ${CONFIG.maxAge} سنة للتسجيل`,
            silent
        );
    }
    
    if (!phone) {
        return showError('رقم الهاتف مطلوب', 'يجب إدخال رقم هاتف صحيح', silent);
    }
    
    if (!validatePhone(phone)) {
        return showError(
            'رقم الهاتف غير صحيح',
            'يجب إدخال رقم هاتف صحيح (مثال: 0551234567)',
            silent
        );
    }
    
    if (!address) {
        return showError('مكان الإقامة مطلوب', 'يجب إدخال مكان الإقامة', silent);
    }
    
    if (!password) {
        return showError('كلمة المرور مطلوبة', 'يجب إنشاء كلمة مرور قوية لحماية حسابك', silent);
    }
    
    if (password.length < CONFIG.minPasswordLength) {
        return showError(
            'كلمة المرور ضعيفة جداً',
            `كلمة المرور يجب أن تكون ${CONFIG.minPasswordLength} أحرف على الأقل. أنت أدخلت ${password.length} أحرف فقط`,
            silent
        );
    }
    
    if (!confirmPassword) {
        return showError('تأكيد كلمة المرور مطلوب', 'يجب إعادة كتابة كلمة المرور للتأكيد', silent);
    }
    
    if (password !== confirmPassword) {
        return showError(
            'كلمة المرور غير متطابقة',
            'كلمة المرور وتأكيد كلمة المرور يجب أن يكونا متطابقين تماماً',
            silent
        );
    }
    
    return true;
}

function validateStep2(silent = false) {
    const university = getValue('university');
    const college = getValue('college');
    const level = getValue('level');
    
    if (!university) {
        return showError('الجامعة مطلوبة', 'يجب إدخال اسم الجامعة', silent);
    }
    
    if (!college) {
        return showError('الكلية مطلوبة', 'يجب إدخال اسم الكلية', silent);
    }
    
    if (!level) {
        return showError('المستوى الدراسي مطلوب', 'يجب اختيار المستوى الدراسي', silent);
    }
    
    return true;
}

function validateStep3(silent = false) {
    return true;
}

function validateStep4(silent = false) {
    const contractAgreement = document.getElementById('contractAgreement');
    
    if (!contractAgreement || !contractAgreement.checked) {
        return showError(
            'الموافقة على العقد مطلوبة',
            'يجب الموافقة على شروط وأحكام عقد استخدام منصة Provance قبل إتمام التسجيل',
            silent
        );
    }
    
    return true;
}

function showError(title, details, silent = false) {
    if (!silent) {
        showNotification(title, details, 'error');
    }
    return false;
}

// ============================================
// Helper Functions
// ============================================
function getValue(id) {
    const element = document.getElementById(id);
    return element ? element.value.trim() : '';
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[\+]?[0-9]{10,15}$/;
    return re.test(phone.replace(/\s/g, ''));
}

// ============================================
// Photo Upload
// ============================================
function previewPhoto(event) {
    const file = event.target.files[0];
    
    if (!file) return;
    
    if (file.size > CONFIG.maxPhotoSize) {
        showNotification(
            'حجم الصورة كبير جداً',
            `الحد الأقصى لحجم الصورة هو ${CONFIG.maxPhotoSize / (1024 * 1024)}MB. يرجى اختيار صورة أصغر`,
            'error'
        );
        event.target.value = '';
        return;
    }
    
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
        showNotification(
            'صيغة الملف غير مدعومة',
            'يرجى استخدام صيغة JPG أو PNG فقط للصورة',
            'error'
        );
        event.target.value = '';
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        state.studentPhotoData = e.target.result;
        
        const preview = document.getElementById('photoPreview');
        const placeholder = document.querySelector('.logo-placeholder');
        const removeBtn = document.getElementById('photoRemoveBtn');
        
        if (preview) {
            preview.src = e.target.result;
            preview.classList.add('show');
        }
        if (placeholder) placeholder.style.display = 'none';
        if (removeBtn) removeBtn.classList.remove('hidden');
    };
    
    reader.readAsDataURL(file);
}

function removePhoto(event) {
    event.stopPropagation();
    
    const preview = document.getElementById('photoPreview');
    const placeholder = document.querySelector('.logo-placeholder');
    const removeBtn = document.getElementById('photoRemoveBtn');
    const fileInput = document.getElementById('studentPhoto');
    
    if (preview) preview.classList.remove('show');
    if (placeholder) placeholder.style.display = 'block';
    if (removeBtn) removeBtn.classList.add('hidden');
    if (fileInput) fileInput.value = '';
    state.studentPhotoData = null;
}

// ============================================
// Password Functions
// ============================================
function checkPasswordStrength() {
    const password = getValue('password');
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');
    
    if (!strengthBar || !strengthText) return;
    
    let strength = 0;
    let strengthLabel = 'ضعيفة';
    
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]+/)) strength++;
    if (password.match(/[A-Z]+/)) strength++;
    if (password.match(/[0-9]+/)) strength++;
    if (password.match(/[@$!%*?&#]+/)) strength++;
    
    strengthBar.className = 'strength-bar';
    
    if (strength <= 2) {
        strengthBar.classList.add('weak');
        strengthLabel = 'ضعيفة';
    } else if (strength <= 4) {
        strengthBar.classList.add('medium');
        strengthLabel = 'متوسطة';
    } else {
        strengthBar.classList.add('strong');
        strengthLabel = 'قوية';
    }
    
    strengthText.textContent = `قوة كلمة المرور: ${strengthLabel}`;
}

function checkPasswordMatch() {
    const password = getValue('password');
    const confirmPassword = getValue('confirmPassword');
    const matchIndicator = document.getElementById('passwordMatch');
    
    if (!matchIndicator) return;
    
    if (!confirmPassword) {
        matchIndicator.textContent = '';
        matchIndicator.className = 'password-match';
        return;
    }
    
    if (password === confirmPassword) {
        matchIndicator.textContent = '✓ كلمة المرور متطابقة';
        matchIndicator.className = 'password-match match';
    } else {
        matchIndicator.textContent = '✗ كلمة المرور غير متطابقة';
        matchIndicator.className = 'password-match no-match';
    }
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    const button = input.parentElement.querySelector('.password-toggle');
    if (!button) return;
    
    const icon = button.querySelector('i');
    if (!icon) return;
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// ============================================
// Enhanced Summary Generation with Print/Download
// ============================================
function generateSummary() {
    const summaryContent = document.getElementById('summaryContent');
    if (!summaryContent) return;
    
    summaryContent.innerHTML = `
        <div class="summary-loading">
            <div class="loading-spinner"></div>
            <p>جاري تجهيز الملخص...</p>
        </div>
    `;
    
    setTimeout(() => {
        const summary = buildSummaryContent();
        summaryContent.innerHTML = summary;
        
        addPrintDownloadListeners();
    }, 500);
}

function buildSummaryContent() {
    const fullName = getValue('fullName');
    const email = getValue('email');
    const birthDate = getValue('birthDate');
    const phone = getValue('phone');
    const address = getValue('address');
    const university = getValue('university');
    const college = getValue('college');
    const major = getValue('major');
    const level = getValue('level');
    const skills = getValue('skills');
    
    const age = calculateAgeFromDate(birthDate);
    
    const levelNames = {
        '1': 'السنة الأولى',
        '2': 'السنة الثانية',
        '3': 'السنة الثالثة',
        '4': 'السنة الرابعة',
        '5': 'السنة الخامسة',
        'graduate': 'خريج'
    };
    
    return `
        <div class="summary-actions" style="margin-bottom: 20px; display: flex; gap: 10px;">
            <button onclick="printSummary()" class="btn-summary print-btn">
                <i class="fas fa-print"></i>
                <span>طباعة الملخص</span>
            </button>
            <button onclick="downloadSummary()" class="btn-summary pdf-btn">
                <i class="fas fa-file-pdf"></i>
                <span>تحميل كملف PDF</span>
            </button>
        </div>
        <div class="summary-grid">
            <div class="summary-block">
                <div class="summary-block-header">
                    <i class="fas fa-user"></i>
                    <span>المعلومات الشخصية</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">الاسم الثلاثي:</span>
                    <span class="summary-value">${fullName || 'غير محدد'}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">البريد الإلكتروني:</span>
                    <span class="summary-value">${email || 'غير محدد'}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">العمر:</span>
                    <span class="summary-value">${age} سنة</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">رقم الهاتف:</span>
                    <span class="summary-value">${phone || 'غير محدد'}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">مكان الإقامة:</span>
                    <span class="summary-value">${address || 'غير محدد'}</span>
                </div>
            </div>
            
            <div class="summary-block">
                <div class="summary-block-header">
                    <i class="fas fa-graduation-cap"></i>
                    <span>المعلومات الأكاديمية</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">الجامعة:</span>
                    <span class="summary-value">${university || 'غير محدد'}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">الكلية:</span>
                    <span class="summary-value">${college || 'غير محدد'}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">التخصص:</span>
                    <span class="summary-value">${major || 'غير محدد'}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">المستوى الدراسي:</span>
                    <span class="summary-value">${levelNames[level] || 'غير محدد'}</span>
                </div>
            </div>
            
            ${skills ? `
            <div class="summary-block">
                <div class="summary-block-header">
                    <i class="fas fa-tools"></i>
                    <span>المهارات</span>
                </div>
                <div class="summary-list">${skills}</div>
            </div>
            ` : ''}
            
            ${state.studentPhotoData ? `
            <div class="summary-block">
                <div class="summary-block-header">
                    <i class="fas fa-camera"></i>
                    <span>الصورة الشخصية</span>
                </div>
                <div style="text-align: center; padding: 20px;">
                    <img src="${state.studentPhotoData}" alt="الصورة الشخصية" style="width: 150px; height: 150px; border-radius: 50%; object-fit: cover; border: 3px solid var(--primary);">
                </div>
            </div>
            ` : ''}
        </div>
    `;
}

function addPrintDownloadListeners() {
    // سيتم إضافة المستمعين في الدوال التالية
}

function printSummary() {
    showNotification('الطباعة', 'سيتم فتح نافذة الطباعة قريباً', 'info');
    setTimeout(() => {
        const printContent = document.getElementById('summaryContent').innerHTML;
        const originalContent = document.body.innerHTML;
        
        document.body.innerHTML = `
            <div style="direction: rtl; text-align: right; padding: 20px; font-family: 'Cairo', sans-serif;">
                <h1 style="text-align: center; color: #00D9FF; margin-bottom: 30px;">ملخص تسجيل الطالب - ProVance</h1>
                ${printContent}
                <div style="margin-top: 40px; text-align: center; color: #666; font-size: 12px;">
                    <p>تم إنشاء هذا الملخص في ${new Date().toLocaleDateString('ar-SA')}</p>
                    <p>ProVance © ${new Date().getFullYear()} جميع الحقوق محفوظة</p>
                </div>
            </div>
        `;
        
        window.print();
        document.body.innerHTML = originalContent;
        location.reload();
    }, 500);
}

function downloadSummary() {
    showNotification('التحميل', 'جاري تحضير الملف للتحميل...', 'info');
    setTimeout(() => {
        showNotification('تم التحضير', 'الملف جاهز للتحميل', 'success');
        
        const summaryData = `
            ملخص تسجيل الطالب - ProVance
            ==============================
            
            المعلومات الشخصية:
            ----------------
            الاسم الثلاثي: ${getValue('fullName')}
            البريد الإلكتروني: ${getValue('email')}
            العمر: ${calculateAgeFromDate(getValue('birthDate'))} سنة
            رقم الهاتف: ${getValue('phone')}
            مكان الإقامة: ${getValue('address')}
            
            المعلومات الأكاديمية:
            ------------------
            الجامعة: ${getValue('university')}
            الكلية: ${getValue('college')}
            التخصص: ${getValue('major')}
            المستوى الدراسي: ${getValue('level')}
            
            المهارات: ${getValue('skills') || 'غير محدد'}
            
            تاريخ التسجيل: ${new Date().toLocaleString('ar-SA')}
            
            ProVance © ${new Date().getFullYear()}
        `;
        
        const blob = new Blob([summaryData], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `summary-provanance-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }, 2000);
}

// ============================================
// Student Contract Functions
// ============================================
function showContractDetails() {
    showNotification(
        'تفاصيل العقد',
        'جاري تحميل التفاصيل الكاملة للعقد...',
        'info'
    );
    
    const contractContent = `
        <div style="direction: rtl; text-align: right; padding: 20px; max-width: 800px; margin: 0 auto;">
            <h2 style="color: #00D9FF; text-align: center; margin-bottom: 30px;">عقد استخدام منصة ProVance للطلاب</h2>
            
            <div style="margin-bottom: 25px;">
                <h3 style="color: #333; margin-bottom: 15px;">المادة 1: التعريفات</h3>
                <p style="line-height: 1.8; color: #555;">
                    1.1 "المنصة": تشير إلى منصة ProVance الإلكترونية للتسجيل في برامج التدريب.
                    <br>1.2 "الطالب": أي شخص مسجل في المنصة بصفة طالب أو متدرب.
                    <br>1.3 "الحساب": الملف الشخصي للطالب على المنصة.
                </p>
            </div>
            
            <div style="margin-bottom: 25px;">
                <h3 style="color: #333; margin-bottom: 15px;">المادة 2: التسجيل والحساب</h3>
                <p style="line-height: 1.8; color: #555;">
                    2.1 يلتزم الطالب بتقديم معلومات دقيقة وصحيحة عند التسجيل.
                    <br>2.2 الطالب مسؤول عن الحفاظ على سرية بيانات حسابه.
                    <br>2.3 يحق للمنصة تعليق أو إلغاء الحساب في حال اكتشاف معلومات غير صحيحة.
                </p>
            </div>
            
            <div style="margin-bottom: 25px;">
                <h3 style="color: #333; margin-bottom: 15px;">المادة 3: الالتزامات</h3>
                <p style="line-height: 1.8; color: #555;">
                    3.1 يلتزم الطالب بالسلوك المهني والأخلاقي خلال استخدام المنصة.
                    <br>3.2 الالتزام بمواعيد المقابلات والتدريبات التي يتم ترشيحه لها.
                    <br>3.3 تقديم ملاحظات وتقييمات صادقة عن تجربة التدريب.
                </p>
            </div>
            
            <div style="margin-bottom: 25px;">
                <h3 style="color: #333; margin-bottom: 15px;">المادة 4: الخصوصية والبيانات</h3>
                <p style="line-height: 1.8; color: #555;">
                    4.1 تحترم المنصة خصوصية البيانات الشخصية للطالب.
                    <br>4.2 يتم مشاركة البيانات فقط مع الشركات التي يتقدم لها الطالب.
                    <br>4.3 للمنصة الحق في استخدام البيانات المجمعة لأغراض إحصائية وتحليلية.
                </p>
            </div>
            
            <div style="margin-bottom: 25px;">
                <h3 style="color: #333; margin-bottom: 15px;">المادة 5: الرسوم والدفع</h3>
                <p style="line-height: 1.8; color: #555;">
                    5.1 التسجيل في المنصة مجاني للطلاب.
                    <br>5.2 قد تتطلب بعض برامج التدريب رسومًا خاصة يتم توضيحها مسبقًا.
                    <br>5.3 يتم تحصيل الرسوم من خلال قنوات الدفع المعتمدة.
                </p>
            </div>
            
            <div style="margin-bottom: 25px;">
                <h3 style="color: #333; margin-bottom: 15px;">المادة 6: إلغاء الحساب</h3>
                <p style="line-height: 1.8; color: #555;">
                    6.1 يحق للطالب إلغاء حسابه في أي وقت.
                    <br>6.2 يحق للمنصة إلغاء الحساب في حالة مخالفة شروط الاستخدام.
                    <br>6.3 يتم الاحتفاظ بالبيانات لمدة 6 أشهر بعد الإلغاء لأغراض أرشيفية.
                </p>
            </div>
            
            <div style="margin-bottom: 25px;">
                <h3 style="color: #333; margin-bottom: 15px;">المادة 7: المسؤولية</h3>
                <p style="line-height: 1.8; color: #555;">
                    7.1 المنصة غير مسؤولة عن قرارات التوظيف للشركات.
                    <br>7.2 المنصة وسيط فقط بين الطلاب والشركات.
                    <br>7.3 الطالب مسؤول عن قراراته المهنية.
                </p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; border-right: 4px solid #00D9FF;">
                <h4 style="color: #00D9FF; margin-bottom: 15px;">التواصل والشكاوى</h4>
                <p style="line-height: 1.8; color: #555;">
                    للاستفسارات أو تقديم شكوى، يرجى التواصل عبر:
                    <br>📧 البريد الإلكتروني: support@provance.com
                    <br>📞 الهاتف: +966 123 456 789
                    <br>🕒 ساعات العمل: من الأحد إلى الخميس، 9 صباحًا - 5 مساءً
                </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #666; font-size: 14px;">
                    تاريخ آخر تحديث: 1 يناير 2024
                    <br>ProVance © ${new Date().getFullYear()} جميع الحقوق محفوظة
                </p>
            </div>
        </div>
    `;
    
    const popup = window.open('', 'عقد ProVance', 'width=900,height=700,scrollbars=yes');
    popup.document.write(`
        <html dir="rtl">
        <head>
            <title>عقد استخدام ProVance</title>
            <style>
                body { font-family: 'Cairo', sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
                .contract-content { background: white; border-radius: 10px; padding: 30px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
                .print-btn { background: #00D9FF; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin: 20px auto; display: block; }
            </style>
        </head>
        <body>
            <div class="contract-content">${contractContent}</div>
            <button class="print-btn" onclick="window.print()">🖨️ طباعة العقد</button>
        </body>
        </html>
    `);
}

// ============================================
// Form Submission
// ============================================
function handleFormSubmit(event) {
    event.preventDefault();
    
    if (!validateCurrentStep()) {
        return;
    }
    
    const formData = {
        personalInfo: {
            fullName: getValue('fullName'),
            email: getValue('email'),
            birthDate: getValue('birthDate'),
            age: calculateAgeFromDate(getValue('birthDate')),
            phone: getValue('phone'),
            address: getValue('address'),
            photo: state.studentPhotoData
        },
        academicInfo: {
            university: getValue('university'),
            college: getValue('college'),
            major: getValue('major'),
            level: getValue('level'),
            skills: getValue('skills')
        },
        contract: {
            agreed: state.contractAgreed,
            agreedAt: new Date().toISOString()
        }
    };
    
    state.formData = formData;
    
    showSuccessAnimation();
    
    console.log('Student Form Data:', formData);
}

function showSuccessAnimation() {
    const submitBtn = document.getElementById('btnSubmit');
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>جاري التسجيل...</span>';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            submitBtn.innerHTML = '<i class="fas fa-check"></i> <span>تم التسجيل بنجاح!</span>';
            submitBtn.classList.add('success');
            
            showNotification(
                'تم التسجيل بنجاح!',
                'تم تسجيل حسابك في منصة ProVance بنجاح. سيتم التواصل معكم خلال 24 ساعة لتأكيد الحساب',
                'success'
            );
            
            setTimeout(() => {
                localStorage.removeItem('provance_student_registration_state');
            }, 1000);
            
            setTimeout(() => {
                window.location.href = 'student-internship.html';
            }, 2000);
        }, 1500);
    }
}

// ============================================
// Enhanced Notification System
// ============================================
function showNotification(title, message, type = 'info') {
    let container = document.querySelector('.notification-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'notification-container';
        document.body.appendChild(container);
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    const colors = {
        success: 'var(--success)',
        error: 'var(--error)',
        warning: 'var(--warning)',
        info: 'var(--info)'
    };
    
    notification.innerHTML = `
        <button class="notification-close" onclick="this.parentElement.classList.add('hide'); setTimeout(() => this.parentElement.remove(), 300)">
            <i class="fas fa-times"></i>
        </button>
        <div class="notification-header">
            <div class="notification-icon">
                <i class="${icons[type]}"></i>
            </div>
            <h4 class="notification-title">${title}</h4>
        </div>
        <div class="notification-body">${message}</div>
        <div class="notification-progress">
            <div class="notification-progress-bar" style="background: ${colors[type]}"></div>
        </div>
    `;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.add('hide');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

// ============================================
// Enhanced Styles Injection
// ============================================
const style = document.createElement('style');
style.textContent = `
    .not-decided-option {
        color: var(--text-muted);
        font-style: italic;
    }
    
    input.error {
        border-color: var(--error) !important;
    }
    
    .error-message {
        display: none;
        color: var(--error);
        font-size: 0.85rem;
        margin-top: 5px;
    }
    
    .error-message.show {
        display: block;
    }
    
    .age-neutral {
        background: rgba(107, 114, 128, 0.1);
        color: var(--text-muted);
    }
    
    .age-valid {
        background: rgba(16, 185, 129, 0.1);
        color: var(--success);
    }
    
    .age-invalid {
        background: rgba(239, 68, 68, 0.1);
        color: var(--error);
    }
    
    .btn-summary {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 16px 24px;
        border: none;
        border-radius: 16px;
        font-weight: 700;
        font-size: 1.1rem;
        cursor: pointer;
        transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        position: relative;
        overflow: hidden;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        min-height: 60px;
        flex: 1;
    }
    
    .btn-summary::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        transition: left 0.6s ease;
    }
    
    .btn-summary:hover::before {
        left: 100%;
    }
    
    .btn-summary:hover {
        transform: translateY(-4px) scale(1.02);
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.25);
    }
    
    .btn-summary:active {
        transform: translateY(-2px) scale(1.01);
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
    }
    
    .print-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: 2px solid rgba(255, 255, 255, 0.2);
    }
    
    .print-btn:hover {
        background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
        box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
    }
    
    .pdf-btn {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;
        border: 2px solid rgba(255, 255, 255, 0.2);
    }
    
    .pdf-btn:hover {
        background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%);
        box-shadow: 0 15px 35px rgba(245, 87, 108, 0.4);
    }
    
    .btn-summary i {
        font-size: 1.4rem;
        transition: transform 0.3s ease;
    }
    
    .btn-summary:hover i {
        transform: scale(1.2) rotate(-5deg);
    }
    
    .btn-summary span {
        position: relative;
        z-index: 2;
    }
    
    .contract-box {
        background: linear-gradient(135deg, var(--secondary) 0%, var(--accent) 100%);
        color: white;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 20px;
        border: 2px solid rgba(255, 255, 255, 0.2);
    }
    
    .contract-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 15px;
    }
    
    .contract-header i {
        font-size: 1.5rem;
    }
    
    .contract-content {
        line-height: 1.8;
        font-size: 0.95rem;
        margin-bottom: 20px;
    }
    
    .contract-terms {
        background: rgba(255, 255, 255, 0.1);
        padding: 15px;
        border-radius: 8px;
        margin: 15px 0;
    }
    
    .contract-terms ul {
        margin: 0;
        padding-right: 20px;
    }
    
    .contract-terms li {
        margin-bottom: 8px;
        color: rgba(255, 255, 255, 0.9);
    }
    
    .contract-link {
        color: var(--warning);
        text-decoration: none;
        font-weight: bold;
        border-bottom: 1px dashed var(--warning);
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .contract-link:hover {
        color: white;
        border-bottom: 1px solid white;
    }
    
    .contract-checkbox {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        margin-top: 15px;
    }
    
    .contract-checkbox input[type="checkbox"] {
        margin-top: 3px;
    }
    
    .contract-checkbox label {
        flex: 1;
        font-size: 0.9rem;
        line-height: 1.5;
        color: var(--text-secondary);
    }
    
    @media (min-width: 768px) {
        .summary-actions {
            gap: 20px;
        }
        
        .btn-summary {
            padding: 18px 28px;
            font-size: 1.2rem;
        }
        
        .contract-box {
            padding: 30px;
        }
    }
    
    @media (max-width: 480px) {
        .summary-actions {
            flex-direction: column;
        }
        
        .btn-summary {
            min-height: 55px;
        }
        
        .contract-box {
            padding: 15px;
        }
    }
    
    .success {
        background: var(--gradient-success) !important;
    }
`;
document.head.appendChild(style);

// ============================================
// Export Functions to Global Scope
// ============================================
window.removePhoto = removePhoto;
window.togglePassword = togglePassword;
window.nextStep = nextStep;
window.previousStep = previousStep;
window.goToStep = goToStep;
window.printSummary = printSummary;
window.downloadSummary = downloadSummary;
window.showContractDetails = showContractDetails;
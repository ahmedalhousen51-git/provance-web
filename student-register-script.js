/**
 * student-register-script.js
 * ─────────────────────────────────────────────────────────────
 * UTILITY-ONLY — لا يحتوي على event listeners أو submit handler أو navigation.
 * كل منطق الـ navigation والـ submit موجود بالكامل داخل student-register.html
 * (inline IIFE). الملف ده بيوفر فقط helper functions للـ HTML يستخدمها.
 * ─────────────────────────────────────────────────────────────
 */

// ============================================
// Config (يُقرأ من HTML - هنا للمرجعية فقط)
// ============================================
const REGISTER_CONFIG = {
    maxPhotoSize: 2 * 1024 * 1024, // 2MB
    minPasswordLength: 8,
    minAge: 14,
    maxAge: 80
};

// ============================================
// Age Calculation Helpers
// ============================================
function calculateAgeFromDate(birthDate) {
    if (!birthDate) return 0;
    const b = new Date(birthDate);
    const t = new Date();
    if (isNaN(b.getTime())) return 0;
    let age = t.getFullYear() - b.getFullYear();
    const m = t.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && t.getDate() < b.getDate())) age--;
    return age;
}

// ============================================
// Validation Helpers
// ============================================
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

function validatePhone(phone) {
    const clean = String(phone || '').replace(/[\s\-+]/g, '');
    return /^(01[0125]\d{8}|201[0125]\d{8})$/.test(clean);
}

// ============================================
// Password Strength
// ============================================
function checkPasswordStrength() {
    const passwordInput = document.getElementById('password');
    const strengthFill  = document.getElementById('strengthFill');
    const strengthText  = document.getElementById('strengthText');
    if (!passwordInput) return;

    const password = passwordInput.value;
    let score = 0;
    if (password.length >= 8)                           score++;
    if (password.length >= 12)                          score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password))                         score++;
    if (/[^A-Za-z0-9]/.test(password))                  score++;

    const levels = ['', 'weak', 'weak', 'medium', 'medium', 'strong'];
    const labels = { weak: 'ضعيفة', medium: 'متوسطة', strong: 'قوية ✓' };
    const level  = levels[Math.min(score, 5)] || 'weak';

    if (strengthFill) {
        strengthFill.className = 'strength-fill ' + level;
    }
    if (strengthText) {
        strengthText.textContent = password ? 'قوة كلمة المرور: ' + (labels[level] || '') : '';
        strengthText.style.color = level === 'strong' ? 'var(--success)'
                                 : level === 'medium' ? '#f59e0b'
                                 : 'var(--error)';
    }
}

function checkPasswordMatch() {
    const pass     = document.getElementById('password')?.value || '';
    const confirm  = document.getElementById('confirmPassword')?.value || '';
    const matchEl  = document.getElementById('passwordMatch');
    if (!matchEl) return;

    if (!confirm) { matchEl.textContent = ''; matchEl.className = 'password-match'; return; }

    if (pass === confirm) {
        matchEl.textContent = '✓ كلمتا المرور متطابقتان';
        matchEl.className   = 'password-match match';
    } else {
        matchEl.textContent = '✗ كلمتا المرور غير متطابقتين';
        matchEl.className   = 'password-match no-match';
    }
}

// ============================================
// Age Display (called by HTML on birthDate change)
// ============================================
function updateAgeDisplay(birthDate) {
    const display = document.getElementById('ageDisplay');
    if (!display) return;
    if (!birthDate) { display.textContent = ''; return; }
    const age = calculateAgeFromDate(birthDate);
    if (age <= 0 || age > 100) {
        display.textContent = 'تاريخ غير صحيح';
        display.className   = 'age-display age-invalid';
    } else {
        display.textContent = 'العمر: ' + age + ' سنة';
        display.className   = 'age-display ' + (age >= 14 && age <= 80 ? 'age-valid' : 'age-invalid');
    }
}

// ============================================
// Photo Upload (called by HTML onclick)
// ============================================
window.removePhoto = function() {
    window._photoBase64 = null;
    const input = document.getElementById('studentPhoto');
    if (input) input.value = '';
    const circle  = document.getElementById('photoCircle');
    const btn     = document.getElementById('photoRemoveBtn');
    if (circle) circle.innerHTML = `
        <i class="fas fa-camera" id="photoIcon"></i>
        <div class="photo-circle-overlay"><i class="fas fa-cloud-upload-alt"></i></div>`;
    if (btn) btn.classList.add('hidden');
};

// ============================================
// Toggle Password Visibility
// ============================================
window.togglePassword = function(inputId) {
    const inp = document.getElementById(inputId);
    if (!inp) return;
    const btn  = inp.parentElement?.querySelector('.password-toggle');
    const icon = btn?.querySelector('i');
    if (inp.type === 'password') {
        inp.type = 'text';
        if (icon) { icon.classList.replace('fa-eye', 'fa-eye-slash'); }
    } else {
        inp.type = 'password';
        if (icon) { icon.classList.replace('fa-eye-slash', 'fa-eye'); }
    }
};

// ============================================
// Attach helpers to password inputs (safe – no submit)
// ============================================
document.addEventListener('DOMContentLoaded', function () {
    const passInp    = document.getElementById('password');
    const confirmInp = document.getElementById('confirmPassword');
    const photoInp   = document.getElementById('studentPhoto');

    if (passInp) {
        passInp.addEventListener('input', function () {
            checkPasswordStrength();
            checkPasswordMatch();
        });
    }
    if (confirmInp) {
        confirmInp.addEventListener('input', checkPasswordMatch);
    }

    // Photo upload → compress → store in window._photoBase64
    if (photoInp) {
        photoInp.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (!file) return;
            if (file.size > REGISTER_CONFIG.maxPhotoSize) {
                if (window.ProVance?.showToast) window.ProVance.showToast('الحجم أكبر من 2 ميجا', 'error');
                e.target.value = '';
                return;
            }
            const reader = new FileReader();
            reader.onload = function (ev) {
                const img = new Image();
                img.onload = function () {
                    const MAX = 400;
                    let w = img.width, h = img.height;
                    if (w > h) { if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; } }
                    else       { if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; } }
                    const canvas = document.createElement('canvas');
                    canvas.width = w; canvas.height = h;
                    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                    const compressed = canvas.toDataURL('image/jpeg', 0.8);

                    // Store globally so the HTML submit handler can read it
                    window._photoBase64 = compressed;

                    const circle = document.getElementById('photoCircle');
                    const btn    = document.getElementById('photoRemoveBtn');
                    if (circle) {
                        circle.innerHTML = `
                            <img src="${compressed}" alt="Photo" style="width:100%;height:100%;object-fit:cover;border-radius:50%">
                            <div class="photo-circle-overlay"><i class="fas fa-cloud-upload-alt"></i></div>`;
                    }
                    if (btn) btn.classList.remove('hidden');
                };
                img.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        });
    }
});

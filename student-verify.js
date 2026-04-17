// ============================================
// Elements Selection
// ============================================
const verificationForm = document.getElementById('verificationForm');
const submitBtn = document.querySelector('.submit-btn');
const codeDigits = document.querySelectorAll('.code-digit');
const resendCodeLink = document.getElementById('resendCode');
const resendTimer = document.getElementById('resendTimer');
const countdownElement = document.getElementById('countdown');
const demoCodeElement = document.getElementById('demoCode');
const userEmailElement = document.getElementById('userEmail');

// ============================================
// Generate Demo Verification Code
// ============================================
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

let verificationCode = generateVerificationCode();
let countdownTime = 10 * 60; // 10 minutes in seconds
let resendCooldown = 60; // 60 seconds cooldown for resend
let countdownInterval;
let resendInterval;

// ============================================
// Initialize Page
// ============================================
function initializePage() {
    console.log('Initializing verification page...');
    
    // Set demo code
    demoCodeElement.textContent = verificationCode;
    console.log('Demo code set to:', verificationCode);
    
    // Set user email from localStorage or default
    const userEmail = localStorage.getItem('recoveryEmail') || 'student@example.com';
    userEmailElement.textContent = userEmail;
    console.log('User email:', userEmail);
    
    // Start countdown timer
    startCountdown();
    
    // Start resend cooldown
    startResendCooldown();
    
    // Focus on first input
    codeDigits[0].focus();
    console.log('Page initialized successfully');
}

// ============================================
// Countdown Timer
// ============================================
function startCountdown() {
    clearInterval(countdownInterval);
    
    countdownInterval = setInterval(() => {
        const minutes = Math.floor(countdownTime / 60);
        const seconds = countdownTime % 60;
        
        countdownElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (countdownTime <= 0) {
            clearInterval(countdownInterval);
            showError('codeError', 'انتهت صلاحية رمز التحقق، يرجى طلب رمز جديد');
            submitBtn.disabled = true;
            countdownElement.style.color = 'var(--error-color)';
            console.log('Verification code expired');
        } else if (countdownTime <= 60) {
            countdownElement.style.color = 'var(--error-color)';
        } else if (countdownTime <= 300) {
            countdownElement.style.color = '#ffa726';
        }
        
        countdownTime--;
    }, 1000);
}

// ============================================
// Resend Cooldown
// ============================================
function startResendCooldown() {
    clearInterval(resendInterval);
    
    resendCodeLink.style.pointerEvents = 'none';
    resendCodeLink.style.opacity = '0.5';
    
    resendInterval = setInterval(() => {
        resendTimer.textContent = `(${resendCooldown} ثانية)`;
        
        if (resendCooldown <= 0) {
            clearInterval(resendInterval);
            resendCodeLink.style.pointerEvents = 'auto';
            resendCodeLink.style.opacity = '1';
            resendTimer.textContent = '';
            console.log('Resend cooldown finished');
        }
        
        resendCooldown--;
    }, 1000);
}

// ============================================
// Code Digits Management
// ============================================
function initializeCodeInputs() {
    codeDigits.forEach((digit, index) => {
        // Clear any existing event listeners
        digit.replaceWith(digit.cloneNode(true));
    });
    
    // Re-select elements after clone
    const freshCodeDigits = document.querySelectorAll('.code-digit');
    
    freshCodeDigits.forEach((digit, index) => {
        digit.addEventListener('input', function(e) {
            console.log(`Input event on digit ${index}:`, this.value);
            
            // Only allow numbers
            this.value = this.value.replace(/[^0-9]/g, '');
            
            if (this.value.length === 1) {
                // Move to next input
                if (index < freshCodeDigits.length - 1) {
                    freshCodeDigits[index + 1].focus();
                    freshCodeDigits[index + 1].select();
                } else {
                    // If last digit, try to verify automatically
                    console.log('All digits filled, attempting auto-verify');
                    setTimeout(() => {
                        if (verifyCode()) {
                            verificationForm.dispatchEvent(new Event('submit'));
                        }
                    }, 300);
                }
            }
            
            updateCodeValidation();
        });
        
        digit.addEventListener('keydown', function(e) {
            console.log(`Keydown event on digit ${index}:`, e.key);
            
            if (e.key === 'Backspace') {
                if (this.value.length === 0 && index > 0) {
                    // Move to previous input and clear it
                    freshCodeDigits[index - 1].focus();
                    freshCodeDigits[index - 1].value = '';
                    freshCodeDigits[index - 1].select();
                } else {
                    // Clear current input
                    this.value = '';
                }
                updateCodeValidation();
                e.preventDefault();
            }
            
            // Allow arrow keys for navigation
            if (e.key === 'ArrowRight' && index > 0) {
                freshCodeDigits[index - 1].focus();
                freshCodeDigits[index - 1].select();
            }
            if (e.key === 'ArrowLeft' && index < freshCodeDigits.length - 1) {
                freshCodeDigits[index + 1].focus();
                freshCodeDigits[index + 1].select();
            }
            
            // Prevent non-numeric input
            if (!/^[0-9]$/.test(e.key) && 
                !['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab', 'Delete'].includes(e.key)) {
                e.preventDefault();
            }
        });
        
        // Paste support
        digit.addEventListener('paste', function(e) {
            e.preventDefault();
            const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '');
            console.log('Pasted data:', pastedData);
            
            if (pastedData.length === 6) {
                for (let i = 0; i < 6; i++) {
                    freshCodeDigits[i].value = pastedData[i] || '';
                }
                freshCodeDigits[5].focus();
                freshCodeDigits[5].select();
                updateCodeValidation();
                
                // Auto verify after paste
                setTimeout(() => {
                    if (verifyCode()) {
                        verificationForm.dispatchEvent(new Event('submit'));
                    }
                }, 300);
            } else {
                showError('codeError', 'الرجاء لصق رمز مكون من 6 أرقام');
            }
        });
        
        // Click to select all
        digit.addEventListener('click', function() {
            this.select();
        });
        
        // Focus event
        digit.addEventListener('focus', function() {
            this.style.borderColor = 'var(--student-primary)';
            this.style.boxShadow = '0 0 0 2px rgba(102, 126, 234, 0.2)';
            this.select();
        });
        
        // Blur event
        digit.addEventListener('blur', function() {
            this.style.boxShadow = 'none';
            if (!this.value) {
                this.style.borderColor = 'var(--border-color)';
            }
        });
    });
}

function updateCodeValidation() {
    const enteredCode = Array.from(codeDigits).map(digit => digit.value).join('');
    console.log('Current code:', enteredCode);
    
    hideError('codeError');
    
    // Update input styles based on content
    codeDigits.forEach(digit => {
        if (digit.value) {
            digit.style.borderColor = 'var(--student-primary)';
            digit.style.background = 'rgba(102, 126, 234, 0.1)';
            digit.style.color = 'var(--text-primary)';
            digit.style.fontWeight = 'bold';
        } else {
            digit.style.borderColor = 'var(--border-color)';
            digit.style.background = 'var(--input-bg)';
            digit.style.color = 'var(--text-primary)';
        }
    });
    
    // Enable submit button when all digits are filled
    submitBtn.disabled = enteredCode.length !== 6;
}

// ============================================
// Form Validation
// ============================================
function showError(inputId, message) {
    const errorElement = document.getElementById(inputId);
    errorElement.textContent = message;
    errorElement.classList.add('show');
    console.log('Error shown:', message);
    
    // Shake animation for all inputs
    codeDigits.forEach(digit => {
        digit.style.animation = 'shake 0.5s';
        setTimeout(() => {
            digit.style.animation = '';
        }, 500);
    });
}

function hideError(inputId) {
    const errorElement = document.getElementById(inputId);
    errorElement.classList.remove('show');
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
    `;
    
    notification.innerHTML = `
        <i class="fas fa-check-circle" style="font-size: 28px;"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    console.log('Success notification:', message);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.5s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 500);
    }, 3000);
}

// ============================================
// Verify Code Function
// ============================================
function verifyCode() {
    const enteredCode = Array.from(codeDigits).map(digit => digit.value).join('');
    console.log('Verifying code:', enteredCode, 'against:', verificationCode);
    
    // Reset errors
    hideError('codeError');
    
    // Validate
    if (enteredCode.length !== 6) {
        showError('codeError', 'يرجى إدخال رمز التحقق المكون من 6 أرقام');
        return false;
    }
    
    if (enteredCode !== verificationCode) {
        showError('codeError', 'رمز التحقق غير صحيح، يرجى المحاولة مرة أخرى');
        console.log('Code verification failed');
        return false;
    }
    
    console.log('Code verification successful');
    return true;
}

// ============================================
// Form Submit
// ============================================
function setupFormSubmission() {
    verificationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Form submission started');
        
        if (!verifyCode()) {
            console.log('Form validation failed');
            return;
        }
        
        // Show loading
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        console.log('Showing loading state');
        
        // Simulate API call
        setTimeout(() => {
            // Show success message
            showSuccessNotification('تم التحقق بنجاح! سيتم توجيهك إلى صفحة تعيين كلمة المرور');
            
            // Redirect to reset password page
            setTimeout(() => {
                console.log('Redirecting to reset password page');
                window.location.href = 'student-reset-password.html';
            }, 2000);
        }, 1500);
    });
}

// ============================================
// Resend Code
// ============================================
function setupResendCode() {
    resendCodeLink.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Resend code clicked');
        
        // Generate new code
        verificationCode = generateVerificationCode();
        demoCodeElement.textContent = verificationCode;
        console.log('New code generated:', verificationCode);
        
        // Reset countdown
        countdownTime = 10 * 60;
        startCountdown();
        
        // Reset cooldown
        resendCooldown = 60;
        startResendCooldown();
        
        // Clear input fields
        codeDigits.forEach(digit => {
            digit.value = '';
        });
        codeDigits[0].focus();
        codeDigits[0].select();
        updateCodeValidation();
        
        // Show success message
        showSuccessNotification('تم إعادة إرسال رمز التحقق بنجاح');
        
        // Hide any errors
        hideError('codeError');
    });
}

// ============================================
// Add Animations
// ============================================
function addAnimations() {
    if (!document.querySelector('#verification-animations')) {
        const style = document.createElement('style');
        style.id = 'verification-animations';
        style.textContent = `
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
            }
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
            
            /* Improved input styles */
            .code-digit {
                transition: all 0.3s ease;
                border: 2px solid var(--border-color);
                border-radius: 8px;
                background: var(--input-bg);
                font-size: 1.4rem !important;
                font-weight: bold !important;
                color: var(--text-primary) !important;
            }
            
            .code-digit:focus {
                border-color: var(--student-primary) !important;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2) !important;
                background: rgba(102, 126, 234, 0.05) !important;
            }
            
            .code-digit.filled {
                border-color: var(--student-primary) !important;
                background: rgba(102, 126, 234, 0.1) !important;
            }
        `;
        document.head.appendChild(style);
        console.log('Animations added');
    }
}

// ============================================
// Page Load
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing verification page');
    addAnimations();
    initializeCodeInputs();
    setupFormSubmission();
    setupResendCode();
    initializePage();
});

window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.6s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// ============================================
// Utility Functions
// ============================================
function clearIntervals() {
    if (countdownInterval) clearInterval(countdownInterval);
    if (resendInterval) clearInterval(resendInterval);
}

// Clean up on page unload
window.addEventListener('beforeunload', clearIntervals);
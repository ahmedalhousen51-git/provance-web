// ============================================
// 🔧 ENHANCEMENTS & OPTIMIZATIONS MODULE
// ============================================

// 🚀 نظام التكوين المحسن
const CONFIG = {
    app: {
        name: 'ProVance',
        version: '3.0.0',
        environment: 'production'
    },
    totalSteps: 6,
    maxLogoSize: 2 * 1024 * 1024,
    minBioLength: 100,
    maxBioLength: 500,
    minPasswordLength: 8,
    storage: {
        prefix: 'provance_',
        encryption: false,
        cleanupInterval: 24 * 60 * 60 * 1000
    },
    ui: {
        animationDuration: 300,
        notificationDuration: 5000,
        debounceDelay: 300
    },
    validation: {
        allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
        maxFileSize: 2 * 1024 * 1024
    }
};

// 🚀 نظام تسجيل محسن
class Logger {
    static levels = {
        ERROR: 0,
        WARN: 1,
        INFO: 2,
        DEBUG: 3
    };
    
    static level = this.levels.INFO;
    
    static error(message, data = {}) {
        this.log('ERROR', message, data);
    }
    
    static warn(message, data = {}) {
        if (this.level >= this.levels.WARN) {
            this.log('WARN', message, data);
        }
    }
    
    static info(message, data = {}) {
        if (this.level >= this.levels.INFO) {
            this.log('INFO', message, data);
        }
    }
    
    static debug(message, data = {}) {
        if (this.level >= this.levels.DEBUG) {
            this.log('DEBUG', message, data);
        }
    }
    
    static log(level, message, data) {
        const timestamp = new Date().toISOString();
        const logEntry = { level, message, data, timestamp };
        
        console[level.toLowerCase()](`[${timestamp}] ${level}:`, message, data);
        this.saveToStorage(logEntry);
    }
    
    static saveToStorage(entry) {
        try {
            const logs = JSON.parse(localStorage.getItem('provance_logs') || '[]');
            logs.push(entry);
            localStorage.setItem('provance_logs', JSON.stringify(logs.slice(-1000)));
        } catch (error) {
            console.error('Failed to save log:', error);
        }
    }
}

// 🚀 نظام إدارة البيانات المحسن
class DataManager {
    constructor() {
        this.prefix = CONFIG.storage.prefix;
    }
    
    set(key, data, encrypt = false) {
        try {
            const value = encrypt ? this.encrypt(data) : JSON.stringify(data);
            localStorage.setItem(this.prefix + key, value);
            return true;
        } catch (error) {
            Logger.error('Failed to set data', { key, error });
            return false;
        }
    }
    
    get(key, decrypt = false) {
        try {
            const value = localStorage.getItem(this.prefix + key);
            if (!value) return null;
            
            return decrypt ? this.decrypt(value) : JSON.parse(value);
        } catch (error) {
            Logger.error('Failed to get data', { key, error });
            return null;
        }
    }
    
    encrypt(data) {
        try {
            return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
        } catch (error) {
            Logger.error('Encryption failed', { error });
            return JSON.stringify(data);
        }
    }
    
    decrypt(encryptedData) {
        try {
            return JSON.parse(decodeURIComponent(escape(atob(encryptedData))));
        } catch (error) {
            Logger.error('Decryption failed', { error });
            return null;
        }
    }
    
    cleanup() {
        try {
            const now = Date.now();
            Object.keys(localStorage)
                .filter(key => key.startsWith(this.prefix))
                .forEach(key => {
                    const data = this.get(key.replace(this.prefix, ''));
                    if (data && data.expiry && data.expiry < now) {
                        localStorage.removeItem(key);
                        Logger.info('Cleaned expired data', { key });
                    }
                });
        } catch (error) {
            Logger.error('Cleanup failed', { error });
        }
    }
}

// 🚀 نظام معالجة الأخطاء المحسن
class ErrorHandler {
    static init() {
        window.addEventListener('error', this.handleGlobalError.bind(this));
        window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));
    }
    
    static handleGlobalError(event) {
        const errorData = {
            type: 'global',
            message: event.error?.message,
            stack: event.error?.stack,
            timestamp: new Date().toISOString(),
            url: window.location.href
        };
        
        Logger.error('Global error occurred', errorData);
        this.showUserFriendlyError();
    }
    
    static handlePromiseRejection(event) {
        const errorData = {
            type: 'promise',
            message: event.reason?.message,
            stack: event.reason?.stack,
            timestamp: new Date().toISOString()
        };
        
        Logger.error('Promise rejection', errorData);
    }
    
    static showUserFriendlyError() {
        const notification = new NotificationSystem();
        notification.show(
            'حدث خطأ غير متوقع',
            'نعتذر عن هذا الخطأ. تم تسجيله وسنعمل على إصلاحه قريباً.',
            'error'
        );
    }
}

// 🚀 نظام الإشعارات المحسن
class NotificationSystem {
    constructor() {
        this.queue = [];
        this.isShowing = false;
        this.container = null;
        this.initContainer();
    }
    
    initContainer() {
        this.container = document.createElement('div');
        this.container.className = 'notification-container';
        this.container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
        `;
        document.body.appendChild(this.container);
    }
    
    show(title, message, type = 'info', duration = CONFIG.ui.notificationDuration) {
        // Only show important notifications (errors, warnings, success for major actions)
        if (type === 'info') {
            return; // Skip auto-update notifications
        }
        
        this.queue.push({ title, message, type, duration });
        if (!this.isShowing) this.processQueue();
    }
    
    processQueue() {
        if (this.queue.length === 0) {
            this.isShowing = false;
            return;
        }
        
        this.isShowing = true;
        const notification = this.queue.shift();
        this.createNotification(notification);
        
        setTimeout(() => {
            this.processQueue();
        }, notification.duration + 300);
    }
    
    createNotification({ title, message, type, duration }) {
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
            info: 'var(--primary)'
        };
        
        notification.style.cssText = `
            background: var(--bg-card);
            border: 2px solid ${colors[type]};
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 10px;
            max-width: 400px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            position: relative;
            overflow: hidden;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 12px;">
                <div style="color: ${colors[type]}; font-size: 20px;">
                    <i class="${icons[type]}"></i>
                </div>
                <div style="flex: 1;">
                    <div style="font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">${title}</div>
                    <div style="color: var(--text-secondary); font-size: 14px; line-height: 1.4;">${message}</div>
                </div>
                <button class="notification-close" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; padding: 4px;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => this.removeNotification(notification));
        
        this.container.appendChild(notification);
        
        setTimeout(() => {
            this.removeNotification(notification);
        }, duration);
    }
    
    removeNotification(notification) {
        if (notification.parentElement) {
            notification.remove();
        }
    }
    
    // دالة خاصة للإشعارات المهمة فقط
    showImportant(title, message, type = 'info', duration = CONFIG.ui.notificationDuration) {
        this.queue.push({ title, message, type, duration });
        if (!this.isShowing) this.processQueue();
    }
}

// 🚀 نظام إمكانية الوصول المحسن
class AccessibilityManager {
    static init() {
        this.addSkipLink();
        this.manageFocus();
        this.enhanceForms();
        this.enhanceNavigation();
    }
    
    static addSkipLink() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-link';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            right: 0;
            background: var(--primary);
            color: white;
            padding: 8px 16px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 10000;
            transition: top 0.3s;
        `;
        document.body.insertBefore(skipLink, document.body.firstChild);
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '0';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
    }
    
    static manageFocus() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });
        
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }
    
    static enhanceForms() {
        document.querySelectorAll('.form-input').forEach(input => {
            if (!input.id) {
                input.id = `input-${Math.random().toString(36).substr(2, 9)}`;
            }
            
            const label = input.previousElementSibling;
            if (label && label.classList.contains('.form-label')) {
                label.setAttribute('for', input.id);
            }
            
            // Add aria attributes
            input.setAttribute('aria-describedby', `${input.id}-description`);
        });
    }
    
    static enhanceNavigation() {
        // Make progress dots more accessible
        document.querySelectorAll('.progress-dot').forEach((dot, index) => {
            dot.setAttribute('role', 'button');
            dot.setAttribute('tabindex', '0');
            dot.setAttribute('aria-label', `الانتقال إلى الخطوة ${index + 1}`);
        });
    }
}

// 🚀 نظام التحميل الذكي
class LoadingManager {
    static show(element, text = 'جاري التحميل...') {
        const loader = document.createElement('div');
        loader.className = 'smart-loader';
        loader.innerHTML = `
            <div class="loader-spinner"></div>
            <span class="loader-text">${text}</span>
        `;
        
        loader.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            z-index: 1000;
            border-radius: inherit;
        `;
        
        element.style.position = 'relative';
        element.appendChild(loader);
        return loader;
    }
    
    static hide(loader) {
        if (loader && loader.parentNode) {
            loader.parentNode.removeChild(loader);
        }
    }
}

// 🚀 نظام التحقق من الصحة المتقدم
class AdvancedValidator {
    static email(email) {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(email) && !email.includes('..');
    }
    
    static phone(phone) {
        const re = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/;
        return re.test(phone.replace(/\s/g, ''));
    }
    
    static sanitize(input) {
        if (typeof input !== 'string') return input;
        return input.replace(/[<>]/g, '').trim();
    }
    
    static sanitizeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}

// ============================================
// 🚀 نظام التنقل الذكي بالزر Enter - NEW
// ============================================

class SmartNavigation {
    constructor() {
        this.init();
    }

    init() {
        // إضافة مستمع للأحداث على مستوى النموذج
        document.addEventListener('keydown', this.handleKeyNavigation.bind(this));
        
        // إضافة خاصية التنقل للعناصر
        this.enhanceFormElements();
    }

    handleKeyNavigation(event) {
        // التركيز فقط على زر Enter
        if (event.key !== 'Enter') return;

        const activeElement = document.activeElement;
        
        // منع السلوك الافتراضي في معظم الحالات
        if (this.shouldPreventDefault(activeElement)) {
            event.preventDefault();
        }

        // معالجة التنقل بناءً على نوع العنصر النشط
        this.handleElementNavigation(activeElement, event);
    }

    shouldPreventDefault(element) {
        const tagName = element.tagName.toLowerCase();
        const type = element.type ? element.type.toLowerCase() : '';
        
        // السماح بالسلوك الطبيعي في textarea والأزرار
        if (tagName === 'textarea') return false;
        if (tagName === 'button') return false;
        if (type === 'submit') return false;
        
        return true;
    }

    handleElementNavigation(element, event) {
        const tagName = element.tagName.toLowerCase();
        const type = element.type ? element.type.toLowerCase() : '';
        const elementId = element.id || '';
        
        // 🎯 خاص: لو الـ input بتاع benefit، نـ trigger الـ add
        if (elementId.startsWith('knowledgeBenefitInput-')) {
            const field = elementId.substring('knowledgeBenefitInput-'.length);
            if (typeof addKnowledgeBenefit === 'function') {
                event.preventDefault();
                addKnowledgeBenefit(field);
                return;
            }
        }
        if (elementId.startsWith('financialBenefitInput-')) {
            const field = elementId.substring('financialBenefitInput-'.length);
            if (typeof addFinancialBenefit === 'function') {
                event.preventDefault();
                addFinancialBenefit(field);
                return;
            }
        }
        
        switch (true) {
            case (tagName === 'input' && type === 'text'):
                this.navigateToNextInput(element);
                break;
                
            case (tagName === 'input' && type === 'email'):
                this.navigateToNextInput(element);
                break;
                
            case (tagName === 'input' && type === 'tel'):
                this.navigateToNextInput(element);
                break;
                
            case (tagName === 'input' && type === 'url'):
                this.navigateToNextInput(element);
                break;
                
            case (tagName === 'input' && type === 'number'):
                this.navigateToNextInput(element);
                break;
                
            case (tagName === 'select'):
                this.navigateToNextInput(element);
                break;
                
            default:
                // السلوك الافتراضي - لا تفعل شيئاً
                break;
        }
    }

    navigateToNextInput(currentElement) {
        // الحصول على جميع عناصر الإدخال القابلة للتركيز في الخطوة الحالية
        const currentStep = document.querySelector('.form-step.active');
        if (!currentStep) return;

        const focusableElements = this.getFocusableElements(currentStep);
        if (focusableElements.length === 0) return;

        const currentIndex = focusableElements.indexOf(currentElement);
        const nextIndex = (currentIndex + 1) % focusableElements.length;

        if (nextIndex !== 0) { // تجنب الرجوع لنفس العنصر
            focusableElements[nextIndex].focus();
        }
    }

    getFocusableElements(container) {
        const selectors = [
            'input:not([type="hidden"]):not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            'button:not([disabled])',
            '[tabindex]:not([tabindex="-1"])'
        ].join(',');

        return Array.from(container.querySelectorAll(selectors))
            .filter(el => {
                return el.offsetWidth > 0 && 
                       el.offsetHeight > 0 && 
                       !el.hidden &&
                       this.isVisible(el);
            })
            .sort((a, b) => {
                // ترتيب العناصر حسب موقعها في الصفحة
                const rectA = a.getBoundingClientRect();
                const rectB = b.getBoundingClientRect();
                
                return (rectA.top - rectB.top) || (rectA.left - rectB.left);
            });
    }

    isVisible(element) {
        const style = window.getComputedStyle(element);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               style.opacity !== '0';
    }

    enhanceFormElements() {
        // إضافة attributes للوصولية
        document.querySelectorAll('.form-input, .form-select, .form-textarea').forEach((input, index) => {
            input.setAttribute('enterkeyhint', 'next');
            input.setAttribute('inputmode', this.getInputMode(input));
        });
    }

    getInputMode(element) {
        const type = element.type ? element.type.toLowerCase() : '';
        const tagName = element.tagName.toLowerCase();
        
        if (tagName === 'select') return 'none';
        if (type === 'email') return 'email';
        if (type === 'tel') return 'tel';
        if (type === 'number') return 'numeric';
        if (type === 'url') return 'url';
        
        return 'text';
    }
}

// ============================================
// 🚀 نظام التحميل الذكي للمجالات التدريبية - IMPROVED
// ============================================

class TrainingFieldsOptimizer {
    constructor() {
        this.cache = new Map();
        this.updateQueue = [];
        this.isUpdating = false;
    }

    // تحديث ذكي للمجالات التدريبية
    smartUpdateTrainingFields() {
        if (this.isUpdating) {
            return;
        }
        
        this.isUpdating = true;
        
        // استخدام requestAnimationFrame لتجنب حجب الـ UI
        requestAnimationFrame(() => {
            this.processUpdateQueue();
            this.isUpdating = false;
        });
    }

    processUpdateQueue() {
        const list = domCache.trainingFieldsList;
        if (!list) {
            console.error('Training fields list element not found in DOM cache');
            return;
        }

        console.log('Updating training fields list, current fields:', state.trainingFields);

        if (!state.trainingFields || state.trainingFields.length === 0) {
            list.innerHTML = this.getEmptyStateHTML();
            console.log('No training fields found, showing empty state');
            return;
        }

        console.log(`Found ${state.trainingFields.length} training fields, updating list`);

        // تحديث انتقائي بدلاً من إعادة الرسم الكاملة
        const fragment = document.createDocumentFragment();
        const existingFields = new Set(Array.from(list.children).map(el => el.dataset.fieldId));
        const currentFields = new Set();

        state.trainingFields.forEach((field, index) => {
            const fieldId = this.sanitizeFieldId(field);
            currentFields.add(fieldId);

            let fieldElement = list.querySelector(`[data-field-id="${fieldId}"]`);
            
            if (!fieldElement) {
                fieldElement = this.createFieldElement(field, index, fieldId);
                fragment.appendChild(fieldElement);
                console.log('Created new field element for:', field);
            }
        });

        // إزالة الحقول المحذوفة
        existingFields.forEach(fieldId => {
            if (!currentFields.has(fieldId)) {
                const element = list.querySelector(`[data-field-id="${fieldId}"]`);
                if (element) {
                    element.remove();
                    console.log('Removed field element:', fieldId);
                }
            }
        });

        if (fragment.children.length > 0) {
            list.appendChild(fragment);
            console.log('Appended fragment with new fields');
        }

        // إذا كانت القائمة لا تزال تظهر الحالة الفارغة، قم بإزالتها
        const emptyState = list.querySelector('.empty-state');
        if (emptyState && state.trainingFields.length > 0) {
            emptyState.remove();
            console.log('Removed empty state from non-empty list');
        }
    }

    createFieldElement(field, index, fieldId) {
        const tag = document.createElement('div');
        tag.className = 'field-tag';
        tag.dataset.fieldId = fieldId;
        tag.innerHTML = `
            <span>${AdvancedValidator.sanitizeHTML(field)}</span>
            <button type="button" onclick="optimizedRemoveTrainingField(${index})" aria-label="حذف ${AdvancedValidator.sanitizeHTML(field)}">×</button>
        `;
        return tag;
    }

    getEmptyStateHTML() {
        return `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-graduation-cap"></i>
                </div>
                <h4>لم تتم إضافة أي مجالات بعد</h4>
                <p>ابدأ بإضافة المجالات التدريبية التي تقدمها شركتك</p>
            </div>
        `;
    }

    sanitizeFieldId(field) {
        if (!field) return '';
        const str = String(field);
        // Idempotent: لو الـ field محول بالفعل (بدأ بـ f_ وكل الباقي ASCII)، نرجعه زي ما هو
        if (str.startsWith('f_') && /^f_[a-zA-Z0-9]*$/.test(str)) {
            return str;
        }
        // Convert إلى ASCII-safe ID: hex encoding للأحرف غير الـ ASCII
        return 'f_' + str.split('').map(c => {
            const code = c.charCodeAt(0);
            if ((code >= 48 && code <= 57) ||  // 0-9
                (code >= 65 && code <= 90) ||  // A-Z
                (code >= 97 && code <= 122)) { // a-z
                return c;
            }
            return code.toString(16);
        }).join('');
    }
}

// ============================================
// 🚀 تحسينات أداء إضافية - NEW
// ============================================

class PerformanceOptimizer {
    constructor() {
        this.observer = null;
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.optimizeEventHandlers();
    }

    setupIntersectionObserver() {
        // استخدام Intersection Observer للتحديث البصري فقط للعناصر المرئية
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.enhanceVisibleElement(entry.target);
                }
            });
        }, {
            rootMargin: '50px 0px 50px 0px',
            threshold: 0.1
        });
    }

    observeTrainingDetails() {
        document.querySelectorAll('.training-detail-item').forEach(item => {
            this.observer.observe(item);
        });
    }

    enhanceVisibleElement(element) {
        // إضافة تأثيرات بصرية للعناصر المرئية فقط
        element.style.willChange = 'transform, opacity';
        
        // إزالة العناصر من المراقبة بعد تحسينها
        setTimeout(() => {
            this.observer.unobserve(element);
            element.style.willChange = 'auto';
        }, 1000);
    }

    optimizeEventHandlers() {
        // استخدام event delegation لتقليل عدد مستمعي الأحداث
        document.addEventListener('input', this.debouncedSaveState.bind(this));
    }

    debouncedSaveState = debounce(() => {
        saveStateToStorage();
    }, 1000);
}

// ============================================
// 🛠️ نظام إدارة الميزات المحسن والمصلح
// ============================================

// 🛠️ نظام إدارة الميزات المعرفية والمادية ومتطلبات التدريب - الإصدار المصحح
class FixedFeaturesManager {
    constructor() {
        this.knowledgeBenefits = new Map();
        console.log('🏗️ FixedFeaturesManager initialized');
        this.financialBenefits = new Map();
        this.trainingRequirements = new Map();
        this.initialized = false;
    }

    // تهيئة النظام مرة واحدة فقط
    init() {
        if (this.initialized) return;
        this.initialized = true;
        Logger.info('Fixed Features Manager initialized');
    }

    // 🔧 إصلاح: إضافة تحقق من القيمة الفارغة ومنع التكرار
    addKnowledgeBenefit(field, benefit) {
        if (!benefit || !benefit.trim()) {
            console.log('Benefit is empty, skipping');
            return false;
        }

        const sanitizedField = this.sanitizeFieldId(field);
        const sanitizedBenefit = AdvancedValidator.sanitize(benefit.trim());
        
        console.log(`Adding knowledge benefit for ${sanitizedField}:`, sanitizedBenefit);
        
        if (!this.knowledgeBenefits.has(sanitizedField)) {
            this.knowledgeBenefits.set(sanitizedField, []);
        }
        
        // 🔧 منع التكرار
        const existingBenefits = this.knowledgeBenefits.get(sanitizedField);
        if (existingBenefits.includes(sanitizedBenefit)) {
            console.log('Duplicate benefit found, skipping');
            return false;
        }
        
        this.knowledgeBenefits.get(sanitizedField).push(sanitizedBenefit);
        
        // 🔧 تحديث الـ state - نلاقي الـ raw key بمقارنة sanitized values
        let stateKey = null;
        if (state.trainingDetails[field]) stateKey = field;
        else if (state.trainingDetails[sanitizedField]) stateKey = sanitizedField;
        else {
            // نلاقي الـ raw field اللي sanitized بتاعه = sanitizedField
            stateKey = (state.trainingFields || []).find(f => this.sanitizeFieldId(f) === sanitizedField) || null;
        }
        console.log('🔑 stateKey found:', stateKey, 'for sanitized:', sanitizedField);
        if (stateKey && state.trainingDetails[stateKey]) {
            state.trainingDetails[stateKey].knowledgeBenefits = this.getKnowledgeBenefitsAsString(sanitizedField);
            console.log('✅ Updated state.trainingDetails[' + stateKey + '].knowledgeBenefits');
        } else {
            console.warn('⚠️ Could not find stateKey for:', field, sanitizedField);
        }
        
        // 🔧 تحديث الواجهة يدوياً فقط
        this.updateKnowledgeBenefitsUI(sanitizedField);
        
        return true;
    }

    // 🔧 نفس الإصلاح للميزات المالية
    addFinancialBenefit(field, benefit) {
        if (!benefit || !benefit.trim()) {
            console.log('Financial benefit is empty, skipping');
            return false;
        }

        const sanitizedField = this.sanitizeFieldId(field);
        const sanitizedBenefit = AdvancedValidator.sanitize(benefit.trim());
        
        console.log(`Adding financial benefit for ${sanitizedField}:`, sanitizedBenefit);
        
        if (!this.financialBenefits.has(sanitizedField)) {
            this.financialBenefits.set(sanitizedField, []);
        }
        
        const existingBenefits = this.financialBenefits.get(sanitizedField);
        if (existingBenefits.includes(sanitizedBenefit)) {
            console.log('Duplicate financial benefit found, skipping');
            return false;
        }
        
        this.financialBenefits.get(sanitizedField).push(sanitizedBenefit);
        
        // نلاقي الـ raw key بمقارنة sanitized values
        let stateKey = null;
        if (state.trainingDetails[field]) stateKey = field;
        else if (state.trainingDetails[sanitizedField]) stateKey = sanitizedField;
        else {
            stateKey = (state.trainingFields || []).find(f => this.sanitizeFieldId(f) === sanitizedField) || null;
        }
        if (stateKey && state.trainingDetails[stateKey]) {
            state.trainingDetails[stateKey].financialBenefits = this.getFinancialBenefitsAsString(sanitizedField);
        }
        
        this.updateFinancialBenefitsUI(sanitizedField);
        return true;
    }

    // 🔧 نفس الإصلاح لمتطلبات التدريب
    addTrainingRequirement(field, requirement) {
        if (!requirement || !requirement.trim()) {
            console.log('Training requirement is empty, skipping');
            return false;
        }

        const sanitizedField = this.sanitizeFieldId(field);
        const sanitizedRequirement = AdvancedValidator.sanitize(requirement.trim());
        
        console.log(`Adding training requirement for ${sanitizedField}:`, sanitizedRequirement);
        
        if (!this.trainingRequirements.has(sanitizedField)) {
            this.trainingRequirements.set(sanitizedField, []);
        }
        
        const existingRequirements = this.trainingRequirements.get(sanitizedField);
        if (existingRequirements.includes(sanitizedRequirement)) {
            console.log('Duplicate training requirement found, skipping');
            return false;
        }
        
        this.trainingRequirements.get(sanitizedField).push(sanitizedRequirement);
        
        // نلاقي الـ raw key بمقارنة sanitized values
        let stateKey = null;
        if (state.trainingDetails[field]) stateKey = field;
        else if (state.trainingDetails[sanitizedField]) stateKey = sanitizedField;
        else {
            stateKey = (state.trainingFields || []).find(f => this.sanitizeFieldId(f) === sanitizedField) || null;
        }
        if (stateKey && state.trainingDetails[stateKey]) {
            state.trainingDetails[stateKey].trainingRequirements = this.getTrainingRequirementsAsString(sanitizedField);
        }
        
        this.updateTrainingRequirementsUI(sanitizedField);
        return true;
    }

    // 🔧 إصلاح: تحديث الواجهة فقط عند الطلب
    updateKnowledgeBenefitsUI(field) {
        let container = document.getElementById(`knowledgeBenefitsList-${field}`);
        if (!container) {
            // fallback: نلاقي أي container يبدأ بالاسم ده
            const sanitized = this.sanitizeFieldId(field);
            container = document.getElementById(`knowledgeBenefitsList-${sanitized}`);
        }
        if (!container) {
            // last resort: نلاقي الأول من نوعه
            const all = document.querySelectorAll('[id^="knowledgeBenefitsList-"]');
            if (all.length === 1) container = all[0];
        }
        if (!container) {
            console.warn('🔴 Knowledge container not found for:', field, 'Available:', 
                Array.from(document.querySelectorAll('[id^="knowledgeBenefitsList-"]')).map(c => c.id));
            return;
        }

        // Map.get مع fallback لو field مش الـ key الصحيح
        let benefits = this.knowledgeBenefits.get(field);
        if (!benefits || !benefits.length) {
            const sanitized = this.sanitizeFieldId(field);
            benefits = this.knowledgeBenefits.get(sanitized) || [];
        }
        console.log(`Updating Knowledge UI for ${field} with ${benefits.length} benefits`);
        
        if (benefits.length === 0) {
            container.innerHTML = `
                <div class="empty-features-state">
                    <i class="fas fa-brain"></i>
                    <p>لم تتم إضافة أي ميزة معرفية بعد</p>
                </div>
            `;
            return;
        }

        container.innerHTML = benefits.map((benefit, index) => `
            <div class="feature-tag">
                <span class="feature-text">${this.sanitizeHTML(benefit)}</span>
                <button type="button" class="feature-remove" onclick="fixedFeaturesManager.removeKnowledgeBenefit('${fixedFeaturesManager.sanitizeFieldId(field)}', ${index})" aria-label="حذف الميزة المعرفية">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    updateFinancialBenefitsUI(field) {
        let container = document.getElementById(`financialBenefitsList-${field}`);
        if (!container) {
            const sanitized = this.sanitizeFieldId(field);
            container = document.getElementById(`financialBenefitsList-${sanitized}`);
        }
        if (!container) {
            const all = document.querySelectorAll('[id^="financialBenefitsList-"]');
            if (all.length === 1) container = all[0];
        }
        if (!container) {
            console.warn('🔴 Financial container not found for:', field, 'Available:',
                Array.from(document.querySelectorAll('[id^="financialBenefitsList-"]')).map(c => c.id));
            return;
        }

        // Map.get مع fallback
        let benefits = this.financialBenefits.get(field);
        if (!benefits || !benefits.length) {
            const sanitized = this.sanitizeFieldId(field);
            benefits = this.financialBenefits.get(sanitized) || [];
        }
        console.log(`Updating Financial UI for ${field} with ${benefits.length} benefits`);
        
        if (benefits.length === 0) {
            container.innerHTML = `
                <div class="empty-features-state">
                    <i class="fas fa-money-bill-wave"></i>
                    <p>لم تتم إضافة أي ميزة مادية بعد</p>
                </div>
            `;
            return;
        }

        container.innerHTML = benefits.map((benefit, index) => `
            <div class="feature-tag">
                <span class="feature-text">${this.sanitizeHTML(benefit)}</span>
                <button type="button" class="feature-remove" onclick="fixedFeaturesManager.removeFinancialBenefit('${fixedFeaturesManager.sanitizeFieldId(field)}', ${index})" aria-label="حذف الميزة المادية">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    updateTrainingRequirementsUI(field) {
        let container = document.getElementById(`trainingRequirementsList-${field}`);
        if (!container) {
            const sanitized = this.sanitizeFieldId(field);
            container = document.getElementById(`trainingRequirementsList-${sanitized}`);
        }
        if (!container) {
            const all = document.querySelectorAll('[id^="trainingRequirementsList-"]');
            if (all.length === 1) container = all[0];
        }
        if (!container) {
            console.warn('🔴 Training requirements container not found for:', field, 'Available:',
                Array.from(document.querySelectorAll('[id^="trainingRequirementsList-"]')).map(c => c.id));
            return;
        }

        // Map.get مع fallback
        let requirements = this.trainingRequirements.get(field);
        if (!requirements || !requirements.length) {
            const sanitized = this.sanitizeFieldId(field);
            requirements = this.trainingRequirements.get(sanitized) || [];
        }
        console.log(`Updating Training Req UI for ${field} with ${requirements.length} requirements`);
        
        if (requirements.length === 0) {
            container.innerHTML = `
                <div class="empty-features-state">
                    <i class="fas fa-user-check"></i>
                    <p>لم تتم إضافة أي متطلب تدريبي بعد</p>
                </div>
            `;
            return;
        }

        container.innerHTML = requirements.map((requirement, index) => `
            <div class="feature-tag">
                <span class="feature-text">${this.sanitizeHTML(requirement)}</span>
                <button type="button" class="feature-remove" onclick="fixedFeaturesManager.removeTrainingRequirement('${field}', ${index})" aria-label="حذف متطلب التدريب">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    // 🔧 إصلاح: دوال الحذف
    removeKnowledgeBenefit(field, index) {
        console.log(`Removing knowledge benefit from ${field} at index ${index}`);
        // جرب raw + sanitized
        const sanitized = this.sanitizeFieldId(field);
        const key = this.knowledgeBenefits.has(field) ? field 
                  : this.knowledgeBenefits.has(sanitized) ? sanitized : null;
        if (key) {
            this.knowledgeBenefits.get(key).splice(index, 1);
            const stateKey = state.trainingDetails[field] ? field 
                           : state.trainingDetails[sanitized] ? sanitized : null;
            if (stateKey) {
                state.trainingDetails[stateKey].knowledgeBenefits = this.getKnowledgeBenefitsAsString(key);
            }
            this.updateKnowledgeBenefitsUI(sanitized);
            saveStateToStorage();
        }
    }

    removeFinancialBenefit(field, index) {
        console.log(`Removing financial benefit from ${field} at index ${index}`);
        const sanitized = this.sanitizeFieldId(field);
        const key = this.financialBenefits.has(field) ? field 
                  : this.financialBenefits.has(sanitized) ? sanitized : null;
        if (key) {
            this.financialBenefits.get(key).splice(index, 1);
            const stateKey = state.trainingDetails[field] ? field 
                           : state.trainingDetails[sanitized] ? sanitized : null;
            if (stateKey) {
                state.trainingDetails[stateKey].financialBenefits = this.getFinancialBenefitsAsString(key);
            }
            this.updateFinancialBenefitsUI(sanitized);
            saveStateToStorage();
        }
    }

    removeTrainingRequirement(field, index) {
        console.log(`Removing training requirement from ${field} at index ${index}`);
        const sanitized = this.sanitizeFieldId(field);
        const key = this.trainingRequirements.has(field) ? field 
                  : this.trainingRequirements.has(sanitized) ? sanitized : null;
        if (key) {
            this.trainingRequirements.get(key).splice(index, 1);
            let stateKey = null;
            if (state.trainingDetails[field]) stateKey = field;
            else if (state.trainingDetails[sanitized]) stateKey = sanitized;
            else {
                stateKey = (state.trainingFields || []).find(f => this.sanitizeFieldId(f) === key) || null;
            }
            if (stateKey && state.trainingDetails[stateKey]) {
                state.trainingDetails[stateKey].trainingRequirements = this.getTrainingRequirementsAsString(key);
            }
            this.updateTrainingRequirementsUI(sanitized);
            saveStateToStorage();
        }
    }

    // 🔧 دوال الحصول على البيانات
    getKnowledgeBenefitsAsString(field) {
        // جرب raw الأول، ثم sanitized
        let benefits = this.knowledgeBenefits.get(field);
        if (!benefits || !benefits.length) {
            benefits = this.knowledgeBenefits.get(this.sanitizeFieldId(field)) || [];
        }
        return benefits.join('\n');
    }

    getFinancialBenefitsAsString(field) {
        let benefits = this.financialBenefits.get(field);
        if (!benefits || !benefits.length) {
            benefits = this.financialBenefits.get(this.sanitizeFieldId(field)) || [];
        }
        return benefits.join('\n');
    }

    getTrainingRequirementsAsString(field) {
        let requirements = this.trainingRequirements.get(field);
        if (!requirements || !requirements.length) {
            requirements = this.trainingRequirements.get(this.sanitizeFieldId(field)) || [];
        }
        return requirements.join('\n');
    }

    // 🔧 تحميل البيانات من الـ state
    loadFromState(field, stateData) {
        console.log('Loading from state for field:', field);
        if (stateData.knowledgeBenefits) {
            const benefits = stateData.knowledgeBenefits.split('\n').filter(b => b.trim());
            benefits.forEach(benefit => this.addKnowledgeBenefit(field, benefit));
        }
        
        if (stateData.financialBenefits) {
            const benefits = stateData.financialBenefits.split('\n').filter(b => b.trim());
            benefits.forEach(benefit => this.addFinancialBenefit(field, benefit));
        }
        
        if (stateData.trainingRequirements) {
            const requirements = stateData.trainingRequirements.split('\n').filter(r => r.trim());
            requirements.forEach(requirement => this.addTrainingRequirement(field, requirement));
        }
    }

    // تنظيف معرف الحقل للاستخدام في الـ ID
    sanitizeFieldId(field) {
        if (!field) return '';
        const str = String(field);
        // Idempotent: لو الـ field محول بالفعل (بدأ بـ f_ وكل الباقي ASCII)، نرجعه زي ما هو
        if (str.startsWith('f_') && /^f_[a-zA-Z0-9]*$/.test(str)) {
            return str;
        }
        // Convert إلى ASCII-safe ID: hex encoding للأحرف غير الـ ASCII
        return 'f_' + str.split('').map(c => {
            const code = c.charCodeAt(0);
            if ((code >= 48 && code <= 57) ||  // 0-9
                (code >= 65 && code <= 90) ||  // A-Z
                (code >= 97 && code <= 122)) { // a-z
                return c;
            }
            return code.toString(16);
        }).join('');
    }

    // تنظيف النص من HTML
    sanitizeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}

// إنشاء مثيل من مدير الميزات المصحح
const fixedFeaturesManager = new FixedFeaturesManager();

// ============================================
// 🔧 MAIN APPLICATION CODE WITH ENHANCEMENTS
// ============================================

// State management with persistence
let state = {
    currentStep: 1,
    trainingFields: [],
    trainingDetails: {},
    selectedTraineeType: '',
    companyLogoData: null,
    formData: {},
    branchLocations: [],
    contractAgreed: false
};

// DOM Cache for performance
const domCache = {};

// Initialize enhanced systems
const dataManager = new DataManager();
const notificationSystem = new NotificationSystem();

// إنشاء مثيلات الأنظمة الجديدة
const smartNavigation = new SmartNavigation();
const fieldsOptimizer = new TrainingFieldsOptimizer();
const performanceOptimizer = new PerformanceOptimizer();

// ============================================
// Initialize Application - ENHANCED
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('%c🚀 ProVance Company Registration System - ENHANCED & FIXED', 'color: #00D9FF; font-size: 24px; font-weight: bold;');
    
    // Initialize all enhanced systems
    ErrorHandler.init();
    AccessibilityManager.init();
    initializeEnhancedApp();
    
    // Setup periodic cleanup
    setInterval(() => {
        dataManager.cleanup();
    }, CONFIG.storage.cleanupInterval);
    
    Logger.info('Application initialized with enhanced systems');
});

function initializeEnhancedApp() {
    cacheDOMElements();
    loadPersistedState();
    updateProgressBar();
    updateNavigationButtons();
    attachEventListeners();
    initializeProgressDots();
    addFeaturesStyles();
    
    // 🔧 إصلاح: تهيئة نظام الميزات الثابت
    fixedFeaturesManager.init();
    
    // 🚀 تهيئة الأنظمة الجديدة
    smartNavigation.init();
    performanceOptimizer.init();
    
    // 🔧 إصلاح: تحديث قائمة المجالات التدريبية عند التحميل
    if (state.trainingFields && state.trainingFields.length > 0) {
        console.log('Initializing with existing training fields:', state.trainingFields);
        fieldsOptimizer.smartUpdateTrainingFields();
        optimizedUpdateTrainingDetailsSection();
    }
    
    // 🔧 إصلاح: إعادة تحميل البيانات بحذر
    if (state.trainingFields && state.trainingFields.length > 0) {
        setTimeout(() => {
            state.trainingFields.forEach(field => {
                const details = state.trainingDetails[field];
                if (details) {
                    console.log('Loading features for field:', field);
                    fixedFeaturesManager.loadFromState(field, details);
                }
            });
        }, 1000); // تأخير لضمان تحميل كل شيء
    }
    
    const bioInput = document.getElementById('companyBio');
    const fieldInput = document.getElementById('companyField');
    
    if (bioInput) {
        bioInput.addEventListener('input', debounce(updateBioCounter, CONFIG.ui.debounceDelay));
    }
    
    if (fieldInput) {
        fieldInput.addEventListener('input', debounce(updateFieldCounter, CONFIG.ui.debounceDelay));
    }
    
    const contractCheckbox = document.getElementById('contractAgreement');
    if (contractCheckbox) {
        contractCheckbox.addEventListener('change', function() {
            state.contractAgreed = this.checked;
            saveStateToStorage();
        });
    }
    
    updateBioCounter();
    updateFieldCounter();
    hideFinancialExplanation();
}

function cacheDOMElements() {
    // Cache frequently used elements
    domCache.progressFill = document.getElementById('progressFill');
    domCache.currentStepSpan = document.getElementById('currentStep');
    domCache.totalStepsSpan = document.getElementById('totalSteps');
    domCache.trainingFieldsList = document.getElementById('trainingFieldsList');
    domCache.trainingDetailsList = document.getElementById('trainingDetailsList');
    domCache.branchLocationsList = document.getElementById('branchLocationsList');
    
    console.log('DOM elements cached:', {
        trainingFieldsList: !!domCache.trainingFieldsList,
        trainingDetailsList: !!domCache.trainingDetailsList,
        branchLocationsList: !!domCache.branchLocationsList
    });
}

// ============================================
// Performance Utilities - ENHANCED
// ============================================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ============================================
// State Persistence - NEW
// ============================================
function saveStateToStorage() {
    try {
        const stateToSave = {
            ...state,
            savedAt: Date.now(),
            expiry: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        };
        dataManager.set('registration_state', stateToSave);
        Logger.debug('State saved to storage');
    } catch (error) {
        Logger.error('Failed to save state', { error });
    }
}

function loadPersistedState() {
    try {
        const savedState = dataManager.get('registration_state');
        if (savedState && savedState.expiry > Date.now()) {
            // Remove temporary properties
            const { savedAt, expiry, ...loadedState } = savedState;
            Object.assign(state, loadedState);
            Logger.info('State loaded from storage', { 
                currentStep: state.currentStep,
                trainingFieldsCount: state.trainingFields ? state.trainingFields.length : 0
            });
            
            // Restore UI state
            if (state.currentStep > 1) {
                showStep(state.currentStep);
            }
        }
    } catch (error) {
        Logger.error('Failed to load state', { error });
    }
}

// ============================================
// Optimized Event Listeners - ENHANCED
// ============================================
function attachEventListeners() {
    // Logo upload with enhanced validation
    const logoInput = document.getElementById('companyLogo');
    if (logoInput) {
        logoInput.addEventListener('change', handleLogoUpload);
    }
    
    // Password strength with debounce
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', debounce(function() {
            checkPasswordStrength();
            checkPasswordMatch();
        }, CONFIG.ui.debounceDelay));
    }
    
    // Password match with debounce
    const confirmPasswordInput = document.getElementById('confirmPassword');
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', debounce(checkPasswordMatch, CONFIG.ui.debounceDelay));
    }
    
    // Training field enter key
    const newFieldInput = document.getElementById('newTrainingField');
    if (newFieldInput) {
        newFieldInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                optimizedAddTrainingField();
            }
        });
    }
    
    // Form submission with enhanced handling
    const form = document.getElementById('companyRegisterForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    // Auto-save state on changes
    document.addEventListener('input', debounce(saveStateToStorage, 2000));
}

// ============================================
// Enhanced Logo Upload - ENHANCED
// ============================================
function handleLogoUpload(event) {
    const file = event.target.files[0];
    
    if (!file) return;
    
    // Enhanced validation
    if (file.size > CONFIG.maxLogoSize) {
        notificationSystem.show(
            'حجم الصورة كبير جداً',
            `الحد الأقصى لحجم شعار الشركة هو ${CONFIG.maxLogoSize / (1024 * 1024)}MB. يرجى اختيار صورة أصغر`,
            'error'
        );
        event.target.value = '';
        return;
    }
    
    if (!CONFIG.validation.allowedImageTypes.includes(file.type)) {
        notificationSystem.show(
            'صيغة الملف غير مدعومة',
            'يرجى استخدام صيغة JPG، PNG أو GIF فقط للشعار',
            'error'
        );
        event.target.value = '';
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        // ضغط الصورة قبل التخزين - يقلل الحجم من 1-2MB لـ 50-100KB
        compressImage(e.target.result, 400, 0.85).then(compressedData => {
            state.companyLogoData = compressedData;
            
            const preview = document.getElementById('logoPreview');
            const placeholder = document.querySelector('.logo-placeholder');
            const removeBtn = document.getElementById('logoRemoveBtn');
            
            if (preview) {
                preview.src = compressedData;
                preview.classList.add('show');
            }
            if (placeholder) placeholder.style.display = 'none';
            if (removeBtn) removeBtn.classList.remove('hidden');
            
            // عرض حجم الصورة بعد الضغط
            const sizeKB = Math.round(compressedData.length / 1024);
            console.log('✓ Logo compressed:', sizeKB, 'KB');
            
            saveStateToStorage();
        }).catch(err => {
            console.error('Compression error:', err);
            // fallback: استخدم الصورة الأصلية
            state.companyLogoData = e.target.result;
            const preview = document.getElementById('logoPreview');
            if (preview) {
                preview.src = e.target.result;
                preview.classList.add('show');
            }
            saveStateToStorage();
        });
    };
    
    reader.onerror = function() {
        notificationSystem.show('خطأ في تحميل الصورة', 'حدث خطأ أثناء قراءة الملف. يرجى المحاولة مرة أخرى', 'error');
    };
    
    reader.readAsDataURL(file);
}

// ============================================
// Image Compression - ضغط الصور قبل التخزين
// ============================================
function compressImage(base64Str, maxWidth = 400, quality = 0.85) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = function() {
            // احسب الأبعاد الجديدة (مع الحفاظ على النسبة)
            let width = img.width;
            let height = img.height;
            
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }
            
            // ارسم على canvas
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            
            // خلفية بيضاء للـ PNG شفاف
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, height);
            
            ctx.drawImage(img, 0, 0, width, height);
            
            // حول لـ JPEG مضغوط (أصغر بكتير من PNG)
            const compressed = canvas.toDataURL('image/jpeg', quality);
            resolve(compressed);
        };
        img.onerror = reject;
        img.src = base64Str;
    });
}

// ============================================
// Toggle Functions - OPTIMIZED
// ============================================
function toggleBranchesCount() {
    const branchesYes = document.getElementById('branchesYes');
    const branchesCountGroup = document.getElementById('branchesCountGroup');
    const branchesLocationsGroup = document.getElementById('branchesLocationsGroup');
    const branchesCountInput = document.getElementById('branchesCount');
    
    if (branchesYes && branchesYes.checked) {
        branchesCountGroup.classList.remove('hidden');
        branchesLocationsGroup.classList.remove('hidden');
        if (branchesCountInput) branchesCountInput.required = true;
    } else {
        branchesCountGroup.classList.add('hidden');
        branchesLocationsGroup.classList.add('hidden');
        if (branchesCountInput) {
            branchesCountInput.required = false;
            branchesCountInput.value = '';
        }
        state.branchLocations = [];
        updateBranchLocationsList();
    }
    saveStateToStorage();
}

function toggleExactEmployeeCount() {
    const employeesSelect = document.getElementById('employeesCount');
    const exactCountGroup = document.getElementById('exactEmployeeCountGroup');
    const exactCountInput = document.getElementById('exactEmployeeCount');
    
    if (employeesSelect.value === 'more') {
        exactCountGroup.classList.remove('hidden');
        if (exactCountInput) exactCountInput.required = true;
    } else {
        exactCountGroup.classList.add('hidden');
        if (exactCountInput) {
            exactCountInput.required = false;
            exactCountInput.value = '';
        }
    }
    saveStateToStorage();
}

function toggleEquipmentDetails() {
    const equipmentNo = document.getElementById('equipmentNo');
    const requirementsGroup = document.getElementById('studentRequirementsGroup');
    const requiredItems = document.getElementById('requiredItems');
    
    if (!requirementsGroup) return;
    
    if (equipmentNo && equipmentNo.checked) {
        requirementsGroup.classList.remove('hidden');
        if (requiredItems) requiredItems.required = true;
    } else {
        requirementsGroup.classList.add('hidden');
        if (requiredItems) {
            requiredItems.required = false;
            requiredItems.value = '';
        }
    }
    saveStateToStorage();
}

// ============================================
// Character Counters - OPTIMIZED
// ============================================
function updateBioCounter() {
    const bio = document.getElementById('companyBio');
    const counter = document.getElementById('bioCounter');
    
    if (!bio || !counter) return;
    
    const currentLength = bio.value.length;
    counter.textContent = currentLength;
    
    if (currentLength < CONFIG.minBioLength) {
        counter.style.color = 'var(--error)';
    } else if (currentLength < CONFIG.maxBioLength) {
        counter.style.color = 'var(--success)';
    } else {
        counter.style.color = 'var(--warning)';
    }
}

function updateFieldCounter() {
    const field = document.getElementById('companyField');
    const counter = document.getElementById('fieldCounter');
    
    if (!field || !counter) return;
    
    const currentLength = field.value.length;
    counter.textContent = currentLength;
    
    if (currentLength > 45) {
        counter.style.color = 'var(--warning)';
    } else {
        counter.style.color = 'var(--success)';
    }
}

// ============================================
// Progress Management - OPTIMIZED
// ============================================
function updateProgressBar() {
    const progress = (state.currentStep / CONFIG.totalSteps) * 100;
    
    if (domCache.progressFill) {
        domCache.progressFill.style.width = progress + '%';
    }
    if (domCache.currentStepSpan) {
        domCache.currentStepSpan.textContent = state.currentStep;
    }
    if (domCache.totalStepsSpan) {
        domCache.totalStepsSpan.textContent = CONFIG.totalSteps;
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
// Step Navigation - OPTIMIZED
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
    saveStateToStorage();
}

function previousStep() {
    if (state.currentStep > 1) {
        state.currentStep--;
        showStep(state.currentStep);
    }
    saveStateToStorage();
}

function goToStep(step) {
    if (step >= 1 && step <= CONFIG.totalSteps) {
        state.currentStep = step;
        showStep(step);
        
        if (step === CONFIG.totalSteps - 1) {
            generateSummary();
        }
    }
    saveStateToStorage();
}

function showStep(step) {
    // Hide all steps
    document.querySelectorAll('.form-step').forEach(s => {
        s.classList.remove('active');
    });
    
    // Show current step
    const currentStepElement = document.querySelector(`.form-step[data-step="${step}"]`);
    if (currentStepElement) {
        currentStepElement.classList.add('active');
    }
    
    updateProgressBar();
    updateNavigationButtons();
    updateProgressDots();
    
    // Smooth scroll to top with accessibility
    setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Focus management for accessibility
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.focus();
        }
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
// Enhanced Form Validation - ENHANCED
// ============================================
function validateCurrentStep() {
    const validators = {
        1: validateStep1,
        2: validateStep2,
        3: validateStep3,
        4: validateStep4,
        5: validateStep5,
        6: validateStep6
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
            4: validateStep4,
            5: validateStep5,
            6: validateStep6
        };
        
        const validator = validators[i];
        if (validator && !validator(true)) {
            return false;
        }
    }
    return true;
}

function validateStep1(silent = false) {
    const companyName = getValue('companyName');
    const companyBio = getValue('companyBio');
    const hasMultipleBranches = document.querySelector('input[name="hasMultipleBranches"]:checked');
    const branchesCount = getValue('branchesCount');
    const companyLocation = getValue('companyLocation');
    const employeesCount = getValue('employeesCount');
    const email = getValue('email');
    const password = getValue('password');
    const confirmPassword = getValue('confirmPassword');
    const companyField = getValue('companyField');
    
    if (!companyName) {
        return showError('اسم الشركة مطلوب', 'يجب إدخال الاسم الرسمي للشركة المسجل', silent);
    }
    
    if (!companyBio) {
        return showError('نبذة الشركة مطلوبة', 'يجب كتابة نبذة عن نشاط الشركة ورؤيتها', silent);
    }
    
    if (companyBio.length < CONFIG.minBioLength) {
        return showError(
            'نبذة الشركة قصيرة جداً',
            `النبذة يجب أن تكون ${CONFIG.minBioLength} حرف على الأقل. أنت كتبت ${companyBio.length} حرف فقط`,
            silent
        );
    }
    
    if (!hasMultipleBranches) {
        return showError('يجب اختيار عدد الفروع', 'حدد إذا كان لديكم فرع واحد أو أكثر من فرع', silent);
    }
    
    if (hasMultipleBranches.value === 'yes' && !branchesCount) {
        return showError(
            'عدد الفروع مطلوب',
            'بما أن لديكم أكثر من فرع، يجب تحديد عدد الفروع الإجمالي',
            silent
        );
    }
    
    if (hasMultipleBranches.value === 'yes') {
        if (!state.branchLocations || state.branchLocations.length === 0) {
            return showError(
                'الفروع المتاحة مطلوبة',
                'بما أن لديكم أكثر من فرع، يجب إضافة الفروع المتاحة للتدريب',
                silent
            );
        }
        
        const incompleteBranches = state.branchLocations.filter(branch => 
            !branch.fullAddress
        );
        
        if (incompleteBranches.length > 0) {
            return showError(
                'بيانات الفروع غير مكتملة',
                'يجب إدخال العنوان الكامل لكل فرع متاح للتدريب',
                silent
            );
        }
    }
    
    if (!companyLocation) {
        return showError('موقع الشركة مطلوب', 'يجب تحديد موقع الشركة الرئيسي', silent);
    }
    
    if (!employeesCount) {
        return showError('عدد الموظفين مطلوب', 'يجب تحديد فئة عدد الموظفين في الشركة', silent);
    }
    
    if (!email) {
        return showError('البريد الإلكتروني مطلوب', 'يجب إدخال بريد إلكتروني صحيح للشركة', silent);
    }
    
    if (!AdvancedValidator.email(email)) {
        return showError(
            'البريد الإلكتروني غير صحيح',
            'تأكد من كتابة البريد الإلكتروني بالشكل الصحيح (مثال: company@example.com)',
            silent
        );
    }
    
    if (!password) {
        return showError('كلمة المرور مطلوبة', 'يجب إنشاء كلمة مرور قوية لحماية حساب الشركة', silent);
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
    
    if (!companyField) {
        return showError(
            'المجال الرئيسي مطلوب',
            'حدد مجال نشاط الشركة الرئيسي (مثال: تكنولوجيا المعلومات)',
            silent
        );
    }
    
    return true;
}

function validateStep2(silent = false) {
    const primaryPhone = getValue('primaryPhone');
    const inquiryEmail = getValue('inquiryEmail');
    
    if (!primaryPhone) {
        return showError(
            'رقم الهاتف الأساسي مطلوب',
            'يجب إدخال رقم هاتف صحيح للتواصل مع الشركة',
            silent
        );
    }
    
    if (!AdvancedValidator.phone(primaryPhone)) {
        return showError(
            'رقم الهاتف غير صحيح',
            'يرجى إدخال رقم هاتف صحيح (مثال: +201234567890)',
            silent
        );
    }
    
    if (!inquiryEmail) {
        return showError(
            'البريد الإلكتروني للاستفسارات مطلوب',
            'يجب إدخال بريد إلكتروني خاص بالاستفسارات والتواصل',
            silent
        );
    }
    
    if (!AdvancedValidator.email(inquiryEmail)) {
        return showError(
            'البريد الإلكتروني للاستفسارات غير صحيح',
            'تأكد من كتابة البريد الإلكتروني بالشكل الصحيح',
            silent
        );
    }
    
    return true;
}

function validateStep3(silent = false) {
    if (state.trainingFields.length === 0) {
        return showError(
            'المجالات التدريبية مطلوبة',
            'يجب إضافة مجال تدريبي واحد على الأقل لتحديد مجالات التدريب المتاحة في الشركة',
            silent
        );
    }
    
    // 🔍 Debug: شوف بالظبط إيه الناقص
    const fieldsDebugInfo = state.trainingFields.map(field => {
        const details = state.trainingDetails[field];
        return {
            field: field,
            exists: !!details,
            duration: details?.duration || '(فارغ)',
            count: details?.count || '(فارغ)',
            minSalary: details?.minSalary || '(فارغ)',
            maxSalary: details?.maxSalary || '(فارغ)',
            supervisor: details?.supervisor || '(فارغ)',
            knowledgeBenefits: details?.knowledgeBenefits ? '✓ (' + details.knowledgeBenefits.length + ' chars)' : '✗ فارغ',
            trainingRequirements: details?.trainingRequirements ? '✓ (' + details.trainingRequirements.length + ' chars)' : '✗ فارغ'
        };
    });
    console.log('📋 validateStep3 - State Details:', fieldsDebugInfo);
    
    const incompleteFields = state.trainingFields.filter(field => {
        const details = state.trainingDetails[field];
        const hasSalaryInfo = details && details.minSalary && details.maxSalary;
        const hasKnowledgeBenefits = details && details.knowledgeBenefits && details.knowledgeBenefits.trim() !== '';
        const hasTrainingRequirements = details && details.trainingRequirements && details.trainingRequirements.trim() !== '';
        const hasBasicInfo = details && details.duration && details.count && details.supervisor;
        
        const missing = [];
        if (!details) missing.push('لا توجد تفاصيل');
        else {
            if (!details.duration) missing.push('المدة');
            if (!details.count) missing.push('عدد المتدربين');
            if (!details.supervisor) missing.push('المشرف');
            if (!details.minSalary) missing.push('الحد الأدنى للراتب');
            if (!details.maxSalary) missing.push('الحد الأقصى للراتب');
            if (!details.knowledgeBenefits || !details.knowledgeBenefits.trim()) missing.push('الميزة المعرفية');
            if (!details.trainingRequirements || !details.trainingRequirements.trim()) missing.push('متطلبات التدريب');
        }
        
        if (missing.length > 0) {
            console.warn(`🔴 Field "${field}" - الناقص:`, missing.join(', '));
        }
        
        return !hasBasicInfo || !hasSalaryInfo || !hasKnowledgeBenefits || !hasTrainingRequirements;
    });
    
    if (incompleteFields.length > 0) {
        // 🔥 نلاقي بالظبط إيه الناقص في كل field
        const detailedMsg = incompleteFields.map(field => {
            const details = state.trainingDetails[field] || {};
            const missing = [];
            if (!details.duration) missing.push('المدة');
            if (!details.count) missing.push('عدد المتدربين');
            if (!details.supervisor) missing.push('المشرف');
            if (!details.minSalary) missing.push('الحد الأدنى للراتب');
            if (!details.maxSalary) missing.push('الحد الأقصى للراتب');
            if (!details.knowledgeBenefits || !details.knowledgeBenefits.trim()) missing.push('الميزة المعرفية');
            if (!details.trainingRequirements || !details.trainingRequirements.trim()) missing.push('متطلبات التدريب');
            return `${field}: ${missing.join('، ')}`;
        }).join(' | ');
        
        return showError(
            'تفاصيل التدريب غير مكتملة',
            `الناقص: ${detailedMsg}`,
            silent
        );
    }
    
    const invalidCountFields = state.trainingFields.filter(field => {
        const details = state.trainingDetails[field];
        return details && (isNaN(details.count) || parseInt(details.count) < 1);
    });
    
    if (invalidCountFields.length > 0) {
        return showError(
            'عدد المتدربين غير صحيح',
            `يجب إدخال عدد صحيح موجب للمتدربين في المجالات: ${invalidCountFields.join(', ')}`,
            silent
        );
    }
    
    if (!state.selectedTraineeType) {
        return showError(
            'نوع المتدربين غير محدد',
            'يجب اختيار نوع المتدربين الذي ترغب في استقبالهم (اضغط على أحد الخيارات الثلاثة)',
            silent
        );
    }
    
    if (state.selectedTraineeType === 'once-trained' || state.selectedTraineeType === 'twice-trained') {
        const fieldsWithoutFinancialBenefits = state.trainingFields.filter(field => {
            const details = state.trainingDetails[field];
            return !details || !details.financialBenefits || details.financialBenefits.trim() === '';
        });
        
        if (fieldsWithoutFinancialBenefits.length > 0) {
            return showError(
                'الميزة المادية مطلوبة',
                `النظام المختار (${state.selectedTraineeType === 'once-trained' ? 'النظام الثاني' : 'النظام الثالث'}) يتطلب تحديد الميزة المادية لكل مجال تدريبي. المجالات التالية تحتاج لإضافة الميزة المادية: ${fieldsWithoutFinancialBenefits.join(', ')}`,
                silent
            );
        }
    }
    
    if (state.selectedTraineeType === 'twice-trained') {
        const fieldsWithInvalidDuration = state.trainingFields.filter(field => {
            const details = state.trainingDetails[field];
            return details && (
                details.duration === '1-month' || 
                details.duration === '1.5-months' || 
                details.duration === '2-months' || 
                details.duration === '2.5-months'
            );
        });
        
        if (fieldsWithInvalidDuration.length > 0) {
            return showError(
                'مدة التدريب غير صحيحة',
                `النظام الثالث يتطلب أن تكون مدة التدريب حتى 3 أسابيع كحد أقصى. المجالات التالية تحتاج للتعديل: ${fieldsWithInvalidDuration.join(', ')}`,
                silent
            );
        }
    }
    
    return true;
}

function validateStep4(silent = false) {
    const maxResponseDays = getValue('maxResponseDays');
    const maxResponseAfterInterview = getValue('maxResponseAfterInterview'); // الحقل الجديد
    const equipmentYes = document.getElementById('equipmentYes');
    const equipmentNo = document.getElementById('equipmentNo');
    const requiredItems = getValue('requiredItems');
    
    if (!maxResponseDays) {
        return showError(
            'الحد الأقصى للرد غير محدد',
            'يجب تحديد الحد الأقصى للوقت الذي ستستغرقه الشركة للرد على طلبات المراجعة',
            silent
        );
    }

    // التحقق من الحقل الجديد: الحد الأقصى للرد على المتدرب بعد المقابلة الشخصية
    if (!maxResponseAfterInterview) {
        return showError(
            'الحد الأقصى للرد بعد المقابلة غير محدد',
            'يجب تحديد الحد الأقصى للوقت الذي ستستغرقه الشركة للرد على المتدرب بعد المقابلة الشخصية',
            silent
        );
    }
    
    if (!equipmentYes && !equipmentNo) {
        return showError(
            'يجب تحديد توفر المعدات',
            'حدد ما إذا كنتم ستوفرون الأجهزة والمعدات للمتدربين أم سيحتاجون لإحضارها',
            silent
        );
    }
    
    if (equipmentNo && equipmentNo.checked && !requiredItems) {
        return showError(
            'متطلبات المتدرب غير محددة',
            'بما أنكم لن توفروا المعدات، يجب تحديد ما الذي سيحتاج المتدرب لإحضاره',
            silent
        );
    }
    
    return true;
}

function validateStep5(silent = false) {
    return true;
}

function validateStep6(silent = false) {
    const contractAgreement = document.getElementById('contractAgreement');
    
    if (!contractAgreement || !contractAgreement.checked) {
        if (!silent) {
            notificationSystem.show(
                'يجب الموافقة على الشروط',
                'يرجى قراءة الشروط والأحكام والموافقة عليها قبل إتمام التسجيل',
                'error'
            );
            const checkboxCard = document.querySelector('.checkbox-card');
            if (checkboxCard) {
                checkboxCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                checkboxCard.style.border = '2px solid #ff6b6b';
                checkboxCard.style.boxShadow = '0 0 15px rgba(255,107,107,0.4)';
                setTimeout(() => {
                    checkboxCard.style.border = '';
                    checkboxCard.style.boxShadow = '';
                }, 3000);
            }
            // إعادة الزرار لحالته الطبيعية
            const submitBtn = document.getElementById('btnSubmit');
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-check"></i> <span>إتمام التسجيل</span>';
                submitBtn.disabled = false;
            }
        }
        return false;
    }
    return true;
}

function showError(title, details, silent = false) {
    if (!silent) {
        notificationSystem.show(title, details, 'error');
    }
    return false;
}

// ============================================
// Helper Functions - ENHANCED
// ============================================
function getValue(id) {
    const element = document.getElementById(id);
    return element ? AdvancedValidator.sanitize(element.value.trim()) : '';
}

// ============================================
// Enhanced Logo Upload
// ============================================
function removeLogo(event) {
    if (event) event.stopPropagation();
    
    const preview = document.getElementById('logoPreview');
    const placeholder = document.querySelector('.logo-placeholder');
    const removeBtn = document.getElementById('logoRemoveBtn');
    const fileInput = document.getElementById('companyLogo');
    
    if (preview) preview.classList.remove('show');
    if (placeholder) placeholder.style.display = 'block';
    if (removeBtn) removeBtn.classList.add('hidden');
    if (fileInput) fileInput.value = '';
    state.companyLogoData = null;
    
    // لا نعرض إشعار إزالة - المستخدم يرى التغيير مباشرة
    saveStateToStorage();
}

// ============================================
// Password Functions - ENHANCED
// ============================================
function checkPasswordStrength() {
    const password = getValue('password');
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');
    
    if (!strengthBar || !strengthText) return;
    
    let strength = 0;
    let strengthLabel = 'ضعيفة';
    let suggestions = [];
    
    if (password.length >= 8) strength++;
    else suggestions.push('أضف 8 أحرف على الأقل');
    
    if (password.match(/[a-z]+/)) strength++;
    else suggestions.push('أضف أحرف صغيرة');
    
    if (password.match(/[A-Z]+/)) strength++;
    else suggestions.push('أضف أحرف كبيرة');
    
    if (password.match(/[0-9]+/)) strength++;
    else suggestions.push('أضف أرقام');
    
    if (password.match(/[@$!%*?&#]+/)) strength++;
    else suggestions.push('أضف رموز خاصة');
    
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
    
    // Show suggestions for weak passwords
    const suggestionsElement = document.getElementById('passwordSuggestions');
    if (suggestionsElement && strength < 4) {
        suggestionsElement.innerHTML = suggestions.map(s => `<div class="suggestion-item"><i class="fas fa-info-circle"></i> ${s}</div>`).join('');
        suggestionsElement.style.display = 'block';
    } else if (suggestionsElement) {
        suggestionsElement.style.display = 'none';
    }
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
        button.setAttribute('aria-label', 'إخفاء كلمة المرور');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
        button.setAttribute('aria-label', 'إظهار كلمة المرور');
    }
}

// ============================================
// 🚀 Training Fields Management - OPTIMIZED
// ============================================

// الدوال المحسنة لإدارة المجالات التدريبية
function optimizedAddTrainingField() {
    const input = document.getElementById('newTrainingField');
    if (!input) return;
    
    const field = AdvancedValidator.sanitize(input.value.trim());
    
    if (!field) {
        notificationSystem.show('المجال فارغ', 'يرجى كتابة اسم المجال التدريبي قبل الإضافة', 'error');
        return;
    }
    
    if (state.trainingFields.includes(field)) {
        notificationSystem.show('مجال مكرر', 'هذا المجال التدريبي مضاف مسبقاً. يرجى إضافة مجال مختلف', 'error');
        return;
    }
    
    // Validate field length
    if (field.length > 50) {
        notificationSystem.show('اسم المجال طويل جداً', 'يجب أن لا يتجاوز اسم المجال 50 حرفاً', 'error');
        return;
    }
    
    state.trainingFields.push(field);
    state.trainingDetails[field] = { 
        duration: '', 
        count: '', 
        minSalary: '',
        maxSalary: '',
        currency: 'EGP',
        otherCurrency: '',
        supervisor: '',
        knowledgeBenefits: '',
        financialBenefits: '',
        trainingRequirements: ''
    };
    
    console.log('Added training field:', field, 'Total fields:', state.trainingFields.length);
    
    // استخدام التحديث الذكي بدلاً من إعادة الرسم الكاملة
    fieldsOptimizer.smartUpdateTrainingFields();
    optimizedUpdateTrainingDetailsSection();
    
    input.value = '';
    input.focus();
    
    // لا نعرض إشعار نجاح - المستخدم يرى الإضافة مباشرة في القائمة
    saveStateToStorage();
}

function optimizedRemoveTrainingField(index) {
    const removedField = state.trainingFields[index];
    state.trainingFields.splice(index, 1);
    delete state.trainingDetails[removedField];
    
    console.log('Removed training field:', removedField, 'Total fields:', state.trainingFields.length);
    
    fieldsOptimizer.smartUpdateTrainingFields();
    optimizedUpdateTrainingDetailsSection();
    
    // لا نعرض إشعار حذف - المستخدم يرى الحذف مباشرة
    saveStateToStorage();
}

function optimizedUpdateTrainingDetailsSection() {
    const section = document.getElementById('trainingDetailsSection');
    const detailsList = domCache.trainingDetailsList;
    
    if (!section || !detailsList) {
        console.error('Training details section or list not found');
        return;
    }
    
    section.classList.toggle('hidden', state.trainingFields.length === 0);
    
    if (state.trainingFields.length === 0) {
        detailsList.innerHTML = '';
        return;
    }
    
    console.log('Updating training details section with', state.trainingFields.length, 'fields');
    
    // استخدام DocumentFragment لتقليل reflows
    const fragment = document.createDocumentFragment();
    
    state.trainingFields.forEach((field) => {
        const details = state.trainingDetails[field] || {};
        const item = createTrainingDetailItem(field, details);
        fragment.appendChild(item);
    });
    
    // تحديث DOM مرة واحدة فقط
    detailsList.innerHTML = '';
    detailsList.appendChild(fragment);
    
    // 🔥 إعادة عرض الميزات من الـ Maps بعد الـ re-render
    // لأن الـ HTML الجديد فيه containers فاضية، محتاج نـ re-populate من الـ Maps
    if (window.fixedFeaturesManager) {
        state.trainingFields.forEach((field) => {
            const sanitized = window.fixedFeaturesManager.sanitizeFieldId(field);
            window.fixedFeaturesManager.updateKnowledgeBenefitsUI(sanitized);
            window.fixedFeaturesManager.updateFinancialBenefitsUI(sanitized);
            window.fixedFeaturesManager.updateTrainingRequirementsUI(sanitized);
        });
    }
    
    // بدء مراقبة العناصر الجديدة للأداء
    performanceOptimizer.observeTrainingDetails();
}

// ============================================
// 🛠️ دوال الإضافة المحسنة
// ============================================

// إضافة ميزة معرفية
function addKnowledgeBenefit(field) {
    console.log('🔵 addKnowledgeBenefit called with field:', field);
    
    const sanitized = fixedFeaturesManager.sanitizeFieldId(field);
    
    let input = document.getElementById(`knowledgeBenefitInput-${sanitized}`);
    if (!input) input = document.getElementById(`knowledgeBenefitInput-${field}`);
    
    if (!input) {
        const allInputs = document.querySelectorAll('[id^="knowledgeBenefitInput-"]');
        for (const inp of allInputs) {
            const inputField = inp.id.replace('knowledgeBenefitInput-', '');
            if (inputField === field || inputField === sanitized) {
                input = inp;
                break;
            }
        }
    }
    
    if (!input) {
        console.warn('Knowledge input not found for:', field);
        return;
    }

    const benefit = input.value.trim();
    if (!benefit) {
        notificationSystem.show('الميزة فارغة', 'يرجى كتابة الميزة المعرفية قبل الإضافة', 'error');
        return;
    }

    const success = fixedFeaturesManager.addKnowledgeBenefit(field, benefit);
    if (success) {
        input.value = '';
        input.focus();
        saveStateToStorage();
    }
}

// إضافة ميزة مادية
function addFinancialBenefit(field) {
    console.log('🟢 addFinancialBenefit called with field:', field);
    
    const sanitized = fixedFeaturesManager.sanitizeFieldId(field);
    console.log('🟢 Sanitized field:', sanitized);
    
    // جرب كل الـ id formats
    let input = document.getElementById(`financialBenefitInput-${sanitized}`);
    if (!input) input = document.getElementById(`financialBenefitInput-${field}`);
    
    // fallback: لو لسه مش لاقي، نلاقي أي input بـ id يبدأ بـ financialBenefitInput
    if (!input) {
        const allInputs = document.querySelectorAll('[id^="financialBenefitInput-"]');
        console.warn('🔴 Input not found by exact ID. Available IDs:', 
            Array.from(allInputs).map(i => i.id));
        
        // جرب match by partial
        for (const inp of allInputs) {
            const inputField = inp.id.replace('financialBenefitInput-', '');
            if (inputField === field || inputField === sanitized || 
                inputField.toLowerCase() === field.toLowerCase()) {
                input = inp;
                console.log('🟡 Found by fallback match:', inp.id);
                break;
            }
        }
    }
    
    if (!input) {
        console.error('🔴 Financial input not found for:', field);
        if (typeof notificationSystem !== 'undefined') {
            notificationSystem.show('خطأ', 'لم يتم إيجاد حقل الإدخال', 'error');
        }
        return;
    }

    const benefit = input.value.trim();
    console.log('🟢 Benefit value:', benefit);
    
    if (!benefit) {
        notificationSystem.show('الميزة فارغة', 'يرجى كتابة الميزة المادية قبل الإضافة', 'error');
        return;
    }

    console.log('🟢 Calling fixedFeaturesManager.addFinancialBenefit...');
    const success = fixedFeaturesManager.addFinancialBenefit(field, benefit);
    console.log('🟢 Success:', success);
    
    if (success) {
        input.value = '';
        input.focus();
        saveStateToStorage();
        console.log('🟢 ✅ Done!');
    } else {
        console.warn('🟡 fixedFeaturesManager returned false (duplicate or empty)');
    }
}

// إضافة متطلب تدريبي
function addTrainingRequirement(field) {
    console.log('🟡 addTrainingRequirement called with field:', field);
    
    const sanitized = fixedFeaturesManager.sanitizeFieldId(field);
    
    let input = document.getElementById(`trainingRequirementInput-${sanitized}`);
    if (!input) input = document.getElementById(`trainingRequirementInput-${field}`);
    
    if (!input) {
        const allInputs = document.querySelectorAll('[id^="trainingRequirementInput-"]');
        for (const inp of allInputs) {
            const inputField = inp.id.replace('trainingRequirementInput-', '');
            if (inputField === field || inputField === sanitized) {
                input = inp;
                break;
            }
        }
    }
    
    if (!input) {
        console.warn('Training requirement input not found for:', field);
        return;
    }

    const requirement = input.value.trim();
    if (!requirement) {
        if (typeof notificationSystem !== 'undefined') {
            notificationSystem.show('المتطلب فارغ', 'يرجى كتابة متطلب التدريب قبل الإضافة', 'error');
        }
        return;
    }

    const success = fixedFeaturesManager.addTrainingRequirement(field, requirement);
    if (success) {
        input.value = '';
        input.focus();
        saveStateToStorage();
    }
}

// ============================================
// 🛠️ دالة إنشاء تفاصيل التدريب المحسنة
// ============================================
function createTrainingDetailItem(field, details) {
    const item = document.createElement('div');
    item.className = 'training-detail-item';
    
    const isFinancialBenefitsRequired = state.selectedTraineeType === 'once-trained' || state.selectedTraineeType === 'twice-trained';
    const requiredAttribute = isFinancialBenefitsRequired ? 'required' : '';
    const requiredStar = isFinancialBenefitsRequired ? '<span style="color: var(--error); margin-right: 4px;">*</span>' : '';
    
    const durationOptions = getDurationOptionsBasedOnType(details.duration);
    
    item.innerHTML = `
        <div class="detail-header">
            <div class="detail-icon">
                <i class="fas fa-graduation-cap"></i>
            </div>
            <div class="detail-name">${AdvancedValidator.sanitizeHTML(field)}</div>
            <div class="detail-status ${isDetailComplete(details) ? 'completed' : 'pending'}">
                <i class="fas ${isDetailComplete(details) ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                <span>${isDetailComplete(details) ? 'مكتمل' : 'غير مكتمل'}</span>
            </div>
        </div>
        <div class="detail-controls">
            <div class="detail-control">
                <label class="detail-label">
                    <i class="fas fa-clock"></i>
                    مدة التدريب
                </label>
                <div class="select-wrapper">
                    <select class="form-select" onchange="updateFieldDuration('${AdvancedValidator.sanitizeHTML(field)}', this.value)" aria-label="مدة التدريب لـ ${AdvancedValidator.sanitizeHTML(field)}">
                        ${durationOptions}
                    </select>
                    <div class="select-arrow">
                        <i class="fas fa-chevron-down"></i>
                    </div>
                </div>
                ${state.selectedTraineeType === 'twice-trained' ? `
                <div class="form-tips" style="margin-top: 8px;">
                    <div class="tip-item">
                        <i class="fas fa-info-circle"></i>
                        <span>النظام الثالث يتطلب مدة تدريب حتى 3 أسابيع كحد أقصى</span>
                    </div>
                </div>
                ` : ''}
            </div>
            <div class="detail-control">
                <label class="detail-label">
                    <i class="fas fa-users"></i>
                    عدد المتدربين
                </label>
                <div class="input-wrapper">
                    <input type="number" class="form-input" placeholder="أدخل عدد المتدربين" min="1" onchange="updateFieldCount('${AdvancedValidator.sanitizeHTML(field)}', this.value)" value="${details.count || ''}" aria-label="عدد المتدربين لـ ${AdvancedValidator.sanitizeHTML(field)}">
                    <div class="input-border"></div>
                </div>
            </div>
        </div>
        <div class="detail-controls" style="margin-top: 15px;">
            <div class="detail-control">
                <label class="detail-label">
                    <i class="fas fa-user-tie"></i>
                    المشرف على التدريب
                </label>
                <div class="supervisor-input">
                    <div class="input-wrapper">
                        <input type="text" class="form-input" placeholder="اسم المشرف على التدريب" onchange="updateFieldSupervisor('${AdvancedValidator.sanitizeHTML(field)}', this.value)" value="${details.supervisor || ''}" aria-label="المشرف على التدريب لـ ${AdvancedValidator.sanitizeHTML(field)}">
                        <div class="input-border"></div>
                    </div>
                    <div class="supervisor-icon">
                        <i class="fas fa-user-tie"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="detail-controls" style="margin-top: 15px;">
            <div class="detail-control">
                <label class="detail-label required">
                    <i class="fas fa-money-bill-wave"></i>
                    الراتب بعد التعيين
                </label>
                <div class="salary-inputs">
                    <div class="salary-input">
                        <div class="input-wrapper">
                            <input type="number" class="form-input" placeholder="الحد الأدنى" min="0" onchange="updateMinSalary('${AdvancedValidator.sanitizeHTML(field)}', this.value)" value="${details.minSalary || ''}" required aria-label="الحد الأدنى للراتب لـ ${AdvancedValidator.sanitizeHTML(field)}">
                            <div class="input-border"></div>
                        </div>
                        <div class="salary-icon">
                            <i class="fas fa-money-bill"></i>
                        </div>
                    </div>
                    <div class="salary-input">
                        <div class="input-wrapper">
                            <input type="number" class="form-input" placeholder="الحد الأقصى" min="0" onchange="updateMaxSalary('${AdvancedValidator.sanitizeHTML(field)}', this.value)" value="${details.maxSalary || ''}" required aria-label="الحد الأقصى للراتب لـ ${AdvancedValidator.sanitizeHTML(field)}">
                            <div class="input-border"></div>
                        </div>
                        <div class="salary-icon">
                            <i class="fas fa-money-bill"></i>
                        </div>
                    </div>
                </div>
                <div class="currency-group">
                    <div class="select-wrapper">
                        <select class="form-select" onchange="updateSalaryCurrency('${AdvancedValidator.sanitizeHTML(field)}', this.value)" aria-label="عملة الراتب لـ ${AdvancedValidator.sanitizeHTML(field)}">
                            <option value="EGP" ${details.currency === 'EGP' ? 'selected' : ''}>جنيه مصري (EGP)</option>
                            <option value="USD" ${details.currency === 'USD' ? 'selected' : ''}>دولار أمريكي (USD)</option>
                            <option value="EUR" ${details.currency === 'EUR' ? 'selected' : ''}>يورو (EUR)</option>
                            <option value="other" ${details.currency === 'other' ? 'selected' : ''}>عملة أخرى</option>
                        </select>
                        <div class="select-arrow">
                            <i class="fas fa-chevron-down"></i>
                        </div>
                    </div>
                    <div class="other-currency-input ${details.currency === 'other' ? '' : 'hidden'}" id="otherCurrencyGroup-${AdvancedValidator.sanitizeHTML(field)}">
                        <div class="input-wrapper" style="margin-top: 10px;">
                            <input type="text" class="form-input" placeholder="اكتب اسم العملة" onchange="updateOtherCurrency('${AdvancedValidator.sanitizeHTML(field)}', this.value)" value="${details.otherCurrency || ''}" aria-label="اسم العملة الأخرى لـ ${AdvancedValidator.sanitizeHTML(field)}">
                            <div class="input-border"></div>
                        </div>
                    </div>
                </div>
                <div class="form-tips" style="margin-top: 10px;">
                    <div class="tip-item">
                        <i class="fas fa-info-circle"></i>
                        <span><strong>هذا الحقل إلزامي في جميع الأنظمة:</strong> يجب تحديد نطاق الراتب المحتمل في حال قررت الشركة تعيين المتدرب بعد انتهاء فترة التدريب. التعيين نفسه <strong>ليس إلزامياً</strong>، لكن تحديد نطاق الراتب يساعد المتدربين على اتخاذ قرار التقديم.</span>
                    </div>
                    <div class="tip-item">
                        <i class="fas fa-check-circle"></i>
                        <span>تحديد نطاق الراتب يزيد من فرص جذب المتدربين المتميزين ويوضح توقعات الشركة بشكل شفاف</span>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- قسم الميزة المعرفية -->
        <div class="detail-controls" style="margin-top: 15px;">
            <div class="detail-control full-width" style="grid-column: 1 / -1;">
                <label class="detail-label required">
                    <i class="fas fa-brain"></i>
                    الميزة المعرفية المكتسبة من التدريب
                </label>
                <div class="features-input-group">
                    <div class="input-wrapper" style="flex: 1;">
                        <input type="text" id="knowledgeBenefitInput-${fixedFeaturesManager.sanitizeFieldId(field)}" class="form-input" placeholder="ما هي المهارات والمعرفة التي سيحصل عليها المتدرب؟" aria-label="إضافة ميزة معرفية لـ ${AdvancedValidator.sanitizeHTML(field)}">
                        <div class="input-border"></div>
                    </div>
                    <button type="button" class="btn-add btn-add-knowledge" data-field="${fixedFeaturesManager.sanitizeFieldId(field)}">
                        <i class="fas fa-plus"></i>
                        <span>إضافة</span>
                    </button>
                </div>
                <div id="knowledgeBenefitsList-${fixedFeaturesManager.sanitizeFieldId(field)}" class="features-list">
                    <div class="empty-features-state">
                        <i class="fas fa-brain"></i>
                        <p>لم تتم إضافة أي ميزة معرفية بعد</p>
                    </div>
                </div>
                <div class="form-tips">
                    <h4><i class="fas fa-lightbulb"></i> نصائح للكتابة:</h4>
                    <div class="tip-item">
                        <i class="fas fa-check"></i>
                        <span>اذكر المهارات التقنية والشخصية التي سيتم تطويرها</span>
                    </div>
                    <div class="tip-item">
                        <i class="fas fa-check"></i>
                        <span>صف المشاريع والتحديات التي سيعمل عليها المتدرب</span>
                    </div>
                    <div class="tip-item">
                        <i class="fas fa-check"></i>
                        <span>أبرز فرص النمو والتطوير المهني المتاحة</span>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- قسم الميزة المادية -->
        <div class="detail-controls" style="margin-top: 15px;">
            <div class="detail-control full-width" style="grid-column: 1 / -1;">
                <label class="detail-label ${isFinancialBenefitsRequired ? 'required' : ''}">
                    ${requiredStar}
                    <i class="fas fa-money-bill-wave"></i>
                    الميزة المادية ${isFinancialBenefitsRequired ? '' : '(اختياري)'}
                </label>
                <div class="features-input-group">
                    <div class="input-wrapper" style="flex: 1;">
                        <input type="text" id="financialBenefitInput-${fixedFeaturesManager.sanitizeFieldId(field)}" class="form-input" placeholder="هل تقدم مكافآت مالية أو بدائل نقل أو وجبات؟" aria-label="إضافة ميزة مادية لـ ${AdvancedValidator.sanitizeHTML(field)}">
                        <div class="input-border"></div>
                    </div>
                    <button type="button" class="btn-add btn-add-financial" data-field="${fixedFeaturesManager.sanitizeFieldId(field)}">
                        <i class="fas fa-plus"></i>
                        <span>إضافة</span>
                    </button>
                </div>
                <div id="financialBenefitsList-${fixedFeaturesManager.sanitizeFieldId(field)}" class="features-list">
                    <div class="empty-features-state">
                        <i class="fas fa-money-bill-wave"></i>
                        <p>لم تتم إضافة أي ميزة مادية بعد</p>
                    </div>
                </div>
                ${isFinancialBenefitsRequired ? `
                <div class="form-tips">
                    <div class="tip-item">
                        <i class="fas fa-info-circle"></i>
                        <span>هذا الحقل <strong>إلزامي</strong> للنظام المختار. يجب تحديد الميزة المادية التي تقدمها الشركة للمتدربين.</span>
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
        
        <!-- قسم  مواصفات المتدرب -->
        <div class="detail-controls" style="margin-top: 15px;">
            <div class="detail-control full-width" style="grid-column: 1 / -1;">
                <label class="detail-label required">
                    <i class="fas fa-user-check"></i>
                    مواصفات المتدرب
                </label>
                <div class="features-input-group">
                    <div class="input-wrapper" style="flex: 1;">
                        <input type="text" id="trainingRequirementInput-${fixedFeaturesManager.sanitizeFieldId(field)}" class="form-input" placeholder="ما هي مواصفات المتدرب المطلوبة لهذا المجال؟" aria-label="إضافة متطلب تدريبي لـ ${AdvancedValidator.sanitizeHTML(field)}">
                        <div class="input-border"></div>
                    </div>
                    <button type="button" class="btn-add btn-add-requirement" data-field="${fixedFeaturesManager.sanitizeFieldId(field)}">
                        <i class="fas fa-plus"></i>
                        <span>إضافة</span>
                    </button>
                </div>
                <div id="trainingRequirementsList-${fixedFeaturesManager.sanitizeFieldId(field)}" class="features-list">
                    <div class="empty-features-state">
                        <i class="fas fa-user-check"></i>
                        <p>لم تتم إضافة أي متطلب تدريبي بعد</p>
                    </div>
                </div>
                <div class="form-tips">
                    <h4><i class="fas fa-lightbulb"></i> نصائح للكتابة:</h4>
                    <div class="tip-item">
                        <i class="fas fa-check"></i>
                        <span>حدد المؤهلات التعليمية المطلوبة (تخصص، سنة دراسية...)</span>
                    </div>
                    <div class="tip-item">
                        <i class="fas fa-check"></i>
                        <span>اذكر المعرفة النظرية المطلوبة (أساسيات برمجة، أساسيات التصميم .....)</span>
                    </div>
                    <div class="tip-item">
                        <i class="fas fa-check"></i>
                        <span>اذكر الصفات الشخصية التي تبحث عنها في المتدرب</span>
                    </div>
                    <div class="tip-item">
                        <i class="fas fa-check"></i>
                        <span>حدد اللغات المطلوبة ومستواها</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 🔧 إصلاح: تحميل البيانات بعد فترة بسيطة
    setTimeout(() => {
        if (details.knowledgeBenefits) {
            const benefits = details.knowledgeBenefits.split('\n').filter(b => b.trim());
            benefits.forEach(benefit => fixedFeaturesManager.addKnowledgeBenefit(field, benefit));
        }
        
        if (details.financialBenefits) {
            const benefits = details.financialBenefits.split('\n').filter(b => b.trim());
            benefits.forEach(benefit => fixedFeaturesManager.addFinancialBenefit(field, benefit));
        }
        
        if (details.trainingRequirements) {
            const requirements = details.trainingRequirements.split('\n').filter(r => r.trim());
            requirements.forEach(requirement => fixedFeaturesManager.addTrainingRequirement(field, requirement));
        }
    }, 100);
    
    return item;
}

// ============================================
// 🛠️ دوال التحقق والتحديث
// ============================================

// تحديث دالة التحقق من اكتمال التفاصيل
function isDetailComplete(details) {
    const hasKnowledgeBenefits = details.knowledgeBenefits && details.knowledgeBenefits.trim() !== '';
    const hasFinancialBenefits = details.financialBenefits && details.financialBenefits.trim() !== '';
    const hasTrainingRequirements = details.trainingRequirements && details.trainingRequirements.trim() !== '';
    
    return details.duration && details.count && details.supervisor && 
           details.minSalary && details.maxSalary &&
           hasKnowledgeBenefits && hasTrainingRequirements &&
           (state.selectedTraineeType === 'first-time' || hasFinancialBenefits);
}

function getDurationOptionsBasedOnType(selectedDuration) {
    if (state.selectedTraineeType === 'twice-trained') {
        return `
            <option value="">اختر المدة</option>
            <option value="2-weeks" ${selectedDuration === '2-weeks' ? 'selected' : ''}>أسبوعين</option>
            <option value="3-weeks" ${selectedDuration === '3-weeks' ? 'selected' : ''}>3 أسابيع</option>
        `;
    }
    
    return `
        <option value="">اختر المدة</option>
        <option value="2-weeks" ${selectedDuration === '2-weeks' ? 'selected' : ''}>أسبوعين</option>
        <option value="3-weeks" ${selectedDuration === '3-weeks' ? 'selected' : ''}>3 أسابيع</option>
        <option value="1-month" ${selectedDuration === '1-month' ? 'selected' : ''}>شهر واحد</option>
        <option value="1.5-months" ${selectedDuration === '1.5-months' ? 'selected' : ''}>شهر ونصف</option>
        <option value="2-months" ${selectedDuration === '2-months' ? 'selected' : ''}>شهرين</option>
        <option value="2.5-months" ${selectedDuration === '2.5-months' ? 'selected' : ''}>شهرين ونصف</option>
    `;
}

// Helper: نلاقي الـ raw key في state.trainingDetails بمقارنة أشكال مختلفة
function resolveTrainingFieldKey(field) {
    if (!state.trainingDetails) return null;
    // 1. raw match
    if (state.trainingDetails[field]) return field;
    // 2. decode HTML entities
    const decoded = (function() {
        const txt = document.createElement('textarea');
        txt.innerHTML = field;
        return txt.value;
    })();
    if (decoded !== field && state.trainingDetails[decoded]) return decoded;
    // 3. sanitized match
    if (window.fixedFeaturesManager) {
        const sanitized = window.fixedFeaturesManager.sanitizeFieldId(field);
        if (state.trainingDetails[sanitized]) return sanitized;
        // 4. reverse lookup: لأي field في trainingFields، شوف لو sanitized بتاعه يطابق
        const found = (state.trainingFields || []).find(f => {
            return window.fixedFeaturesManager.sanitizeFieldId(f) === field
                || window.fixedFeaturesManager.sanitizeFieldId(f) === sanitized
                || f === decoded;
        });
        if (found) return found;
    }
    return null;
}

function updateFieldDuration(field, duration) {
    const key = resolveTrainingFieldKey(field);
    if (key && state.trainingDetails[key]) {
        state.trainingDetails[key].duration = duration;
        optimizedUpdateTrainingDetailsSection();
        saveStateToStorage();
    } else {
        console.warn('🔴 updateFieldDuration: state key not found for', field);
    }
}

function updateFieldCount(field, count) {
    const key = resolveTrainingFieldKey(field);
    if (key && state.trainingDetails[key]) {
        state.trainingDetails[key].count = count;
        optimizedUpdateTrainingDetailsSection();
        saveStateToStorage();
    } else {
        console.warn('🔴 updateFieldCount: state key not found for', field);
    }
}

function updateFieldSupervisor(field, supervisor) {
    const key = resolveTrainingFieldKey(field);
    if (key && state.trainingDetails[key]) {
        state.trainingDetails[key].supervisor = AdvancedValidator.sanitize(supervisor);
        optimizedUpdateTrainingDetailsSection();
        saveStateToStorage();
    } else {
        console.warn('🔴 updateFieldSupervisor: state key not found for', field);
    }
}

function updateMinSalary(field, minSalary) {
    const key = resolveTrainingFieldKey(field);
    if (key && state.trainingDetails[key]) {
        state.trainingDetails[key].minSalary = minSalary;
        saveStateToStorage();
    } else {
        console.warn('🔴 updateMinSalary: state key not found for', field);
    }
}

function updateMaxSalary(field, maxSalary) {
    const key = resolveTrainingFieldKey(field);
    if (key && state.trainingDetails[key]) {
        state.trainingDetails[key].maxSalary = maxSalary;
        saveStateToStorage();
    } else {
        console.warn('🔴 updateMaxSalary: state key not found for', field);
    }
}

function updateSalaryCurrency(field, currency) {
    const key = resolveTrainingFieldKey(field);
    if (key && state.trainingDetails[key]) {
        state.trainingDetails[key].currency = currency;
        
        const otherCurrencyGroup = document.getElementById(`otherCurrencyGroup-${field}`)
                                || document.getElementById(`otherCurrencyGroup-${key}`);
        if (otherCurrencyGroup) {
            if (currency === 'other') {
                otherCurrencyGroup.classList.remove('hidden');
            } else {
                otherCurrencyGroup.classList.add('hidden');
                state.trainingDetails[key].otherCurrency = '';
            }
        }
        
        optimizedUpdateTrainingDetailsSection();
        saveStateToStorage();
    }
}

function updateOtherCurrency(field, otherCurrency) {
    const key = resolveTrainingFieldKey(field);
    if (key && state.trainingDetails[key]) {
        state.trainingDetails[key].otherCurrency = AdvancedValidator.sanitize(otherCurrency);
        saveStateToStorage();
    }
}

function updateKnowledgeBenefits(field, knowledgeBenefits) {
    if (state.trainingDetails[field]) {
        state.trainingDetails[field].knowledgeBenefits = AdvancedValidator.sanitize(knowledgeBenefits);
        optimizedUpdateTrainingDetailsSection();
        saveStateToStorage(); // حفظ بدون إشعار
    }
}

function updateFinancialBenefits(field, financialBenefits) {
    if (state.trainingDetails[field]) {
        state.trainingDetails[field].financialBenefits = AdvancedValidator.sanitize(financialBenefits);
        optimizedUpdateTrainingDetailsSection();
        saveStateToStorage(); // حفظ بدون إشعار
    }
}

// دالة تحديث متطلبات التدريب
function updateTrainingRequirements(field, value) {
    if (state.trainingDetails[field]) {
        state.trainingDetails[field].trainingRequirements = AdvancedValidator.sanitize(value);
        optimizedUpdateTrainingDetailsSection();
        saveStateToStorage(); // حفظ بدون إشعار
    }
}

function getDurationText(duration) {
    const durations = {
        '2-weeks': 'أسبوعين',
        '3-weeks': '3 أسابيع',
        '1-month': 'شهر واحد',
        '1.5-months': 'شهر ونصف',
        '2-months': 'شهرين',
        '2.5-months': 'شهرين ونصف'
    };
    return durations[duration] || duration;
}

// ============================================
// Branch Locations Management - OPTIMIZED
// ============================================
function addBranchLocation() {
    const branchFullAddress = getValue('branchFullAddress');
    
    if (!branchFullAddress) {
        notificationSystem.show(
            'العنوان مطلوب',
            'يجب إدخال العنوان الكامل للفرع',
            'error'
        );
        return;
    }
    
    if (!state.branchLocations) {
        state.branchLocations = [];
    }
    
    const branch = {
        fullAddress: AdvancedValidator.sanitize(branchFullAddress)
    };
    
    const isDuplicate = state.branchLocations.some(existingBranch => 
        existingBranch.fullAddress === branch.fullAddress
    );
    
    if (isDuplicate) {
        notificationSystem.show(
            'فرع مكرر',
            'هذا الفرع مضاف مسبقاً بنفس العنوان',
            'error'
        );
        return;
    }
    
    state.branchLocations.push(branch);
    updateBranchLocationsList();
    
    document.getElementById('branchFullAddress').value = '';
    // لا نعرض إشعار نجاح - المستخدم يرى الإضافة مباشرة في القائمة
    saveStateToStorage();
}

function removeBranchLocation(index) {
    const removedBranch = state.branchLocations[index];
    state.branchLocations.splice(index, 1);
    
    updateBranchLocationsList();
    
    // لا نعرض إشعار حذف - المستخدم يرى الحذف مباشرة
    saveStateToStorage();
}

function updateBranchLocationsList() {
    const list = domCache.branchLocationsList;
    if (!list) return;
    
    if (!state.branchLocations || state.branchLocations.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-map-marker-alt"></i>
                </div>
                <h4>لم تتم إضافة أي فرع بعد</h4>
                <p>ابدأ بإضافة الفروع المتاحة للتدريب في شركتك</p>
            </div>
        `;
        return;
    }
    
    const fragment = document.createDocumentFragment();
    
    state.branchLocations.forEach((branch, index) => {
        const branchDetail = document.createElement('div');
        branchDetail.className = 'branch-detail';
        branchDetail.innerHTML = `
            <div class="branch-header">
                <div class="branch-name">فرع ${index + 1}</div>
                <button type="button" class="field-tag" onclick="removeBranchLocation(${index})" style="margin-right: auto;" aria-label="حذف فرع ${index + 1}">
                    <span>حذف</span>
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="branch-address">
                <strong>العنوان:</strong> ${AdvancedValidator.sanitizeHTML(branch.fullAddress)}
            </div>
        `;
        fragment.appendChild(branchDetail);
    });
    
    list.innerHTML = '';
    list.appendChild(fragment);
}

// ============================================
// Trainee Type Selection - ENHANCED
// ============================================
function selectTraineeType(type, element) {
    state.selectedTraineeType = type;
    
    document.querySelectorAll('.trainee-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    if (element) {
        element.classList.add('selected');
    }
    
    updateTraineeExplanation(type);
    optimizedUpdateTrainingDetailsSection();
    
    // لا نعرض إشعار نجاح - المستخدم يرى الاختيار مباشرة
    saveStateToStorage();
}

function showTraineeInfo(type, event) {
    if (event) {
        event.stopPropagation();
    }
    updateTraineeExplanation(type);
    
    const explanation = document.getElementById('financialExplanation');
    if (explanation) {
        explanation.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function updateTraineeExplanation(type) {
    const explanationContent = document.querySelector('.explanation-content');
    const explanationBox = document.getElementById('financialExplanation');
    
    if (!explanationContent || !explanationBox) return;
    
    explanationBox.classList.add('active');
    
    const explanations = {
        'first-time': `
            <div style="padding: 20px; background: rgba(0, 217, 255, 0.1); border-radius: 12px; border: 2px solid rgba(0, 217, 255, 0.3);">
                <h5 style="color: var(--primary); margin-bottom: 15px; font-size: 1.3rem; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-star"></i> النظام الأول - متدرب لأول مرة
                </h5>
                <div style="margin-bottom: 15px;">
                    <strong style="color: var(--text-primary); font-size: 1.05rem;">من هو:</strong>
                    <p style="margin: 8px 0; line-height: 1.8;">طالب أو خريج ليس لديه أي خبرة تدريب سابقة. هذا هو تدريبه الأول في بيئة عمل حقيقية.</p>
                </div>
                <div style="margin-bottom: 15px; padding: 15px; background: rgba(81, 207, 102, 0.15); border-radius: 10px;">
                    <strong style="color: var(--success); font-size: 1.05rem; display: block; margin-bottom: 8px;">النظام المالي:</strong>
                    <ul style="margin: 0; padding-right: 20px; line-height: 1.8;">
                        <li>الشركة تحصل على <strong style="color: var(--success);">25% من رسوم التدريب</strong></li>
                        <li>يدفع المتدرب رسوم التدريب لمنصة ProVance</li>
                        <li>الشركة تستفيد مالياً من كل متدرب</li>
                    </ul>
                </div>
                <div style="padding: 12px; background: rgba(255, 255, 255, 0.05); border-radius: 8px; border-right: 4px solid var(--primary);">
                    <strong style="color: var(--primary);">الشروط:</strong>
                    <p style="margin: 8px 0; line-height: 1.6;"><strong>الحقول الإلزامية:</strong> الراتب بعد التعيين، الميزة المعرفية، المشرف، عدد المتدربين، مدة التدريب، متطلبات التدريب</p>
                </div>
            </div>
        `,
        'once-trained': `
            <div style="padding: 20px; background: rgba(77, 171, 247, 0.1); border-radius: 12px; border: 2px solid rgba(77, 171, 247, 0.3);">
                <h5 style="color: var(--info); margin-bottom: 15px; font-size: 1.3rem; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-user-graduate"></i> النظام الثاني - متدرب ذو خبرة
                </h5>
                <div style="margin-bottom: 15px;">
                    <strong style="color: var(--text-primary); font-size: 1.05rem;">من هو:</strong>
                    <p style="margin: 8px 0; line-height: 1.8;">متدرب سبق له التدريب في شركة واحدة فقط. لديه أساس معرفي بسيط في المجال ويفهم بيئة العمل.</p>
                </div>
                <div style="margin-bottom: 15px; padding: 15px; background: rgba(77, 171, 247, 0.15); border-radius: 10px;">
                    <strong style="color: var(--info); font-size: 1.05rem; display: block; margin-bottom: 8px;">النظام المالي:</strong>
                    <ul style="margin: 0; padding-right: 20px; line-height: 1.8;">
                        <li><strong style="color: var(--text-primary);">خدمة مجانية تماماً</strong></li>
                        <li>لا تدفع الشركة أي رسوم</li>
                        <li>الشركة تقدم مقابل مادي (ليس بالضرورة مال، يمكن بدائل مثل مواصلات)</li>
                        <li>تقدم الشركة الميزة المعرفية بالإضافة إلى الميزة المادية</li>
                    </ul>
                </div>
                <div style="padding: 12px; background: rgba(255, 255, 255, 0.05); border-radius: 8px; border-right: 4px solid var(--info);">
                    <strong style="color: var(--info);">الشروط:</strong>
                    <ul style="margin: 8px 0; padding-right: 20px; line-height: 1.6;">
                        <li><strong>الحقول الإلزامية:</strong> الراتب بعد التعيين، الميزة المعرفية، الميزة المادية، المشرف، عدد المتدربين، مدة التدريب، متطلبات التدريب</li>
                    </ul>
                </div>
            </div>
        `,
        'twice-trained': `
            <div style="padding: 20px; background: rgba(255, 107, 107, 0.1); border-radius: 12px; border: 2px solid rgba(255, 107, 107, 0.3);">
                <h5 style="color: var(--error); margin-bottom: 15px; font-size: 1.3rem; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-briefcase"></i> النظام الثالث - متدرب متمرس (Training)
                </h5>
                <div style="margin-bottom: 15px;">
                    <strong style="color: var(--text-primary); font-size: 1.05rem;">من هو:</strong>
                    <p style="margin: 8px 0; line-height: 1.8;">متدرب ذو خبرة تدريب في شركتين أو أكثر. يمتلك خبرة عملية جيدة وجاهز للإنتاجية. مدة التدريب اختيارية حتى 3 أسابيع كحد أقصى.</p>
                </div>
                <div style="margin-bottom: 15px; padding: 15px; background: rgba(255, 107, 107, 0.15); border-radius: 10px;">
                    <strong style="color: var(--error); font-size: 1.05rem; display: block; margin-bottom: 8px;">النظام المالي:</strong>
                    <ul style="margin: 0; padding-right: 20px; line-height: 1.8;">
                        <li>الشركة تدفع <strong style="color: var(--error);">25% من رسوم التدريب</strong></li>
                        <li>الشركة تقدم مقابل مادي (مواصلات، بدل معيشة، إلخ)</li>
                        <li>استثمار في موهبة جاهزة للتوظيف</li>
                        <li>تكلفة أقل من توظيف موظف جديد</li>
                        <li>مدة التدريب: اختيارية حتى 3 أسابيع كحد أقصى</li>
                    </ul>
                </div>
                <div style="padding: 12px; background: rgba(255, 255, 255, 0.05); border-radius: 8px; border-right: 4px solid var(--error);">
                    <strong style="color: var(--error);">الشروط:</strong>
                    <ul style="margin: 8px 0; padding-right: 20px; line-height: 1.6;">
                        <li><strong>الحقول الإلزامية:</strong> الراتب بعد التعيين، الميزة المعرفية، الميزة المادية، المشرف، عدد المتدربين، مدة التدريب، متطلبات التدريب</li>
                        <li>مدة التدريب يجب أن تكون <strong>حتى 3 أسابيع كحد أقصى</strong></li>
                        <li>اسم النظام: <strong>Training</strong> وليس Internship</li>
                    </ul>
                </div>
            </div>
        `
    };
    
    explanationContent.innerHTML = explanations[type] || '<p class="default-text">اختر أحد الخيارات لرؤية التفاصيل</p>';
    explanationContent.classList.add('active');
}

function hideFinancialExplanation() {
    const explanationBox = document.getElementById('financialExplanation');
    if (explanationBox) {
        explanationBox.classList.remove('active');
    }
}

// ============================================
// Enhanced Summary Generation
// ============================================
function generateSummary() {
    const summaryContent = document.getElementById('summaryContent');
    if (!summaryContent) return;
    
    const loader = LoadingManager.show(summaryContent, 'جاري تجهيز الملخص...');
    
    setTimeout(() => {
        const summary = buildSummaryContent();
        summaryContent.innerHTML = summary;
        LoadingManager.hide(loader);
        
        // Add print functionality
        addPrintFunctionality();
    }, 1000);
}

function buildSummaryContent() {
    const companyName = getValue('companyName');
    const email = getValue('email');
    const companyField = getValue('companyField');
    const companyLocation = getValue('companyLocation');
    const employeesCount = getValue('employeesCount');
    const exactEmployeeCount = getValue('exactEmployeeCount');
    const hasMultipleBranches = document.querySelector('input[name="hasMultipleBranches"]:checked');
    const branchesCount = getValue('branchesCount');
    const primaryPhone = getValue('primaryPhone');
    const inquiryEmail = getValue('inquiryEmail');
    const maxResponseDays = getValue('maxResponseDays');
    const maxResponseAfterInterview = getValue('maxResponseAfterInterview'); // الحقل الجديد
    const equipmentYes = document.getElementById('equipmentYes');
    const equipmentNo = document.getElementById('equipmentNo');
    const requiredItems = getValue('requiredItems');
    const isStartup = document.getElementById('startupCheck')?.checked || false;
    
    const traineeTypeNames = {
        'first-time': 'النظام الأول - متدرب لأول مرة',
        'once-trained': 'النظام الثاني - متدرب ذو خبرة',
        'twice-trained': 'النظام الثالث - متدرب متمرس (Training)'
    };
    
    const equipmentStatus = equipmentYes && equipmentYes.checked ? 'نعم، نوفر جميع المعدات' : 
                          equipmentNo && equipmentNo.checked ? 'لا، المتدرب يحضر معداته' : 'غير محدد';
    
    const branchesStatus = hasMultipleBranches && hasMultipleBranches.value === 'yes' ? 
                         `نعم، ${branchesCount} فرع إجمالي` : 'لا، فرع واحد فقط';
    
    let branchesSummary = '';
    if (state.branchLocations && state.branchLocations.length > 0) {
        branchesSummary += `
            <div class="summary-item">
                <span class="summary-label">الفروع المتاحة للتدريب:</span>
                <span class="summary-value">${state.branchLocations.length} فرع</span>
            </div>
        `;
        
        state.branchLocations.forEach((branch, index) => {
            branchesSummary += `
                <div class="summary-item">
                    <span class="summary-label">فرع ${index + 1}:</span>
                    <span class="summary-value">${AdvancedValidator.sanitizeHTML(branch.fullAddress)}</span>
                </div>
            `;
        });
    } else {
        branchesSummary = `
            <div class="summary-item">
                <span class="summary-label">الفروع:</span>
                <span class="summary-value">${companyLocation || 'غير محدد'} (الفرع الرئيسي فقط)</span>
            </div>
        `;
    }
    
    let trainingFieldsSummary = '';
    state.trainingFields.forEach(field => {
        const details = state.trainingDetails[field];
        const durationText = getDurationText(details.duration);
        const countText = details.count ? `${details.count} متدرب` : 'غير محدد';
        const supervisorText = details.supervisor || 'غير محدد';
        
        // الحصول على الميزات من النظام المصحح
        const knowledgeBenefitsList = fixedFeaturesManager.knowledgeBenefits.get(field) || [];
        const financialBenefitsList = fixedFeaturesManager.financialBenefits.get(field) || [];
        const trainingRequirementsList = fixedFeaturesManager.trainingRequirements.get(field) || [];
        
        let salaryText = 'غير محدد';
        if (details.minSalary && details.maxSalary) {
            const currencyText = getCurrencyText(details.currency, details.otherCurrency);
            salaryText = `${details.minSalary} - ${details.maxSalary} ${currencyText}`;
        } else if (details.minSalary) {
            const currencyText = getCurrencyText(details.currency, details.otherCurrency);
            salaryText = `من ${details.minSalary} ${currencyText}`;
        } else if (details.maxSalary) {
            const currencyText = getCurrencyText(details.currency, details.otherCurrency);
            salaryText = `حتى ${details.maxSalary} ${currencyText}`;
        }
        
        trainingFieldsSummary += `
            <div class="summary-item">
                <span class="summary-label">${AdvancedValidator.sanitizeHTML(field)}:</span>
                <span class="summary-value">${durationText} - ${countText}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">المشرف:</span>
                <span class="summary-value">${AdvancedValidator.sanitizeHTML(supervisorText)}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">الراتب بعد التعيين:</span>
                <span class="summary-value">${salaryText}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">الميزة المعرفية:</span>
                <span class="summary-value">
                    ${knowledgeBenefitsList.length > 0 ? 
                        '<ul style="margin: 0; padding-right: 20px;">' + 
                        knowledgeBenefitsList.map(benefit => `<li>${AdvancedValidator.sanitizeHTML(benefit)}</li>`).join('') + 
                        '</ul>' : 
                        'غير محدد'}
                </span>
            </div>
            ${financialBenefitsList.length > 0 ? `
            <div class="summary-item">
                <span class="summary-label">الميزة المادية:</span>
                <span class="summary-value">
                    <ul style="margin: 0; padding-right: 20px;">
                        ${financialBenefitsList.map(benefit => `<li>${AdvancedValidator.sanitizeHTML(benefit)}</li>`).join('')}
                    </ul>
                </span>
            </div>
            ` : ''}
            <div class="summary-item">
                <span class="summary-label">متطلبات التدريب:</span>
                <span class="summary-value">
                    ${trainingRequirementsList.length > 0 ? 
                        '<ul style="margin: 0; padding-right: 20px;">' + 
                        trainingRequirementsList.map(requirement => `<li>${AdvancedValidator.sanitizeHTML(requirement)}</li>`).join('') + 
                        '</ul>' : 
                        'غير محدد'}
                </span>
            </div>
        `;
    });
    
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
                    <i class="fas fa-building"></i>
                    <span>المعلومات الأساسية</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">اسم الشركة:</span>
                    <span class="summary-value">${AdvancedValidator.sanitizeHTML(companyName || 'غير محدد')}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">المجال الرئيسي:</span>
                    <span class="summary-value">${AdvancedValidator.sanitizeHTML(companyField || 'غير محدد')}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">الموقع:</span>
                    <span class="summary-value">${AdvancedValidator.sanitizeHTML(companyLocation || 'غير محدد')}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">عدد الموظفين:</span>
                    <span class="summary-value">${employeesCount || 'غير محدد'} ${exactEmployeeCount ? `(${exactEmployeeCount})` : ''}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">عدد الفروع:</span>
                    <span class="summary-value">${branchesStatus}</span>
                </div>
                ${isStartup ? `
                <div class="summary-item">
                    <span class="summary-label">نوع الشركة:</span>
                    <span class="summary-value">شركة ناشئة (Startup)</span>
                </div>
                ` : ''}
            </div>
            
            <div class="summary-block">
                <div class="summary-block-header">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>الفروع المتاحة للتدريب</span>
                </div>
                ${branchesSummary}
            </div>
            
            <div class="summary-block">
                <div class="summary-block-header">
                    <i class="fas fa-phone-alt"></i>
                    <span>معلومات الاتصال</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">البريد الإلكتروني:</span>
                    <span class="summary-value">${AdvancedValidator.sanitizeHTML(email || 'غير محدد')}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">الهاتف الأساسي:</span>
                    <span class="summary-value">${AdvancedValidator.sanitizeHTML(primaryPhone || 'غير محدد')}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">بريد الاستفسارات:</span>
                    <span class="summary-value">${AdvancedValidator.sanitizeHTML(inquiryEmail || 'غير محدد')}</span>
                </div>
            </div>
            
            <div class="summary-block">
                <div class="summary-block-header">
                    <i class="fas fa-graduation-cap"></i>
                    <span>المجالات التدريبية</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">نوع المتدربين:</span>
                    <span class="summary-value">${traineeTypeNames[state.selectedTraineeType] || 'غير محدد'}</span>
                </div>
                ${trainingFieldsSummary}
            </div>
            
            <div class="summary-block">
                <div class="summary-block-header">
                    <i class="fas fa-tools"></i>
                    <span>متطلبات التدريب</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">الرد على الطلبات:</span>
                    <span class="summary-value">${maxResponseDays ? `${maxResponseDays} أيام` : 'غير محدد'}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">الرد بعد المقابلة:</span>
                    <span class="summary-value">${maxResponseAfterInterview ? `${maxResponseAfterInterview} يوم` : 'غير محدد'}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">توفر المعدات:</span>
                    <span class="summary-value">${equipmentStatus}</span>
                </div>
                ${equipmentNo && equipmentNo.checked && requiredItems ? `
                <div class="summary-item">
                    <span class="summary-label">متطلبات المتدرب:</span>
                    <span class="summary-value">${AdvancedValidator.sanitizeHTML(requiredItems)}</span>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

function getCurrencyText(currency, otherCurrency) {
    const currencies = {
        'EGP': 'جنيه مصري',
        'USD': 'دولار أمريكي',
        'EUR': 'يورو',
        'other': otherCurrency || 'عملة أخرى'
    };
    return currencies[currency] || currency;
}

function addPrintFunctionality() {
    // This would be implemented with a proper print stylesheet
    // For now, we'll just add a basic print button handler
}

function printSummary() {
    notificationSystem.show('الطباعة', 'سيتم فتح نافذة الطباعة قريباً', 'info');
    setTimeout(() => window.print(), 500);
}

function downloadSummary() {
    notificationSystem.show('التحميل', 'جاري تحضير الملف للتحميل...', 'info');
    // In a real implementation, this would generate a PDF
    setTimeout(() => {
        notificationSystem.show('تم التحضير', 'الملف جاهز للتحميل', 'success');
    }, 2000);
}

// ============================================
// Enhanced Data Integration Functions
// ============================================

// دالة محسنة لحفظ بيانات الشركة في النظام
function saveCompanyDataToSystem(companyData) { return true; } function _oldSaveCompanyDataToSystem(companyData) {
    try {
        Logger.info('بدء حفظ بيانات الشركة في النظام...', companyData);
        
        // 1. إنشاء ملف تعريف الشركة
        const companyProfile = {
            id: Date.now(),
            name: companyData.companyInfo.name,
            field: companyData.companyInfo.field,
            location: companyData.companyInfo.location,
            email: companyData.companyInfo.email,
            logo: companyData.companyInfo.logo,
            bio: companyData.companyInfo.bio,
            employeesCount: companyData.companyInfo.employeesCount,
            exactEmployeeCount: companyData.companyInfo.exactEmployeeCount,
            hasMultipleBranches: companyData.companyInfo.hasMultipleBranches,
            branchesCount: companyData.companyInfo.branchesCount,
            branchLocations: companyData.companyInfo.branchLocations || [],
            website: companyData.companyInfo.website,
            contactInfo: companyData.contactInfo,
            trainingInfo: companyData.trainingInfo,
            trainingDetails: companyData.trainingDetails,
            registeredAt: new Date().toISOString(),
            status: 'active',
            isVerified: false
        };

        // 2. حفظ بيانات الشركة في localStorage
        dataManager.set('currentCompany', companyProfile);
        Logger.info('تم حفظ بيانات الشركة الحالية');
        
        // 3. إضافة الشركة إلى قائمة الشركات المسجلة
        let allCompanies = dataManager.get('companiesData') || [];
        
        // التحقق من عدم وجود شركة مسجلة بنفس البريد الإلكتروني
        const existingCompanyIndex = allCompanies.findIndex(company => 
            company.companyInfo && company.companyInfo.email === companyData.companyInfo.email
        );
        
        if (existingCompanyIndex !== -1) {
            // تحديث بيانات الشركة الموجودة
            allCompanies[existingCompanyIndex] = {
                companyInfo: companyData.companyInfo,
                contactInfo: companyData.contactInfo,
                trainingInfo: companyData.trainingInfo,
                trainingDetails: companyData.trainingDetails
            };
            Logger.info('تم تحديث بيانات الشركة الموجودة');
        } else {
            // إضافة شركة جديدة
            const newCompanyRecord = {
                companyInfo: companyData.companyInfo,
                contactInfo: companyData.contactInfo,
                trainingInfo: companyData.trainingInfo,
                trainingDetails: companyData.trainingDetails
            };
            allCompanies.push(newCompanyRecord);
            Logger.info('تم إضافة شركة جديدة');
        }
        
        dataManager.set('companiesData', allCompanies);
        Logger.info(`إجمالي الشركات المسجلة: ${allCompanies.length}`);

        // 4. إنشاء تدريبات تلقائية بناءً على بيانات الشركة
        const internships = createCompanyInternships(companyData);
        Logger.info(`تم إنشاء ${internships.length} تدريب تلقائي`);

        // 5. تحديث إحصائيات النظام
        updateSystemStats();

        // 6. إنشاء بيانات تطبيقات فارغة إذا لم تكن موجودة
        initializeApplicationsData();

        Logger.info('تم حفظ جميع بيانات الشركة بنجاح في النظام');
        return true;
    } catch (error) {
        Logger.error('خطأ في حفظ بيانات الشركة:', error);
        notificationSystem.show('خطأ في النظام', 'حدث خطأ غير متوقع أثناء حفظ البيانات. يرجى المحاولة مرة أخرى.', 'error');
        return false;
    }
}

// دالة محسنة لإنشاء تدريبات تلقائية للشركة
function createCompanyInternships(companyData) {
    const internships = [];
    const companyId = Date.now();
    
    Logger.info('بدء إنشاء التدريبات للمجالات:', companyData.trainingInfo.fields);
    
    companyData.trainingInfo.fields.forEach((field, index) => {
        try {
            const fieldDetails = companyData.trainingInfo.details[field] || {};
            const internshipId = `${companyId}-${index + 1}`;
            
            // تحديد المستوى والسعر بناءً على نوع المتدرب المختار
            let level, price, systemType;
            
            switch (companyData.trainingInfo.traineeType) {
                case 'first-time':
                    level = 'beginner';
                    price = 'مجاني';
                    systemType = 'first-time';
                    break;
                case 'once-trained':
                    level = 'intermediate';
                    price = '1500 EGP';
                    systemType = 'once-trained';
                    break;
                case 'twice-trained':
                    level = 'advanced';
                    price = '2500 EGP';
                    systemType = 'twice-trained';
                    break;
                default:
                    level = 'beginner';
                    price = 'مجاني';
                    systemType = 'first-time';
            }

            // إنشاء كائن التدريب مع الهيكل المتوافق مع صفحة الطلاب
            const internship = {
                id: internshipId,
                title: `تدريب في ${field}`,
                company: companyData.companyInfo.name,
                companyId: companyId,
                logo: getFieldLogo(field),
                level: level,
                price: price,
                location: companyData.companyInfo.location,
                fields: [field],
                duration: getDurationText(fieldDetails.duration) || '3 أشهر',
                maxApplicants: parseInt(fieldDetails.count) || 5,
                totalApplicants: 0,
                totalTrained: 0,
                description: companyData.companyInfo.bio || `فرصة تدريب في ${field} لدى ${companyData.companyInfo.name}`,
                branches: generateBranchesData(companyData),
                fieldsStats: generateFieldStats(field, fieldDetails),
                knowledgeBenefits: generateKnowledgeBenefits(fieldDetails),
                financialBenefits: generateFinancialBenefits(fieldDetails, companyData.trainingInfo.traineeType),
                systemType: systemType,
                companyInfo: {
                    id: companyId,
                    name: companyData.companyInfo.name,
                    field: companyData.companyInfo.field,
                    location: companyData.companyInfo.location,
                    email: companyData.companyInfo.email
                },
                trainingDetails: {
                    duration: fieldDetails.duration,
                    count: fieldDetails.count,
                    supervisor: fieldDetails.supervisor,
                    salaryRange: {
                        min: fieldDetails.minSalary,
                        max: fieldDetails.maxSalary,
                        currency: fieldDetails.currency
                    },
                    knowledgeBenefits: fieldDetails.knowledgeBenefits,
                    financialBenefits: fieldDetails.financialBenefits,
                    trainingRequirements: fieldDetails.trainingRequirements
                },
                createdAt: new Date().toISOString(),
                status: 'active'
            };

            internships.push(internship);
            Logger.info(`تم إنشاء تدريب: ${internship.title}`);
            
        } catch (error) {
            Logger.error(`خطأ في إنشاء تدريب للمجال ${field}:`, error);
        }
    });

    // حفظ التدريبات في النظام
    const saveResult = saveInternshipsToSystem(internships);
    
    if (saveResult) {
        Logger.info(`تم إنشاء وحفظ ${internships.length} تدريب بنجاح`);
    } else {
        Logger.error('فشل في حفظ التدريبات في النظام');
    }
    
    return internships;
}

// دالة محسنة لحفظ التدريبات في النظام
function saveInternshipsToSystem(internships) {
    try {
        // الحصول على التدريبات الحالية
        let allInternships = dataManager.get('internshipsData') || [];
        
        // إزالة أي تدريبات قديمة لنفس الشركة (إذا كانت موجودة)
        const companyId = internships[0]?.companyId;
        if (companyId) {
            allInternships = allInternships.filter(internship => internship.companyId !== companyId);
        }
        
        // إضافة التدريبات الجديدة
        allInternships = [...allInternships, ...internships];
        
        // حفظ في localStorage
        dataManager.set('internshipsData', allInternships);
        
        Logger.info(`تم حفظ ${internships.length} تدريب في النظام. الإجمالي: ${allInternships.length}`);
        return true;
    } catch (error) {
        Logger.error('خطأ في حفظ التدريبات:', error);
        return false;
    }
}

// دالة لتهيئة بيانات التطبيقات
function initializeApplicationsData() {
    try {
        let applicationsData = dataManager.get('applicationsData') || [];
        
        // إذا لم تكن البيانات موجودة، نقوم بتهيئة مصفوفة فارغة
        if (!Array.isArray(applicationsData)) {
            applicationsData = [];
            dataManager.set('applicationsData', applicationsData);
            Logger.info('تم تهيئة بيانات التطبيقات');
        }
        
        return applicationsData;
    } catch (error) {
        Logger.error('خطأ في تهيئة بيانات التطبيقات:', error);
        return [];
    }
}

// دالة محسنة لتحديث إحصائيات النظام
function updateSystemStats() {
    try {
        const companies = dataManager.get('companiesData') || [];
        const internships = dataManager.get('internshipsData') || [];
        const applications = dataManager.get('applicationsData') || [];
        
        const stats = {
            totalCompanies: companies.length,
            totalInternships: internships.length,
            activeInternships: internships.filter(i => i.totalApplicants < i.maxApplicants).length,
            totalApplications: applications.length,
            successfulTrainees: applications.filter(app => app.status === 'completed').length,
            lastUpdate: new Date().toISOString()
        };
        
        dataManager.set('systemStats', stats);
        Logger.info('تم تحديث إحصائيات النظام:', stats);
        
        return stats;
    } catch (error) {
        Logger.error('خطأ في تحديث الإحصائيات:', error);
        return null;
    }
}

// ============================================
// Enhanced Helper Functions
// ============================================

// دالة محسنة لإنشاء بيانات الفروع
function generateBranchesData(companyData) {
    try {
        const branches = [];
        
        if (companyData.companyInfo.branchLocations && companyData.companyInfo.branchLocations.length > 0) {
            companyData.companyInfo.branchLocations.forEach((branch, index) => {
                branches.push({
                    id: index + 1,
                    name: `فرع ${index + 1}`,
                    location: branch.fullAddress,
                    availableSpots: 5,
                    totalSpots: 10,
                    currentApplicants: 0,
                    fields: generateBranchFields(companyData, branch.fullAddress)
                });
            });
        } else {
            // إذا لم تكن هناك فروع، نستخدم الموقع الرئيسي
            branches.push({
                id: 1,
                name: 'الفرع الرئيسي',
                location: companyData.companyInfo.location,
                availableSpots: 5,
                totalSpots: 10,
                currentApplicants: 0,
                fields: generateBranchFields(companyData, companyData.companyInfo.location)
            });
        }
        
        return branches;
    } catch (error) {
        Logger.error('خطأ في إنشاء بيانات الفروع:', error);
        return [];
    }
}

// دالة محسنة لإنشاء حقول الفرع
function generateBranchFields(companyData, location) {
    try {
        const fields = [];
        const trainingInfo = companyData.trainingInfo || {};
        
        if (trainingInfo.fields && trainingInfo.fields.length > 0) {
            trainingInfo.fields.forEach((field, index) => {
                const fieldDetails = trainingInfo.details?.[field] || {};
                
                fields.push({
                    id: index + 1,
                    name: field,
                    current: 0,
                    max: parseInt(fieldDetails.count) || 5,
                    duration: getDurationText(fieldDetails.duration) || '3 أشهر',
                    salaryRange: {
                        min: fieldDetails.minSalary || 3000,
                        max: fieldDetails.maxSalary || 6000,
                        currency: fieldDetails.currency || 'EGP'
                    },
                    level: mapTraineeTypeToLevel(trainingInfo.traineeType),
                    description: `تدريب في مجال ${field}`,
                    status: 'available'
                });
            });
        }
        
        return fields;
    } catch (error) {
        Logger.error('خطأ في إنشاء حقول الفرع:', error);
        return [];
    }
}

// دالة مساعدة لتحويل نوع المتدرب إلى مستوى
function mapTraineeTypeToLevel(traineeType) {
    const levelMap = {
        'first-time': 'beginner',
        'once-trained': 'intermediate',
        'twice-trained': 'advanced'
    };
    return levelMap[traineeType] || 'beginner';
}

// ============================================
// Enhanced Form Submission
// ============================================

// دالة محسنة لتقديم النموذج
// ============================================
// Supabase Setup
// ============================================
const SUPABASE_URL = 'https://jrwazyrdzmbcnddpxxrf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impyd2F6eXJkem1iY25kZHB4eHJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MzUyMzksImV4cCI6MjA5MjExMTIzOX0.KaZt3Xb-9zjjwlSYnCvQQVxzDgbcOxdmnpg9wsUsqQI';

function getSB() {
    // لو موجود قبل كده، رجعه
    if (window._sbCo) return window._sbCo;

    // لو الـ supabase-config.js عنده client جاهز، استخدمه
    if (window.ProVance && typeof window.ProVance.getSupabase === 'function') {
        const sb = window.ProVance.getSupabase();
        if (sb) {
            window._sbCo = sb;
            return sb;
        }
    }

    // Fallback: اعمل client جديد لو المكتبة محمّلة
    if (typeof supabase !== 'undefined' && supabase.createClient) {
        try {
            window._sbCo = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            return window._sbCo;
        } catch (e) {
            console.error('Failed to create Supabase client:', e);
        }
    }

    return null;
}

// Async wait for Supabase to be ready (up to 10 seconds)
async function waitForSB(maxWaitMs) {
    if (typeof maxWaitMs !== 'number') maxWaitMs = 10000;
    const start = Date.now();
    let sb = getSB();
    while (!sb && (Date.now() - start) < maxWaitMs) {
        await new Promise(function(r) { setTimeout(r, 100); });
        sb = getSB();
    }
    return sb;
}

async function handleFormSubmit(event) {
    event.preventDefault();

    if (!validateCurrentStep()) return;

    const formData = collectFormData();
    if (!formData) {
        notificationSystem.show('خطأ في البيانات', 'تعذر جمع بيانات النموذج', 'error');
        return;
    }

    state.formData = formData;

    const submitBtn = document.getElementById('btnSubmit');
    const resetBtn = () => { if (submitBtn) { submitBtn.innerHTML = '<i class="fas fa-check"></i> <span>إتمام التسجيل</span>'; submitBtn.disabled = false; } };

    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>جاري التسجيل...</span>';
        submitBtn.disabled = true;
    }

    const email    = formData.companyInfo.email;
    const password = getValue('password');

    if (!email || !password) {
        notificationSystem.show('خطأ', 'البريد الإلكتروني أو كلمة المرور غير موجودة', 'error');
        resetBtn();
        return;
    }

    try {
        const sb = await waitForSB();
        if (!sb) {
            notificationSystem.show('خطأ', 'مشكلة في الاتصال، تأكد من الإنترنت وحاول مرة أخرى', 'error');
            resetBtn();
            return;
        }

        // 1. إنشاء حساب في Supabase Auth
        const { data: authData, error: authError } = await sb.auth.signUp({ email, password });

        if (authError) {
            let msg = 'حدث خطأ أثناء التسجيل';
            if (authError.message.includes('already registered') || authError.message.includes('already been registered'))
                msg = 'هذا البريد الإلكتروني مسجل مسبقاً، يرجى تسجيل الدخول';
            else if (authError.message.includes('Password'))
                msg = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
            notificationSystem.show('خطأ في التسجيل', msg, 'error');
            if (submitBtn) { submitBtn.innerHTML = '<i class="fas fa-check"></i> <span>إتمام التسجيل</span>'; submitBtn.disabled = false; }
            return;
        }

        if (!authData || !authData.user) {
            notificationSystem.show('خطأ في التسجيل', 'حدث خطأ في إنشاء الحساب، حاول مرة أخرى', 'error');
            resetBtn();
            return;
        }

        const userId = authData.user.id;

        // 🔍 Debug: شوف الـ formData قبل الـ insert
        console.log('📤 إرسال بيانات الشركة:', {
            company_name: formData.companyInfo.name,
            email: email,
            training_fields: formData.trainingInfo.fields,
            training_details_keys: Object.keys(formData.trainingInfo.details || {}),
            training_details_sample: formData.trainingInfo.details
        });

        // 2. حفظ بيانات الشركة في جدول companies (كل الحقول الكاملة)
        const insertData = {
            user_id:           userId,
            company_name:      formData.companyInfo.name,
            email:             email,
            company_bio:       formData.companyInfo.bio || '',
            company_field:     formData.companyInfo.field || '',
            company_location:  formData.companyInfo.location || '',
            employees_count:   formData.companyInfo.employeesCount || '',
            logo:              state.companyLogoData || formData.companyInfo.logo || '',
            website:           formData.companyInfo.website || '',
            primary_phone:     formData.contactInfo.primaryPhone || '',
            secondary_phone:   formData.contactInfo.secondaryPhone || '',
            whatsapp:          formData.contactInfo.whatsappNumber || '',
            inquiry_email:     formData.contactInfo.inquiryEmail || '',
            linkedin:          formData.contactInfo.linkedinUrl || '',
            facebook:          formData.contactInfo.facebookUrl || '',
            training_fields:   formData.trainingInfo.fields || [],
            training_details:  formData.trainingInfo.details || {},
            branch_locations:  formData.companyInfo.branchLocations || [],
            training_notes:    formData.trainingDetails.requiredItems || '',
            is_startup:        formData.trainingDetails.isStartup || false,
            max_response_days: parseInt(formData.trainingDetails.maxResponseDays) || 7,
            max_response_after_interview: parseInt(formData.trainingDetails.maxResponseAfterInterview) || 3,
            status:            'pending',
            agreed_at:         new Date().toISOString()
        };
        
        const { data: companyInserted, error: dbError } = await sb.from('companies').insert(insertData).select();

        if (dbError) {
            console.error('DB error:', dbError);
            // محاولة حذف الـ auth user اللي اتعمل لأن الـ DB save فشل
            let msg = 'حدث خطأ في حفظ بيانات الشركة';
            const errMsg = (dbError.message || '').toLowerCase();
            if (errMsg.includes('duplicate') || errMsg.includes('unique')) {
                msg = 'البيانات دي مسجلة قبل كده';
            } else if (errMsg.includes('row-level security') || errMsg.includes('rls') || errMsg.includes('policy')) {
                msg = 'مش مصرح بحفظ البيانات. تواصل مع الإدارة';
            } else if (errMsg.includes('column') && errMsg.includes('does not exist')) {
                msg = 'مشكلة في قاعدة البيانات: ' + dbError.message;
            } else if (dbError.message) {
                msg = 'خطأ: ' + dbError.message;
            }
            notificationSystem.show('فشل في حفظ البيانات', msg, 'error');
            resetBtn();
            return;
        }

        // 3. حفظ التدريبات في Supabase أيضاً
        const internshipsResult = await saveInternshipsToSupabase(sb, userId, formData);
        if (!internshipsResult.success) {
            console.warn('Internships save warning:', internshipsResult.error);
            // مش هنوقف العملية، نكمل عادي
        }

        // 4. نجاح
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-check"></i> <span>تم التسجيل!</span>';
            submitBtn.classList.add('success');
        }

        notificationSystem.show(
            'تم التسجيل بنجاح! 🎉',
            'تم تسجيل شركتك في ProVance. سيتم مراجعة طلبكم وتفعيل الحساب قريباً',
            'success'
        );

        localStorage.setItem('pendingCompanyName', formData.companyInfo.name);
        localStorage.setItem('pendingCompanyEmail', email);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userType', 'company');

        setTimeout(() => { window.location.href = 'Company-pending.html'; }, 2500);

    } catch (err) {
        console.error('Registration error:', err);
        const errMsg = err?.message || JSON.stringify(err) || 'خطأ في الاتصال';
        notificationSystem.show('خطأ في التسجيل', errMsg, 'error');
        resetBtn();
    }
}

// حفظ التدريبات في Supabase
async function saveInternshipsToSupabase(sb, userId, formData) {
    try {
        const fields = formData.trainingInfo.fields || [];
        if (fields.length === 0) {
            return { success: true, count: 0 };
        }

        const inserts = [];
        for (const field of fields) {
            const details = formData.trainingInfo.details[field] || {};
            const result = await sb.from('internships').insert({
                company_user_id:    userId,
                company_name:       formData.companyInfo.name,
                company_logo:       state.companyLogoData || formData.companyInfo.logo || '',
                company_location:   formData.companyInfo.location || '',
                title:              `تدريب في ${field}`,
                field:              field,
                description:        formData.companyInfo.bio || '',
                duration:           details.duration || '3 أشهر',
                max_applicants:     parseInt(details.count) || 5,
                trainee_type:       formData.trainingInfo.traineeType || 'first-time',
                requirements:       details.trainingRequirements || '',
                knowledge_benefits: details.knowledgeBenefits || '',
                financial_benefits: details.financialBenefits || '',
                salary_min:         details.minSalary || '',
                salary_max:         details.maxSalary || '',
                salary_currency:    'EGP',
                status:             'pending'
            });

            if (result.error) {
                console.error('Internship insert error for field:', field, result.error);
                inserts.push({ field, success: false, error: result.error.message });
            } else {
                inserts.push({ field, success: true });
            }
        }

        const failed = inserts.filter(i => !i.success);
        if (failed.length > 0) {
            return { success: false, error: `فشل حفظ ${failed.length} من ${fields.length} تدريبات`, details: failed };
        }
        return { success: true, count: fields.length };
    } catch (err) {
        console.error('Internships save error:', err);
        return { success: false, error: err.message || 'خطأ غير متوقع' };
    }
}

// دالة محسنة لجمع بيانات النموذج
function collectFormData() {
    try {
        const formData = {
            companyInfo: {
                name: getValue('companyName'),
                bio: getValue('companyBio'),
                field: getValue('companyField'),
                location: getValue('companyLocation'),
                employeesCount: getValue('employeesCount'),
                exactEmployeeCount: getValue('exactEmployeeCount'),
                hasMultipleBranches: document.querySelector('input[name="hasMultipleBranches"]:checked')?.value,
                branchesCount: getValue('branchesCount'),
                branchLocations: state.branchLocations,
                logo: state.companyLogoData,
                email: getValue('email'),
                website: getValue('website')
            },
            contactInfo: {
                primaryPhone: getValue('primaryPhone'),
                secondaryPhone: getValue('secondaryPhone'),
                whatsappNumber: getValue('whatsappNumber'),
                inquiryEmail: getValue('inquiryEmail'),
                linkedinUrl: getValue('linkedinUrl'),
                facebookUrl: getValue('facebookUrl')
            },
            trainingInfo: {
                fields: state.trainingFields,
                details: state.trainingDetails,
                traineeType: state.selectedTraineeType
            },
            trainingDetails: {
                maxResponseDays: getValue('maxResponseDays'),
                maxResponseAfterInterview: getValue('maxResponseAfterInterview'), // الحقل الجديد
                equipment: document.querySelector('input[name="equipment"]:checked')?.value,
                requiredItems: getValue('requiredItems'),
                isStartup: document.getElementById('startupCheck')?.checked || false
            },
            contract: {
                agreed: state.contractAgreed,
                agreedAt: new Date().toISOString()
            }
        };
        
        Logger.info('تم جمع بيانات النموذج بنجاح');
        return formData;
    } catch (error) {
        Logger.error('خطأ في جمع بيانات النموذج:', error);
        return null;
    }
}

// دالة محسنة لعرض رسالة النجاح
function showSuccessAnimation(submitBtn) { /* handled by handleFormSubmit */ }

// ============================================
// Data Verification Functions
// ============================================

// دالة للتحقق من صحة البيانات المحفوظة
function verifySavedData() {
    try {
        Logger.info('التحقق من صحة البيانات المحفوظة...');
        
        const companiesData = dataManager.get('companiesData') || [];
        const internshipsData = dataManager.get('internshipsData') || [];
        const systemStats = dataManager.get('systemStats') || {};
        
        Logger.info('نتائج التحقق:', {
            companies: companiesData.length,
            internships: internshipsData.length,
            stats: systemStats
        });
        
        // التحقق من تكامل البيانات
        const verificationResults = {
            companies: companiesData.length > 0,
            internships: internshipsData.length > 0,
            stats: Object.keys(systemStats).length > 0,
            dataStructure: verifyDataStructure(companiesData, internshipsData)
        };
        
        Logger.info('نتائج التحقق التفصيلية:', verificationResults);
        
        return verificationResults;
    } catch (error) {
        Logger.error('خطأ في التحقق من البيانات:', error);
        return null;
    }
}

// دالة للتحقق من هيكل البيانات
function verifyDataStructure(companies, internships) {
    try {
        if (companies.length === 0 || internships.length === 0) {
            return false;
        }
        
        // التحقق من أن كل شركة لها تدريبات مقابلة
        const companyIds = companies.map(company => company.companyInfo?.id || company.companyInfo?.email);
        const internshipCompanyIds = internships.map(internship => internship.companyId);
        
        const hasMatchingData = companyIds.some(companyId => 
            internshipCompanyIds.includes(companyId)
        );
        
        return hasMatchingData;
    } catch (error) {
        Logger.error('خطأ في التحقق من هيكل البيانات:', error);
        return false;
    }
}

// ============================================
// 🛠️ إضافة الأنماط للنظام الجديد
// ============================================
function addFeaturesStyles() {
    if (!document.getElementById('features-styles')) {
        const style = document.createElement('style');
        style.id = 'features-styles';
        style.textContent = `
            .features-input-group {
                display: flex;
                gap: 10px;
                align-items: flex-start;
                margin-bottom: 15px;
            }
            
            .features-list {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-bottom: 15px;
                min-height: 50px;
                padding: var(--spacing-md);
                background: var(--bg-input);
                border-radius: var(--radius-md);
                border: 1px solid var(--border);
            }
            
            .feature-tag {
                background: rgba(0, 217, 255, 0.1);
                border: 1px solid rgba(0, 217, 255, 0.3);
                border-radius: 8px;
                padding: 8px 12px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .feature-tag .feature-text {
                color: var(--text-primary);
                font-size: 0.9rem;
                line-height: 1.4;
            }
            
            .feature-tag .feature-remove {
                background: none;
                border: none;
                color: var(--error);
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: all 0.3s ease;
            }
            
            .feature-tag .feature-remove:hover {
                background: rgba(255, 107, 107, 0.1);
            }
            
            .empty-features-state {
                text-align: center;
                padding: 20px;
                color: var(--text-secondary);
            }
            
            .empty-features-state i {
                font-size: 2rem;
                margin-bottom: 10px;
                opacity: 0.5;
            }
            
            .empty-features-state p {
                margin: 0;
                font-size: 0.9rem;
            }
            
            /* 🎨 تصميم جديد ومحسن لأزرار الملخص */
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
            
            /* تأثيرات إضافية للشاشات الكبيرة */
            @media (min-width: 768px) {
                .summary-actions {
                    gap: 20px;
                }
                
                .btn-summary {
                    padding: 18px 28px;
                    font-size: 1.2rem;
                }
            }
            
            /* تأثيرات للشاشات الصغيرة */
            @media (max-width: 480px) {
                .summary-actions {
                    flex-direction: column;
                }
                
                .btn-summary {
                    min-height: 55px;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// ============================================
// Export Functions to Global Scope - UPDATED
// ============================================
window.removeTrainingField = optimizedRemoveTrainingField;
window.removeBranchLocation = removeBranchLocation;
window.updateFieldDuration = updateFieldDuration;
window.updateFieldCount = updateFieldCount;
window.updateFieldSupervisor = updateFieldSupervisor;
window.updateMinSalary = updateMinSalary;
window.updateMaxSalary = updateMaxSalary;
window.updateSalaryCurrency = updateSalaryCurrency;
window.updateOtherCurrency = updateOtherCurrency;
window.updateKnowledgeBenefits = updateKnowledgeBenefits;
window.updateFinancialBenefits = updateFinancialBenefits;
window.updateTrainingRequirements = updateTrainingRequirements;
window.togglePassword = togglePassword;
window.removeLogo = removeLogo;
window.selectTraineeType = selectTraineeType;
window.showTraineeInfo = showTraineeInfo;
window.toggleBranchesCount = toggleBranchesCount;
window.toggleExactEmployeeCount = toggleExactEmployeeCount;
window.toggleEquipmentDetails = toggleEquipmentDetails;
window.nextStep = nextStep;
window.previousStep = previousStep;
window.goToStep = goToStep;
window.addTrainingField = optimizedAddTrainingField;
window.addBranchLocation = addBranchLocation;
window.saveCompanyDataToSystem = saveCompanyDataToSystem;
window.createCompanyInternships = createCompanyInternships;
window.verifySavedData = verifySavedData;
window.collectFormData = collectFormData;
window.printSummary = printSummary;
window.downloadSummary = downloadSummary;
window.addKnowledgeBenefit = addKnowledgeBenefit;
window.addFinancialBenefit = addFinancialBenefit;
window.addTrainingRequirement = addTrainingRequirement;
window.fixedFeaturesManager = fixedFeaturesManager;

// Helper functions that need to be defined
function getFieldLogo(field) {
    // This would return appropriate logos based on field
    return '/assets/default-company-logo.png';
}

function generateFieldStats(field, details) {
    return {
        totalSpots: parseInt(details.count) || 5,
        availableSpots: parseInt(details.count) || 5,
        completionRate: 0,
        satisfactionRate: 0
    };
}

function generateKnowledgeBenefits(details) {
    return details.knowledgeBenefits || 'تطوير المهارات العملية والخبرة في بيئة عمل حقيقية';
}

function generateFinancialBenefits(details, traineeType) {
    if (traineeType === 'first-time') {
        return 'مكافأة مالية عند انتهاء التدريب';
    }
    return details.financialBenefits || 'بدل مواصلات ووجبات';
}

Logger.info('FIXED VERSION LOADED - All Issues Resolved + Performance + Security + Accessibility + Training Requirements + Dynamic Features System + Enhanced Summary Buttons + New Interview Response Field');

// ============================================
// 🎯 Event Delegation for Add Buttons - مع debug visible
// ============================================
(function setupBenefitButtonDelegation() {
    // Visual debug helper
    function showVisualDebug(msg, color) {
        try {
            const existing = document.getElementById('debugToast');
            if (existing) existing.remove();
            
            const t = document.createElement('div');
            t.id = 'debugToast';
            t.style.cssText = `
                position: fixed; top: 60px; left: 50%; transform: translateX(-50%);
                background: ${color || '#4facfe'}; color: white; padding: 12px 20px;
                border-radius: 10px; font-family: Cairo, sans-serif; font-weight: 700;
                z-index: 999999; font-size: 14px; max-width: 90vw; text-align: center;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            `;
            t.textContent = msg;
            document.body.appendChild(t);
            setTimeout(() => t.remove(), 3500);
        } catch(e) {}
    }
    
    function tryAddBenefit(field, type) {
        try {
            if (type === 'knowledge') {
                if (typeof addKnowledgeBenefit === 'function') {
                    addKnowledgeBenefit(field);
                    return true;
                } else {
                    showVisualDebug('❌ addKnowledgeBenefit function غير موجودة!', '#ef4444');
                    return false;
                }
            } else if (type === 'financial') {
                if (typeof addFinancialBenefit === 'function') {
                    addFinancialBenefit(field);
                    return true;
                } else {
                    showVisualDebug('❌ addFinancialBenefit function غير موجودة!', '#ef4444');
                    return false;
                }
            } else if (type === 'requirement') {
                if (typeof addTrainingRequirement === 'function') {
                    addTrainingRequirement(field);
                    return true;
                } else {
                    showVisualDebug('❌ addTrainingRequirement function غير موجودة!', '#ef4444');
                    return false;
                }
            }
        } catch(e) {
            showVisualDebug('❌ خطأ: ' + e.message, '#ef4444');
            console.error('tryAddBenefit error:', e);
            return false;
        }
    }
    
    let lastClickTime = 0;
    let lastClickedBtn = null;
    let clickCounter = 0;
    
    function handleClick(e) {
        clickCounter++;
        const clickNum = clickCounter;
        const btn = e.target.closest('.btn-add-knowledge, .btn-add-financial, .btn-add-requirement');
        if (!btn) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        // 🛡️ Debounce قوي: تجاهل أي ضغطة على نفس الزرار خلال 800ms
        const now = Date.now();
        const btnId = btn.dataset.field + '_' + (btn.classList.contains('btn-add-financial') ? 'fin' : btn.classList.contains('btn-add-knowledge') ? 'kn' : 'req');
        if (window._lastBtnClick && window._lastBtnClick[btnId] && (now - window._lastBtnClick[btnId]) < 800) {
            console.log('🛡️ Ignored duplicate click on', btnId, 'within 800ms');
            return; // مفيش toast - تجاهل كامل
        }
        if (!window._lastBtnClick) window._lastBtnClick = {};
        window._lastBtnClick[btnId] = now;
        
        const field = btn.dataset.field;
        if (!field) {
            showVisualDebug('❌ الزرار مفيهوش data-field!', '#ef4444');
            return;
        }
        
        // إيه نوع الزرار؟
        let type = null;
        if (btn.classList.contains('btn-add-knowledge')) type = 'knowledge';
        else if (btn.classList.contains('btn-add-financial')) type = 'financial';
        else if (btn.classList.contains('btn-add-requirement')) type = 'requirement';
        
        if (!type) {
            showVisualDebug('❌ نوع الزرار غير معروف!', '#ef4444');
            return;
        }
        
        // شوف الـ input قيمته إيه
        const inputId = type === 'knowledge' ? 'knowledgeBenefitInput-' + field :
                        type === 'financial' ? 'financialBenefitInput-' + field :
                        'trainingRequirementInput-' + field;
        const input = document.getElementById(inputId);
        
        if (!input) {
            // جرب نلاقي الـ input بأي طريقة
            const allInputs = document.querySelectorAll('[id^="' + (type === 'knowledge' ? 'knowledgeBenefitInput-' : type === 'financial' ? 'financialBenefitInput-' : 'trainingRequirementInput-') + '"]');
            showVisualDebug('❌ الـ input مش لاقيه! Field: ' + field + ' | Available: ' + Array.from(allInputs).map(i => i.id).join(', '), '#ef4444');
            return;
        }
        
        const value = input.value.trim();
        if (!value) {
            showVisualDebug('⚠️ [Click #' + clickNum + '] الـ input فاضي! Length: ' + value.length + ' | Input ID: ' + input.id, '#f59e0b');
            console.log('🔍 EMPTY input detected. Click #' + clickNum, 'Input:', input, 'Value:', JSON.stringify(input.value));
            input.focus();
            return;
        }
        
        // كل حاجة تمام - حاول تضيف
        const result = tryAddBenefit(field, type);
        
        if (result) {
            showVisualDebug('✅ [Click #' + clickNum + '] تم إضافة: ' + value, '#10b981');
            console.log('✅ ADDED on click #' + clickNum, value);
        }
    }
    
    document.addEventListener('click', handleClick, true);
    // ⚠️ شيلنا الـ touchend manual trigger لأن الـ click event بيشتغل بشكل طبيعي على الموبايل
    // الـ touchend كان بيـ trigger double click → كان بيمسح الـ input ويقول "اكتب الميزة"
    // دلوقتي بنعتمد على الـ click event فقط (Touch devices يـ fire click بعد touchend تلقائياً)
    
    console.log('✅ Benefit button delegation setup complete v2 - 2026-05-23');
    console.log('📋 Functions available:');
    console.log('  - addKnowledgeBenefit:', typeof window.addKnowledgeBenefit);
    console.log('  - addFinancialBenefit:', typeof window.addFinancialBenefit);
    console.log('  - fixedFeaturesManager:', typeof window.fixedFeaturesManager);
    console.log('  - state:', typeof window.state);
})();

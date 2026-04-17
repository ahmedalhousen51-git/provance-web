// نظام ربط البيانات بين صفحات Provance
class ProvanceDataConnector {
    constructor() {
        this.storageManager = null;
        this.isInitialized = false;
        this.init();
    }

    async init() {
        try {
            this.storageManager = await ProvanceStorage.getInstance();
            this.isInitialized = true;
            console.log('✅ تم تحميل موصل البيانات بنجاح');
            
            // إعداد مستمعي الأحداث العالمية
            this.setupGlobalListeners();
        } catch (error) {
            console.error('❌ فشل في تحميل موصل البيانات:', error);
        }
    }

    setupGlobalListeners() {
        // تحديث البيانات عند تغييرها في أي صفحة
        window.addEventListener('studentDataUpdated', (event) => {
            this.handleStudentDataUpdate(event.detail.studentData);
        });

        window.addEventListener('applicationStatusChanged', (event) => {
            this.handleApplicationStatusChange(event.detail);
        });

        // تحديث الواجهة عند جاهزية التخزين
        window.addEventListener('storageReady', () => {
            this.initializePage();
        });
    }

    // ========== إدارة بيانات الطالب ==========

    async getCurrentStudent() {
        await this.ensureInitialized();
        return this.storageManager.dataSyncManager.getCurrentStudent();
    }

    async saveStudentData(studentData) {
        await this.ensureInitialized();
        return this.storageManager.dataSyncManager.syncStudentData(studentData);
    }

    async updateStudentProfile(updates) {
        await this.ensureInitialized();
        const currentStudent = await this.getCurrentStudent();
        const updatedStudent = { ...currentStudent, ...updates };
        return this.saveStudentData(updatedStudent);
    }

    // ========== إدارة طلبات التدريب ==========

    async getTrainingApplications() {
        await this.ensureInitialized();
        return this.storageManager.dataSyncManager.getTrainingApplications();
    }

    async addTrainingApplication(applicationData) {
        await this.ensureInitialized();
        return this.storageManager.dataSyncManager.addTrainingApplication(applicationData);
    }

    async updateApplicationStatus(applicationId, status, additionalData = {}) {
        await this.ensureInitialized();
        const success = this.storageManager.dataSyncManager.updateApplicationStatus(applicationId, status, additionalData);
        
        if (success) {
            // إرسال حدث تغيير الحالة
            window.dispatchEvent(new CustomEvent('applicationStatusChanged', {
                detail: { applicationId, status }
            }));
        }
        
        return success;
    }

    async getApplicationById(applicationId) {
        await this.ensureInitialized();
        const applications = await this.getTrainingApplications();
        return applications.find(app => app.id === applicationId) || null;
    }

    // ========== الإحصائيات والتقارير ==========

    async getStudentStats() {
        await this.ensureInitialized();
        return this.storageManager.dataSyncManager.getStudentStats();
    }

    async getApplicationsByStatus(status) {
        await this.ensureInitialized();
        const applications = await this.getTrainingApplications();
        return applications.filter(app => app.status === status);
    }

    // ========== إدارة البيانات الإضافية ==========

    async getStudentSkills() {
        await this.ensureInitialized();
        return this.storageManager.dataSyncManager.getStudentSkills();
    }

    async saveStudentSkills(skills) {
        await this.ensureInitialized();
        return this.storageManager.dataSyncManager.saveStudentSkills(skills);
    }

    async getStudentLanguages() {
        await this.ensureInitialized();
        return this.storageManager.dataSyncManager.getStudentLanguages();
    }

    async saveStudentLanguages(languages) {
        await this.ensureInitialized();
        return this.storageManager.dataSyncManager.saveStudentLanguages(languages);
    }

    async getStudentCompanies() {
        await this.ensureInitialized();
        return this.storageManager.dataSyncManager.getStudentCompanies();
    }

    async saveStudentCompanies(companies) {
        await this.ensureInitialized();
        return this.storageManager.dataSyncManager.saveStudentCompanies(companies);
    }

    async getCheckinHistory() {
        await this.ensureInitialized();
        return this.storageManager.dataSyncManager.getCheckinHistory();
    }

    async saveCheckinHistory(history) {
        await this.ensureInitialized();
        return this.storageManager.dataSyncManager.saveCheckinHistory(history);
    }

    async addCheckinRecord(record) {
        await this.ensureInitialized();
        return this.storageManager.dataSyncManager.addCheckinRecord(record);
    }

    // ========== الأدوات المساعدة ==========

    async ensureInitialized() {
        if (!this.isInitialized) {
            await this.init();
        }
    }

    handleStudentDataUpdate(studentData) {
        // تحديث الواجهة في جميع الصفحات المفتوحة
        this.updateUIWithStudentData(studentData);
    }

    handleApplicationStatusChange({ applicationId, status }) {
        // تحديث الواجهة عند تغيير حالة الطلب
        this.updateUIWithApplicationStatus(applicationId, status);
    }

    updateUIWithStudentData(studentData) {
        // تحديث عناصر الواجهة المشتركة
        const userNameElements = document.querySelectorAll('#userName, .student-name');
        const profilePicElements = document.querySelectorAll('.profile-pic, .profile-pic-large');
        
        userNameElements.forEach(el => {
            if (el && studentData.fullName) {
                el.textContent = studentData.fullName;
            }
        });

        profilePicElements.forEach(el => {
            if (el && studentData.photo) {
                el.src = studentData.photo;
            }
        });

        // إرسال حدث للتحديثات الخاصة بالصفحة
        window.dispatchEvent(new CustomEvent('uiStudentDataUpdated', {
            detail: { studentData }
        }));
    }

    updateUIWithApplicationStatus(applicationId, status) {
        // تحديث عرض حالة الطلب في الواجهة
        window.dispatchEvent(new CustomEvent('uiApplicationStatusUpdated', {
            detail: { applicationId, status }
        }));
    }

    // ========== التهيئة التلقائية ==========

    async initializePage() {
        await this.ensureInitialized();
        
        try {
            // تحميل بيانات الطالب الحالي
            const studentData = await this.getCurrentStudent();
            if (studentData) {
                this.updateUIWithStudentData(studentData);
            }

            // إضافة فئة التهيئة للصفحة
            document.body.classList.add('provance-initialized');

            console.log('✅ تم تهيئة الصفحة بنجاح');
            return true;
        } catch (error) {
            console.error('❌ فشل في تهيئة الصفحة:', error);
            return false;
        }
    }

    // ========== نظام الإشعارات الموحد ==========

    showNotification(message, type = 'info', duration = 3000) {
        // إنشاء عنصر الإشعار
        const notification = document.createElement('div');
        notification.className = `provance-notification ${type}`;
        
        const icon = type === 'success' ? 'fa-check-circle' :
                    type === 'error' ? 'fa-exclamation-circle' :
                    type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';
        
        notification.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        `;
        
        // إضافة الأنماط إذا لم تكن موجودة
        if (!document.querySelector('#provance-notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'provance-notification-styles';
            styles.textContent = `
                .provance-notification {
                    position: fixed;
                    top: 100px;
                    right: 20px;
                    padding: 15px 25px;
                    border-radius: 10px;
                    color: white;
                    font-weight: 600;
                    z-index: 10000;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                    animation: slideInRight 0.5s ease;
                    max-width: 400px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .provance-notification.success { background: var(--success, #28a745); }
                .provance-notification.error { background: var(--danger, #dc3545); }
                .provance-notification.warning { 
                    background: var(--warning, #ffc107); 
                    color: var(--dark, #333);
                }
                .provance-notification.info { background: var(--primary, #1a2a6c); }
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(notification);
        
        // إزالة الإشعار بعد المدة المحددة
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.5s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 500);
        }, duration);
    }
}

// إنشاء نسخة عامة للموصل
window.ProvanceDataConnector = new ProvanceDataConnector();

// التهيئة التلقائية عند تحميل الصفحة
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(async () => {
            await window.ProvanceDataConnector.initializePage();
        }, 100);
    });
}
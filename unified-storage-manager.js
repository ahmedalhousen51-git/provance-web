// نظام إدارة التخزين الموحد والمحدث لمنصة Provance
class UnifiedStorageManager {
    constructor() {
        this.storage = localStorage;
        this.prefix = 'provance_';
        this.init();
    }

    // تهيئة النظام
    init() {
        console.log('🚀 تهيئة نظام إدارة التخزين الموحد...');
        this.migrateOldData();
        this.setupCompatibility();
    }

    // ========== الدوال الأساسية الموحدة ==========

    getItem(key, defaultValue = null) {
        try {
            const fullKey = this.prefix + key;
            const item = this.storage.getItem(fullKey);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('❌ خطأ في قراءة البيانات:', error);
            return defaultValue;
        }
    }

    setItem(key, value) {
        try {
            const fullKey = this.prefix + key;
            this.storage.setItem(fullKey, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('❌ خطأ في حفظ البيانات:', error);
            return false;
        }
    }

    removeItem(key) {
        try {
            const fullKey = this.prefix + key;
            this.storage.removeItem(fullKey);
            return true;
        } catch (error) {
            console.error('❌ خطأ في حذف البيانات:', error);
            return false;
        }
    }

    // ========== إدارة الطلاب ==========

    getStudents() {
        return this.getItem('students', []);
    }

    setStudents(students) {
        return this.setItem('students', students);
    }

    getCurrentStudent() {
        const students = this.getStudents();
        return students.length > 0 ? students[students.length - 1] : null;
    }

    // ========== إدارة طلبات التدريب ==========

    getStudentApplications() {
        return this.getItem('studentApplications', []);
    }

    saveStudentApplications(applications) {
        return this.setItem('studentApplications', applications);
    }

    // ========== إدارة الشركات ==========

    getStudentCompanies() {
        return this.getItem('studentCompanies', []);
    }

    saveStudentCompanies(companies) {
        return this.setItem('studentCompanies', companies);
    }

    // ========== إدارة المهارات واللغات ==========

    getStudentSkills() {
        return this.getItem('studentSkills', []);
    }

    saveStudentSkills(skills) {
        return this.setItem('studentSkills', skills);
    }

    getStudentLanguages() {
        return this.getItem('studentLanguages', []);
    }

    saveStudentLanguages(languages) {
        return this.setItem('studentLanguages', languages);
    }

    // ========== إدارة الحضور ==========

    getCheckinHistory() {
        return this.getItem('checkinHistory', []);
    }

    saveCheckinHistory(history) {
        return this.setItem('checkinHistory', history);
    }

    // ========== إدارة المقابلات ==========

    getInterviews() {
        return this.getItem('interviews', []);
    }

    saveInterviews(interviews) {
        return this.setItem('interviews', interviews);
    }

    // ========== التوافق مع النظام القديم ==========

    migrateOldData() {
        try {
            // ترحيل بيانات الطلاب
            const oldStudents = localStorage.getItem('students');
            if (oldStudents && !this.hasItem('students')) {
                this.setItem('students', JSON.parse(oldStudents));
            }

            // ترحيل بيانات الطلبات
            const oldApplications = localStorage.getItem('studentApplications');
            if (oldApplications && !this.hasItem('studentApplications')) {
                this.setItem('studentApplications', JSON.parse(oldApplications));
            }

            // ترحيل بيانات الشركات
            const oldCompanies = localStorage.getItem('companies');
            if (oldCompanies && !this.hasItem('studentCompanies')) {
                this.setItem('studentCompanies', JSON.parse(oldCompanies));
            }
        } catch (error) {
            console.error('❌ خطأ في ترحيل البيانات:', error);
        }
    }

    setupCompatibility() {
        // جعل النظام متوافقًا مع جميع الصفحات
        window.unifiedStorageManager = this;
        window.storageManager = this; // للتوافق مع student-profile.html
        window.provanceStorage = this; // للتوافق مع الأنظمة الأخرى
    }

    hasItem(key) {
        return this.storage.getItem(this.prefix + key) !== null;
    }

    // ========== دوال مساعدة ==========

    getAllKeys() {
        const keys = [];
        for (let i = 0; i < this.storage.length; i++) {
            const key = this.storage.key(i);
            if (key.startsWith(this.prefix)) {
                keys.push(key.replace(this.prefix, ''));
            }
        }
        return keys;
    }

    clear() {
        try {
            const keys = this.getAllKeys();
            keys.forEach(key => this.removeItem(key));
            return true;
        } catch (error) {
            console.error('❌ خطأ في مسح التخزين:', error);
            return false;
        }
    }

    getStorageStats() {
        const keys = this.getAllKeys();
        let totalSize = 0;
        
        keys.forEach(key => {
            const item = this.storage.getItem(this.prefix + key);
            if (item) totalSize += item.length;
        });

        return {
            totalItems: keys.length,
            totalSize: totalSize,
            totalSizeKB: (totalSize / 1024).toFixed(2)
        };
    }

    // ========== النسخ الاحتياطي ==========

    backupData() {
        try {
            const backup = {};
            const keys = this.getAllKeys();
            
            keys.forEach(key => {
                backup[key] = this.getItem(key);
            });
            
            const backupString = JSON.stringify(backup, null, 2);
            const blob = new Blob([backupString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `provance_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            return true;
        } catch (error) {
            console.error('❌ خطأ في إنشاء النسخة الاحتياطية:', error);
            return false;
        }
    }

    restoreData(backupFile) {
        return new Promise((resolve, reject) => {
            try {
                const reader = new FileReader();
                
                reader.onload = (e) => {
                    try {
                        const backup = JSON.parse(e.target.result);
                        
                        // مسح البيانات الحالية أولاً
                        this.clear();
                        
                        // استعادة البيانات من النسخة الاحتياطية
                        Object.keys(backup).forEach(key => {
                            this.setItem(key, backup[key]);
                        });
                        
                        console.log('✅ تم استعادة البيانات بنجاح');
                        resolve(true);
                    } catch (parseError) {
                        reject('ملف النسخة الاحتياطية غير صالح');
                    }
                };
                
                reader.onerror = () => reject('خطأ في قراءة الملف');
                reader.readAsText(backupFile);
            } catch (error) {
                reject('حدث خطأ غير متوقع');
            }
        });
    }
}

// التهيئة التلقائية
if (typeof window !== 'undefined') {
    // التحقق من توافق localStorage
    const isLocalStorageSupported = (() => {
        try {
            const test = 'test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    })();

    if (isLocalStorageSupported) {
        window.unifiedStorageManager = new UnifiedStorageManager();
        console.log('✅ تم تحميل نظام التخزين الموحد بنجاح');
    } else {
        // استخدام تخزين بديل في الذاكرة
        console.warn('⚠️ localStorage غير مدعوم، يتم استخدام التخزين في الذاكرة المؤقتة');
        window.unifiedStorageManager = {
            // تنفيذ بديل بسيط في الذاكرة
            _storage: {},
            getItem: function(key) { return this._storage[key] || null; },
            setItem: function(key, value) { this._storage[key] = value; return true; },
            removeItem: function(key) { delete this._storage[key]; return true; },
            clear: function() { this._storage = {}; return true; },
            // تطبيق الدوال الأساسية للتوافق
            getStudents: function() { return this._storage['students'] || []; },
            setStudents: function(students) { this._storage['students'] = students; return true; },
            getStudentApplications: function() { return this._storage['studentApplications'] || []; },
            saveStudentApplications: function(applications) { this._storage['studentApplications'] = applications; return true; },
            getStudentCompanies: function() { return this._storage['studentCompanies'] || []; },
            saveStudentCompanies: function(companies) { this._storage['studentCompanies'] = companies; return true; },
            getStudentSkills: function() { return this._storage['studentSkills'] || []; },
            saveStudentSkills: function(skills) { this._storage['studentSkills'] = skills; return true; },
            getStudentLanguages: function() { return this._storage['studentLanguages'] || []; },
            saveStudentLanguages: function(languages) { this._storage['studentLanguages'] = languages; return true; },
            getCheckinHistory: function() { return this._storage['checkinHistory'] || []; },
            saveCheckinHistory: function(history) { this._storage['checkinHistory'] = history; return true; }
        };
    }
}
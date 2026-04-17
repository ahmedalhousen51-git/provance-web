// نظام إدارة التخزين المتكامل والمحدث لمنصة Provance
class ProvanceStorageManager {
    constructor() {
        this.storage = localStorage;
        this.prefix = 'provance_';
        this.backupPrefix = 'provance_backup_';
        this.autoBackupTimer = null;
        this.sessionTimer = null;
        this.init();
    }

    // تهيئة النظام
    init() {
        console.log('🚀 تهيئة نظام إدارة التخزين المتكامل...');
        this.migrateOldData();
        this.cleanupExpiredData();
        this.setupAutoBackup();
        this.setupStorageMonitor();
        this.setupSessionMonitor();
        this.applySystemSettings();
    }

    // ========== الدوال الأساسية المحسنة للتخزين ==========

    /**
     * الحصول على عنصر من التخزين
     * @param {string} key - المفتاح
     * @param {any} defaultValue - القيمة الافتراضية
     * @returns {any}
     */
    getItem(key, defaultValue = null) {
        try {
            const fullKey = this.prefix + key;
            const item = this.storage.getItem(fullKey);
            
            if (!item) return defaultValue;

            const parsed = JSON.parse(item);
            
            // التحقق من انتهاء الصلاحية
            if (parsed && parsed.expiresAt) {
                if (new Date() > new Date(parsed.expiresAt)) {
                    this.removeItem(key);
                    return defaultValue;
                }
                return parsed.value;
            }
            
            return parsed;
        } catch (error) {
            console.error('❌ خطأ في قراءة البيانات من التخزين:', error);
            this.logActivity('READ_ERROR', `فشل قراءة المفتاح: ${key}`, { 
                key, 
                error: error.message 
            });
            return defaultValue;
        }
    }

    /**
     * حفظ عنصر في التخزين
     * @param {string} key - المفتاح
     * @param {any} value - القيمة
     * @param {number} expiresInMinutes - مدة الصلاحية بالدقائق
     * @returns {boolean}
     */
    setItem(key, value, expiresInMinutes = null) {
        try {
            const fullKey = this.prefix + key;
            let itemToStore = value;
            
            // إضافة تاريخ انتهاء الصلاحية إذا تم تحديده
            if (expiresInMinutes) {
                const expiresAt = new Date();
                expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);
                
                itemToStore = {
                    value: value,
                    expiresAt: expiresAt.toISOString(),
                    createdAt: new Date().toISOString()
                };
            }
            
            const itemString = JSON.stringify(itemToStore);
            this.storage.setItem(fullKey, itemString);
            
            // تسجيل النشاط
            this.logActivity('DATA_SAVED', `تم حفظ العنصر: ${key}`, { 
                key, 
                size: itemString.length,
                hasExpiry: !!expiresInMinutes 
            });
            
            return true;
        } catch (error) {
            console.error('❌ خطأ في حفظ البيانات في التخزين:', error);
            this.logActivity('SAVE_ERROR', `فشل حفظ العنصر: ${key}`, { 
                key, 
                error: error.message 
            });
            return false;
        }
    }

    /**
     * حذف عنصر من التخزين
     * @param {string} key - المفتاح
     * @returns {boolean}
     */
    removeItem(key) {
        try {
            const fullKey = this.prefix + key;
            const existed = this.storage.getItem(fullKey) !== null;
            
            this.storage.removeItem(fullKey);
            
            if (existed) {
                this.logActivity('DATA_DELETED', `تم حذف العنصر: ${key}`, { key });
            }
            
            return true;
        } catch (error) {
            console.error('❌ خطأ في حذف البيانات من التخزين:', error);
            this.logActivity('DELETE_ERROR', `فشل حذف العنصر: ${key}`, { 
                key, 
                error: error.message 
            });
            return false;
        }
    }

    /**
     * التحقق من وجود عنصر
     * @param {string} key - المفتاح
     * @returns {boolean}
     */
    hasItem(key) {
        return this.storage.getItem(this.prefix + key) !== null;
    }

    /**
     * الحصول على جميع المفاتيح
     * @returns {string[]}
     */
    getAllKeys() {
        try {
            const keys = [];
            for (let i = 0; i < this.storage.length; i++) {
                const key = this.storage.key(i);
                if (key.startsWith(this.prefix) && !key.startsWith(this.prefix + this.backupPrefix)) {
                    keys.push(key.replace(this.prefix, ''));
                }
            }
            return keys;
        } catch (error) {
            console.error('❌ خطأ في الحصول على المفاتيح:', error);
            return [];
        }
    }

    /**
     * مسح جميع بيانات النظام
     * @returns {boolean}
     */
    clear() {
        try {
            const keysToRemove = [];
            for (let i = 0; i < this.storage.length; i++) {
                const key = this.storage.key(i);
                if (key.startsWith(this.prefix) && !key.startsWith(this.prefix + this.backupPrefix)) {
                    keysToRemove.push(key);
                }
            }
            
            keysToRemove.forEach(key => {
                this.storage.removeItem(key);
            });
            
            this.logActivity('STORAGE_CLEARED', 'تم مسح جميع بيانات النظام', {
                clearedItems: keysToRemove.length
            });
            
            console.log('✅ تم مسح جميع بيانات النظام بنجاح');
            return true;
        } catch (error) {
            console.error('❌ خطأ في مسح التخزين:', error);
            this.logActivity('CLEAR_ERROR', 'فشل في مسح بيانات النظام', { 
                error: error.message 
            });
            return false;
        }
    }

    // ========== نظام إدارة الشركات ==========

    /**
     * إدارة بيانات الشركات
     */
    companyManager = {
        /**
         * الحصول على جميع الشركات
         * @returns {Array}
         */
        getAll: () => {
            return this.getItem('companies', []);
        },

        /**
         * الحصول على شركة محددة
         * @param {string} companyId - معرّف الشركة
         * @returns {Object|null}
         */
        getById: (companyId) => {
            const companies = this.getItem('companies', []);
            return companies.find(c => c.id === companyId) || null;
        },

        /**
         * حفظ شركة
         * @param {Object} company - بيانات الشركة
         * @returns {boolean}
         */
        save: (company) => {
            const companies = this.getItem('companies', []);
            const existingIndex = companies.findIndex(c => c.id === company.id);
            
            if (existingIndex >= 0) {
                // تحديث شركة موجودة
                companies[existingIndex] = {
                    ...companies[existingIndex],
                    ...company,
                    updatedAt: new Date().toISOString()
                };
                this.logActivity('COMPANY_UPDATED', `تم تحديث بيانات الشركة: ${company.name}`, { 
                    companyId: company.id 
                });
            } else {
                // إضافة شركة جديدة
                company.createdAt = new Date().toISOString();
                company.updatedAt = new Date().toISOString();
                companies.push(company);
                this.logActivity('COMPANY_ADDED', `تم إضافة شركة جديدة: ${company.name}`, { 
                    companyId: company.id 
                });
            }
            
            return this.setItem('companies', companies);
        },

        /**
         * حذف شركة
         * @param {string} companyId - معرّف الشركة
         * @returns {boolean}
         */
        delete: (companyId) => {
            const companies = this.getItem('companies', []);
            const company = companies.find(c => c.id === companyId);
            const filteredCompanies = companies.filter(c => c.id !== companyId);
            
            const success = this.setItem('companies', filteredCompanies);
            if (success && company) {
                this.logActivity('COMPANY_DELETED', `تم حذف الشركة: ${company.name}`, { 
                    companyId 
                });
            }
            
            return success;
        },

        /**
         * البحث في الشركات
         * @param {string} query - نص البحث
         * @returns {Array}
         */
        search: (query) => {
            const companies = this.getItem('companies', []);
            const searchTerm = query.toLowerCase();
            
            return companies.filter(company => 
                company.name?.toLowerCase().includes(searchTerm) ||
                company.email?.toLowerCase().includes(searchTerm) ||
                company.phone?.includes(searchTerm) ||
                company.field?.toLowerCase().includes(searchTerm)
            );
        },

        /**
         * تحديث آخر نشاط للشركة
         * @param {string} companyId - معرّف الشركة
         * @returns {boolean}
         */
        updateLastActivity: (companyId) => {
            const companies = this.getItem('companies', []);
            const companyIndex = companies.findIndex(c => c.id === companyId);
            
            if (companyIndex >= 0) {
                companies[companyIndex].lastActivity = new Date().toISOString();
                return this.setItem('companies', companies);
            }
            
            return false;
        }
    };

    // ========== نظام إدارة الجلسات ==========

    /**
     * إدارة جلسات المستخدمين
     */
    sessionManager = {
        /**
         * تسجيل دخول شركة
         * @param {Object} company - بيانات الشركة
         * @param {boolean} remember - تذكر الدخول
         * @returns {boolean}
         */
        login: (company, remember = false) => {
            const sessionData = {
                ...company,
                loginTime: new Date().toISOString(),
                sessionId: this.generateSessionId()
            };
            
            const success = this.setItem('currentSession', sessionData);
            
            if (success) {
                this.logActivity('LOGIN_SUCCESS', `تم تسجيل دخول الشركة: ${company.name}`, { 
                    companyId: company.id,
                    sessionId: sessionData.sessionId
                });
                
                if (remember) {
                    this.setItem('rememberedLogin', {
                        companyId: company.id,
                        email: company.email,
                        timestamp: new Date().toISOString()
                    });
                }
                
                // تحديث آخر نشاط للشركة
                this.companyManager.updateLastActivity(company.id);
                
                // إشعار تسجيل الدخول
                this.notificationManager.add({
                    title: 'تسجيل دخول ناجح',
                    message: `مرحباً بعودتك، ${company.name}`,
                    type: 'success'
                });
            }
            
            return success;
        },

        /**
         * تسجيل خروج الشركة
         * @returns {boolean}
         */
        logout: () => {
            const currentSession = this.getItem('currentSession');
            
            if (currentSession) {
                this.logActivity('LOGOUT', `تم تسجيل خروج الشركة: ${currentSession.name}`, {
                    companyId: currentSession.id,
                    sessionId: currentSession.sessionId
                });
            }
            
            this.removeItem('currentSession');
            return true;
        },

        /**
         * التحقق من حالة تسجيل الدخول
         * @returns {boolean}
         */
        isLoggedIn: () => {
            return this.hasItem('currentSession');
        },

        /**
         * الحصول على بيانات الجلسة الحالية
         * @returns {Object|null}
         */
        getCurrentSession: () => {
            return this.getItem('currentSession');
        },

        /**
         * تجديد الجلسة
         * @returns {boolean}
         */
        renewSession: () => {
            const currentSession = this.getItem('currentSession');
            if (currentSession) {
                currentSession.lastActivity = new Date().toISOString();
                return this.setItem('currentSession', currentSession);
            }
            return false;
        },

        /**
         * الحصول على بيانات تسجيل الدخول المحفوظة
         * @returns {Object|null}
         */
        getRememberedLogin: () => {
            return this.getItem('rememberedLogin');
        }
    };

    // ========== نظام إدارة الطلاب ==========

    /**
     * إدارة بيانات الطلاب
     */
    studentManager = {
        /**
         * الحصول على جميع الطلاب
         * @returns {Array}
         */
        getAll: () => {
            return this.getItem('students', []);
        },

        /**
         * الحصول على طالب محدد
         * @param {string} studentId - معرّف الطالب
         * @returns {Object|null}
         */
        getById: (studentId) => {
            const students = this.getItem('students', []);
            return students.find(s => s.id === studentId) || null;
        },

        /**
         * حفظ طالب
         * @param {Object} student - بيانات الطالب
         * @returns {boolean}
         */
        save: (student) => {
            const students = this.getItem('students', []);
            const existingIndex = students.findIndex(s => s.id === student.id);
            
            if (existingIndex >= 0) {
                // تحديث طالب موجود
                students[existingIndex] = {
                    ...students[existingIndex],
                    ...student,
                    updatedAt: new Date().toISOString()
                };
                this.logActivity('STUDENT_UPDATED', `تم تحديث بيانات الطالب: ${student.name}`, { 
                    studentId: student.id 
                });
            } else {
                // إضافة طالب جديد
                student.createdAt = new Date().toISOString();
                student.updatedAt = new Date().toISOString();
                students.push(student);
                this.logActivity('STUDENT_ADDED', `تم إضافة طالب جديد: ${student.name}`, { 
                    studentId: student.id 
                });
            }
            
            return this.setItem('students', students);
        },

        /**
         * حذف طالب
         * @param {string} studentId - معرّف الطالب
         * @returns {boolean}
         */
        delete: (studentId) => {
            const students = this.getItem('students', []);
            const student = students.find(s => s.id === studentId);
            const filteredStudents = students.filter(s => s.id !== studentId);
            
            const success = this.setItem('students', filteredStudents);
            if (success && student) {
                this.logActivity('STUDENT_DELETED', `تم حذف الطالب: ${student.name}`, { 
                    studentId 
                });
            }
            
            return success;
        },

        /**
         * البحث في الطلاب
         * @param {string} query - نص البحث
         * @returns {Array}
         */
        search: (query) => {
            const students = this.getItem('students', []);
            const searchTerm = query.toLowerCase();
            
            return students.filter(student => 
                student.name?.toLowerCase().includes(searchTerm) ||
                student.email?.toLowerCase().includes(searchTerm) ||
                student.phone?.includes(searchTerm) ||
                student.university?.toLowerCase().includes(searchTerm) ||
                student.major?.toLowerCase().includes(searchTerm)
            );
        },

        /**
         * الحصول على طلاب شركة محددة
         * @param {string} companyId - معرّف الشركة
         * @returns {Array}
         */
        getByCompany: (companyId) => {
            const students = this.getItem('students', []);
            return students.filter(s => s.companyId === companyId);
        },

        /**
         * تحديث حالة الطالب
         * @param {string} studentId - معرّف الطالب
         * @param {string} status - الحالة الجديدة
         * @returns {boolean}
         */
        updateStatus: (studentId, status) => {
            const students = this.getItem('students', []);
            const studentIndex = students.findIndex(s => s.id === studentId);
            
            if (studentIndex >= 0) {
                const oldStatus = students[studentIndex].status;
                students[studentIndex].status = status;
                students[studentIndex].updatedAt = new Date().toISOString();
                
                const success = this.setItem('students', students);
                if (success) {
                    this.logActivity('STUDENT_STATUS_CHANGED', 
                        `تم تغيير حالة الطالب ${students[studentIndex].name} من ${oldStatus} إلى ${status}`, 
                        { studentId, oldStatus, newStatus: status }
                    );
                }
                
                return success;
            }
            
            return false;
        }
    };

    // ========== نظام إدارة طلبات التدريب ==========

    /**
     * إدارة طلبات التدريب
     */
    trainingRequestManager = {
        /**
         * الحصول على جميع طلبات التدريب
         * @returns {Array}
         */
        getAll: () => {
            return this.getItem('trainingRequests', []);
        },

        /**
         * الحصول على طلب محدد
         * @param {string} requestId - معرّف الطلب
         * @returns {Object|null}
         */
        getById: (requestId) => {
            const requests = this.getItem('trainingRequests', []);
            return requests.find(r => r.id === requestId) || null;
        },

        /**
         * حفظ طلب تدريب
         * @param {Object} request - بيانات الطلب
         * @returns {boolean}
         */
        save: (request) => {
            const requests = this.getItem('trainingRequests', []);
            const existingIndex = requests.findIndex(r => r.id === request.id);
            
            if (existingIndex >= 0) {
                // تحديث طلب موجود
                requests[existingIndex] = {
                    ...requests[existingIndex],
                    ...request,
                    updatedAt: new Date().toISOString()
                };
                this.logActivity('TRAINING_REQUEST_UPDATED', `تم تحديث طلب التدريب: ${request.id}`, { 
                    requestId: request.id 
                });
            } else {
                // إضافة طلب جديد
                request.createdAt = new Date().toISOString();
                request.updatedAt = new Date().toISOString();
                request.status = request.status || 'pending';
                requests.push(request);
                this.logActivity('TRAINING_REQUEST_ADDED', `تم إضافة طلب تدريب جديد: ${request.id}`, { 
                    requestId: request.id 
                });
            }
            
            return this.setItem('trainingRequests', requests);
        },

        /**
         * حذف طلب تدريب
         * @param {string} requestId - معرّف الطلب
         * @returns {boolean}
         */
        delete: (requestId) => {
            const requests = this.getItem('trainingRequests', []);
            const request = requests.find(r => r.id === requestId);
            const filteredRequests = requests.filter(r => r.id !== requestId);
            
            const success = this.setItem('trainingRequests', filteredRequests);
            if (success && request) {
                this.logActivity('TRAINING_REQUEST_DELETED', `تم حذف طلب التدريب: ${request.id}`, { 
                    requestId 
                });
            }
            
            return success;
        },

        /**
         * الحصول على طلبات شركة محددة
         * @param {string} companyId - معرّف الشركة
         * @returns {Array}
         */
        getByCompany: (companyId) => {
            const requests = this.getItem('trainingRequests', []);
            return requests.filter(r => r.companyId === companyId);
        },

        /**
         * الحصول على طلبات طالب محدد
         * @param {string} studentId - معرّف الطالب
         * @returns {Array}
         */
        getByStudent: (studentId) => {
            const requests = this.getItem('trainingRequests', []);
            return requests.filter(r => r.studentId === studentId);
        },

        /**
         * تغيير حالة طلب التدريب
         * @param {string} requestId - معرّف الطلب
         * @param {string} newStatus - الحالة الجديدة
         * @returns {boolean}
         */
        updateStatus: (requestId, newStatus) => {
            const requests = this.getItem('trainingRequests', []);
            const requestIndex = requests.findIndex(r => r.id === requestId);
            
            if (requestIndex >= 0) {
                const oldStatus = requests[requestIndex].status;
                requests[requestIndex].status = newStatus;
                requests[requestIndex].updatedAt = new Date().toISOString();
                
                const success = this.setItem('trainingRequests', requests);
                if (success) {
                    this.logActivity('TRAINING_REQUEST_STATUS_CHANGED', 
                        `تم تغيير حالة طلب التدريب ${requestId} من ${oldStatus} إلى ${newStatus}`, 
                        { requestId, oldStatus, newStatus }
                    );
                    
                    // إضافة إشعار بتغيير الحالة
                    this.notificationManager.add({
                        title: 'تغيير حالة طلب التدريب',
                        message: `تم تغيير حالة الطلب ${requestId} إلى ${newStatus}`,
                        type: 'info'
                    });
                }
                
                return success;
            }
            
            return false;
        },

        /**
         * الحصول على الإحصائيات
         * @returns {Object}
         */
        getStats: () => {
            const requests = this.getItem('trainingRequests', []);
            const stats = {
                total: requests.length,
                pending: requests.filter(r => r.status === 'pending').length,
                approved: requests.filter(r => r.status === 'approved').length,
                rejected: requests.filter(r => r.status === 'rejected').length,
                completed: requests.filter(r => r.status === 'completed').length
            };
            
            return stats;
        }
    };

    // ========== نظام الإشعارات ==========

    /**
     * إدارة الإشعارات
     */
    notificationManager = {
        /**
         * الحصول على جميع الإشعارات
         * @returns {Array}
         */
        getAll: () => {
            return this.getItem('notifications', []);
        },

        /**
         * إضافة إشعار جديد
         * @param {Object} notification - بيانات الإشعار
         * @returns {boolean}
         */
        add: (notification) => {
            const notifications = this.getItem('notifications', []);
            const newNotification = {
                id: this.generateId(),
                timestamp: new Date().toISOString(),
                read: false,
                ...notification
            };
            
            notifications.unshift(newNotification);
            
            // الاحتفاظ فقط بآخر 100 إشعار
            if (notifications.length > 100) {
                notifications.splice(100);
            }
            
            const success = this.setItem('notifications', notifications);
            if (success) {
                this.logActivity('NOTIFICATION_ADDED', `إشعار جديد: ${notification.title}`, { 
                    notificationId: newNotification.id,
                    type: notification.type 
                });
            }
            
            return success;
        },

        /**
         * تعيين الإشعار كمقروء
         * @param {string} notificationId - معرّف الإشعار
         * @returns {boolean}
         */
        markAsRead: (notificationId) => {
            const notifications = this.getItem('notifications', []);
            const notificationIndex = notifications.findIndex(n => n.id === notificationId);
            
            if (notificationIndex >= 0 && !notifications[notificationIndex].read) {
                notifications[notificationIndex].read = true;
                const success = this.setItem('notifications', notifications);
                
                if (success) {
                    this.logActivity('NOTIFICATION_READ', `تم قراءة الإشعار: ${notifications[notificationIndex].title}`, { 
                        notificationId 
                    });
                }
                
                return success;
            }
            
            return false;
        },

        /**
         * تعيين جميع الإشعارات كمقروءة
         * @returns {boolean}
         */
        markAllAsRead: () => {
            const notifications = this.getItem('notifications', []);
            let updated = false;
            
            notifications.forEach(notification => {
                if (!notification.read) {
                    notification.read = true;
                    updated = true;
                }
            });
            
            if (updated) {
                const success = this.setItem('notifications', notifications);
                if (success) {
                    this.logActivity('NOTIFICATIONS_ALL_READ', 'تم تعيين جميع الإشعارات كمقروءة');
                }
                return success;
            }
            
            return true;
        },

        /**
         * الحصول على عدد الإشعارات غير المقروءة
         * @returns {number}
         */
        getUnreadCount: () => {
            const notifications = this.getItem('notifications', []);
            return notifications.filter(n => !n.read).length;
        },

        /**
         * حذف إشعار
         * @param {string} notificationId - معرّف الإشعار
         * @returns {boolean}
         */
        delete: (notificationId) => {
            const notifications = this.getItem('notifications', []);
            const notification = notifications.find(n => n.id === notificationId);
            const filteredNotifications = notifications.filter(n => n.id !== notificationId);
            
            const success = this.setItem('notifications', filteredNotifications);
            if (success && notification) {
                this.logActivity('NOTIFICATION_DELETED', `تم حذف الإشعار: ${notification.title}`, { 
                    notificationId 
                });
            }
            
            return success;
        },

        /**
         * إشعارات النظام التلقائية
         */
        system: {
            loginSuccess: (companyName) => {
                return this.notificationManager.add({
                    title: 'تسجيل دخول ناجح',
                    message: `مرحباً بعودتك، ${companyName}`,
                    type: 'success',
                    priority: 'low'
                });
            },

            backupCreated: () => {
                return this.notificationManager.add({
                    title: 'نسخة احتياطية',
                    message: 'تم إنشاء نسخة احتياطية تلقائية من البيانات',
                    type: 'info',
                    priority: 'low'
                });
            },

            storageWarning: (usagePercent) => {
                return this.notificationManager.add({
                    title: 'تحذير التخزين',
                    message: `مساحة التخزين المستخدمة: ${usagePercent}%`,
                    type: 'warning',
                    priority: 'high'
                });
            }
        }
    };

    // ========== نظام الإعدادات ==========

    /**
     * إدارة إعدادات النظام
     */
    settingsManager = {
        /**
         * الحصول على جميع الإعدادات
         * @returns {Object}
         */
        getAll: () => {
            const defaultSettings = {
                // الإعدادات العامة
                language: 'ar',
                theme: 'light',
                direction: 'rtl',
                
                // إعدادات التخزين
                autoBackup: true,
                backupInterval: 24, // ساعات
                maxBackups: 5,
                
                // إعدادات الجلسة
                sessionTimeout: 60, // دقيقة
                autoLogin: false,
                
                // إعدادات الإشعارات
                notifications: true,
                emailNotifications: false,
                soundNotifications: true,
                
                // إعدادات الأمان
                privacyMode: false,
                clearOnExit: false
            };
            
            return this.getItem('settings', defaultSettings);
        },

        /**
         * تحديث الإعدادات
         * @param {Object} newSettings - الإعدادات الجديدة
         * @returns {boolean}
         */
        update: (newSettings) => {
            const currentSettings = this.settingsManager.getAll();
            const updatedSettings = { ...currentSettings, ...newSettings };
            
            const success = this.setItem('settings', updatedSettings);
            if (success) {
                this.logActivity('SETTINGS_UPDATED', 'تم تحديث إعدادات النظام', { 
                    changes: Object.keys(newSettings) 
                });
                
                // تطبيق التغييرات فوراً
                this.applySystemSettings();
            }
            
            return success;
        },

        /**
         * إعادة تعيين الإعدادات
         * @returns {boolean}
         */
        reset: () => {
            const defaultSettings = {
                language: 'ar',
                theme: 'light',
                direction: 'rtl',
                autoBackup: true,
                backupInterval: 24,
                maxBackups: 5,
                sessionTimeout: 60,
                autoLogin: false,
                notifications: true,
                emailNotifications: false,
                soundNotifications: true,
                privacyMode: false,
                clearOnExit: false
            };
            
            const success = this.setItem('settings', defaultSettings);
            if (success) {
                this.logActivity('SETTINGS_RESET', 'تم إعادة تعيين إعدادات النظام إلى الوضع الافتراضي');
                this.applySystemSettings();
            }
            
            return success;
        },

        /**
         * الحصول على إعداد محدد
         * @param {string} key - مفتاح الإعداد
         * @param {any} defaultValue - القيمة الافتراضية
         * @returns {any}
         */
        get: (key, defaultValue = null) => {
            const settings = this.settingsManager.getAll();
            return settings[key] !== undefined ? settings[key] : defaultValue;
        }
    };

    // ========== نظام النسخ الاحتياطي ==========

    /**
     * إدارة النسخ الاحتياطي
     */
    backupManager = {
        /**
         * إنشاء نسخة احتياطية
         * @returns {string|null} - مفتاح النسخة الاحتياطية
         */
        create: () => {
            try {
                const data = {};
                const keys = this.getAllKeys();
                
                keys.forEach(key => {
                    data[key] = this.getItem(key);
                });
                
                const backupData = {
                    data: data,
                    timestamp: new Date().toISOString(),
                    version: '2.0',
                    system: 'Provance Storage Manager',
                    stats: this.getStorageStats()
                };
                
                const backupKey = this.backupPrefix + new Date().getTime();
                const success = this.setItem(backupKey, backupData);
                
                if (success) {
                    this.logActivity('BACKUP_CREATED', 'تم إنشاء نسخة احتياطية جديدة', {
                        backupKey,
                        items: keys.length
                    });
                    
                    this.notificationManager.system.backupCreated();
                    return backupKey;
                }
                
                return null;
            } catch (error) {
                console.error('❌ خطأ في إنشاء النسخة الاحتياطية:', error);
                this.logActivity('BACKUP_ERROR', 'فشل في إنشاء نسخة احتياطية', { 
                    error: error.message 
                });
                return null;
            }
        },

        /**
         * استعادة نسخة احتياطية
         * @param {string} backupKey - مفتاح النسخة الاحتياطية
         * @returns {boolean}
         */
        restore: (backupKey) => {
            try {
                const backup = this.getItem(backupKey);
                if (!backup || !backup.data) {
                    throw new Error('النسخة الاحتياطية غير صالحة');
                }
                
                // حفظ البيانات الحالية كنسخة احتياطية طارئة
                const emergencyBackupKey = this.backupManager.create();
                
                // مسح البيانات الحالية
                this.clear();
                
                // استعادة البيانات من النسخة الاحتياطية
                Object.keys(backup.data).forEach(key => {
                    this.setItem(key, backup.data[key]);
                });
                
                this.logActivity('BACKUP_RESTORED', 'تم استعادة البيانات من النسخة الاحتياطية', { 
                    backupKey,
                    emergencyBackupKey,
                    restoredItems: Object.keys(backup.data).length
                });
                
                return true;
            } catch (error) {
                console.error('❌ خطأ في استعادة النسخة الاحتياطية:', error);
                this.logActivity('BACKUP_RESTORE_ERROR', 'فشل في استعادة النسخة الاحتياطية', { 
                    error: error.message 
                });
                return false;
            }
        },

        /**
         * الحصول على جميع النسخ الاحتياطية
         * @returns {Array}
         */
        getAll: () => {
            const backups = [];
            
            for (let i = 0; i < this.storage.length; i++) {
                const key = this.storage.key(i);
                if (key.startsWith(this.prefix + this.backupPrefix)) {
                    const backupKey = key.replace(this.prefix, '');
                    const backup = this.getItem(backupKey);
                    if (backup) {
                        backups.push({
                            key: backupKey,
                            timestamp: backup.timestamp,
                            size: JSON.stringify(backup).length,
                            items: Object.keys(backup.data || {}).length,
                            stats: backup.stats
                        });
                    }
                }
            }
            
            return backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        },

        /**
         * حذف نسخة احتياطية
         * @param {string} backupKey - مفتاح النسخة الاحتياطية
         * @returns {boolean}
         */
        delete: (backupKey) => {
            const success = this.removeItem(backupKey);
            if (success) {
                this.logActivity('BACKUP_DELETED', 'تم حذف نسخة احتياطية', { backupKey });
            }
            return success;
        },

        /**
         * تنظيف النسخ الاحتياطية القديمة
         * @param {number} maxBackups - الحد الأقصى للنسخ
         * @returns {number} - عدد النسخ المحذوفة
         */
        cleanupOld: (maxBackups = null) => {
            const settings = this.settingsManager.getAll();
            const max = maxBackups || settings.maxBackups || 5;
            const backups = this.backupManager.getAll();
            
            if (backups.length > max) {
                const toDelete = backups.slice(max);
                
                toDelete.forEach(backup => {
                    this.backupManager.delete(backup.key);
                });
                
                this.logActivity('BACKUP_CLEANUP', `تم حذف ${toDelete.length} نسخة احتياطية قديمة`);
                return toDelete.length;
            }
            
            return 0;
        },

        /**
         * تصدير نسخة احتياطية إلى ملف
         * @returns {boolean}
         */
        exportToFile: () => {
            try {
                const backupData = this.exportData();
                if (!backupData) return false;
                
                const blob = new Blob([backupData], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = url;
                a.download = `provance_backup_${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                this.logActivity('BACKUP_EXPORTED', 'تم تصدير النسخة الاحتياطية إلى ملف');
                return true;
            } catch (error) {
                console.error('❌ خطأ في تصدير النسخة الاحتياطية:', error);
                return false;
            }
        }
    };

    // ========== الدوال المساعدة والمحسنة ==========

    /**
     * إنشاء معرف فريد
     * @returns {string}
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    /**
     * إنشاء معرف الجلسة
     * @returns {string}
     */
    generateSessionId() {
        return 'session_' + this.generateId();
    }

    /**
     * تسجيل النشاط في سجل النظام
     * @param {string} type - نوع النشاط
     * @param {string} description - وصف النشاط
     * @param {Object} metadata - بيانات إضافية
     */
    logActivity(type, description, metadata = {}) {
        const activity = {
            id: this.generateId(),
            type,
            description,
            timestamp: new Date().toISOString(),
            metadata,
            userAgent: navigator.userAgent,
            sessionId: this.sessionManager.getCurrentSession()?.sessionId
        };
        
        const log = this.getItem('activityLog', []);
        log.unshift(activity);
        
        // الاحتفاظ فقط بآخر 200 نشاط
        if (log.length > 200) {
            log.splice(200);
        }
        
        this.setItem('activityLog', log);
    }

    /**
     * الحصول على سجل الأنشطة
     * @param {number} limit - الحد الأقصى للسجلات
     * @returns {Array}
     */
    getActivityLog(limit = 50) {
        const log = this.getItem('activityLog', []);
        return limit ? log.slice(0, limit) : log;
    }

    /**
     * تطبيق إعدادات النظام
     */
    applySystemSettings() {
        const settings = this.settingsManager.getAll();
        
        // تطبيق السمة
        if (settings.theme) {
            document.documentElement.setAttribute('data-theme', settings.theme);
        }
        
        // تطبيق اللغة والاتجاه
        if (settings.language) {
            document.documentElement.lang = settings.language;
        }
        if (settings.direction) {
            document.documentElement.dir = settings.direction;
        }
        
        // إعداد النسخ الاحتياطي التلقائي
        this.setupAutoBackup();
        
        // إعداد مراقبة الجلسة
        this.setupSessionMonitor();
        
        console.log('✅ تم تطبيق إعدادات النظام');
    }

    /**
     * إعداد النسخ الاحتياطي التلقائي
     */
    setupAutoBackup() {
        // إزالة أي مؤقتات سابقة
        if (this.autoBackupTimer) {
            clearInterval(this.autoBackupTimer);
        }
        
        const settings = this.settingsManager.getAll();
        
        if (settings.autoBackup && settings.backupInterval) {
            const interval = settings.backupInterval * 60 * 60 * 1000; // تحويل إلى مللي ثانية
            
            this.autoBackupTimer = setInterval(() => {
                this.backupManager.create();
                this.backupManager.cleanupOld();
            }, interval);
            
            console.log(`✅ تم تفعيل النسخ الاحتياطي التلقائي كل ${settings.backupInterval} ساعة`);
        }
    }

    /**
     * إعداد مراقبة الجلسة
     */
    setupSessionMonitor() {
        // إزالة أي مؤقتات سابقة
        if (this.sessionTimer) {
            clearInterval(this.sessionTimer);
        }
        
        const settings = this.settingsManager.getAll();
        
        if (settings.sessionTimeout) {
            const interval = 60 * 1000; // التحقق كل دقيقة
            
            this.sessionTimer = setInterval(() => {
                const currentSession = this.sessionManager.getCurrentSession();
                if (currentSession && currentSession.loginTime) {
                    const loginTime = new Date(currentSession.loginTime);
                    const now = new Date();
                    const diffMinutes = (now - loginTime) / (1000 * 60);
                    
                    if (diffMinutes > settings.sessionTimeout) {
                        this.sessionManager.logout();
                        this.notificationManager.add({
                            title: 'انتهت الجلسة',
                            message: 'تم تسجيل الخروج تلقائياً بسبب عدم النشاط',
                            type: 'warning'
                        });
                    }
                }
            }, interval);
        }
    }

    /**
     * إعداد مراقبة التخزين
     */
    setupStorageMonitor() {
        // مراقبة تغييرات التخزين من علامات تبويب أخرى
        window.addEventListener('storage', (e) => {
            if (e.key && e.key.startsWith(this.prefix)) {
                const key = e.key.replace(this.prefix, '');
                this.logActivity('STORAGE_SYNC', `تم تحديث البيانات من علامة تبويب أخرى: ${key}`, { 
                    key,
                    newValue: e.newValue,
                    oldValue: e.oldValue
                });
            }
        });

        // مراقبة استخدام التخزين
        this.monitorStorageUsage();
    }

    /**
     * مراقبة استخدام التخزين
     */
    monitorStorageUsage() {
        const checkStorage = () => {
            const stats = this.getStorageStats();
            const usagePercent = (stats.totalSize / (5 * 1024 * 1024)) * 100; // افتراض حد 5MB
            
            if (usagePercent > 80) {
                this.notificationManager.system.storageWarning(usagePercent.toFixed(1));
            }
        };
        
        // التحقق كل 5 دقائق
        setInterval(checkStorage, 5 * 60 * 1000);
        checkStorage(); // التحقق فوراً
    }

    /**
     * ترحيل البيانات القديمة
     */
    migrateOldData() {
        try {
            const migrations = [
                { oldKey: 'companies', newKey: 'companies' },
                { oldKey: 'currentCompany', newKey: 'currentSession' },
                { oldKey: 'rememberLogin', newKey: 'rememberedLogin' },
                { oldKey: 'students', newKey: 'students' },
                { oldKey: 'trainingRequests', newKey: 'trainingRequests' },
                { oldKey: 'settings', newKey: 'settings' },
                { oldKey: 'notifications', newKey: 'notifications' }
            ];
            
            let migratedCount = 0;
            
            migrations.forEach(({ oldKey, newKey }) => {
                const oldData = localStorage.getItem(oldKey);
                if (oldData && !this.hasItem(newKey)) {
                    try {
                        const parsedData = JSON.parse(oldData);
                        this.setItem(newKey, parsedData);
                        localStorage.removeItem(oldKey);
                        migratedCount++;
                        console.log(`✅ تم ترحيل ${oldKey} إلى ${newKey}`);
                    } catch (e) {
                        console.warn(`⚠️ فشل ترحيل ${oldKey}:`, e);
                    }
                }
            });
            
            if (migratedCount > 0) {
                this.logActivity('DATA_MIGRATED', `تم ترحيل ${migratedCount} عنصر من التخزين القديم`);
            }
        } catch (error) {
            console.error('❌ خطأ في ترحيل البيانات القديمة:', error);
        }
    }

    /**
     * تنظيف البيانات المنتهية الصلاحية
     */
    cleanupExpiredData() {
        try {
            const keys = this.getAllKeys();
            let cleanedCount = 0;

            keys.forEach(key => {
                const item = this.storage.getItem(this.prefix + key);
                if (item) {
                    try {
                        const parsed = JSON.parse(item);
                        if (parsed && parsed.expiresAt) {
                            if (new Date() > new Date(parsed.expiresAt)) {
                                this.removeItem(key);
                                cleanedCount++;
                            }
                        }
                    } catch (e) {
                        // تجاهل العناصر التي لا يمكن تحليلها
                    }
                }
            });

            if (cleanedCount > 0) {
                console.log(`✅ تم تنظيف ${cleanedCount} عنصر منتهي الصلاحية`);
                this.logActivity('DATA_CLEANUP', `تم تنظيف ${cleanedCount} عنصر منتهي الصلاحية`);
            }
        } catch (error) {
            console.error('❌ خطأ في تنظيف البيانات المنتهية:', error);
        }
    }

    /**
     * الحصول على إحصائيات التخزين
     * @returns {Object}
     */
    getStorageStats() {
        const keys = this.getAllKeys();
        const totalSize = this.getStorageSize();
        const backups = this.backupManager.getAll();
        
        return {
            totalItems: keys.length,
            totalSize: totalSize,
            totalSizeKB: (totalSize / 1024).toFixed(2),
            totalSizeMB: (totalSize / (1024 * 1024)).toFixed(3),
            backupsCount: backups.length,
            backupsSize: backups.reduce((sum, backup) => sum + backup.size, 0),
            lastBackup: backups.length > 0 ? backups[0].timestamp : null,
            keys: keys
        };
    }

    /**
     * حساب حجم التخزين المستخدم
     * @returns {number}
     */
    getStorageSize() {
        try {
            let totalSize = 0;
            for (let i = 0; i < this.storage.length; i++) {
                const key = this.storage.key(i);
                if (key.startsWith(this.prefix)) {
                    const value = this.storage.getItem(key);
                    totalSize += key.length + (value ? value.length : 0);
                }
            }
            return totalSize;
        } catch (error) {
            console.error('❌ خطأ في حساب حجم التخزين:', error);
            return 0;
        }
    }

    /**
     * تصدير البيانات إلى JSON
     * @returns {string|null}
     */
    exportData() {
        try {
            const data = {};
            const keys = this.getAllKeys();
            
            keys.forEach(key => {
                data[key] = this.getItem(key);
            });
            
            const exportData = {
                data: data,
                metadata: {
                    exportedAt: new Date().toISOString(),
                    version: '2.0',
                    system: 'Provance Storage Manager',
                    stats: this.getStorageStats()
                }
            };
            
            return JSON.stringify(exportData, null, 2);
        } catch (error) {
            console.error('❌ خطأ في تصدير البيانات:', error);
            return null;
        }
    }

    /**
     * استيراد البيانات من JSON
     * @param {string} jsonData - بيانات JSON
     * @returns {Promise}
     */
    importData(jsonData) {
        return new Promise((resolve, reject) => {
            try {
                const importData = JSON.parse(jsonData);
                
                if (!importData.data) {
                    reject('بيانات الاستيراد غير صالحة');
                    return;
                }
                
                // إنشاء نسخة احتياطية قبل الاستيراد
                const backupKey = this.backupManager.create();
                
                // استيراد البيانات
                Object.keys(importData.data).forEach(key => {
                    this.setItem(key, importData.data[key]);
                });
                
                this.logActivity('DATA_IMPORTED', 'تم استيراد البيانات بنجاح', { 
                    backupKey,
                    importedItems: Object.keys(importData.data).length 
                });
                
                resolve({
                    success: true,
                    importedItems: Object.keys(importData.data).length,
                    backupKey: backupKey
                });
            } catch (error) {
                console.error('❌ خطأ في استيراد البيانات:', error);
                this.logActivity('DATA_IMPORT_ERROR', 'فشل في استيراد البيانات', { 
                    error: error.message 
                });
                reject('فشل في استيراد البيانات: ' + error.message);
            }
        });
    }

    /**
     * الحصول على تقرير النظام
     * @returns {Object}
     */
    getSystemReport() {
        const stats = this.getStorageStats();
        const settings = this.settingsManager.getAll();
        const activityLog = this.getActivityLog(10);
        const notifications = this.notificationManager.getAll();
        
        return {
            storage: stats,
            settings: settings,
            recentActivity: activityLog,
            notifications: {
                total: notifications.length,
                unread: this.notificationManager.getUnreadCount()
            },
            session: {
                isLoggedIn: this.sessionManager.isLoggedIn(),
                currentCompany: this.sessionManager.getCurrentSession()
            },
            timestamp: new Date().toISOString()
        };
    }
}

// ========== التهيئة والتوافق ==========

// إنشاء نسخة عامة من مدير التخزين المحسن
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
        // تهيئة النظام
        window.provanceStorage = new ProvanceStorageManager();
        
        // جعل المدير متاحًا عالميًا للتصحيح
        window.ProvanceStorageManager = ProvanceStorageManager;
        
        console.log('✅ تم تحميل نظام إدارة التخزين المتكامل بنجاح');
    } else {
        // استخدام تخزين بديل في الذاكرة
        console.warn('⚠️ localStorage غير مدعوم، يتم استخدام التخزين في الذاكرة المؤقتة');
        
        window.provanceStorage = {
            // تنفيذ بديل بسيط في الذاكرة للتوافق
            _storage: {},
            getItem: function(key) {
                return this._storage[key] || null;
            },
            setItem: function(key, value) {
                this._storage[key] = value;
                return true;
            },
            removeItem: function(key) {
                delete this._storage[key];
                return true;
            },
            clear: function() {
                this._storage = {};
                return true;
            },
            getAllKeys: function() {
                return Object.keys(this._storage);
            },
            hasItem: function(key) {
                return this._storage[key] !== undefined;
            },
            getStorageSize: function() {
                return JSON.stringify(this._storage).length;
            },
            // دوال أساسية للتوافق
            sessionManager: {
                isLoggedIn: () => false,
                getCurrentSession: () => null,
                logout: () => true
            },
            settingsManager: {
                getAll: () => ({})
            },
            notificationManager: {
                getUnreadCount: () => 0
            }
        };
    }

    // إضافة دالة مساعدة للتحقق من التوافق
    window.isStorageSupported = isLocalStorageSupported;
}

// تصدير الفصل لاستخدامه في وحدات ES6
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProvanceStorageManager;
}
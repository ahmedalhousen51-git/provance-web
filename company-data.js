// إدارة بيانات النظام - جزء الشركات
const DataManager = {
    // تهيئة النظام
    init() {
        try {
            console.log('تهيئة نظام إدارة بيانات الشركات...');
            this.initializeDefaultData();
            this.cleanupOldData(365);
            console.log('تم تهيئة النظام بنجاح');
            return true;
        } catch (error) {
            console.error('خطأ في تهيئة النظام:', error);
            return false;
        }
    },

    // حفظ بيانات الشركة
    saveCompany(companyData) {
        try {
            const companies = this.getCompanies();
            
            // إذا كانت الشركة موجودة مسبقاً، نقوم بالتحديث
            const existingIndex = companies.findIndex(company => company.id === companyData.id);
            if (existingIndex !== -1) {
                companies[existingIndex] = {
                    ...companies[existingIndex],
                    ...companyData,
                    lastActivity: new Date().toISOString()
                };
            } else {
                // شركة جديدة - التحقق من عدم وجود شركة بنفس البريد
                const existingCompany = companies.find(company => company.email === companyData.email);
                if (existingCompany) {
                    throw new Error('هناك شركة مسجلة مسبقاً بهذا البريد الإلكتروني');
                }
                
                companyData.id = this.generateId();
                companyData.registrationDate = new Date().toISOString();
                companyData.lastActivity = new Date().toISOString();
                companies.push(companyData);
            }
            
            localStorage.setItem('companies', JSON.stringify(companies));
            
            // تحديث البيانات في نظام التخزين المحلي للتوافق
            this.syncWithLocalStorage(companies[0]);
            
            return companyData;
        } catch (error) {
            console.error('خطأ في حفظ بيانات الشركة:', error);
            throw error;
        }
    },

    // الحصول على جميع الشركات
    getCompanies() {
        try {
            return JSON.parse(localStorage.getItem('companies')) || [];
        } catch (error) {
            console.error('خطأ في قراءة بيانات الشركات:', error);
            return [];
        }
    },

    // البحث عن شركة بالبريد الإلكتروني
    findCompanyByEmail(email) {
        try {
            const companies = this.getCompanies();
            return companies.find(company => company.email === email);
        } catch (error) {
            console.error('خطأ في البحث عن الشركة:', error);
            return null;
        }
    },

    // البحث عن شركة بالمعرف
    findCompanyById(id) {
        try {
            const companies = this.getCompanies();
            return companies.find(company => company.id === id);
        } catch (error) {
            console.error('خطأ في البحث عن الشركة:', error);
            return null;
        }
    },

    // الحصول على الشركة النشطة حالياً
    getCurrentCompany() {
        try {
            const companies = this.getCompanies();
            if (companies.length > 0) {
                return companies[0];
            }
            return null;
        } catch (error) {
            console.error('خطأ في الحصول على الشركة الحالية:', error);
            return null;
        }
    },

    // الحصول على جميع المجالات التدريبية من جميع الشركات
    getAllTrainingFields() {
        try {
            const companies = this.getCompanies();
            const allFields = new Set();
            
            companies.forEach(company => {
                if (company.trainingFields && company.trainingFields.length > 0) {
                    company.trainingFields.forEach(field => {
                        allFields.add(field.trim());
                    });
                }
                
                if (company.companyField) {
                    allFields.add(company.companyField.trim());
                }
            });
            
            return Array.from(allFields).sort();
        } catch (error) {
            console.error('خطأ في الحصول على المجالات التدريبية:', error);
            return [];
        }
    },

    // إضافة مجال تدريبي لشركة
    addTrainingField(companyId, field) {
        try {
            const companies = this.getCompanies();
            const companyIndex = companies.findIndex(c => c.id === companyId);
            
            if (companyIndex !== -1) {
                if (!companies[companyIndex].trainingFields) {
                    companies[companyIndex].trainingFields = [];
                }
                
                if (!companies[companyIndex].trainingFields.includes(field)) {
                    companies[companyIndex].trainingFields.push(field);
                    companies[companyIndex].lastActivity = new Date().toISOString();
                    localStorage.setItem('companies', JSON.stringify(companies));
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('خطأ في إضافة مجال تدريبي:', error);
            return false;
        }
    },

    // الحصول على إحصائيات الشركات
    getCompanyStats() {
        try {
            const companies = this.getCompanies();
            return {
                total: companies.length,
                withForeignBranches: companies.filter(c => c.hasForeignBranches).length,
                withLocalBranches: companies.filter(c => c.hasLocalBranches).length,
                startups: companies.filter(c => c.isStartup).length,
                acceptFirstTime: companies.filter(c => c.acceptFirstTimeTraining).length
            };
        } catch (error) {
            console.error('خطأ في الحصول على إحصائيات الشركات:', error);
            return {
                total: 0,
                withForeignBranches: 0,
                withLocalBranches: 0,
                startups: 0,
                acceptFirstTime: 0
            };
        }
    },

    // تحديث بيانات الشركة
    updateCompany(companyId, updatedData) {
        try {
            const companies = this.getCompanies();
            const companyIndex = companies.findIndex(c => c.id === companyId);
            
            if (companyIndex !== -1) {
                companies[companyIndex] = {
                    ...companies[companyIndex],
                    ...updatedData,
                    lastActivity: new Date().toISOString()
                };
                localStorage.setItem('companies', JSON.stringify(companies));
                
                this.syncWithLocalStorage(companies[companyIndex]);
                
                return companies[companyIndex];
            }
            return null;
        } catch (error) {
            console.error('خطأ في تحديث بيانات الشركة:', error);
            throw error;
        }
    },

    // حذف شركة
    deleteCompany(companyId) {
        try {
            const companies = this.getCompanies();
            const filteredCompanies = companies.filter(c => c.id !== companyId);
            localStorage.setItem('companies', JSON.stringify(filteredCompanies));
            return true;
        } catch (error) {
            console.error('خطأ في حذف الشركة:', error);
            return false;
        }
    },

    // الحصول على الشركات النشطة مؤخراً
    getRecentlyActiveCompanies(days = 30) {
        try {
            const companies = this.getCompanies();
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            
            return companies.filter(company => {
                if (!company.lastActivity) return false;
                return new Date(company.lastActivity) > cutoffDate;
            });
        } catch (error) {
            console.error('خطأ في الحصول على الشركات النشطة:', error);
            return [];
        }
    },

    // توليد معرف فريد
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    },

    // تنظيف البيانات القديمة
    cleanupOldData(daysOld = 365) {
        try {
            const companies = this.getCompanies();
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);
            
            const activeCompanies = companies.filter(company => {
                if (!company.lastActivity) return true;
                return new Date(company.lastActivity) > cutoffDate;
            });
            
            if (activeCompanies.length !== companies.length) {
                localStorage.setItem('companies', JSON.stringify(activeCompanies));
                console.log(`تم تنظيف ${companies.length - activeCompanies.length} شركة قديمة`);
            }
            
            return activeCompanies;
        } catch (error) {
            console.error('خطأ في تنظيف البيانات القديمة:', error);
            return this.getCompanies();
        }
    },

    // تصدير بيانات الشركات
    exportCompaniesData() {
        try {
            const companies = this.getCompanies();
            const dataStr = JSON.stringify(companies, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            return dataBlob;
        } catch (error) {
            console.error('خطأ في تصدير بيانات الشركات:', error);
            throw error;
        }
    },

    // استيراد بيانات الشركات
    importCompaniesData(jsonData) {
        try {
            const companies = JSON.parse(jsonData);
            if (!Array.isArray(companies)) {
                throw new Error('بيانات غير صالحة');
            }
            
            const validCompanies = companies.filter(company => 
                company.id && company.companyName && company.email
            );
            
            localStorage.setItem('companies', JSON.stringify(validCompanies));
            return validCompanies;
        } catch (error) {
            console.error('خطأ في استيراد بيانات الشركات:', error);
            throw error;
        }
    },

    // مزامنة البيانات مع التخزين المحلي للتوافق
    syncWithLocalStorage(company) {
        try {
            if (company) {
                localStorage.setItem('currentCompany', JSON.stringify(company));
            }
        } catch (error) {
            console.error('خطأ في مزامنة البيانات:', error);
        }
    },

    // تهيئة البيانات الافتراضية
    initializeDefaultData() {
        try {
            const companies = this.getCompanies();
            if (companies.length === 0) {
                console.log('تهيئة بيانات الشركات الافتراضية...');
                
                const defaultCompany = {
                    id: this.generateId(),
                    companyName: 'شركة Provance',
                    email: 'info@provance.com',
                    website: 'https://provance.com',
                    companyField: 'التقنية والبرمجيات',
                    employeesCount: '51-200',
                    establishmentYear: '2018',
                    description: 'شركة رائدة في مجال تطوير البرمجيات والحلول التقنية',
                    companyValues: 'الابتكار، الجودة، العمل الجماعي',
                    phone: '+966500000000',
                    address: 'الرياض، المملكة العربية السعودية',
                    city: 'الرياض',
                    country: 'المملكة العربية السعودية',
                    trainingFields: ['برمجة', 'تطوير الويب', 'تطوير التطبيقات', 'الذكاء الاصطناعي'],
                    hasForeignBranches: false,
                    hasLocalBranches: true,
                    isStartup: false,
                    acceptFirstTimeTraining: true,
                    registrationDate: new Date().toISOString(),
                    lastActivity: new Date().toISOString(),
                    status: 'active'
                };

                this.saveCompany(defaultCompany);
                console.log('تم تهيئة بيانات الشركات الافتراضية بنجاح');
            }
        } catch (error) {
            console.error('خطأ في تهيئة البيانات الافتراضية:', error);
        }
    },

    // التحقق من اتصال النظام
    healthCheck() {
        try {
            const companies = this.getCompanies();
            return {
                status: 'healthy',
                companiesCount: companies.length,
                lastActivity: companies.length > 0 ? companies[0].lastActivity : null,
                storageSize: JSON.stringify(localStorage).length
            };
        } catch (error) {
            return {
                status: 'error',
                error: error.message
            };
        }
    },

    // ===== دوال جديدة للمتدربين =====
    
    // الحصول على جميع المتدربين
    getTrainees() {
        try {
            return JSON.parse(localStorage.getItem('trainees')) || [];
        } catch (error) {
            console.error('خطأ في قراءة بيانات المتدربين:', error);
            return [];
        }
    },

    // حفظ المتدربين
    saveTrainees(trainees) {
        try {
            localStorage.setItem('trainees', JSON.stringify(trainees));
            return true;
        } catch (error) {
            console.error('خطأ في حفظ بيانات المتدربين:', error);
            return false;
        }
    },

    // إضافة متدرب جديد
    addTrainee(traineeData) {
        try {
            const trainees = this.getTrainees();
            const trainee = {
                id: this.generateId(),
                ...traineeData,
                registrationDate: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            };
            
            trainees.push(trainee);
            this.saveTrainees(trainees);
            return trainee;
        } catch (error) {
            console.error('خطأ في إضافة متدرب:', error);
            throw error;
        }
    },

    // تحديث بيانات متدرب
    updateTrainee(traineeId, updatedData) {
        try {
            const trainees = this.getTrainees();
            const traineeIndex = trainees.findIndex(t => t.id === traineeId);
            
            if (traineeIndex !== -1) {
                trainees[traineeIndex] = {
                    ...trainees[traineeIndex],
                    ...updatedData,
                    lastUpdated: new Date().toISOString()
                };
                this.saveTrainees(trainees);
                return trainees[traineeIndex];
            }
            return null;
        } catch (error) {
            console.error('خطأ في تحديث بيانات المتدرب:', error);
            throw error;
        }
    },

    // الحصول على متدربي الشركة الحالية
    getCompanyTrainees() {
        try {
            const currentCompany = this.getCurrentCompany();
            if (!currentCompany) return [];
            
            const trainees = this.getTrainees();
            return trainees.filter(trainee => trainee.companyId === currentCompany.id);
        } catch (error) {
            console.error('خطأ في الحصول على متدربي الشركة:', error);
            return [];
        }
    },

    // الحصول على إحصائيات المتدربين
    getTraineesStats() {
        try {
            const companyTrainees = this.getCompanyTrainees();
            return {
                total: companyTrainees.length,
                active: companyTrainees.filter(t => t.status === 'active').length,
                pending: companyTrainees.filter(t => t.status === 'pending').length,
                completed: companyTrainees.filter(t => t.status === 'completed').length,
                rejected: companyTrainees.filter(t => t.status === 'rejected').length
            };
        } catch (error) {
            console.error('خطأ في الحصول على إحصائيات المتدربين:', error);
            return {
                total: 0,
                active: 0,
                pending: 0,
                completed: 0,
                rejected: 0
            };
        }
    },

    // ===== دوال جديدة للمقابلات =====
    
    // الحصول على جميع المقابلات
    getInterviews() {
        try {
            return JSON.parse(localStorage.getItem('interviews')) || [];
        } catch (error) {
            console.error('خطأ في قراءة بيانات المقابلات:', error);
            return [];
        }
    },

    // حفظ المقابلات
    saveInterviews(interviews) {
        try {
            localStorage.setItem('interviews', JSON.stringify(interviews));
            return true;
        } catch (error) {
            console.error('خطأ في حفظ بيانات المقابلات:', error);
            return false;
        }
    },

    // إضافة مقابلة جديدة
    addInterview(interviewData) {
        try {
            const interviews = this.getInterviews();
            const interview = {
                id: this.generateId(),
                ...interviewData,
                createdAt: new Date().toISOString()
            };
            
            interviews.push(interview);
            this.saveInterviews(interviews);
            return interview;
        } catch (error) {
            console.error('خطأ في إضافة مقابلة:', error);
            throw error;
        }
    },

    // الحصول على المقابلات القادمة
    getUpcomingInterviews() {
        try {
            const interviews = this.getInterviews();
            const now = new Date();
            const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            
            return interviews.filter(interview => {
                const interviewDate = new Date(interview.date);
                return interviewDate > now && interviewDate <= nextWeek && interview.status === 'scheduled';
            });
        } catch (error) {
            console.error('خطأ في الحصول على المقابلات القادمة:', error);
            return [];
        }
    },

    // ===== دوال جديدة للتقارير =====
    
    // الحصول على جميع التقارير
    getReports() {
        try {
            return JSON.parse(localStorage.getItem('reports')) || [];
        } catch (error) {
            console.error('خطأ في قراءة بيانات التقارير:', error);
            return [];
        }
    },

    // حفظ التقارير
    saveReports(reports) {
        try {
            localStorage.setItem('reports', JSON.stringify(reports));
            return true;
        } catch (error) {
            console.error('خطأ في حفظ بيانات التقارير:', error);
            return false;
        }
    },

    // إضافة تقرير جديد
    addReport(reportData) {
        try {
            const reports = this.getReports();
            const report = {
                id: this.generateId(),
                ...reportData,
                createdAt: new Date().toISOString(),
                status: 'pending'
            };
            
            reports.push(report);
            this.saveReports(reports);
            return report;
        } catch (error) {
            console.error('خطأ في إضافة تقرير:', error);
            throw error;
        }
    },

    // ===== دوال جديدة لأكواد QR =====
    
    // الحصول على جميع أكواد QR
    getQRCodes() {
        try {
            return JSON.parse(localStorage.getItem('qrCodes')) || [];
        } catch (error) {
            console.error('خطأ في قراءة بيانات أكواد QR:', error);
            return [];
        }
    },

    // حفظ أكواد QR
    saveQRCodes(qrCodes) {
        try {
            localStorage.setItem('qrCodes', JSON.stringify(qrCodes));
            return true;
        } catch (error) {
            console.error('خطأ في حفظ بيانات أكواد QR:', error);
            return false;
        }
    },

    // إضافة كود QR جديد
    addQRCode(qrData) {
        try {
            const qrCodes = this.getQRCodes();
            const qrCode = {
                id: this.generateId(),
                ...qrData,
                createdAt: new Date().toISOString(),
                isActive: true
            };
            
            qrCodes.push(qrCode);
            this.saveQRCodes(qrCodes);
            return qrCode;
        } catch (error) {
            console.error('خطأ في إضافة كود QR:', error);
            throw error;
        }
    },

    // ===== دوال جديدة للحضور =====
    
    // الحصول على سجل الحضور
    getAttendance() {
        try {
            return JSON.parse(localStorage.getItem('attendance')) || [];
        } catch (error) {
            console.error('خطأ في قراءة بيانات الحضور:', error);
            return [];
        }
    },

    // حفظ سجل الحضور
    saveAttendance(attendance) {
        try {
            localStorage.setItem('attendance', JSON.stringify(attendance));
            return true;
        } catch (error) {
            console.error('خطأ في حفظ بيانات الحضور:', error);
            return false;
        }
    },

    // تسجيل حضور جديد
    addAttendance(attendanceData) {
        try {
            const attendance = this.getAttendance();
            const record = {
                id: this.generateId(),
                ...attendanceData,
                timestamp: new Date().toISOString()
            };
            
            attendance.push(record);
            this.saveAttendance(attendance);
            return record;
        } catch (error) {
            console.error('خطأ في تسجيل الحضور:', error);
            throw error;
        }
    },

    // الحصول على حضور اليوم
    getTodayAttendance() {
        try {
            const attendance = this.getAttendance();
            const today = new Date().toISOString().split('T')[0];
            return attendance.filter(record => record.date === today);
        } catch (error) {
            console.error('خطأ في الحصول على حضور اليوم:', error);
            return [];
        }
    },

    // ===== دوال جديدة للتحقق من المصادقة =====
    
    // التحقق من صحة تسجيل الدخول
    validateAuth() {
        try {
            const currentCompany = JSON.parse(localStorage.getItem('currentCompany'));
            if (!currentCompany) {
                return false;
            }
            
            const companies = this.getCompanies();
            const validCompany = companies.find(c => c.id === currentCompany.id && c.status === 'active');
            
            return !!validCompany;
        } catch (error) {
            console.error('خطأ في التحقق من المصادقة:', error);
            return false;
        }
    },
    
    // التحقق من المصادقة وإعادة التوجيه إذا لزم الأمر
    requireAuth(redirectUrl = 'company-login.html') {
        if (!this.validateAuth()) {
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    },
    
    // تسجيل الخروج
    logout() {
        try {
            localStorage.removeItem('currentCompany');
            window.location.href = 'company-login.html';
            return true;
        } catch (error) {
            console.error('خطأ في تسجيل الخروج:', error);
            return false;
        }
    }
};

// جعل DataManager متاحة globally للاستخدام في الملفات الأخرى
if (typeof window !== 'undefined') {
    window.DataManager = DataManager;
    
    // تهيئة تلقائية عند تحميل الصفحة
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            DataManager.init();
        }, 1000);
    });
}

// تصدير للاستخدام في بيئات Node.js إذا لزم الأمر
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataManager;
}
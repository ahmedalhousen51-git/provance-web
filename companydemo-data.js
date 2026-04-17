// بيانات تجريبية مخففة لتجنب مشاكل التخزين
const DemoData = {
    init() {
        // التحقق من عدم وجود بيانات مسبقاً
        if (!storageManager.getItem('companies')) {
            this.createCompanies();
        }
        
        if (!storageManager.getItem('trainees')) {
            this.createTrainees();
        }
    },
    
    createCompanies() {
        const companies = [
            {
                id: '1',
                companyName: 'شركة التكنولوجيا المتقدمة',
                email: 'tech@example.com',
                password: 'Tech123!',
                field: 'تكنولوجيا المعلومات',
                registrationDate: new Date().toISOString(),
                status: 'approved',
                // إزالة الصورة لتقليل الحجم
                trainingFields: ['برمجة', 'تطوير الويب'],
                employeesCount: '51-200'
            },
            {
                id: '2', 
                companyName: 'وكالة التسويق الرقمي',
                email: 'marketing@example.com',
                password: 'Marketing123!',
                field: 'التسويق الرقمي',
                registrationDate: new Date().toISOString(),
                status: 'approved',
                trainingFields: ['التسويق الإلكتروني', 'إدارة وسائل التواصل'],
                employeesCount: '11-50'
            }
        ];
        
        storageManager.setItem('companies', companies);
    },
    
    createTrainees() {
        const trainees = [
            {
                id: '1',
                name: 'محمد أحمد',
                specialization: 'هندسة البرمجيات',
                educationLevel: 'طالب جامعي',
                city: 'القاهرة',
                applicationDate: new Date().toISOString(),
                status: 'pending',
                companyId: '1'
            },
            {
                id: '2',
                name: 'فاطمة خالد',
                specialization: 'التسويق الرقمي',
                educationLevel: 'خريج حديث',
                city: 'الإسكندرية',
                applicationDate: new Date().toISOString(),
                status: 'accepted',
                responseDate: new Date().toISOString(),
                companyId: '2'
            }
        ];
        
        storageManager.setItem('trainees', trainees);
    }
};

// تهيئة البيانات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    DemoData.init();
});

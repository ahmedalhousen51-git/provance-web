// ============================================
// Data & State Management
// ============================================
let internshipsData = [
    {
        id: 1,
        title: "مطور ويب متدرب",
        company: "شركة التقنية المتطورة",
        logo: "💻",
        level: "beginner",
        price: "مجاني",
        location: "الرياض",
        fields: ["تطوير الويب", "برمجة", "تصميم واجهات"],
        duration: "3 أشهر",
        applicants: 45,
        maxApplicants: 50,
        description: "فرصة تدريب مثالية للمبتدئين في مجال تطوير الويب. ستتعلم أساسيات HTML, CSS, JavaScript وتطوير تطبيقات ويب تفاعلية.",
        branches: [
            { id: 1, name: "الفرع الرئيسي", location: "الرياض - حي العليا" },
            { id: 2, name: "فرع الشمال", location: "الرياض - حي الصحافة" }
        ],
        fieldsStats: [
            { name: "تطوير الويب", current: 25, max: 30 },
            { name: "برمجة", current: 15, max: 15 },
            { name: "تصميم واجهات", current: 5, max: 5 }
        ],
        knowledgeBenefits: [
            { title: "مهارات تقنية متقدمة", description: "تطوير مهارات البرمجة باستخدام أحدث التقنيات" },
            { title: "خبرة عملية حقيقية", description: "العمل على مشاريع حقيقية مع فريق متخصص" }
        ],
        financialBenefits: [
            { title: "بدل نقل", description: "مبلغ 500 ريال شهرياً" },
            { title: "وجبات مجانية", description: "توفير وجبات غداء مجانية" }
        ]
    },
    {
        id: 2,
        title: "مصمم جرافيك",
        company: "وكالة الإبداع الرقمي",
        logo: "🎨",
        level: "intermediate",
        price: "1500 ريال",
        location: "جدة",
        fields: ["تصميم جرافيك", "UI/UX", "فوتوشوب"],
        duration: "2 شهر",
        applicants: 20,
        maxApplicants: 25,
        description: "فرصة تدريب للمصممين ذوي الخبرة الأساسية. ستعمل على مشاريع حقيقية وتتعلم أحدث تقنيات التصميم.",
        branches: [
            { id: 1, name: "الفرع الرئيسي", location: "جدة - حي الصفا" },
            { id: 2, name: "فرع الكورنيش", location: "جدة - حي الكورنيش" }
        ],
        fieldsStats: [
            { name: "تصميم جرافيك", current: 12, max: 15 },
            { name: "UI/UX", current: 6, max: 8 },
            { name: "فوتوشوب", current: 2, max: 2 }
        ],
        knowledgeBenefits: [
            { title: "أدوات التصميم الاحترافية", description: "إتقان استخدام Adobe Creative Suite" },
            { title: "مبادئ التصميم", description: "تعلم أساسيات التصميم الجرافيكي والتفاعلي" }
        ],
        financialBenefits: [
            { title: "مكافأة شهرية", description: "1500 ريال شهرياً" },
            { title: "تذاكر مواصلات", description: "تذاكر مجانية للمواصلات العامة" }
        ]
    },
    {
        id: 3,
        title: "محلل بيانات",
        company: "بيانات المستقبل",
        logo: "📊",
        level: "advanced",
        price: "2500 ريال",
        location: "الدمام",
        fields: ["تحليل البيانات", "إحصاء", "بايثون"],
        duration: "4 أشهر",
        applicants: 8,
        maxApplicants: 10,
        description: "فرصة تدريب متقدمة للمحللين ذوي الخبرة. ستعمل على مشاريع تحليل بيانات معقدة باستخدام Python وSQL.",
        branches: [
            { id: 1, name: "الفرع الرئيسي", location: "الدمام - حي الفيصلية" }
        ],
        fieldsStats: [
            { name: "تحليل البيانات", current: 5, max: 6 },
            { name: "إحصاء", current: 2, max: 2 },
            { name: "بايثون", current: 1, max: 2 }
        ],
        knowledgeBenefits: [
            { title: "تحليل البيانات المتقدم", description: "إتقان تقنيات التحليل الإحصائي والتعلم الآلي" },
            { title: "أدوات التحليل", description: "استخدام Python, R, SQL للتحليل" }
        ],
        financialBenefits: [
            { title: "راتب تدريب", description: "2500 ريال شهرياً" },
            { title: "تأمين صحي", description: "تأمين صحي مجاني طوال فترة التدريب" }
        ]
    },
    {
        id: 4,
        title: "مسوق رقمي",
        company: "شركة التسويق الذكي",
        logo: "📱",
        level: "beginner",
        price: "مجاني",
        location: "عن بُعد",
        fields: ["التسويق الرقمي", "إدارة وسائل التواصل", "تحليل الحملات"],
        duration: "3 أشهر",
        applicants: 35,
        maxApplicants: 40,
        description: "تعلم أساسيات التسويق الرقمي وإدارة الحملات الإعلانية على منصات التواصل الاجتماعي.",
        branches: [
            { id: 1, name: "التدريب عن بُعد", location: "أونلاين" }
        ],
        fieldsStats: [
            { name: "التسويق الرقمي", current: 20, max: 25 },
            { name: "إدارة وسائل التواصل", current: 10, max: 10 },
            { name: "تحليل الحملات", current: 5, max: 5 }
        ],
        knowledgeBenefits: [
            { title: "استراتيجيات التسويق", description: "تعلم أحدث استراتيجيات التسويق الرقمي" },
            { title: "أدوات التحليل", description: "استخدام Google Analytics وأدوات تحليل الحملات" }
        ],
        financialBenefits: [
            { title: "شهادة معتمدة", description: "شهادة معتمدة بعد إتمام التدريب" }
        ]
    },
    {
        id: 5,
        title: "مطور تطبيقات جوال",
        company: "تطبيقات المستقبل",
        logo: "📲",
        level: "intermediate",
        price: "1800 ريال",
        location: "الرياض",
        fields: ["تطوير التطبيقات", "Android", "iOS"],
        duration: "3 أشهر",
        applicants: 15,
        maxApplicants: 20,
        description: "فرصة تدريب لتطوير تطبيقات الجوال للمنصات المختلفة باستخدام React Native وFlutter.",
        branches: [
            { id: 1, name: "الفرع الرئيسي", location: "الرياض - حي النخيل" },
            { id: 2, name: "فرع العليا", location: "الرياض - حي العليا" }
        ],
        fieldsStats: [
            { name: "تطوير التطبيقات", current: 8, max: 10 },
            { name: "Android", current: 4, max: 5 },
            { name: "iOS", current: 3, max: 5 }
        ],
        knowledgeBenefits: [
            { title: "تطوير متعدد المنصات", description: "تعلم React Native وFlutter لتطوير تطبيقات متعددة المنصات" },
            { title: "نشر التطبيقات", description: "تعلم عملية نشر التطبيقات على متاجر التطبيقات" }
        ],
        financialBenefits: [
            { title: "مكافأة شهرية", description: "1800 ريال شهرياً" },
            { title: "حساب مطور", description: "حساب مطور مجاني على متاجر التطبيقات" }
        ]
    },
    {
        id: 6,
        title: "مهندس شبكات",
        company: "شركة الاتصالات المتكاملة",
        logo: "🌐",
        level: "advanced",
        price: "3000 ريال",
        location: "جدة",
        fields: ["شبكات الحاسب", "أمن المعلومات", "إدارة الأنظمة"],
        duration: "4 أشهر",
        applicants: 6,
        maxApplicants: 8,
        description: "فرصة تدريب متقدمة في مجال هندسة الشبكات وأمن المعلومات مع العمل على مشاريع حقيقية.",
        branches: [
            { id: 1, name: "الفرع الرئيسي", location: "جدة - حي السلامة" }
        ],
        fieldsStats: [
            { name: "شبكات الحاسب", current: 3, max: 4 },
            { name: "أمن المعلومات", current: 2, max: 2 },
            { name: "إدارة الأنظمة", current: 1, max: 2 }
        ],
        knowledgeBenefits: [
            { title: "هندسة الشبكات", description: "تصميم وإدارة شبكات الحاسب المتقدمة" },
            { title: "أمن المعلومات", description: "تعلم تقنيات أمن المعلومات وحماية الشبكات" }
        ],
        financialBenefits: [
            { title: "راتب تدريب", description: "3000 ريال شهرياً" },
            { title: "دورات معتمدة", description: "دورات معتمدة في مجال الشبكات" }
        ]
    }
];

let studentData = {
    id: 1,
    name: "أحمد محمد",
    level: "beginner",
    pendingApplicationsCount: 0,
    maxPendingApplications: 3,
    appliedInternships: []
};

let selectedInternship = null;
let selectedBranch = null;

// ============================================
// الدوال المحسنة مع الميزات الجديدة
// ============================================

// دالة محسنة لتحميل بيانات التدريب المخزنة في localStorage
function loadStoredInternshipData() {
    try {
        const savedInternships = localStorage.getItem('internshipsData');
        if (savedInternships) {
            let storedData = JSON.parse(savedInternships);
            
            // نتحقق من وجود createdAt في كل تدريب
            storedData = storedData.map(internship => {
                if (!internship.createdAt) {
                    // نضيف createdAt افتراضيًا: الوقت الحالي ناقص عشوائي
                    internship.createdAt = Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000;
                }
                return internship;
            });
            internshipsData = storedData;
            console.log('تم تحميل بيانات التدريب المخزنة:', storedData);
        } else {
            // إذا لم تكن هناك بيانات مخزنة، نضيف createdAt للبيانات الأولية
            internshipsData = internshipsData.map(internship => ({
                ...internship,
                createdAt: Date.now() - (internship.id * 2 * 24 * 60 * 60 * 1000)
            }));
            saveInternshipData();
        }
    } catch (error) {
        console.error('خطأ في تحميل بيانات التدريب المخزنة:', error);
    }
}

// دالة محسنة لحفظ بيانات التدريب
function saveInternshipData() {
    try {
        localStorage.setItem('internshipsData', JSON.stringify(internshipsData));
        console.log('تم حفظ بيانات التدريب:', internshipsData);
        return true;
    } catch (error) {
        console.error('خطأ في حفظ بيانات التدريب:', error);
        return false;
    }
}

// دالة محسنة لحساب عدد الطلبات قيد المراجعة مع تتبع التدريبات المقدمة عليها
function calculatePendingApplications() {
    try {
        const savedApplications = localStorage.getItem('studentApplications');
        if (!savedApplications) {
            return 0;
        }
        
        const applicationsData = JSON.parse(savedApplications);
        const pendingApplications = applicationsData.filter(app => app.status === 'pending');
        
        studentData.appliedInternships = pendingApplications.map(app => app.internshipId);
        
        console.log(`عدد الطلبات قيد المراجعة: ${pendingApplications.length}`);
        return pendingApplications.length;
    } catch (error) {
        console.error('خطأ في حساب الطلبات قيد المراجعة:', error);
        return 0;
    }
}

// دالة محسنة لتحديث عدد الطلبات قيد المراجعة
function updatePendingApplicationsCount() {
    studentData.pendingApplicationsCount = calculatePendingApplications();
    localStorage.setItem('studentData', JSON.stringify(studentData));
    
    updateApplicationsCounter();
    updateCardButtonsState();
    
    console.log(`تم تحديث عدد الطلبات قيد المراجعة إلى: ${studentData.pendingApplicationsCount}`);
}

// دالة محسنة لحفظ الطلب في نظام الطلبات
function saveApplicationToStorage(internship, branch, applicationMessage) {
    try {
        const savedApplications = localStorage.getItem('studentApplications');
        let applicationsData = [];
        
        if (savedApplications) {
            applicationsData = JSON.parse(savedApplications);
        }
        
        const newApplication = {
            id: Date.now(),
            internshipId: internship.id,
            title: internship.title,
            company: internship.company,
            logo: internship.logo,
            status: "pending",
            date: new Date().toISOString().split('T')[0],
            branch: branch ? `${branch.name} - ${branch.location}` : 'غير محدد',
            field: internship.fields[0] || 'عام',
            salary: internship.price,
            duration: internship.duration,
            message: applicationMessage,
            cv: "تم الرفع",
            lastUpdate: new Date().toISOString().split('T')[0],
            companyPolicy: {
                maxResponseDays: Math.floor(Math.random() * 10) + 3,
                maxResponseAfterInterview: Math.floor(Math.random() * 5) + 1
            },
            studentId: studentData.id,
            studentLevel: studentData.level,
            applicationTime: new Date().toISOString()
        };
        
        applicationsData.push(newApplication);
        localStorage.setItem('studentApplications', JSON.stringify(applicationsData));
        
        updateInternshipApplicants(internship.id, true);
        updatePendingApplicationsCount();
        
        window.postMessage({
            type: 'INTERNSHIP_APPLIED',
            application: newApplication,
            pendingCount: studentData.pendingApplicationsCount
        }, '*');
        
        console.log('تم حفظ الطلب بنجاح:', newApplication);
        return true;
    } catch (error) {
        console.error('خطأ في حفظ الطلب:', error);
        return false;
    }
}

// دالة محسنة لتحديث عدد المتقدمين في التدريب
function updateInternshipApplicants(internshipId, increment = true) {
    try {
        const internshipIndex = internshipsData.findIndex(item => item.id === internshipId);
        
        if (internshipIndex !== -1) {
            if (increment) {
                internshipsData[internshipIndex].applicants += 1;
            } else {
                internshipsData[internshipIndex].applicants = Math.max(0, internshipsData[internshipIndex].applicants - 1);
            }
            
            saveInternshipData();
            renderInternshipCards();
            
            console.log(`تم تحديث التدريب ${internshipId}: ${internshipsData[internshipIndex].applicants} متقدم`);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('خطأ في تحديث عدد المتقدمين:', error);
        return false;
    }
}

// دالة جديدة: التحقق مما إذا كان الطالب قد تقدم على هذا التدريب مسبقاً
function hasAppliedToInternship(internshipId) {
    try {
        const savedApplications = localStorage.getItem('studentApplications');
        if (!savedApplications) return false;
        
        const applicationsData = JSON.parse(savedApplications);
        return applicationsData.some(app => 
            app.internshipId === internshipId && 
            app.studentId === studentData.id && 
            app.status === 'pending'
        );
    } catch (error) {
        console.error('خطأ في التحقق من التقديم السابق:', error);
        return false;
    }
}

// دالة جديدة: الحصول على حالة التقديم للطالب
function getStudentApplicationStatus(internshipId) {
    try {
        const savedApplications = localStorage.getItem('studentApplications');
        if (!savedApplications) return null;
        
        const applicationsData = JSON.parse(savedApplications);
        const application = applicationsData.find(app => 
            app.internshipId === internshipId && 
            app.studentId === studentData.id
        );
        
        return application ? application.status : null;
    } catch (error) {
        console.error('خطأ في الحصول على حالة التقديم:', error);
        return null;
    }
}

// دالة جديدة: تحديث حالة أزرار التقديم في جميع البطاقات
function updateCardButtonsState() {
    const cards = document.querySelectorAll('.internship-card');
    cards.forEach(card => {
        const internshipId = parseInt(card.getAttribute('data-id'));
        const internship = internshipsData.find(i => i.id === internshipId);
        const applyBtn = card.querySelector('.apply-btn');
        
        if (applyBtn && internship) {
            const eligible = isEligibleToApply(internship);
            const alreadyApplied = hasAppliedToInternship(internshipId);
            
            if (alreadyApplied) {
                const status = getStudentApplicationStatus(internshipId);
                applyBtn.innerHTML = `<i class="fas fa-check-circle"></i><span>${getStatusText(status)}</span>`;
                applyBtn.disabled = true;
                applyBtn.style.opacity = '0.7';
                applyBtn.style.cursor = 'not-allowed';
            } else if (!eligible) {
                applyBtn.innerHTML = '<i class="fas fa-paper-plane"></i><span>غير متاح</span>';
                applyBtn.disabled = true;
            } else {
                applyBtn.innerHTML = '<i class="fas fa-paper-plane"></i><span>تقديم الآن</span>';
                applyBtn.disabled = false;
                applyBtn.style.opacity = '1';
                applyBtn.style.cursor = 'pointer';
            }
        }
    });
}

// دالة جديدة: الحصول على نص حالة التقديم
function getStatusText(status) {
    const statuses = {
        'pending': 'قيد المراجعة',
        'accepted': 'تم القبول',
        'rejected': 'تم الرفض'
    };
    return statuses[status] || 'تم التقديم';
}

// مستمع محسن للأحداث القادمة من صفحة الطلبات
window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'APPLICATION_CANCELLED') {
        const { internshipId, status, applicationId } = event.data;
        
        console.log(`تم استلام إشعار إلغاء طلب: ${applicationId} للتدريب: ${internshipId}`);
        
        if (status === 'pending') {
            updatePendingApplicationsCount();
            updateInternshipApplicants(internshipId, false);
            
            setTimeout(() => {
                renderInternshipCards();
                showNotification('تم إلغاء الطلب بنجاح. يمكنك الآن التقديم على تدريب آخر.', 'success');
            }, 300);
        }
        
    } else if (event.data && event.data.type === 'APPLICATION_STATUS_CHANGED') {
        const { oldStatus, newStatus, internshipId } = event.data;
        
        console.log(`تم تغيير حالة الطلب للتدريب ${internshipId}: ${oldStatus} -> ${newStatus}`);
        
        if (oldStatus === 'pending' && (newStatus === 'accepted' || newStatus === 'rejected')) {
            updatePendingApplicationsCount();
            
            if (newStatus === 'rejected') {
                showNotification('تم رفض طلبك. يمكنك التقديم على تدريبات أخرى.', 'info');
            }
        }
        
    } else if (event.data && event.data.type === 'PENDING_APPLICATIONS_UPDATED') {
        updatePendingApplicationsCount();
        
    } else if (event.data && event.data.type === 'APPLICATION_ADDED') {
        updatePendingApplicationsCount();
    }
});

// ============================================
// دوال التحديث التلقائي الجديدة
// ============================================

function setupAutoRefresh() {
    // 1. التحقق من تحديثات localStorage
    window.addEventListener('storage', function(event) {
        if (event.key === 'internshipsData' || 
            event.key === 'companiesData' ||
            event.key === 'departmentsData') {
            
            console.log('📦 بيانات جديدة متاحة، إعادة التحميل...');
            loadStoredInternshipData();
            renderInternshipCards();
            showNotification('تم تحديث قائمة التدريبات', 'info');
        }
    });
    
    // 2. تحديث دوري كل دقيقة
    setInterval(() => {
        checkForNewInternships();
    }, 60000); // 60 ثانية
}

function checkForNewInternships() {
    const lastCheck = localStorage.getItem('lastInternshipCheck') || 0;
    const currentTime = Date.now();
    
    if (currentTime - lastCheck > 30000) { // كل 30 ثانية
        const newInternships = getNewInternshipsSince(lastCheck);
        if (newInternships.length > 0) {
            updateInternshipDisplay(newInternships);
            showNewInternshipsNotification(newInternships.length);
        }
        localStorage.setItem('lastInternshipCheck', currentTime);
    }
}

function getNewInternshipsSince(lastCheck) {
    return internshipsData.filter(internship => internship.createdAt > lastCheck);
}

function updateInternshipDisplay(newInternships) {
    newInternships.forEach(internship => {
        const card = document.querySelector(`.internship-card[data-id="${internship.id}"]`);
        if (card) {
            if (!card.querySelector('.new-badge')) {
                const newBadge = document.createElement('div');
                newBadge.className = 'new-badge';
                newBadge.textContent = 'جديد';
                card.querySelector('.internship-header').appendChild(newBadge);
            }
        }
    });
}

function showNewInternshipsNotification(count) {
    showNotification(`هناك ${count} تدريب جديد متاح`, 'success');
}

// ============================================
// Initialize Application (محدث)
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('%c🚀 ProVance Internship System', 'color: #667eea; font-size: 24px; font-weight: bold;');
    console.log('%c✨ نظام الطلبات المحسن - الإصدار 2.0', 'color: #51cf66; font-size: 16px;');
    
    checkLoginStatus();
    initializeApp();
});

// ============================================
// التحقق من حالة الدخول (محدث)
// ============================================
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
        window.location.href = 'student-login.html';
        return;
    }
    
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName');
    if (userName) {
        studentData.name = userName;
    }
    
    updateUserDisplay();
}

function updateUserDisplay() {
    const userDisplayElement = document.getElementById('userDisplay');
    if (userDisplayElement && studentData.name) {
        userDisplayElement.textContent = `مرحباً، ${studentData.name}`;
    }
    
    const navCounter = document.getElementById('navApplicationsCounter');
    if (navCounter) {
        navCounter.textContent = `طلباتي (${studentData.pendingApplicationsCount})`;
    }
}

// ============================================
// التهيئة المحسنة
// ============================================
function initializeApp() {
    loadStoredInternshipData();
    loadStudentData();
    
    renderInternshipCards();
    attachEventListeners();
    animateStats();
    
    addApplicationsStatusDisplay();
    
    // إعداد التحديث التلقائي
    setupAutoRefresh();
}

function loadStudentData() {
    const savedData = localStorage.getItem('studentData');
    if (savedData) {
        const parsedData = JSON.parse(savedData);
        studentData = { ...studentData, ...parsedData };
    }
    
    updatePendingApplicationsCount();
}

function updateApplicationsCounter() {
    const counterElement = document.getElementById('applicationsCounter');
    if (counterElement) {
        counterElement.textContent = `${studentData.pendingApplicationsCount}/${studentData.maxPendingApplications}`;
        
        if (studentData.pendingApplicationsCount >= studentData.maxPendingApplications) {
            counterElement.classList.add('max-limit');
        } else {
            counterElement.classList.remove('max-limit');
        }
    }
}

// دالة جديدة: إضافة عرض لحالة الطلبات
function addApplicationsStatusDisplay() {
    const statusContainer = document.querySelector('.filter-section') || document.querySelector('.applications-hero');
    if (statusContainer && !document.getElementById('applicationsStatus')) {
        const statusHTML = `
            <div class="applications-status" id="applicationsStatus" style="
                background: rgba(108, 99, 255, 0.1);
                border: 2px solid var(--primary);
                border-radius: 12px;
                padding: 16px;
                margin-bottom: 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                animation: fadeIn 0.5s ease;
            ">
                <div>
                    <h4 style="margin: 0; color: var(--primary); font-size: 1.1rem;">
                        <i class="fas fa-clock"></i> حالة طلباتك الحالية
                    </h4>
                    <p style="margin: 8px 0 0 0; color: var(--text-secondary); font-size: 0.9rem;">
                        يمكنك التقديم على <strong>${studentData.maxPendingApplications - studentData.pendingApplicationsCount}</strong> تدريب إضافي
                    </p>
                </div>
                <div class="status-progress" style="
                    width: 150px;
                    height: 30px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 15px;
                    overflow: hidden;
                    position: relative;
                ">
                    <div class="progress-bar" style="
                        width: ${(studentData.pendingApplicationsCount / studentData.maxPendingApplications) * 100}%;
                        height: 100%;
                        background: linear-gradient(90deg, var(--primary), var(--secondary));
                        transition: width 0.5s ease;
                    "></div>
                    <div class="progress-text" style="
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-weight: bold;
                        font-size: 0.9rem;
                    ">
                        ${studentData.pendingApplicationsCount}/${studentData.maxPendingApplications}
                    </div>
                </div>
            </div>
        `;
        
        if (statusContainer.classList.contains('filter-section')) {
            statusContainer.insertAdjacentHTML('beforebegin', statusHTML);
        } else {
            statusContainer.insertAdjacentHTML('afterend', statusHTML);
        }
    }
}

// ============================================
// Render Functions (محدثة)
// ============================================
function renderInternshipCards() {
    const grid = document.getElementById('internshipGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    const filteredInternships = filterInternships();
    
    if (filteredInternships.length === 0) {
        grid.innerHTML = `
            <div class="text-center" style="grid-column: 1 / -1; padding: var(--spacing-xl);">
                <div style="font-size: 4rem; color: var(--text-muted); margin-bottom: var(--spacing-md);">
                    <i class="fas fa-search"></i>
                </div>
                <h3 style="color: var(--text-secondary); margin-bottom: var(--spacing-sm);">لم نجد أي فرص تدريب</h3>
                <p style="color: var(--text-muted);">جرب تغيير معايير البحث أو إعادة تعيين الفلتر</p>
            </div>
        `;
        return;
    }
    
    filteredInternships.forEach(internship => {
        const card = document.createElement('div');
        card.className = 'internship-card';
        card.setAttribute('data-id', internship.id);
        
        const levelClass = `level-${internship.level}`;
        const levelText = getLevelText(internship.level);
        const eligible = isEligibleToApply(internship);
        const alreadyApplied = hasAppliedToInternship(internship.id);
        const applicationStatus = getStudentApplicationStatus(internship.id);
        const isNew = Date.now() - internship.createdAt < 3 * 24 * 60 * 60 * 1000;
        
        let buttonText = 'تقديم الآن';
        let buttonIcon = 'fa-paper-plane';
        let buttonDisabled = !eligible;
        let statusBadge = '';
        
        if (alreadyApplied) {
            buttonText = getStatusText(applicationStatus);
            buttonIcon = 'fa-check-circle';
            buttonDisabled = true;
            
            if (applicationStatus) {
                const statusClass = applicationStatus === 'pending' ? 'pending-badge' : 
                                  applicationStatus === 'accepted' ? 'accepted-badge' : 'rejected-badge';
                const statusText = applicationStatus === 'pending' ? 'قيد المراجعة' :
                                  applicationStatus === 'accepted' ? 'مقبول' : 'مرفوض';
                
                statusBadge = `<div class="application-status-badge ${statusClass}">${statusText}</div>`;
            }
        }
        
        card.innerHTML = `
            <div class="internship-header" style="position: relative;">
                ${isNew ? '<div class="new-badge">جديد</div>' : ''}
                <div class="company-logo">
                    ${internship.logo}
                </div>
                <div class="internship-info">
                    <h3 class="internship-title">${internship.title}</h3>
                    <div class="company-name">${internship.company}</div>
                    <div class="internship-level ${levelClass}">${levelText}</div>
                    ${statusBadge}
                </div>
            </div>
            <div class="internship-meta">
                <div class="meta-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${internship.location}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-clock"></i>
                    <span>${internship.duration}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-users"></i>
                    <span>${internship.applicants}/${internship.maxApplicants}</span>
                </div>
            </div>
            <div class="internship-tags">
                ${internship.fields.map(field => `<span class="tag">${field}</span>`).join('')}
            </div>
            <div class="internship-footer">
                <div class="internship-salary">${internship.price}</div>
                <button class="apply-btn" ${buttonDisabled ? 'disabled' : ''}>
                    <i class="fas ${buttonIcon}"></i>
                    <span>${buttonText}</span>
                </button>
            </div>
        `;
        
        grid.appendChild(card);
    });
    
    attachCardEventListeners();
}

function renderInternshipDetails(internship) {
    const detailsSection = document.getElementById('internshipDetails');
    if (!detailsSection) return;
    
    const levelClass = `level-${internship.level}`;
    const levelText = getLevelText(internship.level);
    const alreadyApplied = hasAppliedToInternship(internship.id);
    const applicationStatus = getStudentApplicationStatus(internship.id);
    
    detailsSection.innerHTML = `
        <div class="details-header">
            <div class="details-logo">
                ${internship.logo}
            </div>
            <div class="details-info">
                <h2 class="details-title">${internship.title}</h2>
                <div class="details-company">${internship.company}</div>
                <div class="internship-level ${levelClass}">${levelText}</div>
                ${alreadyApplied ? `<div class="application-status-indicator status-${applicationStatus}">${getStatusText(applicationStatus)}</div>` : ''}
                <p class="details-description">${internship.description}</p>
            </div>
        </div>
        
        <div class="details-grid">
            <div class="details-section">
                <h3 class="section-title">
                    <i class="fas fa-map-marker-alt"></i>
                    الفروع المتاحة
                </h3>
                <div class="branch-selection" id="branchSelection">
                    ${internship.branches.map(branch => `
                        <div class="branch-card" data-id="${branch.id}">
                            <div class="branch-name">${branch.name}</div>
                            <div class="branch-location">${branch.location}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="details-section">
                <h3 class="section-title">
                    <i class="fas fa-chart-bar"></i>
                    إحصائيات المجالات
                </h3>
                <div class="field-stats">
                    ${internship.fieldsStats.map(field => `
                        <div class="field-stat">
                            <div class="field-name">${field.name}</div>
                            <div class="field-counter">${field.current}/${field.max}</div>
                            <div class="field-label">متقدم/العدد المطلوب</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="details-section">
                <h3 class="section-title">
                    <i class="fas fa-graduation-cap"></i>
                    المميزات المعرفية
                </h3>
                <div class="benefits-list">
                    ${internship.knowledgeBenefits.map(benefit => `
                        <div class="benefit-item">
                            <div class="benefit-icon">
                                <i class="fas fa-brain"></i>
                            </div>
                            <div class="benefit-text">
                                <div class="benefit-title">${benefit.title}</div>
                                <div class="benefit-description">${benefit.description}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            ${internship.financialBenefits.length > 0 ? `
            <div class="details-section">
                <h3 class="section-title">
                    <i class="fas fa-money-bill-wave"></i>
                    المميزات المادية
                </h3>
                <div class="benefits-list">
                    ${internship.financialBenefits.map(benefit => `
                        <div class="benefit-item">
                            <div class="benefit-icon">
                                <i class="fas fa-gift"></i>
                            </div>
                            <div class="benefit-text">
                                <div class="benefit-title">${benefit.title}</div>
                                <div class="benefit-description">${benefit.description}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            
            <div class="details-section">
                <h3 class="section-title">
                    <i class="fas fa-info-circle"></i>
                    معلومات التقديم
                </h3>
                <div class="application-info-box">
                    ${getApplicationInfoHTML(internship)}
                </div>
            </div>
        </div>
        
        <div class="details-actions">
            <button class="btn btn-secondary" id="backToList">
                <i class="fas fa-arrow-right"></i>
                <span>العودة للقائمة</span>
            </button>
            ${alreadyApplied ? `
                <button class="btn btn-info" id="viewApplicationBtn">
                    <i class="fas fa-eye"></i>
                    <span>عرض حالة الطلب</span>
                </button>
            ` : `
                <button class="btn btn-primary" id="applyToInternship" ${isEligibleToApply(internship) ? '' : 'disabled'}>
                    <i class="fas fa-paper-plane"></i>
                    <span>${isEligibleToApply(internship) ? 'تقديم طلب التدريب' : 'غير متاح للتقديم'}</span>
                </button>
            `}
        </div>
    `;
    
    detailsSection.style.display = 'block';
    attachDetailsEventListeners(internship);
}

// دالة جديدة: الحصول على معلومات التقديم
function getApplicationInfoHTML(internship) {
    const alreadyApplied = hasAppliedToInternship(internship.id);
    const applicationStatus = getStudentApplicationStatus(internship.id);
    
    if (alreadyApplied) {
        return `
            <div class="info-item applied">
                <i class="fas fa-check-circle"></i>
                <div>
                    <strong>لقد تقدمت على هذا التدريب مسبقاً</strong>
                    <p>حالة طلبك: <span class="status-${applicationStatus}">${getStatusText(applicationStatus)}</span></p>
                </div>
            </div>
        `;
    }
    
    const eligible = isEligibleToApply(internship);
    const availableSlots = internship.maxApplicants - internship.applicants;
    
    if (!eligible) {
        const reasons = getEligibilityReasons(internship);
        return `
            <div class="info-item not-eligible">
                <i class="fas fa-exclamation-circle"></i>
                <div>
                    <strong>غير متاح للتقديم</strong>
                    <ul>
                        ${reasons.map(reason => `<li>${reason}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    }
    
    return `
        <div class="info-item eligible">
            <i class="fas fa-thumbs-up"></i>
            <div>
                <strong>متاح للتقديم</strong>
                <p>المقاعد المتاحة: ${availableSlots} من ${internship.maxApplicants}</p>
                <p>طلباتك الحالية: ${studentData.pendingApplicationsCount} من ${studentData.maxPendingApplications}</p>
            </div>
        </div>
    `;
}

// ============================================
// Event Listeners (محدثة)
// ============================================
function attachEventListeners() {
    const priceFilter = document.getElementById('priceFilter');
    const locationFilter = document.getElementById('locationFilter');
    const companyFilter = document.getElementById('companyFilter');
    const levelFilter = document.getElementById('levelFilter');
    const resetFilters = document.getElementById('resetFilters');
    
    if (priceFilter) priceFilter.addEventListener('change', function() {
        renderInternshipCards();
        updateApplicationsStatusDisplay();
    });
    if (locationFilter) locationFilter.addEventListener('change', function() {
        renderInternshipCards();
        updateApplicationsStatusDisplay();
    });
    if (companyFilter) companyFilter.addEventListener('input', function() {
        renderInternshipCards();
        updateApplicationsStatusDisplay();
    });
    if (levelFilter) levelFilter.addEventListener('change', function() {
        renderInternshipCards();
        updateApplicationsStatusDisplay();
    });
    if (resetFilters) resetFilters.addEventListener('click', resetAllFilters);
    
    const closeApplicationModal = document.getElementById('closeApplicationModal');
    const cancelApplication = document.getElementById('cancelApplication');
    const closeSuccessModal = document.getElementById('closeSuccessModal');
    const closeUnavailableModal = document.getElementById('closeUnavailableModal');
    
    if (closeApplicationModal) closeApplicationModal.addEventListener('click', closeModals);
    if (cancelApplication) cancelApplication.addEventListener('click', closeModals);
    if (closeSuccessModal) closeSuccessModal.addEventListener('click', closeModals);
    if (closeUnavailableModal) closeUnavailableModal.addEventListener('click', closeModals);
    
    const submitApplication = document.getElementById('submitApplication');
    if (submitApplication) submitApplication.addEventListener('click', submitApplicationForm);
    
    document.addEventListener('click', function(e) {
        const applicationModal = document.getElementById('applicationModal');
        const successModal = document.getElementById('successModal');
        const unavailableModal = document.getElementById('unavailableModal');
        
        if (applicationModal && applicationModal.classList.contains('active') && e.target === applicationModal) {
            closeModals();
        }
        
        if (successModal && successModal.classList.contains('active') && e.target === successModal) {
            closeModals();
        }
        
        if (unavailableModal && unavailableModal.classList.contains('active') && e.target === unavailableModal) {
            closeModals();
        }
    });
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    
    setInterval(() => {
        updatePendingApplicationsCount();
    }, 30000);
}

function attachCardEventListeners() {
    const cards = document.querySelectorAll('.internship-card');
    cards.forEach(card => {
        card.addEventListener('click', function() {
            const internshipId = parseInt(this.getAttribute('data-id'));
            const internship = internshipsData.find(i => i.id === internshipId);
            
            if (internship) {
                showInternshipDetails(internship);
            }
        });
        
        const applyBtn = card.querySelector('.apply-btn');
        if (applyBtn) {
            applyBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                
                const internshipId = parseInt(card.getAttribute('data-id'));
                const internship = internshipsData.find(i => i.id === internshipId);
                const alreadyApplied = hasAppliedToInternship(internshipId);
                
                if (!alreadyApplied && internship && isEligibleToApply(internship)) {
                    showApplicationModal(internship);
                } else if (alreadyApplied) {
                    showNotification('لقد تقدمت على هذا التدريب مسبقاً', 'info');
                } else {
                    showEligibilityError(internship);
                }
            });
        }
    });
}

function attachDetailsEventListeners(internship) {
    const branchCards = document.querySelectorAll('.branch-card');
    branchCards.forEach(card => {
        card.addEventListener('click', function() {
            branchCards.forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            
            const branchId = parseInt(this.getAttribute('data-id'));
            selectedBranch = internship.branches.find(b => b.id === branchId);
        });
    });
    
    if (branchCards.length > 0 && !selectedBranch) {
        branchCards[0].click();
    }
    
    const backToList = document.getElementById('backToList');
    if (backToList) {
        backToList.addEventListener('click', function() {
            hideInternshipDetails();
        });
    }
    
    const applyToInternship = document.getElementById('applyToInternship');
    if (applyToInternship) {
        applyToInternship.addEventListener('click', function() {
            const alreadyApplied = hasAppliedToInternship(internship.id);
            
            if (!alreadyApplied && isEligibleToApply(internship)) {
                showApplicationModal(internship);
            } else if (alreadyApplied) {
                showNotification('لقد تقدمت على هذا التدريب مسبقاً', 'info');
            } else {
                showEligibilityError(internship);
            }
        });
    }
    
    const viewApplicationBtn = document.getElementById('viewApplicationBtn');
    if (viewApplicationBtn) {
        viewApplicationBtn.addEventListener('click', function() {
            window.location.href = 'student-applications.html';
        });
    }
}

// ============================================
// Filter Functions (محدثة)
// ============================================
function filterInternships() {
    const priceFilter = document.getElementById('priceFilter')?.value;
    const locationFilter = document.getElementById('locationFilter')?.value;
    const companyFilter = document.getElementById('companyFilter')?.value.toLowerCase();
    const levelFilter = document.getElementById('levelFilter')?.value;
    
    return internshipsData.filter(internship => {
        if (priceFilter) {
            if (priceFilter === 'free' && internship.price !== 'مجاني') return false;
            if (priceFilter === 'paid' && internship.price === 'مجاني') return false;
            if (priceFilter === '0-1000' && (internship.price === 'مجاني' || parseInt(internship.price) > 1000)) return false;
            if (priceFilter === '1000-2000' && (parseInt(internship.price) < 1000 || parseInt(internship.price) > 2000)) return false;
            if (priceFilter === '2000+' && parseInt(internship.price) <= 2000) return false;
        }
        
        if (locationFilter && internship.location !== locationFilter) return false;
        
        if (companyFilter && !internship.company.toLowerCase().includes(companyFilter)) return false;
        
        if (levelFilter && internship.level !== levelFilter) return false;
        
        return true;
    });
}

function resetAllFilters() {
    const priceFilter = document.getElementById('priceFilter');
    const locationFilter = document.getElementById('locationFilter');
    const companyFilter = document.getElementById('companyFilter');
    const levelFilter = document.getElementById('levelFilter');
    
    if (priceFilter) priceFilter.value = '';
    if (locationFilter) locationFilter.value = '';
    if (companyFilter) companyFilter.value = '';
    if (levelFilter) levelFilter.value = '';
    
    renderInternshipCards();
    updateApplicationsStatusDisplay();
}

// دالة جديدة: تحديث عرض حالة الطلبات
function updateApplicationsStatusDisplay() {
    const statusDisplay = document.getElementById('applicationsStatus');
    if (statusDisplay) {
        const progressBar = statusDisplay.querySelector('.progress-bar');
        const progressText = statusDisplay.querySelector('.progress-text');
        const infoText = statusDisplay.querySelector('p');
        
        if (progressBar) {
            progressBar.style.width = `${(studentData.pendingApplicationsCount / studentData.maxPendingApplications) * 100}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${studentData.pendingApplicationsCount}/${studentData.maxPendingApplications}`;
        }
        
        if (infoText) {
            infoText.innerHTML = `يمكنك التقديم على <strong>${studentData.maxPendingApplications - studentData.pendingApplicationsCount}</strong> تدريب إضافي`;
        }
    }
}

// ============================================
// Application Functions (محدثة)
// ============================================
function submitApplicationForm() {
    const form = document.getElementById('applicationForm');
    const checkboxes = form.querySelectorAll('input[type="checkbox"]');
    const textarea = form.querySelector('textarea');
    
    let isValid = true;
    
    checkboxes.forEach(checkbox => {
        if (!checkbox.checked) {
            isValid = false;
            checkbox.parentElement.style.color = 'var(--error)';
        } else {
            checkbox.parentElement.style.color = '';
        }
    });
    
    if (!textarea.value.trim()) {
        isValid = false;
        textarea.style.borderColor = 'var(--error)';
    } else {
        textarea.style.borderColor = '';
    }
    
    if (!isValid) {
        showNotification('يرجى ملء جميع الحقول المطلوبة وتأكيد الموافقة على الشروط', 'error');
        return;
    }
    
    if (!isEligibleToApply(selectedInternship)) {
        showNotification('لا يمكنك التقديم على هذا التدريب حالياً.', 'error');
        return;
    }
    
    if (hasAppliedToInternship(selectedInternship.id)) {
        showNotification('لقد تقدمت على هذا التدريب مسبقاً', 'error');
        return;
    }
    
    const submitBtn = document.getElementById('submitApplication');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>جاري التقديم...</span>';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        const saveSuccess = saveApplicationToStorage(selectedInternship, selectedBranch, textarea.value);
        
        if (!saveSuccess) {
            showNotification('حدث خطأ في حفظ الطلب، يرجى المحاولة مرة أخرى', 'error');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            return;
        }
        
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        closeModals();
        showSuccessModal();
        hideInternshipDetails();
        
        showNotification('تم تقديم طلب التدريب بنجاح!', 'success');
    }, 2000);
}

// ============================================
// Helper Functions (محدثة)
// ============================================
function getLevelText(level) {
    const levels = {
        'beginner': 'مبتدئ (أول مرة)',
        'intermediate': 'متوسط (تدريب واحد)',
        'advanced': 'خبير (تدريبين أو أكثر)'
    };
    return levels[level] || level;
}

function isEligibleToApply(internship) {
    if (internship.level !== studentData.level) {
        return false;
    }
    
    if (internship.applicants >= internship.maxApplicants) {
        return false;
    }
    
    if (studentData.pendingApplicationsCount >= studentData.maxPendingApplications) {
        return false;
    }
    
    if (hasAppliedToInternship(internship.id)) {
        return false;
    }
    
    return true;
}

// دالة جديدة: الحصول على أسباب عدم الأهلية
function getEligibilityReasons(internship) {
    const reasons = [];
    
    if (internship.level !== studentData.level) {
        const levelText = getLevelText(internship.level);
        const studentLevelText = getLevelText(studentData.level);
        reasons.push(`المستوى المطلوب: ${levelText} (مستواك: ${studentLevelText})`);
    }
    
    if (internship.applicants >= internship.maxApplicants) {
        reasons.push('تم الوصول للحد الأقصى للمتقدمين');
    }
    
    if (studentData.pendingApplicationsCount >= studentData.maxPendingApplications) {
        reasons.push(`لديك ${studentData.pendingApplicationsCount} طلب قيد المراجعة (الحد الأقصى: ${studentData.maxPendingApplications})`);
    }
    
    if (hasAppliedToInternship(internship.id)) {
        const status = getStudentApplicationStatus(internship.id);
        reasons.push(`لقد تقدمت مسبقاً (الحالة: ${getStatusText(status)})`);
    }
    
    return reasons;
}

function showEligibilityError(internship) {
    const reasons = getEligibilityReasons(internship);
    
    if (reasons.length > 0) {
        showUnavailableModal(reasons);
    } else {
        showNotification('لا يمكنك التقديم على هذا التدريب حالياً.', 'error');
    }
}

// ============================================
// الأنماط الإضافية
// ============================================
function addAdditionalStyles() {
    if (!document.querySelector('#additional-styles')) {
        const style = document.createElement('style');
        style.id = 'additional-styles';
        style.textContent = `
            .application-status-badge {
                display: inline-block;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 0.8rem;
                font-weight: bold;
                margin-top: 8px;
                margin-left: 8px;
            }
            
            .pending-badge {
                background: rgba(255, 230, 109, 0.2);
                color: var(--warning);
                border: 1px solid var(--warning);
            }
            
            .accepted-badge {
                background: rgba(78, 205, 196, 0.2);
                color: var(--success);
                border: 1px solid var(--success);
            }
            
            .rejected-badge {
                background: rgba(255, 107, 107, 0.2);
                color: var(--error);
                border: 1px solid var(--error);
            }
            
            .status-pending {
                color: var(--warning);
            }
            
            .status-accepted {
                color: var(--success);
            }
            
            .status-rejected {
                color: var(--error);
            }
            
            .application-status-indicator {
                display: inline-block;
                padding: 6px 16px;
                border-radius: 20px;
                font-size: 0.9rem;
                font-weight: bold;
                margin-left: 12px;
                vertical-align: middle;
            }
            
            .info-item {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                padding: 16px;
                border-radius: 12px;
                margin-bottom: 12px;
                background: rgba(255, 255, 255, 0.05);
            }
            
            .info-item.applied {
                border-right: 4px solid var(--primary);
            }
            
            .info-item.not-eligible {
                border-right: 4px solid var(--error);
            }
            
            .info-item.eligible {
                border-right: 4px solid var(--success);
            }
            
            .info-item i {
                font-size: 1.5rem;
                margin-top: 4px;
            }
            
            .info-item.applied i {
                color: var(--primary);
            }
            
            .info-item.not-eligible i {
                color: var(--error);
            }
            
            .info-item.eligible i {
                color: var(--success);
            }
            
            .info-item ul {
                margin: 8px 0 0 20px;
                padding: 0;
            }
            
            .info-item li {
                margin-bottom: 4px;
                color: var(--text-secondary);
            }
            
            .max-limit {
                color: var(--error) !important;
                font-weight: bold;
            }
            
            .new-badge {
                position: absolute;
                top: 10px;
                left: 10px;
                background: var(--success);
                color: white;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 0.8rem;
                font-weight: bold;
                z-index: 1;
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }

            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }
}

// استدعاء إضافة الأنماط عند التهيئة
addAdditionalStyles();

// ============================================
// Export for Global Access
// ============================================
window.InternshipManager = {
    internshipsData,
    studentData,
    renderInternshipCards,
    showInternshipDetails,
    hideInternshipDetails,
    showApplicationModal,
    closeModals,
    submitApplicationForm,
    saveApplicationToStorage,
    updateInternshipApplicants,
    updatePendingApplicationsCount,
    hasAppliedToInternship,
    getStudentApplicationStatus,
    isEligibleToApply
};
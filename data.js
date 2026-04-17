// إدارة بيانات النظام
const DataManager = {
    // حفظ بيانات الطالب مع تاريخ الميلاد
    saveStudent(studentData) {
        const students = this.getStudents();
        studentData.id = this.generateId();
        studentData.registrationDate = new Date().toISOString();
        students.push(studentData);
        localStorage.setItem('students', JSON.stringify(students));
        return studentData;
    },

    // الحصول على جميع الطلاب
    getStudents() {
        return JSON.parse(localStorage.getItem('students')) || [];
    },

    // البحث عن طالب بالبريد الإلكتروني
    findStudentByEmail(email) {
        const students = this.getStudents();
        return students.find(student => student.email === email);
    },

    // حساب العمر من تاريخ الميلاد (وظيفة مساعدة)
    calculateAge(birthDate) {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age;
    },

    // التحقق من صحة العمر
    validateAge(birthDate, minAge = 18, maxAge = 30) {
        const age = this.calculateAge(birthDate);
        return age >= minAge && age <= maxAge;
    },

    // توليد معرف فريد
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // الحصول على إحصائيات الطلاب حسب العمر
    getStudentsByAge() {
        const students = this.getStudents();
        const ageGroups = {
            '18-20': 0,
            '21-23': 0,
            '24-26': 0,
            '27-30': 0
        };
        
        students.forEach(student => {
            const age = this.calculateAge(student.birthDate);
            
            if (age >= 18 && age <= 20) {
                ageGroups['18-20']++;
            } else if (age >= 21 && age <= 23) {
                ageGroups['21-23']++;
            } else if (age >= 24 && age <= 26) {
                ageGroups['24-26']++;
            } else if (age >= 27 && age <= 30) {
                ageGroups['27-30']++;
            }
        });
        
        return ageGroups;
    }
};

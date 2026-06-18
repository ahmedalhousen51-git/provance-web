// ===== ProVance Attendance Utilities =====
// مصدر الحقيقة الوحيد لحسابات الحضور — يُستخدم في company-trainers و student-profile
// أي تعديل في المنطق يتم هنا مرة واحدة فقط

(function () {
    'use strict';

    const ATT_DAY_MAP = {
        'الأحد': 0, 'الاثنين': 1, 'الإثنين': 1,
        'الثلاثاء': 2, 'الأربعاء': 3, 'الخميس': 4,
        'الجمعة': 5, 'السبت': 6
    };

    const DURATION_TEXT_MAP = {
        '1-week': 'أسبوع', '2-weeks': 'أسبوعين', '3-weeks': '3 أسابيع', '4-weeks': '4 أسابيع',
        '1-month': 'شهر', '1.5-months': 'شهر ونصف', '2-months': 'شهرين', '2.5-months': 'شهرين ونصف',
        '3-months': '3 أشهر', '4-months': '4 أشهر', '5-months': '5 أشهر', '6-months': '6 أشهر'
    };

    const DURATION_DAYS_MAP = {
        '1-week': 7,  '2-weeks': 14,  '3-weeks': 21,  '4-weeks': 28,
        '1-month': 30, '1.5-months': 45, '2-months': 60, '2.5-months': 75,
        '3-months': 90, '4-months': 120, '5-months': 150, '6-months': 180
    };

    const AR_DAYS_NUM_MAP = {
        'أسبوع': 7, 'اسبوع': 7, 'أسبوعين': 14, 'اسبوعين': 14,
        '3 أسابيع': 21, '4 أسابيع': 28,
        'شهر': 30, 'شهر ونصف': 45, 'شهر ونص': 45,
        'شهرين': 60, 'شهرين ونصف': 75, 'شهرين ونص': 75,
        '3 أشهر': 90, '3 شهور': 90, '4 أشهر': 120,
        '5 أشهر': 150, '6 أشهر': 180, '6 شهور': 180
    };

    // مفتاح اليوم بالتوقيت المحلي — يمنع انزلاق اليوم عند منتصف الليل
    function att_localDayKey(d) {
        const dt = (d instanceof Date) ? d : new Date(d);
        return dt.getFullYear() + '-' +
               String(dt.getMonth() + 1).padStart(2, '0') + '-' +
               String(dt.getDate()).padStart(2, '0');
    }

    // يفسّر "YYYY-MM-DD" كمنتصف ليل محلي لا UTC
    function att_parseDate(s) {
        if (s instanceof Date) { const d = new Date(s); d.setHours(0, 0, 0, 0); return d; }
        if (typeof s === 'string') {
            const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
            if (m) return new Date(+m[1], +m[2] - 1, +m[3], 0, 0, 0, 0);
        }
        const d = new Date(s); d.setHours(0, 0, 0, 0); return d;
    }

    // كود المدة → نص عربي
    function att_durationText(d) {
        if (!d) return 'غير محدد';
        const s = String(d).trim();
        return DURATION_TEXT_MAP[s] || s;
    }

    // كود المدة → عدد أيام
    function att_durationDays(d) {
        if (!d) return 0;
        const s = String(d).trim();
        if (DURATION_DAYS_MAP[s] != null) return DURATION_DAYS_MAP[s];
        if (AR_DAYS_NUM_MAP[s] != null) return AR_DAYS_NUM_MAP[s];
        const num = parseFloat((s.match(/[\d.]+/) || [])[0]);
        if (!isNaN(num)) {
            if (/أسبوع|اسبوع|week/i.test(s)) return Math.round(num * 7);
            if (/شهر|شهور|month/i.test(s)) return Math.round(num * 30);
        }
        return 0;
    }

    // حساب نص المدة من تاريخين فعليين (شامل +1 — نهاية تاريخ بداية + نهاية)
    function att_calcDurationText(startDate, endDate, fallbackDuration) {
        if (startDate && endDate) {
            const s = att_parseDate(startDate instanceof Date ? att_localDayKey(startDate) : startDate);
            const e = att_parseDate(endDate instanceof Date ? att_localDayKey(endDate) : endDate);
            if (!isNaN(s) && !isNaN(e) && e >= s) {
                const calDays = Math.ceil((e - s) / 86400000) + 1;
                return calDays >= 30 ? Math.round(calDays / 30) + ' شهر' : calDays + ' يوم';
            }
        }
        return att_durationText(fallbackDuration);
    }

    // استخراج تواريخ التدريب — الأولوية دائماً لـ sched.start_date
    function att_getTrainingDates(t) {
        const sched = (t && t.training_schedule) || {};
        let start = sched.start_date ? att_parseDate(sched.start_date)
            : (t.interview_date ? new Date(t.interview_date)
            : (t.updated_at ? new Date(t.updated_at) : null));
        if (!start || isNaN(start)) return { start: null, end: null, daysLeft: null, progress: null };

        let end;
        if (sched.end_date) {
            end = att_parseDate(sched.end_date);
        } else {
            const days = att_durationDays(t.duration);
            if (days > 0) { end = new Date(start); end.setDate(end.getDate() + days); }
            else end = null;
        }

        let daysLeft = null, progress = null;
        if (end && !isNaN(end)) {
            const today = new Date(); today.setHours(0, 0, 0, 0);
            const s = new Date(start); s.setHours(0, 0, 0, 0);
            const e = new Date(end);   e.setHours(0, 0, 0, 0);
            daysLeft = Math.round((e - today) / 86400000);
            const totalDays  = Math.round((e - s) / 86400000);
            const passedDays = Math.round((today - s) / 86400000);
            progress = totalDays > 0 ? Math.max(0, Math.min(100, Math.round((passedDays / totalDays) * 100))) : null;
        }
        return { start, end, daysLeft, progress };
    }

    // ===== الدالة المركزية لحساب الحضور =====
    // app  : كائن الطلب (training_schedule, training_start_date, training_end_date)
    // logs : سجلات الحضور المُصفّاة مسبقاً لهذا الطلب (daily_attendance فقط)
    // ترجع: { rate, present, presentAll, onTime, late, absent, total, bonusDays, companyHolidays, hasData, hasScheduleOnly }
    //   present       = أيام العمل المفروضة التي حضر فيها الطالب
    //   presentAll    = إجمالي أيام الحضور الفعلي (بما فيها الإضافية)
    //   absent        = أيام العمل المفروضة التي غاب فيها (قبل تعويض الـ bonus)
    //   bonusDays     = حضور في أيام إجازة أو خارج الجدول (تعوّض الغياب في النسبة)
    //   companyHolidays = أيام الجدول الزمني الكلية ناقص أيام العمل (إجازات الشركة)
    //   rate          = min(100, max(0, round((expected - max(0,absent-bonus)) / expected * 100)))
    function att_calcAttendance(app, logs) {
        const sched      = (app && app.training_schedule) || {};
        const startDate  = sched.start_date || (app && app.training_start_date) || null;
        const endDate    = sched.end_date   || (app && app.training_end_date)   || null;

        const workDayNames = Array.isArray(sched.training_days) ? sched.training_days : null;
        const workDayNums  = workDayNames
            ? workDayNames.map(d => ATT_DAY_MAP[d]).filter(n => n !== undefined)
            : null;

        // اقتصر على نطاق التدريب الرسمي فقط (سجلات ما قبل البداية تُشوّه النسبة)
        let daily = Array.isArray(logs) ? logs : [];
        if (startDate) {
            const _fStart = att_parseDate(startDate);
            const _fEnd   = endDate ? att_parseDate(endDate) : null;
            daily = daily.filter(a => {
                if (!a.scanned_at) return false;
                const _d = att_parseDate(att_localDayKey(a.scanned_at));
                return _d >= _fStart && (_fEnd === null || _d <= _fEnd);
            });
        }

        // مجموعة أيام الحضور: مفتاح YYYY-MM-DD → أول حالة في اليوم
        const attendedDays = {};
        daily.forEach(a => {
            if (!a.scanned_at) return;
            const k = att_localDayKey(a.scanned_at);
            if (!attendedDays[k]) attendedDays[k] = a.status || 'on_time';
        });
        const presentDaysCount = Object.keys(attendedDays).length;

        let expectedWorkDays = 0, realAbsent = 0, companyHolidays = 0;
        let onTime = 0, late = 0, bonusDays = 0;
        const workDayKeySet = {};

        if (startDate && workDayNums && workDayNums.length) {
            const start   = att_parseDate(startDate);
            const today   = new Date(); today.setHours(0, 0, 0, 0);
            const end     = endDate ? att_parseDate(endDate) : today;
            const lastDay = end < today ? end : today;

            for (let dt = new Date(start); dt <= lastDay; dt.setDate(dt.getDate() + 1)) {
                const dayKey = att_localDayKey(dt);
                if (workDayNums.includes(dt.getDay())) {
                    expectedWorkDays++;
                    workDayKeySet[dayKey] = true;
                    if (attendedDays[dayKey]) {
                        if (attendedDays[dayKey] === 'on_time') onTime++;
                        else if (attendedDays[dayKey] === 'late') late++;
                    } else {
                        realAbsent++;
                    }
                } else {
                    companyHolidays++;
                }
            }
            // الأيام الإضافية: حضور في غير أيام العمل (مكافأة، لا عقوبة)
            Object.keys(attendedDays).forEach(k => { if (!workDayKeySet[k]) bonusDays++; });
        } else {
            // بدون جدول: nعدّ on_time/late من كل السجلات
            Object.values(attendedDays).forEach(s => {
                if (s === 'on_time') onTime++;
                else if (s === 'late') late++;
            });
        }

        let rate, total, absent;
        if (expectedWorkDays > 0) {
            total  = expectedWorkDays;
            absent = realAbsent;
            const netAbsent = Math.max(0, realAbsent - bonusDays);
            rate = Math.min(100, Math.max(0, Math.round(((expectedWorkDays - netAbsent) / expectedWorkDays) * 100)));
        } else {
            const absCount = (Array.isArray(logs) ? logs : []).filter(a => a.status === 'absent').length;
            absent = absCount;
            total  = presentDaysCount + absent;
            rate   = total > 0 ? Math.round((presentDaysCount / total) * 100) : (presentDaysCount > 0 ? 100 : 0);
        }

        const presentOnWorkDays = expectedWorkDays > 0 ? (onTime + late) : presentDaysCount;
        return {
            rate,
            present:        presentOnWorkDays,
            presentAll:     presentDaysCount,
            onTime, late,
            absent, total,
            bonusDays, companyHolidays,
            hasData:         (Array.isArray(logs) ? logs : []).length > 0,
            hasScheduleOnly: (Array.isArray(logs) ? logs : []).length === 0 && expectedWorkDays > 0
        };
    }

    // ===== نشر على window.ProVance.Att =====
    window.ProVance = window.ProVance || {};
    window.ProVance.Att = {
        _dayMap:         ATT_DAY_MAP,
        localDayKey:     att_localDayKey,
        parseDate:       att_parseDate,
        durationText:    att_durationText,
        durationDays:    att_durationDays,
        calcDuration:    att_calcDurationText,
        getTrainingDates: att_getTrainingDates,
        calc:            att_calcAttendance
    };
})();

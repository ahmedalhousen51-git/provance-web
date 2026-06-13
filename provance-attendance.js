/* ============================================================================
 * provance-attendance.js  —  مصدر واحد لحساب الحضور (طالب + شركة)
 * ----------------------------------------------------------------------------
 * المشكلة القديمة: الكود كان بيبني "مفتاح اليوم" بالـ UTC (toISOString) بينما
 * بيقرأ "رقم اليوم في الأسبوع" بالتوقيت المحلي (getDay). في القاهرة (UTC+2/+3)
 * ده بيخلي السكان اللي اتعمل قرب نص الليل يتسجّل في يوم UTC مختلف، فالحضور
 * مايتطابقش مع يوم العمل ⇒ غياب وهمي ونِسَب متناقضة.
 *
 * الحل: نستخدم نفس التقويم المحلي في كل خطوة (المفتاح + رقم اليوم + تواريخ
 * البداية/النهاية). وكمان نضمن دايماً إن: حاضر + غياب = أيام العمل المفروضة.
 *
 * الاستخدام:
 *   const s = ProvanceAttendance.summarize({
 *       logs:     [...],            // attendance_logs لطالب واحد
 *       schedule: app.training_schedule,   // فيه start_date / end_date / training_days
 *       today:    new Date()        // اختياري
 *   });
 *   // s = { rate, expectedWorkDays, present, absent, onTime, late,
 *   //       companyHolidays, workDayNames, days[], hasSchedule }
 * ==========================================================================*/
(function (global) {
  'use strict';

  var AR_DAY_TO_NUM = {
    'الأحد': 0, 'الإثنين': 1, 'الاثنين': 1, 'الثلاثاء': 2,
    'الأربعاء': 3, 'الخميس': 4, 'الجمعة': 5, 'السبت': 6
  };

  // مفتاح اليوم بالتوقيت المحلي (YYYY-MM-DD) — مش UTC
  function localDayKey(d) {
    var dt = (d instanceof Date) ? d : new Date(d);
    var y = dt.getFullYear();
    var m = String(dt.getMonth() + 1).padStart(2, '0');
    var day = String(dt.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }

  // يفسّر "YYYY-MM-DD" كمنتصف ليل محلي (مايزحفش يوم بسبب UTC)
  function parseLocalDate(s) {
    if (s instanceof Date) { var d0 = new Date(s); d0.setHours(0, 0, 0, 0); return d0; }
    if (typeof s === 'string') {
      var m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (m) return new Date(+m[1], +m[2] - 1, +m[3], 0, 0, 0, 0);
    }
    var d = new Date(s); d.setHours(0, 0, 0, 0); return d;
  }

  function summarize(opts) {
    opts = opts || {};
    var logs = Array.isArray(opts.logs) ? opts.logs : [];
    var sched = opts.schedule || null;
    var today = opts.today ? new Date(opts.today) : new Date();
    today.setHours(0, 0, 0, 0);

    // سجلات الحضور اليومي فقط
    var daily = logs.filter(function (a) {
      return a && a.attendance_type === 'daily_attendance' && a.scanned_at;
    });

    // أيام الحضور الفعلية (يوم واحد = مرة واحدة) بمفتاح محلي
    var attendedDays = {};
    daily.forEach(function (a) {
      var k = localDayKey(a.scanned_at);
      if (!attendedDays[k]) attendedDays[k] = a.status || 'on_time';
    });

    var presentDaysCount = Object.keys(attendedDays).length;
    // عُدّ "في الوقت" و"متأخر" بالأيام المميزة (مش السكانات الخام) عشان التكرار مايأثرش
    var dayStatuses = Object.keys(attendedDays).map(function (k) { return attendedDays[k]; });
    var onTime = dayStatuses.filter(function (s) { return s === 'on_time'; }).length;
    var late = dayStatuses.filter(function (s) { return s === 'late'; }).length;

    var workDayNames = (sched && Array.isArray(sched.training_days)) ? sched.training_days : null;
    var workDayNums = workDayNames
      ? workDayNames.map(function (d) { return AR_DAY_TO_NUM[d]; })
                    .filter(function (n) { return n !== undefined; })
      : null;

    var expectedWorkDays = 0, realAbsent = 0, companyHolidays = 0, presentOnWorkDays = 0;
    var workDayKeySet = {};   // مفاتيح أيام العمل المفروضة (عشان نعرف السكان اللي بره الجدول)

    if (sched && sched.start_date && workDayNums && workDayNums.length) {
      var start = parseLocalDate(sched.start_date);
      var end = sched.end_date ? parseLocalDate(sched.end_date) : today;
      var lastDay = end < today ? end : today;

      for (var dt = new Date(start); dt <= lastDay; dt.setDate(dt.getDate() + 1)) {
        var dayKey = localDayKey(dt);
        var dayNum = dt.getDay();
        if (workDayNums.indexOf(dayNum) !== -1) {
          expectedWorkDays++;
          workDayKeySet[dayKey] = true;
          if (attendedDays[dayKey]) presentOnWorkDays++;
          else realAbsent++;
        } else {
          companyHolidays++;
        }
      }
    }

    // أيام حضور إضافية: الطالب سكَن في يوم مش ضمن أيام العمل (إجازة/قبل البداية)
    // دي بتزوّد الحضور بس عمرها ما بتزوّد الغياب أو المقام — مكافأة مش عقوبة
    var bonusDays = 0;
    if (expectedWorkDays > 0) {
      Object.keys(attendedDays).forEach(function (k) {
        if (!workDayKeySet[k]) bonusDays++;
      });
    }

    var rate, total, absent, present;
    if (expectedWorkDays > 0) {
      total = expectedWorkDays;
      // الحضور الإضافي (بره الجدول) يعوّض الغياب — الغياب الصافي ما ينفعش يبقى بالسالب
      var netAbsent = realAbsent - bonusDays;
      if (netAbsent < 0) netAbsent = 0;
      absent = netAbsent;
      // الحاضر = أيام العمل ناقص الغياب الصافي ⇒ دايماً: حاضر + غياب = أيام العمل
      present = expectedWorkDays - netAbsent;
      rate = Math.round((present / expectedWorkDays) * 100);
      if (rate > 100) rate = 100;
      if (rate < 0) rate = 0;
    } else {
      // مفيش جدول — طريقة بسيطة على أساس السجلات الموجودة
      absent = daily.filter(function (a) { return a.status === 'absent'; }).length;
      total = presentDaysCount + absent;
      present = presentDaysCount;
      rate = total > 0 ? Math.round((presentDaysCount / total) * 100)
                       : (presentDaysCount > 0 ? 100 : 0);
    }

    // آخر 14 يوم للأعمدة البيانية
    var byDay = {};
    daily.forEach(function (a) {
      var k = localDayKey(a.scanned_at);
      if (!byDay[k]) byDay[k] = { date: k, status: a.status };
    });
    var days = Object.keys(byDay).map(function (k) { return byDay[k]; })
      .sort(function (x, y) { return x.date.localeCompare(y.date); })
      .slice(-14);

    return {
      rate: rate,
      expectedWorkDays: total,
      present: present,
      absent: absent,
      onTime: onTime,
      late: late,
      presentDaysCount: presentDaysCount,
      bonusDays: bonusDays,
      companyHolidays: companyHolidays,
      workDayNames: workDayNames || [],
      days: days,
      hasSchedule: !!(sched && sched.start_date && workDayNums && workDayNums.length)
    };
  }

  global.ProvanceAttendance = {
    AR_DAY_TO_NUM: AR_DAY_TO_NUM,
    localDayKey: localDayKey,
    parseLocalDate: parseLocalDate,
    summarize: summarize
  };
})(typeof window !== 'undefined' ? window : this);

/* ============================================================
   reminders-check.js — فحص خلفي للمقابلات
   يشتغل عند فتح أي صفحة فيها مستخدم مسجّل:
   1) تذكير قبل المقابلة بنص ساعة (للطالب والشركة)
   2) تعليم المواعيد الفايتة (اللي عدّت من غير مسح QR)
   3) رصد 3 مخالفات → إشعار للأدمن

   الاستخدام: <script src="reminders-check.js"></script>
   ثم: window.ProVanceReminders.run(sb, userId, userType)
   ============================================================ */
(function () {
    'use strict';

    const REMINDER_WINDOW_MIN = 30; // تذكير قبل الموعد بـ 30 دقيقة
    const VIOLATION_THRESHOLD = 3;  // 3 مرات → تحويل للأدمن

    async function sendNotif(sb, opts) {
        try {
            await sb.from('notifications').insert({
                user_id: opts.userId,
                user_type: opts.userType,
                title: opts.title,
                message: opts.message,
                type: opts.type || 'info',
                link: opts.link || null,
                is_read: false
            });
        } catch (e) { console.warn('notif insert failed:', e.message); }
    }

    async function notifyAdmins(sb, opts) {
        try {
            // جيب كل الأدمنز
            const { data: admins } = await sb.from('admins').select('user_id');
            if (admins && admins.length) {
                for (const a of admins) {
                    await sendNotif(sb, { ...opts, userId: a.user_id, userType: 'admin' });
                }
            }
        } catch (e) { console.warn('notifyAdmins failed:', e.message); }
    }

    // ── 1) تذكيرات قبل نص ساعة ──────────────────────────────
    async function checkReminders(sb, userId, userType) {
        try {
            const now = Date.now();
            const windowEnd = now + REMINDER_WINDOW_MIN * 60 * 1000;

            // المقابلات المجدولة القادمة الخاصة بالمستخدم ده
            const col = userType === 'company' ? 'company_user_id' : 'student_user_id';
            const { data: apps } = await sb.from('applications')
                .select('id, student_user_id, company_user_id, student_name, company_name, internship_title, interview_date, reminder_sent, status')
                .eq(col, userId)
                .eq('status', 'interview_scheduled')
                .eq('reminder_sent', false);

            if (!apps || !apps.length) return;

            for (const app of apps) {
                if (!app.interview_date) continue;
                const t = new Date(app.interview_date).getTime();
                // داخل نافذة الـ 30 دقيقة وقبل الموعد
                if (t > now && t <= windowEnd) {
                    const timeStr = new Date(app.interview_date).toLocaleString('ar-EG', { hour: '2-digit', minute: '2-digit' });

                    // إشعار للطالب
                    await sendNotif(sb, {
                        userId: app.student_user_id, userType: 'student',
                        title: '⏰ تذكير: مقابلتك قريباً',
                        message: `مقابلتك مع ${app.company_name || 'الشركة'} الساعة ${timeStr}. لا تنسَ مسح الـ QR عند الوصول.`,
                        type: 'warning', link: 'student-applications.html'
                    });
                    // إشعار للشركة
                    await sendNotif(sb, {
                        userId: app.company_user_id, userType: 'company',
                        title: '⏰ تذكير: مقابلة قريباً',
                        message: `مقابلة مع ${app.student_name || 'متدرب'} الساعة ${timeStr}.`,
                        type: 'warning', link: 'company-interviews.html'
                    });

                    // علّم إنه اتبعت
                    await sb.from('applications').update({ reminder_sent: true }).eq('id', app.id);
                }
            }
        } catch (e) { console.warn('checkReminders:', e.message); }
    }

    // ── 2) المواعيد الفايتة ─────────────────────────────────
    async function checkMissed(sb, userId, userType) {
        try {
            const now = new Date().toISOString();
            const col = userType === 'company' ? 'company_user_id' : 'student_user_id';

            // مقابلات مجدولة عدّى موعدها وملهاش مسح ولسه مش معلّمة فايتة
            const { data: apps } = await sb.from('applications')
                .select('id, student_user_id, company_user_id, student_name, company_name, interview_date, status, interview_missed')
                .eq(col, userId)
                .eq('status', 'interview_scheduled')
                .eq('interview_missed', false)
                .lt('interview_date', now);

            if (!apps || !apps.length) return;

            for (const app of apps) {
                // تأكد إنه مفيش مسح QR للمقابلة دي (في attendance_logs)
                let hasScan = false;
                try {
                    const { data: scans } = await sb.from('attendance_logs')
                        .select('id')
                        .eq('student_user_id', app.student_user_id)
                        .eq('company_user_id', app.company_user_id)
                        .eq('purpose', 'interview')
                        .limit(1);
                    hasScan = scans && scans.length > 0;
                } catch (e) {}

                if (hasScan) {
                    // حضر فعلاً → علّمه تمت المقابلة
                    await sb.from('applications').update({ status: 'interview_done', interview_missed: false }).eq('id', app.id);
                    continue;
                }

                // ماحضرش → علّمه فايت + سجّل مخالفة على الطالب
                await sb.from('applications').update({ interview_missed: true }).eq('id', app.id);

                // سجّل مخالفة (لو مش مسجّلة قبل كده لنفس الطلب)
                try {
                    const { data: existing } = await sb.from('no_show_violations')
                        .select('id').eq('application_id', app.id).limit(1);
                    if (!existing || !existing.length) {
                        await sb.from('no_show_violations').insert({
                            application_id: app.id,
                            student_user_id: app.student_user_id,
                            student_name: app.student_name,
                            company_user_id: app.company_user_id,
                            company_name: app.company_name,
                            interview_date: app.interview_date,
                            violation_type: 'no_show',
                            by_party: 'student'
                        });

                        // إشعار للطرفين
                        await sendNotif(sb, {
                            userId: app.student_user_id, userType: 'student',
                            title: '⚠️ فاتتك المقابلة',
                            message: `لم تحضر مقابلة ${app.company_name || 'الشركة'} ولم تمسح الـ QR. تكرار ذلك ${VIOLATION_THRESHOLD} مرات يحوّل ملفك للإدارة.`,
                            type: 'error', link: 'student-applications.html'
                        });
                        await sendNotif(sb, {
                            userId: app.company_user_id, userType: 'company',
                            title: '⚠️ متدرب لم يحضر المقابلة',
                            message: `${app.student_name || 'متدرب'} لم يحضر ولم يمسح الـ QR.`,
                            type: 'warning', link: 'company-interviews.html'
                        });

                        // افحص حد المخالفات
                        await checkViolationThreshold(sb, app.student_user_id, 'student', app.student_name);
                        await checkViolationThreshold(sb, app.company_user_id, 'company', app.company_name);
                    }
                } catch (e) { console.warn('violation insert:', e.message); }
            }
        } catch (e) { console.warn('checkMissed:', e.message); }
    }

    // ── 3) رصد حد المخالفات (3 أطراف مختلفة) ────────────────
    async function checkViolationThreshold(sb, partyId, party, partyName) {
        try {
            const col = party === 'student' ? 'student_user_id' : 'company_user_id';
            const otherCol = party === 'student' ? 'company_user_id' : 'student_user_id';

            const { data: viols } = await sb.from('no_show_violations')
                .select('id, ' + otherCol)
                .eq(col, partyId)
                .eq('resolved', false);

            if (!viols) return;

            // عدّ الأطراف المختلفة (3 شركات مختلفة للطالب / 3 طلاب مختلفين للشركة)
            const distinct = new Set(viols.map(v => v[otherCol]).filter(Boolean));

            if (distinct.size >= VIOLATION_THRESHOLD) {
                // حوّل للأدمن
                const label = party === 'student'
                    ? `الطالب ${partyName || ''} تغيّب عن ${distinct.size} شركات مختلفة`
                    : `الشركة ${partyName || ''} تسبّبت في غياب ${distinct.size} طلاب مختلفين`;

                await notifyAdmins(sb, {
                    title: '🚨 مخالفات متكررة تحتاج إجراء',
                    message: `${label}. يُرجى المراجعة واتخاذ الإجراء اللازم.`,
                    type: 'error',
                    link: party === 'student' ? 'admin-trainees.html' : 'admin-users.html'
                });
            }
        } catch (e) { console.warn('checkViolationThreshold:', e.message); }
    }

    // ── الواجهة العامة ──────────────────────────────────────
    async function run(sb, userId, userType) {
        if (!sb || !userId || !userType) return;
        // تشغيل متوازي - مايعطّلش الصفحة
        Promise.allSettled([
            checkReminders(sb, userId, userType),
            checkMissed(sb, userId, userType)
        ]).catch(() => {});
    }

    window.ProVanceReminders = { run };
})();

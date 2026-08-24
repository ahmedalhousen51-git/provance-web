// ============================================================
// error-monitor.js — نظام مراقبة الأعطال الفوري لـ ProVance
// ============================================================
// بيلقط 3 أنواع من الأعطال في أي صفحة محمّل فيها الملف ده:
//   1) أخطاء JS غير ملتقطة (window.onerror)
//   2) Promise rejections غير ملتقطة
//   3) أي رد فشل من Supabase (insert/update/select/rpc) عنده
//      Postgres/PostgREST error code — يعني مش رفض عادي للمستخدم،
//      ده عطل حقيقي (عمود ناقص، صلاحيات، دالة مش موجودة...)
//
// كل عطل بيتبعت لـ Edge Function اسمها report-error، اللي بتسجله
// في جدول error_logs وتبعت إيميل فوري للإدارة أول مرة يحصل فيها
// (وبعدين تسكت عن نفس العطل لمدة 30 دقيقة عشان متغرقش الإيميل).
//
// الملف مستقل تماماً (مش محتاج supabase-config.js) عشان يشتغل
// حتى لو اتحمّل الأول قبل أي حاجة تانية في الصفحة.
// ============================================================
(function () {
    'use strict';

    var REPORT_URL = 'https://jrwazyrdzmbcnddpxxrf.supabase.co/functions/v1/report-error';
    var ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impyd2F6eXJkem1iY25kZHB4eHJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MzUyMzksImV4cCI6MjA5MjExMTIzOX0.KaZt3Xb-9zjjwlSYnCvQQVxzDgbcOxdmnpg9wsUsqQI';

    function getSessionInfo() {
        try {
            return {
                userId: localStorage.getItem('userId') || null,
                userType: localStorage.getItem('userType') || null
            };
        } catch (e) {
            return { userId: null, userType: null };
        }
    }

    function report(payload) {
        try {
            var info = getSessionInfo();
            var body = JSON.stringify({
                page: location.pathname.split('/').pop() || location.pathname,
                code: payload.code || null,
                message: String(payload.message || '').slice(0, 1000),
                user_id: info.userId,
                user_type: info.userType,
                context: payload.context || null
            });

            if (navigator.sendBeacon) {
                var blob = new Blob([body], { type: 'application/json' });
                var ok = navigator.sendBeacon(REPORT_URL + '?apikey=' + ANON_KEY, blob);
                if (ok) return;
            }
            fetch(REPORT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'apikey': ANON_KEY },
                body: body,
                keepalive: true
            }).catch(function () {});
        } catch (e) {
            // المونيتور نفسه ميكسرش الصفحة أبداً
        }
    }

    // 1) أخطاء JS غير ملتقطة
    window.addEventListener('error', function (e) {
        if (!e || !e.message) return;
        report({
            message: e.message,
            code: 'JS_ERROR',
            context: { filename: e.filename, lineno: e.lineno, colno: e.colno }
        });
    });

    // 2) Promise rejections غير ملتقطة
    window.addEventListener('unhandledrejection', function (e) {
        var msg = (e && e.reason && e.reason.message) ? e.reason.message : String(e && e.reason);
        report({ message: msg, code: 'UNHANDLED_PROMISE' });
    });

    // 3) أخطاء Supabase — نعترض fetch نفسه عشان نلقط أي insert/update/select/rpc فاشل
    //    بغض النظر عن الصفحة أو الطريقة اللي بتنادي بيها Supabase
    var origFetch = window.fetch;
    if (typeof origFetch === 'function') {
        window.fetch = function () {
            var args = arguments;
            var url = (args[0] && args[0].url) ? args[0].url : args[0];
            return origFetch.apply(window, args).then(function (res) {
                try {
                    if (typeof url === 'string' && url.indexOf('supabase.co/rest/v1') !== -1 && !res.ok) {
                        res.clone().json().then(function (data) {
                            if (data && data.code) {
                                report({
                                    message: data.message || 'Supabase error',
                                    code: data.code,
                                    context: { url: url.split('?')[0], status: res.status }
                                });
                            }
                        }).catch(function () {});
                    }
                } catch (e) { /* تجاهل */ }
                return res;
            });
        };
    }
})();

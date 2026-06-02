/* ============================================================
 * ProVance - Supabase Configuration v3 (Bulletproof)
 * ============================================================
 * الحل الجذري لمشكلة تحميل الـ Supabase library:
 * 1. لو الـ library في window.supabase → استخدمه
 * 2. لو مش موجود → حمّله ديناميكياً من CDN
 * 3. fallback CDN لو الأول فشل
 * 4. wait يستنى لحد ما يجهز (15 ثانية)
 * ============================================================ */

(function () {
    'use strict';

    const SUPABASE_URL = 'https://jrwazyrdzmbcnddpxxrf.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impyd2F6eXJkem1iY25kZHB4eHJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MzUyMzksImV4cCI6MjA5MjExMTIzOX0.KaZt3Xb-9zjjwlSYnCvQQVxzDgbcOxdmnpg9wsUsqQI';

    // Multiple CDN fallbacks
    const CDN_URLS = [
        'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js',
        'https://unpkg.com/@supabase/supabase-js@2/dist/umd/supabase.js',
        'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
    ];

    let _sbInstance = null;
    let _libLoadPromise = null;

    // ============================================================
    // Dynamic library loader (loads if missing)
    // ============================================================
    function loadSupabaseLibrary() {
        if (typeof supabase !== 'undefined' && supabase.createClient) {
            return Promise.resolve(true);
        }
        if (_libLoadPromise) return _libLoadPromise;

        _libLoadPromise = new Promise(function(resolve) {
            let urlIndex = 0;

            function tryLoadFromUrl(url) {
                console.log('🔄 محاولة تحميل Supabase من:', url);
                const script = document.createElement('script');
                script.src = url;
                script.async = false;

                script.onload = function() {
                    if (typeof supabase !== 'undefined' && supabase.createClient) {
                        console.log('✅ تحميل Supabase نجح من:', url);
                        resolve(true);
                    } else {
                        tryNext();
                    }
                };

                script.onerror = function() {
                    console.warn('⚠️ فشل تحميل Supabase من:', url);
                    tryNext();
                };

                document.head.appendChild(script);
            }

            function tryNext() {
                urlIndex++;
                if (urlIndex < CDN_URLS.length) {
                    tryLoadFromUrl(CDN_URLS[urlIndex]);
                } else {
                    console.error('❌ فشل تحميل Supabase من جميع CDNs');
                    resolve(false);
                }
            }

            tryLoadFromUrl(CDN_URLS[urlIndex]);
        });

        return _libLoadPromise;
    }

    function getSupabase() {
        if (_sbInstance) return _sbInstance;

        if (typeof supabase === 'undefined' || !supabase.createClient) {
            return null;
        }

        try {
            _sbInstance = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: true,
                    storage: window.localStorage
                }
            });
            console.log('✅ Supabase client ready');
            return _sbInstance;
        } catch (err) {
            console.error('❌ خطأ في إنشاء Supabase client:', err);
            return null;
        }
    }

    async function waitForSupabaseClient(maxWaitMs) {
        if (typeof maxWaitMs !== 'number') maxWaitMs = 15000;

        if (typeof supabase === 'undefined' || !supabase.createClient) {
            console.log('⏳ Supabase library مش موجودة، جاري تحميلها...');
            const loaded = await loadSupabaseLibrary();
            if (!loaded) {
                console.error('❌ تعذر تحميل Supabase library');
                return null;
            }
        }

        const start = Date.now();
        let sb = getSupabase();
        while (!sb && (Date.now() - start) < maxWaitMs) {
            await new Promise(r => setTimeout(r, 50));
            sb = getSupabase();
        }
        return sb;
    }

    // ============================================================
    // Auth Helpers
    // ============================================================
    async function getSession() {
        const sb = await waitForSupabaseClient();
        if (!sb) return null;
        try {
            const { data: { session } } = await sb.auth.getSession();
            return session;
        } catch (err) {
            console.error('getSession error:', err);
            return null;
        }
    }

    async function getUser() {
        const session = await getSession();
        return session ? session.user : null;
    }

    function redirectTo(url) {
        if (window.location.pathname.endsWith(url)) return;
        window.location.href = url;
    }

    async function requireCompanyAuth() {
        const sb = await waitForSupabaseClient();
        if (!sb) { redirectTo('company-login.html'); return null; }
        const session = await getSession();
        if (!session) { redirectTo('company-login.html'); return null; }
        const { data: company } = await sb.from('companies').select('*').eq('user_id', session.user.id).maybeSingle();
        if (!company) {
            // لا تعمل signOut — ممكن ده طالب فتح صفحة شركة بالغلط
            redirectTo('company-login.html');
            return null;
        }
        if (company.status === 'pending') {
            redirectTo('Company-pending.html');
            return null;
        }
        if (company.status === 'rejected') {
            // رفض حقيقي → signOut للشركة فقط وامسح بياناتها
            try { await sb.auth.signOut(); } catch(e) {}
            clearUserData('company');
            redirectTo('company-login.html');
            return null;
        }
        return { session: session, company: company };
    }

    async function requireStudentAuth() {
        const sb = await waitForSupabaseClient();
        if (!sb) { redirectTo('student-login.html'); return null; }
        const session = await getSession();
        if (!session) { redirectTo('student-login.html'); return null; }
        const { data: student } = await sb.from('student').select('*').eq('user_id', session.user.id).maybeSingle();
        if (!student) {
            // لا تعمل signOut — ممكن ده user شركة فتح صفحة طالب بالغلط
            redirectTo('student-login.html');
            return null;
        }
        return { session: session, student: student };
    }

    async function requireAdminAuth() {
        const sb = await waitForSupabaseClient();
        if (!sb) { redirectTo('admin-login.html'); return null; }
        const session = await getSession();
        if (!session) { redirectTo('admin-login.html'); return null; }
        const { data: admin } = await sb.from('admins').select('*').eq('user_id', session.user.id).maybeSingle();
        if (!admin) {
            // لا تعمل signOut — ممكن ده طالب أو شركة فتح صفحة أدمن
            redirectTo('admin-login.html');
            return null;
        }
        return { session: session, admin: admin };
    }

    // امسح بس بيانات اليوزر الحالي من localStorage
    function clearUserData(type) {
        const keysToRemove = [
            'userType', 'userEmail', 'userName', 'isLoggedIn',
            'userId', 'rememberMe', 'studentName', 'pendingEmail',
            'pending_profile_data', 'pending_profile_email',
            'companyId', 'companyName'
        ];
        keysToRemove.forEach(k => { try { localStorage.removeItem(k); } catch(e) {} });
    }

    async function logout(redirectUrl) {
        const sb = getSupabase();
        if (sb) {
            try { await sb.auth.signOut(); } catch (e) {}
        }
        // امسح بيانات اليوزر بس مش كل الـ localStorage
        clearUserData();
        if (redirectUrl) window.location.href = redirectUrl;
    }

    // ============================================================
    // UI Helpers
    // ============================================================
    function showToast(msg, type) {
        const t = document.createElement('div');
        const c = { error: '#ef4444', success: '#10b981', warning: '#f59e0b', info: '#4facfe' };
        t.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:'+(c[type]||'#4facfe')+';color:#fff;padding:14px 24px;border-radius:12px;font-family:Cairo,sans-serif;font-weight:700;z-index:99999;box-shadow:0 10px 30px rgba(0,0,0,0.4);max-width:90vw;text-align:center;';
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(function() { t.remove(); }, 4500);
    }

    async function confirmModal(opts) {
        opts = opts || {};
        return confirm((opts.title || '') + '\n' + (opts.message || ''));
    }

    function escapeHtml(s) {
        if (s === null || s === undefined) return '';
        return String(s).replace(/[&<>"']/g, function(c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    function formatDate(d) {
        if (!d) return '-';
        try { return new Date(d).toLocaleDateString('ar-EG'); }
        catch (e) { return d; }
    }

    function formatDateTime(d) {
        if (!d) return '-';
        try { return new Date(d).toLocaleString('ar-EG'); }
        catch (e) { return d; }
    }

    function timeAgo(d) {
        if (!d) return '';
        const diff = Date.now() - new Date(d).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'الآن';
        if (mins < 60) return mins + ' دقيقة';
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return hrs + ' ساعة';
        return Math.floor(hrs / 24) + ' يوم';
    }

    function isValidEmail(e) {
        if (!e) return false;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e).trim());
    }

    function isValidEgyptianPhone(p) {
        if (!p) return false;
        const clean = String(p).replace(/[\s\-+]/g, '');
        return /^(01[0125]\d{8}|201[0125]\d{8})$/.test(clean);
    }

    function debounce(fn, ms) {
        let t;
        return function() {
            const args = arguments, ctx = this;
            clearTimeout(t);
            t = setTimeout(function() { fn.apply(ctx, args); }, ms || 300);
        };
    }

    // ============================================================
    // Notifications
    // ============================================================
    async function sendNotification(opts) {
        const sb = getSupabase();
        if (!sb) return false;
        try {
            await sb.from('notifications').insert({
                user_id: opts.userId,
                user_type: opts.userType,
                title: opts.title,
                message: opts.message,
                type: opts.type || 'info',
                link: opts.link || opts.actionUrl || null,
                related_type: opts.relatedType || null,
                related_id: opts.relatedId || null,
                is_read: false
            });

            // أرسل Web Push (يصل حتى لو الموقع مقفول) — لا يعطّل لو فشل
            try {
                sb.functions.invoke('send-push', {
                    body: {
                        user_id: opts.userId,
                        title: opts.title,
                        body: opts.message,
                        url: opts.link || opts.actionUrl || '/'
                    }
                }).catch(() => {});
            } catch (e) { /* تجاهل */ }

            return true;
        } catch (err) {
            console.warn('sendNotification:', err.message);
            return false;
        }
    }

    async function notifyAdmins(opts) {
        const sb = getSupabase();
        if (!sb) return false;
        try {
            const { data: admins } = await sb.from('admins').select('user_id');
            if (!admins) return false;
            for (const admin of admins) {
                await sendNotification({
                    userId: admin.user_id,
                    userType: 'admin',
                    title: opts.title,
                    message: opts.message,
                    type: opts.type || 'info',
                    link: opts.actionUrl,
                    relatedType: opts.relatedType,
                    relatedId: opts.relatedId
                });
            }
            return true;
        } catch (err) {
            console.warn('notifyAdmins:', err.message);
            return false;
        }
    }

    async function getUnreadNotificationsCount(userId) {
        const sb = getSupabase();
        if (!sb || !userId) return 0;
        try {
            const { count } = await sb.from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('is_read', false);
            return count || 0;
        } catch (err) {
            return 0;
        }
    }

    // ============================================================
    // Export
    // ============================================================
    window.ProVance = {
        getSupabase: getSupabase,
        waitForSupabaseClient: waitForSupabaseClient,
        loadSupabaseLibrary: loadSupabaseLibrary,
        get sb() { return getSupabase(); },
        getSession: getSession,
        getUser: getUser,
        requireCompanyAuth: requireCompanyAuth,
        requireStudentAuth: requireStudentAuth,
        requireAdminAuth: requireAdminAuth,
        logout: logout,
        clearUserData: clearUserData,
        showToast: showToast,
        confirmModal: confirmModal,
        escapeHtml: escapeHtml,
        formatDate: formatDate,
        formatDateTime: formatDateTime,
        timeAgo: timeAgo,
        isValidEmail: isValidEmail,
        isValidEgyptianPhone: isValidEgyptianPhone,
        debounce: debounce,
        sendNotification: sendNotification,
        notifyAdmins: notifyAdmins,
        getUnreadNotificationsCount: getUnreadNotificationsCount
    };

    window.showToast = showToast;
    window.logout = logout;
    window.getSB = getSupabase;

    // 🚀 AUTO-LOAD: تحميل تلقائي للمكتبة لو مش موجودة
    if (typeof supabase === 'undefined' || !supabase.createClient) {
        loadSupabaseLibrary().then(function(loaded) {
            if (loaded) getSupabase();
        });
    } else {
        getSupabase();
    }

    console.log('✅ supabase-config.js loaded (v3 bulletproof)');
})();

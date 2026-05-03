/* ============================================================
 * ProVance - Supabase Configuration v2 (Robust)
 * ============================================================ */

(function () {
    'use strict';

    const SUPABASE_URL = 'https://jrwazyrdzmbcnddpxxrf.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impyd2F6eXJkem1iY25kZHB4eHJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MzUyMzksImV4cCI6MjA5MjExMTIzOX0.KaZt3Xb-9zjjwlSYnCvQQVxzDgbcOxdmnpg9wsUsqQI';

    let _sbInstance = null;
    let _initAttempts = 0;
    const MAX_INIT_ATTEMPTS = 50; // 5 seconds total

    // ============================================================
    // Supabase Client (with retry)
    // ============================================================
    function getSupabase() {
        if (_sbInstance) return _sbInstance;

        // Check if Supabase library is loaded
        if (typeof supabase === 'undefined' || !supabase.createClient) {
            _initAttempts++;
            if (_initAttempts === 1) {
                console.warn('⏳ في انتظار تحميل مكتبة Supabase...');
            }
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

    // Async wait helper - try for up to 10 seconds
    async function waitForSupabaseClient(maxWaitMs) {
        if (typeof maxWaitMs !== 'number') maxWaitMs = 10000;
        const start = Date.now();
        let sb = getSupabase();
        while (!sb && (Date.now() - start) < maxWaitMs) {
            await new Promise(r => setTimeout(r, 100));
            sb = getSupabase();
        }
        return sb;
    }

    // ============================================================
    // Auth Helpers
    // ============================================================
    async function getSession() {
        const sb = getSupabase();
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
            await sb.auth.signOut();
            redirectTo('company-login.html');
            return null;
        }
        return company;
    }

    async function requireStudentAuth() {
        const sb = await waitForSupabaseClient();
        if (!sb) { redirectTo('student-login.html'); return null; }

        const session = await getSession();
        if (!session) { redirectTo('student-login.html'); return null; }

        const { data: student } = await sb.from('student').select('*').eq('user_id', session.user.id).maybeSingle();
        if (!student) {
            await sb.auth.signOut();
            redirectTo('student-login.html');
            return null;
        }
        return student;
    }

    async function requireAdminAuth() {
        const sb = await waitForSupabaseClient();
        if (!sb) { redirectTo('admin-login.html'); return null; }

        const session = await getSession();
        if (!session) { redirectTo('admin-login.html'); return null; }

        const { data: admin } = await sb.from('admins').select('*').eq('user_id', session.user.id).maybeSingle();
        if (!admin) {
            await sb.auth.signOut();
            redirectTo('admin-login.html');
            return null;
        }
        return admin;
    }

    async function logout(redirectUrl) {
        const sb = getSupabase();
        if (sb) await sb.auth.signOut();
        try { localStorage.clear(); } catch (e) {}
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
    // Export to Global Scope
    // ============================================================
    window.ProVance = {
        // Client
        getSupabase: getSupabase,
        waitForSupabaseClient: waitForSupabaseClient,
        get sb() { return getSupabase(); },

        // Auth
        getSession: getSession,
        getUser: getUser,
        requireCompanyAuth: requireCompanyAuth,
        requireStudentAuth: requireStudentAuth,
        requireAdminAuth: requireAdminAuth,
        logout: logout,

        // UI
        showToast: showToast,
        confirmModal: confirmModal,

        // Helpers
        escapeHtml: escapeHtml,
        formatDate: formatDate,
        formatDateTime: formatDateTime,
        timeAgo: timeAgo,
        isValidEmail: isValidEmail,
        isValidEgyptianPhone: isValidEgyptianPhone,
        debounce: debounce,

        // Notifications
        sendNotification: sendNotification,
        notifyAdmins: notifyAdmins,
        getUnreadNotificationsCount: getUnreadNotificationsCount
    };

    // Backward compatibility
    window.showToast = showToast;
    window.logout = logout;
    window.getSB = getSupabase;

    // Auto-init: try to create client immediately when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            getSupabase(); // attempt early init
        });
    } else {
        getSupabase();
    }

    console.log('✅ supabase-config.js loaded (v2 robust)');
})();

/* company-layout.js — Unified sidebar + header for all company pages */
(function () {
    'use strict';

    // ─── Navigation items (order matters — matches sidebar) ───────────────────
    var NAV = [
        { href: 'company-dashboard.html',       icon: 'fa-th-large',       label: 'الرئيسية' },
        { href: 'company-trainers.html',         icon: 'fa-users',          label: 'المتدربين' },
        { href: 'company-talent-search.html',    icon: 'fa-search',         label: 'البحث عن المواهب' },
        { href: 'company-requests-control.html', icon: 'fa-cogs',           label: 'إدارة الأقسام والفروع' },
        { href: 'company-applications.html',     icon: 'fa-file-alt',       label: 'طلبات التقديم', badge: 'appsBadge' },
        { href: 'company-interviews.html',       icon: 'fa-calendar-check', label: 'المقابلات' },
        { href: 'company-QR_Code.html',          icon: 'fa-qrcode',         label: 'الحضور (QR)' },
        { href: 'company-profile.html',          icon: 'fa-building',       label: 'ملف الشركة' },
        { href: 'company-support.html',          icon: 'fa-headset',        label: 'التواصل مع الإدارة' },
        { href: 'company-notifications.html',    icon: 'fa-bell',           label: 'الإشعارات' },
        { href: 'company-penalties.html',        icon: 'fa-gavel',          label: 'العقوبات', badge: 'penaltiesBadge' }
    ];

    // Extra nav items injected for specific pages only
    var PAGE_EXTRAS = {
        'company-dashboard.html': [
            '<a href="#" onclick="suspendOperations && suspendOperations(event)" class="nav-item" style="color:#f59e0b"><i class="fas fa-power-off"></i> إغلاق عمليات الشركة</a>'
        ]
    };

    var curPage = location.pathname.split('/').pop() || 'company-dashboard.html';

    // ─── Build sidebar HTML ────────────────────────────────────────────────────
    function buildSidebarHTML() {
        var navLinks = NAV.map(function (item) {
            var active = item.href === curPage ? ' active' : '';
            var badge = item.badge
                ? '<span class="nav-badge" id="' + item.badge + '" style="display:none"></span>'
                : '';
            return '<a href="' + item.href + '" class="nav-item' + active + '">' +
                   '<i class="fas ' + item.icon + '"></i> ' + item.label + badge + '</a>';
        }).join('\n');

        var extras = (PAGE_EXTRAS[curPage] || []).join('\n');

        return '<aside class="sidebar" id="sidebar">\n' +
            '  <div class="sidebar-logo">\n' +
            '    <div class="logo-wrapper">\n' +
            '      <div class="logo-icon">\n' +
            '        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">\n' +
            '          <defs><linearGradient id="sidebarLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">' +
            '<stop offset="0%" stop-color="#ef4444"/><stop offset="100%" stop-color="#dc2626"/></linearGradient></defs>\n' +
            '          <path d="M16 2 L28 8 V20 Q28 26 16 30 Q4 26 4 20 V8 Z" fill="url(#sidebarLogoGrad)" stroke="#fff" stroke-width="0.5" opacity="0.95"/>\n' +
            '          <text x="16" y="20" text-anchor="middle" font-family="Cairo, sans-serif" font-size="14" font-weight="900" fill="#fff">P</text>\n' +
            '        </svg>\n' +
            '      </div>\n' +
            '      <div class="logo-text">\n' +
            '        <div class="logo-brand">ProVance</div>\n' +
            '        <div class="logo-tagline">منصة التدريب</div>\n' +
            '      </div>\n' +
            '    </div>\n' +
            '  </div>\n' +
            navLinks + '\n' +
            extras + '\n' +
            '  <a href="#" onclick="window.logoutCompany(event)" class="nav-item" style="margin-top:auto; color:#ef4444">\n' +
            '    <i class="fas fa-sign-out-alt"></i> تسجيل الخروج\n' +
            '  </a>\n' +
            '</aside>\n' +
            '<div class="sidebar-backdrop" id="sbBackdrop" onclick="window.closeSidebar()"></div>';
    }

    // ─── Inject or update sidebar ──────────────────────────────────────────────
    function initSidebar() {
        var existing = document.getElementById('sidebar');
        if (existing) {
            // Sidebar already in page HTML — just sync the active state
            var links = existing.querySelectorAll('.nav-item[href]');
            for (var i = 0; i < links.length; i++) {
                var pg = (links[i].getAttribute('href') || '').split('/').pop();
                if (pg === curPage) links[i].classList.add('active');
                else links[i].classList.remove('active');
            }
            // Ensure backdrop exists
            if (!document.getElementById('sbBackdrop')) {
                var bd = document.createElement('div');
                bd.id = 'sbBackdrop';
                bd.className = 'sidebar-backdrop';
                bd.onclick = window.closeSidebar;
                existing.parentNode.insertBefore(bd, existing.nextSibling);
            }
            return;
        }

        // No sidebar in page — inject before first <main> or .main element
        var anchor = document.querySelector('main, .main, .main-content');
        if (!anchor) {
            document.body.insertAdjacentHTML('afterbegin', buildSidebarHTML());
            return;
        }
        var tmp = document.createElement('div');
        tmp.innerHTML = buildSidebarHTML();
        while (tmp.firstChild) {
            anchor.parentNode.insertBefore(tmp.firstChild, anchor);
        }
    }

    // ─── Fill user info into header / topbar ───────────────────────────────────
    async function fillUserInfo() {
        try {
            var sb = await getSB();
            if (!sb) return;
            var sess = (await sb.auth.getSession()).data.session;
            if (!sess) return;
            var res = await sb.from('companies')
                .select('company_name,logo')
                .eq('user_id', sess.user.id)
                .maybeSingle();
            var co = res.data;
            var name = (co && co.company_name) || sess.user.email || 'الشركة';
            var logo = co && co.logo;
            var initial = name.charAt(0).toUpperCase();
            var avatarInner = logo
                ? '<img src="' + logo + '" alt="" style="width:100%;height:100%;object-fit:cover">'
                : initial;

            // Pattern A: <header class="header"> with headerAvatar / headerName
            var nameEl   = document.getElementById('headerName');
            var avatarEl = document.getElementById('headerAvatar');
            if (nameEl)   nameEl.textContent = name;
            if (avatarEl) avatarEl.innerHTML  = avatarInner;

            // Pattern B: .topbar — inject user-box if not already present
            var topbar = document.querySelector('.topbar');
            if (topbar && !topbar.querySelector('#layoutUserBox')) {
                var box = document.createElement('div');
                box.id = 'layoutUserBox';
                box.style.cssText = [
                    'display:flex', 'align-items:center', 'gap:10px',
                    'padding:5px 12px 5px 5px',
                    'background:rgba(255,255,255,0.05)',
                    'border:1px solid rgba(255,255,255,0.1)',
                    'border-radius:50px', 'margin-right:auto', 'flex-shrink:0'
                ].join(';');
                box.innerHTML =
                    '<div style="width:34px;height:34px;background:linear-gradient(135deg,#ef4444,#dc2626);' +
                    'border-radius:50%;display:flex;align-items:center;justify-content:center;' +
                    'font-weight:700;overflow:hidden;color:#fff;flex-shrink:0">' + avatarInner + '</div>' +
                    '<div style="line-height:1.2">' +
                      '<div style="font-size:0.85rem;font-weight:700;color:#fff">' + name + '</div>' +
                      '<div style="font-size:0.7rem;color:#94a3b8">شركة معتمدة</div>' +
                    '</div>';
                topbar.appendChild(box);
            }
        } catch (e) { /* silent */ }
    }

    // ─── Load badges ──────────────────────────────────────────────────────────
    async function loadBadge() {
        var appsBadge = document.getElementById('appsBadge');
        var penBadge  = document.getElementById('penaltiesBadge');
        try {
            var sb = await getSB();
            if (!sb) return;
            var sess = (await sb.auth.getSession()).data.session;
            if (!sess) return;
            var uid = sess.user.id;

            if (appsBadge) {
                var result = await sb.from('applications')
                    .select('id', { count: 'exact', head: true })
                    .eq('company_user_id', uid)
                    .in('status', ['pending', 'reviewing', 'interview_scheduled']);
                var count = result.count || 0;
                appsBadge.textContent = count > 0 ? count : '';
                appsBadge.style.display = count > 0 ? 'inline-block' : 'none';
            }

            if (penBadge) {
                var co = (await sb.from('companies').select('penalties').eq('user_id', uid).maybeSingle()).data;
                var penalties = (co && co.penalties) || [];
                var unpaid = penalties.filter(function(p) {
                    return p.type === 'fine' && p.status === 'active';
                }).length;
                penBadge.textContent = unpaid > 0 ? unpaid : '';
                penBadge.style.display = unpaid > 0 ? 'inline-block' : 'none';
            }
        } catch (e) { /* silent */ }
    }

    // ─── Get Supabase client (self-contained — no external dependency) ───────────
    var _sbCache = null;
    async function getSB() {
        if (_sbCache) return _sbCache;

        // 1. ProVance managed client (supabase-config.js)
        if (window.ProVance && typeof window.ProVance.waitForSupabaseClient === 'function') {
            try { var c = await window.ProVance.waitForSupabaseClient(3000); if (c) { _sbCache = c; return c; } } catch (e) {}
        }
        if (window.ProVance && window.ProVance.sb) { _sbCache = window.ProVance.sb; return _sbCache; }

        // 2. Page-level getSafeSupabase helper
        if (typeof window.getSafeSupabase === 'function') {
            try { var c2 = await window.getSafeSupabase(); if (c2) { _sbCache = c2; return c2; } } catch (e) {}
        }

        // 3. Direct creation — works even if supabase-config.js is missing
        if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
            try {
                _sbCache = window.supabase.createClient(
                    'https://jrwazyrdzmbcnddpxxrf.supabase.co',
                    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impyd2F6eXJkem1iY25kZHB4eHJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MzUyMzksImV4cCI6MjA5MjExMTIzOX0.KaZt3Xb-9zjjwlSYnCvQQVxzDgbcOxdmnpg9wsUsqQI',
                    { auth: { persistSession: true, autoRefreshToken: true, storage: window.localStorage } }
                );
                return _sbCache;
            } catch (e) {}
        }
        return null;
    }

    // ─── Global layout functions (safe to override in page scripts if needed) ──
    if (!window.logoutCompany) {
        window.logoutCompany = async function (e) {
            if (e && e.preventDefault) e.preventDefault();
            if (!confirm('تسجيل الخروج؟')) return;
            try {
                var sb = await getSB();
                if (sb) await sb.auth.signOut();
            } catch (err) {}
            location.href = 'company-login.html';
        };
    }
    if (!window.handleLogout) window.handleLogout = window.logoutCompany;

    window.toggleSidebar = function () {
        var s = document.getElementById('sidebar');
        var b = document.getElementById('sbBackdrop');
        if (s) s.classList.toggle('open');
        if (b) b.classList.toggle('active');
    };

    window.closeSidebar = function () {
        var s = document.getElementById('sidebar');
        var b = document.getElementById('sbBackdrop');
        if (s) s.classList.remove('open');
        if (b) b.classList.remove('active');
    };

    // ─── Session watchdog: reload data when tab regains focus after idle ─────
    var _lastVisible = Date.now();
    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState !== 'visible') return;
        var away = Date.now() - _lastVisible;
        // إذا الصفحة كانت مخفية أكتر من دقيقتين → تحقق من الـ session وأعد تحميل الداتا
        if (away > 120000) {
            getSB().then(function (sb) {
                if (!sb) return;
                sb.auth.getSession().then(function (res) {
                    var sess = res && res.data && res.data.session;
                    if (!sess) {
                        location.href = 'company-login.html';
                    } else if (typeof window.loadAll === 'function') {
                        window.loadAll();
                    } else {
                        location.reload();
                    }
                }).catch(function () { location.reload(); });
            });
        }
        _lastVisible = Date.now();
    });

    // ─── Auth state listener: redirect on sign-out, reload on token refresh ──
    getSB().then(function (sb) {
        if (!sb) return;
        sb.auth.onAuthStateChange(function (event) {
            if (event === 'SIGNED_OUT') {
                location.href = 'company-login.html';
            } else if (event === 'TOKEN_REFRESHED') {
                loadBadge();
            }
        });
    });

    // ─── ⏰ مراقبة مواعيد الرد اللي الشركة حددتها بنفسها ──────────────────────
    // 1) قبل انتهاء المدة بيوم → تنبيه ودّي
    // 2) بعد التعدي → إشعار+إيميل للشركة والأدمن (مرة يومياً)
    // 3) حجب صفحات الشركة (ماعدا صفحات الحل) لحد ما ترد
    var DL_EXEMPT = ['company-applications.html', 'company-interviews.html', 'company-QR_Code.html', 'company-notifications.html', 'company-support.html'];

    function dlDayKey() { return new Date().toISOString().slice(0, 10); }

    function dlNotifyCompany(sb, uid, title, message, type, link) {
        try {
            if (window.ProVance && typeof window.ProVance.sendNotification === 'function') {
                window.ProVance.sendNotification({ userId: uid, userType: 'company', title: title, message: message, type: type, link: link });
            } else {
                sb.rpc('send_notification_row', { p_row: { user_id: uid, user_type: 'company', title: title, message: message, type: type, link: link, is_read: false } });
            }
        } catch (e) { /* silent */ }
    }

    function dlShowOverlay(nNew, nPost, maxNew, maxPost) {
        if (document.getElementById('pvDeadlineOverlay')) return;
        var rows = '';
        if (nNew) {
            rows += '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:14px 16px;margin-bottom:10px">' +
                '<div style="color:#991b1b;font-size:14px;line-height:1.7"><i class="fas fa-file-alt" style="margin-left:6px"></i><b>' + nNew + '</b> طلب تقديم مستني ردك من أكتر من <b>' + maxNew + ' أيام</b> (الحد اللي انت حددته)</div>' +
                '<a href="company-applications.html" style="flex-shrink:0;background:#1e3a8a;color:#fff;text-decoration:none;padding:9px 18px;border-radius:8px;font-size:13px;font-weight:bold">راجع الطلبات</a></div>';
        }
        if (nPost) {
            rows += '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:14px 16px;margin-bottom:10px">' +
                '<div style="color:#991b1b;font-size:14px;line-height:1.7"><i class="fas fa-user-clock" style="margin-left:6px"></i><b>' + nPost + '</b> متدرب عمل المقابلة ومستني قرارك من أكتر من <b>' + maxPost + ' أيام</b></div>' +
                '<a href="company-interviews.html" style="flex-shrink:0;background:#1e3a8a;color:#fff;text-decoration:none;padding:9px 18px;border-radius:8px;font-size:13px;font-weight:bold">راجع المقابلات</a></div>';
        }
        var ov = document.createElement('div');
        ov.id = 'pvDeadlineOverlay';
        ov.setAttribute('dir', 'rtl');
        ov.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(15,23,42,.72);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:16px';
        ov.innerHTML =
            '<div style="max-width:560px;width:100%;background:#fff;border-radius:18px;padding:28px 24px;box-shadow:0 25px 60px rgba(0,0,0,.35);font-family:inherit">' +
            '<div style="text-align:center;margin-bottom:18px">' +
            '<div style="width:64px;height:64px;margin:0 auto 12px;background:#fee2e2;border-radius:50%;display:flex;align-items:center;justify-content:center"><i class="fas fa-hourglass-end" style="font-size:26px;color:#dc2626"></i></div>' +
            '<h2 style="margin:0 0 6px;color:#111827;font-size:20px">عندك ردود متأخرة</h2>' +
            '<p style="margin:0;color:#6b7280;font-size:14px;line-height:1.8">التزمت وقت التسجيل بمدة رد محددة، وفي طلبات عدّت المدة دي.<br>الصفحات هتفضل متوقفة لحد ما ترد عليهم.</p>' +
            '</div>' + rows +
            '<p style="margin:14px 0 0;text-align:center;color:#9ca3af;font-size:12px">التأخير المتكرر بيأثر على ترتيب شركتك وبيتبلغ به فريق المنصة — لو في ظرف، <a href="company-support.html" style="color:#1e3a8a">كلم الإدارة</a>.</p>' +
            '</div>';
        document.body.appendChild(ov);
        document.body.style.overflow = 'hidden';
    }

    async function checkResponseDeadlines() {
        try {
            var sb = await getSB();
            if (!sb) return;
            var sessRes = await sb.auth.getSession();
            var sess = sessRes && sessRes.data && sessRes.data.session;
            if (!sess) return;
            var uid = sess.user.id;

            var compRes = await sb.from('companies')
                .select('company_name, max_response_days, max_response_after_interview')
                .eq('user_id', uid).maybeSingle();
            var comp = compRes && compRes.data;
            if (!comp) return;

            var maxNew = parseInt(comp.max_response_days) || 7;
            var maxPost = parseInt(comp.max_response_after_interview) || 3;
            var now = Date.now(), DAY = 86400000;

            // الطلبات الجديدة المستنية أول رد + المستنية قرار بعد المقابلة
            var pendRes = await sb.from('applications')
                .select('id, created_at')
                .eq('company_user_id', uid).eq('status', 'pending');
            var doneRes = await sb.from('applications')
                .select('id, interview_date, updated_at')
                .eq('company_user_id', uid).eq('status', 'interview_done');
            var pend = (pendRes && pendRes.data) || [];
            var done = (doneRes && doneRes.data) || [];

            var overNew = pend.filter(function (a) { return a.created_at && (now - new Date(a.created_at).getTime()) > maxNew * DAY; });
            var overPost = done.filter(function (a) {
                var base = a.interview_date || a.updated_at;
                return base && (now - new Date(base).getTime()) > maxPost * DAY;
            });
            var soonNew = pend.filter(function (a) {
                if (!a.created_at) return false;
                var age = now - new Date(a.created_at).getTime();
                return age > (maxNew - 1) * DAY && age <= maxNew * DAY;
            });

            // 1) تنبيه ودّي قبل انتهاء المدة بيوم (لو لسه مفيش متأخر)
            if (soonNew.length && !overNew.length && !overPost.length) {
                var kSoon = 'pv_dl_soon_' + uid + '_' + dlDayKey();
                if (!localStorage.getItem(kSoon)) {
                    localStorage.setItem(kSoon, '1');
                    dlNotifyCompany(sb, uid,
                        '⏳ طلبات قربت تعدي مدة الرد',
                        'عندك ' + soonNew.length + ' طلب تقديم هيتعدى الحد اللي حددته (' + maxNew + ' أيام) خلال أقل من 24 ساعة. رد عليهم في أقرب وقت.',
                        'warning', 'company-applications.html');
                }
                return;
            }

            if (!overNew.length && !overPost.length) return;

            // 2) إشعار + إيميل للشركة — مرة واحدة يومياً
            var kCo = 'pv_dl_co_' + uid + '_' + dlDayKey();
            if (!localStorage.getItem(kCo)) {
                localStorage.setItem(kCo, '1');
                var parts = [];
                if (overNew.length) parts.push(overNew.length + ' طلب تقديم (حدك ' + maxNew + ' أيام)');
                if (overPost.length) parts.push(overPost.length + ' قرار بعد المقابلة (حدك ' + maxPost + ' أيام)');
                dlNotifyCompany(sb, uid,
                    '🚨 عندك ردود متأخرة عن المدة اللي التزمت بيها',
                    'المتأخر حالياً: ' + parts.join(' + ') + '. رد عليهم فوراً — التأخير المتكرر بيأثر على تقييم شركتك وبيتبلغ به فريق المنصة.',
                    'error', 'company-applications.html');
            }

            // 3) إبلاغ الأدمن (إشعار + إيميل) — مرة واحدة يومياً
            var kAd = 'pv_dl_admin_' + uid + '_' + dlDayKey();
            if (!localStorage.getItem(kAd)) {
                localStorage.setItem(kAd, '1');
                var adminMsg = 'شركة "' + (comp.company_name || 'غير معروفة') + '" متأخرة عن حدود الرد اللي حددتها بنفسها: ' +
                    (overNew.length ? overNew.length + ' طلب تقديم معدّي ' + maxNew + ' أيام. ' : '') +
                    (overPost.length ? overPost.length + ' قرار بعد المقابلة معدّي ' + maxPost + ' أيام.' : '');
                if (window.ProVance && typeof window.ProVance.notifyAdmins === 'function') {
                    window.ProVance.notifyAdmins({
                        title: '⏰ شركة متأخرة في الرد',
                        message: adminMsg,
                        type: 'warning',
                        actionUrl: 'admin-campany.html'
                    });
                }
            }

            // 4) حجب الصفحة الحالية لو مش من صفحات الحل
            if (DL_EXEMPT.indexOf(curPage) === -1) {
                dlShowOverlay(overNew.length, overPost.length, maxNew, maxPost);
            }
        } catch (e) { /* silent — مايكسرش الصفحة */ }
    }

    // ─── Init ─────────────────────────────────────────────────────────────────
    function init() {
        initSidebar();
        fillUserInfo();
        loadBadge();
        checkResponseDeadlines();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

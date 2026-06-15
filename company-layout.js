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
        { href: 'company-notifications.html',    icon: 'fa-bell',           label: 'الإشعارات' }
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

    // ─── Load pending-applications badge ──────────────────────────────────────
    async function loadBadge() {
        var badge = document.getElementById('appsBadge');
        if (!badge) return;
        try {
            var sb = await getSB();
            if (!sb) return;
            var sess = (await sb.auth.getSession()).data.session;
            if (!sess) return;
            var result = await sb.from('applications')
                .select('id', { count: 'exact', head: true })
                .eq('company_user_id', sess.user.id)
                .in('status', ['pending', 'reviewing', 'interview_scheduled']);
            var count = result.count || 0;
            badge.textContent = count > 0 ? count : '';
            badge.style.display = count > 0 ? 'inline-block' : 'none';
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

    // ─── Init ─────────────────────────────────────────────────────────────────
    function init() {
        initSidebar();
        fillUserInfo();
        loadBadge();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

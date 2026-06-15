/* ============================================================
   push-subscribe.js — تفعيل إشعارات Web Push
   الاستخدام: <script src="push-subscribe.js"></script>
   ثم: window.ProVancePush.enable(sb, userId, userType)
   ============================================================ */
(function () {
    'use strict';

    // ⚠️ استبدل ده بالـ VAPID Public Key بتاعك (خطوة الإعداد)
    const VAPID_PUBLIC_KEY = 'BPreeWo4WsDfQjh1wRwT_Rp5ANmIU7cVYVqgonY-MNtTe1FawJCCZMBmRRO9BCo8Pf71FYKvsz-IWb58nDwo4LA';

    function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const raw = atob(base64);
        const arr = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
        return arr;
    }

    // تسجيل الـ Service Worker
    async function registerSW() {
        if (!('serviceWorker' in navigator)) return null;
        try {
            return await navigator.serviceWorker.register('/sw.js');
        } catch (e) {
            console.warn('SW register failed:', e);
            return null;
        }
    }

    // تفعيل الإشعارات وحفظ الاشتراك
    async function enable(sb, userId, userType) {
        if (!sb || !userId) return { ok: false, reason: 'missing-params' };
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            return { ok: false, reason: 'unsupported' };
        }
        if (VAPID_PUBLIC_KEY.startsWith('REPLACE')) {
            console.warn('ProVancePush: لم يتم ضبط VAPID key بعد');
            return { ok: false, reason: 'no-vapid' };
        }

        try {
            // اطلب الإذن
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') return { ok: false, reason: 'denied' };

            const reg = await registerSW();
            if (!reg) return { ok: false, reason: 'no-sw' };
            await navigator.serviceWorker.ready;

            // اشترك في الـ Push
            let sub = await reg.pushManager.getSubscription();
            if (!sub) {
                sub = await reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
                });
            }

            // احفظ الاشتراك في Supabase
            const subJson = sub.toJSON();
            await sb.from('push_subscriptions').upsert({
                user_id: userId,
                user_type: userType,
                endpoint: subJson.endpoint,
                p256dh: subJson.keys.p256dh,
                auth: subJson.keys.auth,
                updated_at: new Date().toISOString()
            }, { onConflict: 'endpoint' });

            return { ok: true };
        } catch (e) {
            console.warn('push enable failed:', e);
            return { ok: false, reason: e.message };
        }
    }

    // فحص الحالة الحالية
    function status() {
        if (!('Notification' in window)) return 'unsupported';
        return Notification.permission; // 'granted' | 'denied' | 'default'
    }

    window.ProVancePush = { enable, status };
})();
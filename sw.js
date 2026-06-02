/* ProVance Service Worker — يستقبل Web Push ويعرض الإشعارات */
/* يجب أن يكون في جذر الموقع: https://pro-vance.com/sw.js */

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// استقبال إشعار Push
self.addEventListener('push', (event) => {
    let data = {};
    try {
        data = event.data ? event.data.json() : {};
    } catch (e) {
        data = { title: 'ProVance', body: event.data ? event.data.text() : 'لديك إشعار جديد' };
    }

    const title = data.title || 'ProVance';
    const options = {
        body: data.body || data.message || '',
        icon: data.icon || '/icon-192.png',
        badge: data.badge || '/icon-192.png',
        dir: 'rtl',
        lang: 'ar',
        tag: data.tag || 'provance-notif',
        renotify: true,
        data: { url: data.url || data.link || '/' },
        requireInteraction: false
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

// عند الضغط على الإشعار — يفتح الصفحة المرتبطة
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = (event.notification.data && event.notification.data.url) || '/';

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // لو الموقع مفتوح بالفعل، ركّز عليه
            for (const client of clientList) {
                if ('focus' in client) {
                    client.focus();
                    if ('navigate' in client) client.navigate(url);
                    return;
                }
            }
            // غير كده، افتح نافذة جديدة
            if (self.clients.openWindow) return self.clients.openWindow(url);
        })
    );
});

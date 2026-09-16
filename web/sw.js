// Without these a new worker sits waiting until every instance of the app is
// closed, so a changed notificationclick handler would not take effect.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch { /* fall through to the generic notification */ }

  // iOS revokes the subscription if a push ever displays nothing.
  event.waitUntil(self.registration.showNotification(data.title ?? "patPost", {
    body: data.body,
    tag: data.tag,
    // Without this a repeat push on the same tag replaces it silently.
    renotify: Boolean(data.tag),
    data: { url: data.url, appUrl: data.appUrl },
    icon: "./icons/icon-192.png",
    badge: "./icons/icon-192.png",
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const { url, appUrl } = event.notification.data ?? {};
  if (!url && !appUrl) return;
  // openWindow on an https link lands in this app's own web view rather than
  // handing the universal link to iOS, so try the target app's scheme first.
  event.waitUntil(
    appUrl
      ? clients.openWindow(appUrl).catch(() => url && clients.openWindow(url))
      : clients.openWindow(url),
  );
});

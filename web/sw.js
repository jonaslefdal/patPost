// Bump on every change to this file, so the page can show which one is live.
const SW_VERSION = 3;

self.addEventListener("message", (event) => {
  if (event.data === "version") event.ports[0]?.postMessage(SW_VERSION);
});

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
    data: { url: data.url },
    icon: "./icons/icon-192.png",
    badge: "./icons/icon-192.png",
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url;
  if (!url) return;
  // An app scheme was tried here and is not navigable: openWindow neither
  // follows it nor rejects, so the tap silently did nothing. https at least
  // reaches the page, which offers its own "Open in app".
  event.waitUntil(clients.openWindow(url));
});

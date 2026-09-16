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
  event.waitUntil(clients.openWindow(url));
});

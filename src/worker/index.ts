import { getApp, getApps, initializeApp } from 'firebase/app'
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw'

const sw = self as typeof self & {
  registration: ServiceWorkerRegistration
  clients: {
    matchAll: (options?: {
      type?: 'window'
      includeUncontrolled?: boolean
    }) => Promise<Array<any>>
    openWindow?: (url: string) => Promise<any>
  }
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim() || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim() || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim() || '',
}

const hasConfig = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId
)

if (hasConfig) {
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
  const messaging = getMessaging(app)

  onBackgroundMessage(messaging, async (payload) => {
    const title =
      payload.notification?.title ||
      payload.data?.title ||
      'Arifa Mpya'

    const body =
      payload.notification?.body ||
      payload.data?.message ||
      ''

    const requestId = payload.data?.requestId || ''
    const targetUrl = requestId ? `/requests/${requestId}` : '/notifications'

    await sw.registration.showNotification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: {
        url: targetUrl,
      },
    })
  })

  sw.addEventListener('notificationclick', (event: any) => {
    event.notification.close()

    const targetUrl = event.notification.data?.url || '/notifications'

    event.waitUntil(
      (async () => {
        const clientsList = await sw.clients.matchAll({
          type: 'window',
          includeUncontrolled: true,
        })

        for (const client of clientsList) {
          if ('focus' in client) {
            await client.focus()
            if ('navigate' in client) {
              await client.navigate(targetUrl)
            }
            return
          }
        }

        if (sw.clients.openWindow) {
          await sw.clients.openWindow(targetUrl)
        }
      })()
    )
  })
}

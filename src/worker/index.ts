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

// ---------------------------------------------------------------------------
// 1. IndexedDB Helper for Offline Fuel Request Queue
// ---------------------------------------------------------------------------
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('kibali-mafuta-offline', 1)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains('requests')) {
        db.createObjectStore('requests', { keyPath: 'id', autoIncrement: true })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function saveOfflineRequest(url: string, method: string, body: string, headers: Record<string, string>) {
  const db = await openDB()
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction('requests', 'readwrite')
    const store = tx.objectStore('requests')
    const req = store.add({ url, method, body, headers, timestamp: Date.now() })
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

async function getOfflineRequests() {
  const db = await openDB()
  return new Promise<any[]>((resolve, reject) => {
    const tx = db.transaction('requests', 'readonly')
    const store = tx.objectStore('requests')
    const req = store.getAll()
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function deleteOfflineRequest(id: number) {
  const db = await openDB()
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction('requests', 'readwrite')
    const store = tx.objectStore('requests')
    const req = store.delete(id)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

// ---------------------------------------------------------------------------
// 2. Fetch Interceptor: Queue Fuel Requests if Offline
// ---------------------------------------------------------------------------
sw.addEventListener('fetch', (event: any) => {
  const request = event.request
  const url = new URL(request.url)

  // Intercept POST submissions to fuel-requests api
  if (request.method === 'POST' && url.pathname.endsWith('/fuel-requests')) {
    event.respondWith(
      (async () => {
        try {
          // Attempt online delivery
          return await fetch(request.clone())
        } catch (error) {
          // Network failure = Offline mode. Save request to db.
          try {
            const bodyText = await request.text()
            const headers: Record<string, string> = {}
            request.headers.forEach((val: string, key: string) => {
              headers[key] = val
            })

            await saveOfflineRequest(request.url, request.method, bodyText, headers)

            // Register background sync
            if ('sync' in sw.registration) {
              await (sw.registration as any).sync.register('sync-fuel-requests')
            }

            return new Response(
              JSON.stringify({
                success: true,
                message: 'Ombi lako limehifadhiwa nje ya mtandao na litatumwa mara tu utakapounganishwa tena.',
                offline: true,
              }),
              { headers: { 'Content-Type': 'application/json' } }
            )
          } catch (storageError) {
            return new Response(
              JSON.stringify({ success: false, error: 'Kushindwa kuhifadhi ombi nje ya mtandao' }),
              { headers: { 'Content-Type': 'application/json' } }
            )
          }
        }
      })()
    )
  }
})

// ---------------------------------------------------------------------------
// 3. Background Sync: Upload Offline Requests When Reconnected
// ---------------------------------------------------------------------------
async function syncOfflineRequests() {
  try {
    const requests = await getOfflineRequests()
    if (requests.length === 0) return

    for (const req of requests) {
      const response = await fetch(req.url, {
        method: req.method,
        headers: req.headers,
        body: req.body,
      })

      if (response.ok) {
        await deleteOfflineRequest(req.id)

        // Alert user of background upload completion
        await sw.registration.showNotification('Ombi la Mafuta Limewasilishwa', {
          body: 'Ombi lako la mafuta lililokuwa limehifadhiwa nje ya mtandao sasa limetumwa kwa ufanisi!',
          icon: '/icon-192.png',
          badge: '/icon-192.png',
        })
      }
    }
  } catch (error) {
    console.error('Error syncing offline requests:', error)
  }
}

sw.addEventListener('sync', (event: any) => {
  if (event.tag === 'sync-fuel-requests') {
    event.waitUntil(syncOfflineRequests())
  }
})

// ---------------------------------------------------------------------------
// 4. Firebase Configuration & Push Setup
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// 5. Generic Native Web Push Handler
// ---------------------------------------------------------------------------
sw.addEventListener('push', (event: any) => {
  if (!event.data) return
  try {
    const payload = event.data.json()
    const title = payload.notification?.title || payload.title || 'Arifa Mpya'
    const body = payload.notification?.body || payload.message || ''
    const requestId = payload.data?.requestId || ''
    const targetUrl = requestId ? `/requests/${requestId}` : '/notifications'

    event.waitUntil(
      sw.registration.showNotification(title, {
        body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        data: {
          url: targetUrl,
        },
      })
    )
  } catch (e) {
    const text = event.data.text()
    event.waitUntil(
      sw.registration.showNotification('Arifa Mpya', {
        body: text,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
      })
    )
  }
})

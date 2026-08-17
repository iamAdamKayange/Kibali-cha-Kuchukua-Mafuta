import { getMessaging, getToken, deleteToken, isSupported } from 'firebase/messaging'
import { api } from '@/lib/api'
import { firebaseVapidKey, getFirebaseApp, hasFirebaseMessagingConfig } from '@/lib/firebase'

const DEVICE_TOKEN_KEY = 'deviceToken'

function getDeviceType() {
  if (typeof navigator === 'undefined') return 'unknown'

  const userAgent = navigator.userAgent.toLowerCase()
  if (/android/.test(userAgent)) return 'android'
  if (/iphone|ipad|ipod/.test(userAgent)) return 'ios'
  if (/windows/.test(userAgent)) return 'windows'
  if (/macintosh|mac os x/.test(userAgent)) return 'mac'
  if (/linux/.test(userAgent)) return 'linux'
  return 'web'
}

async function getServiceWorkerRegistration() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null
  }

  try {
    const existing = await navigator.serviceWorker.getRegistration('/')
    if (existing) {
      return existing
    }

    return await navigator.serviceWorker.register('/sw.js')
  } catch (error) {
    console.warn('Failed to prepare service worker for push notifications:', error)
    return null
  }
}

async function ensurePermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported' as const
  }

  if (Notification.permission === 'default') {
    return await Notification.requestPermission()
  }

  return Notification.permission
}

export async function registerDevicePushToken() {
  if (typeof window === 'undefined') {
    return null
  }

  if (!hasFirebaseMessagingConfig()) {
    return null
  }

  const permission = await ensurePermission()
  if (permission !== 'granted') {
    return null
  }

  const supported = await isSupported().catch(() => false)
  if (!supported) {
    return null
  }

  const app = getFirebaseApp()
  if (!app || !firebaseVapidKey) {
    return null
  }

  const registration = await getServiceWorkerRegistration()
  if (!registration) {
    return null
  }

  try {
    const messaging = getMessaging(app)
    const token = await getToken(messaging, {
      vapidKey: firebaseVapidKey,
      serviceWorkerRegistration: registration,
    })

    if (!token) {
      return null
    }

    localStorage.setItem(DEVICE_TOKEN_KEY, token)

    const response = await api.post('/notifications/device-token', {
      fcmToken: token,
      deviceType: getDeviceType(),
    })

    if (!response.success) {
      console.warn('Device token stored locally but failed to sync with backend:', response.error)
    }

    return token
  } catch (error) {
    console.warn('Failed to register push token:', error)
    return null
  }
}

export async function unregisterDevicePushToken() {
  if (typeof window === 'undefined') {
    return
  }

  const token = localStorage.getItem(DEVICE_TOKEN_KEY)
  if (!token) {
    return
  }

  try {
    await api.delete('/notifications/device-token', {
      fcmToken: token,
    })
  } catch (error) {
    console.warn('Failed to remove device token from backend:', error)
  }

  if (hasFirebaseMessagingConfig()) {
    const supported = await isSupported().catch(() => false)
    if (supported) {
      const app = getFirebaseApp()
      if (app) {
        try {
          const messaging = getMessaging(app)
          await deleteToken(messaging)
        } catch (error) {
          console.warn('Failed to delete browser push token:', error)
        }
      }
    }
  }

  localStorage.removeItem(DEVICE_TOKEN_KEY)
}


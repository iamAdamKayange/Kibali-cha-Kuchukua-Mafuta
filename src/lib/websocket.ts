'use client'

class WebSocketClient {
  private static instance: WebSocketClient
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private eventListeners: Map<string, Set<(data: any) => void>> = new Map()
  private isConnecting = false
  private intentionalDisconnect = false
  private currentToken: string | null = null

  private constructor() {}

  static getInstance(): WebSocketClient {
    if (!WebSocketClient.instance) {
      WebSocketClient.instance = new WebSocketClient()
    }
    return WebSocketClient.instance
  }

  connect(token: string) {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return
    }

    this.isConnecting = true
    this.currentToken = token
    this.intentionalDisconnect = false

    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 
        (process.env.NEXT_PUBLIC_API_URL || 'https://fuel-request-backend-production.up.railway.app/api').replace('https://', 'wss://').replace('http://', 'ws://').replace('/api', '')
      
      this.ws = new WebSocket(`${wsUrl}/ws?token=${token}`)

      this.ws.onopen = () => {
        console.log('[WebSocket] Connected')
        this.isConnecting = false
        this.reconnectAttempts = 0
      }

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          this.handleMessage(message)
        } catch (error) {
          console.error('[WebSocket] Error parsing message:', error)
        }
      }

      this.ws.onclose = () => {
        console.log('[WebSocket] Disconnected')
        this.isConnecting = false
        if (!this.intentionalDisconnect) {
          this.scheduleReconnect()
        }
      }

      this.ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error)
        this.isConnecting = false
      }
    } catch (error) {
      console.error('[WebSocket] Connection error:', error)
      this.isConnecting = false
      if (!this.intentionalDisconnect) {
        this.scheduleReconnect()
      }
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[WebSocket] Max reconnection attempts reached')
      return
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
      console.log(`[WebSocket] Reconnecting (attempt ${this.reconnectAttempts}) in ${delay}ms`)
      if (this.currentToken) {
        this.connect(this.currentToken)
      }
    }, this.reconnectDelay)
  }

  private handleMessage(message: any) {
    console.log('[WebSocket] Received message:', message.type)

    const listeners = this.eventListeners.get(message.type)
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(message.data)
        } catch (error) {
          console.error('[WebSocket] Error in event listener:', error)
        }
      })
    }

    // Also notify 'all' listeners
    const allListeners = this.eventListeners.get('*')
    if (allListeners) {
      allListeners.forEach((listener) => {
        try {
          listener(message)
        } catch (error) {
          console.error('[WebSocket] Error in "all" event listener:', error)
        }
      })
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set())
    }
    this.eventListeners.get(event)!.add(callback)
  }

  off(event: string, callback: (data: any) => void) {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.delete(callback)
      if (listeners.size === 0) {
        this.eventListeners.delete(event)
      }
    }
  }

  disconnect() {
    this.intentionalDisconnect = true

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    this.eventListeners.clear()
    this.reconnectAttempts = 0
    this.isConnecting = false
    this.currentToken = null
  }

  reconnectWithNewToken(newToken: string) {
    console.log('[WebSocket] Reconnecting with new token')
    this.currentToken = newToken
    this.intentionalDisconnect = false
    this.reconnectAttempts = 0

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    this.connect(newToken)
  }

  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    } else {
      console.warn('[WebSocket] Cannot send message: not connected')
    }
  }
}

export const wsClient = WebSocketClient.getInstance()
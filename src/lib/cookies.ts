export function setCookie(name: string, value: string, days?: number) {
  if (typeof window === 'undefined') return
  let expires = ''
  if (days) {
    const date = new Date()
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
    expires = '; expires=' + date.toUTCString()
  }
  const isSecure = window.location.protocol === 'https:' ? '; secure' : ''
  document.cookie = name + '=' + (value || '') + expires + '; path=/; SameSite=Strict' + isSecure
}

export function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null
  const nameEQ = name + '='
  const ca = document.cookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }
  return null
}

export function deleteCookie(name: string) {
  if (typeof window === 'undefined') return
  document.cookie = name + '=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict'
}

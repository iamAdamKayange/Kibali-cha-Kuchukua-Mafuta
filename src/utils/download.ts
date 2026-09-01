/**
 * Download a file from a blob
 */
export function downloadFile(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

/**
 * Open a file in a new tab
 */
export function openFileInNewTab(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob)
  const newWindow = window.open(url, '_blank')
  if (newWindow) {
    newWindow.document.title = filename
  }
  window.URL.revokeObjectURL(url)
}

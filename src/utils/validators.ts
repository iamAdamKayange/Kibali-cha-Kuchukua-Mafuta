export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

export function isValidPhone(phone: string): boolean {
  const regex = /^[0-9]{10,15}$/
  return regex.test(phone.replace(/\s/g, ''))
}

export function isValidVehicleNumber(plate: string): boolean {
  const regex = /^[A-Z]{1,2}\s?\d{3}\s?[A-Z]{2,3}$/
  return regex.test(plate.toUpperCase())
}

export function isValidGPSA(gpsa: string): boolean {
  return gpsa.length >= 5 && gpsa.length <= 20
}
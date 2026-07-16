export interface AdminProfile {
  id: string
  name: string
  email: string
  avatar: string
  role: "super-admin" | "admin" | "manager"
  phone?: string
}

export interface CustomerUser {
  id: string
  email: string
  name?: string
}

function isSecure(): boolean {
  return typeof location !== "undefined" && location.protocol === "https:"
}

const secureFlag = () => (isSecure() ? "; Secure" : "")

export function setAuthCookies(accessToken: string, refreshToken: string) {
  if (typeof document === "undefined") return
  const s = secureFlag()
  document.cookie = `ysi_access_token=${accessToken}; path=/; max-age=${60 * 60}; SameSite=Strict${s}`
  document.cookie = `ysi_refresh_token=${refreshToken}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Strict${s}`
}

export function removeAuthCookies() {
  if (typeof document === "undefined") return
  const s = secureFlag()
  document.cookie = `ysi_access_token=; path=/; max-age=0; SameSite=Strict${s}`
  document.cookie = `ysi_refresh_token=; path=/; max-age=0; SameSite=Strict${s}`
}

export function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null
  const pattern = new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`)
  const match = document.cookie.match(pattern)
  return match ? decodeURIComponent(match[1]) : null
}

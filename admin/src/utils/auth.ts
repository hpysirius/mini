/** Token 管理工具 */
const TOKEN_KEY = 'admin_token'
const USER_KEY = 'admin_user'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function getUser(): any {
  const raw = localStorage.getItem(USER_KEY)
  return raw ? JSON.parse(raw) : null
}

export function setUser(user: any) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

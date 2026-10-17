const REFRESH_TOKEN_KEY = 'wcs.refresh_token'

let accessToken: string | null = null

function canUseSessionStorage() {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined'
}

export const tokenStore = {
  getAccessToken() {
    return accessToken
  },

  setAccessToken(token: string | null) {
    accessToken = token
  },

  getRefreshToken() {
    if (!canUseSessionStorage()) return null
    return window.sessionStorage.getItem(REFRESH_TOKEN_KEY)
  },

  setRefreshToken(token: string | null) {
    if (!canUseSessionStorage()) return
    if (token) {
      window.sessionStorage.setItem(REFRESH_TOKEN_KEY, token)
      return
    }
    window.sessionStorage.removeItem(REFRESH_TOKEN_KEY)
  },

  setTokens(tokens: { accessToken: string; refreshToken: string }) {
    this.setAccessToken(tokens.accessToken)
    this.setRefreshToken(tokens.refreshToken)
  },

  clear() {
    accessToken = null
    if (canUseSessionStorage()) {
      window.sessionStorage.removeItem(REFRESH_TOKEN_KEY)
    }
  },
}

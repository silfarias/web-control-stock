type AuthFailureListener = () => void

const listeners = new Set<AuthFailureListener>()

export function onAuthSessionInvalid(listener: AuthFailureListener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function notifyAuthSessionInvalid() {
  for (const listener of listeners) {
    listener()
  }
}

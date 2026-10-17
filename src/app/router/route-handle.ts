export type RouteHandle = {
  title: string
  breadcrumb?: string[]
}

export function isRouteHandle(handle: unknown): handle is RouteHandle {
  return (
    typeof handle === 'object' &&
    handle !== null &&
    'title' in handle &&
    typeof handle.title === 'string'
  )
}

export function getRouteHandle(matches: Array<{ handle: unknown }>): RouteHandle {
  for (let index = matches.length - 1; index >= 0; index -= 1) {
    const handle = matches[index]?.handle
    if (isRouteHandle(handle)) return handle
  }

  return { title: 'Control de stock' }
}

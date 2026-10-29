export function printHtml(html: string) {
  const iframe = document.createElement('iframe')
  iframe.setAttribute('aria-hidden', 'true')
  iframe.style.cssText = 'position:fixed;width:0;height:0;border:0;right:0;bottom:0'
  document.body.appendChild(iframe)

  const doc = iframe.contentDocument
  const win = iframe.contentWindow
  if (!doc || !win) {
    iframe.remove()
    return
  }

  doc.open()
  doc.write(html)
  doc.close()

  const cleanup = () => {
    win.removeEventListener('afterprint', cleanup)
    iframe.remove()
  }
  win.addEventListener('afterprint', cleanup)
  window.setTimeout(cleanup, 60_000)

  window.setTimeout(() => {
    win.focus()
    win.print()
  }, 150)
}

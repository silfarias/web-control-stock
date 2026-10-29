type TicketPreviewProps = {
  html: string
  paperMm: number
  title?: string
}

export function TicketPreview({ html, paperMm, title = 'Vista previa del ticket' }: TicketPreviewProps) {
  return (
    <div className="overflow-auto rounded-xl bg-surface-muted p-4 sm:p-6">
      <iframe
        title={title}
        srcDoc={html}
        className="mx-auto block border border-border bg-white"
        style={{ width: `calc(${paperMm}mm + 8px)`, height: '36rem' }}
      />
    </div>
  )
}

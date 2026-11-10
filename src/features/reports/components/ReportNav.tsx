import { useNavigate, useLocation } from 'react-router'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs'

const links = [
  { to: '/reportes', label: 'Resumen' },
  { to: '/reportes/ventas', label: 'Ventas' },
  { to: '/reportes/ventas-diarias', label: 'Ventas diarias' },
  { to: '/reportes/productos-top', label: 'Más vendidos' },
  { to: '/reportes/stock-bajo', label: 'Stock bajo' },
  { to: '/reportes/inventario', label: 'Inventario' },
] as const

function activeReportPath(pathname: string) {
  const match = links.find((link) =>
    link.to === '/reportes' ? pathname === '/reportes' : pathname.startsWith(link.to),
  )
  return match?.to ?? '/reportes'
}

export function ReportNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const value = activeReportPath(pathname)

  return (
    <Tabs
      value={value}
      onValueChange={(next) => {
        void navigate(next)
      }}
    >
      <TabsList
        aria-label="Secciones de reportes"
        className="h-auto w-full justify-start gap-1 overflow-x-auto bg-transparent p-0"
      >
        {links.map((link) => (
          <TabsTrigger
            key={link.to}
            value={link.to}
            className="shrink-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:hover:bg-primary-hover"
          >
            {link.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}

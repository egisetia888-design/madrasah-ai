import { NavLink } from "react-router-dom"
import { LayoutDashboard, Library, PenTool, Map, Settings, LogOut, Briefcase, FileText, Network, FlaskConical, Search, Brain, BarChart2 } from "lucide-react"
import { cn } from "../../utils/cn"
import { useUIStore } from "../../store/uiStore"

const navGroups = [
  {
    title: "Utama",
    items: [
      { name: "Beranda", href: "/", icon: LayoutDashboard },
      { name: "Analitik", href: "/analytics", icon: BarChart2 },
    ]
  },
  {
    title: "Sumber Belajar",
    items: [
      { name: "Kurikulum", href: "/curriculum", icon: Map },
      { name: "Pustaka", href: "/library", icon: Library },
    ]
  },
  {
    title: "Zettelkasten",
    items: [
      { name: "Otak Kedua", href: "/notes", icon: PenTool },
      { name: "Graf Pengetahuan", href: "/graph", icon: Network },
      { name: "Latihan", href: "/review", icon: Brain },
    ]
  },
  {
    title: "Ruang Kerja",
    items: [
      { name: "Proyek", href: "/projects", icon: Briefcase },
      { name: "Riset", href: "/research", icon: FlaskConical },
      { name: "Menulis", href: "/writing", icon: FileText },
    ]
  }
]

export function Sidebar() {
  const setSearchOpen = useUIStore(state => state.setSearchOpen)

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen border-r border-gray-200 bg-gray-50/50 px-4 py-6 sticky top-0">
      <div className="flex items-center justify-between px-2 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="font-semibold text-lg tracking-tight">Madrasah</span>
        </div>
        <button onClick={() => setSearchOpen(true)} className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200/50 rounded-md transition-colors" title="Cari (Cmd+K)">
          <Search className="w-4 h-4" />
        </button>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto pr-2 no-scrollbar">
        {navGroups.map((group) => (
          <div key={group.title}>
            <h4 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              {group.title}
            </h4>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    )
                  }
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-8 space-y-1">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isActive
                ? "bg-gray-100 text-gray-900"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            )
          }
        >
          <Settings className="w-4 h-4" />
          Pengaturan
        </NavLink>
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors text-left cursor-pointer">
          <LogOut className="w-4 h-4" />
          Keluar
        </button>
      </div>
    </aside>
  )
}

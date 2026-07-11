import { useState } from "react"
import { NavLink } from "react-router-dom"
import { LayoutDashboard, Library, PenTool, Map, Briefcase, FileText, Network, FlaskConical, Menu, X, Brain, BarChart2, Settings, LogOut } from "lucide-react"
import { cn } from "../../utils/cn"

const navItems = [
  { name: "Beranda", href: "/", icon: LayoutDashboard },
  { name: "Kurikulum", href: "/curriculum", icon: Map },
  { name: "Pustaka", href: "/library", icon: Library },
  { name: "Otak Kedua", href: "/notes", icon: PenTool },
  { name: "Proyek", href: "/projects", icon: Briefcase },
  { name: "Menulis", href: "/writing", icon: FileText },
  { name: "Graf", href: "/graph", icon: Network },
  { name: "Riset", href: "/research", icon: FlaskConical },
  { name: "Latihan", href: "/review", icon: Brain },
  { name: "Analitik", href: "/analytics", icon: BarChart2 },
]

const mainNavItems = [
  navItems[0], // Beranda
  navItems[1], // Kurikulum
  navItems[2], // Pustaka
  navItems[3], // Otak Kedua (Catatan)
]

export function MobileNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 z-50 pb-safe">
        <div className="flex items-center justify-between px-4 py-2">
          {mainNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all flex-1",
                  isActive
                    ? "text-gray-900 scale-105"
                    : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"
                )
              }
            >
              <item.icon className="w-5 h-5" strokeWidth={2.5} />
              <span className="text-[10px] font-semibold">{item.name}</span>
            </NavLink>
          ))}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all flex-1",
              menuOpen
                ? "text-gray-900 scale-105"
                : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"
            )}
          >
            {menuOpen ? <X className="w-5 h-5" strokeWidth={2.5} /> : <Menu className="w-5 h-5" strokeWidth={2.5} />}
            <span className="text-[10px] font-semibold">Menu</span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white/95 backdrop-blur-sm pt-20 pb-24 px-4 overflow-y-auto animate-in fade-in slide-in-from-bottom-8 duration-200">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">Modul Lainnya</h2>
          <div className="grid grid-cols-2 gap-2">
            {navItems.filter(i => !mainNavItems.includes(i)).map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-all border",
                    isActive
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 shadow-sm"
                  )
                }
              >
                <item.icon className="w-6 h-6" strokeWidth={2} />
                <span className="text-sm font-medium">{item.name}</span>
              </NavLink>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 space-y-2">
            <NavLink
              to="/settings"
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors border",
                  isActive
                    ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                    : "bg-gray-50 text-gray-700 border-gray-100 hover:border-gray-200 shadow-sm"
                )
              }
            >
              <Settings className="w-5 h-5" />
              Pengaturan Sistem
            </NavLink>
            <button 
              onClick={() => {
                setMenuOpen(false);
                alert("Anda telah keluar dari Madrasah (Simulasi).");
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors border border-red-100 shadow-sm text-left cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              Keluar Sesi
            </button>
          </div>
        </div>
      )}
    </>
  )
}

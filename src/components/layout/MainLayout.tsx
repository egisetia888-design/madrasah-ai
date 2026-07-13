import { useEffect } from "react"
import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { MobileNav } from "./MobileNav"
import { CommandPalette } from "./CommandPalette"
import { OnboardingTour } from "./OnboardingTour"
import { HijriClock } from "./HijriClock"
import { Search } from "lucide-react"
import { useUIStore } from "../../store/uiStore"

export function MainLayout() {
  const searchOpen = useUIStore(state => state.searchOpen)
  const setSearchOpen = useUIStore(state => state.setSearchOpen)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSearchOpen(!searchOpen)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [searchOpen, setSearchOpen])

  return (
    <div className="flex min-h-screen bg-gray-50/50 text-gray-900 font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center shadow-sm">
               <span className="text-white font-bold text-sm">M</span>
             </div>
             <span className="font-semibold text-[17px] tracking-tight">Madrasah</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setSearchOpen(true)} className="p-2 -mr-2 text-gray-500 hover:text-gray-900 rounded-full">
              <Search className="w-5 h-5" />
            </button>
            <div className="scale-90 origin-right">
              <HijriClock />
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 py-3 items-center justify-end">
          <HijriClock />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-10">
          <Outlet />
        </div>
      </main>
      <MobileNav />
      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
      <OnboardingTour />
    </div>
  )
}

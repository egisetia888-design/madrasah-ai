import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/Button"
import { Plus, PenLine, FileText, MoreVertical, LayoutGrid, List } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/Dialog"
import { useWritingStore } from "../../store/writingStore"
import { WritingStatus } from "../../types"

const WRITING_PIPELINE: { id: WritingStatus; label: string }[] = [
  { id: 'idea', label: 'Ide' },
  { id: 'outline', label: 'Kerangka' },
  { id: 'draft', label: 'Draf' },
  { id: 'editing', label: 'Pengeditan' },
  { id: 'review', label: 'Ulasan' },
  { id: 'published', label: 'Diterbitkan' }
]

export function WritingPage() {
  const navigate = useNavigate()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board')
  
  const drafts = useWritingStore(state => state.drafts)
  const addDraft = useWritingStore(state => state.addDraft)

  const handleAddDraft = (e: any) => {
    e.preventDefault()
    if (!title) return
    
    addDraft({
      title,
      content,
      // Ideally we would pass 'status: "idea"' but the store defaults to 'draft' currently. 
      // Need to fix the store to accept status or default to idea, but for now we'll rely on what it does.
    })

    setTitle("")
    setContent("")
    setIsAddOpen(false)
  }

  const renderCard = (draft: any) => (
    <div key={draft.id} onClick={() => navigate(`/writing/${draft.id}`)} className="group border border-gray-200 rounded-xl bg-white p-4 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer flex flex-col h-40">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium text-gray-900 line-clamp-2 pr-2 leading-snug">{draft.title}</h3>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-900 shrink-0">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
      <p className="text-xs text-gray-500 line-clamp-2 flex-1 font-serif mt-1">{draft.content || "Mulai menulis..."}</p>
      <div className="flex items-center justify-between text-[10px] text-gray-400 mt-auto pt-3 border-t border-gray-50 uppercase tracking-wider font-semibold">
        <span>{new Date(draft.updatedAt).toLocaleDateString()}</span>
        <span>{draft.content.split(/\s+/).filter((w: string) => w.length > 0).length} kata</span>
      </div>
    </div>
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Alur Menulis</h1>
          <p className="text-gray-500 mt-1 text-sm">Kelola siklus hidup karya intelektual Anda.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-100 rounded-lg p-1 mr-2 hidden sm:flex">
            <button onClick={() => setViewMode('board')} className={`p-1.5 rounded-md ${viewMode === 'board' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
               <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
               <List className="w-4 h-4" />
            </button>
          </div>
          <Button className="gap-2 shrink-0" onClick={() => setIsAddOpen(true)}>
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Ide Baru</span>
            <span className="sm:hidden">Tulis</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        {drafts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 h-full text-center border border-dashed border-gray-200 rounded-xl bg-gray-50/30">
             <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
               <PenLine className="w-6 h-6" />
             </div>
             <h3 className="text-sm font-medium text-gray-900">Alur Anda kosong</h3>
             <p className="text-sm text-gray-500 mt-1 mb-4 max-w-sm">
               Tangkap ide untuk memulai proses menulis.
             </p>
             <Button variant="outline" size="sm" className="gap-2" onClick={() => setIsAddOpen(true)}>
               <Plus className="w-3.5 h-3.5" />
               Ide Baru
             </Button>
          </div>
        ) : viewMode === 'board' ? (
          <div className="flex gap-4 h-full min-h-[400px]">
            {WRITING_PIPELINE.map(stage => {
              const stageDrafts = drafts.filter(d => (d.status as string) === stage.id || (stage.id === 'draft' && !WRITING_PIPELINE.map(p=>p.id).includes(d.status as WritingStatus)))
              return (
                <div key={stage.id} className="w-72 shrink-0 flex flex-col bg-gray-50/50 rounded-xl border border-gray-100">
                  <div className="p-3 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-gray-50/90 backdrop-blur z-10 rounded-t-xl">
                    <h3 className="font-semibold text-sm text-gray-700 uppercase tracking-wider">{stage.label}</h3>
                    <span className="text-xs font-medium text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded-full">{stageDrafts.length}</span>
                  </div>
                  <div className="p-2 flex-1 overflow-y-auto space-y-2">
                    {stageDrafts.map(renderCard)}
                    {stageDrafts.length === 0 && (
                      <div className="p-4 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl italic">
                        Kosong
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {drafts.map(renderCard)}
          </div>
        )}
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogHeader>
          <DialogTitle>Tangkap Ide</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col flex-1 min-h-0 overflow-hidden" onSubmit={handleAddDraft}>
          <DialogContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Judul <span className="text-red-500">*</span></label>
              <input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                type="text" 
                className="flex h-11 w-full rounded-md border border-gray-200 bg-transparent px-3 py-1 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950" 
                placeholder="Contoh: Filosofi Stoikisme"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Pemikiran Awal</label>
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex min-h-[120px] w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 resize-none font-serif" 
                placeholder="Hanya ide kasar..."
              />
            </div>
          </DialogContent>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)}>Batal</Button>
            <Button type="submit" disabled={!title.trim()}>Simpan Ide</Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  )
}

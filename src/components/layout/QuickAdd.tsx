import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, FileText, PenLine, Briefcase, Library, Brain, ArrowLeft, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/Dialog"
import { Button } from "../ui/Button"
import { useNotesStore } from "../../store/notesStore"
import { useWritingStore } from "../../store/writingStore"
import { useProjectsStore } from "../../store/projectsStore"
import { useLibraryStore } from "../../store/libraryStore"
import { useReviewStore } from "../../store/reviewStore"
import { useUIStore } from "../../store/uiStore"
import { cn } from "../../utils/cn"

type QuickAddType = 'note' | 'draft' | 'project' | 'book' | 'deck' | null

const addOptions = [
  {
    id: 'note',
    title: 'Catatan Baru',
    description: 'Tulis ide, fakta, atau pemikiran acak.',
    icon: FileText,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    hoverBorder: 'hover:border-indigo-200'
  },
  {
    id: 'draft',
    title: 'Ide Tulisan',
    description: 'Mulai draft artikel atau esai panjang.',
    icon: PenLine,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    hoverBorder: 'hover:border-blue-200'
  },
  {
    id: 'project',
    title: 'Proyek Baru',
    description: 'Rencanakan tugas dan proyek besar.',
    icon: Briefcase,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    hoverBorder: 'hover:border-emerald-200'
  },
  {
    id: 'book',
    title: 'Materi Pustaka',
    description: 'Simpan buku, artikel, atau referensi.',
    icon: Library,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    hoverBorder: 'hover:border-orange-200'
  },
  {
    id: 'deck',
    title: 'Dek Ulasan',
    description: 'Buat dek flashcard untuk dihafal.',
    icon: Brain,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    hoverBorder: 'hover:border-purple-200'
  }
];

export function QuickAdd() {
  const navigate = useNavigate()
  const isOpen = useUIStore(state => state.quickAddOpen)
  const setIsOpen = useUIStore(state => state.setQuickAddOpen)
  const [activeType, setActiveType] = useState<QuickAddType>(null)
  
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  
  const addNote = useNotesStore(state => state.addNote)
  const addDraft = useWritingStore(state => state.addDraft)
  const addProject = useProjectsStore(state => state.addProject)
  const addBook = useLibraryStore(state => state.addBook)
  const addDeck = useReviewStore(state => state.addDeck)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsOpen(!useUIStore.getState().quickAddOpen)
        setActiveType(null)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const handleOpen = () => {
    setIsOpen(true)
    setActiveType(null)
  }

  const handleClose = () => {
    setIsOpen(false)
    setTimeout(() => {
      setActiveType(null)
      setTitle("")
      setDescription("")
    }, 200)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !activeType) return

    if (activeType === 'note') {
      const id = addNote({ title, content: description, type: 'knowledge', status: 'unprocessed', folderId: null, tags: [], sourceId: null } as any)
      navigate(`/notes/${id}`)
    } else if (activeType === 'draft') {
      const id = addDraft({ title, content: description })
      navigate(`/writing/${id}`)
    } else if (activeType === 'project') {
      const id = addProject({ title, description, status: 'planned' })
      navigate(`/projects/${id}`)
    } else if (activeType === 'book') {
      const id = addBook({ title, authorId: null, categoryId: null, status: 'owned', progress: 0 })
      navigate(`/library/${id}`)
    } else if (activeType === 'deck') {
      const id = addDeck({ name: title, description, noteId: null })
      navigate(`/review/${id}`)
    }
    
    handleClose()
  }

  const activeConfig = activeType ? addOptions.find(o => o.id === activeType) : null;

  return (
    <>
      <button 
        onClick={handleOpen}
        className="fixed bottom-20 md:bottom-8 right-6 w-14 h-14 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-800 transition-all hover:scale-105 z-40 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
        title="Tambah Cepat (Cmd+J)"
      >
        <Plus className="w-6 h-6" />
      </button>

      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-0 shadow-2xl rounded-2xl">
          {!activeType ? (
            <div className="flex flex-col">
              <div className="bg-gray-50/50 p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <DialogTitle className="text-xl font-bold text-gray-900">Tambah Cepat</DialogTitle>
                  <p className="text-sm text-gray-500 mt-1">Apa yang ingin Anda buat? (Cmd+J)</p>
                </div>
                <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addOptions.map((option) => (
                  <button 
                    key={option.id}
                    onClick={() => setActiveType(option.id as QuickAddType)} 
                    className={cn(
                      "flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-white shadow-sm transition-all text-left group",
                      option.hoverBorder,
                      "hover:shadow-md"
                    )}
                  >
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors", option.bgColor)}>
                      <option.icon className={cn("w-5 h-5", option.color)} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-0.5 group-hover:text-indigo-600 transition-colors">{option.title}</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">{option.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full max-h-[85vh]">
              <div className="bg-gray-50/50 p-4 border-b border-gray-100 flex items-center gap-3">
                 <button onClick={() => setActiveType(null)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                 </button>
                 <div className="flex items-center gap-2">
                   {activeConfig && (
                     <div className={cn("w-6 h-6 rounded-md flex items-center justify-center", activeConfig.bgColor)}>
                       <activeConfig.icon className={cn("w-3.5 h-3.5", activeConfig.color)} />
                     </div>
                   )}
                   <DialogTitle className="text-base font-semibold text-gray-900">
                     {activeConfig?.title}
                   </DialogTitle>
                 </div>
                 <button onClick={handleClose} className="ml-auto p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1 overflow-y-auto">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Judul <span className="text-red-500">*</span></label>
                  <input 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    type="text" 
                    placeholder="Masukkan judul yang deskriptif..."
                    autoFocus
                    className="flex h-11 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-transparent placeholder:text-gray-400" 
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {activeType === 'note' ? 'Isi Catatan Awal' : 
                     activeType === 'draft' ? 'Gagasan Utama' :
                     activeType === 'project' ? 'Deskripsi Proyek' :
                     activeType === 'book' ? 'Catatan (Opsional)' :
                     'Deskripsi Dek'}
                  </label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tuliskan pemikiran, konteks, atau ide tambahan..."
                    className="flex min-h-[120px] w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-transparent placeholder:text-gray-400 resize-none" 
                  />
                </div>
                
                <div className="pt-4 flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Batal
                  </Button>
                  <Button type="submit" disabled={!title.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm px-6">
                    Buat Sekarang
                  </Button>
                </div>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

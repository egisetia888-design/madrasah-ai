import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/Button"
import { Plus, Search, Book, MoreVertical, BookOpen, CheckCircle2, Bookmark, Flame, PenTool, ExternalLink, Filter } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/Dialog"
import { useLibraryStore } from "../../store/libraryStore"
import { BookStatus } from "../../types"
import { cn } from "../../utils/cn"

export function LibraryPage() {
  const navigate = useNavigate()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [authorName, setAuthorName] = useState("")
  const [totalPages, setTotalPages] = useState("")
  const [coverUrl, setCoverUrl] = useState("")
  const [status, setStatus] = useState<BookStatus>('owned')
  
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<BookStatus | 'all'>('all')
  
  const books = useLibraryStore((state) => state.books)
  const authors = useLibraryStore((state) => state.authors)
  const addBook = useLibraryStore((state) => state.addBook)
  const addAuthor = useLibraryStore((state) => state.addAuthor)

  const handleAddBook = (e: any) => {
    e.preventDefault()
    if (!title.trim()) return;

    let authorId = null;
    if (authorName.trim()) {
      const existingAuthor = authors.find(a => a.name.toLowerCase() === authorName.trim().toLowerCase());
      if (existingAuthor) {
        authorId = existingAuthor.id;
      } else {
        authorId = addAuthor(authorName.trim());
      }
    }

    addBook({
      title: title.trim(),
      authorId,
      categoryId: null,
      status,
      progress: 0,
      totalPages: totalPages ? parseInt(totalPages) : undefined,
      coverImage: coverUrl.trim() || undefined
    })

    setTitle("")
    setAuthorName("")
    setTotalPages("")
    setCoverUrl("")
    setStatus('owned')
    setIsAddOpen(false)
  }

  const getAuthorName = (authorId: string | null) => {
    if (!authorId) return "Penulis Tidak Diketahui"
    return authors.find(a => a.id === authorId)?.name || "Penulis Tidak Diketahui"
  }

  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchesSearch = 
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        getAuthorName(book.authorId).toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTab = activeTab === 'all' || book.status === activeTab;
      
      return matchesSearch && matchesTab;
    });
  }, [books, searchQuery, activeTab, authors]);

  const tabs: { id: BookStatus | 'all', label: string, icon: any }[] = [
    { id: 'all', label: 'Semua', icon: Book },
    { id: 'reading', label: 'Sedang Dibaca', icon: BookOpen },
    { id: 'owned', label: 'Milik Saya', icon: Bookmark },
    { id: 'wishlist', label: 'Wishlist', icon: Flame },
    { id: 'finished', label: 'Selesai', icon: CheckCircle2 },
    { id: 'summarized', label: 'Dirangkum', icon: PenTool },
  ];

  const getStatusColor = (status: BookStatus) => {
    switch (status) {
      case 'reading': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'finished': return 'text-green-600 bg-green-50 border-green-200';
      case 'wishlist': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'summarized': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }
  
  const getStatusLabel = (status: BookStatus) => {
    switch (status) {
      case 'reading': return 'Sedang Dibaca';
      case 'finished': return 'Selesai';
      case 'wishlist': return 'Wishlist';
      case 'summarized': return 'Dirangkum';
      case 'connected': return 'Terhubung';
      case 'applied': return 'Diterapkan';
      case 'published': return 'Dipublikasikan';
      default: return 'Milik Saya';
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Pustaka</h1>
          <p className="text-gray-500 mt-2 text-sm max-w-xl">Kelola koleksi buku, artikel, dan referensi Anda. Bangun basis pengetahuan dengan merangkum dan menghubungkan gagasan.</p>
        </div>
        <Button className="gap-2 shrink-0" onClick={() => setIsAddOpen(true)}>
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Tambah Materi</span>
          <span className="sm:hidden">Tambah</span>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-3 h-11 w-full sm:max-w-md focus-within:ring-2 focus-within:ring-gray-900 focus-within:border-transparent transition-all"> 
           <Search className="w-4 h-4 text-gray-400 shrink-0" />
           <input 
               type="text" 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               placeholder="Cari judul buku, penulis..." 
               className="bg-transparent border-none outline-none text-sm w-full text-gray-900 placeholder:text-gray-400"
           />
        </div>
        
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 hide-scrollbar mask-edges">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                activeTab === tab.id 
                  ? "bg-gray-900 text-white shadow-sm" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              )}
            >
              <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-gray-300" : "text-gray-400")} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {books.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
             <div className="w-16 h-16 bg-white shadow-sm rounded-2xl flex items-center justify-center mb-6 text-gray-400 border border-gray-100">
               <Book className="w-8 h-8" />
             </div>
             <h3 className="text-lg font-semibold text-gray-900">Pustaka Anda masih kosong</h3>
             <p className="text-sm text-gray-500 mt-2 mb-6 max-w-sm leading-relaxed">
               Tambahkan buku atau materi untuk mulai membangun Sistem Operasi Pengetahuan Pribadi Anda.
             </p>
             <Button onClick={() => setIsAddOpen(true)} className="gap-2">
               <Plus className="w-4 h-4" />
               Tambah Buku Pertama
             </Button>
          </div>
        ) : filteredBooks.length === 0 ? (
           <div className="text-center py-16 text-gray-500">
             Tidak ada materi yang sesuai dengan pencarian atau filter saat ini.
           </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {filteredBooks.map(book => {
              const progressPct = book.totalPages && book.totalPages > 0 
                ? Math.min(100, Math.round((book.progress / book.totalPages) * 100))
                : 0;
                
              return (
                <div key={book.id} onClick={() => navigate(`/library/${book.id}`)} className="group flex flex-col gap-3 cursor-pointer">
                  <div className="aspect-[2/3] w-full bg-gray-100 rounded-xl border border-gray-200 flex flex-col items-center justify-center text-center transition-all group-hover:border-gray-300 group-hover:shadow-md relative overflow-hidden">
                    {book.coverImage && (
                      <img 
                        src={book.coverImage} 
                        alt={book.title} 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 z-10" 
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    )}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-0 bg-gray-100">
                      <Book className="w-10 h-10 text-gray-300 mb-3" />
                      <span className="text-xs text-gray-400 font-medium line-clamp-3 px-2">{book.title}</span>
                    </div>
                    
                    {book.coverImage && (
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        <button 
                          onClick={(e) => { e.stopPropagation(); window.open(book.coverImage, '_blank'); }}
                          title="Buka Gambar Sampul"
                          className="p-1.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-md text-gray-600 hover:text-gray-900 shadow-sm"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    
                    <div className="absolute top-2 left-2 z-20">
                      <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border shadow-sm backdrop-blur-md", getStatusColor(book.status))}>
                        {getStatusLabel(book.status)}
                      </span>
                    </div>
                    
                    {(book.status === 'reading' || progressPct > 0) && (
                      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-200/80 backdrop-blur-sm z-10">
                        <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${progressPct}%` }} />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">{book.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1 font-medium">{getAuthorName(book.authorId)}</p>
                    {book.status === 'reading' && book.totalPages && (
                       <p className="text-[10px] text-gray-400 mt-1.5 font-mono">{book.progress} / {book.totalPages} hal ({progressPct}%)</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogHeader>
          <DialogTitle>Tambah Materi Baru</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col flex-1 min-h-0 overflow-hidden" onSubmit={handleAddBook}>
          <DialogContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Judul Buku <span className="text-red-500">*</span></label>
              <input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                type="text" 
                className="flex h-11 w-full rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:border-transparent" 
                placeholder="Contoh: Atomic Habits"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Penulis</label>
                <input 
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  type="text" 
                  className="flex h-11 w-full rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:border-transparent" 
                  placeholder="Contoh: James Clear"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Total Halaman</label>
                <input 
                  value={totalPages}
                  onChange={(e) => setTotalPages(e.target.value)}
                  type="number"
                  min="1"
                  className="flex h-11 w-full rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:border-transparent" 
                  placeholder="Contoh: 320"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">URL Sampul Buku (Opsional)</label>
              <input 
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                type="url" 
                className="flex h-11 w-full rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:border-transparent" 
                placeholder="https://example.com/cover.jpg"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value as BookStatus)}
                className="flex h-11 w-full rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:border-transparent"
              >
                <option value="wishlist">Wishlist</option>
                <option value="owned">Milik Saya</option>
                <option value="reading">Sedang Dibaca</option>
                <option value="finished">Selesai</option>
                <option value="summarized">Dirangkum</option>
              </select>
            </div>
            
          </DialogContent>
          <DialogFooter className="pt-4 border-t border-gray-100">
            <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)} className="w-full sm:w-auto mb-2 sm:mb-0">
              Batal
            </Button>
            <Button type="submit" className="w-full sm:w-auto" disabled={!title.trim()}>
              Simpan Materi
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  )
}

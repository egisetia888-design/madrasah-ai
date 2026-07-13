import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/Button"
import { Plus, Search, FileText, Folder as FolderIcon, MoreVertical, Sparkles, LayoutGrid, List, Tag as TagIcon, Brain, CheckCircle2, Circle, ChevronRight, Hash, FolderOpen, Filter } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/Dialog"
import { useNotesStore } from "../../store/notesStore"
import Markdown from 'react-markdown'
import { NoteType } from "../../types"
import { cn } from "../../utils/cn"

export function NotesPage() {
  const navigate = useNavigate()
  
  const notes = useNotesStore(state => state.notes)
  const folders = useNotesStore(state => state.folders)
  const allTags = useNotesStore(state => state.tags)
  const addNote = useNotesStore(state => state.addNote)
  const addFolder = useNotesStore(state => state.addFolder)

  // State
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isAssistantOpen, setIsAssistantOpen] = useState(false)
  const [isAddFolderOpen, setIsAddFolderOpen] = useState(false)
  
  // Note Form
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [noteType, setNoteType] = useState<NoteType>('knowledge')
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  
  // Tagging
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [suggestedTags, setSuggestedTags] = useState<string[]>([])
  const [suggestedConnections, setSuggestedConnections] = useState<string[]>([])
  const [isSuggesting, setIsSuggesting] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [addTag = useNotesStore(state => state.addTag)] = useState(() => useNotesStore.getState().addTag)

  // Folder Form
  const [newFolderName, setNewFolderName] = useState("")

  // Assistant
  const [prompt, setPrompt] = useState("")
  const [aiResponse, setAiResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // View & Filter State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeTab, setActiveTab] = useState<'all' | NoteType>('all')
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null)
  const [activeTagId, setActiveTagId] = useState<string | null>(null)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const filteredNotes = useMemo(() => {
    return notes.filter(n => {
      if (activeTab !== 'all' && n.type !== activeTab) return false;
      if (activeFolderId && n.folderId !== activeFolderId) return false;
      if (activeTagId && !n.tags.includes(activeTagId)) return false;
      if (searchTerm) { 
         const searchLower = searchTerm.toLowerCase();
         return n.title.toLowerCase().includes(searchLower) || n.content.toLowerCase().includes(searchLower);
      }
      return true;
    }).sort((a, b) => b.updatedAt - a.updatedAt);
  }, [notes, activeTab, activeFolderId, activeTagId, searchTerm])

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    
    // Process tags
    const finalTags = [...selectedTags];
    if (tagInput.trim()) {
      const tagsToCreate = tagInput.split(',').map(t => t.trim()).filter(t => t);
      tagsToCreate.forEach(t => {
        const id = addTag(t);
        if (!finalTags.includes(id)) finalTags.push(id);
      });
    }

    addNote({
      title: title.trim(),
      content: content.trim(),
      type: noteType,
      status: 'unprocessed',
      folderId: selectedFolder || activeFolderId,
      tags: finalTags,
    })
    
    setTitle("")
    setContent("")
    setNoteType('knowledge')
    setSelectedTags([])
    setSuggestedTags([])
    setSuggestedConnections([])
    setTagInput("")
    setIsAddOpen(false)
  }

  const handleAddFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      addFolder(newFolderName.trim());
      setNewFolderName("");
      setIsAddFolderOpen(false);
    }
  }

  const handleSuggest = async () => {
    if (!content.trim()) return;
    setIsSuggesting(true);
    try {
      const res = await fetch("/api/ai/suggest-tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, notes }),
      });
      const data = await res.json();
      if (data.tags) setSuggestedTags(data.tags);
      if (data.connections) setSuggestedConnections(data.connections);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSuggesting(false);
    }
  }

  const toggleTag = (tagName: string) => {
    const id = addTag(tagName);
    if (selectedTags.includes(id)) {
      setSelectedTags(selectedTags.filter(t => t !== id));
    } else {
      setSelectedTags([...selectedTags, id]);
    }
  }

  const handleAskAssistant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setIsLoading(true);
    setAiResponse("");
    try {
      const res = await fetch("/api/ai/zettelkasten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, notes }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setAiResponse(data.result);
      } else {
        setAiResponse(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setAiResponse(`Failed to connect to the assistant: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  const getTypeLabel = (type: NoteType) => {
    switch(type) {
      case 'knowledge': return 'Fakta & Ilmu';
      case 'project': return 'Proyek';
      case 'writing': return 'Tulisan';
      case 'personal': return 'Personal';
    }
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Knowledge Database</h1>
          <p className="text-gray-500 mt-1">Zettelkasten & Catatan Pembelajaran Anda</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button variant="outline" className="gap-2" onClick={() => setIsAssistantOpen(true)}>
            <Sparkles className="w-4 h-4 text-gray-500" />
            <span className="hidden sm:inline">Tanya AI</span>
          </Button>
          <Button className="gap-2" onClick={() => setIsAddOpen(true)}>
            <Plus className="w-4 h-4" />
            Catatan Baru
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex items-center justify-between bg-white border border-gray-200 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Filter className="w-4 h-4 text-gray-500" />
            <span>Saring Catatan</span>
          </div>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="h-8 px-3 text-xs font-semibold"
          >
            {mobileFiltersOpen ? "Sembunyikan" : "Saring / Cari"}
          </Button>
        </div>

        {/* Sidebar Filters */}
        <div className={cn(
          "lg:w-64 shrink-0 space-y-6",
          mobileFiltersOpen ? "block animate-in fade-in slide-in-from-top-2 duration-200" : "hidden lg:block"
        )}>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="relative mb-4">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Cari catatan..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-1 focus:ring-gray-300 outline-none"
              />
            </div>
            
            <div className="space-y-1 mb-6">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Kategori</h3>
              {[
                { id: 'all', label: 'Semua Catatan' },
                { id: 'knowledge', label: 'Knowledge (Ilmu)' },
                { id: 'research', label: 'Research (Riset)' },
                { id: 'project', label: 'Project (Proyek)' },
                { id: 'writing', label: 'Writing (Tulisan)' },
                { id: 'personal', label: 'Personal (Jurnal)' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "w-full text-left px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    activeTab === tab.id ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="space-y-1 mb-6">
              <div className="flex items-center justify-between px-2 mb-2">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Folder</h3>
                <button onClick={() => setIsAddFolderOpen(true)} className="text-gray-400 hover:text-gray-900">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <button
                onClick={() => setActiveFolderId(null)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  activeFolderId === null ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50"
                )}
              >
                <FolderOpen className="w-4 h-4" /> Semua Folder
              </button>
              {folders.map(folder => (
                <button
                  key={folder.id}
                  onClick={() => setActiveFolderId(folder.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    activeFolderId === folder.id ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <FolderIcon className="w-4 h-4" /> {folder.name}
                </button>
              ))}
            </div>

            {allTags.length > 0 && (
              <div className="space-y-1">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Tags</h3>
                <div className="flex flex-wrap gap-1.5 px-2">
                  <button
                    onClick={() => setActiveTagId(null)}
                    className={cn(
                      "px-2 py-1 rounded text-xs font-medium border transition-colors",
                      activeTagId === null ? "bg-gray-900 text-white border-gray-900" : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                    )}
                  >
                    Semua
                  </button>
                  {allTags.map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => setActiveTagId(tag.id)}
                      className={cn(
                        "px-2 py-1 rounded text-xs font-medium border transition-colors",
                        activeTagId === tag.id ? "bg-gray-900 text-white border-gray-900" : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                      )}
                    >
                      #{tag.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">
              {filteredNotes.length} Catatan ditemukan
            </h2>
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
              <button 
                onClick={() => setViewMode('grid')}
                className={cn("p-1.5 rounded-md transition-colors", viewMode === 'grid' ? "bg-gray-100 text-gray-900" : "text-gray-400 hover:text-gray-900")}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={cn("p-1.5 rounded-md transition-colors", viewMode === 'list' ? "bg-gray-100 text-gray-900" : "text-gray-400 hover:text-gray-900")}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-white">
               <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 text-gray-400 shadow-sm border border-gray-100">
                 <FileText className="w-8 h-8" />
               </div>
               <h3 className="text-base font-semibold text-gray-900">Belum ada catatan</h3>
               <p className="text-sm text-gray-500 mt-2 mb-6 max-w-sm">
                 Tuliskan ide, pemikiran, atau riset Anda untuk mulai membangun otak kedua Anda.
               </p>
               <Button onClick={() => setIsAddOpen(true)}>
                 <Plus className="w-4 h-4 mr-2" />
                 Buat Catatan Pertama
               </Button>
            </div>
          ) : (
            <div className={cn(
              "grid gap-4",
              viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
            )}>
              {filteredNotes.map(note => {
                const folder = folders.find(f => f.id === note.folderId);
                const noteTags = note.tags.map(id => allTags.find(t => t.id === id)).filter(Boolean);
                
                return (
                  <div 
                    key={note.id} 
                    onClick={() => navigate(`/notes/${note.id}`)} 
                    className={cn(
                      "group border border-gray-200 rounded-xl bg-white hover:border-gray-300 hover:shadow-md transition-all cursor-pointer flex flex-col relative overflow-hidden",
                      viewMode === 'grid' ? "h-64 p-5" : "p-4 sm:p-5"
                    )}
                  >
                    {note.status === 'processed' && (
                      <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                        <div className="absolute top-3 -right-6 w-24 bg-gray-500 text-white text-[10px] font-bold uppercase tracking-widest text-center py-1 rotate-45">
                          Processed
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-start justify-between mb-3 gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-gray-900 transition-colors">
                          {note.title}
                        </h3>
                        {folder && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                            <FolderIcon className="w-3 h-3" /> {folder.name}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <p className={cn(
                      "text-sm text-gray-600 flex-1 leading-relaxed",
                      viewMode === 'grid' ? "line-clamp-4 mb-4" : "line-clamp-2 sm:line-clamp-3 mb-4"
                    )}>
                      {note.content || "Tidak ada konten."}
                    </p>
                    
                    <div className="flex flex-col gap-3 mt-auto pt-4 border-t border-gray-50">
                      {noteTags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {noteTags.slice(0, 3).map(tag => (
                            <span key={tag!.id} className="text-[10px] font-medium px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                              #{tag!.name}
                            </span>
                          ))}
                          {noteTags.length > 3 && (
                            <span className="text-[10px] font-medium px-2 py-0.5 bg-gray-50 text-gray-400 rounded">
                              +{noteTags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
                        <span className="flex items-center gap-1.5">
                          <span className={cn("w-2 h-2 rounded-full", note.status === 'processed' ? "bg-gray-500" : "bg-gray-300")} />
                          {note.status === 'processed' ? 'Sudah Diproses' : 'Belum Diproses'}
                        </span>
                        <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <Dialog open={isAddFolderOpen} onOpenChange={setIsAddFolderOpen}>
        <DialogHeader>
          <DialogTitle>Folder Baru</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAddFolder} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <DialogContent>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Nama Folder</label>
              <input 
                autoFocus
                type="text" 
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="flex h-11 w-full rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900" 
                placeholder="Contoh: Filosofi, Keuangan..."
                required
              />
            </div>
          </DialogContent>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsAddFolderOpen(false)}>Batal</Button>
            <Button type="submit" disabled={!newFolderName.trim()}>Buat Folder</Button>
          </DialogFooter>
        </form>
      </Dialog>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogHeader>
          <DialogTitle>Catatan Baru</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAddNote} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <DialogContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Judul <span className="text-gray-500">*</span></label>
              <input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                type="text" 
                className="flex h-11 w-full rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900" 
                placeholder="Contoh: Konsep Clean Architecture"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Tipe Catatan</label>
                <select 
                  value={noteType}
                  onChange={(e) => setNoteType(e.target.value as any)}
                  className="flex h-11 w-full rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
                >
                  <option value="knowledge">Knowledge (Fakta, Ilmu)</option>
                  <option value="project">Project (Status, Dokumentasi)</option>
                  <option value="writing">Writing (Draft, Skrip)</option>
                  <option value="personal">Personal (Refleksi, Pengalaman)</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Folder</label>
                <select 
                  value={selectedFolder || ""}
                  onChange={(e) => setSelectedFolder(e.target.value || null)}
                  className="flex h-11 w-full rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
                >
                  <option value="">Tanpa Folder</option>
                  {folders.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Isi Konten</label>
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex min-h-[150px] w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 resize-none" 
                placeholder="Tuliskan pemikiran Anda di sini..."
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Tag Manual (Pisahkan dengan koma)</label>
              <input 
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                type="text" 
                className="flex h-11 w-full rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900" 
                placeholder="Contoh: react, design pattern, frontend"
              />
            </div>
            
            {/* AI Auto-tagging section */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Asisten AI</label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSuggest} 
                  disabled={isSuggesting || !content.trim()}
                  className="h-8 gap-2 bg-gray-50 text-gray-800 hover:bg-gray-100 border-gray-200 hover:border-gray-300"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isSuggesting ? "Menganalisis..." : "Generate Saran Tag & Relasi"}
                </Button>
              </div>
              
              {suggestedTags.length > 0 && (
                <div className="space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Saran Tag AI (Klik untuk memilih):</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedTags.map(tag => {
                      const tagId = allTags.find(t => t.name.toLowerCase() === tag.toLowerCase())?.id || tag;
                      return (
                        <span 
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={cn(
                            "px-2.5 py-1 text-xs font-medium rounded-md cursor-pointer transition-colors border",
                            selectedTags.includes(tagId) 
                              ? 'bg-gray-900 border-gray-900 text-white' 
                              : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                          )}
                        >
                          #{tag}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
          <DialogFooter className="pt-2 border-t border-gray-100">
            <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)}>Batal</Button>
            <Button type="submit" disabled={!title.trim()}>Simpan Catatan</Button>
          </DialogFooter>
        </form>
      </Dialog>

      <Dialog open={isAssistantOpen} onOpenChange={setIsAssistantOpen} maxWidthClass="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900">
            <Sparkles className="w-5 h-5 text-gray-500" /> Asisten Pengetahuan AI
          </DialogTitle>
        </DialogHeader>
        <DialogContent className="flex flex-col gap-6">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <p className="text-sm text-gray-950 leading-relaxed">
              Tanyakan apapun tentang catatan Anda. Asisten AI ini dapat menghubungkan konsep-konsep yang berbeda, merangkum pengetahuan Anda, atau membantu Anda menemukan ide tulisan baru berdasarkan apa yang sudah Anda pelajari.
            </p>
          </div>
          
          <div className="flex-1 overflow-y-auto min-h-[200px] border border-gray-100 rounded-xl bg-gray-50/50 p-4">
            {aiResponse ? (
               <div className="prose prose-sm md:prose-base prose-gray max-w-none text-gray-700">
                 <Markdown>{aiResponse}</Markdown>
               </div>
            ) : (
               <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 space-y-3">
                 <Brain className="w-10 h-10 opacity-20" />
                 <p className="text-sm">Ketik pertanyaan Anda di bawah ini...</p>
               </div>
            )}
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            )}
          </div>
          
          <form onSubmit={handleAskAssistant} className="flex gap-3">
            <input 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              type="text" 
              className="flex-1 h-11 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:border-transparent" 
              placeholder="Contoh: Apa hubungan catatan A dan B?"
              required
            />
            <Button type="submit" disabled={isLoading || !prompt.trim()} className="h-11 px-6 bg-gray-900 hover:bg-gray-800">
              {isLoading ? 'Berpikir...' : 'Tanya AI'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

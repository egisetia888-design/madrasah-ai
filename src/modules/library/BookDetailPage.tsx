import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { ArrowLeft, BookOpen, Clock, PenTool, Brain, Trash2, Edit2, Save, Image as ImageIcon, Book, CheckCircle2, Bookmark, Flame, Plus, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/Dialog";
import { useLibraryStore } from "../../store/libraryStore";
import { useNotesStore } from "../../store/notesStore";
import { useReviewStore } from "../../store/reviewStore";
import { BookStatus } from "../../types";
import { cn } from "../../utils/cn";

export function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const books = useLibraryStore(state => state.books);
  const authors = useLibraryStore(state => state.authors);
  const updateBook = useLibraryStore(state => state.updateBook);
  const deleteBook = useLibraryStore(state => state.deleteBook);
  const addAuthor = useLibraryStore(state => state.addAuthor);
  
  const notes = useNotesStore(state => state.notes);
  const addNote = useNotesStore(state => state.addNote);
  const flashcards = useReviewStore(state => state.flashcards);
  
  const book = books.find(b => b.id === id);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [editTitle, setEditTitle] = useState("");
  const [editAuthorName, setEditAuthorName] = useState("");
  const [editCoverUrl, setEditCoverUrl] = useState("");
  const [editTotalPages, setEditTotalPages] = useState("");
  
  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const [updateProgress, setUpdateProgress] = useState("");
  
  const [quickNoteTitle, setQuickNoteTitle] = useState("");
  const [quickNoteContent, setQuickNoteContent] = useState("");
  const [isQuickAdding, setIsQuickAdding] = useState(false);

  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 py-24">
        <Book className="w-12 h-12 text-gray-300" />
        <h2 className="text-xl font-medium text-gray-900">Buku tidak ditemukan</h2>
        <Button variant="outline" onClick={() => navigate("/library")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Pustaka
        </Button>
      </div>
    );
  }

  const author = authors.find(a => a.id === book.authorId);
  const progressPct = book.totalPages && book.totalPages > 0 ? Math.min(100, Math.round((book.progress / book.totalPages) * 100)) : 0;
  
  const bookNotes = notes.filter(n => n.sourceId === book.id);
  const noteIds = bookNotes.map(n => n.id);
  const bookFlashcards = flashcards.filter(f => f.noteId && noteIds.includes(f.noteId));

  const handleDelete = () => {
    if (book) {
      deleteBook(book.id);
      navigate("/library");
    }
  };

  const handleCreateNote = () => {
    if (book) {
      const noteId = addNote({
        title: `Catatan: ${book.title}`,
        content: '',
        folderId: null,
        tags: [],
        sourceId: book.id,
        type: 'knowledge',
        status: 'unprocessed'
      });
      navigate(`/notes/${noteId}`);
    }
  };

  const handleSaveQuickNote = () => {
    if (book && quickNoteTitle.trim()) {
      addNote({
        title: quickNoteTitle.trim(),
        content: quickNoteContent.trim(),
        folderId: null,
        tags: [],
        sourceId: book.id,
        type: 'knowledge',
        status: 'unprocessed'
      });
      setQuickNoteTitle("");
      setQuickNoteContent("");
      setIsQuickAdding(false);
    }
  };

  const handleSaveEdit = () => {
    if (book && editTitle.trim()) {
      let authorId = book.authorId;
      if (editAuthorName.trim()) {
        const existingAuthor = authors.find(a => a.name.toLowerCase() === editAuthorName.trim().toLowerCase());
        if (existingAuthor) {
          authorId = existingAuthor.id;
        } else {
          authorId = addAuthor(editAuthorName.trim());
        }
      } else {
        authorId = null;
      }

      updateBook(book.id, { 
        title: editTitle.trim(),
        authorId,
        coverImage: editCoverUrl.trim() || undefined,
        totalPages: editTotalPages ? parseInt(editTotalPages) : undefined
      });
      setIsEditing(false);
    }
  };

  const startEditing = () => {
    if (book) {
      setEditTitle(book.title);
      setEditAuthorName(author ? author.name : "");
      setEditCoverUrl(book.coverImage || "");
      setEditTotalPages(book.totalPages ? book.totalPages.toString() : "");
      setIsEditing(true);
    }
  };
  
  const handleUpdateProgress = (e: any) => {
    e.preventDefault();
    const newProgress = parseInt(updateProgress);
    if (!isNaN(newProgress) && newProgress >= 0) {
      updateBook(book.id, { 
        progress: newProgress,
        status: book.totalPages && newProgress >= book.totalPages ? 'finished' : book.status === 'finished' ? 'reading' : book.status
      });
      setIsProgressOpen(false);
    }
  };
  
  const handleUpdateStatus = (newStatus: BookStatus) => {
    updateBook(book.id, { status: newStatus });
  };

  const getStatusIcon = (status: BookStatus) => {
    switch (status) {
      case 'reading': return <BookOpen className="w-4 h-4" />;
      case 'finished': return <CheckCircle2 className="w-4 h-4" />;
      case 'wishlist': return <Flame className="w-4 h-4" />;
      case 'summarized': return <PenTool className="w-4 h-4" />;
      default: return <Bookmark className="w-4 h-4" />;
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
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-2">
         <div className="flex-1 flex gap-6">
            <div className="w-32 h-48 shrink-0 bg-gray-100 rounded-xl border border-gray-200 overflow-hidden shadow-sm hidden sm:block relative">
              {book.coverImage && (
                <img 
                  src={book.coverImage} 
                  alt={book.title} 
                  className="absolute inset-0 w-full h-full object-cover z-10" 
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              )}
              <div className="absolute inset-0 flex flex-col items-center justify-center h-full text-gray-400 bg-gray-100 z-0">
                <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                <span className="text-[10px] font-medium uppercase tracking-wider">Sampul</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-20 pointer-events-none"></div>
            </div>
            
            <div className="flex-1 flex flex-col justify-center">
              <Button variant="ghost" className="gap-2 -ml-3 text-gray-500 hover:text-gray-900 self-start mb-2" onClick={() => navigate("/library")}>
                 <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Kembali</span>
              </Button>
               
               <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 leading-tight mb-2">{book.title}</h1>
               <p className="text-lg text-gray-600 font-medium mb-4">{author ? author.name : "Penulis Tidak Diketahui"}</p>
               
               <div className="flex flex-wrap items-center gap-3">
                 <div className="inline-flex items-center rounded-lg border border-gray-200 bg-white shadow-sm p-1">
                   {(['wishlist', 'owned', 'reading', 'finished', 'summarized'] as BookStatus[]).map(s => (
                     <button
                       key={s}
                       onClick={() => handleUpdateStatus(s)}
                       className={cn(
                         "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                         book.status === s 
                           ? "bg-gray-900 text-white shadow-sm" 
                           : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                       )}
                     >
                       {getStatusIcon(s)}
                       <span className="hidden md:inline">{getStatusLabel(s)}</span>
                     </button>
                   ))}
                 </div>
                 
                 <Button variant="outline" size="sm" className="gap-2" onClick={startEditing}>
                   <Edit2 className="w-4 h-4" />
                   <span className="hidden sm:inline">Edit Detail</span>
                 </Button>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Core Book Info & Reading */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 border border-gray-200 rounded-2xl bg-white space-y-5 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1 bg-blue-500 h-full"></div>
             
             <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-gray-400" />
                  Progres Membaca
                </span>
                <span className="font-bold text-xl text-gray-900">{progressPct}%</span>
             </div>
             
             <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }}></div>
             </div>
             
             <div className="flex justify-between text-sm text-gray-500 font-medium">
                <span><strong className="text-gray-900">{book.progress}</strong> hal dibaca</span>
                <span><strong className="text-gray-900">{book.totalPages || '?'}</strong> total hal</span>
             </div>
             
             <div className="flex gap-2 pt-2">
               <Button className="w-full gap-2" onClick={() => {
                 setUpdateProgress(book.progress.toString());
                 setIsProgressOpen(true);
               }}>
                 <Edit2 className="w-3.5 h-3.5" /> Catat Progres Membaca
               </Button>
             </div>
          </div>
          
          <div className="p-6 border border-gray-200 rounded-2xl bg-white space-y-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400"/> Riwayat & Waktu
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                <span className="text-gray-500">Ditambahkan</span>
                <span className="font-medium text-gray-900">{new Date(book.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Terakhir Diperbarui</span>
                <span className="font-medium text-gray-900">{new Date(book.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="pt-4 mt-4 border-t border-gray-100">
               <Button variant="ghost" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 gap-2" onClick={() => setIsDeleteDialogOpen(true)}>
                 <Trash2 className="w-4 h-4" /> Hapus Materi
               </Button>
            </div>
          </div>
        </div>

        {/* Right Column: Knowledge Hub */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 border border-gray-200 rounded-2xl bg-white shadow-sm flex flex-col items-center justify-center text-center gap-2">
              <span className="text-4xl font-bold text-gray-900">{bookNotes.length}</span>
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><PenTool className="w-4 h-4 text-blue-500"/> Catatan Literatur</span>
            </div>
            <div className="p-6 border border-gray-200 rounded-2xl bg-white shadow-sm flex flex-col items-center justify-center text-center gap-2">
              <span className="text-4xl font-bold text-gray-900">{bookFlashcards.length}</span>
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><Brain className="w-4 h-4 text-purple-500"/> Kartu Ulasan</span>
            </div>
          </div>
          
          <div className="p-6 border border-gray-200 rounded-2xl bg-white shadow-sm space-y-6">
             <div className="flex items-center justify-between pb-4 border-b border-gray-100">
               <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                 Catatan Literatur Tertaut
               </h3>
               <div className="flex items-center gap-2">
                 <Button variant="outline" size="sm" onClick={() => setIsQuickAdding(!isQuickAdding)} className={cn("text-xs h-8 gap-2", isQuickAdding && "bg-gray-100")}>
                   {isQuickAdding ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />} {isQuickAdding ? "Batal" : "Tambah Cepat"}
                 </Button>
                 <Button variant="outline" size="sm" onClick={handleCreateNote} className="text-xs h-8 gap-2">
                   <Plus className="w-3.5 h-3.5" /> Catatan Penuh
                 </Button>
               </div>
             </div>
             
             {isQuickAdding && (
               <div className="p-4 border border-indigo-200 bg-indigo-50/50 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                 <input 
                   type="text" 
                   value={quickNoteTitle}
                   onChange={(e) => setQuickNoteTitle(e.target.value)}
                   placeholder="Judul Ide / Catatan Cepat..."
                   className="w-full bg-white border border-indigo-100 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                   autoFocus
                 />
                 <textarea 
                   value={quickNoteContent}
                   onChange={(e) => setQuickNoteContent(e.target.value)}
                   placeholder="Isi catatan (opsional)..."
                   className="w-full bg-white border border-indigo-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none min-h-[80px]"
                 />
                 <div className="flex justify-end">
                   <Button size="sm" onClick={handleSaveQuickNote} disabled={!quickNoteTitle.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8">
                     Simpan Catatan
                   </Button>
                 </div>
               </div>
             )}

             {bookNotes.length > 0 ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {bookNotes.map(note => (
                   <div key={note.id} onClick={() => navigate(`/notes/${note.id}`)} className="p-5 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-white hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer group">
                     <h4 className="font-semibold text-sm text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">{note.title}</h4>
                     <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">{note.content}</p>
                     <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                       <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                       <span className={cn("px-2 py-0.5 rounded", note.status === 'processed' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600')}>{note.status === 'processed' ? 'Diproses' : 'Mentah'}</span>
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="p-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 flex flex-col items-center text-center">
                 <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center mb-4">
                   <PenTool className="w-6 h-6 text-gray-400" />
                 </div>
                 <h4 className="text-sm font-semibold text-gray-900 mb-1">Belum ada catatan literatur</h4>
                 <p className="text-sm text-gray-500 max-w-sm mb-4">Ubah materi yang Anda baca menjadi pengetahuan yang bisa digunakan dengan menulis catatan literatur.</p>
                 <Button variant="outline" size="sm" onClick={() => setIsQuickAdding(true)} className="gap-2 bg-white">
                   <Plus className="w-3.5 h-3.5" /> Mulai Menulis Cepat
                 </Button>
               </div>
             )}
          </div>
          
        </div>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogHeader>
          <DialogTitle>Edit Detail Buku</DialogTitle>
        </DialogHeader>
        <DialogContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Judul <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="flex h-11 w-full rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:border-transparent" 
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Penulis</label>
              <input 
                type="text" 
                value={editAuthorName}
                onChange={(e) => setEditAuthorName(e.target.value)}
                className="flex h-11 w-full rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:border-transparent" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Total Halaman</label>
              <input 
                type="number"
                min="1"
                value={editTotalPages}
                onChange={(e) => setEditTotalPages(e.target.value)}
                className="flex h-11 w-full rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:border-transparent" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">URL Sampul (Opsional)</label>
            <input 
              type="url" 
              value={editCoverUrl}
              onChange={(e) => setEditCoverUrl(e.target.value)}
              className="flex h-11 w-full rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:border-transparent" 
              placeholder="https://..."
            />
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setIsEditing(false)}>Batal</Button>
          <Button onClick={handleSaveEdit} disabled={!editTitle.trim()}>Simpan Perubahan</Button>
        </DialogFooter>
      </Dialog>
      
      <Dialog open={isProgressOpen} onOpenChange={setIsProgressOpen}>
        <DialogHeader>
          <DialogTitle>Catat Progres Membaca</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col flex-1 min-h-0 overflow-hidden" onSubmit={handleUpdateProgress}>
          <DialogContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Saat ini Anda di halaman berapa?</label>
              <input 
                type="number" 
                min="0"
                max={book.totalPages || undefined}
                value={updateProgress}
                onChange={(e) => setUpdateProgress(e.target.value)}
                className="flex h-11 w-full rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:border-transparent" 
                required
              />
              {book.totalPages && (
                <p className="text-xs text-gray-500">Dari total {book.totalPages} halaman.</p>
              )}
            </div>
          </DialogContent>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsProgressOpen(false)}>Batal</Button>
            <Button type="submit">Simpan Progres</Button>
          </DialogFooter>
        </form>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogHeader>
          <DialogTitle>Hapus Materi</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <p className="text-gray-600">Apakah Anda yakin ingin menghapus materi "{book.title}"? Catatan yang berhubungan dengan buku ini tidak akan terhapus namun status keterkaitannya mungkin hilang. Tindakan ini tidak dapat dibatalkan.</p>
        </DialogContent>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)}>Batal</Button>
          <Button variant="destructive" onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">Hapus Materi</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

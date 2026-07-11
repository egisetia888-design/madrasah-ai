import { useNavigate } from "react-router-dom"
import { Play, BookOpen, Map, Brain, FileText, PenTool, Briefcase, Plus, Book } from "lucide-react"
import { useLibraryStore } from "../../store/libraryStore"
import { useNotesStore } from "../../store/notesStore"
import { useCurriculumStore } from "../../store/curriculumStore"
import { useReviewStore } from "../../store/reviewStore"
import { useWritingStore } from "../../store/writingStore"
import { useProjectsStore } from "../../store/projectsStore"
import { Button } from "../../components/ui/Button"

export function DashboardPage() {
  const navigate = useNavigate()
  
  const books = useLibraryStore(state => state.books)
  const authors = useLibraryStore(state => state.authors)
  const notes = useNotesStore(state => state.notes)
  const paths = useCurriculumStore(state => state.paths)
  const competencies = useCurriculumStore(state => state.competencies)
  const phases = useCurriculumStore(state => state.phases)
  const flashcards = useReviewStore(state => state.flashcards)
  const drafts = useWritingStore(state => state.drafts)
  const projects = useProjectsStore(state => state.projects)
  
  const currentlyReading = books.filter(b => b.status === 'reading')
  const recentBooks = [...books].sort((a, b) => b.createdAt - a.createdAt).slice(0, 3)
  const activePaths = paths
  const dueCards = flashcards.filter(f => f.dueDate <= Date.now())
  const recentNotes = [...notes].sort((a, b) => b.createdAt - a.createdAt).slice(0, 3)
  const activeDrafts = drafts.filter(d => d.status === 'draft')
  const activeProjects = [...projects].sort((a, b) => b.createdAt - a.createdAt).slice(0, 3)

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Ruang Kerja</h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">Sistem operasi intelektual harian Anda. Lanjutkan aktivitas terakhir.</p>
        </div>
        
        {currentlyReading.length > 0 && (
          <Button onClick={() => navigate(`/library/${currentlyReading[0].id}`)} className="gap-2 bg-gray-900 text-white shrink-0 shadow-md">
            <Play className="w-4 h-4 fill-current" />
            Lanjutkan Membaca
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Primary Focus */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-sm flex flex-col justify-center cursor-pointer hover:border-gray-300 transition-colors" onClick={() => navigate('/library')}>
              <div className="text-2xl font-bold text-gray-900">{books.length}</div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1 mt-1"><Book className="w-3 h-3"/> Buku</div>
            </div>
            <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-sm flex flex-col justify-center cursor-pointer hover:border-gray-300 transition-colors" onClick={() => navigate('/notes')}>
              <div className="text-2xl font-bold text-gray-900">{notes.length}</div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1 mt-1"><FileText className="w-3 h-3"/> Catatan</div>
            </div>
            <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-sm flex flex-col justify-center cursor-pointer hover:border-gray-300 transition-colors" onClick={() => navigate('/writing')}>
              <div className="text-2xl font-bold text-gray-900">{drafts.length}</div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1 mt-1"><PenTool className="w-3 h-3"/> Tulisan</div>
            </div>
            <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-sm flex flex-col justify-center cursor-pointer hover:border-gray-300 transition-colors" onClick={() => navigate('/projects')}>
              <div className="text-2xl font-bold text-gray-900">{projects.length}</div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1 mt-1"><Briefcase className="w-3 h-3"/> Proyek</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-gray-900" />
              <h2 className="text-lg font-bold text-gray-900">5 Aturan Belajar Madrasah</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col items-center text-center">
                <div className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold mb-3 shrink-0">1</div>
                <p className="text-[11px] font-medium text-gray-800 leading-tight">Tidak boleh selesai membaca tanpa membuat ringkasan.</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col items-center text-center">
                <div className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold mb-3 shrink-0">2</div>
                <p className="text-[11px] font-medium text-gray-800 leading-tight">Tidak boleh selesai menonton kajian tanpa membuat catatan.</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col items-center text-center">
                <div className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold mb-3 shrink-0">3</div>
                <p className="text-[11px] font-medium text-gray-800 leading-tight">Tidak boleh selesai membaca kitab tanpa mencatat referensi.</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col items-center text-center">
                <div className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold mb-3 shrink-0">4</div>
                <p className="text-[11px] font-medium text-gray-800 leading-tight">Tidak boleh menyelesaikan proyek tanpa dokumentasi.</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col items-center text-center">
                <div className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold mb-3 shrink-0">5</div>
                <p className="text-[11px] font-medium text-gray-800 leading-tight">Tidak boleh mendapatkan ide tanpa langsung menyimpannya.</p>
              </div>
            </div>
          </div>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2 text-gray-900">
                <BookOpen className="w-5 h-5 text-gray-400" /> Sedang Dibaca
              </h2>
            </div>
            {currentlyReading.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentlyReading.map(book => {
                  const author = authors.find(a => a.id === book.authorId);
                  const progressPct = book.totalPages ? Math.round((book.progress / book.totalPages) * 100) : 0;
                  return (
                    <div key={book.id} onClick={() => navigate(`/library/${book.id}`)} className="p-4 border border-gray-200 rounded-xl bg-white hover:shadow-sm transition-shadow cursor-pointer flex gap-4">
                       <div className="w-12 h-16 bg-gray-100 rounded flex-shrink-0 border border-gray-200 flex items-center justify-center text-xs text-gray-400 overflow-hidden">
                         {book.coverImage ? <img src={book.coverImage} className="w-full h-full object-cover" /> : "Sampul"}
                       </div>
                       <div className="flex flex-col flex-1 overflow-hidden">
                         <h3 className="font-semibold text-gray-900 text-sm truncate">{book.title}</h3>
                         <p className="text-xs text-gray-500 truncate">{author ? author.name : "Penulis Tidak Diketahui"}</p>
                         <div className="mt-auto flex items-center gap-2">
                           <div className="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden">
                             <div className="h-full bg-gray-900 rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
                           </div>
                           <span className="text-[10px] text-gray-500 font-medium">{progressPct}%</span>
                         </div>
                       </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 border border-dashed border-gray-200 rounded-xl bg-gray-50/50 text-center text-sm text-gray-500">
                Belum ada buku yang sedang dibaca. Mulai sesi membaca di modul <button onClick={() => navigate('/reading')} className="text-gray-900 font-medium hover:underline">Membaca</button>.
              </div>
            )}
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="space-y-3">
              <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2 text-gray-900">
                <Briefcase className="w-5 h-5 text-gray-400" /> Proyek Aktif
              </h2>
              <div className="space-y-2">
                {activeProjects.length > 0 ? (
                  activeProjects.map(project => (
                    <div key={project.id} onClick={() => navigate(`/projects/${project.id}`)} className="p-3 border border-gray-100 rounded-lg bg-white hover:border-gray-200 transition-colors cursor-pointer flex items-center justify-between">
                      <span className="font-medium text-sm text-gray-900 truncate pr-4">{project.title}</span>
                      <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-100">Aktif</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 p-4 border border-dashed border-gray-200 rounded-lg text-center bg-gray-50/50">Tidak ada proyek aktif.</p>
                )}
              </div>
            </section>
            
            <section className="space-y-3">
              <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2 text-gray-900">
                <PenTool className="w-5 h-5 text-gray-400" /> Tulisan Terbaru
              </h2>
              <div className="space-y-2">
                {drafts.length > 0 ? (
                  [...drafts].sort((a,b) => b.updatedAt - a.updatedAt).slice(0,3).map(draft => (
                    <div key={draft.id} onClick={() => navigate(`/writing/${draft.id}`)} className="p-3 border border-gray-100 rounded-lg bg-white hover:border-gray-200 transition-colors cursor-pointer flex items-center justify-between">
                      <span className="font-medium text-sm text-gray-900 truncate pr-4">{draft.title}</span>
                      <span className="text-xs text-amber-600 bg-amber-50 border border-amber-100 px-2 py-1 rounded capitalize">{draft.status}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 p-4 border border-dashed border-gray-200 rounded-lg text-center bg-gray-50/50">Belum ada draf tulisan.</p>
                )}
              </div>
            </section>
          </div>

        </div>

        {/* Right Column: Processing & Review */}
        <div className="space-y-6">
          
          <div onClick={() => navigate('/review')} className="p-5 rounded-2xl bg-gray-900 text-white cursor-pointer hover:bg-gray-800 transition-colors shadow-sm flex items-center justify-between group">
            <div>
              <div className="flex items-center gap-2 text-gray-300 font-medium text-sm mb-1">
                <Brain className="w-4 h-4" /> Ulasan Spasi
              </div>
              <h3 className="font-bold text-lg">{dueCards.length} Kartu Menunggu</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play className="w-4 h-4 fill-white translate-x-0.5" />
            </div>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2 text-gray-900">
              <Map className="w-5 h-5 text-gray-400" /> Kurikulum
            </h2>
            <div className="p-4 border border-gray-200 rounded-xl bg-white space-y-4">
              {activePaths.length > 0 ? (
                activePaths.slice(0, 2).map(path => {
                  const pathPhases = phases.filter(ph => ph.pathId === path.id);
                  const pathComps = competencies.filter(c => pathPhases.some(ph => ph.id === c.phaseId));
                  const doneComps = pathComps.filter(c => c.status === 'done').length;
                  const totalComps = pathComps.length;
                  const progressPct = totalComps > 0 ? Math.round((doneComps / totalComps) * 100) : 0;
                  
                  return (
                    <div key={path.id} className="flex flex-col gap-2 cursor-pointer group" onClick={() => navigate('/curriculum')}>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-900 font-medium text-sm group-hover:text-blue-600 transition-colors line-clamp-1 pr-2">{path.title}</span>
                        <span className="text-gray-500 text-xs font-medium shrink-0">{progressPct}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500 text-center py-2">Tidak ada kurikulum aktif.</p>
              )}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2 text-gray-900">
              <FileText className="w-5 h-5 text-gray-400" /> Catatan Masuk (Inbox)
            </h2>
            <div className="space-y-2">
              {recentNotes.length > 0 ? (
                recentNotes.map(note => (
                  <div key={note.id} onClick={() => navigate(`/notes/${note.id}`)} className="p-3 border border-gray-100 rounded-lg bg-white hover:border-gray-200 transition-colors cursor-pointer">
                    <h3 className="font-medium text-sm text-gray-900 line-clamp-1">{note.title}</h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{note.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 p-4 border border-dashed border-gray-200 rounded-lg text-center bg-gray-50/50">Inbox bersih! Semua catatan sudah diorganisir.</p>
              )}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2 text-gray-900">
              <Book className="w-5 h-5 text-gray-400" /> Pustaka Terbaru
            </h2>
            <div className="p-4 border border-gray-200 rounded-xl bg-white space-y-4">
               {recentBooks.length > 0 ? (
                 recentBooks.map((book, i) => {
                   const author = authors.find(a => a.id === book.authorId);
                   return (
                     <div key={book.id} onClick={() => navigate(`/library/${book.id}`)} className={`flex gap-3 relative cursor-pointer ${i !== recentBooks.length - 1 ? 'before:absolute before:top-5 before:bottom-[-16px] before:left-[11px] before:w-[2px] before:bg-gray-100' : ''}`}>
                       <div className="w-6 h-6 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 z-10 text-gray-500">
                         <BookOpen className="w-3 h-3" />
                       </div>
                       <div className="text-sm pt-0.5">
                         <p className="text-gray-900 font-medium line-clamp-1 hover:text-gray-600 transition-colors">{book.title}</p>
                         <p className="text-gray-400 text-xs mt-0.5">{author ? author.name : "Penulis Tidak Diketahui"}</p>
                       </div>
                     </div>
                   );
                 })
               ) : (
                 <p className="text-sm text-gray-500 text-center py-2">Belum ada buku yang ditambahkan.</p>
               )}
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}


import { useState } from "react"
import { Button } from "../../components/ui/Button"
import { Plus, Search, FlaskConical, Link, MoreVertical, ExternalLink, Sparkles, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/Dialog"
import { useResearchStore } from "../../store/researchStore"

export function ResearchPage() {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [authors, setAuthors] = useState("")
  const [url, setUrl] = useState("")
  
  const [isAiOpen, setIsAiOpen] = useState(false)
  const [paperContent, setPaperContent] = useState("")
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [summary, setSummary] = useState<{problem: string, methodology: string, conclusion: string} | null>(null)
  
  const papers = useResearchStore(state => state.papers)
  const addPaper = useResearchStore(state => state.addPaper)
  const deletePaper = useResearchStore(state => state.deletePaper)

  const handleAddPaper = (e: any) => {
    e.preventDefault()
    if (!title) return
    
    addPaper({
      title,
      authors: authors.split(",").map(a => a.trim()).filter(a => a),
      url: url || undefined,
    })

    setTitle("")
    setAuthors("")
    setUrl("")
    setIsAddOpen(false)
  }

  const handleSummarize = async () => {
    if (!paperContent.trim()) return
    
    setIsSummarizing(true)
    setSummary(null)
    
    try {
      const res = await fetch("/api/ai/summarize-literature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: paperContent }),
      });
      const data = await res.json();
      setSummary(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSummarizing(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Riset</h1>
          <p className="text-gray-500 mt-1 text-sm">Kelola riset mendalam, sumber, dan sitasi.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 shrink-0 border-blue-200 text-blue-700 bg-blue-50/50 hover:bg-blue-50" onClick={() => setIsAiOpen(true)}>
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">AI Summarizer</span>
          </Button>
          <Button className="gap-2 shrink-0" onClick={() => setIsAddOpen(true)}>
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Sumber Baru</span>
            <span className="sm:hidden">Tambah</span>
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-3 h-11 md:h-10 w-full md:max-w-md focus-within:ring-1 focus-within:ring-gray-900 transition-shadow">
         <Search className="w-4 h-4 text-gray-400 shrink-0" />
         <input 
            type="text" 
            placeholder="Search research topics or sources..." 
            className="bg-transparent border-none outline-none text-base md:text-sm w-full text-gray-900 placeholder:text-gray-400"
         />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {papers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50/30">
             <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
               <FlaskConical className="w-6 h-6" />
             </div>
             <h3 className="text-sm font-medium text-gray-900">Belum ada riset aktif</h3>
             <p className="text-sm text-gray-500 mt-1 mb-4 max-w-sm">
               Mulai ruang kerja riset baru untuk mengumpulkan sumber, bukti, dan sitasi.
             </p>
             <Button variant="outline" size="sm" className="gap-2" onClick={() => setIsAddOpen(true)}>
               <Link className="w-3.5 h-3.5" />
               Tambah Sumber
             </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {papers.map(paper => (
              <div key={paper.id} className="group border border-gray-200 rounded-xl bg-white p-5 hover:shadow-sm transition-shadow flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{paper.title}</h3>
                    {paper.url && (
                      <a href={paper.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{paper.authors.length > 0 ? paper.authors.join(", ") : "Penulis Tidak Diketahui"}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs font-medium uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                      {paper.status}
                    </span>
                    <span className="text-xs text-gray-400">{new Date(paper.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    if (window.confirm(`Yakin ingin menghapus riset "${paper.title}"?`)) {
                      deletePaper(paper.id);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogHeader>
          <DialogTitle>Tambah Sumber/Jurnal</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col flex-1 min-h-0 overflow-hidden" onSubmit={handleAddPaper}>
          <DialogContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Judul <span className="text-red-500">*</span></label>
              <input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                type="text" 
                className="flex h-11 md:h-9 w-full rounded-md border border-gray-200 bg-transparent px-3 py-1 text-base md:text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950" 
                placeholder="Contoh: Attention Is All You Need"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Penulis (pisahkan dengan koma)</label>
              <input 
                value={authors}
                onChange={(e) => setAuthors(e.target.value)}
                type="text" 
                className="flex h-11 md:h-9 w-full rounded-md border border-gray-200 bg-transparent px-3 py-1 text-base md:text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950" 
                placeholder="Contoh: Ashish Vaswani, Noam Shazeer"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Tautan (URL)</label>
              <input 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                type="url" 
                className="flex h-11 md:h-9 w-full rounded-md border border-gray-200 bg-transparent px-3 py-1 text-base md:text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950" 
                placeholder="https://..."
              />
            </div>
          </DialogContent>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)} className="w-full sm:w-auto mb-2 sm:mb-0">
              Batal
            </Button>
            <Button type="submit" className="w-full sm:w-auto" disabled={!title.trim()}>
              Simpan Sumber
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      <Dialog open={isAiOpen} onOpenChange={setIsAiOpen} maxWidthClass="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            AI Literature Summarizer
          </DialogTitle>
        </DialogHeader>
        <DialogContent className="space-y-4 py-2">
          {!summary ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Tempel teks dari abstrak, pendahuluan, atau latar belakang paper. AI akan merangkum menjadi 3 poin utama (Masalah, Metodologi, dan Kesimpulan) dalam Bahasa Indonesia.
              </p>
              <textarea
                value={paperContent}
                onChange={(e) => setPaperContent(e.target.value)}
                className="w-full rounded-md border border-gray-200 p-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none h-48"
                placeholder="Tempel teks literatur di sini..."
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm flex items-center justify-between">
                <span>Rangkuman Selesai.</span>
                <Button variant="ghost" size="sm" onClick={() => setSummary(null)} className="h-7 px-2 text-blue-700 hover:bg-blue-100">Buat Baru</Button>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                <div className="bg-white p-3 rounded-md border border-gray-200 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-1 text-sm flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500" />Masalah Utama</h4>
                  <p className="text-sm text-gray-700">{summary.problem}</p>
                </div>
                <div className="bg-white p-3 rounded-md border border-gray-200 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-1 text-sm flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" />Metodologi</h4>
                  <p className="text-sm text-gray-700">{summary.methodology}</p>
                </div>
                <div className="bg-white p-3 rounded-md border border-gray-200 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-1 text-sm flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500" />Kesimpulan</h4>
                  <p className="text-sm text-gray-700">{summary.conclusion}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
        <DialogFooter>
          <Button variant="ghost" onClick={() => { setIsAiOpen(false); setSummary(null); setPaperContent(""); }}>Tutup</Button>
          {!summary && (
            <Button onClick={handleSummarize} disabled={!paperContent.trim() || isSummarizing} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isSummarizing ? "Merangkum..." : "Rangkum"}
            </Button>
          )}
        </DialogFooter>
      </Dialog>
    </div>
  )
}

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { ArrowLeft, Save, Trash2, Send, ChevronDown } from "lucide-react";
import { useWritingStore } from "../../store/writingStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/Dialog";
import { WritingStatus } from "../../types";

const WRITING_PIPELINE: { id: WritingStatus; label: string }[] = [
  { id: 'idea', label: 'Ide' },
  { id: 'outline', label: 'Kerangka' },
  { id: 'draft', label: 'Draf' },
  { id: 'editing', label: 'Penyuntingan' },
  { id: 'review', label: 'Ulasan' },
  { id: 'published', label: 'Diterbitkan' }
];

export function WritingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const drafts = useWritingStore(state => state.drafts);
  const updateDraft = useWritingStore(state => state.updateDraft);
  const deleteDraft = useWritingStore(state => state.deleteDraft);
  
  const draft = drafts.find(d => d.id === id);
  
  const [title, setTitle] = useState(draft?.title || "");
  const [content, setContent] = useState(draft?.content || "");
  const [status, setStatus] = useState<WritingStatus>(draft?.status || 'idea');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (draft) {
      setTitle(draft.title);
      setContent(draft.content);
      setStatus(draft.status as WritingStatus);
    }
  }, [draft]);

  if (!draft) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <h2 className="text-xl font-medium text-gray-900">Draf tidak ditemukan</h2>
        <Button variant="outline" onClick={() => navigate("/writing")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Penulisan
        </Button>
      </div>
    );
  }

  const handleSave = () => {
    setIsSaving(true);
    updateDraft(draft.id, { title, content, status });
    setTimeout(() => setIsSaving(false), 500);
  };

  const handleDelete = () => {
    deleteDraft(draft.id);
    navigate("/writing");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="gap-2 -ml-3 text-gray-500 hover:text-gray-900" onClick={() => navigate("/writing")}>
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Hapus</span>
          </Button>
          <div className="relative group">
            <select 
              value={status}
              onChange={(e) => {
                 setStatus(e.target.value as WritingStatus);
                 updateDraft(draft.id, { status: e.target.value as WritingStatus });
              }}
              className="appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-3 pr-8 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent cursor-pointer"
            >
              {WRITING_PIPELINE.map(stage => (
                <option key={stage.id} value={stage.id}>{stage.label}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2.5 top-2.5 text-gray-400 pointer-events-none" />
          </div>
          <Button onClick={handleSave} className="gap-2 bg-gray-900 text-white hover:bg-gray-800">
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">{isSaving ? "Tersimpan!" : "Simpan Draf"}</span>
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-4xl font-bold tracking-tight text-gray-900 bg-transparent border-none outline-none w-full placeholder:text-gray-300 focus:ring-0 p-0 font-serif"
          placeholder="Judul Dokumen"
        />
        
        <div className="flex items-center gap-4 text-sm text-gray-500 border-y border-gray-100 py-3">
          <span>{content.split(/\s+/).filter(w => w.length > 0).length} kata</span>
          <span>Terakhir disunting: {new Date(draft.updatedAt).toLocaleTimeString()}</span>
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full min-h-[600px] text-lg leading-relaxed text-gray-800 bg-transparent border-none outline-none resize-none placeholder:text-gray-300 focus:ring-0 p-0 font-serif"
          placeholder="Mulai menulis draf Anda..."
        />
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogHeader>
          <DialogTitle>Hapus Draf</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <p className="text-gray-600">Apakah Anda yakin ingin menghapus "{draft.title}"? Tindakan ini tidak dapat dibatalkan.</p>
        </DialogContent>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)}>Batal</Button>
          <Button variant="destructive" onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">Hapus Draf</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

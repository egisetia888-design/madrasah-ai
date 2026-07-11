import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FileText, PenLine, Briefcase, FlaskConical, Network, Brain } from "lucide-react";
import { Dialog, DialogContent } from "../ui/Dialog";
import { useNotesStore } from "../../store/notesStore";
import { useWritingStore } from "../../store/writingStore";
import { useProjectsStore } from "../../store/projectsStore";
import { useResearchStore } from "../../store/researchStore";
import { useReviewStore } from "../../store/reviewStore";

export function GlobalSearch({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const notes = useNotesStore(state => state.notes);
  const drafts = useWritingStore(state => state.drafts);
  const projects = useProjectsStore(state => state.projects);
  const papers = useResearchStore(state => state.papers);
  const decks = useReviewStore(state => state.decks);

  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  const searchResults = () => {
    if (!query.trim()) return [];
    
    const term = query.toLowerCase();
    const results = [];

    notes.forEach(note => {
      if (note.title.toLowerCase().includes(term) || note.content.toLowerCase().includes(term)) {
        results.push({ id: note.id, title: note.title, type: 'Catatan', icon: FileText, path: `/notes/${note.id}` });
      }
    });

    drafts.forEach(draft => {
      if (draft.title.toLowerCase().includes(term) || draft.content.toLowerCase().includes(term)) {
        results.push({ id: draft.id, title: draft.title, type: 'Draf', icon: PenLine, path: `/writing/${draft.id}` });
      }
    });

    projects.forEach(project => {
      if (project.title.toLowerCase().includes(term) || project.description.toLowerCase().includes(term)) {
        results.push({ id: project.id, title: project.title, type: 'Proyek', icon: Briefcase, path: `/projects/${project.id}` });
      }
    });

    papers.forEach(paper => {
      if (paper.title.toLowerCase().includes(term) || paper.authors.join(' ').toLowerCase().includes(term)) {
        results.push({ id: paper.id, title: paper.title, type: 'Jurnal', icon: FlaskConical, path: `/research` });
      }
    });
    
    decks.forEach(deck => {
      if (deck.name.toLowerCase().includes(term) || (deck.description && deck.description.toLowerCase().includes(term))) {
        results.push({ id: deck.id, title: deck.name, type: 'Dek', icon: Brain, path: `/review/${deck.id}` });
      }
    });

    return results;
  };

  const results = searchResults();

  const handleSelect = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-white/70 backdrop-blur-xl border border-gray-200">
        <div className="flex items-center px-4 py-3 border-b border-gray-100/50">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari catatan, proyek, draf..."
            className="flex-1 bg-transparent border-none outline-none px-3 text-gray-900 placeholder:text-gray-400 text-lg"
          />
          <kbd className="hidden sm:inline-flex items-center justify-center h-6 px-2 text-[10px] font-medium text-gray-400 bg-gray-100 rounded border border-gray-200">ESC</kbd>
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto">
          {query.trim() === "" ? (
            <div className="p-8 text-center text-sm text-gray-500">
              Ketik untuk mulai mencari di basis pengetahuan Anda...
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              Tidak ada hasil ditemukan untuk "{query}"
            </div>
          ) : (
            <div className="py-2">
              {results.map((result, i) => {
                const Icon = result.icon;
                return (
                  <button
                    key={`${result.id}-${i}`}
                    onClick={() => handleSelect(result.path)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100/50 transition-colors focus:bg-gray-100/50 focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm border border-gray-100">
                      <Icon className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">{result.title}</h4>
                      <p className="text-xs text-gray-500 capitalize">{result.type}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

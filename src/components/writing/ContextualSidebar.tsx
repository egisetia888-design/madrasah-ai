import React, { useEffect, useState } from 'react';
import { Sparkles, FileText, ExternalLink, ChevronRight } from 'lucide-react';
import { useNotesStore } from '../../store/notesStore';
import { searchSemantic, SemanticSearchResult } from '../../lib/semanticSearch';
import { useNavigate } from 'react-router-dom';

interface ContextualSidebarProps {
  title: string;
  content: string;
  currentDraftId: string;
}

export function ContextualSidebar({ title, content, currentDraftId }: ContextualSidebarProps) {
  const navigate = useNavigate();
  const notes = useNotesStore(state => state.notes);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const findRelatedNotes = async () => {
      // Only search if there's enough content to be meaningful
      const fullText = `${title} ${content}`.trim();
      if (fullText.length < 50) {
        setSuggestions([]);
        return;
      }

      setIsSearching(true);
      try {
        const noteItems = notes.map(n => ({ id: n.id, embedding: n.embedding }));
        const results = await searchSemantic(fullText, noteItems);
        
        // Take top 5 most relevant
        const topResults = results.slice(0, 5).map(res => {
          const note = notes.find(n => n.id === res.id);
          return {
            ...note,
            similarity: res.similarity
          };
        });
        
        setSuggestions(topResults);
      } catch (err) {
        console.error('Contextual search failed:', err);
      } finally {
        setIsSearching(false);
      }
    };

    // Debounce to avoid constant heavy computation
    const timer = setTimeout(findRelatedNotes, 1500);
    return () => clearTimeout(timer);
  }, [title, content, notes]);

  if (suggestions.length === 0 && !isSearching) return null;

  return (
    <aside className="w-80 shrink-0 hidden xl:flex flex-col border-l border-gray-100 bg-white/50 backdrop-blur-sm sticky top-0 h-[calc(100vh-64px)] overflow-y-auto p-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-4 h-4 text-indigo-500" />
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Referensi Relevan</h3>
      </div>

      <div className="space-y-4">
        {isSearching && suggestions.length === 0 && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-50 rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {suggestions.map((note) => (
          <div 
            key={note.id}
            onClick={() => navigate(`/notes/${note.id}`)}
            className="group p-4 rounded-2xl bg-white border border-gray-100 hover:border-indigo-100 hover:shadow-sm transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
                <FileText className="w-3 h-3" />
                Catatan
              </div>
              <span className="text-[10px] font-mono text-gray-400">
                {Math.round(note.similarity * 100)}% Match
              </span>
            </div>
            <h4 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors mb-2">
              {note.title}
            </h4>
            <p className="text-xs text-gray-500 line-clamp-3 mb-3 leading-relaxed">
              {note.content}
            </p>
            <div className="flex items-center text-[10px] font-semibold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
              Baca Selengkapnya <ChevronRight className="w-3 h-3 ml-0.5" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-8">
        <p className="text-[10px] text-gray-400 text-center leading-relaxed">
          Saran ini dihasilkan secara lokal berdasarkan kemiripan semantik dengan draf Anda saat ini.
        </p>
      </div>
    </aside>
  );
}

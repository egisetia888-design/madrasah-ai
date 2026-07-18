import { useState, useEffect, useRef } from "react"
import { X, Zap } from "lucide-react"
import { useUIStore } from "../../store/uiStore"
import { useNotesStore } from "../../store/notesStore"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/Dialog"
import { Button } from "../ui/Button"

export function QuickAddDialog() {
  const open = useUIStore(state => state.quickAddOpen)
  const setOpen = useUIStore(state => state.setQuickAddOpen)
  const addNote = useNotesStore(state => state.addNote)
  
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        textareaRef.current?.focus()
      }, 50)
    } else {
      setContent("")
      setIsSubmitting(false)
    }
  }, [open])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Global shortcut: Ctrl+Shift+I or Cmd+Shift+I
      if (e.key.toLowerCase() === 'i' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault()
        setOpen(true)
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [setOpen])

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    
    // Auto-generate title from first line or a default
    const lines = content.trim().split('\n');
    let title = lines[0].substring(0, 50);
    if (title.length === 50) title += "...";
    
    // Generate content (remove title from content if it was the only line, or keep it)
    // Actually, keeping the whole content as body is fine.
    
    addNote({
      title: title || "Tangkapan Kilat",
      content: content,
      type: 'knowledge',
      status: 'unprocessed',
      folderId: null,
      tags: [],
    })
    
    setOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-xl">
        <div className="flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Tangkapan Kilat</span>
            </div>
            <div className="flex items-center gap-2">
               <span className="text-[10px] text-gray-400 font-mono hidden sm:inline-block">Cmd+Enter to save</span>
               <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 rounded-full p-1 transition-colors">
                 <X className="w-4 h-4" />
               </button>
            </div>
          </div>
          <div className="p-4">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tulis ide, kutipan, atau tugas apa pun yang terlintas... (tidak perlu format, folder, atau tag)"
              className="w-full h-32 md:h-40 resize-none border-0 focus:ring-0 p-0 text-base md:text-lg text-gray-900 placeholder:text-gray-400 bg-transparent"
            />
          </div>
          <div className="px-4 py-3 border-t border-gray-100 bg-white flex justify-end">
            <Button onClick={handleSubmit} disabled={!content.trim() || isSubmitting} className="rounded-xl px-6">
              Simpan ke Kotak Masuk
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

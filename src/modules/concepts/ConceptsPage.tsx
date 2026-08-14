import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, BrainCircuit, Edit2, Trash2, Network, Sparkles, Zap, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/Dialog";
import { Button } from "../../components/ui/Button";
import { useKnowledgeStore } from "../../store/knowledgeStore";
import { useToastStore } from "../../store/toastStore";
import { autoLinkSingleEntity, runAutoLinker, scanTextForEntities } from "../../utils/autoLinker";
import { ConceptEvolutionStatus } from "../../types";
import { cn } from "../../utils/cn";

export function ConceptsPage() {
  const navigate = useNavigate();
  const concepts = useKnowledgeStore(state => state.concepts);
  const addConcept = useKnowledgeStore(state => state.addConcept);
  const updateConcept = useKnowledgeStore(state => state.updateConcept);
  const deleteConcept = useKnowledgeStore(state => state.deleteConcept);
  const relations = useKnowledgeStore(state => state.relations);
  const addToast = useToastStore(state => state.addToast);
  
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAutoLinking, setIsAutoLinking] = useState(false);
  const [editingConceptId, setEditingConceptId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [definition, setDefinition] = useState("");
  const [aliases, setAliases] = useState("");
  const [evolutionStatus, setEvolutionStatus] = useState<ConceptEvolutionStatus>("emerging");

  const filteredConcepts = useMemo(() => {
    return concepts.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) || 
      c.definition.toLowerCase().includes(search.toLowerCase()) ||
      c.aliases.some(a => a.toLowerCase().includes(search.toLowerCase()))
    );
  }, [concepts, search]);

  const liveDetected = useMemo(() => {
    return scanTextForEntities(`${name}\n${definition}\n${aliases}`);
  }, [name, definition, aliases]);

  const handleGlobalAutoLink = () => {
    setIsAutoLinking(true);
    const toastId = addToast({ type: 'loading', message: 'Memindai relasi konsep di seluruh basis pengetahuan...' });
    setTimeout(() => {
      try {
        const result = runAutoLinker();
        if (result.newAdded > 0) {
          addToast({
            type: 'success',
            message: `Berhasil menemukan ${result.totalDiscovered} koneksi dan menambahkan ${result.newAdded} relasi konsep baru!`
          });
        } else {
          addToast({
            type: 'info',
            message: `Seluruh ${result.totalDiscovered} relasi konsep sudah tersinkronisasi.`
          });
        }
      } catch (err: any) {
        addToast({ type: 'error', message: 'Gagal menjalankan sinkronisasi otomatis.' });
      } finally {
        setIsAutoLinking(false);
      }
    }, 400);
  };

  const handleOpenAdd = () => {
    setName("");
    setDefinition("");
    setAliases("");
    setEvolutionStatus("emerging");
    setEditingConceptId(null);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (concept: import("../../types").Concept) => {
    setName(concept.name);
    setDefinition(concept.definition);
    setAliases(concept.aliases.join(", "));
    setEvolutionStatus(concept.evolutionStatus);
    setEditingConceptId(concept.id);
    setIsAddOpen(true);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    
    const parsedAliases = aliases.split(",").map(a => a.trim()).filter(Boolean);

    let targetId = editingConceptId;
    if (editingConceptId) {
      updateConcept(editingConceptId, {
        name,
        definition,
        aliases: parsedAliases,
        evolutionStatus
      });
    } else {
      targetId = addConcept({
        name,
        definition,
        aliases: parsedAliases,
        evolutionStatus
      });
    }
    
    if (targetId) {
      const linked = autoLinkSingleEntity(targetId, `${name}\n${definition}\n${aliases}`, 'concept', name);
      if (linked > 0) {
        addToast({
          type: 'success',
          message: `Konsep disimpan & ${linked} relasi otomatis tertaut ke basis pengetahuan!`
        });
      }
    }

    setIsAddOpen(false);
  };

  const getStatusColor = (status: ConceptEvolutionStatus) => {
    switch (status) {
      case 'mastered': return 'bg-gray-900 text-white';
      case 'defined': return 'bg-gray-100 text-gray-800 border border-gray-200';
      default: return 'bg-gray-50 text-gray-600 border border-gray-200';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 w-full min-w-0 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-display flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-gray-900 shrink-0" />
            <span>Konsep</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Kelola dan kembangkan unit pengetahuan abstrak secara otomatis tertaut.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={handleGlobalAutoLink} 
            disabled={isAutoLinking}
            className="flex-1 sm:flex-initial gap-2 h-11 sm:h-9 text-gray-900 border-gray-300 hover:bg-gray-100"
          >
            <Zap className={cn("w-4 h-4 text-gray-900", isAutoLinking && "animate-spin")} />
            <span>{isAutoLinking ? "Menautkan..." : "Tautkan Otomatis"}</span>
          </Button>
          <Button onClick={handleOpenAdd} className="flex-1 sm:flex-initial gap-2 shrink-0 h-11 sm:h-9">
            <Plus className="w-4 h-4" />
            <span>Konsep Baru</span>
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari konsep, definisi, atau alias..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900"
          />
        </div>
      </div>

      {/* Grid */}
      {filteredConcepts.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl">
          <BrainCircuit className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Belum ada konsep</h3>
          <p className="text-sm text-gray-500 mb-4">Mulai bangun abstraksi pengetahuan Anda.</p>
          <Button onClick={handleOpenAdd} variant="outline">
            Buat Konsep Pertama
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredConcepts.map(concept => {
            const relCount = relations.filter(r => r.sourceNodeId === concept.id || r.targetNodeId === concept.id).length;
            return (
              <div key={concept.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group relative flex flex-col h-full">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-gray-900 line-clamp-1">{concept.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(concept.evolutionStatus)}`}>
                    {concept.evolutionStatus}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-1">
                  {concept.definition || <span className="italic text-gray-400">Belum ada definisi.</span>}
                </p>
                {concept.aliases.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-1">
                    {concept.aliases.map(alias => (
                      <span key={alias} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                        {alias}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-3 border-t border-gray-50 text-xs text-gray-500">
                  <button 
                    onClick={() => navigate(`/graph?search=${encodeURIComponent(concept.name)}`)}
                    className="flex items-center gap-1.5 font-medium hover:text-gray-900 transition-colors"
                  >
                    <Network className="w-3.5 h-3.5 text-gray-900" />
                    <span>{relCount} relasi</span>
                  </button>

                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="outline" size="sm" onClick={() => handleOpenEdit(concept)} className="py-1 h-auto text-xs">
                      <Edit2 className="w-3 h-3 mr-1" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => deleteConcept(concept.id)} className="px-2 h-auto text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-gray-200">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingConceptId ? 'Edit Konsep' : 'Konsep Baru'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Konsep</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900"
                placeholder="Contoh: First Principles"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Definisi</label>
              <textarea
                value={definition}
                onChange={(e) => setDefinition(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900"
                placeholder="Definisi kanonikal dari konsep ini..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alias / Sinonim (Pisahkan dengan koma)</label>
              <input
                type="text"
                value={aliases}
                onChange={(e) => setAliases(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900"
                placeholder="Contoh: prinsip dasar, asas pertama"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status Evolusi</label>
              <select
                value={evolutionStatus}
                onChange={(e) => setEvolutionStatus(e.target.value as ConceptEvolutionStatus)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900"
              >
                <option value="emerging">Emerging (Masih berkembang)</option>
                <option value="defined">Defined (Sudah terdefinisi dengan jelas)</option>
                <option value="mastered">Mastered (Sudah dikuasai sepenuhnya)</option>
              </select>
            </div>

            {liveDetected.length > 0 && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-900">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Keterkaitan Terdeteksi ({liveDetected.length})</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {liveDetected.map(item => (
                    <span key={item.id} className="text-[11px] bg-white border border-gray-200 px-2 py-0.5 rounded text-gray-700">
                      [{item.type}] {item.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Batal</Button>
            <Button onClick={handleSave}>Simpan Konsep</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


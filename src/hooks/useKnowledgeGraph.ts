import { useMemo } from "react";
import { useGraphStore } from "../store/graphStore";
import { useNotesStore } from "../store/notesStore";
import { useWritingStore } from "../store/writingStore";
import { useProjectsStore } from "../store/projectsStore";
import { useLibraryStore } from "../store/libraryStore";
import { useKnowledgeStore } from "../store/knowledgeStore";
import { Node, Edge, Relation } from "../types";

export function useKnowledgeGraph() {
  const storeNodes = useGraphStore(state => state.nodes);
  const storeEdges = useGraphStore(state => state.edges);
  
  const notes = useNotesStore(state => state.notes);
  const drafts = useWritingStore(state => state.drafts);
  const projects = useProjectsStore(state => state.projects);
  const books = useLibraryStore(state => state.books);
  
  const concepts = useKnowledgeStore(state => state.concepts);
  const fragments = useKnowledgeStore(state => state.sourceFragments);
  const relations = useKnowledgeStore(state => state.relations);

  return useMemo(() => {
    const nodes: Node[] = [...storeNodes];
    const edges: Edge[] = [...storeEdges];
    
    const nodeSet = new Set<string>(storeNodes.map(n => n.id));
    const edgeSet = new Set<string>(storeEdges.map(e => e.id));
    
    const addNodeIfMissing = (id: string, label: string, type: Node['type']) => {
      if (!nodeSet.has(id)) {
        nodeSet.add(id);
        nodes.push({ id, label, type });
      }
    };

    const addEdgeIfMissing = (source: string, target: string, label: string) => {
      const edgeId = `${source}-${target}`;
      if (!edgeSet.has(edgeId)) {
        edgeSet.add(edgeId);
        edges.push({ id: edgeId, source, target, label });
      }
    };

    const extractTags = (text: string, sourceId: string) => {
      if (!text) return;
      const tags: string[] = text.match(/#[\w-]+/g) || [];
      tags.forEach(tag => {
        const tagId = `tag-${tag.toLowerCase()}`;
        addNodeIfMissing(tagId, tag, 'concept');
        addEdgeIfMissing(sourceId, tagId, 'tags');
      });
    };

    const extractWikilinks = (text: string, sourceId: string) => {
      if (!text) return;
      const matches: string[] = text.match(/\[\[(.*?)\]\]/g) || [];
      matches.forEach(match => {
        const linkText = match.slice(2, -2).trim(); // Remove [[ and ]]
        if (!linkText) return;
        
        // Find existing node by label (case-insensitive)
        const existingNode = nodes.find(n => n.label.toLowerCase() === linkText.toLowerCase());
        
        const targetId = existingNode ? existingNode.id : `wikilink-${linkText.toLowerCase().replace(/\s+/g, '-')}`;
        
        addNodeIfMissing(targetId, linkText, existingNode ? existingNode.type : 'concept');
        addEdgeIfMissing(sourceId, targetId, 'references');
      });
    };

    // First pass: Add all explicit entities
    notes.forEach(note => addNodeIfMissing(note.id, note.title, 'note'));
    drafts.forEach(draft => addNodeIfMissing(draft.id, draft.title, 'writing'));
    projects.forEach(project => addNodeIfMissing(project.id, project.title, 'project'));
    books.forEach(book => addNodeIfMissing(book.id, book.title, 'book'));
    
    // V2 Domain entities
    concepts.forEach(concept => addNodeIfMissing(concept.id, concept.name, 'concept'));
    fragments.forEach(fragment => {
      // Create a short label for fragment
      const shortQuote = fragment.quote.length > 30 ? fragment.quote.substring(0, 30) + '...' : fragment.quote;
      addNodeIfMissing(fragment.id, `Frg: ${shortQuote}`, 'source_fragment');
    });

    // Add V2 Relations as Edges for Graph Visualization
    relations.forEach(rel => {
       addEdgeIfMissing(rel.sourceNodeId, rel.targetNodeId, rel.relationType);
    });

    // Second pass: Extract implicit relations from text
    notes.forEach(note => {
      extractTags(note.content, note.id);
      extractTags(note.title, note.id);
      extractWikilinks(note.content, note.id);
      
      // Implicit relation from note to book
      if (note.sourceId) {
        addEdgeIfMissing(note.id, note.sourceId, 'source');
      }
    });
    
    drafts.forEach(draft => {
      extractTags(draft.content, draft.id);
      extractTags(draft.title, draft.id);
      extractWikilinks(draft.content, draft.id);
    });
    
    projects.forEach(project => {
      extractTags(project.description, project.id);
      extractTags(project.title, project.id);
      extractWikilinks(project.description, project.id);
    });

    // Extract fragments source relation
    fragments.forEach(fragment => {
      if (fragment.sourceId) {
        addEdgeIfMissing(fragment.id, fragment.sourceId, 'extracted_from');
      }
    });

    return { nodes, edges };
  }, [storeNodes, storeEdges, notes, drafts, projects, books, concepts, fragments, relations]);
}

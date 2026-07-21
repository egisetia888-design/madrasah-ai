import { useMemo } from "react";
import { useGraphStore } from "../store/graphStore";
import { useNotesStore } from "../store/notesStore";
import { useWritingStore } from "../store/writingStore";
import { useProjectsStore } from "../store/projectsStore";
import { useLibraryStore } from "../store/libraryStore";
import { Node, Edge } from "../types";

export function useKnowledgeGraph() {
  const storeNodes = useGraphStore(state => state.nodes);
  const storeEdges = useGraphStore(state => state.edges);
  
  const notes = useNotesStore(state => state.notes);
  const drafts = useWritingStore(state => state.drafts);
  const projects = useProjectsStore(state => state.projects);
  const books = useLibraryStore(state => state.books);

  return useMemo(() => {
    const nodes: Node[] = [...storeNodes];
    const edges: Edge[] = [...storeEdges];
    
    const addNodeIfMissing = (id: string, label: string, type: Node['type']) => {
      if (!nodes.find(n => n.id === id)) {
        nodes.push({ id, label, type });
      }
    };

    const addEdgeIfMissing = (source: string, target: string, label: string) => {
      const edgeId = `${source}-${target}`;
      if (!edges.find(e => e.id === edgeId)) {
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

    // Second pass: Extract relations
    notes.forEach(note => {
      extractTags(note.content, note.id);
      extractTags(note.title, note.id);
      extractWikilinks(note.content, note.id);
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

    return { nodes, edges };
  }, [storeNodes, storeEdges, notes, drafts, projects, books]);
}

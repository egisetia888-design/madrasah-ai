export type UUID = string;

export interface Author {
  id: UUID;
  name: string;
  createdAt: number;
}

export interface Category {
  id: UUID;
  name: string;
  createdAt: number;
}

export type BookStatus = 'wishlist' | 'owned' | 'reading' | 'finished' | 'summarized' | 'connected' | 'applied' | 'published';

export interface Book {
  id: UUID;
  title: string;
  authorId: UUID | null;
  categoryId: UUID | null;
  status: BookStatus;
  progress: number;
  totalPages?: number;
  coverImage?: string;
  createdAt: number;
  updatedAt: number;
}

export type NoteType = 'knowledge' | 'project' | 'writing' | 'personal';
export type NoteStatus = 'unprocessed' | 'processed';

export interface Note {
  id: UUID;
  title: string;
  content: string; // Inferensi/Opini Sendiri (atau konten utama)
  rawQuote?: string; // Kutipan Mentah dari Literatur Kredibel
  referenceCitation?: string; // Teks sumber referensi asli
  type: NoteType;
  status: NoteStatus;
  sourceId?: UUID | null; // For book/research notes
  folderId: UUID | null;
  tags: UUID[];
  createdAt: number;
  updatedAt: number;
}

export interface Folder {
  id: UUID;
  name: string;
  parentId: UUID | null;
  createdAt: number;
}

export interface Tag {
  id: UUID;
  name: string;
}

export interface LearningPath {
  id: UUID;
  title: string;
  description: string;
  createdAt: number;
  updatedAt: number;
}

export interface Phase {
  id: UUID;
  pathId: UUID;
  title: string;
  order: number;
}

export type CompetencyStatus = 'not-started' | 'in-progress' | 'done';

export interface Competency {
  id: UUID;
  phaseId: UUID;
  title: string;
  status: CompetencyStatus;
  order: number;
  bookIds: UUID[];
  outputIds: UUID[];
  assessmentStatus?: 'pending' | 'passed' | 'failed';
}

export type TaskStatus = 'todo' | 'in-progress' | 'done';

export type ProjectStatus = 'planned' | 'active' | 'review' | 'completed' | 'archived';

export interface Project {
  id: UUID;
  title: string;
  description: string;
  status: ProjectStatus;
  dueDate?: number;
  createdAt: number;
  updatedAt: number;
}

export interface Task {
  id: UUID;
  projectId: UUID | null;
  title: string;
  status: TaskStatus;
  order: number;
  createdAt: number;
  updatedAt: number;
}

export type WritingStatus = 'idea' | 'outline' | 'draft' | 'editing' | 'review' | 'published';

export interface Draft {
  id: UUID;
  title: string;
  content: string;
  status: WritingStatus;
  createdAt: number;
  updatedAt: number;
}

export interface Node {
  id: UUID;
  label: string;
  type: 'note' | 'book' | 'author' | 'concept';
}

export interface Edge {
  id: UUID;
  source: UUID;
  target: UUID;
  label?: string;
}


export interface Deck {
  id: UUID;
  name: string;
  description: string;
  noteId?: UUID | null; // Review flashcards wajib berbasis note
  createdAt: number;
  updatedAt: number;
}

export interface Flashcard {
  id: UUID;
  front: string;
  back: string;
  deckId: UUID | null;
  noteId?: UUID | null; // Flashcards wajib berbasis note
  interval: number;
  repetition: number;
  efactor: number;
  dueDate: number;
  createdAt: number;
  updatedAt: number;
}

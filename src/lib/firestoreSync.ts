import { doc, setDoc, updateDoc, deleteDoc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { Note, Draft, Project, Book } from '../types';
import { useNotesStore } from '../store/notesStore';
import { useWritingStore } from '../store/writingStore';
import { useProjectsStore } from '../store/projectsStore';
import { useLibraryStore } from '../store/libraryStore';

// Firestore Sync Helper for Offline-First with Cloud Sync
export function initFirestoreSync() {
  let unsubscribeNotes: (() => void) | null = null;
  let unsubscribeDrafts: (() => void) | null = null;
  let unsubscribeProjects: (() => void) | null = null;
  let unsubscribeBooks: (() => void) | null = null;

  auth.onAuthStateChanged((user) => {
    // Unsubscribe previous listeners
    if (unsubscribeNotes) unsubscribeNotes();
    if (unsubscribeDrafts) unsubscribeDrafts();
    if (unsubscribeProjects) unsubscribeProjects();
    if (unsubscribeBooks) unsubscribeBooks();

    if (!user) return;

    // Sync Notes
    const notesQuery = query(collection(db, 'notes'), where('userId', '==', user.uid));
    unsubscribeNotes = onSnapshot(
      notesQuery,
      (snapshot) => {
        const cloudNotes: Note[] = [];
        snapshot.forEach((docSnap) => {
          cloudNotes.push(docSnap.data() as Note);
        });
        if (cloudNotes.length > 0) {
          useNotesStore.setState((state) => {
            const mergedMap = new Map<string, Note>();
            state.notes.forEach((n) => mergedMap.set(n.id, n));
            cloudNotes.forEach((n) => mergedMap.set(n.id, n));
            return { notes: Array.from(mergedMap.values()) };
          });
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'notes')
    );

    // Sync Drafts
    const draftsQuery = query(collection(db, 'drafts'), where('userId', '==', user.uid));
    unsubscribeDrafts = onSnapshot(
      draftsQuery,
      (snapshot) => {
        const cloudDrafts: Draft[] = [];
        snapshot.forEach((docSnap) => {
          cloudDrafts.push(docSnap.data() as Draft);
        });
        if (cloudDrafts.length > 0) {
          useWritingStore.setState((state) => {
            const mergedMap = new Map<string, Draft>();
            state.drafts.forEach((d) => mergedMap.set(d.id, d));
            cloudDrafts.forEach((d) => mergedMap.set(d.id, d));
            return { drafts: Array.from(mergedMap.values()) };
          });
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'drafts')
    );

    // Sync Projects
    const projectsQuery = query(collection(db, 'projects'), where('userId', '==', user.uid));
    unsubscribeProjects = onSnapshot(
      projectsQuery,
      (snapshot) => {
        const cloudProjects: Project[] = [];
        snapshot.forEach((docSnap) => {
          cloudProjects.push(docSnap.data() as Project);
        });
        if (cloudProjects.length > 0) {
          useProjectsStore.setState((state) => {
            const mergedMap = new Map<string, Project>();
            state.projects.forEach((p) => mergedMap.set(p.id, p));
            cloudProjects.forEach((p) => mergedMap.set(p.id, p));
            return { projects: Array.from(mergedMap.values()) };
          });
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'projects')
    );

    // Sync Books
    const booksQuery = query(collection(db, 'books'), where('userId', '==', user.uid));
    unsubscribeBooks = onSnapshot(
      booksQuery,
      (snapshot) => {
        const cloudBooks: Book[] = [];
        snapshot.forEach((docSnap) => {
          cloudBooks.push(docSnap.data() as Book);
        });
        if (cloudBooks.length > 0) {
          useLibraryStore.setState((state) => {
            const mergedMap = new Map<string, Book>();
            state.books.forEach((b) => mergedMap.set(b.id, b));
            cloudBooks.forEach((b) => mergedMap.set(b.id, b));
            return { books: Array.from(mergedMap.values()) };
          });
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'books')
    );
  });
}

// Firestore Writer Operations (called alongside local state updates)
export async function syncSaveNote(note: Note) {
  const user = auth.currentUser;
  if (!user) return;
  const path = `notes/${note.id}`;
  try {
    await setDoc(doc(db, 'notes', note.id), { ...note, userId: user.uid });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function syncDeleteNote(noteId: string) {
  const user = auth.currentUser;
  if (!user) return;
  const path = `notes/${noteId}`;
  try {
    await deleteDoc(doc(db, 'notes', noteId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function syncSaveDraft(draft: Draft) {
  const user = auth.currentUser;
  if (!user) return;
  const path = `drafts/${draft.id}`;
  try {
    await setDoc(doc(db, 'drafts', draft.id), { ...draft, userId: user.uid });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function syncDeleteDraft(draftId: string) {
  const user = auth.currentUser;
  if (!user) return;
  const path = `drafts/${draftId}`;
  try {
    await deleteDoc(doc(db, 'drafts', draftId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function syncSaveProject(project: Project) {
  const user = auth.currentUser;
  if (!user) return;
  const path = `projects/${project.id}`;
  try {
    await setDoc(doc(db, 'projects', project.id), { ...project, userId: user.uid });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function syncDeleteProject(projectId: string) {
  const user = auth.currentUser;
  if (!user) return;
  const path = `projects/${projectId}`;
  try {
    await deleteDoc(doc(db, 'projects', projectId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function syncSaveBook(book: Book) {
  const user = auth.currentUser;
  if (!user) return;
  const path = `books/${book.id}`;
  try {
    await setDoc(doc(db, 'books', book.id), { ...book, userId: user.uid });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function syncDeleteBook(bookId: string) {
  const user = auth.currentUser;
  if (!user) return;
  const path = `books/${bookId}`;
  try {
    await deleteDoc(doc(db, 'books', bookId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

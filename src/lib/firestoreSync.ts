import { doc, setDoc, deleteDoc, onSnapshot, collection, query, where, runTransaction } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { Note, Draft, Project, Book, SyncMetadata } from '../types';
import { useNotesStore } from '../store/notesStore';
import { useWritingStore } from '../store/writingStore';
import { useProjectsStore } from '../store/projectsStore';
import { useLibraryStore } from '../store/libraryStore';

function mergeCloudData<T extends { id: string } & SyncMetadata>(
  localItems: T[],
  cloudItems: T[]
): T[] {
  const mergedMap = new Map<string, T>();
  localItems.forEach((n) => mergedMap.set(n.id, n));
  
  cloudItems.forEach((remoteItem) => {
    const localItem = mergedMap.get(remoteItem.id);
    if (!localItem) {
      mergedMap.set(remoteItem.id, remoteItem);
    } else {
      if (localItem.syncStatus === 'pending_sync' || localItem.syncStatus === 'conflict') {
        if (remoteItem.revision > localItem.revision) {
           mergedMap.set(remoteItem.id, {
             ...localItem,
             syncStatus: 'conflict',
             conflict: {
               detectedAt: Date.now(),
               localRevision: localItem.revision,
               remoteRevision: remoteItem.revision,
               remoteData: remoteItem,
               reason: 'concurrent_edit'
             }
           });
        }
      } else if (remoteItem.revision > localItem.revision) {
         mergedMap.set(remoteItem.id, remoteItem);
      } else if (remoteItem.revision === localItem.revision && localItem.syncStatus !== 'synced') {
         mergedMap.set(remoteItem.id, { ...localItem, syncStatus: 'synced' });
      }
    }
  });
  return Array.from(mergedMap.values());
}

export function initFirestoreSync() {
  let unsubscribeNotes: (() => void) | null = null;
  let unsubscribeDrafts: (() => void) | null = null;
  let unsubscribeProjects: (() => void) | null = null;
  let unsubscribeBooks: (() => void) | null = null;

  auth.onAuthStateChanged((user) => {
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
        snapshot.forEach((docSnap) => cloudNotes.push(docSnap.data() as Note));
        if (cloudNotes.length > 0) {
          useNotesStore.setState((state) => ({
            notes: mergeCloudData(state.notes, cloudNotes)
          }));
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
        snapshot.forEach((docSnap) => cloudDrafts.push(docSnap.data() as Draft));
        if (cloudDrafts.length > 0) {
          useWritingStore.setState((state) => ({
            drafts: mergeCloudData(state.drafts, cloudDrafts)
          }));
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
        snapshot.forEach((docSnap) => cloudProjects.push(docSnap.data() as Project));
        if (cloudProjects.length > 0) {
          useProjectsStore.setState((state) => ({
            projects: mergeCloudData(state.projects, cloudProjects)
          }));
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
        snapshot.forEach((docSnap) => cloudBooks.push(docSnap.data() as Book));
        if (cloudBooks.length > 0) {
          useLibraryStore.setState((state) => ({
            books: mergeCloudData(state.books, cloudBooks)
          }));
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'books')
    );
  });
}

// Transaction helper for OCC
async function syncWithOCC<T extends { id: string } & SyncMetadata>(
  collectionName: string,
  item: T,
  setStateCallback: (id: string, updates: Partial<T>) => void
) {
  const user = auth.currentUser;
  if (!user) return;
  const path = `${collectionName}/${item.id}`;
  
  try {
    await runTransaction(db, async (transaction) => {
      const docRef = doc(db, collectionName, item.id);
      const docSnap = await transaction.get(docRef);
      if (docSnap.exists()) {
        const cloudData = docSnap.data() as T;
        if (cloudData.revision >= item.revision && cloudData.revision > 0) {
           setStateCallback(item.id, {
             syncStatus: 'conflict',
             conflict: {
               detectedAt: Date.now(),
               localRevision: item.revision,
               remoteRevision: cloudData.revision,
               remoteData: cloudData,
               reason: 'concurrent_edit'
             }
           } as Partial<T>);
           throw new Error('Conflict detected');
        }
      }
      transaction.set(docRef, { ...item, syncStatus: 'synced', userId: user.uid });
    });
    
    setStateCallback(item.id, { syncStatus: 'synced' } as Partial<T>);
  } catch (err) {
    if (err instanceof Error && err.message === 'Conflict detected') return;
    setStateCallback(item.id, { syncStatus: 'failed' } as Partial<T>);
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function syncSaveNote(note: Note) {
  await syncWithOCC('notes', note, (id, updates) => {
    useNotesStore.setState(state => ({
      notes: state.notes.map(n => n.id === id ? { ...n, ...updates } : n)
    }));
  });
}

export async function syncDeleteNote(noteId: string) {
  const user = auth.currentUser;
  if (!user) return;
  try {
    await deleteDoc(doc(db, 'notes', noteId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `notes/${noteId}`);
  }
}

export async function syncSaveDraft(draft: Draft) {
  await syncWithOCC('drafts', draft, (id, updates) => {
    useWritingStore.setState(state => ({
      drafts: state.drafts.map(d => d.id === id ? { ...d, ...updates } : d)
    }));
  });
}

export async function syncDeleteDraft(draftId: string) {
  const user = auth.currentUser;
  if (!user) return;
  try {
    await deleteDoc(doc(db, 'drafts', draftId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `drafts/${draftId}`);
  }
}

export async function syncSaveProject(project: Project) {
  await syncWithOCC('projects', project, (id, updates) => {
    useProjectsStore.setState(state => ({
      projects: state.projects.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  });
}

export async function syncDeleteProject(projectId: string) {
  const user = auth.currentUser;
  if (!user) return;
  try {
    await deleteDoc(doc(db, 'projects', projectId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `projects/${projectId}`);
  }
}

export async function syncSaveBook(book: Book) {
  await syncWithOCC('books', book, (id, updates) => {
    useLibraryStore.setState(state => ({
      books: state.books.map(b => b.id === id ? { ...b, ...updates } : b)
    }));
  });
}

export async function syncDeleteBook(bookId: string) {
  const user = auth.currentUser;
  if (!user) return;
  try {
    await deleteDoc(doc(db, 'books', bookId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `books/${bookId}`);
  }
}

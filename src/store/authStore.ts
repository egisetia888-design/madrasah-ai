import { create } from 'zustand';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  login: () => void;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: localStorage.getItem("madrasah_auth") !== "false",
  user: null,
  login: () => {
    localStorage.setItem("madrasah_auth", "true");
    set({ isAuthenticated: true });
  },
  loginWithGoogle: async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      localStorage.setItem("madrasah_auth", "true");
      set({ isAuthenticated: true, user: result.user });
    } catch (error) {
      console.error("Google sign-in error:", error);
      // Fallback local login if offline or popup blocked
      localStorage.setItem("madrasah_auth", "true");
      set({ isAuthenticated: true });
    }
  },
  logout: async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Sign out error", e);
    }
    localStorage.setItem("madrasah_auth", "false");
    set({ isAuthenticated: false, user: null });
  },
  setUser: (user) => {
    set({ user, isAuthenticated: !!user || localStorage.getItem("madrasah_auth") !== "false" });
  }
}));

// Synchronize Firebase auth listener
onAuthStateChanged(auth, (firebaseUser) => {
  if (firebaseUser) {
    localStorage.setItem("madrasah_auth", "true");
    useAuthStore.getState().setUser(firebaseUser);
  }
});


import { create } from 'zustand';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

interface AuthState {
  hasCompletedOnboarding: boolean;
  isCloudAuthenticated: boolean;
  user: User | null;
  login: () => void;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  hasCompletedOnboarding: localStorage.getItem("madrasah_auth") !== "false",
  isCloudAuthenticated: false,
  user: null,
  login: () => {
    localStorage.setItem("madrasah_auth", "true");
    set({ hasCompletedOnboarding: true });
  },
  loginWithGoogle: async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      localStorage.setItem("madrasah_auth", "true");
      set({ hasCompletedOnboarding: true, isCloudAuthenticated: true, user: result.user });
    } catch (error) {
      console.error("Google sign-in error:", error);
      // Fallback local login if offline or popup blocked
      localStorage.setItem("madrasah_auth", "true");
      set({ hasCompletedOnboarding: true });
    }
  },
  logout: async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Sign out error", e);
    }
    localStorage.setItem("madrasah_auth", "false");
    set({ hasCompletedOnboarding: false, isCloudAuthenticated: false, user: null });
  },
  setUser: (user) => {
    set({
      user,
      hasCompletedOnboarding: !!user || localStorage.getItem("madrasah_auth") !== "false",
      isCloudAuthenticated: !!user
    });
  }
}));

// Synchronize Firebase auth listener
onAuthStateChanged(auth, (firebaseUser) => {
  if (firebaseUser) {
    localStorage.setItem("madrasah_auth", "true");
    useAuthStore.getState().setUser(firebaseUser);
  } else {
    // We only update isCloudAuthenticated to false here if no user, leaving hasCompletedOnboarding as is
    useAuthStore.getState().setUser(null);
  }
});


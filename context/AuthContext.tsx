"use client";

import {
  createUserWithEmailAndPassword,
  onIdTokenChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { logoutUser, syncUser } from "@/actions/auth";
import { auth, googleProvider } from "@/lib/firebase";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Sign-in flows own session creation while they run, so the background listener
// stays out of their way. `lastSyncedToken` stops the same token being exchanged twice.
let manualSignIns = 0;
let lastSyncedToken: string | null = null;

function requireAuth() {
  if (!auth) throw new Error("Firebase is not configured.");
  return auth;
}

/** Exchanges the Firebase ID token for the server session cookie. Throws with a readable message on failure. */
async function establishSession(firebaseUser: User, forceRefresh = false) {
  const token = await firebaseUser.getIdToken(forceRefresh);
  if (token === lastSyncedToken) return;
  const result = await syncUser(token);
  if (!result.ok) throw new Error(result.error);
  lastSyncedToken = token;
}

/**
 * Runs a sign-in and waits until the session cookie exists before resolving, so a
 * caller that navigates straight afterwards cannot reach middleware without it.
 */
async function signInManually(signIn: () => Promise<User>, forceRefresh = false) {
  manualSignIns += 1;
  try {
    await establishSession(await signIn(), forceRefresh);
  } finally {
    manualSignIns -= 1;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => auth !== null);

  useEffect(() => {
    if (!auth) {
      return;
    }

    return onIdTokenChanged(auth, async (firebaseUser) => {
      try {
        setUser(firebaseUser);
        if (!firebaseUser) {
          lastSyncedToken = null;
          await logoutUser();
        } else if (manualSignIns === 0) {
          await establishSession(firebaseUser);
        }
      } catch (error) {
        console.error("Unable to sync session", error);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    signInWithGoogle: async () => {
      const firebaseAuth = requireAuth();
      await signInManually(async () => (await signInWithPopup(firebaseAuth, googleProvider)).user);
    },
    signInWithEmail: async (email, password) => {
      const firebaseAuth = requireAuth();
      await signInManually(async () => (await signInWithEmailAndPassword(firebaseAuth, email, password)).user);
    },
    signUpWithEmail: async (name, email, password) => {
      const firebaseAuth = requireAuth();
      // Force a token refresh so the new displayName claim is in the token we exchange.
      await signInManually(async () => {
        const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
        await updateProfile(credential.user, { displayName: name });
        return credential.user;
      }, true);
    },
    logout: async () => {
      if (auth) await signOut(auth);
      lastSyncedToken = null;
      await logoutUser();
      setUser(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}

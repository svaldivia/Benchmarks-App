import { auth } from "@/data/firebase/firebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type AuthState = {
  user: User | null;
  initializing: boolean;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Single subscription for the app. The first invocation resolves the
    // persisted session (readiness); subsequent ones keep `user` live across
    // login/logout.
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  const value = useMemo(() => ({ user, initializing }), [user, initializing]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

/**
 * The signed-in user's uid, for screens that cannot render without one.
 * Safe inside `Stack.Protected guard={!!user}` (see app/_layout.tsx), which is
 * where every data-reading screen lives — so the throw is a wiring bug, not a
 * state a user can reach by signing out.
 */
export function useUserId(): string {
  const { user } = useAuth();
  if (!user) {
    throw new Error("useUserId requires a signed-in user");
  }
  return user.uid;
}

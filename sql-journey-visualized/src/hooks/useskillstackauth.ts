import { useEffect, useState } from "react";
import { type User, onAuthStateChanged } from "firebase/auth";
import { firebaseAuth, isAdminEmail } from "@/integrations/firebase/client";

interface SkillStackAuthState {
  loading: boolean;
  user: User | null;
  isAdmin: boolean;
}

export function useSkillStackAuth(): SkillStackAuthState {
  const [state, setState] = useState<SkillStackAuthState>({
    loading: true,
    user: null,
    isAdmin: false,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      setState({
        loading: false,
        user,
        isAdmin: isAdminEmail(user?.email),
      });
    });

    return unsubscribe;
  }, []);

  return state;
}

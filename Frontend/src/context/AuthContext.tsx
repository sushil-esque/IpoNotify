import useAuth from "@/hooks/useAuth";
import type { User } from "@/types/user";
import {
  createContext,
  useContext,
  useEffect,
  type PropsWithChildren,
} from "react";

interface Auth {
  user: User | null | undefined;
  isLoading: boolean;
  isLoggedIn: boolean;
}
const AuthContext = createContext<Auth | null>(null);

function AuthProvider({ children }: PropsWithChildren) {
  const { user, isLoading, isLoggedIn } = useAuth();

  useEffect(() => {
    if (user) {
      sessionStorage.setItem("isLoggedIn", "true");
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isLoading, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => {
  const authContext = useContext(AuthContext);
  if (authContext === null)
    throw new Error(
      "useAuthContext has to be used within the <AuthContext.Provider/>",
    );
  return authContext;
};

export default AuthProvider;

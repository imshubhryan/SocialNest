import { createContext, useState} from "react";
import { register } from "./services/auth.api";
import { login} from "./services/auth.api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, setLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

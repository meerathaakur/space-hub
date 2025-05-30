import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shouldNavigate, setShouldNavigate] = useState(false);
  const [navigationPath, setNavigationPath] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check for user in localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (shouldNavigate && navigationPath) {
      navigate(navigationPath);
      setShouldNavigate(false);
      setNavigationPath("");
    }
  }, [shouldNavigate, navigationPath, navigate]);

  const login = async (email, password) => {
    try {
      // TODO: Replace with actual API call
      const mockUser = {
        id: "1",
        email,
        name: "John Doe",
      };
      setUser(mockUser);
      localStorage.setItem("user", JSON.stringify(mockUser));
      setNavigationPath("/dashboard");
      setShouldNavigate(true);
    } catch (error) {
      throw new Error("Invalid credentials");
    }
  };

  const register = async (name, email, password) => {
    try {
      // TODO: Replace with actual API call
      const mockUser = {
        id: "1",
        name,
        email,
      };
      setUser(mockUser);
      localStorage.setItem("user", JSON.stringify(mockUser));
      setNavigationPath("/dashboard");
      setShouldNavigate(true);
    } catch (error) {
      throw new Error("Registration failed");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    setNavigationPath("/login");
    setShouldNavigate(true);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 
import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "sonner";

// 默认密码 (实际应用中应该更安全地存储)
const DEFAULT_PASSWORD = "123456";
const ADMIN_PASSWORD = "admin123";

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  setIsAuthenticated: (value: boolean) => void;
  setIsAdmin: (value: boolean) => void;
  logout: () => void;
  login: (password: string, isAdminLogin: boolean) => boolean;
  changePassword: (currentPassword: string, newPassword: string) => boolean;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isAdmin: false,
  setIsAuthenticated: () => {},
  setIsAdmin: () => {},
  logout: () => {},
  login: () => false,
  changePassword: () => false,
});

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): React.ReactElement {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // 从localStorage恢复认证状态
  useEffect(() => {
    const savedAuth = localStorage.getItem('auth');
    if (savedAuth) {
      const { isAuthenticated: savedIsAuthenticated, isAdmin: savedIsAdmin } = JSON.parse(savedAuth);
      setIsAuthenticated(savedIsAuthenticated);
      setIsAdmin(savedIsAdmin);
    }
  }, []);
  
  // 保存认证状态到localStorage
  useEffect(() => {
    localStorage.setItem('auth', JSON.stringify({ isAuthenticated, isAdmin }));
  }, [isAuthenticated, isAdmin]);
  
  const logout = (): void => {
    setIsAuthenticated(false);
    setIsAdmin(false);
    toast('已成功登出');
  };
  
  const login = (password: string, isAdminLogin: boolean = false): boolean => {
    const storedPassword = isAdminLogin 
      ? localStorage.getItem('adminPassword') || ADMIN_PASSWORD
      : localStorage.getItem('frontendPassword') || DEFAULT_PASSWORD;
      
    if (password === storedPassword) {
      setIsAuthenticated(true);
      setIsAdmin(isAdminLogin);
      toast(`成功${isAdminLogin ? '以管理员身份' : ''}登录`);
      return true;
    } else {
      toast('密码错误，请重试', { type: 'error' });
      return false;
    }
  };
  
  const changePassword = (currentPassword: string, newPassword: string): boolean => {
    const storedPassword = localStorage.getItem('frontendPassword') || DEFAULT_PASSWORD;
    
    if (currentPassword === storedPassword) {
      localStorage.setItem('frontendPassword', newPassword);
      toast('密码已成功修改');
      return true;
    } else {
      toast('当前密码错误', { type: 'error' });
      return false;
    }
  };
  
  return React.createElement(
    AuthContext.Provider,
    {
      value: {
        isAuthenticated,
        isAdmin,
        setIsAuthenticated,
        setIsAdmin,
        logout,
        login,
        changePassword,
      },
    },
    children
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
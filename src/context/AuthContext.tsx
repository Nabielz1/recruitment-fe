import { createContext, useState, useEffect, type ReactNode, useCallback, useRef } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Set durasi timeout (1 jam dalam milidetik)
const INACTIVITY_TIMEOUT = 15 * 60 * 1000;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Ubah tipe data di sini dari NodeJS.Timeout menjadi number
  const timeoutId = useRef<number | null>(null);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('sessionExpiry');
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
  }, []);

  const resetSessionTimeout = useCallback(() => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
    
    const expiryTime = Date.now() + INACTIVITY_TIMEOUT;
    localStorage.setItem('sessionExpiry', expiryTime.toString());
    
    // setTimeout di browser mengembalikan number
    timeoutId.current = window.setTimeout(() => {
      logout();
    }, INACTIVITY_TIMEOUT);
  }, [logout]);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    const sessionExpiry = localStorage.getItem('sessionExpiry');

    if (storedToken && storedUser && sessionExpiry && Date.now() < parseInt(sessionExpiry, 10)) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      resetSessionTimeout(); // Atur ulang timer saat aplikasi dimuat
    } else {
      logout(); // Logout jika token/user tidak ada atau sesi telah berakhir
    }
    setLoading(false);
  }, [logout, resetSessionTimeout]);
  
  // Tambahkan event listener untuk mereset timer pada aktivitas pengguna
  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];

    if (token) {
      // Tambahkan event listener saat pengguna login
      events.forEach(event => window.addEventListener(event, resetSessionTimeout));
    }
    
    // Hapus event listener saat komponen unmount atau pengguna logout
    return () => {
      events.forEach(event => window.removeEventListener(event, resetSessionTimeout));
    };
  }, [token, resetSessionTimeout]);


  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    resetSessionTimeout(); // Mulai timer saat login
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
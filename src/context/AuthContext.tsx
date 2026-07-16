import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { AuthState, AuthAction, AuthUser } from '../types/auth';
import { deleteAuthItem, getAuthItem, setAuthItem } from '../utils/authStorage';

const TOKEN_KEY = 'vistaro_token';
const USER_KEY = 'vistaro_user';

// ─── Reducer ──────────────────────────────────────────────────────────────────
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'RESTORE_TOKEN':
      return { ...state, token: action.token, user: action.user, isLoading: false };
    case 'LOGIN':
      return { ...state, token: action.token, user: action.user, isLoading: false };
    case 'LOGOUT':
      return { token: null, user: null, isLoading: false };
    default:
      return state;
  }
}

// ─── Context types ────────────────────────────────────────────────────────────
interface AuthContextValue {
  state: AuthState;
  login: (token: string, user: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    token: null,
    user: null,
    isLoading: true,
  });

  // Restore session on app launch
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const token = await getAuthItem(TOKEN_KEY);
        const userJson = await getAuthItem(USER_KEY);
        const user: AuthUser | null = userJson ? JSON.parse(userJson) : null;
        dispatch({ type: 'RESTORE_TOKEN', token, user });
      } catch {
        dispatch({ type: 'RESTORE_TOKEN', token: null, user: null });
      }
    };
    bootstrap();
  }, []);

  const login = useCallback(async (token: string, user: AuthUser) => {
    await setAuthItem(TOKEN_KEY, token);
    await setAuthItem(USER_KEY, JSON.stringify(user));
    dispatch({ type: 'LOGIN', token, user });
  }, []);

  const logout = useCallback(async () => {
    await deleteAuthItem(TOKEN_KEY);
    await deleteAuthItem(USER_KEY);
    dispatch({ type: 'LOGOUT' });
  }, []);

  return (
    <AuthContext.Provider value={{ state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { login as authLogin, registerCustomer as authRegister, getCustomerProfileByEmail } from '../services/auth';
import type { UserProfile } from '../services/auth';

interface AuthContextType {
    user: UserProfile | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<void>;
    register: (email: string, firstName: string, lastName: string, password?: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Inicializar context com base no localStorage
        const storedToken = localStorage.getItem('wc_auth_token');
        const storedUser = localStorage.getItem('wc_auth_user');

        if (storedToken && storedUser) {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Erro ao fazer parse do utilizador:", e);
                localStorage.removeItem('wc_auth_token');
                localStorage.removeItem('wc_auth_user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (username: string, password: string) => {
        try {
            const response = await authLogin(username, password);
            const userProfile = await getCustomerProfileByEmail(response.user_email);

            if (userProfile) {
                // Guarda sessão
                setToken(response.token);
                setUser(userProfile);
                localStorage.setItem('wc_auth_token', response.token);
                localStorage.setItem('wc_auth_user', JSON.stringify(userProfile));
            } else {
                throw new Error("Perfil de cliente não encontrado.");
            }
        } catch (error) {
            throw error;
        }
    };

    const register = async (email: string, firstName: string, lastName: string, password?: string) => {
        try {
            const newCustomer = await authRegister(email, firstName, lastName, password);
            if (password) {
                // Se mandou senha, tenta fazer login imediato
                try {
                    await login(email, password);
                } catch (loginError: any) {
                    console.warn("Registo criado, mas login automático falhou:", loginError.message);
                    // Como a API acabou de criar o user (garantindo auth), criamos uma sessão local 
                    // previne que o utilizador fique encravado caso não exista plugin JWT no servidor.
                    const dummyToken = `headless_session_${Date.now()}`;
                    setToken(dummyToken);
                    setUser(newCustomer);
                    localStorage.setItem('wc_auth_token', dummyToken);
                    localStorage.setItem('wc_auth_user', JSON.stringify(newCustomer));
                }
            } else {
                // Se for guest registration (ex checkout sem senha dependendo da spec), carrega perfil localmente
                setUser(newCustomer);
                // não guarda token pois não houve auth formal
                localStorage.setItem('wc_auth_user', JSON.stringify(newCustomer));
            }
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('wc_auth_token');
        localStorage.removeItem('wc_auth_user');
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            isAuthenticated: !!token && !!user,
            login,
            register,
            logout,
            isLoading
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
}

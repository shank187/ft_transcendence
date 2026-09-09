import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import api,{
    setAccessToken as setAxiosAccessToken,
    subscribeToTokenChanges,
    bootstrapSession,
} from './axiosInstance';

type AuthContextType = {
    accessToken: string | null;
    isLoading: boolean;
    setAccessToken: (token: string | null) => void;
    logout: () => Promise<void>;
};

type auth_provider_props = {
    children: ReactNode;
};




const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: auth_provider_props)
{
    const [accessToken, setAccessTokenState] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    function setAccessToken(token: string | null)
    {

        setAxiosAccessToken(token);
    }
    async function logout()
    {
        try {
            
            await api.post('/api/auth/logout');
        } catch (error) {
            console.error('Logout request failed:', error);
        } finally {
            setAxiosAccessToken(null);
        }
    }

    useEffect(() => {
        const unsubscribe = subscribeToTokenChanges(setAccessTokenState);

        bootstrapSession().finally(() => setIsLoading(false));

        return unsubscribe;
    }, []);

    if (isLoading) {
        return <div>Loading session...</div>;
    }

    return (
        <AuthContext.Provider value={{ accessToken, isLoading, setAccessToken , logout}}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth()
{
    const context = useContext(AuthContext);
    if (!context)
        throw new Error("useAuth must be used inside an AuthProvider");
    return context;
}
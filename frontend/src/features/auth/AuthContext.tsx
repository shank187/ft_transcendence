import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import api, {
    setAccessToken as setAxiosAccessToken,
    refreshAccessToken,
} from "./axiosInstance";

type AuthContextType = {
    accessToken: string | null;
    setAccessToken: (token: string | null) => void;

    user: User | null;
    setUser: (user: User | null) => void;

    logout: () => Promise<void>;
};


type User = {
    id: string;
    username: string;
    email: string;
    displayName: string | null;
    avatarUrl: string | null;
    onboardingCompletedAt: string | null;
};


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode })
{
    const [accessToken, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);


    function setAccessToken(token: string | null)
    {
        setToken(token);
        setAxiosAccessToken(token);
    }

    async function logout() {
        await api.post("/api/auth/logout");

        setAccessToken(null);
        setUser(null);
    }
    useEffect(() => {
    refreshAccessToken()
        .then(async(token) => {
            setAccessToken(token);

            const response = await api.get('/api/users/me');
            setUser(response.data);
        })
        .catch(() => {
            setAccessToken(null);
            setUser(null);
        })
        .finally(() => setLoading(false));
}, []);

    if (loading)
        return <div>Loading...</div>;

    return (
        <AuthContext.Provider value={{accessToken, setAccessToken, user, setUser, logout}} >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context)
        throw new Error("useAuth must be used inside AuthProvider");

    return context;
}
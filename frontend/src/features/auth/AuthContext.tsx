import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import api, {
    setAccessToken as setAxiosAccessToken,
    refreshAccessToken,
} from "./axiosInstance";

type AuthContextType = {
    accessToken: string | null;
    setAccessToken: (token: string | null) => void;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [accessToken, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    function setAccessToken(token: string | null) {
        setToken(token);
        setAxiosAccessToken(token);
    }

    async function logout() {
        await api.post("/api/auth/logout");

        setAccessToken(null);
    }
    useEffect(() => {
        refreshAccessToken()
        .then((token) => setAccessToken(token))
        .catch(() => setAccessToken(null))
        .finally(() => setLoading(false));
        console.log("token refreshed in the app start");
    }, []);

    if (loading)
        return <div>Loading...</div>;

    return (
        <AuthContext.Provider
            value={{ accessToken, setAccessToken, logout }}
        >
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
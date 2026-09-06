import React, { createContext, useContext, useState, ReactNode } from 'react';
import { setAccessToken as setAxiosAccessToken } from './axiosInstance';

type AuthContextType = {
    accessToken: string | null;
    setAccessToken: (token: string | null) => void;
};

type auth_provider_props = {
    children: ReactNode;
};




const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: auth_provider_props)
{
    const [accessToken, setAccessTokenState] = useState<string | null>(null);

    function setAccessToken(token: string | null)
    {
        setAccessTokenState(token);
        setAxiosAccessToken(token);
    }

    return (
        <AuthContext.Provider value={{ accessToken, setAccessToken }}>
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
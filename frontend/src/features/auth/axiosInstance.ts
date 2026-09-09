import axios from 'axios';

const API_URL = 'http://localhost:3000';

let accessToken: string | null = null;


type TokenListener = (token: string | null) => void;
let tokenListener: TokenListener | null = null;


export function setAccessToken(token: string | null)
{
    accessToken = token;
    
    if (tokenListener !== null)
        tokenListener(token);
}

export function getAccessToken()
{
    return accessToken;
}

export function subscribeToTokenChanges(listener: (token: string | null) => void)
{
    tokenListener = listener;

    
    return () => {
        if (tokenListener === listener)
            tokenListener = null;
    };
}

async function requestNewAccessToken(): Promise<string> {
    const response = await axios.post(
        `${API_URL}/api/auth/refresh`,
        {},
        { withCredentials: true }
    );
    return response.data.accessToken;
}

export async function bootstrapSession(): Promise<string | null> {
    try {
        const newAccessToken = await requestNewAccessToken();
        setAccessToken(newAccessToken);
        return newAccessToken;
    } catch {
        setAccessToken(null);
        return null;
    }
}

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
 
        if (error.response && error.response.status === 401 && !originalRequest._retry)
        {
            originalRequest._retry = true;
 
            try {
                const newAccessToken = await requestNewAccessToken();
                setAccessToken(newAccessToken);
 
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);
 
            } catch (refreshError) {
                setAccessToken(null);
                console.error("Refresh failed, user needs to log in again:", refreshError);
                return Promise.reject(refreshError);
            }
        }
 
        return Promise.reject(error);
    }
);
 
export default api;
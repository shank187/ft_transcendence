import axios from "axios";

const API_URL = "http://localhost:3000";

let accessToken: string | null = null;

let refreshPromise: Promise<string> | null = null;

export function setAccessToken(token: string | null) {
    accessToken = token;
}


export async function hasSession(): Promise<boolean> {
    const response = await axios.get(
        `${API_URL}/api/auth/session`,
        {
            withCredentials: true
        }
    );

    return response.data.authenticated;
}


export function refreshAccessToken(): Promise<string>
{
    if (refreshPromise)
        return refreshPromise;

    refreshPromise = axios.post(
        `${API_URL}/api/auth/refresh`,
        {},
        { withCredentials: true } // i keep this here because i did use default axios not my configured api  
    )
    .then((response) => {
        accessToken = response.data.access_token;
        return response.data.access_token;
    })
    .finally(() => {
        refreshPromise = null;
    });

    return refreshPromise;
}

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});


api.interceptors.request.use((config) => {
    if (accessToken)
        config.headers.Authorization = `Bearer ${accessToken}`;

    return config;
});

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const request = error.config;

        if (error.response && error.response.status === 401 && !request._retry) {
            request._retry = true;

            try {
                const token = await refreshAccessToken();

                request.headers.Authorization = `Bearer ${token}`;

                return api(request);
            } catch {
                accessToken = null;
                window.location.href = "/login";

                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
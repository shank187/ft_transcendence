export const refreshCookieName = 'refreshToken';

export const refreshCookieOptions = {
    httpOnly: true,
    sameSite: 'strict' as const,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
};


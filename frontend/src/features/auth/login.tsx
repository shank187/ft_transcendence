import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './axiosInstance';
import { useAuth } from './AuthContext';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const { setAccessToken } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        setErrorMessage('');

        try {
            const response = await api.post('/auth/login', {
                email: email,
                password: password,
            });

            const token = response.data.accessToken;
            setAccessToken(token);

            navigate('/home');

        } catch (error) {
            console.error("Login failed:", error);
            setErrorMessage("Invalid email or password");
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div>
                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            {errorMessage && <p>{errorMessage}</p>}

            <button type="submit">Log In</button>
        </form>
    );
}

export default Login;
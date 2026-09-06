import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './axiosInstance'; // adjust this path to wherever axiosInstance.ts actually lives
import { useAuth } from './AuthContext';

function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const { setAccessToken } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        setErrorMessage('');

        try {
 
            const response = await api.post('/auth/register', {
                username: username,
                email: email,
                password: password,
            });

            const token = response.data.accessToken;
            setAccessToken(token);

            navigate('/onboarding');

        } catch (error) {
            console.error("Registration failed:", error);
            setErrorMessage("Could not create account. Try a different username or email.");
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="username">Username</label>
                <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>

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

            <button type="submit">Create Account</button>
        </form>
    );
}

export default Register;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../features/auth/axiosInstance';
import { useAuth } from '../features/auth/AuthContext';

import Form_input from "../components/ui/Form_input";

import Button from "../components/ui/Button";
import Or_divider from "../components/ui/Or_divider";

function Register() {
    const [username, set_username] = useState('');
    const [email,set_email] = useState('');
    const [password,set_password] = useState('');
    const [err_msg,set_err_msg] = useState('');

    const { setAccessToken , setUser} = useAuth();
    const navigate = useNavigate();
    
    function handle_google_login()
    {
        window.location.href ='http://localhost:3000/api/auth/google';
    }


    async function handle_submit(event: React.FormEvent) {
        event.preventDefault();
        set_err_msg('');

        try {
 
            const response = await api.post('/api/auth/register', {username: username, email: email, password: password});

            if (!response.data.success)
            {
                set_err_msg(response.data.error);
                return;
            }

            const token = response.data.access_token;
            setAccessToken(token);

            navigate('/onboarding');

        } catch (error) {
            // console.error("Registration failed:", error);
            set_err_msg("Could not create account. Try a different username or email.");
        }
    }

    return (
        <div>
            <Button variant="secondary"  className="fixed right-8 top-6" onClick={() => navigate('/login')}>
                 Log in
            </Button>

            <div className="mx-auto w-full max-w-xl px-8 py-50">
                <h1 className="mb-6 text-lg font-semibold text-gray-900"> Create account</h1>

                <form className="space-y-5" onSubmit={handle_submit}>
                    <Form_input id="username" label="username" type="text" value={username} onChange={set_username}/>
                    <Form_input id="email" label="Email address" type="email" value={email} onChange={set_email}/>
                    <Form_input id="password" label="password" type="password" value={password} onChange={set_password}/>

                    {err_msg && <p>{err_msg}</p>}
                    
                    <Button type="submit" className="w-full">
                        Create account
                    </Button>
                    
                    <Or_divider />

                    <Button  variant="secondary" className="w-full" onClick={handle_google_login}>
                        Continue with Google
                    </Button>

                </form>

            </div>
        </div>
    );
}

export default Register;
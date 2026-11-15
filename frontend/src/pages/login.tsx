
import {useState} from 'react';
import api ,{API_URL}from '../features/auth/axiosInstance';
import axios from 'axios';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';

import Form_input from '../components/ui/Form_input';
import Button from '../components/ui/Button';
import Or_divider from '../components/ui/Or_divider';

function Login()
{
    const [email,set_email] = useState('');
    const [password,set_password] = useState('');
    const [err_msg,set_err_msg] = useState('');

    const { setAccessToken,setUser} = useAuth();
    const navigate = useNavigate();

    function handle_google_login()
    {
        window.location.href = `${API_URL}/api/auth/google`;
    }
    function navigate_to_register()
    {
        navigate('/register');
    }

    async function handle_submit(event: FormEvent<HTMLFormElement>)
    {
        event.preventDefault();
        set_err_msg('');
        
        try {
            const response = await api.post('/api/auth/login', {email: email, password: password});
            if (!response.data.success)
            {
                set_err_msg(response.data.message);
                return;
            }
                
            const { access_token, user } = response.data;

            setUser(user);
            setAccessToken(access_token);

            if (user.onboardingCompletedAt)
                navigate('/home', { replace: true });
            else
                navigate('/onboarding', { replace: true });

        } catch (error) {
            if (axios.isAxiosError(error))
                set_err_msg(error.response?.data?.message || "invalid email or password");
            else
                set_err_msg("invalid email or password");
        }
    }

    return (
    <div className="flex min-h-screen flex-col p-4">
        <div className="mb-6 flex justify-end">
            <Button variant="secondary" className="border border-app-border" onClick={navigate_to_register}>
                Register
            </Button>
        </div>
    <div className="m-auto w-full max-w-md rounded-xl border border-app-border p-6 [&_input]:py-3">
        <h1 className="mb-6 text-xl font-bold">
            Log in
        </h1>

        <form className="space-y-6" onSubmit={handle_submit}>
            <Form_input id="email" label="Email address" type="email" value={email} onChange={set_email}/>
            <Form_input id="password" label="Password" type="password" value={password} onChange={set_password}/>
            
            {err_msg && <p className="text-sm text-app-danger">{err_msg}</p>}

            <Button type="submit" className="w-full">
                Log in
            </Button>

            <Or_divider />

            <Button type="button" variant="secondary" className="w-full" onClick={handle_google_login}>
                Continue with Google
            </Button>


        </form>
    </div>
    </div>
);


}


export default Login;

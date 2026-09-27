
import {useState} from 'react';
import api from '../features/auth/axiosInstance';
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
        window.location.href = 'http://localhost:3000/api/auth/google';
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
                set_err_msg(response.data.error);
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
            set_err_msg("invalid email or password");
        }
    }

    return (
    <div>
        <Button variant="secondary" className="fixed right-8 top-6" onClick={navigate_to_register}>
            Register
        </Button>
    <div className="mx-auto w-full max-w-xl px-8 py-50">
        <h1 className="mb-6 text-lg font-semibold text-gray-900">
            Log in
        </h1>

        <form className="space-y-5" onSubmit={handle_submit}>
            <Form_input id="email" label="Email address" type="email" value={email} onChange={set_email}/>
            <Form_input id="password" label="Password" type="password" value={password} onChange={set_password}/>
            
            {err_msg && <p>{err_msg}</p>}

            <Button type="submit">
                Log in
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


export default Login;
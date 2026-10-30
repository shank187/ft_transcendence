import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api ,{API_URL}from '../features/auth/axiosInstance';

import Form_input from "../components/ui/Form_input";

import Button from "../components/ui/Button";
import Or_divider from "../components/ui/Or_divider";
import VerificationForm from '../components/auth/VerificationForm';

import axios from 'axios';

function Register() {
    const [username, set_username] = useState('');
    const [email,set_email] = useState('');
    const [password,set_password] = useState('');
    const [confirm_password, set_confirm_password] = useState('');
    const [err_msg,set_err_msg] = useState('');
    const [is_submitting, set_is_submitting] = useState(false);
    const [registrationId, setRegistrationId] = useState<string | null>(null);

    const navigate = useNavigate();
    
    function handle_google_login()
    {
        window.location.href = `${API_URL}/api/auth/google`;
    }


    async function handle_submit(event: React.FormEvent)
    {
        event.preventDefault();
        if (is_submitting)
            return;

        set_err_msg('');

        if (password !== confirm_password) {
            set_err_msg("Passwords do not match");
            return;
        }

        set_is_submitting(true);

        try {
            const response = await api.post('/api/auth/register', {username, email, password});

            if (!response.data.success) {
                set_err_msg(response.data.error || "Registration failed.");
                return;
            }

            const id = response.data.registrationId;

            if (typeof id !== "string" || !id) {
                set_err_msg("Missing registration ID in server response.");
                return;
            }
            setRegistrationId(id);
            set_password('');
            set_confirm_password('');
        } catch (error) {
            if (axios.isAxiosError(error)) {
                set_err_msg(error.response?.data?.error|| "Registration request failed. Please try again.");
            } else {
                set_err_msg("An unexpected error occurred.");
            }
        }finally {
            set_is_submitting(false);
        }
    }

    return (
        <div>
            <Button variant="secondary"  className="fixed right-8 top-6" onClick={() => navigate('/login')}>
                 Log in
            </Button>

            <div className="mx-auto w-full max-w-xl px-8 py-50">
                <h1 className="mb-6 text-lg font-semibold text-app-text"> Create account</h1>

                {registrationId ? (
                    <VerificationForm email={email} initialRegistrationId={registrationId}/>
                ) : (
                    <form className="space-y-5" onSubmit={handle_submit}>
                        <Form_input id="username" label="username" type="text" value={username} onChange={set_username}/>
                        <Form_input id="email" label="Email address" type="email" value={email} onChange={set_email}/>
                        <Form_input id="password" label="password" type="password" value={password} onChange={set_password}/>
                        <Form_input id="confirmPassword" label="Confirm password" type="password" value={confirm_password} onChange={set_confirm_password}/>

                        {err_msg && <p>{err_msg}</p>}
                        
                        <Button type="submit" className="w-full" disabled={is_submitting}>
                            {is_submitting ? "Creating account..." : "Create account"}
                        </Button>
                        
                        <Or_divider />

                        <Button type="button" variant="secondary" className="w-full" onClick={handle_google_login}>
                            Continue with Google
                        </Button>
                    </form>
                )}

            </div>
        </div>
    );
}

export default Register;

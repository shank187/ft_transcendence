import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../../features/auth/axiosInstance';
import { useAuth } from '../../features/auth/AuthContext';
import Form_input from '../ui/Form_input';
import Button from '../ui/Button';

interface VerificationFormProps {
    email: string;
    initialRegistrationId: string;
}

function VerificationForm({ email, initialRegistrationId }: VerificationFormProps) {
    const [code, set_code] = useState('');
    const [err_msg, set_err_msg] = useState('');
    const [resend_message, set_resend_message] = useState('');
    const [is_submitting, set_is_submitting] = useState(false);
    const [is_resending, set_is_resending] = useState(false);
    const { setAccessToken, setUser } = useAuth();
    const navigate = useNavigate();
    const registrationId = initialRegistrationId;
    
    

    async function handle_verify() {
        if (is_submitting || is_resending || !registrationId)
            return;

        set_err_msg('');
        set_resend_message('');

        if (!code.trim()) {
            set_err_msg('Please enter the verification code.');
            return;
        }

        set_is_submitting(true);

        try {
            const response = await api.post('/api/auth/verify-registration', {
                registrationId,
                code: code.trim(),
            });

            if (!response.data.success) {
                set_err_msg(response.data.error || 'Verification failed.');
                return;
            }

            const { access_token, user } = response.data;

            setUser(user);
            setAccessToken(access_token);

            navigate('/onboarding', { replace: true });
        } catch (error) {
            if (axios.isAxiosError(error))
                set_err_msg(error.response?.data?.error || 'Verification failed. Try again.');
            else
                set_err_msg('An unexpected error occurred.');
        } finally {
            set_is_submitting(false);
        }
    }

    async function handle_resend() {
        if (is_submitting || is_resending || !registrationId)
            return;

        set_err_msg('');
        set_resend_message('');
        set_is_resending(true);

        try {
            const response = await api.post('/api/auth/resend-verification', {registrationId});

            if (!response.data.success) {
                set_err_msg(response.data.error || 'Unable to resend verification code.');
                return;
            }

            set_code('');
            set_resend_message('A new verification code has been sent. Check your inbox and spam folder.');
        } catch (error) {
            if (axios.isAxiosError(error))
                set_err_msg(error.response?.data?.error || 'Unable to resend verification code. Please try again.');
            else
                set_err_msg('An unexpected error occurred.');
        } finally {
            set_is_resending(false);
        }
    }


    return (
        <div className="space-y-5">
            <p role="status">
                We sent a verification code to {email}.
                Check your inbox and spam folder.
                Your account is not created yet.
            </p>

            <Form_input id="verificationCode" label="Verification code" type="number" value={code} onChange={set_code}/>

            {err_msg && <p>{err_msg}</p>}
            {resend_message && <p role="status">{resend_message}</p>}

            <Button type="button" className="w-full" onClick={handle_verify} disabled={is_submitting || is_resending}>
                Verify
            </Button>
            <Button type="button" variant="secondary" className="w-full" onClick={handle_resend} disabled={is_submitting || is_resending}>
                Resend verification code
            </Button>
        </div>
    );
}

export default VerificationForm;

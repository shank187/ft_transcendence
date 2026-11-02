import Form_input from '../ui/Form_input';
import Button from '../ui/Button';
import { useState } from 'react';
import type { FormEvent } from 'react';
import axios from 'axios';
import api from '../../features/auth/axiosInstance';

export default function Add_admin()
{
    const [email, set_email] = useState("");
    const [err_msg, set_err_msg] = useState("");
    const [success_msg, set_success_msg] = useState("");
    const [is_submitting, set_is_submitting] = useState(false);

    async function handle_submit(event: FormEvent<HTMLFormElement>)
    {
        event.preventDefault();

        if (is_submitting)
            return;

        set_err_msg("");
        set_success_msg("");

        const target_email = email.trim().toLowerCase();

        if (!target_email) {
            set_err_msg("Please enter an email address.");
            return;
        }

        set_is_submitting(true);

        try {
            const response = await api.post('/api/users/add_admin', { email: target_email });

            if (!response.data.success) {
                set_err_msg(response.data.error || "Could not add admin. Please try again.");
                return;
            }

            set_success_msg(`${target_email} is now an admin.`);
            set_email("");
        } catch (error) {
            if (axios.isAxiosError(error))
                set_err_msg(error.response?.data?.error || error.response?.data?.message || "Could not add admin. Please try again.");
            else
                set_err_msg("An unexpected error occurred.");
        } finally {
            set_is_submitting(false);
        }
    }

    return(
        <div className="w-full max-w-xl space-y-2">
            <h1 className="mb-6 text-lg font-semibold text-app-text">
                Add admin
            </h1>
            <p className="text-sm">
                Enter an existing user's email address to give them admin access.
            </p>
            <form className="space-y-5" onSubmit={handle_submit} aria-busy={is_submitting}>
                <Form_input id="admin-email" label="Email address" type="email" value={email} onChange={set_email} readOnly={is_submitting}/>

                {err_msg && <p className="text-sm text-app-danger">{err_msg}</p>}
                {success_msg && <p className="text-sm text-app-primary">{success_msg}</p>}

                <Button type="submit" disabled={is_submitting}>
                    Add admin
                </Button>
            </form>
        </div>
    );
}

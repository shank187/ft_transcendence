
import { useState } from "react";
import Profile_input_field from "./Profile_input_field";
import api from "../../features/auth/axiosInstance";
import Button from '../ui/Button';

export default function Change_password() {
    const [current_password, set_current_password] = useState("");
    const [new_password, set_new_password] = useState("");
    const [confirm_password, set_confirm_password] = useState("");
    const [error, set_error] = useState("");
    const [success, set_success] = useState("");
    const [isSaving, set_isSaving] = useState(false);

    async function handle_click()
    {
        if (isSaving)
            return;

        set_error("");
        set_success("");

        if (!current_password || !new_password || !confirm_password)
        {
            set_error("Please fill in all password fields.");
            return;
        }

        if (new_password !== confirm_password)
        {
            set_error("Passwords do not match.");
            return;
        }

        try
        {
            set_isSaving(true);
            await api.post("/api/users/change_password", {currentPassword: current_password, newPassword: new_password});

            set_current_password("");
            set_new_password("");
            set_confirm_password("");
            set_success("Password updated successfully.");

        }catch (error)
        {
            set_error(error.response?.data.message || "Could not update your password.");
        }finally {
            set_isSaving(false);
        }
    }

    return (
        <div className="space-y-6">
            <Profile_input_field label="Current password" type="password" value={current_password} onChange={set_current_password}/>
            <Profile_input_field label="New password" type="password" value={new_password} onChange={set_new_password}/>
            <Profile_input_field label="Confirm new password" type="password" value={confirm_password} onChange={set_confirm_password}/>

            <div className="text-sm text-red-700">{error}</div>
            <div className="text-sm text-green-700">{success}</div>

            <Button onClick={handle_click} disabled={isSaving}> Update password </Button>
        </div>
    );
}
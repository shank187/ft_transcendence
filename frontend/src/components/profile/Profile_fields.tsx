import {useState} from "react";
import api from '../../features/auth/axiosInstance';
import Form_select from "../ui/Form_select";
import Profile_input_field from "./Profile_input_field";
import Button from '../ui/Button';
import Change_password from "./Change_password";
import { isAxiosError } from "axios";


import {EXPERIENCE_LEVELS, TRAINING_GOALS} from '../../pages/Onboarding'

const unitSystems = ["METRIC", "IMPERIAL"];


export interface User {
    id: string;
    username: string;
    email: string;
    displayName: string | null;
    bio: string | null;
    avatarUrl: string | null;
    experienceLevel: string | null;
    primaryGoal: string | null;
    unitSystem: string;
    weightKg: number | null;
    heightCm: number | null;
    onboardingCompletedAt: string | null;
    hasPassword: boolean;
}

interface ProfileProps {
    user: User;
    on_user_updated: (user: User) => void;
}


export default function Profile_fields({ user, on_user_updated }: ProfileProps)
{

    const [edited_user, set_euser] = useState<User>(user);
    const [original_user, set_ouser] = useState<User>(user);
    const [error, set_error] = useState("");
    const [success, set_success] = useState("");


    async function handle_click ()
    {
        try{
           if (!edited_user || !original_user)
                return;

            if (edited_user.displayName !== original_user.displayName || edited_user.bio !== original_user.bio || edited_user.experienceLevel !== original_user.experienceLevel || edited_user.primaryGoal !== original_user.primaryGoal || edited_user.unitSystem !== original_user.unitSystem || edited_user.weightKg !== original_user.weightKg || edited_user.heightCm !== original_user.heightCm)
            {
                set_error("");
                set_success("");
                const response = await api.post<User>('/api/users/update_me', {user: edited_user});
                set_euser(response.data);
                set_ouser(response.data);
                on_user_updated(response.data);
                set_success("Profile updated successfully.");
            }

        }catch (error) {
            if (isAxiosError<{ message: string }>(error))
                set_error(error.response?.data?.message || "Could not save your profile.");
            else
                set_error("Could not save your profile.");
        }

    }
 

    if (!edited_user)
        return <div>{error || "Loading..."}</div>;
    return (
    <div className="space-y-10">
        <Profile_input_field label="Username" value={edited_user.username} readOnly/>

        <Profile_input_field label="Email" type="email" value={edited_user.email} readOnly/>

        <Profile_input_field label="Display name" value={edited_user.displayName ?? ""} onChange={(value) => { set_euser({ ...edited_user, displayName: value });}}/>
        
        <Profile_input_field label="Bio" value={edited_user.bio ?? ""} onChange={(value) => { set_euser({ ...edited_user, bio: value}); }}/>
    
        <Profile_input_field label="Body weight (kg)" type="number" value={edited_user.weightKg?.toString() ?? ""}
            onChange={(value) => {
            let weightKg: number | null = null;
            if (value !== "")
                weightKg = Number(value);
                set_euser({...edited_user, weightKg});
            }}
        />
        <Profile_input_field label="Height (cm)" type="number" value={edited_user.heightCm?.toString() ?? ""} onChange={(value) => { let heightCm: number | null = null; if (value !== "") heightCm = Number(value); set_euser({ ...edited_user, heightCm }); }}/>

        <Form_select id="experienceLevel" label="Experience level" value={edited_user.experienceLevel ?? ""} options={EXPERIENCE_LEVELS} onChange={(value) => { set_euser({ ...edited_user, experienceLevel: value }); }}/>

        <Form_select id="primaryGoal" label="Primary goal" value={edited_user.primaryGoal ?? ""} options={TRAINING_GOALS} onChange={(value) => { set_euser({ ...edited_user, primaryGoal: value }); }}/>

        <Form_select id="unitSystem" label="Unit system" value={edited_user.unitSystem} options={unitSystems} onChange={(value) => { set_euser({ ...edited_user, unitSystem: value }); }}/>
    
        <div className="text-sm text-green-700" >
            {success}
        </div>
        <div className="text-sm text-red-700" >
            {error}
        </div>
        <Button onClick={handle_click}> save changes</Button>
        
        {edited_user.hasPassword ? (<Change_password/>) : (<div> You sign in with Google. There is no password to change here.</div>)}
    </div>
    );
}
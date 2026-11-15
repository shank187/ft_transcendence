import Profile_fields from "../components/profile/Profile_fields";
import { useState, useEffect } from "react";
import api from "../features/auth/axiosInstance";
import type { User } from "../components/profile/Profile_fields";
import { isAxiosError } from 'axios';

import Avatar_upload from "../components/profile/Avatar_upload";





export default function EditProfile() {

    const [user, set_user] = useState<User | null>(null);
    const [error, set_error] = useState("");

    useEffect(()=>{
        async function get_user() {
    
            try {
                set_error("");
                const response = await api.get<User>('/api/users/me');
                set_user(response.data);
            }
            catch (error) {
                if (isAxiosError(error))
                    set_error(error.response?.data?.message || "Could not load your profile.");
                else
                    set_error("Could not load your profile.");
            }
        }
        
        get_user();
    }, []);

    if (!user)
        return <div>{error || "Loading..."}</div>;
    return (
    <div className="mx-auto w-full max-w-6xl py-6">
        <div className="mb-6 text-xl font-bold">
            Edit your profile
        </div>

        <div className="flex flex-col-reverse gap-6 lg:flex-row lg:items-start">
            <div className="min-w-0 flex-1 rounded-xl border border-app-border p-4">
               <Profile_fields user={user} on_user_updated={set_user}/>
            </div>

            <div className="w-full rounded-xl border border-app-border p-4 lg:w-72 lg:shrink-0">
                <Avatar_upload
                user={user}
                on_avatar_updated={(avatarUrl) => {
                    set_user((previous_user) => {
                        if (!previous_user)
                            return previous_user;

                        return { ...previous_user, avatarUrl };
                    });
                }}
            />
            </div>
        </div>
    </div>
);
}

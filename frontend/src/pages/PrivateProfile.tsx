import Profile_fields from "../components/profile/Profile_fields";
import { useState, useEffect } from "react";
import api from "../features/auth/axiosInstance";
import type { User } from "../components/profile/Profile_fields";

import Avatar_upload from "../components/profile/Avatar_upload";





export default function Edit_profile() {

    const [user, set_user] = useState<User | null>(null);
    const [error, set_error] = useState("");

    useEffect(()=>{
        async function get_user() {
    
            try {
                set_error("");
                const response = await api.get<User>('/api/users/me');
                set_user(response.data);
            }
            catch{
                set_error("Could not load your profile.");
            }
        }
        
        get_user();
    }, []);

    if (!user)
        return <div>{error || "Loading..."}</div>;
    return (
    <div className="w-full max-w-5xl py-6 pl-12 pr-6">
        <div className="mb-6 text-xl font-bold">
            Edit your profile
        </div>

        <div className="flex flex-col gap-10 md:flex-row">
            <div className="min-w-0 flex-1">
               <Profile_fields user={user} on_user_updated={set_user}/>
            </div>

            <div className="w-full md:ml-auto md:w-64 md:shrink-0">
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
import {useState , useEffect} from "react";
import api from '../../features/auth/axiosInstance';
import Form_input from "../ui/Form_input";
import Profile_input_field from "./Profile_input_field";



interface User {
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
    onboardingCompletedAt: string | null;
}


export default function Profile_fields()
{

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

    if (error)
    return <div>{error}</div>;

    if (!user)
        return <div>Loading...</div>;
    return (
    <div className="space-y-10">
        <Profile_input_field label="Username" value={user.username} readOnly/>

        <Profile_input_field label="Email" type="email" value={user.email} readOnly/>

        <Profile_input_field label="Display name" value={user.displayName ?? ""} onChange={(value) => { set_user({ ...user, displayName: value });}}/>
        
        <Profile_input_field label="Bio" value={user.bio ?? ""} onChange={(value) => { set_user({ ...user, bio: value}); }}/>
    
        <Profile_input_field label="Body weight (kg)" type="number" value={user.weightKg?.toString() ?? ""}
            onChange={(value) => {
            let weightKg: number | null = null;
            if (value !== "")
                weightKg = Number(value);
                set_user({...user, weightKg});
            }}
        />
    </div>
);
}
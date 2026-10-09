
import Button from "../ui/Button";
import {useState , useEffect} from "react";
import type { ChangeEvent } from "react";
import api from "../../features/auth/axiosInstance";
import type { User } from "./Profile_fields";
import { isAxiosError } from "axios";


interface AvatarProps {
    user: User;
    on_avatar_updated: (avatarUrl: string | null) => void;
}

export default function Avatar_upload({ user, on_avatar_updated }: AvatarProps)
{
    const [file, set_file] = useState<File | null> (null);
    const [error, set_error] = useState("");
    const [preview, set_preview] = useState("");
    
    const [success, set_success] = useState("");
    const [is_uploading, set_is_uploading] = useState(false);
    const [delet_is_uploading, set_delet_is_uploading] = useState(false);

    function hundle_file_change(event: ChangeEvent<HTMLInputElement>)
    {
        set_error("");
        set_success("");
        set_file(null);
        if (event.target.files && event.target.files.length > 0)
        {
            const selected_file = event.target.files[0];
            event.target.value = "";
            if (selected_file.type !== "image/jpeg" && selected_file.type !== "image/png") {
                set_error("Choose a JPG or PNG image.");
                return;
            }
            if (selected_file.size > 2 * 1024 * 1024)
            {
                set_error("Image must not exceed 2 MB.");
                return;
            }

            set_file(selected_file);
        }
    }

    useEffect(()=>{
        if(!file)
        {
            set_preview("");
            return;
        }

        const url = URL.createObjectURL(file);
        set_preview(url);

        return ()=> {
            URL.revokeObjectURL(url);
        };

    },[file]);



    async function handle_click()
    {
        if (is_uploading)
            return;

        set_error("");
        set_success("");

        if (!file){
            set_error("Please select an image.");
            return;
        }

        try {
            set_is_uploading(true);

            const form_data = new FormData();
            form_data.append("avatar", file);

            const response = await api.post("/api/users/me/avatar", form_data);
            on_avatar_updated(response.data.avatarUrl);
            set_file(null);
            set_success("Avatar uploaded successfully.");
            
        }
        catch (error) {
            if (isAxiosError<{ message: string }>(error))
                set_error(error.response?.data.message || "Could not upload your avatar.");
            else
                set_error("Could not upload your avatar.");
        }
        finally {
            set_is_uploading(false);
        }
    }


    async function delet_avatar()
    {
        if(delet_is_uploading)
            return;
        set_error("");
        set_success("");


        try{
            set_delet_is_uploading(true);

            const response = await api.delete("/api/users/me/avatar/delete");

            on_avatar_updated(null);
            set_file(null);
            set_preview("");
            set_success(response.data.message);
        }catch (error) {
            if (isAxiosError<{ message: string }>(error))
                set_error(error.response?.data.message || "Could not delete your avatar.");
            else
                set_error("Could not delete your avatar.");
        }finally
        {
            set_delet_is_uploading(false);
        }
    }


    let image_src = "/default-avatar.png";

    if (preview)
        image_src = preview;
    else if (user.avatarUrl)
        image_src = new URL(user.avatarUrl, api.defaults.baseURL).href;

    return (
    <div className="space-y-4">
        <div className="text-lg font-semibold">Profile picture</div>
    
        <img src={image_src} alt="Profile picture" className="h-32 w-32 rounded-full object-cover" onError={(e)=> {
            if (!e.currentTarget.src.endsWith("/default-avatar.png"))
                e.currentTarget.src = "/default-avatar.png";
        }}/>

        <input type="file" accept="image/jpeg,image/png" onChange={hundle_file_change} disabled={is_uploading}/>

        <div className="text-sm text-red-700">{error}</div>
        <div className="text-sm">{file?.name}</div>

        <div className="text-sm text-gray-500">
            Choose a JPG or PNG image, up to 2 MB.
        </div>


        <div className="text-sm text-green-700">{success}</div>
        <Button onClick={handle_click} disabled={is_uploading} >Upload avatar</Button>
        <Button onClick={delet_avatar}> remove avatar </Button>
    </div>

    );
}
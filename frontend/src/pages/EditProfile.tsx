import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import axios from "axios";

import api from "../features/auth/axiosInstance";

type ProfileForm = {
    username: string;
    email: string;
    displayName: string;
    bio: string;
    avatarUrl: string;
    experienceLevel: string;
    primaryGoal: string;
    unitSystem: string;
    heightCm: string;
    weightKg: string;
};

type ProfileApiUser = {
    username: string;
    email: string;
    displayName: string | null;
    bio: string | null;
    avatarUrl: string | null;
    experienceLevel: string | null;
    primaryGoal: string | null;
    unitSystem: string | null;
    heightCm: number | null;
    weightKg: number | null;
};

type AvatarUploadResponse = {
    message: string;
    user: {
        id: string;
        username: string;
        avatarUrl: string;
    };
};

type ApiErrorResponse = {
    message: string;
};

let API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
    API_URL = "http://localhost:3000";
}

if (API_URL.endsWith("/")) {
    API_URL = API_URL.slice(0, -1);
}

function EditProfile() {
    const [form, setForm] = useState<ProfileForm>({
        username: "",
        email: "",
        displayName: "",
        bio: "",
        avatarUrl: "",
        experienceLevel: "",
        primaryGoal: "",
        unitSystem: "METRIC",
        heightCm: "",
        weightKg: "",
    });

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [hasChanged, setHasChanged] = useState(false);
    const [message, setMessage] = useState("");

    const avatarInput = useRef<HTMLInputElement>(null);

    useEffect(() => {
        async function loadProfile() {
            try {
                const response = await api.get<ProfileApiUser>(
                    "/api/users/me",
                );

                const user = response.data;

                let displayName = "";
                let bio = "";
                let avatarUrl = "";
                let experienceLevel = "";
                let primaryGoal = "";
                let unitSystem = "METRIC";
                let heightCm = "";
                let weightKg = "";

                if (user.displayName !== null) {
                    displayName = user.displayName;
                }

                if (user.bio !== null) {
                    bio = user.bio;
                }

                if (user.avatarUrl !== null) {
                    avatarUrl = user.avatarUrl;
                }

                if (user.experienceLevel !== null) {
                    experienceLevel = user.experienceLevel;
                }

                if (user.primaryGoal !== null) {
                    primaryGoal = user.primaryGoal;
                }

                if (user.unitSystem !== null) {
                    unitSystem = user.unitSystem;
                }

                if (user.heightCm !== null) {
                    heightCm = String(user.heightCm);
                }

                if (user.weightKg !== null) {
                    weightKg = String(user.weightKg);
                }

                setForm({
                    username: user.username,
                    email: user.email,
                    displayName: displayName,
                    bio: bio,
                    avatarUrl: avatarUrl,
                    experienceLevel: experienceLevel,
                    primaryGoal: primaryGoal,
                    unitSystem: unitSystem,
                    heightCm: heightCm,
                    weightKg: weightKg,
                });
            } catch {
                setMessage("Could not load the profile");
            } finally {
                setIsLoading(false);
            }
        }

        loadProfile();
    }, []);

    useEffect(() => {
        return () => {
            if (avatarPreview !== "") {
                URL.revokeObjectURL(avatarPreview);
            }
        };
    }, [avatarPreview]);

    function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
        const files = event.target.files;

        if (files === null || files.length === 0) {
            return;
        }

        const file = files[0];

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            setAvatarFile(null);
            setAvatarPreview("");
            setMessage("Only JPG, PNG and WEBP images are allowed");
            event.target.value = "";
            return;
        }

        const maximumSize = 2 * 1024 * 1024;

        if (file.size > maximumSize) {
            setAvatarFile(null);
            setAvatarPreview("");
            setMessage("The image must be smaller than 2 MB");
            event.target.value = "";
            return;
        }

        const previewUrl = URL.createObjectURL(file);

        setAvatarFile(file);
        setAvatarPreview(previewUrl);
        setMessage("");
    }

    async function uploadAvatar() {
        if (avatarFile === null) {
            setMessage("Choose an image first");
            return;
        }

        const data = new FormData();

        data.append("avatar", avatarFile);

        setIsUploading(true);
        setMessage("");

        try {
            const response = await api.post<AvatarUploadResponse>(
                "/api/users/me/avatar",
                data,
            );

            const uploadedAvatarUrl = response.data.user.avatarUrl;

            setForm((currentForm) => {
                return {
                    ...currentForm,
                    avatarUrl: uploadedAvatarUrl,
                };
            });

            setAvatarFile(null);
            setAvatarPreview("");

            if (avatarInput.current !== null) {
                avatarInput.current.value = "";
            }

            setMessage("Avatar uploaded successfully");
        } catch (error) {
            if (axios.isAxiosError<ApiErrorResponse>(error)) {
                if (
                    error.response !== undefined &&
                    error.response.data.message
                ) {
                    setMessage(error.response.data.message);
                } else {
                    setMessage("Could not upload avatar");
                }
            } else {
                setMessage("Could not upload avatar");
            }
        } finally {
            setIsUploading(false);
        }
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        let heightCm: number | null = null;
        let weightKg: number | null = null;

        if (form.heightCm !== "") {
            heightCm = Number(form.heightCm);
        }

        if (form.weightKg !== "") {
            weightKg = Number(form.weightKg);
        }

        setIsSaving(true);
        setMessage("");

        try {
            await api.patch("/api/users/me", {
                displayName: form.displayName,
                bio: form.bio,
                experienceLevel: form.experienceLevel,
                primaryGoal: form.primaryGoal,
                unitSystem: form.unitSystem,
                heightCm: heightCm,
                weightKg: weightKg,
            });

            setMessage("Profile updated successfully");
            setHasChanged(false);
        } catch (error) {
            if (axios.isAxiosError<ApiErrorResponse>(error)) {
                if (
                    error.response !== undefined &&
                    error.response.data.message
                ) {
                    setMessage(error.response.data.message);
                } else {
                    setMessage("Could not update the profile");
                }
            } else {
                setMessage("Could not update the profile");
            }
        } finally {
            setIsSaving(false);
        }
    }

    if (isLoading) {
        return <p>Loading profile...</p>;
    }

    let avatarSource = "/default-avatar.svg";

    if (avatarPreview !== "")
    {
        avatarSource = avatarPreview;
        
    } else if (form.avatarUrl !== "")
    {
        if (form.avatarUrl.startsWith("http://") || form.avatarUrl.startsWith("https://"))
            avatarSource = form.avatarUrl; 
        else
            avatarSource = API_URL + form.avatarUrl;
    }

    let uploadButtonText = "Upload avatar";

    if (isUploading) {
        uploadButtonText = "Uploading...";
    }

    let saveButtonText = "Save changes";

    if (isSaving) {
        saveButtonText = "Saving...";
    }

    return (
        <div>
            <h1>Edit profile</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="avatar">Profile picture</label>

                    <input
                        ref={avatarInput}
                        id="avatar"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleAvatarChange}
                    />
                </div>

                <img
                    src={avatarSource}
                    alt="Profile preview"
                    width="150"
                    height="150"
                    onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = "/default-avatar.svg";
                    }}
                />

                <div>
                    <button
                        type="button"
                        onClick={uploadAvatar}
                        disabled={avatarFile === null || isUploading}
                    >
                        {uploadButtonText}
                    </button>
                </div>

                <div>
                    <label htmlFor="username">Username</label>

                    <input
                        id="username"
                        value={form.username}
                        disabled
                    />
                </div>

                <div>
                    <label htmlFor="email">Email</label>

                    <input
                        id="email"
                        value={form.email}
                        disabled
                    />
                </div>

                <div>
                    <label htmlFor="displayName">Display name</label>

                    <input
                        id="displayName"
                        value={form.displayName}
                        onChange={(event) => {
                            setForm({
                                ...form,
                                displayName: event.target.value,
                            });

                            setHasChanged(true);
                        }}
                    />
                </div>

                <div>
                    <label htmlFor="bio">Bio</label>

                    <textarea
                        id="bio"
                        value={form.bio}
                        onChange={(event) => {
                            setForm({
                                ...form,
                                bio: event.target.value,
                            });

                            setHasChanged(true);
                        }}
                    />
                </div>

                <div>
                    <label htmlFor="experienceLevel">
                        Experience level
                    </label>

                    <select
                        id="experienceLevel"
                        value={form.experienceLevel}
                        onChange={(event) => {
                            setForm({
                                ...form,
                                experienceLevel: event.target.value,
                            });

                            setHasChanged(true);
                        }}
                    >
                        <option value="">Select a level</option>
                        <option value="BEGINNER">Beginner</option>
                        <option value="INTERMEDIATE">Intermediate</option>
                        <option value="ADVANCED">Advanced</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="primaryGoal">Primary goal</label>

                    <select
                        id="primaryGoal"
                        value={form.primaryGoal}
                        onChange={(event) => {
                            setForm({
                                ...form,
                                primaryGoal: event.target.value,
                            });

                            setHasChanged(true);
                        }}
                    >
                        <option value="">Select a goal</option>
                        <option value="BUILD_MUSCLE">Build muscle</option>
                        <option value="GAIN_STRENGTH">Gain strength</option>
                        <option value="LOSE_FAT">Lose fat</option>
                        <option value="IMPROVE_GENERAL_FITNESS">
                            Improve general fitness
                        </option>
                        <option value="IMPROVE_ENDURANCE">
                            Improve endurance
                        </option>
                        <option value="MAINTAIN_FITNESS">
                            Maintain fitness
                        </option>
                    </select>
                </div>

                <div>
                    <label htmlFor="unitSystem">Unit system</label>

                    <select
                        id="unitSystem"
                        value={form.unitSystem}
                        onChange={(event) => {
                            setForm({
                                ...form,
                                unitSystem: event.target.value,
                            });

                            setHasChanged(true);
                        }}
                    >
                        <option value="METRIC">Metric</option>
                        <option value="IMPERIAL">Imperial</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="heightCm">Height</label>

                    <input
                        id="heightCm"
                        type="number"
                        value={form.heightCm}
                        onChange={(event) => {
                            setForm({
                                ...form,
                                heightCm: event.target.value,
                            });

                            setHasChanged(true);
                        }}
                    />
                </div>

                <div>
                    <label htmlFor="weightKg">Weight</label>

                    <input
                        id="weightKg"
                        type="number"
                        value={form.weightKg}
                        onChange={(event) => {
                            setForm({
                                ...form,
                                weightKg: event.target.value,
                            });

                            setHasChanged(true);
                        }}
                    />
                </div>

                {message !== "" && <p>{message}</p>}

                <button
                    type="submit"
                    disabled={!hasChanged || isSaving}
                >
                    {saveButtonText}
                </button>
            </form>
        </div>
    );
}

export default EditProfile;
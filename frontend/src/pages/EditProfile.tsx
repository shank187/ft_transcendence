import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import api from "../features/auth/axiosInstance";
import axios from "axios";
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

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanged, setHasChanged] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        async function loadProfile() {
            try {
                const response = await api.get("/api/users/me");
                const user = response.data;

                setForm({
                    username: user.username,
                    email: user.email,
                    displayName: user.displayName || "",
                    bio: user.bio || "",
                    avatarUrl: user.avatarUrl || "",
                    experienceLevel: user.experienceLevel || "",
                    primaryGoal: user.primaryGoal || "",
                    unitSystem: user.unitSystem,
                    heightCm: user.heightCm?.toString() || "",
                    weightKg: user.weightKg?.toString() || "",
                });
            } catch {
                setMessage("Could not load the profile");
            } finally {
                setIsLoading(false);
            }
        }

        loadProfile();
    }, []);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setIsSaving(true);
        setMessage("");

        try {
            await api.patch("/api/users/me", {
                displayName: form.displayName,
                bio: form.bio,
                avatarUrl: form.avatarUrl.trim() === "" ? null : form.avatarUrl.trim(),
                experienceLevel: form.experienceLevel,
                primaryGoal: form.primaryGoal,
                unitSystem: form.unitSystem,
                heightCm: form.heightCm === ""
                    ? null
                    : Number(form.heightCm),
                weightKg: form.weightKg === ""
                    ? null
                    : Number(form.weightKg),
            });

            setMessage("Profile updated successfully");
            setHasChanged(false);
        } catch (error) {
    if (axios.isAxiosError(error)) {
        setMessage(
            error.response?.data?.message ||
            "Could not update the profile"
        );
    } else {
        setMessage("Could not update the profile");
    }
} finally {
            setIsSaving(false);
        }
    }

    if (isLoading)
        return <p>Loading profile...</p>;

    return (
        <div>
            <h1>Edit profile</h1>



            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="avatarUrl">Avatar URL</label>

                    <input
                       id="avatarUrl"
                        type="url"
                        value={form.avatarUrl}
                        onChange={(event) => {
                            setForm({
                                ...form,
                                avatarUrl: event.target.value,
                            });
                        
                            setHasChanged(true);
                        }}
                    />
                </div>

               <img
                    src={form.avatarUrl || "/default-avatar.svg"}
                    alt="Profile preview"
                    width="150"
                    height="150"
                    onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = "/default-avatar.svg";
                    }}
                />

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
                        <option value="INTERMEDIATE">
                            Intermediate
                        </option>
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
                        <option value="BUILD_MUSCLE">
                            Build muscle
                        </option>
                        <option value="GAIN_STRENGTH">
                            Gain strength
                        </option>
                        <option value="LOSE_FAT">
                            Lose fat
                        </option>
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

                {message && <p>{message}</p>}

                <button
                    type="submit"
                    disabled={!hasChanged || isSaving}
                >
                    {isSaving ? "Saving..." : "Save changes"}
                </button>
            </form>
        </div>
    );
}

export default EditProfile;
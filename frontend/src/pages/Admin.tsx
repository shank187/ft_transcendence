import { useState } from 'react';
import  Add_admin from '../components/auth/Add_admin'
import api from '../features/auth/axiosInstance';
import GymSubmissionCard from "../features/Gyms/components/GymSubmissionsCard";
import type { GymSubmission } from "../features/Gyms/components/GymSubmissionsCard";

export default function Admin()
{

    const [submissions, setSubmissions ] = useState<GymSubmission[] | null>(null);

    async function load_submitted_gyms() {
        try {
            const { data } = await api.get<GymSubmission[]>("/api/gyms/submissions")
            setSubmissions(data);
        }
        catch(error) {
            console.error("Could not load gym submissions",error);
        }
    }
    return (
        <main className="mx-auto w-full min-w-0 max-w-5xl space-y-8 px-4 py-6 sm:px-8">
            <h1 className="text-3xl font-bold">Admin</h1>
    
            <div className="rounded-xl border border-app-border bg-app-surface p-5">
                <Add_admin />
            </div>
    
            <section aria-labelledby="gym-submissions" className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 id="gym-submissions" className="text-xl font-semibold">
                        Gym submissions
                    </h2>
    
                    <button
                        type="button"
                        onClick={load_submitted_gyms}
                        className="rounded-lg border border-app-border px-4 py-2 text-sm font-medium hover:bg-app-surface"
                    >
                        {submissions === null ? "Load submissions" : "Refresh"}
                    </button>
                </div>
    
                {submissions?.length === 0 && (
                    <p className="rounded-xl border border-app-border p-5 text-sm text-app-text-secondary">
                        No pending submissions.
                    </p>
                )}
    
                {submissions && submissions.length > 0 && (
                    <ul className="space-y-3">
                        {submissions.map((submission) => (
                            <li key={submission.id}>
                                <GymSubmissionCard submission={submission} />
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </main>
    );
}
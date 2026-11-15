import { useState } from "react";
import Add_admin from "../components/auth/Add_admin";
import api from "../features/auth/axiosInstance";
import GymSubmissionCard from "../features/Gyms/components/GymSubmissionsCard";
import type { GymSubmission } from "../features/Gyms/components/GymSubmissionsCard";

export default function Admin() {
    // null means we haven't loaded the list yet. [] means the list is empty.
    const [submissions, setSubmissions] = useState<GymSubmission[] | null>(null);

    // Store a message here if a review request fails.
    const [reviewError, setReviewError] = useState<string | null>(null);

    async function load_submitted_gyms() {
        try {
            const { data } = await api.get<GymSubmission[]>("/api/gyms/submissions");
            setSubmissions(data);
        } catch (error) {
            console.error("Could not load gym submissions", error);
        }
    }

    async function handleDecline(id: string) {
        // Stop if the admin cancels or enters only spaces.
        const reason = window.prompt("Why are you declining this gym?")?.trim();
        if (!reason) return;

        setReviewError(null);

        try {
            // The backend saves REJECTED in the database.
            await api.patch(`/api/gyms/submissions/${id}/reject`, { reason });

            // After the save succeeds, keep every card except the one we declined.
            // React gives us the latest list through the `current` argument.
            setSubmissions((current) =>
                current?.filter((submission) => submission.id !== id) ?? null
            );
        } catch (error) {
            // The card stays in the list so the admin can see the request failed.
            console.error("Could not decline submission", error);
            setReviewError("Could not decline the submission.");
        }
    }

    async function handleAccept(id: string) {
        setReviewError(null);

        try {
            // Remove the card only after the backend has committed the approval.
            await api.patch(`/api/gyms/submissions/${id}/approve`);
            setSubmissions((current) =>
                current?.filter((submission) => submission.id !== id) ?? null
            );
        } catch (error) {
            console.error("Could not approve submission", error);
            setReviewError("Could not approve the submission.");
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

                {/* Show a message here only when a review fails. */}
                {reviewError && (
                    <p role="alert" className="text-sm text-app-danger">
                        {reviewError}
                    </p>
                )}

                {submissions?.length === 0 && (
                    <p className="rounded-xl border border-app-border p-5 text-sm text-app-text-secondary">
                        No pending submissions.
                    </p>
                )}

                {submissions && submissions.length > 0 && (
                    <ul className="space-y-3">
                        {submissions.map((submission) => (
                            <li key={submission.id}>
                                {/* Give each card the function to call on Decline. */}
                                <GymSubmissionCard
                                    submission={submission}
                                    onDecline={handleDecline}
                                    onAccept={handleAccept}
                                />
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </main>
    );
}
import { useState } from "react";
import Add_admin from "../components/auth/Add_admin";
import Dialog from "../components/ui/Dialog";
import Form_select from "../components/ui/Form_select";
import api from "../features/auth/axiosInstance";
import GymSubmissionCard from "../features/Gyms/components/GymSubmissionsCard";
import type { GymSubmission } from "../features/Gyms/components/GymSubmissionsCard";

export default function Admin() {
    // null means the list hasn't been loaded yet. [] means the list is empty.
    const [submissions, setSubmissions] = useState<GymSubmission[] | null>(null);
    const [reviewError, setReviewError] = useState<string | null>(null);

    const [loadingSubmissions, setLoadingSubmissions] = useState(false);
    const [loadError, setLoadError] = useState(false);

    // null means the Decline dialog is closed.
    const [decline, setDecline] = useState<{
        id: string;
        reason: string;
        detail: string;
    } | null>(null);
    const [savingDecline, setSavingDecline] = useState(false);

    async function load_submitted_gyms() {
        setLoadingSubmissions(true);

        try {
            const { data } = await api.get<GymSubmission[]>("/api/gyms/submissions");
            setSubmissions(data);
            setLoadError(false);
        } catch (error) {
            console.error("Could not load gym submissions", error);
            setLoadError(true);
        } finally {
            setLoadingSubmissions(false);
        }
    }

    function handleDecline(id: string) {
        setReviewError(null);
        setDecline({ id, reason: "", detail: "" });
    }

    async function confirmDecline() {
        if (!decline?.reason || savingDecline) return;

        const { id, reason, detail } = decline;
        setSavingDecline(true);
        setReviewError(null);

        try {
            await api.patch(`/api/gyms/submissions/${id}/reject`, { reason, detail });

            // Remove the card after the backend saves the rejection.
            setSubmissions((current) =>
                current?.filter((submission) => submission.id !== id) ?? null
            );
            setDecline(null);
        } catch (error) {
            console.error("Could not decline submission", error);
            setReviewError("Could not decline the submission.");
        } finally {
            setSavingDecline(false);
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
                        disabled={loadingSubmissions}
                        className="rounded-lg border border-app-border px-4 py-2 text-sm font-medium hover:bg-app-surface disabled:opacity-50"
                    >
                        {loadingSubmissions
                            ? "Loading…"
                            : loadError
                                ? "Retry"
                                : submissions === null
                                    ? "Load submissions"
                                    : "Refresh"}
                    </button>
                    {loadError && (
                        <p role="alert" className="text-sm text-app-danger">
                            {submissions === null
                                ? "Could not load submissions."
                                : "Could not refresh submissions. The queue may be out of date."}
                        </p>
                    )}
                </div>

                {reviewError && !decline && (
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

            {decline && (
                <Dialog
                    title="Decline gym submission"
                    isWorking={savingDecline}
                    onClose={() => {
                        setDecline(null);
                        setReviewError(null);
                    }}
                    showClose
                >
                    <Form_select
                        id="decline-reason"
                        label="Select a reason"
                        value={decline.reason}
                        options={["ALREADY_LISTED", "NOT_A_GYM", "CANT_CONFIRM", "OTHER"]}
                        onChange={(reason) => setDecline({ ...decline, reason })}
                        disabled={savingDecline}
                    />

                    <label className="flex flex-col gap-1">
                        Additional detail (optional)
                        <textarea
                            className="rounded-lg border border-app-border p-2"
                            value={decline.detail}
                            onChange={(event) =>
                                setDecline({ ...decline, detail: event.target.value })
                            }
                            disabled={savingDecline}
                        />
                    </label>

                    {reviewError && (
                        <p role="alert" className="text-sm text-app-danger">
                            {reviewError}
                        </p>
                    )}

                    <button
                        type="button"
                        className="rounded-lg border border-app-border px-4 py-2 disabled:opacity-50"
                        onClick={confirmDecline}
                        disabled={!decline.reason || savingDecline}
                    >
                        {savingDecline ? "Saving…" : "Confirm decline"}
                    </button>
                </Dialog>
            )}
        </main>
    );
}
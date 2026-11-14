import { API_URL } from "../../auth/axiosInstance";

export type GymSubmission = {
    id: string;
    name: string | null;
    kind: string;
    city: string | null;
    address: string | null;
    status: "PENDING" | "APPROVED" | "REJECTED";
    photos: { media: { url: string } }[];
};

export type GymSubmissionCardProps = {
    submission: GymSubmission;
};

const statusStyles = {
    PENDING: { label: "Pending", color: "bg-amber-400/10 text-amber-300" },
    APPROVED: { label: "Approved", color: "bg-emerald-400/10 text-emerald-300" },
    REJECTED: { label: "Declined", color: "bg-red-400/10 text-red-300" },
};

export default function GymSubmissionCard({ submission }: GymSubmissionCardProps) {
    const photoUrl = submission.photos[0]?.media.url;
    const status = statusStyles[submission.status];
    const location = [submission.address, submission.city].filter(Boolean).join(", ");

    return (
        <article className="grid gap-4 rounded-xl border border-app-border bg-app-surface p-4 md:grid-cols-[12rem_minmax(0,1fr)]">
            {photoUrl ? (
                <img
                    src={new URL(photoUrl, API_URL).href}
                    alt={`Photo submitted for ${submission.name ?? "this gym"}`}
                    className="aspect-video w-full rounded-lg object-cover"
                />
            ) : (
                <div className="grid aspect-video place-items-center rounded-lg bg-app-canvas text-sm text-app-text-secondary">
                    No photo submitted
                </div>
            )}

            <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="break-words text-lg font-semibold">
                        {submission.name ?? "Gym correction"}
                    </h3>

                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${status.color}`}>
                        {status.label}
                    </span>
                </div>

                {location && (
                    <p className="break-words text-sm text-app-text-secondary">
                        {location}
                    </p>
                )}

                <p className="text-sm text-app-text-secondary">
                    {submission.kind === "NEW_GYM" ? "New gym" : submission.kind}
                </p>
            </div>
        </article>
    );
}
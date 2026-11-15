import type { LeaderboardEntry } from "./progress.types";

type LeaderboardProps = {
    entries: LeaderboardEntry[];
    currentUserId: string | null;
};

export default function Leaderboard({
    entries,
    currentUserId,
}: LeaderboardProps) {
    return (
        <section className="min-h-96 w-full flex-1 rounded-md border-2 border-app-border bg-app-surface p-5 ">
            <h2 className="text-xl font-semibold">Leaderboard</h2>
            <ol className="mt-4 space-y-3">
                {entries.map((entry, index) => (
                    <li
                        key={entry.id}
                        className="flex items-center justify-between border-b border-app-border pb-2 text-sm last:border-b-0 last:pb-0"
                    >
                        <span className="flex items-center gap-3">
                            <span className="w-6 text-right font-semibold tabular-nums text-app-text-muted">
                                {String(index + 1).padStart(2, "0")}
                            </span>
                            <span>
                                {entry.username}
                                {entry.id === currentUserId && " (You)"}
                            </span>
                        </span>
                        <span className="text-app-text-secondary">{entry.xp} XP</span>
                    </li>
                ))}
                {entries.length === 0 && (
                    <p className="mt-4 text-app-text-secondary">
                        No friends to rank yet. Add friends to see them here.
                    </p>
                )}
            </ol>
        </section>
    );
}

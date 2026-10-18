type LeaderboardEntry = {
    id: string;
    username: string;
    xp: number;
};

export const fakeLeaderboard: LeaderboardEntry[] = [
    { id: "aymen", username: "Aymen", xp: 5200 },
    { id: "mohhamed", username: "Mohhamed", xp: 9000 },
    { id: "ziad", username: "Ziad", xp: 4300 },
    { id: "abdlhamid", username: "Abdlhamid", xp: 3900 },
    { id: "mehdi", username: "Mehdi", xp: 3500 },
    { id: "nour", username: "Nour", xp: 3100 },
    { id: "hamza", username: "Hamza", xp: 2700 },
    { id: "khadija", username: "Khadija", xp: 2300 },
];

type LeaderboardProps = {
    entries: LeaderboardEntry[];
    currentUserId: string | null;
};

export default function Leaderboard({
    entries,
    currentUserId,
}: LeaderboardProps) {
    return (
        <section className="min-h-96 w-full flex-1 rounded-md border-2 border-app-border bg-app-surface p-5">
            <h2 className="text-xl font-semibold">Leaderboard</h2>
            <ol className="mt-4 space-y-3">
                {entries.map((entry, index) => (
                    <li
                        key={`${entry.username}-${entry.xp}`}
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
            </ol>
        </section>
    );
}

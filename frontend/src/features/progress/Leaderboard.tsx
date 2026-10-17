type LeaderboardEntry = {
    username: string;
    xp: number;
};

export const fakeLeaderboard: LeaderboardEntry[] = [
    { username: "Aymen", xp: 5200 },
    { username: "Mohhamed", xp: 9000 },
    { username: "Ziad", xp: 4300 },
    { username: "Abdlhamid", xp: 3900 },
    { username: "Mehdi", xp: 3500 },
    { username: "Nour", xp: 3100 },
    { username: "Hamza", xp: 2700 },
    { username: "Khadija", xp: 2300 },
];

type LeaderboardProps = {
    username: string | null;
    xp: number;
};

export default function Leaderboard({ username, xp }: LeaderboardProps) {
    const entries = username
        ? [...fakeLeaderboard, { username, xp }].sort((a, b) => b.xp - a.xp)
        : fakeLeaderboard;

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
                            {entry.username === username && " (You)"}
                            </span>
                        </span>
                        <span className="text-app-text-secondary">{entry.xp} XP</span>
                    </li>
                ))}
            </ol>
        </section>
    );
}

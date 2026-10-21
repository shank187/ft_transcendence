import { Crown } from "lucide-react";

type GymBroOfTheMonthProps = {
    username: string;
    xp: number;
};

export default function GymBroOfTheMonth({
    username,
    xp,
}: GymBroOfTheMonthProps) {
    return (
        <section className="min-h-96 w-full flex-1 rounded-md border-2 border-app-primary bg-app-primary/10 p-5">
            <h2 className="text-center text-xl font-semibold text-amber-300">Gym Bro of the Month</h2>
            <div className="mt-8 flex flex-col items-center text-center">
                <div className="flex h-25 w-30 shrink-0 items-center justify-center rounded-full border-7 border-app-primary-muted">
                    <Crown
                        className="h-12 w-12 text-yellow-300"
                        strokeWidth={2.5}
                    />
                </div>
            <p className="mt-8 text-2xl font-bold text-amber-300">{username}</p>
            <p className="mt-2 text-amber-300">{xp} XP</p>
            </div>
        </section>
    );
}

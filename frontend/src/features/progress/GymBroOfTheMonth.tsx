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
            <h2 className="text-xl font-semibold">Gym Bro of the Month</h2>
            <div className="mt-8 flex flex-col items-center text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-app-primary bg-app-primary text-3xl font-bold text-app-canvas">
                    {username.charAt(0)}
                </div>
                <p className="mt-4 text-2xl font-bold">{username}</p>
                <p className="mt-2 text-app-text-secondary">1st place · {xp} XP</p>
            </div>
        </section>
    );
}

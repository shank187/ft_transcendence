import Container from "./Container";

function Progress() {
    return (
        <section id="progress" className="bg-[#131313]">
            <Container className="grid gap-6 py-24 lg:grid-cols-2 lg:py-32">
                <article className="flex flex-col gap-6 rounded-lg border border-app-border bg-app-canvas p-7 text-app-text sm:p-9">
                    <h2 className="font-display text-4xl font-semibold uppercase leading-none sm:text-5xl">Progress you can count.</h2>
                    <p className="max-w-[40ch] text-app-text-secondary">
                        +100 XP for every workout, +50 for every personal record. Every 500 XP is a new level.
                    </p>
                    <img
                        src="/landing/phone-mockups/progress.png"
                        alt="Training progress example: Level 5, 350 of 500 XP toward the next level and a friends leaderboard"
                        className="mx-auto mt-auto w-full max-w-xs"
                        width={897}
                        height={1752}
                        loading="lazy"
                    />
                </article>

                <article className="flex flex-col gap-6 rounded-lg border border-app-border bg-app-canvas p-7 text-app-text sm:p-9">
                    <h2 className="font-display text-4xl font-semibold uppercase leading-none sm:text-5xl">Train with your crew.</h2>
                    <p className="max-w-[40ch] text-app-text-secondary">
                        Add friends, see who’s online and chat live. The leaderboard ranks you against your friends only.
                    </p>
                    <img
                        src="/landing/phone-mockups/social.png"
                        alt="Social example with Sara, Youssef and Aymane online and conversations about training"
                        className="mx-auto mt-auto w-full max-w-xs"
                        width={897}
                        height={1752}
                        loading="lazy"
                    />
                </article>
            </Container>
        </section>
    );
}

export default Progress;

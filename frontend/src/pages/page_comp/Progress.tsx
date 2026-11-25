import Container from "./Container";
import { CrewPanel, LevelPanel } from "./AppCards";

// One wide card: your level on the left, your friends on the right.
function Progress() {
    return (
        <section id="progress">
            <Container className="flex flex-col gap-10 py-20 lg:py-24">
                <h2 className="font-display text-5xl font-semibold uppercase leading-none sm:text-6xl">Progress you can count.</h2>

                <div className="grid gap-10 rounded-lg border border-app-border bg-app-surface p-6 sm:p-10 lg:grid-cols-[3fr_2fr] lg:gap-16">
                    <div className="flex flex-col justify-between gap-6">
                        <LevelPanel />
                        <p className="max-w-[44ch] text-app-text-secondary">
                            +100 XP for every workout, +50 for every personal record. Every 500 XP is a new level.
                        </p>
                    </div>

                    <div className="flex flex-col justify-between gap-6">
                        <CrewPanel />
                        <p className="max-w-[44ch] text-app-text-secondary">
                            Add friends, see who’s online and chat live. The leaderboard ranks you against your friends only.
                        </p>
                    </div>
                </div>
            </Container>
        </section>
    );
}

export default Progress;

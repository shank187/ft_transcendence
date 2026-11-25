import Container from "./Container";
import { RepaLogo } from "./Logo";

// One screw in each corner of the sign. The strings are the absolute positions of each corner.
const screws = ["left-3.5 top-3.5", "right-3.5 top-3.5", "bottom-3.5 left-3.5", "bottom-3.5 right-3.5"];

function LogSection() {
    return (
        <section id="log" className="border-b border-app-border">
            <Container className="flex flex-col gap-16 py-24 lg:flex-row lg:items-center lg:gap-24 lg:py-32">
                {/* left: a gym-style sign and one sentence under it */}
                <div className="flex flex-1 flex-col gap-8">
                    <div
                        role="img"
                        aria-label="Gym-style sign reading: Log it or it didn't happen"
                        className="relative flex max-w-[560px] flex-col gap-7 rounded-sm bg-app-text px-8 pb-9 pt-11 text-app-canvas sm:px-12"
                    >
                        {screws.map((position) => (
                            <span
                                key={position}
                                aria-hidden="true"
                                className={`absolute h-2 w-2 rounded-full bg-neutral-400 ${position}`}
                            />
                        ))}
                        <span className="font-display text-6xl font-bold uppercase leading-[0.9] sm:text-7xl lg:text-8xl">
                            Log it or it didn’t happen.
                        </span>
                        <div className="flex items-center justify-between border-t-2 border-black pt-4">
                            <RepaLogo className="h-6 w-auto" dark />
                            <span className="font-mono text-xs uppercase tracking-wider">House rule</span>
                        </div>
                    </div>
                    <p className="max-w-[44ch] text-lg text-app-text-secondary">
                        Every set is saved with its weight and reps. Mark warm-ups, heavy sets, drop sets and sets to
                        failure, and the live timer keeps the clock while you train.
                    </p>
                </div>

                <figure className="mx-auto w-full max-w-xs">
                    <img
                        src="/landing/phone-mockups/workout-summary.png"
                        alt="Completed Push A workout: 52 minutes 14 seconds, nine sets, 3300 kg volume and 150 XP"
                        className="w-full"
                        width={897}
                        height={1752}
                        loading="lazy"
                    />
                </figure>
            </Container>
        </section>
    );
}

export default LogSection;

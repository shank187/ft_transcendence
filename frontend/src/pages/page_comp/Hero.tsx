import { Link } from "react-router-dom";
import Container from "./Container";
import AppShot from "./AppShot";
import { WorkoutCard } from "./AppCards";
import { shots } from "./shots";

// The one loud moment of the page: our real dorm gym photo behind the headline.
// The photo sits under a flat dark layer (80% canvas) so the text keeps strong contrast.
// pt-28 leaves room for the navbar, which is placed on top of this section.
function Hero() {
    return (
        <section id="top" className="relative isolate">
            <img
                src="/landing/dorm-green.jpg"
                alt="Our campus dorm gym under green neon: preacher bench, plates and cable machines"
                className="absolute inset-0 -z-10 h-full w-full object-cover"
                width={1152}
                height={1536}
                fetchPriority="high"
            />
            <div className="absolute inset-0 -z-10 bg-app-canvas/80" aria-hidden="true" />

            <Container className="flex flex-col gap-14 pb-20 pt-28 lg:flex-row lg:items-center lg:gap-24 lg:pb-28 lg:pt-36">
                <div className="flex flex-1 flex-col gap-8">
                    <h1 className="font-display text-7xl font-semibold uppercase leading-[0.9] sm:text-8xl lg:text-9xl">
                        Repeat.
                        <br />
                        <span className="text-app-primary">Rise.</span>
                    </h1>
                    <p className="max-w-[34ch] text-xl text-app-text-secondary">
                        The workout log that knows your gym. Pick where you train, plan with the exercises its
                        equipment supports, and log every set.
                    </p>
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-wrap items-center gap-7">
                            <Link
                                to="/register"
                                className="rounded-sm bg-app-primary px-6 py-3 font-semibold text-app-canvas hover:bg-app-primary-muted"
                            >
                                Create your account
                            </Link>
                            <Link to="/login" className="border-b border-app-text-secondary pb-0.5 font-medium hover:border-app-text">
                                Log in
                            </Link>
                        </div>
                        <span className="text-sm text-app-text-secondary">Sign up with email or Google.</span>
                    </div>
                </div>

                <div className="w-full max-w-md lg:flex-none">
                    <AppShot
                        src={shots.workout}
                        alt="Workout in progress: bench press sets with weight and reps, a new personal record and a live timer"
                    >
                        <WorkoutCard />
                    </AppShot>
                </div>
            </Container>
        </section>
    );
}

export default Hero;

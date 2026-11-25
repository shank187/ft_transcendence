import { Link } from "react-router-dom";
import Container from "./Container";
import { WorkoutCard } from "./AppCards";
import Glow from "./Glow";

// A real photo of our dorm gym behind the hero, with a dark layer on top so the text stays readable.
// The photo and the layers sit at -z-10 (behind the content); "isolate" keeps them inside this section.
// pt-28 leaves room for the navbar, which is placed on top of this section.
function Hero() {
    return (
        <section id="top" className="relative isolate overflow-hidden">
            {/* Decorative (the text and the card carry the meaning), so alt is empty.
                Phones: the whole photo at its real 4:3 shape across the top, never cropped to a slice.
                Desktop: it covers the hero (a 4:3 photo in a wide box only loses a thin top and bottom strip). */}
            <img
                src="/landing/hero.jpg"
                alt=""
                className="absolute inset-x-0 top-0 -z-10 aspect-[4/3] w-full object-cover lg:inset-y-0 lg:aspect-auto lg:h-full"
                width={2048}
                height={1536}
                fetchPriority="high"
            />
            {/* Phones: the photo fades from lightly dark at the top into the black page at its bottom edge. */}
            <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 -z-10 aspect-[4/3] bg-linear-to-b from-app-canvas/30 to-app-canvas lg:hidden"
            />
            {/* Desktop: darkest behind the text (left), light behind the card (right) so the gym shows. */}
            <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 hidden bg-linear-to-r from-app-canvas/90 via-app-canvas/60 to-app-canvas/20 lg:block"
            />
            {/* Desktop: fades the photo into the black page at the bottom. */}
            <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 hidden h-40 bg-linear-to-t from-app-canvas lg:block" />

            <Container className="flex flex-col gap-14 pb-24 pt-28 lg:flex-row lg:items-center lg:gap-24 lg:pb-32 lg:pt-40">
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

                <div className="relative isolate w-full max-w-md lg:flex-none">
                    <Glow className="-right-10 -top-10 size-64 bg-app-primary/30" />
                    <Glow className="-bottom-12 -left-12 size-56 bg-app-primary/15" />
                    <WorkoutCard />
                </div>
            </Container>
        </section>
    );
}

export default Hero;

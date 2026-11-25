import Container from "./Container";

// The gym mindset in three lines, on a gym photo like a poster on the wall.
// Each line is pushed further right and gets bigger, so the block climbs like stairs (the "rise" idea).
// Full class names so Tailwind can find them.
const lines = [
    { text: "Show up.", className: "text-3xl sm:text-5xl lg:text-7xl" },
    { text: "Add one rep.", className: "pl-3 text-4xl sm:pl-8 sm:text-6xl lg:pl-24 lg:text-8xl" },
    { text: "Beat last week.", className: "pl-6 text-5xl text-app-primary sm:pl-16 sm:text-7xl lg:pl-48 lg:text-9xl" },
];

function Motivation() {
    return (
        <section className="relative isolate overflow-hidden">
            {/* Desktop loads the landscape photo (R1), phones the portrait one (dorm-green),
                so each screen gets a photo close to its own shape and nothing is cropped to a thin band.
                alt is empty: the photo is decoration behind the words. */}
            <picture>
                <source media="(min-width: 1024px)" srcSet="/landing/motivation.jpg" />
                <img
                    src="/landing/dorm-green.jpg"
                    alt=""
                    className="absolute inset-0 -z-10 h-full w-full object-cover"
                    loading="lazy"
                />
            </picture>
            {/* black at the top and bottom edges (blends into the page), lighter in the middle (the gym shows) */}
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-b from-app-canvas via-app-canvas/60 to-app-canvas" />

            <Container className="flex min-h-[560px] items-center py-24 lg:min-h-[760px]">
                <h2 className="flex flex-col gap-2 font-display font-semibold uppercase leading-[0.95]">
                    {lines.map((line) => (
                        <span key={line.text} className={line.className}>
                            {line.text}
                        </span>
                    ))}
                </h2>
            </Container>
        </section>
    );
}

export default Motivation;

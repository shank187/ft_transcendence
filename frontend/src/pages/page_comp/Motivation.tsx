import Container from "./Container";

// The gym mindset in three lines. Each line is pushed further right and gets bigger,
// so the block climbs like stairs (the same "rise" idea as the team cards).
// Full class names so Tailwind can find them.
const lines = [
    { text: "Show up.", className: "text-3xl sm:text-7xl" },
    { text: "Add one rep.", className: "pl-3 text-4xl sm:pl-12 sm:text-7xl lg:pl-24 lg:text-8xl" },
    { text: "Beat last week.", className: "pl-6 text-5xl sm:pl-24 sm:text-8xl lg:pl-48 lg:text-9xl" },
];

function Motivation() {
    return (
        <section>
            <Container className="py-20 lg:py-28">
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

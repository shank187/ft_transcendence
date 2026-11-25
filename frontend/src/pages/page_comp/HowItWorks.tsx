import Container from "./Container";
import { RepaMark } from "./Logo";

const steps = [
    { title: "Plan", text: "Split your plan into up to seven training days, each with its exercises, sets and targets." },
    { title: "Train", text: "Start a day from your plan. One workout runs at a time, with a live timer." },
    { title: "Log", text: "Tick each set with its weight and reps: warm-up, heavy, drop or failure. A new PR shows as you log it." },
    { title: "Rise", text: "Finish to see your time, sets, volume and PRs, and earn XP toward your next level." },
];

// This is the only light section of the page, on purpose: it breaks the dark and marks "the loop".
function HowItWorks() {
    return (
        <section id="how" className="bg-app-text text-app-canvas">
            <Container className="flex flex-col gap-12 py-20 lg:py-24">
                <h2 className="max-w-[16ch] font-display text-5xl lg:max-w-none font-semibold uppercase leading-none sm:text-6xl">
                    Same loop. Higher every week.
                </h2>

                <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {steps.map((step, i) => {
                        const isLast = i === steps.length - 1;
                        return (
                            <li
                                key={step.title}
                                // the last step has a thicker top line: it is the one that "rises"
                                className={`flex flex-col gap-3 border-app-canvas pt-5 ${isLast ? "border-t-4" : "border-t-2"}`}
                            >
                                <span className="font-display text-2xl font-semibold text-neutral-600">0{i + 1}</span>
                                <h3 className="flex items-center gap-2.5 font-display text-4xl font-semibold uppercase">
                                    {step.title}
                                    {isLast && <RepaMark className="h-8 w-8 flex-none" dark />}
                                </h3>
                                <p className="max-w-[30ch] text-neutral-600">{step.text}</p>
                            </li>
                        );
                    })}
                </ol>
            </Container>
        </section>
    );
}

export default HowItWorks;

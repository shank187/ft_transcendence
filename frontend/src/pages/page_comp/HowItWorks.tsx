import Container from "./Container";
import { RepaMark } from "./Logo";

const steps = [
    { title: "Plan", text: "Split your plan into up to seven training days, each with its exercises, sets and targets." },
    { title: "Train", text: "Start a day from your plan, or an empty workout. One workout runs at a time." },
    { title: "Log", text: "Tick each set with its weight and reps. A new personal record lights up as you lift it." },
    { title: "Rise", text: "Finish to see your time, sets, volume and PRs, and earn XP toward your next level." },
];

// This is the only light section of the page, on purpose: it breaks the dark and marks "the loop".
function HowItWorks() {
    return (
        <section id="how" className="bg-app-text text-app-canvas">
            <Container className="flex flex-col gap-14 py-24 lg:py-28">
                <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                    <h2 className="max-w-[12ch] font-display text-5xl font-semibold uppercase leading-none sm:text-6xl lg:text-7xl">
                        Same loop. Higher every week.
                    </h2>
                    <p className="max-w-[40ch] text-lg text-neutral-600">
                        Progress comes from doing the work again and again, and writing it down. Repa keeps the loop simple.
                    </p>
                </div>

                <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {steps.map((step, i) => {
                        const isLast = i === steps.length - 1;
                        return (
                            <li
                                key={step.title}
                                // the last step has a thicker top line: it is the one that "rises"
                                className={`flex flex-col gap-3 border-black pt-5 ${isLast ? "border-t-4" : "border-t-2"}`}
                            >
                                <span className="font-mono text-sm text-neutral-600">0{i + 1}</span>
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

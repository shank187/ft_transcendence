import Container from "./Container";
import { GymCard } from "./AppCards";

const points = [
    { title: "Find your gym", text: "Search gyms by name or city and set the one you train at." },
    { title: "Training somewhere else?", text: "Add a private gym with the equipment you have. Only you can see it." },
    { title: "Missing a gym?", text: "Submit it. Once an admin verifies it, everyone can find it." },
];

function Gyms() {
    return (
        <section id="gyms">
            <Container className="flex flex-col gap-14 py-20 lg:flex-row lg:items-center lg:gap-24 lg:py-24">
                <div className="flex flex-col gap-7 lg:flex-1">
                    <h2 className="max-w-[11ch] font-display text-5xl font-semibold uppercase leading-none sm:text-6xl">
                        Plans that fit your gym.
                    </h2>
                    <p className="max-w-[42ch] text-lg text-app-text-secondary">
                        Set your gym once. The exercise picker shows what its equipment supports and tags everything
                        else “Not at” your gym, so the plan you build is one you can actually train.
                    </p>
                    {/* small facts: plain text, no cards */}
                    <ul className="flex flex-col gap-4">
                        {points.map((p) => (
                            <li key={p.title} className="flex flex-col gap-0.5">
                                <h3 className="font-semibold">{p.title}</h3>
                                <p className="text-app-text-secondary">{p.text}</p>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="w-full max-w-md lg:flex-none">
                    <GymCard />
                </div>
            </Container>
        </section>
    );
}

export default Gyms;

import Container from "./Container";

const points = [
    { title: "Find your gym", text: "Search gyms by name or city, check their machines and where they are, then make one yours." },
    { title: "Training somewhere else?", text: "Add a private gym with the equipment you have. Only you can see it." },
    { title: "Missing a gym?", text: "Submit it with a photo. Once an admin verifies it, everyone can find it." },
];

function Gyms() {
    return (
        <section id="gyms" className="border-t border-app-border">
            <Container className="flex flex-col gap-16 py-24 lg:flex-row lg:items-center lg:gap-32 lg:py-32">
                <figure className="order-2 mx-auto w-full max-w-xs lg:order-1 lg:flex-1">
                    <img
                        src="/landing/phone-mockups/workout-plan.png"
                        alt="Push, Pull and Legs plan with three training days, each with three exercises and nine sets"
                        className="w-full"
                        width={897}
                        height={1752}
                        loading="lazy"
                    />
                </figure>

                {/* right: the explanation */}
                <div className="order-1 flex flex-col gap-7 lg:order-2 lg:flex-1">
                    <h2 className="max-w-[11ch] font-display text-5xl font-semibold uppercase leading-none sm:text-6xl lg:text-7xl">
                        Plans that fit <span className="text-app-primary">your gym.</span>
                    </h2>
                    <p className="max-w-[40ch] text-lg text-app-text-secondary">
                        Set your gym once. The exercise picker can show only what its equipment supports, and tags
                        everything else “Not at” your gym, so the plan you build is one you can actually train.
                    </p>
                    <div className="flex flex-col gap-5">
                        {points.map((p) => (
                            <div key={p.title} className="flex flex-col gap-1.5 border-t border-app-border pt-4">
                                <h3 className="font-display text-xl font-semibold">{p.title}</h3>
                                <p className="text-app-text-secondary">{p.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </Container>
        </section>
    );
}

export default Gyms;

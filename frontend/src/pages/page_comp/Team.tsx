import Container from "./Container";


const team = [
    {
        name: "Salaheddine",
        role: "Product owner · dev",
        text: "Training progress, XP and levels, achievements and leaderboards.",
        photo: "/team/salaheddine.jpg",
    },
    {
        name: "Abdelhamid",
        role: "Project manager · dev",
        text: "Project coordination, authentication, account settings and app setup.",
        photo: "/team/abdelhamid.jpg",
    },
    {
        name: "Aymane",
        role: "Tech lead · dev",
        text: "Architecture, workout planning, exercises and training sessions.",
        photo: "/team/aymane.jpg",
    },
    {
        name: "Zyad",
        role: "Developer",
        text: "Gym discovery, equipment, gym details and community submissions.",
        photo: "/team/zyad.jpg",
    },
    {
        name: "Mohamed",
        role: "Developer",
        text: "Public profiles, friendships, online presence and live chat.",
        photo: "/team/mohamed.jpg",
    },
];

// Two real photos of our dorm gym. Files are in frontend/public/landing/.
const gymPhotos = [
    { src: "/landing/dorm-green.jpg", alt: "Free-weight zone of our dorm gym under green neon: preacher bench and cable machines", caption: "Free weights · green zone" },
    { src: "/landing/dorm-red.jpg", alt: "Cardio zone of our dorm gym under red neon: treadmills and bikes", caption: "Cardio · red zone" },
];

function Team() {
    return (
        <section id="team" className="border-t border-app-border">
            <Container className="flex flex-col gap-16 py-24 lg:py-32">
                {/* small band: where we tested the app */}
                <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex max-w-[34ch] flex-col gap-2">
                        <span className="font-display text-2xl font-semibold uppercase">Tested where we train.</span>
                        <p className="text-app-text-secondary">
                            Every set we logged while building Repa happened here, in our campus dorm gym.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        {gymPhotos.map((photo, i) => (
                            // the second photo is lifted a little (mb-10) so the pair looks like steps
                            <figure key={photo.src} className={`w-[45%] sm:w-[220px] ${i === 1 ? "mb-10" : ""}`}>
                                <img src={photo.src} alt={photo.alt} className="aspect-[3/4] w-full rounded-sm border border-app-border object-cover" />
                                <figcaption className="mt-2 font-mono text-xs text-app-text-secondary">{photo.caption}</figcaption>
                            </figure>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <h2 className="font-display text-5xl font-semibold uppercase leading-none sm:text-6xl lg:text-7xl">
                        The crew behind <span className="text-app-primary">every rep.</span>
                    </h2>
                    <p className="max-w-[48ch] text-lg text-app-text-secondary">
                        Repa is our ft_transcendence project at 42. Five people, five parts of the app.
                    </p>
                </div>

                <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
                    {team.map((member) => (
                        <li key={member.name} className="flex flex-col gap-4">
                            <img
                                src={member.photo}
                                alt={member.name}
                                className="aspect-[4/5] w-full rounded-lg border border-app-border object-cover"
                            />

                            <h3 className="font-display text-2xl font-semibold uppercase">{member.name}</h3>
                            <div className="flex flex-col gap-1">
                                <span className="font-mono text-xs uppercase tracking-wider text-app-primary">{member.role}</span>
                                <p className="text-sm text-app-text-secondary">{member.text}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </Container>
        </section>
    );
}

export default Team;

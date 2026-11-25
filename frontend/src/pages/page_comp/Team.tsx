import Container from "./Container";


const team = [
    {
        name: "Salaheddine",
        role: "Product owner and developer",
        text: "Training progress, XP and levels, achievements and leaderboards.",
        photo: "/team/salaheddine.jpg",
    },
    {
        name: "Abdelhamid",
        role: "Project manager and developer",
        text: "Project coordination, authentication, account settings and app setup.",
        photo: "/team/abdelhamid.jpg",
    },
    {
        name: "Aymane",
        role: "Tech lead and developer",
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

// On wide screens each card sits a little higher than the one before: the team "rises" like stairs.
// Full class names (not built from numbers) so Tailwind can find them.
const stepOffsets = ["lg:mt-24", "lg:mt-18", "lg:mt-12", "lg:mt-6", "lg:mt-0"];

function Team() {
    return (
        <section id="team" className="border-t border-app-border">
            <Container className="flex flex-col gap-12 py-20 lg:py-24">
                <div className="flex flex-col gap-3">
                    <h2 className="font-display text-5xl font-semibold uppercase leading-none sm:text-6xl">
                        The crew behind every rep.
                    </h2>
                    <p className="max-w-[48ch] text-lg text-app-text-secondary">
                        Repa is our ft_transcendence project at 42. Five people, five parts of the app.
                    </p>
                </div>

                <ul className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-5 lg:items-start">
                    {team.map((member, i) => (
                        <li key={member.name} className={`flex flex-col gap-3 ${stepOffsets[i]}`}>
                            <img
                                src={member.photo}
                                alt={member.name}
                                className="aspect-[4/5] w-full rounded-lg object-cover"
                                loading="lazy"
                            />
                            <div className="flex flex-col gap-1">
                                <h3 className="font-display text-2xl font-semibold uppercase">{member.name}</h3>
                                <span className="text-sm font-medium">{member.role}</span>
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

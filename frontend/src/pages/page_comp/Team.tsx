import Container from "./Container";
import type { ReactNode } from "react";

// GitHub and LinkedIn logos (from Simple Icons, free to use). lucide-react has no brand icons.
function GitHubIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
        </svg>
    );
}

function LinkedInIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
    );
}

// One square icon button. The label is read by screen readers (the icon alone says nothing).
function SocialLink({ href, label, children }: { href: string; label: string; children: ReactNode }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={label}
            className="flex size-9 items-center justify-center rounded-sm border border-app-border text-app-text-secondary hover:border-app-text hover:text-app-text"
        >
            {children}
        </a>
    );
}

// linkedin is "" when the person has none: the card then shows only GitHub.
const team = [
    {
        name: "Salaheddine",
        role: "Product owner and developer",
        text: "Training progress, XP and levels, achievements and leaderboards.",
        photo: "/team/salaheddine.jpg",
        github: "https://github.com/badrisalah",
        linkedin: "https://www.linkedin.com/in/salah-badri-340224325/",
    },
    {
        name: "Abdelhamid",
        role: "Project manager and developer",
        text: "Project coordination, authentication, account settings and app setup.",
        photo: "/team/abdelhamid.jpg",
        github: "https://github.com/Abdelhamid-9v",
        linkedin: "https://www.linkedin.com/in/abdelhamid-el-haddadi-793952331/",
    },
    {
        name: "Aymane",
        role: "Tech lead and developer",
        text: "Architecture, workout planning, exercises and training sessions.",
        photo: "/team/aymane.jpg",
        github: "https://github.com/shank187",
        linkedin: "https://www.linkedin.com/in/aymane-elbour-19315a253/",
    },
    {
        name: "Zyad",
        role: "Developer",
        text: "Gym discovery, equipment, gym details and community submissions.",
        photo: "/team/zyad.jpg",
        github: "https://github.com/ziad-fx",
        linkedin: "",
    },
    {
        name: "Mohamed",
        role: "Developer",
        text: "Public profiles, friendships, online presence and live chat.",
        photo: "/team/mohamed.jpg",
        github: "https://github.com/xlr8-444",
        linkedin: "https://www.linkedin.com/in/mohamed-ouarar-7112a6336/",
    },
];

// On wide screens each card sits a little higher than the one before: the team "rises" like stairs.
// Full class names (not built from numbers) so Tailwind can find them.
const stepOffsets = ["lg:mt-24", "lg:mt-18", "lg:mt-12", "lg:mt-6", "lg:mt-0"];

function Team() {
    return (
        <section id="team">
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
                            <div className="flex gap-2">
                                <SocialLink href={member.github} label={`${member.name} on GitHub`}>
                                    <GitHubIcon />
                                </SocialLink>
                                {member.linkedin && (
                                    <SocialLink href={member.linkedin} label={`${member.name} on LinkedIn`}>
                                        <LinkedInIcon />
                                    </SocialLink>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </Container>
        </section>
    );
}

export default Team;

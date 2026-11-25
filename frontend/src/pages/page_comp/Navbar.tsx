import { Link } from "react-router-dom";
import Container from "./Container";
import { RepaLogo } from "./Logo";

// The links that scroll to a section of this page (the id is set on each <section>).
const sectionLinks = [
    { label: "Gyms", href: "#gyms" },
    { label: "How it works", href: "#how" },
    { label: "Progress", href: "#progress" },
    { label: "Team", href: "#team" },
];

function Navbar() {
    return (
        <header>
            <Container className="flex items-center justify-between gap-3 py-5 sm:gap-4">
                <a href="#top" aria-label="Repa home">
                    <RepaLogo className="h-7 w-auto sm:h-8" />
                </a>

                <nav aria-label="Main" className="flex items-center gap-3 sm:gap-7">
                    {/* hidden on phones (md:flex) so the bar stays short */}
                    {sectionLinks.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="hidden text-sm text-app-text-secondary hover:text-app-text md:block"
                        >
                            {link.label}
                        </a>
                    ))}
                    <Link to="/login" className="text-xs font-medium hover:text-app-text-secondary sm:text-sm">
                        Log in
                    </Link>
                    <Link
                        to="/register"
                        className="rounded-sm bg-app-primary px-3 py-2.5 text-xs font-semibold text-app-canvas hover:bg-app-primary-muted sm:px-4 sm:text-sm"
                    >
                        Create account
                    </Link>
                </nav>
            </Container>
        </header>
    );
}

export default Navbar;

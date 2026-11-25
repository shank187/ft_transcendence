import { Link } from "react-router-dom";
import Container from "./Container";
import { RepaLogo } from "./Logo";

function Footer() {
    return (
        <footer className="border-t border-app-border">
            <Container className="flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
                <RepaLogo className="h-6 w-auto self-start" />
                <nav aria-label="Legal" className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-app-text-secondary">
                    <Link to="/privacy" className="hover:text-app-text">Privacy</Link>
                    <Link to="/terms" className="hover:text-app-text">Terms</Link>
                    <span>Gym photos: our 1337 dorm gyms</span>
                    <span>© 2026 Repa</span>
                </nav>
            </Container>
        </footer>
    );
}

export default Footer;

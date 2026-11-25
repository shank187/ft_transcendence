import { Link } from "react-router-dom";
import Container from "./Container";
import { RepaMark } from "./Logo";


function ClosingCta() {
    return (
        <section className="border-t border-app-border">
            <Container className="flex flex-col gap-10 py-20 lg:flex-row lg:items-center lg:justify-between lg:py-24">
                <div className="flex items-center gap-6">
                    <RepaMark className="h-20 w-20 flex-none" />
                    <h2 className="font-display text-5xl font-semibold uppercase leading-none sm:text-6xl lg:text-7xl">
                        Same time next week?
                    </h2>
                </div>
                <div className="flex flex-wrap items-center gap-7">
                    <Link
                        to="/register"
                        className="rounded-sm bg-app-primary px-6 py-3 font-semibold text-app-canvas hover:bg-app-primary-muted"
                    >
                        Create your account
                    </Link>
                    <Link to="/login" className="border-b border-app-border pb-0.5 font-medium hover:border-app-primary">
                        Log in
                    </Link>
                </div>
            </Container>
        </section>
    );
}

export default ClosingCta;

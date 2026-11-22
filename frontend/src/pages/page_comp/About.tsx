function About() {
    return (
        <div id="about" className="mx-auto mt-6 max-w-[1000px] px-4">
            <div className="bg-[#131416] p-6 text-white">
                <div className="text-center text-2xl font-semibold">About our team</div>
                <div className="mx-auto mt-3 max-w-2xl text-center text-app-text-secondary">
                    We are five developers building REPA to help you discover gyms,
                    organize your workouts, follow your progress, and connect with friends.
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-lg border border-app-border p-4">
                        <div className="text-lg font-semibold">Salaheddine</div>
                        <div className="mt-2 text-sm text-app-primary">Product Owner / Developer</div>
                        <div className="mt-2 text-sm text-app-text-secondary">
                            Training progress, XP and levels, achievements, and leaderboards.
                        </div>
                    </div>

                    <div className="rounded-lg border border-app-border p-4">
                        <div className="text-lg font-semibold">Abdelhamid</div>
                        <div className="mt-2 text-sm text-app-primary">Project Manager / Developer</div>
                        <div className="mt-2 text-sm text-app-text-secondary">
                            Project coordination, authentication, account settings, and application setup.
                        </div>
                    </div>

                    <div className="rounded-lg border border-app-border p-4">
                        <div className="text-lg font-semibold">Aymane</div>
                        <div className="mt-2 text-sm text-app-primary">Technical Lead / Developer</div>
                        <div className="mt-2 text-sm text-app-text-secondary">
                            Application architecture, workout planning, exercises, and training sessions.
                        </div>
                    </div>

                    <div className="rounded-lg border border-app-border p-4">
                        <div className="text-lg font-semibold">Zyad</div>
                        <div className="mt-2 text-sm text-app-primary">Developer</div>
                        <div className="mt-2 text-sm text-app-text-secondary">
                            Gym discovery, equipment, gym details, and community submissions.
                        </div>
                    </div>

                    <div className="rounded-lg border border-app-border p-4">
                        <div className="text-lg font-semibold">Mohamed</div>
                        <div className="mt-2 text-sm text-app-primary">Developer</div>
                        <div className="mt-2 text-sm text-app-text-secondary">
                            Public profiles, friendships, online presence, and live chat.
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default About;

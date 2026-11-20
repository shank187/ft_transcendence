function Feature(){
    return(
        <div id="features" className="max-w-[1000px] mt-6 mx-auto px-4">
            <div className="bg-[#131416] p-6 text-white">
                <div className="mb-4 text-xl font-semibold">
                    What you can do
                </div>

                <div className="flex flex-col gap-12">
                    <div className="flex flex-col items-center gap-6 md:flex-row">
                        <img src="/landing-mockups/gyms.png" alt="Gym discovery on a phone" className="w-56 max-w-full" loading="lazy" />
                        <div className="flex-1 text-center">
                            <div className="text-2xl font-semibold">Discover gyms</div>
                            <div className="mx-auto mt-3 max-w-md leading-relaxed text-app-text-secondary">
                                Find gyms by city and explore their equipment and details.
                                Choose a gym that fits your needs and set it as your current gym.
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-6 md:flex-row">
                        <img src="/landing-mockups/workouts.png" alt="Workout plan on a phone" className="w-56 max-w-full" loading="lazy" />
                        <div className="flex-1 text-center">
                            <div className="text-2xl font-semibold">Plan your workouts</div>
                            <div className="mx-auto mt-3 max-w-md leading-relaxed text-app-text-secondary">
                                Create workout plans and organize your training days.
                                Add exercises and sets, then start a session and record your performance.
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-6 md:flex-row">
                        <img src="/landing-mockups/progress.png" alt="Training progress on a phone" className="w-56 max-w-full" loading="lazy" />
                        <div className="flex-1 text-center">
                            <div className="text-2xl font-semibold">Track your progress</div>
                            <div className="mx-auto mt-3 max-w-md leading-relaxed text-app-text-secondary">
                                See your completed workouts, earned XP, and unlocked achievements.
                                Follow your progression as you keep training and reach new milestones.
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-6 md:flex-row">
                        <img src="/landing-mockups/social.png" alt="Online friends and conversations on a phone" className="w-56 max-w-full" loading="lazy" />
                        <div className="flex-1 text-center">
                            <div className="text-2xl font-semibold">Connect with friends</div>
                            <div className="mx-auto mt-3 max-w-md leading-relaxed text-app-text-secondary">
                                Add friends, see who is online, and keep your conversations in one place.
                                Share training updates and stay connected through chat.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


export default Feature;

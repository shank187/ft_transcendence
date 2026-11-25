import Container from "./Container";

// Real photos of our 1337 dorm gyms in Khouribga. R1 to R5 are the same gyms the seed adds
// as verified gyms (backend/prisma/seed-data/verified-gyms.json); dorm-red is R5.
// "tall" photos are portrait: on the grid they take two rows, the others take one.
const photos = [
    { src: "/landing/dorm-green.jpg", alt: "Dorm gym under green neon: preacher bench, plates and cable machines", tall: true },
    { src: "/landing/gyms/r1.jpg", alt: "R1 dorm gym: squat racks, benches and plates under green light", tall: false },
    { src: "/landing/gyms/r2.jpg", alt: "R2 dorm gym: cable station, benches and storage shelves", tall: false },
    { src: "/landing/dorm-red.jpg", alt: "R5 dorm gym under red neon: treadmills and bikes", tall: true },
    { src: "/landing/gyms/r3.jpg", alt: "R3 dorm gym: dumbbell rack, adjustable bench and barbell", tall: false },
    { src: "/landing/gyms/r4.jpg", alt: "R4 dorm gym: dumbbell rack, benches and a loaded barbell", tall: false },
];

function WhereWeTrain() {
    return (
        <section className="border-t border-app-border">
            <Container className="flex flex-col gap-10 py-20 lg:py-24">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
                    <h2 className="font-display text-5xl font-semibold uppercase leading-none sm:text-6xl lg:flex-none">
                        Tested where we train.
                    </h2>
                    <p className="max-w-[46ch] text-lg text-app-text-secondary">
                        Every set we logged while building Repa happened in our dorm gyms at 1337 Khouribga. All five
                        are in the app as verified gyms: search “Khouribga” to find them.
                    </p>
                </div>

                {/* 2 columns on phones, 4 on wide screens. Tall photos fill two rows. */}
                <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                    {photos.map((photo) => (
                        <li key={photo.src} className={photo.tall ? "row-span-2" : ""}>
                            <img
                                src={photo.src}
                                alt={photo.alt}
                                className={`w-full rounded-lg object-cover ${photo.tall ? "h-full" : "aspect-[4/3]"}`}
                                loading="lazy"
                            />
                        </li>
                    ))}
                </ul>
            </Container>
        </section>
    );
}

export default WhereWeTrain;

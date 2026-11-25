// A soft blurred spot of color placed behind a frosted card, so the card's blur has color to show.
// Decorative only (aria-hidden). Its position and size come from className.
// The parent needs "relative isolate" so the -z-10 keeps the glow behind the card, not behind the page.
function Glow({ className }: { className: string }) {
    return <div aria-hidden="true" className={`pointer-events-none absolute -z-10 rounded-full blur-3xl ${className}`} />;
}

export default Glow;

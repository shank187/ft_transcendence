import type { ReactNode } from "react";

type AppShotProps = {
    src: string;
    alt: string;
    children: ReactNode;
};

// Shows the real screenshot when we have one, otherwise the HTML card passed as children.
// role="img" makes a screen reader read the card as one picture with the same alt text.
function AppShot({ src, alt, children }: AppShotProps) {
    if (src) {
        return <img src={src} alt={alt} className="w-full rounded-lg border border-app-border" loading="lazy" />;
    }
    return (
        <div role="img" aria-label={alt}>
            {children}
        </div>
    );
}

export default AppShot;

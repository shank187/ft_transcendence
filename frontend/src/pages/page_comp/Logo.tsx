export function RepaMark({ className = "", dark = false }: { className?: string; dark?: boolean }) {
    return (
        <img
            src={dark ? "/landing/logos/repa-mark-dark.png" : "/landing/logos/repa-mark.png"}
            alt=""
            width={100}
            height={100}
            className={className}
        />
    );
}

export function RepaLogo({ className = "", dark = false }: { className?: string; dark?: boolean }) {
    return (
        <img
            src={dark ? "/landing/logos/repa-logo-dark.png" : "/landing/logos/repa-logo.png"}
            alt="Repa"
            width={374}
            height={136}
            className={className}
        />
    );
}

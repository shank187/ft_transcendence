type ProgressTabsProps = {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export default function ProgressTabs({
    activeTab,
    onTabChange,
}: ProgressTabsProps) {
    return (
        <nav className="flex flex-wrap gap-2 mb-5 ">
            
            <button type="button"
                onClick={() => onTabChange("progress")}
                className={`rounded-md px-5 py-3 font-semibold transition-colors ${
                activeTab === "progress"
                    ? "bg-app-primary text-app-canvas shadow-lg shadow-teal-800"
                    : "bg-app-surface text-app-text-secondary "
            }`}> Progress</button>

            <button type="button"
                onClick={() => onTabChange("Achievements")}
                className={`rounded-md px-5 py-3 font-semibold transition-colors ${
                activeTab === "Achievements"
                    ? "bg-app-primary text-app-canvas shadow-lg shadow-teal-800"
                    : "bg-app-surface text-app-text-secondary"
            }`}> Achievements</button>

            <button type="button"
                onClick={() => onTabChange("Analytics")}
                className={`rounded-md px-5 py-3 font-semibold transition-colors ${
                activeTab === "Analytics"
                    ? "bg-app-primary text-app-canvas shadow-lg shadow-teal-800"
                    : "bg-app-surface text-app-text-secondary"
            }`}> Analytics </button>

        </nav>
    );
}
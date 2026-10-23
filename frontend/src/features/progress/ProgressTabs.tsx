type ProgressTabsProps = {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export default function ProgressTabs({
    activeTab,
    onTabChange,
}: ProgressTabsProps) {
    return (
        <nav>
            <button type="button"
                onClick={() => onTabChange("progress")}>
                Progress</button>
            <button type="button"
                onClick={() => onTabChange("achievements")}>
                Achievements</button>
            <button type="button"
                onClick={() => onTabChange("analytics")}>
                Analytics</button>

            <p>Currently selected: {activeTab}</p>
        </nav>
    );
}
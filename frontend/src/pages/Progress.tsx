import { useEffect, useState } from "react";
import { getProgressSummary } from "../features/progress/progress.api";
import type { ProgressSummary } from "../features/progress/progress.types";

export default function Progress() {
    const [summary, setSummary] = useState<ProgressSummary | null>(null);

    useEffect(() => {
        getProgressSummary().then(setSummary);
    }, []);

    if (!summary) {
        return <p>Loading progress...</p>;
    }

    return (
        <section>
            <h1>Progress</h1>
            <p>Completed workouts: {summary.completedWorkouts}</p>
            <p>Total volume: {summary.totalVolume}</p>
            <p>Period: {summary.period}</p>
        </section>
    );
}

import { useEffect, useState } from "react";
import { getProgressSummary } from "../features/progress/progress.api";
import type { ProgressSummary } from "../features/progress/progress.types";
import LoadingState from "../components/states/LoadingState";
import ErrorState from "../components/states/ErrorState";

export default function Progress() {
    const [summary, setSummary] = useState<ProgressSummary | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getProgressSummary()
            .then(setSummary)
            .catch(() => setError("Could not load progress"));
    }, []);

    if (error) {
        return <ErrorState message={error} />;
    }

    if (!summary) {
        return <LoadingState message="Loading progress..." />;
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

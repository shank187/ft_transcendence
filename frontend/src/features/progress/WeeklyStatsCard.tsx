import { useEffect, useState } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { useAuth } from "../auth/AuthContext";
import { getWeeklyStats } from "./progress.api";
import type { WeeklyStats } from "./progress.types";

export default function WeeklyStatsCard() {
    const { user } = useAuth();

    const [stats, setStats] = useState<WeeklyStats | null>(null);
    const [error, setError] = useState(false);
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        if (!user?.id) return;

        let ignore = false;
        setStats(null);
        setError(false);

        getWeeklyStats()
            .then((data) => {
                if (!ignore) setStats(data);
            })
            .catch(() => {
                if (!ignore) setError(true);
            });

        return () => {
            ignore = true;
        };
    }, [user?.id, attempt]);

    return (
        <Card className="min-w-0 space-y-6 border border-app-border">
            <div>
                <h2 className="text-sm font-semibold uppercase">
                    This week
                </h2>
                <p className="text-sm text-app-text-secondary">
                    Monday–Sunday · UTC
                </p>
            </div>

            {error ? (
                <div className="space-y-3">
                    <p role="alert" className="text-sm text-app-danger">
                        Could not load your weekly stats.
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => setAttempt((current) => current + 1)}
                    >
                        Retry
                    </Button>
                </div>
            ) : stats === null ? (
                <p role="status" className="text-app-text-secondary">
                    Loading weekly stats…
                </p>
            ) : stats.workouts === 0 ? (
                <p className="text-app-text-secondary">
                    No workouts yet this week.
                </p>
            ) : (
                <dl className="grid grid-cols-2 gap-4">
                    <div>
                        <dt className="text-sm text-app-text-secondary">
                            Workouts
                        </dt>
                        <dd className="text-2xl font-bold">
                            {stats.workouts}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-sm text-app-text-secondary">
                            Completed sets
                        </dt>
                        <dd className="text-2xl font-bold">
                            {stats.sets}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-sm text-app-text-secondary">
                            Volume (kg)
                        </dt>
                        <dd className="text-2xl font-bold">
                            {stats.volumeKg.toLocaleString(undefined, {
                                maximumFractionDigits: 1,
                            })}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-sm text-app-text-secondary">
                            Personal records
                        </dt>
                        <dd className="text-2xl font-bold">
                            {stats.prs}
                        </dd>
                    </div>
                </dl>
            )}
        </Card>
    );
}
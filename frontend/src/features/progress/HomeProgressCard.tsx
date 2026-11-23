import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import WeeklyStatsCard from './WeeklyStatsCard';
import type { ProgressSummary } from './progress.types';

type HomeProgressCardProps = {
    progress: ProgressSummary | null;
    ranking: number | null;
    error: string;
};

export default function HomeProgressCard({
    progress,
    ranking,
    error,
}: HomeProgressCardProps) {
    const [showWeekly, setShowWeekly] = useState(false);
    const navigate = useNavigate();

    return (
        <Card className="flex h-80 min-w-0 flex-col gap-6 border border-app-border">
            <div className="min-h-0 flex-1 overflow-y-auto">
                {showWeekly ? (
                    <WeeklyStatsCard />
                ) : (
                    <div className="space-y-6">
                        <h2 className="text-sm font-semibold uppercase">
                            Your progress
                        </h2>

                        {error ? (
                            <p role="alert" className="text-sm text-app-danger">
                                {error}
                            </p>
                        ) : progress === null ? (
                            <p role="status" className="text-app-text-secondary">
                                Loading your progress...
                            </p>
                        ) : (
                            <dl className="grid grid-cols-2 gap-4">
                                <div>
                                    <dt className="text-sm text-app-text-secondary">
                                        Total XP
                                    </dt>
                                    <dd className="text-2xl font-bold">
                                        {progress.totalXp}
                                    </dd>
                                </div>

                                <div>
                                    <dt className="text-sm text-app-text-secondary">
                                        Friends ranking
                                    </dt>
                                    <dd className="text-2xl font-bold">
                                        {ranking === null ? '—' : `#${ranking}`}
                                    </dd>
                                </div>

                                <div>
                                    <dt className="text-sm text-app-text-secondary">
                                        Achievements
                                    </dt>
                                    <dd className="text-2xl font-bold">
                                        {progress.achievements.length}
                                    </dd>
                                </div>
                            </dl>
                        )}
                    </div>
                )}
            </div>

            <div className="flex shrink-0 flex-wrap gap-3">
                <Button onClick={() => setShowWeekly((current) => !current)}>
                    {showWeekly ? 'Show your progress' : 'Show weekly stats'}
                </Button>
                        
                <Button onClick={() => navigate('/progress')}>
                    View progress
                </Button>
            </div>
        </Card>
    );
}
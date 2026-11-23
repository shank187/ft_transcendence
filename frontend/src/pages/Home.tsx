import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { useAuth } from '../features/auth/AuthContext';
import api from '../features/auth/axiosInstance';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import {
    getProgressSummary,
    getLeaderboard,
} from '../features/progress/progress.api';
import type {
    ProgressSummary,
    LeaderboardEntry,
} from '../features/progress/progress.types';
import HomeProgressCard from '../features/progress/HomeProgressCard';
import { FriendsListHome } from '../features/chat/FriendsList';
import type { FriendData } from '../features/chat/chat.types';
import { useWebSocket } from './WebSocketContext';
import { getNextDay } from '../features/workouts/shared/get-plan-details';
import NextWorkoutCard, { type NextDayState } from '../features/workouts/shared/NextWorkoutCard';

function Home() {
    const { user, setUser } = useAuth();
    const { onlineUserIds, lastMessage, connectionStatus } = useWebSocket();
    const navigate = useNavigate();

    const [progress, set_progress] = useState<ProgressSummary | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [friends, set_friends] = useState<FriendData[] | null>(null);
    const [nextDayState, setNextDayState] = useState<NextDayState>({
        status: 'loading',
    });

    const [profile_error, set_profile_error] = useState('');
    const [progress_error, set_progress_error] = useState('');
    const [friends_error, set_friends_error] = useState('');

    const friendshipUpdate =
        lastMessage?.type === 'friendship_updated' ? lastMessage : null;

    useEffect(() => {
        async function loadProfile() {
            try {
                const response = await api.get('/api/users/me');
                setUser(response.data);
                set_profile_error('');
            } catch (error) {
                if (isAxiosError(error)) {
                    set_profile_error(
                        error.response?.data?.message ||
                            'Could not refresh your profile.'
                    );
                } else {
                    set_profile_error('Could not refresh your profile.');
                }
            }
        }

        async function loadNextWorkoutDay() {
            setNextDayState({ status: 'loading' });

            try {
                const data = await getNextDay();
                setNextDayState({ status: 'success', result: data });
            } catch (error) {
                setNextDayState({
                    status: 'failure',
                    message:
                        error instanceof Error
                            ? error.message
                            : 'Could not load your next workout. Check your workouts page.',
                });
            }
        }

        async function loadProgress() {
            try {
                const [summary, entries] = await Promise.all([
                    getProgressSummary(),
                    getLeaderboard(),
                ]);

                set_progress(summary);
                setLeaderboard(entries);
                set_progress_error('');
            } catch (error) {
                if (isAxiosError(error)) {
                    set_progress_error(
                        error.response?.data?.message ||
                            'Could not load your progress.'
                    );
                } else {
                    set_progress_error('Could not load your progress.');
                }
            }
        }

        loadProfile();
        loadNextWorkoutDay();
        loadProgress();
    }, [setUser]);

    useEffect(() => {
        async function loadFriends() {
            try {
                const response = await api.get<FriendData[]>('/api/friends');
                set_friends(response.data);
                set_friends_error('');
            } catch (error) {
                if (isAxiosError(error)) {
                    set_friends_error(
                        error.response?.data?.message ||
                            'Could not load your friends.'
                    );
                } else {
                    set_friends_error('Could not load your friends.');
                }
            }
        }

        loadFriends();
    }, [friendshipUpdate]);

    const onlineFriends = (friends || []).filter((friend) =>
        onlineUserIds.includes(friend.id)
    );

    const rankingIndex = leaderboard.findIndex(
        (entry) => entry.id === user?.id
    );

    const ranking = rankingIndex >= 0 ? rankingIndex + 1 : null;

    return (
        <div className="mx-auto w-full max-w-6xl space-y-6">
            <h1 className="min-w-0 text-2xl font-bold sm:text-3xl">
                Welcome back, {user?.displayName}
            </h1>

            {profile_error && (
                <p role="alert" className="text-sm text-app-danger">
                    {profile_error}
                </p>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
                <NextWorkoutCard state={nextDayState} />

                <HomeProgressCard
                    progress={progress}
                    ranking={ranking}
                    error={progress_error}
                />

                <Card className="min-w-0 space-y-6 border border-app-border">
                    <h2 className="text-sm font-semibold uppercase">
                        Gym discovery
                    </h2>

                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold">
                            Find your next gym
                        </h3>
                        <p className="text-app-text-secondary">
                            Explore gyms, equipment and details.
                        </p>
                    </div>

                    <Button onClick={() => navigate('/gyms')}>
                        Browse gyms
                    </Button>
                </Card>

                <Card className="min-w-0 space-y-6 border border-app-border">
                    <h2 className="text-sm font-semibold uppercase">
                        Social
                    </h2>

                    {friends_error ? (
                        <p role="alert" className="text-sm text-app-danger">
                            {friends_error}
                        </p>
                    ) : friends === null ? (
                        <p role="status" className="text-app-text-secondary">
                            Loading your friends...
                        </p>
                    ) : connectionStatus !== 'connected' ? (
                        <p role="status" className="text-app-text-secondary">
                            Online status is currently unavailable.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            <FriendsListHome friends={onlineFriends} />
                            <p className="text-sm text-app-text-secondary">
                                Friends online: {onlineFriends.length}
                            </p>
                        </div>
                    )}

                    <Button onClick={() => navigate('/social')}>
                        Open chat
                    </Button>
                </Card>
            </div>
        </div>
    );
}

export default Home;
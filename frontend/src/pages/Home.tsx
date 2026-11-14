import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { useAuth } from '../features/auth/AuthContext';
import api from '../features/auth/axiosInstance';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import WorkoutPlanCard from '../features/workouts/plans/WorkoutPlanCard';
import { getWorkouts } from '../features/workouts/plans/plans.api';
import type { WorkoutPlan } from '../features/workouts/plans/plans.types';
import { getProgressSummary } from '../features/progress/progress.api';
import type { ProgressSummary } from '../features/progress/progress.types';
import FriendsList from '../features/chat/FriendsList';
import type { FriendData } from '../features/chat/chat.types';
import { useWebSocket } from './WebSocketContext';

function Home() {
    const { user, setUser, logout } = useAuth();
    const { onlineUserIds, lastMessage, connectionStatus } = useWebSocket();
    const navigate = useNavigate();

    const [workouts, set_workouts] = useState<WorkoutPlan[] | null>(null);
    const [progress, set_progress] = useState<ProgressSummary | null>(null);
    const [friends, set_friends] = useState<FriendData[] | null>(null);
    const [profile_error, set_profile_error] = useState('');
    const [workouts_error, set_workouts_error] = useState('');
    const [progress_error, set_progress_error] = useState('');
    const [friends_error, set_friends_error] = useState('');
    const [logout_error, set_logout_error] = useState('');
    const friendshipUpdate = lastMessage?.type === 'friendship_updated' ? lastMessage : null;

    useEffect(() => {
        async function loadProfile() {
            try {
                const response = await api.get('/api/users/me');
                setUser(response.data);
                set_profile_error('');
            } catch (error) {
                if (isAxiosError(error))
                    set_profile_error(error.response?.data?.message || 'Could not refresh your profile.');
                else
                    set_profile_error('Could not refresh your profile.');
            }
        }

        async function loadWorkouts() {
            try {
                const data = await getWorkouts();
                set_workouts(data);
                set_workouts_error('');
            } catch (error) {
                if (error instanceof Error)
                    set_workouts_error(error.message);
                else
                    set_workouts_error('Could not load your plans.');
            }
        }

        async function loadProgress() {
            try {
                const data = await getProgressSummary();
                set_progress(data);
                set_progress_error('');
            } catch (error) {
                if (isAxiosError(error))
                    set_progress_error(error.response?.data?.message || 'Could not load your progress.');
                else
                    set_progress_error('Could not load your progress.');
            }
        }

        loadProfile();
        loadWorkouts();
        loadProgress();
    }, [setUser]);

    useEffect(() => {
        async function loadFriends() {
            try {
                const response = await api.get<FriendData[]>('/api/friends');
                set_friends(response.data);
                set_friends_error('');
            } catch (error) {
                if (isAxiosError(error))
                    set_friends_error(error.response?.data?.message || 'Could not load your friends.');
                else
                    set_friends_error('Could not load your friends.');
            }
        }

        loadFriends();
    }, [friendshipUpdate]);

    async function handleLogout() {
        try {
            set_logout_error('');
            await logout();
            navigate('/login');
        } catch (error) {
            if (isAxiosError(error))
                set_logout_error(error.response?.data?.message || 'Could not log out. Please try again.');
            else
                set_logout_error('Could not log out. Please try again.');
        }
    }

    const onlineFriends = (friends || []).filter(friend => onlineUserIds.includes(friend.id));

    return (
        <div className="mx-auto w-full max-w-6xl space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <h1 className="min-w-0 text-2xl font-bold sm:text-3xl">
                    Welcome back, {user?.displayName}
                </h1>

                <Button variant="secondary" className="self-start" onClick={handleLogout}>Log out</Button>
            </div>

            {profile_error && <p role="alert" className="text-sm text-app-danger">{profile_error}</p>}
            {logout_error && <p role="alert" className="text-sm text-app-danger">{logout_error}</p>}

            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="min-w-0 space-y-6 border border-app-border">
                    <h2 className="text-sm font-semibold uppercase">Your workouts</h2>

                    {workouts_error ? (
                        <p role="alert" className="text-sm text-app-danger">{workouts_error}</p>
                    ) : workouts === null ? (
                        <p role="status" className="text-app-text-secondary">Loading your plans...</p>
                    ) : workouts.length === 0 ? (
                        <p className="text-app-text-secondary">No workout plans yet. Open workouts to create your first plan.</p>
                    ) : (
                        <WorkoutPlanCard workout={workouts[0]} />
                    )}

                    <Button variant="outline" className="border" onClick={() => navigate('/workouts')}>
                        All plans
                    </Button>
                </Card>

                <Card className="min-w-0 space-y-6 border border-app-border">
                    <h2 className="text-sm font-semibold uppercase">Your progress</h2>

                    {progress_error ? (
                        <p role="alert" className="text-sm text-app-danger">{progress_error}</p>
                    ) : progress === null ? (
                        <p role="status" className="text-app-text-secondary">Loading your progress...</p>
                    ) : (
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <p className="text-2xl font-bold">{progress.completedWorkouts}</p>
                                <p className="text-sm text-app-text-secondary">Completed workouts</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{progress.totalXp}</p>
                                <p className="text-sm text-app-text-secondary">Total XP</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{progress.achievements.length}</p>
                                <p className="text-sm text-app-text-secondary">Achievements</p>
                            </div>
                        </div>
                    )}

                    <Button variant="outline" className="border" onClick={() => navigate('/progress')}>
                        View progress
                    </Button>
                </Card>

                <Card className="min-w-0 space-y-6 border border-app-border">
                    <h2 className="text-sm font-semibold uppercase">Gym discovery</h2>
                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold">Find your next gym</h3>
                        <p className="text-app-text-secondary">Explore gyms, equipment and details.</p>
                    </div>
                    <Button onClick={() => navigate('/gyms')}>Browse gyms</Button>
                </Card>

                <Card className="min-w-0 space-y-6 border border-app-border">
                    <h2 className="text-sm font-semibold uppercase">Social</h2>

                    {friends_error ? (
                        <p role="alert" className="text-sm text-app-danger">{friends_error}</p>
                    ) : friends === null ? (
                        <p role="status" className="text-app-text-secondary">Loading your friends...</p>
                    ) : connectionStatus !== 'connected' ? (
                        <p role="status" className="text-app-text-secondary">Online status is currently unavailable.</p>
                    ) : (
                        <div className="space-y-3">
                            <FriendsList friends={onlineFriends} onSelectFriend={() => navigate('/social')} />
                            <p className="text-sm text-app-text-secondary">Friends online: {onlineFriends.length}</p>
                        </div>
                    )}

                    <Button onClick={() => navigate('/social')}>Open chat</Button>
                </Card>
            </div>
        </div>
    );
}

export default Home;

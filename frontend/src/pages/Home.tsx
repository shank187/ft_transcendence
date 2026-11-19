import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { useAuth } from '../features/auth/AuthContext';
import api from '../features/auth/axiosInstance';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { getProgressSummary } from '../features/progress/progress.api';
import type { ProgressSummary } from '../features/progress/progress.types';
import { FriendsListHome } from '../features/chat/FriendsList';
import type { FriendData } from '../features/chat/chat.types';
import { useWebSocket } from './WebSocketContext';
import { getNextDay } from '../features/workouts/shared/get-plan-details';
import StartDayButton from '../features/workouts/shared/StartDayButton';
import type {PlanDay } from '../../../shared/workouts';

function Home() {
    const { user, setUser } = useAuth();
    const { onlineUserIds, lastMessage, connectionStatus } = useWebSocket();
    const navigate = useNavigate();

    const [progress, set_progress] = useState<ProgressSummary | null>(null);
    const [friends, set_friends] = useState<FriendData[] | null>(null);
    const [profile_error, set_profile_error] = useState('');
    const [progress_error, set_progress_error] = useState('');
    const [friends_error, set_friends_error] = useState('');
    const friendshipUpdate = lastMessage?.type === 'friendship_updated' ? lastMessage : null;

    type NextDaystates= {status:"loading"} |{status: "success", result: PlanDay|null} | {status: "failure", message: string}
        
    const [nextDayState, setNextDayState] = useState<NextDaystates>({status:"loading"});

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

        async function loadNextWorkoutDay() {
            setNextDayState({status:"loading"})
            try {
                const data = await getNextDay();
                setNextDayState({status: "success", result: data});
            } catch (error) {
                setNextDayState({status: "failure", message: error instanceof Error ? error.message : "can't load your Next day, check your workouts page"});
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
                if (isAxiosError(error))
                    set_friends_error(error.response?.data?.message || 'Could not load your friends.');
                else
                    set_friends_error('Could not load your friends.');
            }
        }

        loadFriends();
    }, [friendshipUpdate]);

    const onlineFriends = (friends || []).filter(friend => onlineUserIds.includes(friend.id));

    return (
        <div className="mx-auto w-full max-w-6xl space-y-6">
            <h1 className="min-w-0 text-2xl font-bold sm:text-3xl">
                Welcome back, {user?.displayName}
            </h1>

            {profile_error && <p role="alert" className="text-sm text-app-danger">{profile_error}</p>}

            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="min-w-0 space-y-6 border border-app-border">
                    <h2 className="text-sm font-semibold uppercase">Next workout</h2>

                    {nextDayState.status === "loading" ? (
                        <p role="status" className="text-app-text-secondary">Loading your next workout...</p>
                    ) : nextDayState.status === "failure" ? (
                        <p role="alert" className="text-sm text-app-danger">{nextDayState.message}</p>
                    ) : nextDayState.result === null ? (
                        <div className="space-y-4">
                            <p className="text-app-text-secondary">You don't have any planned day yet.</p>
                            <Button variant="outline" className="border" onClick={() => navigate('/workouts')}>
                                Plan your workouts
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <h3 className="truncate text-xl font-semibold">{nextDayState.result.name}</h3>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <p className="text-2xl font-bold">{nextDayState.result.dayOrder}</p>
                                    <p className="text-sm text-app-text-secondary">Day</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{nextDayState.result.exerciseCount}</p>
                                    <p className="text-sm text-app-text-secondary">Exercises</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{nextDayState.result.setCount}</p>
                                    <p className="text-sm text-app-text-secondary">Sets</p>
                                </div>
                            </div>
                            <StartDayButton dayId={nextDayState.result.id} />
                        </div>
                    )}
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
                            <FriendsListHome friends={onlineFriends}/>
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

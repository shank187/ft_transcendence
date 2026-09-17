import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

function GuestRoute() {
    const { accessToken, user } = useAuth();

    if (accessToken) {
        if (!user || !user.onboardingCompletedAt)
            return <Navigate to="/onboarding" replace />;

        return <Navigate to="/home" replace />;
    }

    return <Outlet />;
}

export default GuestRoute;
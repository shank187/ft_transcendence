import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

function ProtectedRoute({require_onboarding = true})
{
    const { accessToken, user } = useAuth();

    if (!accessToken)
        return <Navigate to="/login" replace />;

    if (!require_onboarding)
        return <Outlet />;

    // if (!user)
    //     return <p>Loading profile...</p>;

    if (!user ||!user.onboardingCompletedAt)
        return <Navigate to="/onboarding" replace />;

    return <Outlet />;
}


export default ProtectedRoute;
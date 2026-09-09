import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
function Home() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    async function handleLogout() {
        await logout();
        navigate('/login');
    }

    return (
        <div>
            <h1>Dashboard / Home</h1>
            <p>Placeholder page - dashboard content goes here.</p>
            <button onClick={handleLogout}>Log Out</button>
        </div>
    );
}

export default Home;
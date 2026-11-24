import { Link, Outlet, useMatch, useNavigate } from 'react-router-dom';
import WebSocketProvider from "./WebSocketProvider"
import { useState, useEffect , useRef} from 'react';
import { isAxiosError } from 'axios';
import { useAuth } from '../features/auth/AuthContext';
import Button from '../components/ui/Button';
import { useWebSocket } from "../pages/WebSocketContext"

const nav_items = [
    { to: '/home', label: 'Home' },
    { to: '/gyms', label: 'Gyms' },
    { to: '/workouts', label: 'Workouts' },
    { to: '/progress', label: 'Progress' },
    { to: '/social', label: 'Social' },
    { to: '/profile', label: 'Profile' },
    { to: '/profile/settings', label: 'settings' }
];

const mobile_nav_items = [
    { to: '/home', label: 'Home' },
    { to: '/workouts', label: 'Workouts' },
    { to: '/gyms', label: 'Gyms' },
    { to: '/social', label: 'Social' },
];


const more_nav_items = [
    { to: "/progress", label: "Progress" },
    { to: "/profile", label: "Profile" },
    { to: "/profile/settings", label: "Settings" },
];


function LiveUpdatesNotice() {
    const { wasReplaced, reconnect } = useWebSocket()

    if (!wasReplaced)
        return null

    return (
        <div className="fixed right-3 bottom-16 z-40 flex w-max max-w-[calc(100%-1.5rem)] flex-wrap items-center gap-3 rounded-xl border border-app-border bg-app-surface p-4 shadow-lg md:right-6 md:bottom-6">
            <p role="status" className="text-sm text-app-danger">you were disconnected</p>
            <Button variant="outline" className="shrink-0 border" aria-label="Reconnect live updates" onClick={reconnect}>
                Reconnect
            </Button>
        </div>
    )
}

function MainLayout() {
    const [more , set_more] = useState(false);
    const [logout_error, set_logout_error] = useState('');
    const [is_logging_out, set_is_logging_out] = useState(false);
    const navigation_ref = useRef<HTMLDivElement>(null);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const isSocial = useMatch('/social') !== null;

    async function handle_logout() {
        if (is_logging_out)
            return;

        set_logout_error('');
        set_is_logging_out(true);

        try {
            await logout();
            set_more(false);
            navigate('/login', { replace: true });
        } catch (error) {
            if (isAxiosError(error))
                set_logout_error(error.response?.data?.message || 'Could not log out. Please try again.');
            else
                set_logout_error('Could not log out. Please try again.');
        } finally {
            set_is_logging_out(false);
        }
    }

    function add_more()
    {
        if(more)
            set_more(false);
        else
            set_more(true);
    }

    useEffect(()=> {
        function handle_click(event :MouseEvent){
            const navigation = navigation_ref.current;
             if (!navigation)
                return;
            if (!(event.target instanceof Node))
                return;
            if (!navigation.contains(event.target))
                set_more(false);
        }
        document.addEventListener("click", handle_click);
    return () => {
         document.removeEventListener("click", handle_click);
    };
    }, []);
    return (
    <WebSocketProvider>
        <div className={`${isSocial ? 'min-h-dvh' : 'min-h-screen'} bg-app-canvas md:flex`}>
            <div className="hidden h-screen w-56 flex-col bg-app-surface p-4 md:sticky md:top-0 md:flex md:shrink-0">
                <nav className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
                    {nav_items.map((item)=> (
                        <Link key={item.to} to={item.to} className="px-3 py-2 hover:bg-app-surface-hover focus-visible:bg-app-surface-hover focus-visible:outline-none!" >{item.label}</Link>
                    ))}
                    {user?.roles.includes('ADMIN') && (
                        <Link to="/admin" className="px-3 py-2 hover:bg-app-surface-hover focus-visible:bg-app-surface-hover focus-visible:outline-none!">
                            Admin
                        </Link>
                    )}
                </nav>
                <div className="mt-auto pt-4">
                    {logout_error && <p role="alert" className="mb-2 text-sm text-app-danger">{logout_error}</p>}
                    <Button variant="secondary" className="w-full justify-start" onClick={handle_logout} disabled={is_logging_out}>
                        {is_logging_out ? 'Logging out...' : 'Log out'}
                    </Button>
                </div>
            </div>
            <div className={`min-w-0 md:flex-1 md:p-8 ${isSocial ? '' : 'p-4 pb-24'}`}>
                <LiveUpdatesNotice/>
                <Outlet />
            </div>

            <div ref={navigation_ref} className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-5   bg-app-surface md:hidden">

                {mobile_nav_items.map((item)=> (
                    <Link key={item.to} to={item.to} onClick={() => set_more(false)} className="min-w-0 py-4 text-center text-xs" >{item.label}</Link>
                ))}

               {more && (<div className="absolute bottom-full right-2 mb-2 w-44 rounded-lg border bg-app-surface p-2">
                        {more_nav_items.map((item) => (
                            <Link key={item.to} to={item.to} onClick={() => set_more(false)} className="block  px-3 py-3 text-sm hover:bg-app-surface-hover">
                                {item.label}
                            </Link>
                        ))}
                        {user?.roles.includes('ADMIN') && (
                            <Link to="/admin" onClick={() => set_more(false)} className="block px-3 py-3 text-sm hover:bg-app-surface-hover">
                                Admin
                            </Link>
                        )}
                        {logout_error && <p role="alert" className="px-3 py-2 text-sm text-app-danger">{logout_error}</p>}
                        <Button variant="secondary" className="w-full justify-start" onClick={handle_logout} disabled={is_logging_out}>
                            {is_logging_out ? 'Logging out...' : 'Log out'}
                        </Button>
                    </div>
                )}

                <button type="button" onClick={add_more} className="py-4 text-center text-xs">
                   {more ? "Less" : "More"}
                </button>
            </div>
        </div>
    </WebSocketProvider>
  );
}

export default MainLayout;

import { Link, Outlet, useMatch, useNavigate , useLocation} from 'react-router-dom';
import WebSocketProvider from "./WebSocketProvider"
import { useState, useEffect , useRef} from 'react';
import { isAxiosError } from 'axios';
import { useAuth } from '../features/auth/AuthContext';
import Button from '../components/ui/Button';
import { useWebSocket } from "../pages/WebSocketContext"


import { Home, Dumbbell, Zap, TrendingUp, Users, User, Settings, LogOut , ShieldUser} from 'lucide-react';


const nav_items = [
    { to: '/home', label: 'Home', icon : Home},
    { to: '/gyms', label: 'Gyms' , icon : Dumbbell},
    { to: '/workouts', label: 'Workouts' , icon : Zap},
    { to: '/progress', label: 'Progress' , icon : TrendingUp},
    { to: '/social', label: 'Social' , icon : Users },
    { to: '/profile', label: 'Profile' , icon : User },
    { to: '/profile/settings', label: 'settings' , icon : Settings}
];

const mobile_nav_items = [
    { to: '/home', label: 'Home', icon: Home },
    { to: '/workouts', label: 'Workouts' , icon: Zap},
    { to: '/gyms', label: 'Gyms' , icon: Dumbbell},
    { to: '/social', label: 'Social', icon: Users},
];


const more_nav_items = [
    { to: "/progress", label: "Progress", icon: TrendingUp},
    { to: "/profile", label: "Profile", icon: User },
    { to: '/privacy', label: 'privacy'},
    { to: '/terms', label: 'terms'},
    { to: "/profile/settings", label: "Settings" , icon: Settings},
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

    const location = useLocation();

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

                <Link to="/home" className="flex items-center gap-3 px-1 mb-10">
                    <img src="/logo.png" alt="REPA Logo" className="w-9 h-9 object-contain shrink-0" />
                    <span className="text-xl font-extrabold text-white tracking-tight">REPA</span>
                </Link>

                <nav className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
                    {nav_items.map(function(item){
                        const Icon = item.icon;
                        const isActive = item.to === "/profile"
                            ? location.pathname === "/profile" || (location.pathname.startsWith("/profile/") && !location.pathname.startsWith("/profile/settings"))
                            : location.pathname.startsWith(item.to);
                        return (
                            <Link 
                                key={item.to}
                                to={item.to}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${isActive ?
                                            "bg-[#1E1E1E] text-[#CCFF00] border-r-2 border-[#CCFF00]" : "text-zinc-400 hover:text-white hover:bg-[#161616]"}`}>
                                                <Icon  className="w-5 h-5 shrink-0"/>
                                                <span>{item.label}</span>
                                            </Link>
                        )
                    })

                    }
                    {user?.roles.includes('ADMIN') && (
                        <Link 
                            to="/admin" 
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${location.pathname.startsWith('/admin') ?
                                        "bg-[#1E1E1E] text-[#CCFF00] border-r-2 border-[#CCFF00]" : "text-zinc-400 hover:text-white hover:bg-[#161616]"}`}>
                            <ShieldUser className="w-5 h-5 shrink-0"/>
                            <span>Admin</span>
                        </Link>
                    )}
                </nav>
                <div className="mt-auto pt-4">
                    {logout_error && <p role="alert" className="mb-2 text-sm text-app-danger">{logout_error}</p>}
                    <Button variant="secondary" className="w-full justify-start flex gap-2.5 items-center hover:text-[#CCFF00]" onClick={handle_logout} disabled={is_logging_out}>
                        <LogOut className="w-4 h-4 shrink-0"/>
                        {is_logging_out ? 'Logging out...' : 'Log out'}
                    </Button>
                </div>
            </div>
            <div className={`min-w-0 md:flex-1 md:p-8 ${isSocial ? '' : 'p-4 pb-24'}`}>
                <LiveUpdatesNotice/>
                <Outlet />
            </div>

            <div ref={navigation_ref} className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-5   bg-app-surface md:hidden">

                {mobile_nav_items.map((item)=> {
                    const Icon = item.icon;
                    const isActive = location.pathname.startsWith(item.to);
                    return (
                        <Link
                            key={item.to}
                            to={item.to}
                            onClick={function(){set_more(false)}}
                            aria-label={item.label}
                            className={`flex justify-around items-center py-4 transition-colors ${
                                        isActive ? "text-[#CCFF00]" : "text-zinc-400"
                            }`}>
                                <Icon className="w-6 h-6" aria-hidden="true"/>
                                <span className="sr-only">{item.label}</span>
                        </Link>
                    )
                })}

               {more && (<div className="absolute bottom-full right-2 mb-2 w-44 rounded-lg border bg-app-surface p-2">
                        {more_nav_items.map((item)=> {
                        const Icon = item.icon;
                        const isActive = item.to === "/profile"
                            ? location.pathname === "/profile" || (location.pathname.startsWith("/profile/") && !location.pathname.startsWith("/profile/settings"))
                            : location.pathname.startsWith(item.to);
                        return (
                            <Link
                                key={item.to}
                                to={item.to}
                                onClick={function(){set_more(false)}}
                                className={`flex items-center justify-center py-4 gap-2 transition-colors ${
                                            isActive ? "text-[#CCFF00]" : "text-zinc-400"
                                }`}>
                                {Icon && <Icon className="w-5 h-5"/>}
                                <span>{item.label}</span>

                            </Link>
                    )
                })}
                        {user?.roles.includes('ADMIN') && (
                            <Link
                                to="/admin"
                                onClick={() => set_more(false)}
                                className={`flex items-center justify-center py-4 gap-2 transition-colors ${
                                    location.pathname.startsWith('/admin') ? "text-[#CCFF00]" : "text-zinc-400 hover:text-white"
                                }`}
                            >
                                <ShieldUser className="w-5 h-5" />
                                <span>Admin</span>
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

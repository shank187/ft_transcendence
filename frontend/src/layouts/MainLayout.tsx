import { NavLink, Outlet } from 'react-router-dom';
import WebSocketProvider from "./WebSocketProvider"
import { useState, useEffect , useRef} from 'react';

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
    

function MainLayout() {

    const [more , set_more] = useState(false);
    const navigation_ref = useRef<HTMLDivElement>(null);

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
        <div className="min-h-screen bg-app-canvas md:flex">
            <div className="hidden md:flex  p-4 md:w-56 md:shrink-0 md:flex-col md:gap-2  md:border-app-border md:bg-app-surface">

                {nav_items.map((item)=> (
                    <NavLink key={item.to} to={item.to} className=" px-3 py-2 hover:bg-app-surface-hover" >{item.label}</NavLink>
                ))}
            </div>
            
            

            <div className="min-w-0 p-4 pb-24 md:flex-1 md:p-8">
                <Outlet />
            </div>

            <div ref={navigation_ref} className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-5   bg-app-surface md:hidden">

                {mobile_nav_items.map((item)=> (
                    <NavLink key={item.to} to={item.to} onClick={() => set_more(false)} className="min-w-0 py-4 text-center text-xs" >{item.label}</NavLink>
                ))}

               {more && (<div className="absolute bottom-full right-2 mb-2 w-44 rounded-lg border bg-app-surface p-2">
                        {more_nav_items.map((item) => (
                            <NavLink key={item.to} to={item.to} onClick={() => set_more(false)} className="block  px-3 py-3 text-sm hover:bg-app-surface-hover">
                                {item.label}
                            </NavLink>
                        ))}
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
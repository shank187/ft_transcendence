import { NavLink, Outlet } from 'react-router-dom';

const nav_items = [
    { to: '/home', label: 'Home' },
    { to: '/gyms', label: 'Gyms' },
    { to: '/workouts', label: 'Workouts' },
    { to: '/progress', label: 'Progress' },
    { to: '/social', label: 'Social' },
    { to: '/profile', label: 'Profile' },
    { to: '/profile/settings', label: 'settings' }
    

];
function MainLayout() {
  return (
        <div className="min-h-screen bg-app-canvas md:flex">
            <div className="flex gap-4 p-4 md:w-56 md:shrink-0 md:flex-col md:gap-2 md:border-r md:border-app-border md:bg-app-surface">

                {nav_items.map((item)=> (
                    <NavLink key={item.to} to={item.to} className="rounded-md px-3 py-2 hover:bg-app-surface-hover" >{item.label}</NavLink>
                ))}
            </div>

            <div className="p-8 md:flex-1">
                <Outlet />
            </div>
        </div>
  );
}

export default MainLayout;
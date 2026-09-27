import { NavLink, Outlet } from 'react-router-dom';

const nav_items = [
    { to: '/home', label: 'Home' },
    { to: '/workouts', label: 'Workouts' },
];

function MainLayout() {
  return (
        <div className="min-h-screen bg-gray-100 md:flex">
            <div className="flex gap-4 p-4 md:w-56 md:shrink-0 md:flex-col md:gap-2 md:border-r md:border-gray-200 md:bg-white">

                {nav_items.map((item)=> (
                    <NavLink to={item.to} className="rounded-md px-3 py-2 hover:bg-gray-100" >{item.label}</NavLink>
                ))}
            </div>

            <div className="p-8 md:flex-1">
                <Outlet />
            </div>
        </div>
  );
}

export default MainLayout;
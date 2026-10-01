import { NavLink, Outlet } from 'react-router-dom';

const nav_items = [
    { to: '/home', label: 'Home' },
    { to: '/gyms', label: 'Gyms' },
    { to: '/workouts', label: 'Workouts' },
    { to: '/progress', label: 'Progress' },
    { to: '/social', label: 'Social' },
    { to: '/profile', label: 'Profile' },
];

function nav_link_classes({ isActive }: { isActive: boolean }) {
    return `shrink-0 whitespace-nowrap rounded-md px-3 py-2 text-sm transition-colors ${
        isActive
            ? 'bg-app-canvas font-semibold text-app-primary'
            : 'text-app-text-secondary hover:bg-app-canvas hover:text-app-text'
    }`;
}

function MainLayout() {
  return (
        <div className="min-h-screen bg-app-canvas text-app-text md:flex">
            {/* mobile: top bar + bottom nav; desktop: sidebar */}
            <header className="sticky top-0 z-10 border-b border-app-border bg-app-surface px-4 py-3 font-semibold md:hidden">
                ft_transcendence
            </header>

            <aside className="hidden md:flex md:w-56 md:shrink-0 md:flex-col md:gap-6 md:border-r md:border-app-border md:bg-app-surface md:px-4 md:py-6">
                <span className="px-3 font-semibold">ft_transcendence</span>
                <nav className="flex flex-col gap-1">
                    {nav_items.map((item) => (
                        <NavLink key={item.to} to={item.to} className={nav_link_classes}>{item.label}</NavLink>
                    ))}
                </nav>
            </aside>

            <main className="p-4 pb-20 md:flex-1 md:p-8">
                <Outlet />
            </main>

            <nav className="fixed inset-x-0 bottom-0 z-10 flex gap-1 overflow-x-auto border-t border-app-border bg-app-surface p-2 md:hidden">
                {nav_items.map((item) => (
                    <NavLink key={item.to} to={item.to} className={nav_link_classes}>{item.label}</NavLink>
                ))}
            </nav>
        </div>
  );
}

export default MainLayout;

import { NavLink, Outlet } from 'react-router-dom';
import './MainLayout.css';

const navItems = [
  { to: '/home', label: 'Home' },
  { to: '/gyms', label: 'Gyms' },
  { to: '/workouts', label: 'Workouts' },
  { to: '/progress', label: 'Progress' },
  { to: '/social', label: 'Social' },
  { to: '/coaches', label: 'Coaches' },
  { to: '/profile', label: 'Profile' },
  { to: '/settings', label: 'Settings' },
];

function MainLayout() {
  return (
    <div className="app-layout">
      <header className="topbar">
        <span className="topbar-title">ft_transcendence</span>
      </header>

      <aside className="sidebar">
        <div className="sidebar-title">ft_transcendence</div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>

      <nav className="bottom-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `bottom-nav-link${isActive ? ' active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default MainLayout;
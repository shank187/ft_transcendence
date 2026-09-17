import { Routes, Route } from 'react-router-dom';
import Root from './features/auth/Root';
import Register from './features/auth/Register';
import Login from './features/auth/login';
import Onboarding from './features/auth/Onboarding';
import ProtectedRoute from './features/auth/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Workouts from './pages/Workouts'
import GuestRoute from './features/auth/GuestRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Root />} />
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/onboarding" element={<Onboarding />} />

        <Route element={<MainLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/workouts" element={<Workouts />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
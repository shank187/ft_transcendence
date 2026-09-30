import { Routes, Route } from 'react-router-dom';
import Root from './pages/Root';
import Register from './pages/Register';
import Login from './pages/login';
import Onboarding from './pages/Onboarding';
import ProtectedRoute from './features/auth/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Workouts from './pages/Workouts'
import GuestRoute from './features/auth/GuestRoute';
import CreatePlan from './pages/CreatePlan';

function App() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/" element={<Root />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

    <Route element={<ProtectedRoute require_onboarding={false} />}>
      <Route path="/onboarding" element={<Onboarding />} />
    </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="/workouts/new-plan" element={<CreatePlan />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
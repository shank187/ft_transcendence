import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';

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
useEffect(() => {
  const ws = new WebSocket('ws://localhost:3000/chat');

  ws.onopen = () => {
    console.log('WebSocket connected');
  };

  ws.onclose = () => {
    console.log('WebSocket disconnected');
  };

  return () => {
    ws.close();
  };
}, []);
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
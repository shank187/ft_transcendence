import { Routes, Route } from 'react-router-dom';
import Root from './features/auth/Root';
import Register from './features/auth/Register';
import Login from './features/auth/login';
import Onboarding from './features/auth/Onboarding';
import ProtectedRoute from './features/auth/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Exercises from './pages/Exercises'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Root />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/onboarding" element={<Onboarding />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/exercises" element={<Exercises />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
import Login from './routes/Login';
import Register from './routes/Register';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './routes/Dashboard';
import './App.css';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

const ProtectedRoute = () => {
  const { currentUser } = useAuth();
  return currentUser ? <Outlet /> : <Navigate to="/login" />;
};

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard/:id" element={<Dashboard />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;

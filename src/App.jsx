import './App.css';
import Login from './routes/Login';
import Register from './routes/Register';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './routes/Dashboard';
import BodyDataForm from './routes/BodyDataForm';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/bodydata" element={<BodyDataForm />} />
        <Route path="/dashboard/:id" element={<Dashboard />} />
      </Routes>
    </>
  );
}

export default App;

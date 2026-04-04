import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MapDashboard from './pages/MapDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import VolunteerDashboard from './pages/VolunteerDashboard';
import NGODashboard from './pages/NGODashboard';

function App() {
  const token = localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/map" element={token ? <MapDashboard /> : <Navigate to="/login" />} />
        <Route path="/volunteer" element={token ? <VolunteerDashboard /> : <Navigate to="/login" />} />
        <Route path="/ngo" element={token ? <NGODashboard /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
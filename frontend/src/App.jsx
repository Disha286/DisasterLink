import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MapDashboard from './pages/MapDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import VolunteerDashboard from './pages/VolunteerDashboard';

function App() {
  const token = localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/map"
          element={token ? <MapDashboard /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to="/login" />} />
        <Route path="/volunteer" element={token ? <VolunteerDashboard /> : <Navigate to="/login" />} />
        <Route path="/volunteer" element={token ? <VolunteerDashboard /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MapDashboard from './pages/MapDashboard';
import Login from './pages/Login';
import Register from './pages/Register';

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
      </Routes>
    </Router>
  );
}

export default App;
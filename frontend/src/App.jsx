import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { isAuthenticated } from './services/authService';
import './App.css';

// เช็คง่ายๆ ว่ามี token เก็บไว้ไหม ถ้าไม่มีเด้งไปหน้า login
// (ไม่ได้เช็คว่า token หมดอายุหรือยัง แต่ api.js มี interceptor ดักเรื่องนี้อยู่แล้ว
//  ถ้า token หมดอายุ ยิง request ครั้งแรกจะโดน 401 แล้วเด้งไป /login อัตโนมัติ)
function PrivateRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* AuthPage.jsx มี tab login/สมัครสมาชิกในตัวเดียวอยู่แล้ว เลยใช้ path เดียว */}
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* URL ที่ไม่มีอยู่จริง ให้เด้งกลับหน้าแรก */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
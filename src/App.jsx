import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomeWithAuth />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function Layout() {
  return (
    <div className="wrapper">
      <Navbar />
      <Outlet />
    </div>
  );
}

function HomeWithAuth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('auth_token');

  useEffect(() => {
    if (token) {
      fetch(`/api/auth/verify?token=${encodeURIComponent(token)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
            navigate('/', { replace: true });
            window.location.reload();
          }
        });
    }
  }, [token, navigate]);

  return <Home />;
}

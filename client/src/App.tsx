import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import { AuthResponse, User } from './types';
import { setAuthToken } from './services/api';

interface AuthState {
  token: string | null;
  user: User | null;
}

const App = () => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const savedToken = localStorage.getItem('clarityToken');
    const savedUser = localStorage.getItem('clarityUser');

    setAuthToken(savedToken);

    return {
      token: savedToken,
      user: savedUser ? (JSON.parse(savedUser) as User) : null,
    };
  });

  useEffect(() => {
    if (authState.token) {
      localStorage.setItem('clarityToken', authState.token);
      setAuthToken(authState.token);
    } else {
      localStorage.removeItem('clarityToken');
      setAuthToken(null);
    }
  }, [authState.token]);

  useEffect(() => {
    if (authState.user) {
      localStorage.setItem('clarityUser', JSON.stringify(authState.user));
    } else {
      localStorage.removeItem('clarityUser');
    }
  }, [authState.user]);

  const handleAuthSuccess = (payload: AuthResponse) => {
    setAuthToken(payload.token);
    setAuthState({ token: payload.token, user: payload.user });
  };

  const handleLogout = () => {
    setAuthState({ token: null, user: null });
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <LandingPage
              onAuthSuccess={handleAuthSuccess}
              isLoggedIn={Boolean(authState.token)}
              userName={authState.user?.name}
            />
          }
        />
        <Route
          path="/dashboard/*"
          element={
            authState.token && authState.user ? (
              <Dashboard user={authState.user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

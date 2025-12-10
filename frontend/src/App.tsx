import React, { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import NotificationSettings from './components/NotificationSettings';
import ProductCRUD from './components/ProductCRUD';
import { getCurrentUser, logout } from './api/api';
import './App.css';

// Lazy load components for performance optimization
const NotFound = lazy(() => import('./components/NotFound'));

// Type for authenticated user
export interface AuthUser {
  id: string;
  username: string;
  email: string;
}

// Main App component
const App: React.FC = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch current user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const userData = await getCurrentUser();
        setUser(userData);
        setError(null);
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            'Failed to authenticate user. Please login again.'
        );
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Handle user logout
  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setError(null);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Logout failed. Please try again.'
      );
    }
  };

  // Render loading spinner
  if (loading) {
    return (
      <div className="app-loading">
        <span>Loading...</span>
      </div>
    );
  }

  // Render error message if authentication fails
  if (error && !user) {
    return (
      <div className="app-error">
        <h2>Authentication Error</h2>
        <p>{error}</p>
        {/* Optionally, redirect to login page if implemented */}
      </div>
    );
  }

  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <h1>MCP Push Notification Preferences</h1>
          {user && (
            <div className="app-user-info">
              <span>Welcome, {user.username}</span>
              <button onClick={handleLogout} className="app-logout-btn">
                Logout
              </button>
            </div>
          )}
        </header>
        <nav className="app-nav">
          <ul>
            <li>
              <a href="/notifications">Notification Settings</a>
            </li>
            <li>
              <a href="/products">Product Management</a>
            </li>
          </ul>
        </nav>
        <main className="app-main">
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              {/* Protected routes: only accessible if authenticated */}
              <Route
                path="/notifications"
                element={
                  user ? (
                    <NotificationSettings user={user} />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route
                path="/products"
                element={
                  user ? (
                    <ProductCRUD user={user} />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              {/* Default route: redirect to notifications if authenticated */}
              <Route
                path="/"
                element={
                  user ? (
                    <Navigate to="/notifications" replace />
                  ) : (
                    <div className="app-welcome">
                      <h2>Welcome to MCP Push Notification Preferences</h2>
                      <p>Please log in to manage your settings.</p>
                    </div>
                  )
                }
              />
              {/* 404 Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <footer className="app-footer">
          <span>
            &copy; {new Date().getFullYear()} MCP Push Notification Preferences
          </span>
        </footer>
      </div>
    </Router>
  );
};

export default App;
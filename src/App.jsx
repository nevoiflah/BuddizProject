import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import BottomNav from './components/BottomNav';
import TopNav from './components/TopNav';
import Loader from './components/Loader';
import ErrorBoundary from './components/ErrorBoundary';
import Toast from './components/Toast';

// Lazy Load Pages
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Home = lazy(() => import('./pages/Home'));
const Catalogue = lazy(() => import('./pages/Catalogue'));
const Cart = lazy(() => import('./pages/Cart'));
const Favorites = lazy(() => import('./pages/Favorites'));
const Profile = lazy(() => import('./pages/Profile'));
const ConfirmEmail = lazy(() => import('./pages/ConfirmEmail'));
const OrderPending = lazy(() => import('./pages/OrderPending'));

import { useApp } from './context/AppContext';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
};

const Layout = ({ children }) => {
  const { toasts } = useApp();

  return (
    <>
      <TopNav />
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', backgroundColor: 'var(--color-bg)' }}>
        <main id="main-content" style={{ flex: 1 }}>
          {children}
        </main>
      </div>
      <BottomNav />
      <Toast toasts={toasts} />
    </>
  );
};

function App() {
  return (
    <AppProvider>
      <Router>
        <ScrollToTop />
        <Layout>
          <ErrorBoundary>
            <Suspense fallback={<Loader />}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/" element={<Home />} />
                <Route path="/catalogue" element={<Catalogue />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/confirm" element={<ConfirmEmail />} />
                <Route path="/order-pending" element={<OrderPending />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </Layout>
      </Router>
    </AppProvider>
  );
}

export default App;

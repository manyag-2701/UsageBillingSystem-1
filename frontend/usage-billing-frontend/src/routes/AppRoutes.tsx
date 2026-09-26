import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { SignupPage } from '../pages/SignupPage';
import { LoginPage } from '../pages/LoginPage';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { OperatorDashboardPage } from '../pages/OperatorDashboardPage';

interface AppRoutesProps {
  currentUser: { username: string; role: string } | null;
  logoutMsg: string;
  onLoginSuccess: (username: string, role: string) => void;
  onLogout: () => void;
}

export const AppRoutes: React.FC<AppRoutesProps> = ({
  currentUser,
  logoutMsg,
  onLoginSuccess,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'ADD' | 'ROLE' | 'DELETE' | 'REPORT'>('DETAILS');
  const [operatorActiveTab, setOperatorActiveTab] = useState<'PLANS' | 'ADD_PLAN' | 'EDIT_PLAN' | 'DELETE_PLAN' | 'REPORT'>('PLANS');

  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Public Home Page */}
        <Route path="/" element={<HomePage />} />

        {/* 2. Public Signup Page */}
        <Route path="/signup" element={<SignupPage />} />

        {/* 3. Public Login Page
        <Route
          path="/login"
          element={
            currentUser ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginPage
                onLoginSuccess={onLoginSuccess}
                logoutMessage={logoutMsg}
              />
            )
          }
        /> */}

        {/* 3. Login Page */}
        <Route
          path="/login"
          element={
            currentUser ? (
              <Navigate
                to={
                  currentUser.role === 'ADMIN'
                    ? '/admin'
                    : currentUser.role === 'OPERATOR'
                    ? '/operator'
                    : '/customer'
                }
                replace
              />
            ) : (
              <LoginPage
                onLoginSuccess={onLoginSuccess}
                logoutMessage={logoutMsg}
              />
            )
          }
        />

        {/* ================= ADMIN ================= */}

        <Route
          path="/admin"
          element={
            currentUser?.role === 'ADMIN' ? (
              <AdminDashboardPage
                username={currentUser.username}
                activeTab={activeTab}
                onSelectTab={(tab) => setActiveTab(tab)}
                onLogout={onLogout}
                onHomeClick={() => setActiveTab('DETAILS')}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* ================= OPERATOR ================= */}

        <Route
          path="/operator"
          element={
            currentUser?.role === 'OPERATOR' ? (
              <OperatorDashboardPage
  username={currentUser.username}
  activeTab={operatorActiveTab}
  onSelectTab={setOperatorActiveTab}
  onLogout={onLogout}
  onHomeClick={() => setOperatorActiveTab('PLANS')}
/>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* ================= CUSTOMER ================= */}

        <Route
          path="/customer"
          element={
            currentUser?.role === 'CUSTOMER' ? (
              <div>
                <h1>Customer Dashboard</h1>
                <p>Welcome, {currentUser.username}!</p>

                <button onClick={onLogout}>
                  Logout
                </button>
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />


        {/* 4. Protected Dashboard Route */}
        <Route
          path="/dashboard"
          element={
            currentUser ? (
              <AdminDashboardPage
                username={currentUser.username}
                activeTab={activeTab}
                onSelectTab={(tab) => setActiveTab(tab)}
                onLogout={onLogout}
                onHomeClick={() => setActiveTab('DETAILS')}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
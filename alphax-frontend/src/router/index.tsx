import React from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute, PublicOnlyRoute } from '../components/auth/ProtectedRoute';
import { Landing } from '../pages/Landing';
import { Login } from '../pages/Login';
import { Signup } from '../pages/Signup';
import { Dashboard } from '../pages/Dashboard';
import { Markets } from '../pages/Markets';
import { Charts } from '../pages/Charts';
import { AIIntelligence } from '../pages/AIIntelligence';
import { StrategyLab } from '../pages/StrategyLab';
import { Backtest } from '../pages/Backtest';
import { Journal } from '../pages/Journal';
import { TraderDNA } from '../pages/TraderDNA';
import { PropChallenge } from '../pages/PropChallenge';
import { EconomicCalendar } from '../pages/EconomicCalendar';
import { SettingsPage } from '../pages/Settings';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
  },
  {
    path: '/login',
    element: (
      <PublicOnlyRoute>
        <Login />
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/signup',
    element: (
      <PublicOnlyRoute>
        <Signup />
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/app/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'markets',
        element: <Markets />,
      },
      {
        path: 'charts',
        element: <Charts />,
      },
      {
        path: 'ai',
        element: <AIIntelligence />,
      },
      {
        path: 'strategy',
        element: <StrategyLab />,
      },
      {
        path: 'backtest',
        element: <Backtest />,
      },
      {
        path: 'journal',
        element: <Journal />,
      },
      {
        path: 'dna',
        element: <TraderDNA />,
      },
      {
        path: 'prop',
        element: <PropChallenge />,
      },
      {
        path: 'calendar',
        element: <EconomicCalendar />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/layout/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { ThingSpeakDataPage } from './pages/ThingSpeakDataPage';
import { PerformanceComparisonPage } from './pages/PerformanceComparisonPage';
import { AboutProjectPage } from './pages/AboutProjectPage';

const PageRenderer: React.FC = () => {
  const { currentPage } = useApp();

  switch (currentPage) {
    case 'dashboard':
      return <DashboardPage />;
    case 'telemetry':
    case 'thingspeak':
    case 'si-hardware':
      return <ThingSpeakDataPage />;
    case 'comparison':
      return <PerformanceComparisonPage />;
    case 'methodology':
    case 'about':
    case 'sic-simulation':
      return <AboutProjectPage />;
    default:
      return <DashboardPage />;
  }
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <Layout>
        <PageRenderer />
      </Layout>
    </AppProvider>
  );
};

export default App;

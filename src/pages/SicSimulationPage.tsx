import React from 'react';
import { useApp } from '../context/AppContext';
import { AboutProjectPage } from './AboutProjectPage';

// For backward compatibility, SicSimulationPage renders the technical methodology and documentation
export const SicSimulationPage: React.FC = () => {
  return <AboutProjectPage />;
};

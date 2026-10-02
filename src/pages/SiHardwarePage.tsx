import React from 'react';
import { ThingSpeakDataPage } from './ThingSpeakDataPage';

// For backward compatibility, SiHardwarePage renders the live ThingSpeakDataPage
export const SiHardwarePage: React.FC = () => {
  return <ThingSpeakDataPage />;
};

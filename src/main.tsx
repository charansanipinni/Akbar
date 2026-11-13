import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import './motion.css';
import Portfolio from './Portfolio';
createRoot(document.getElementById('root')!).render(<React.StrictMode><Portfolio/></React.StrictMode>);

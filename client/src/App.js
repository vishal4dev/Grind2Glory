import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider } from './context/AppContext';
import { ThemeModeProvider } from './context/ThemeContext';
import NavBar from './components/NavBar';
import PageLayout from './components/PageLayout';
import Home from './pages/Home';
import Rewards from './pages/Rewards';
import Settings from './pages/Settings';
import './App.css';

const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route 
          path="/" 
          element={
            <motion.div {...pageTransition} transition={{ duration: 0.3 }}>
              <Home />
            </motion.div>
          } 
        />
        <Route 
          path="/rewards" 
          element={
            <motion.div {...pageTransition} transition={{ duration: 0.3 }}>
              <Rewards />
            </motion.div>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <motion.div {...pageTransition} transition={{ duration: 0.3 }}>
              <Settings />
            </motion.div>
          } 
        />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ThemeModeProvider>
      <AppProvider>
        <BrowserRouter>
          <NavBar />
          <PageLayout>
            <AnimatedRoutes />
          </PageLayout>
        </BrowserRouter>
      </AppProvider>
    </ThemeModeProvider>
  );
}

export default App;
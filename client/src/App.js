import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider } from './context/AppContext';
import { ThemeModeProvider } from './context/ThemeContext';
import { PomodoroProvider } from './context/PomodoroContext';
import NavBar from './components/NavBar';
import PageLayout from './components/PageLayout';
import Home from './pages/Home';
import Analytics from './pages/Analytics';
import Rewards from './pages/Rewards';
import Settings from './pages/Settings';
import CurrentTask from './pages/CurrentTask';
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
          path="/analytics" 
          element={
            <motion.div {...pageTransition} transition={{ duration: 0.3 }}>
              <Analytics />
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
        <Route 
          path="/current-task" 
          element={
            <motion.div {...pageTransition} transition={{ duration: 0.3 }}>
              <CurrentTask />
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
        <PomodoroProvider>
          <BrowserRouter>
            <NavBar />
            <PageLayout>
              <AnimatedRoutes />
            </PageLayout>
          </BrowserRouter>
        </PomodoroProvider>
      </AppProvider>
    </ThemeModeProvider>
  );
}

export default App;
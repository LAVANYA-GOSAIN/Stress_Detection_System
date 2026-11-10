import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Assessment from './pages/Assessment';
import Results from './pages/Results';

/**
 * ScrollToTop helper component
 * Ensures that navigating between pages automatically resets window scroll.
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

/**
 * Root Application Component
 * Configures the router, persistent top-level navigation, and page routes.
 */
export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-[#FAF9FE] text-slate-800 antialiased selection:bg-violet-200 selection:text-violet-900">
        
        {/* Navigation Bar */}
        <Navbar />

        {/* Page Content Routed by URL */}
        <div className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/assessment" element={<Assessment />} />
            <Route path="/results" element={<Results />} />
            {/* Fallback route */}
            <Route path="*" element={<Home />} />
          </Routes>
        </div>

        {/* Footer */}
        <Footer />
        
      </div>
    </BrowserRouter>
  );
}

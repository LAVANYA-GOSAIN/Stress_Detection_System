import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Menu, X, ArrowRight, Sparkles } from 'lucide-react';

/**
 * Navbar Component
 * Provides top-level navigation, responsive mobile drawer,
 * and quick access to the assessment page.
 */
export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isAssessment = location.pathname.startsWith('/assessment');
  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-purple-100/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between transition-all ${isAssessment ? 'h-14 sm:h-16' : 'h-20'}`}>
          
          {/* Brand Logo & Name */}
          <Link 
            to="/" 
            className="flex items-center gap-3 group focus:outline-none"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-md shadow-violet-500/20 group-hover:scale-105 transition-transform duration-300">
              <Activity className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold tracking-tight text-slate-900 group-hover:text-violet-700 transition-colors">
                MindScope
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Stress Awareness Platform
              </span>
            </div>
          </Link>

          {/* On assessment page, hide all navbar navigation links and actions except MindScope */}
          {!isAssessment && (
            <>
              {/* Desktop Navigation Links */}
              <nav className="hidden md:flex items-center gap-10">
                <Link
                  to="/"
                  className={`text-base lg:text-lg font-semibold transition-colors duration-200 ${
                    isActive('/') 
                      ? 'text-violet-700 font-bold' 
                      : 'text-slate-600 hover:text-violet-600'
                  }`}
                >
                  Home
                </Link>
                <a
                  href="/#features"
                  className="text-base lg:text-lg font-semibold text-slate-600 hover:text-violet-600 transition-colors duration-200"
                >
                  Features
                </a>
                <a
                  href="/#about"
                  className="text-base lg:text-lg font-semibold text-slate-600 hover:text-violet-600 transition-colors duration-200"
                >
                  About
                </a>
              </nav>

              {/* Desktop CTA Button */}
              <div className="hidden md:flex items-center gap-4">
                <Link
                  to="/assessment"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-md shadow-violet-500/25 hover:shadow-lg hover:shadow-violet-500/35 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <Sparkles className="w-4 h-4 text-violet-200" />
                  <span>Start Assessment</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Mobile Hamburger Button */}
              <div className="flex md:hidden">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2.5 rounded-xl text-slate-600 hover:text-violet-700 hover:bg-violet-50 focus:outline-none transition-colors"
                  aria-label="Toggle Navigation Menu"
                >
                  {mobileMenuOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </button>
              </div>
            </>
          )}

        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {!isAssessment && mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-lg border-b border-purple-100 px-4 pt-3 pb-6 space-y-3 animate-fadeIn">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-4 py-3 rounded-xl text-lg font-semibold ${
              isActive('/') 
                ? 'bg-violet-50 text-violet-700 font-bold' 
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            Home
          </Link>
          <a
            href="/#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-3 rounded-xl text-lg font-semibold text-slate-700 hover:bg-slate-50"
          >
            Features
          </a>
          <a
            href="/#about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-3 rounded-xl text-lg font-semibold text-slate-700 hover:bg-slate-50"
          >
            About
          </a>
          <div className="pt-2">
            <Link
              to="/assessment"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 shadow-md shadow-violet-500/25"
            >
              <span>Take Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}


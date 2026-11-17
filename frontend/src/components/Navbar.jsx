import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  Menu,
  X,
  ArrowRight,
  Sparkles,
  User,
  LogOut,
  UserCheck,
  Heart,
  Users,
} from 'lucide-react';
import { getGuestSession, clearGuestSession } from '../services/guestStorage';
import GuestEntryModal from './GuestEntryModal';

/**
 * Navbar Component
 *
 * Provides top-level navigation, responsive mobile drawer,
 * session-aware user profile / "Sign Up / Login" button,
 * and public access to the Stress Relief Centre.
 */
export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [session, setSession] = useState(getGuestSession());
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalStep, setAuthModalStep] = useState('choice');
  const [targetDestination, setTargetDestination] = useState('/dashboard');

  const location = useLocation();
  const navigate = useNavigate();

  const isAssessment = location.pathname.startsWith('/assessment');
  const isActive = (path) => location.pathname === path;

  // Reactively track session changes across tabs, storage events, and modal actions
  useEffect(() => {
    const handleSessionUpdate = () => {
      setSession(getGuestSession());
    };

    window.addEventListener('mindscope_session_change', handleSessionUpdate);
    window.addEventListener('storage', handleSessionUpdate);

    return () => {
      window.removeEventListener('mindscope_session_change', handleSessionUpdate);
      window.removeEventListener('storage', handleSessionUpdate);
    };
  }, []);

  const openAuthModal = (step = 'choice', destination = '/dashboard') => {
    setAuthModalStep(step);
    setTargetDestination(destination);
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  const handleStartAssessmentClick = (e) => {
    e.preventDefault();
    if (session) {
      navigate('/assessment');
    } else {
      openAuthModal('choice', '/assessment');
    }
  };

  const handleLogout = () => {
    clearGuestSession();
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-purple-100/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between transition-all ${isAssessment ? 'h-14 sm:h-16' : 'h-20'}`}>
            
            {/* Brand Logo & Name: Always directs to Home */}
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

            {/* On assessment page or when signed in, hide public landing navigation links */}
            {!isAssessment && (
              <>
                {/* Desktop Navigation Links (Only shown when not signed in) */}
                {!session && (
                  <nav className="hidden md:flex items-center gap-7 lg:gap-8">
                    <Link
                      to="/"
                      className={`text-base font-semibold transition-colors duration-200 ${
                        isActive('/') 
                          ? 'text-violet-700 font-bold' 
                          : 'text-slate-600 hover:text-violet-600'
                      }`}
                    >
                      Home
                    </Link>

                    {/* Public Stress Relief Access */}
                    <Link
                      to="/relief"
                      className={`text-base font-semibold transition-colors duration-200 flex items-center gap-1.5 ${
                        isActive('/relief') 
                          ? 'text-violet-700 font-bold' 
                          : 'text-slate-600 hover:text-violet-600'
                      }`}
                    >
                      <Heart className="w-4 h-4 text-violet-500" />
                      <span>Relief Centre</span>
                    </Link>

                    <a
                      href="/#features"
                      className="text-base font-semibold text-slate-600 hover:text-violet-600 transition-colors duration-200"
                    >
                      Features
                    </a>
                    <a
                      href="/#about"
                      className="text-base font-semibold text-slate-600 hover:text-violet-600 transition-colors duration-200"
                    >
                      About
                    </a>
                  </nav>
                )}

                {/* Desktop Action Area: Both "Start Assessment" and "Sign Up / Login" / Profile */}
                <div className="hidden md:flex items-center gap-3.5">
                  
                  {/* Button 1: Start Assessment (Session-Guarded) */}
                  <button
                    type="button"
                    onClick={handleStartAssessmentClick}
                    className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-md shadow-violet-500/25 hover:shadow-lg hover:shadow-violet-500/35 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-violet-200" />
                    <span>Start Assessment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {/* Button 2: Profile Badge with Quick Switch/Exit OR Sign Up / Login */}
                  {session ? (
                    <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                      <Link
                        to="/dashboard"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-violet-50 hover:bg-violet-100 border border-violet-200/80 transition-colors group shadow-2xs"
                        title="Open your Guest Dashboard"
                      >
                        <div className="w-7 h-7 rounded-lg bg-violet-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                          {session.name ? session.name.charAt(0).toUpperCase() : 'G'}
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-xs font-bold text-slate-800 group-hover:text-violet-700 leading-tight">
                            {session.name}
                          </span>
                          <span className="text-[10px] text-violet-600 font-semibold leading-tight font-mono">
                            {session.guestId}
                          </span>
                        </div>
                      </Link>

                      <button
                        type="button"
                        onClick={() => openAuthModal('choice', '/dashboard')}
                        className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                        title="Switch guest profile"
                        aria-label="Switch guest profile"
                      >
                        <Users className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Exit Guest Session (Assessment history remains preserved)"
                        aria-label="Exit Guest Session"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openAuthModal('choice', '/dashboard')}
                      className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-violet-300 shadow-2xs hover:shadow transition-all duration-200 cursor-pointer"
                    >
                      <User className="w-4 h-4 text-violet-600" />
                      <span>Sign Up / Login</span>
                    </button>
                  )}
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
            {/* Active Guest Info in Mobile Drawer */}
            {session ? (
              <div className="p-3 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center font-bold text-xs">
                    {session.name ? session.name.charAt(0).toUpperCase() : 'G'}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{session.name}</div>
                    <div className="text-[11px] text-violet-600 font-semibold font-mono">{session.guestId}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openAuthModal('choice', '/dashboard')}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors"
                  >
                    Switch
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-100 transition-colors"
                  >
                    Exit
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => openAuthModal('choice', '/dashboard')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-base font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 transition-colors cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  <span>Sign Up / Login</span>
                </button>

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

                <Link
                  to="/relief"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-lg font-semibold ${
                    isActive('/relief') 
                      ? 'bg-violet-50 text-violet-700 font-bold' 
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Relief Centre (Public)
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
              </>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={handleStartAssessmentClick}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 shadow-md shadow-violet-500/25 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-violet-200" />
                <span>Start Assessment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Guest Entry / Switch Profile Modal */}
      <GuestEntryModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialStep={authModalStep}
        targetDestination={targetDestination}
      />
    </>
  );
}

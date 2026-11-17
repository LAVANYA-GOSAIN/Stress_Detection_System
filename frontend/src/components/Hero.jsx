import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import heroIllustration from '../assets/hero-illustration.png';
import { 
  ArrowRight, 
  Sparkles, 
  Heart, 
  Smile, 
  CheckCircle2, 
  Coffee, 
  Compass, 
  BookOpen,
  UserCheck,
} from 'lucide-react';
import { getGuestSession } from '../services/guestStorage';
import GuestEntryModal from './GuestEntryModal';

/**
 * Hero Component
 * User-focused introduction emphasizing mindfulness, self-awareness,
 * and supportive exploration of student lifestyle patterns.
 */
export default function Hero() {
  const [session, setSession] = useState(getGuestSession());
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalStep, setAuthModalStep] = useState('choice');
  const [targetDestination, setTargetDestination] = useState('/dashboard');
  const navigate = useNavigate();

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

  const handleStartAssessmentClick = (e) => {
    e.preventDefault();
    if (session) {
      navigate('/assessment');
    } else {
      setAuthModalStep('choice');
      setTargetDestination('/assessment');
      setAuthModalOpen(true);
    }
  };

  return (
    <>
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Decorative Background Glows */}
        <div 
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[620px] h-[360px] bg-gradient-to-tr from-violet-200/40 via-purple-200/30 to-indigo-100/40 blur-3xl -z-10 rounded-full pointer-events-none" 
          aria-hidden="true"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: User-Centered Headlines & Call to Actions */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              
              {/* Soft Wellness Tag */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-100/80 border border-violet-200/60 text-violet-800 text-xs sm:text-sm font-semibold tracking-wide shadow-sm">
                <Sparkles className="w-4 h-4 text-violet-600" />
                <span>Student Well-Being &amp; Mindful Reflection</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Take a Moment.{' '}
                <span className="bg-gradient-to-r from-violet-700 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Understand Yourself.
                </span>
              </h1>

              {/* Description Paragraph */}
              <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Student life comes with academic pressure, changing routines and everyday challenges. Take a few moments to reflect on different aspects of your well-being and gain a better understanding of your stress-related patterns.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  type="button"
                  onClick={handleStartAssessmentClick}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-7 py-3.5 rounded-2xl text-base font-semibold text-white bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/35 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                >
                  <span>Start Your Assessment</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <a
                  href="#features"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/80 shadow-sm hover:shadow transition-all duration-200"
                >
                  <span>Explore Features</span>
                </a>
              </div>

              {/* Guest Mode Trust Notice */}
              <div className="flex items-center justify-center lg:justify-start gap-2 text-xs font-medium text-slate-500 pt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  {session 
                    ? `Active Guest Session for ${session.name} • 100% private local storage`
                    : 'No account or login required • 100% private guest storage in this browser'}
                </span>
              </div>

              {/* Reassuring Pillars */}
              <div className="pt-6 border-t border-slate-200/70 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0 text-left">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-800">
                    <Smile className="w-4 h-4 text-violet-600" />
                    <span>Private</span>
                  </div>
                  <p className="text-xs text-slate-500">100% confidential reflection</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-800">
                    <Coffee className="w-4 h-4 text-indigo-600" />
                    <span>Gentle</span>
                  </div>
                  <p className="text-xs text-slate-500">No scoring or pressure</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-800">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    <span>Educational</span>
                  </div>
                  <p className="text-xs text-slate-500">Promotes self-awareness</p>
                </div>
              </div>

            </div>

            {/* Right Column: Warm, Calming Illustration with Floating Badges */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-full max-w-md lg:max-w-none">
                
                {/* Visual Glow Behind Image */}
                <div 
                  className="absolute inset-0 bg-gradient-to-tr from-violet-400/20 to-purple-300/30 blur-2xl rounded-3xl transform scale-95 -z-10" 
                  aria-hidden="true" 
                />

                {/* Primary Warm Character Image */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/10 border border-white/60 bg-white/40 backdrop-blur-xs">
                  <img
                    src={heroIllustration}
                    alt="Student taking a mindful pause with tea and notebook"
                    className="w-full h-auto object-cover transform hover:scale-[1.02] transition-transform duration-500 ease-out"
                    loading="eager"
                  />
                </div>

                {/* Floating Badge 1: 5 Reflection Dimensions */}
                <div className="absolute -top-4 -left-4 sm:-left-6 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-purple-100/80 flex items-center gap-2.5 transform -rotate-1 hover:rotate-0 transition-transform">
                  <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center text-violet-700">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-bold text-slate-900 leading-tight">5 Reflection Areas</p>
                    <p className="text-[10px] text-slate-500">Mind, Body, Studies &amp; More</p>
                  </div>
                </div>

                {/* Floating Badge 2: Machine Learning Transparency */}
                <div className="absolute -bottom-5 -right-3 sm:-right-5 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-purple-100/80 flex items-center gap-2.5 transform rotate-2 hover:rotate-0 transition-transform">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-bold text-slate-900 leading-tight">AI &amp; Self-Reflection</p>
                    <p className="text-[10px] text-slate-500">Transparent &amp; Non-Clinical</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Guest Entry Modal */}
      <GuestEntryModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialStep={authModalStep}
        targetDestination={targetDestination}
      />
    </>
  );
}

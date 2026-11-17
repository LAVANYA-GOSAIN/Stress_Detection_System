import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, Heart } from 'lucide-react';
import StressReliefCentre from '../components/dashboard/StressReliefCentre';

/**
 * Public Stress Relief Page
 *
 * Allows any visitor to use paced respiration (Box Breathing & 4-7-8)
 * and sensory grounding tools freely without requiring a guest session or account.
 */
export default function StressRelief() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="min-h-screen bg-[#FAF9FE] text-slate-800 antialiased selection:bg-violet-200 selection:text-violet-900 pb-20">
      {/* Top Gradient Stripe */}
      <div className="w-full h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10 space-y-6 animate-fadeIn">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-violet-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Free Public Wellness Tool</span>
          </span>
        </div>

        {/* The Interactive Stress Relief Centre Component */}
        <StressReliefCentre />

      </div>
    </main>
  );
}


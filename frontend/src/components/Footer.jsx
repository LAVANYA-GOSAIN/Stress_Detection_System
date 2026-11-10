import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, AlertCircle, Heart } from 'lucide-react';

const currentYear = new Date().getFullYear();

/**
 * Footer Component
 * Houses system navigation, project details, and the mandatory
 * educational/non-clinical disclaimer.
 *
 * Hidden on the assessment page for a focused, distraction-free check-in experience.
 */
export default function Footer() {
  const location = useLocation();

  // Hide footer on assessment page
  if (location.pathname.startsWith('/assessment')) {
    return null;
  }
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Top Section: Brand & Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center text-white">
                <Activity className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                MindScope
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Stress Awareness Platform for university students. Powered by a cross-validated Scikit-learn Gradient Boosting machine learning pipeline.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-800/80 text-violet-300 text-xs font-medium border border-slate-700/60">
              <span>College MLOps Project</span>
              <span>•</span>
              <span>FastAPI & React</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Platform Navigation
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-violet-400 transition-colors">
                  Home Overview
                </Link>
              </li>
              <li>
                <a href="/#features" className="hover:text-violet-400 transition-colors">
                  Features & Workflow
                </a>
              </li>
              <li>
                <a href="/#about" className="hover:text-violet-400 transition-colors">
                  About the Project
                </a>
              </li>
              <li>
                <Link to="/assessment" className="hover:text-violet-400 transition-colors">
                  Self-Assessment
                </Link>
              </li>
              <li>
                <Link to="/results" className="hover:text-violet-400 transition-colors">
                  Results Preview
                </Link>
              </li>
            </ul>
          </div>

          {/* Tech Stack Information */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              System Architecture
            </h4>
            <div className="space-y-2 text-xs text-slate-400 leading-relaxed">
              <p>
                <strong className="text-slate-200">ML Framework:</strong> Scikit-Learn 1.6.1 (Gradient Boosting Classifier)
              </p>
              <p>
                <strong className="text-slate-200">Backend:</strong> FastAPI with Pydantic v2 Strict Validation
              </p>
              <p>
                <strong className="text-slate-200">Frontend:</strong> React 19 + Vite 8 + Tailwind CSS v4
              </p>
              <p>
                <strong className="text-slate-200">Dataset Scope:</strong> 20 Empirical Student Lifestyle Attributes
              </p>
            </div>
          </div>

        </div>

        {/* Prominent Educational Disclaimer Box */}
        <div className="rounded-2xl bg-slate-800/80 border border-slate-700 p-5 sm:p-6 space-y-3">
          <div className="flex items-center gap-2.5 text-amber-400 font-semibold text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>Important Academic & Educational Disclaimer</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            MindScope is an educational machine learning demonstration developed as a college project to study multi-factor stress pattern detection. It does not provide medical diagnoses, psychological treatment, or clinical recommendations. If you or someone you know is experiencing chronic stress, fatigue, or anxiety, please connect with your institution&apos;s student counseling center or a qualified medical professional.
          </p>
        </div>

        {/* Bottom Bar: Copyright */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>
            &copy; {currentYear} MindScope Project. Built for Academic Demonstration.
          </p>
          <p className="flex items-center gap-1.5 text-slate-400">
            <span>Designed with</span>
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
            <span>for student mental health awareness</span>
          </p>
        </div>

      </div>
    </footer>
  );
}

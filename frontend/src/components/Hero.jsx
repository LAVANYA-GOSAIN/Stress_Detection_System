import React from 'react';
import { Link } from 'react-router-dom';
import heroIllustration from '../assets/hero-illustration.png';
import { 
  ArrowRight, 
  Sparkles, 
  Heart, 
  Smile, 
  CheckCircle2, 
  Coffee, 
  Compass, 
  BookOpen 
} from 'lucide-react';

/**
 * Hero Component
 * User-focused introduction emphasizing mindfulness, self-awareness,
 * and supportive exploration of student lifestyle patterns.
 */
export default function Hero() {
  return (
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
              <span>Student Well-Being & Mindful Reflection</span>
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
              <Link
                to="/assessment"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-7 py-3.5 rounded-2xl text-base font-semibold text-white bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/35 hover:-translate-y-0.5 transition-all duration-300"
              >
                <span>Start Your Assessment</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <a
                href="#features"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/80 shadow-sm hover:shadow transition-all duration-200"
              >
                <span>Explore Your Well-being</span>
              </a>
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

          {/* Right Column: Visual Reflection Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md w-full">
              
              {/* Elevated Card */}
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-900/10 border border-purple-100 space-y-6">
                
                {/* Card Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-700">
                      <Heart className="w-5 h-5 fill-violet-600/20" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Your Reflection Space</h3>
                      <p className="text-xs text-slate-500">MindScope Awareness Check</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-violet-700 bg-violet-50 px-2.5 py-1 rounded-full border border-violet-200">
                    <Sparkles className="w-3 h-3 text-violet-500" />
                    Calm Space
                  </span>
                </div>

                {/* Visual Illustration */}
                <div className="rounded-2xl overflow-hidden border border-purple-100/80 shadow-sm bg-violet-50/40">
                  <img 
                    src={heroIllustration} 
                    alt="Student mindfulness illustration" 
                    className="w-full h-44 object-cover object-center"
                  />
                </div>

                {/* Sample Reflection Indicators */}
                <div className="space-y-4">
                  {/* Item 1 */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700">Rest & Sleep Recovery</span>
                      <span className="text-violet-600 font-bold">Balanced</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full w-[76%]" />
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700">Daily Academic Rhythm</span>
                      <span className="text-indigo-600 font-bold">Reflected</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full w-[68%]" />
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700">Community & Social Support</span>
                      <span className="text-emerald-600 font-bold">Supported</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full w-[84%]" />
                    </div>
                  </div>
                </div>

                {/* Supportive Prompt Pill */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50/60 border border-violet-100 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-violet-900">
                    <Compass className="w-4 h-4 text-violet-700" />
                    <span>Holistic Self-Discovery</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    Reflect on how your physical energy, coursework routines, and social connections harmoniously interact.
                  </p>
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100/60">
                  <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Educational Awareness Platform
                  </span>
                  <span className="text-violet-600 font-medium">
                    Holistic Scope
                  </span>
                </div>

              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-4 -left-4 sm:-bottom-5 sm:-left-5 bg-white rounded-2xl p-3 shadow-lg border border-purple-100 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-xs">
                  20
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-800">Holistic Factors</div>
                  <div className="text-[10px] text-slate-500">Everyday student life</div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

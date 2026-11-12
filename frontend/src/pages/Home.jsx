import React from 'react';
import Hero from '../components/Hero';
import FeatureCards from '../components/FeatureCards';
import { 
  Heart, 
  Sparkles, 
  Compass, 
  BookOpen 
} from 'lucide-react';

/**
 * Home Page Component
 * Clean, user-centered homepage layout:
 * 1. Warm, reflective Hero section (primary entry point)
 * 2. 3-step User-Facing Feature Cards (informative, uncluttered)
 * 3. Purpose-driven About Section ("A Little More Awareness Goes a Long Way")
 */
export default function Home() {
  return (
    <main className="flex-1">
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. User-Facing Feature Cards */}
      <FeatureCards />

      {/* 3. About MindScope Section */}
      <section id="about" className="py-20 bg-[#FAF9FE] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* Section Header: Purpose-Driven */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100/80 text-violet-800 text-xs font-semibold tracking-wide">
              <Sparkles className="w-4 h-4 text-violet-600" />
              <span>Why MindScope Exists</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              A Little More Awareness{' '}
              <span className="text-violet-700">Goes a Long Way.</span>
            </h2>
            
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              MindScope is designed to help university students reflect on the different factors associated with stress. It brings together academic, psychological, physiological and social lifestyle indicators to offer an educational perspective on student well-being.
            </p>
          </div>

          {/* 3 Welcoming Pillars of MindScope's Mission */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Pillar 1 */}
            <div className="bg-white rounded-3xl p-8 border border-purple-100 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center text-violet-700">
                <Heart className="w-6 h-6 fill-violet-600/20" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Holistic Reflection</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                Stress is rarely triggered by a single deadline. It is often the subtle accumulation of disrupted sleep, study load, and daily changes. MindScope offers a holistic lens to view them together.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="bg-white rounded-3xl p-8 border border-purple-100 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Supportive Clarity</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                Self-awareness isn&apos;t about self-judgment. MindScope aims to turn overwhelming feelings into clear, recognizable lifestyle factors you can mindfully discuss or adjust.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="bg-white rounded-3xl p-8 border border-purple-100 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-700">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Educational Perspective</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                Built strictly as an educational platform, MindScope promotes healthy reflection habits and encourages reaching out to campus health and counseling services whenever support is needed.
              </p>
            </div>

          </div>

          {/* Gentle Closing Note (No Pushy Call to Action Button) */}
          <div className="text-center max-w-xl mx-auto pt-6 border-t border-purple-100/80">
            <p className="text-xs sm:text-sm text-slate-500 font-normal italic leading-relaxed">
              &ldquo;Taking a moment to pause and check in with yourself is the first step toward lasting balance.&rdquo;
            </p>
          </div>

        </div>
      </section>
    </main>
  );
}

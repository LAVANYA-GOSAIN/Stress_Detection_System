import React from 'react';
import { Activity, ShieldAlert, Check, HelpCircle } from 'lucide-react';

/**
 * BloodPressureInput Component
 *
 * Implements Q13:
 * 1. Mode selection:
 *    - "Yes, I know my recent reading" -> Systolic & Diastolic numeric fields
 *    - "I know my recorded category" -> 3 discrete category cards (1, 2, 3)
 *    - "No, I am not sure" -> Unsure selection
 * 2. Does NOT automatically convert raw mmHg readings into unverified categories.
 */
export default function BloodPressureInput({
  readingType = null,
  systolicValue = '',
  diastolicValue = '',
  categoryValue = 2,
  onTypeChange,
  onSystolicChange,
  onDiastolicChange,
  onCategoryChange,
}) {
  const modes = [
    {
      id: 'reading',
      title: 'Yes, I know my recent reading',
      desc: 'Enter your systolic and diastolic measurements in mm Hg.',
    },
    {
      id: 'category',
      title: 'I know my recorded category',
      desc: 'Select your recorded clinical category (1 to 3).',
    },
    {
      id: 'unsure',
      title: 'No, I am not sure',
      desc: 'No problem. A typical educational baseline is applied.',
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* 1. Mode Selection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {modes.map((m) => {
          const isSelected = readingType === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onTypeChange(m.id)}
              className={`p-4 rounded-2xl text-left border-2 transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-violet-50/90 border-violet-600 shadow-md shadow-violet-500/10'
                  : 'bg-white border-slate-200 hover:border-violet-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Status
                </span>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    isSelected
                      ? 'bg-violet-600 text-white'
                      : 'border-2 border-slate-300 bg-white'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>

              <div>
                <div
                  className={`text-sm font-bold ${
                    isSelected ? 'text-violet-950' : 'text-slate-800'
                  }`}
                >
                  {m.title}
                </div>
                <div className="text-xs text-slate-500 mt-1 leading-snug">
                  {m.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 2. Conditional Sub-view: Raw Numeric Inputs */}
      {readingType === 'reading' && (
        <div className="p-6 rounded-2xl bg-violet-50/50 border border-violet-200/80 space-y-4 animate-fadeIn">
          <div className="flex items-center gap-2 text-violet-900 font-bold text-sm">
            <Activity className="w-4 h-4 text-violet-600" />
            <span>Enter Your Measured Blood Pressure Reading</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Systolic */}
            <div className="space-y-1.5">
              <label
                htmlFor="systolic-input"
                className="block text-xs font-bold text-slate-700"
              >
                Systolic Pressure (Top Number)
              </label>
              <div className="relative">
                <input
                  id="systolic-input"
                  type="number"
                  min="70"
                  max="220"
                  placeholder="e.g. 120"
                  value={systolicValue}
                  onChange={(e) => onSystolicChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-violet-600 focus:ring-2 focus:ring-violet-400/30 text-slate-900 font-semibold bg-white"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-medium">
                  mm Hg
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Typical range: 90–140 mm Hg</p>
            </div>

            {/* Diastolic */}
            <div className="space-y-1.5">
              <label
                htmlFor="diastolic-input"
                className="block text-xs font-bold text-slate-700"
              >
                Diastolic Pressure (Bottom Number)
              </label>
              <div className="relative">
                <input
                  id="diastolic-input"
                  type="number"
                  min="40"
                  max="130"
                  placeholder="e.g. 80"
                  value={diastolicValue}
                  onChange={(e) => onDiastolicChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-violet-600 focus:ring-2 focus:ring-violet-400/30 text-slate-900 font-semibold bg-white"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-medium">
                  mm Hg
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Typical range: 60–90 mm Hg</p>
            </div>
          </div>

          {/* Clinical Transparency Notice */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-violet-100 text-xs text-slate-600">
            <ShieldAlert className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Medical Fidelity Safeguard:</strong> Your numerical systolic/diastolic readings are recorded as entered. In accordance with project standards, continuous readings are <em>not</em> automatically converted into the model's 1–3 category until the original dataset encoding criteria are clinically verified.
            </p>
          </div>
        </div>
      )}

      {/* 3. Conditional Sub-view: Recorded Category */}
      {readingType === 'category' && (
        <div className="p-6 rounded-2xl bg-violet-50/50 border border-violet-200/80 space-y-4 animate-fadeIn">
          <div className="flex items-center gap-2 text-violet-900 font-bold text-sm">
            <Activity className="w-4 h-4 text-violet-600" />
            <span>Select Your Recorded Category (Observed Dataset Scale: 1 to 3)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { val: 1, label: 'Category 1', desc: 'Typical / Lower tier' },
              { val: 2, label: 'Category 2', desc: 'Moderate / Median tier' },
              { val: 3, label: 'Category 3', desc: 'Higher / Elevated tier' },
            ].map((cat) => {
              const isSelected = categoryValue === cat.val;
              return (
                <button
                  key={cat.val}
                  type="button"
                  onClick={() => onCategoryChange(cat.val)}
                  className={`p-3.5 rounded-xl text-left border-2 transition-all ${
                    isSelected
                      ? 'bg-white border-violet-600 shadow-sm'
                      : 'bg-white/80 border-slate-200 hover:border-violet-300'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900">{cat.label}</div>
                  <div className="text-[11px] text-slate-500">{cat.desc}</div>
                </button>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-500 italic">
            Note: The dataset values 1, 2, and 3 are preserved without unverified medical assumptions.
          </p>
        </div>
      )}

      {/* 4. Conditional Sub-view: Unsure Mode */}
      {readingType === 'unsure' && (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Most students do not monitor blood pressure daily. MindScope uses a baseline median value for educational evaluation so you can complete your assessment comfortably.
          </p>
        </div>
      )}

    </div>
  );
}


import React, { useState } from 'react';
import {
  Cpu,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Info,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

/**
 * SECTION E – Machine Learning Analysis
 * Displays live prediction results returned by the FastAPI /predict endpoint
 * from eligible mapped 20-question assessment responses (or optional benchmark
 * fallback), alongside imputation and proposed-encoding disclosures.
 */
export default function MachineLearningSection({
  status = 'idle', // 'idle' | 'loading' | 'ineligible' | 'success' | 'error'
  prediction = null,
  modelName = 'Gradient Boosting',
  errorMessage = '',
  mlInputs = null,
  eligibilityReason = '',
  hasProvisionalBloodPressureNotSure = false,
  usingBenchmarkFallback = false,
  onRetry,
  onUseBenchmarkFallback = null,
}) {
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showInputsGrid, setShowInputsGrid] = useState(false);

  const classes = [0, 1, 2];
  const probabilities = prediction?.probabilities || null;
  const predictedClass = prediction?.predicted_class;
  const isSuccess =
    status === 'success' &&
    prediction &&
    (predictedClass === 0 || predictedClass === 1 || predictedClass === 2) &&
    probabilities;

  return (
    <section
      id="ml-analysis"
      aria-labelledby="ml-analysis-heading"
      className="scroll-mt-24 space-y-6 animate-fadeUp pt-4"
    >
      {/* Clear Visual Boundary Divider */}
      <div className="flex items-center gap-4 px-1">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-200 to-indigo-200" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-600/80">
          Independent Technical Component
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-indigo-200 via-purple-200 to-transparent" />
      </div>

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 px-1">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-700">
            <Cpu className="w-3.5 h-3.5" />
            <span>Model Output • {modelName}</span>
          </div>
          <h2
            id="ml-analysis-heading"
            className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight"
          >
            Machine Learning Analysis
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            This prediction is generated separately by our trained <strong className="text-slate-800">{modelName}</strong> classification model via FastAPI <code className="text-xs px-1.5 py-0.5 rounded bg-slate-100 text-indigo-700 font-mono">/predict</code>. {usingBenchmarkFallback ? 'Benchmark fallback mode is active: FastAPI evaluated the fixed 20-feature reference vector rather than your questionnaire answers.' : 'Your 20 questionnaire answers are mapped to 20 proposed ML features and sent to /predict (not independently validated against the original Kaggle survey).'} Your 5 self-reflection dimension scores and personal insights above are calculated separately in your browser and are never sent as ML model features.
          </p>
        </div>
      </div>

      {/* Primary ML Surface */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-indigo-100/90 shadow-sm space-y-6">

        {/* STATE 1: LOADING */}
        {(status === 'loading' || status === 'idle') && (
          <div
            className="py-10 px-6 rounded-2xl bg-[#FAF9FE] border border-indigo-100/80 flex flex-col items-center justify-center text-center space-y-4"
            role="status"
            aria-live="polite"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
            <div className="space-y-1">
              <div className="text-sm font-bold text-slate-900">
                Fetching Live Model Prediction...
              </div>
              <p className="text-xs text-slate-500 max-w-md">
                Querying FastAPI <code className="font-mono">/predict</code> with {usingBenchmarkFallback ? 'the 20-feature model benchmark input' : 'your mapped 20-feature assessment input'} using {modelName}.
              </p>
            </div>
          </div>
        )}

        {/* STATE 2: PRIVACY / INCOMPLETE ELIGIBILITY NOTICE */}
        {status === 'ineligible' && (
          <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">
                    Live ML Prediction Not Submitted
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-xl">
                    {eligibilityReason ||
                      'Live ML prediction requires all 17 required questions to be completed. Optional sensitive questions (Q3, Q6, Q20) may be left undisclosed.'}
                  </p>
                </div>
              </div>

              {typeof onUseBenchmarkFallback === 'function' && (
                <button
                  type="button"
                  onClick={onUseBenchmarkFallback}
                  className="self-start sm:self-center shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200 transition-colors cursor-pointer"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Run Benchmark Reference Instead</span>
                </button>
              )}
            </div>

            <div className="text-xs text-slate-600 pt-2 border-t border-amber-200/70">
              Your personal Self-Reflection Profile and Insights above were computed locally in your browser and remain completely available.
            </div>
          </div>
        )}

        {/* STATE 3: ERROR / UNAVAILABLE (ZERO FAKE DATA) */}
        {(status === 'error' ||
          (status !== 'loading' &&
            status !== 'idle' &&
            status !== 'ineligible' &&
            !isSuccess)) && (
          <div className="p-6 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">
                    Prediction Data Currently Unavailable
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
                    We could not retrieve a live classification response from the backend ML API right now. Rather than displaying simulated probabilities, this section remains empty until live inference succeeds.
                  </p>
                  {errorMessage && (
                    <p className="text-[11px] font-mono text-slate-500 pt-1">
                      Detail: {errorMessage}
                    </p>
                  )}
                </div>
              </div>

              {typeof onRetry === 'function' && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="self-start sm:self-center shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Prediction</span>
                </button>
              )}
            </div>

            <div className="text-xs text-slate-500 pt-2 border-t border-slate-200/70">
              Your personal Self-Reflection Profile and Insights above were computed locally in your browser and remain completely available.
            </div>
          </div>
        )}

        {/* STATE 3: REAL API PREDICTION RECEIVED */}
        {isSuccess && (
          <div className="space-y-6">
            {usingBenchmarkFallback ? (
              <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5 leading-relaxed">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Benchmark Fallback Active: </span>
                  <span>
                    Showing an illustrative prediction generated from MindScope&apos;s fixed 20-feature schema benchmark reference vector because live assessment submission was skipped.
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200/80 text-xs text-indigo-950 flex items-start gap-2.5 leading-relaxed">
                <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Proposed Feature Mapping Disclosure: </span>
                  <span>
                    Your 20 questionnaire answers were mapped into the 20 dataset feature ranges using a proposed encoding that has <strong>not been independently validated</strong> against the original Kaggle study. Your reflection scores and personal insights above are computed separately and never sent to the ML model.
                  </span>
                </div>
              </div>
            )}

            {/* Predicted Class Banner + Model Chip */}
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-violet-50/50 to-white border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
                  Discrete Model Output
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                    Class {predictedClass}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold">
                    {((probabilities[predictedClass] ?? probabilities[String(predictedClass)] ?? 0) * 100).toFixed(1)}% probability
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Model: <strong className="text-slate-800">{modelName}</strong> • Discrete target identifier from the {classes.length}-class model output (<code className="font-mono text-indigo-700">0</code>, <code className="font-mono text-indigo-700">1</code>, <code className="font-mono text-indigo-700">2</code>)
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/90 border border-indigo-100/90 text-xs space-y-1 max-w-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Class Neutrality</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Classes 0, 1, and 2 are kept as numerical identifiers without unverified labels such as Low, Moderate, or High.
                </p>
              </div>
            </div>

            {/* Visual Probability Distribution Chart (Classes 0, 1, 2) */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Class Probability Distribution
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  predict_proba() across classes 0, 1, 2
                </span>
              </div>

              {/* Clean Chart Card with Gridlines & Proportional Bars */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#FAF9FE] border border-purple-100/80 space-y-5">

                {/* Horizontal Comparative Chart */}
                <div className="space-y-4" role="region" aria-label="Probability distribution bar chart for classes 0, 1, and 2">
                  {classes.map((cls) => {
                    const rawProb = probabilities[cls] ?? probabilities[String(cls)] ?? 0;
                    const pct = Math.max(0, Math.min(100, rawProb * 100));
                    const isPredicted = predictedClass === cls;

                    return (
                      <div key={cls} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2.5 h-2.5 rounded-full ${
                                isPredicted ? 'bg-indigo-600' : 'bg-slate-300'
                              }`}
                            />
                            <span className={`font-bold ${isPredicted ? 'text-slate-900' : 'text-slate-600'}`}>
                              Class {cls}
                            </span>
                            {isPredicted && (
                              <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                                Predicted
                              </span>
                            )}
                          </div>
                          <span
                            className={`font-mono font-bold tabular-nums ${
                              isPredicted ? 'text-indigo-700' : 'text-slate-600'
                            }`}
                          >
                            {pct.toFixed(2)}%
                          </span>
                        </div>

                        {/* Track with subtle 25% / 50% / 75% vertical reference ticks */}
                        <div className="relative h-4 w-full bg-slate-200/70 rounded-full overflow-hidden">
                          <div className="absolute inset-y-0 left-1/4 w-px bg-white/60 z-10 pointer-events-none" />
                          <div className="absolute inset-y-0 left-1/2 w-px bg-white/60 z-10 pointer-events-none" />
                          <div className="absolute inset-y-0 left-3/4 w-px bg-white/60 z-10 pointer-events-none" />

                          <div
                            className={`h-full rounded-full transition-all duration-700 ease-out ${
                              isPredicted
                                ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600'
                                : 'bg-slate-400/75'
                            }`}
                            style={{ width: `${Math.max(pct, 1.5)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Scale Legend */}
                <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-purple-100/60">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            {/* Educational Disclaimer, Imputation & Encoding Disclosures */}
            <div className="space-y-3">
              {Array.isArray(prediction.imputed_features) &&
                prediction.imputed_features.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200/80 text-xs text-blue-950 flex items-start gap-2.5 leading-relaxed">
                    <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Deterministic Imputation Applied: </span>
                      <span>
                        You chose not to disclose {prediction.imputed_features.length} optional item(s) (
                        <code className="font-mono text-blue-800">
                          {prediction.imputed_features.join(', ')}
                        </code>
                        ). Your privacy choice was respected by submitting them as null, and the backend filled them for model inference using{' '}
                        <code className="font-mono text-blue-800">
                          {prediction.imputation_method || 'training_split_deterministic'}
                        </code>
                        .
                      </span>
                    </div>
                  </div>
                )}

              {hasProvisionalBloodPressureNotSure && !usingBenchmarkFallback && (
                <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-950 flex items-start gap-2.5 leading-relaxed">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Provisional Blood Pressure Encoding: </span>
                    <span>
                      Your Q6 response (<code className="font-mono text-amber-900">&quot;Not sure&quot;</code>) was submitted using the proposed unverified midpoint code (<code className="font-mono text-amber-900">2</code>) and is intended strictly for educational demonstration.
                    </span>
                  </div>
                </div>
              )}

              {(prediction.disclaimer || prediction.encoding_notice) && (
                <div className="flex items-start gap-2.5 text-xs text-slate-500 leading-relaxed px-1">
                  <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    {prediction.disclaimer && <p>{prediction.disclaimer}</p>}
                    {prediction.encoding_notice && !usingBenchmarkFallback && (
                      <p className="text-[11px] text-slate-500">{prediction.encoding_notice}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* Expandable "How does this prediction work?" Technical Transparency Drawer */}
        <div className="rounded-2xl border border-slate-200/80 overflow-hidden bg-slate-50/40">
          <button
            type="button"
            onClick={() => setShowHowItWorks(!showHowItWorks)}
            aria-expanded={showHowItWorks}
            className="w-full px-5 py-3.5 flex items-center justify-between text-left text-xs sm:text-sm font-bold text-slate-800 hover:bg-slate-100/70 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              <span>How does this prediction work?</span>
            </span>
            {showHowItWorks ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {showHowItWorks && (
            <div className="px-5 pb-5 pt-2 border-t border-slate-200/70 bg-white space-y-4 text-xs text-slate-600 leading-relaxed">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="font-bold text-slate-800">1. Trained Model Pipeline</div>
                  <p>
                    The backend serves a Scikit-learn <strong>{modelName}</strong> classifier trained on the Kaggle Student Stress Factors dataset using 20 numerical features.
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="font-bold text-slate-800">2. Separate Reflection vs. Proposed ML Mapping</div>
                  <p>
                    Reflection scores and personal insights are calculated separately in your browser and are never sent as ML features. {usingBenchmarkFallback ? 'Because benchmark fallback is active, this run evaluated the fixed 20-feature schema reference vector.' : 'Your 20 questionnaire answers were mapped to 20 proposed ML features (preserving unrounded decimals and keeping "Prefer not to say" as null for backend imputation); this mapping is proposed and has not been independently validated.'}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="font-bold text-slate-800">3. Probability Output</div>
                  <p>
                    Calling <code className="font-mono text-indigo-700">/predict</code> executes <code className="font-mono text-indigo-700">predict()</code> and <code className="font-mono text-indigo-700">predict_proba()</code> to return discrete class IDs (0, 1, or 2) and calibrated class likelihoods summing to 100%.
                  </p>
                </div>
              </div>

              {/* Optional Toggle for the 20 Parameters Sent */}
              {mlInputs && (
                <div className="pt-2 border-t border-slate-100 space-y-2.5">
                  <button
                    type="button"
                    onClick={() => setShowInputsGrid(!showInputsGrid)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-900 transition-colors cursor-pointer"
                  >
                    <span>
                      {showInputsGrid ? 'Hide' : 'Inspect'} the 20 {usingBenchmarkFallback ? 'schema benchmark parameters' : 'mapped feature inputs'} sent to /predict
                    </span>
                    {showInputsGrid ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {showInputsGrid && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      {Object.entries(mlInputs).map(([featureName, value]) => (
                        <div
                          key={featureName}
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-0.5"
                        >
                          <span className="text-[10px] font-mono text-slate-500 truncate" title={featureName}>
                            {featureName}
                          </span>
                          <span className={`text-xs font-bold font-mono ${value === null ? 'text-slate-400 italic' : 'text-slate-900'}`}>
                            {value === null ? 'Not provided' : value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}

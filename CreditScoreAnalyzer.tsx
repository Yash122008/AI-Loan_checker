import { useState } from 'react';
import {
  CreditCard,
  TrendingUp,
  Lightbulb,
  Award,
  Target,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  GlassCard,
  SectionHeader,
  Slider,
  NumberInput,
  LoadingButton,
  RiskBadge,
  ProgressBar,
} from '@/components/ui';
import { analyzeCredit, type CreditResult } from '@/lib/finance';
import { saveAssessment } from '@/lib/supabase';

export function CreditScoreAnalyzer() {
  const [paymentHistory, setPaymentHistory] = useState(95);
  const [creditUtilization, setCreditUtilization] = useState(25);
  const [creditAge, setCreditAge] = useState(5);
  const [creditMix, setCreditMix] = useState(50);
  const [newInquiries, setNewInquiries] = useState(1);
  const [totalAccounts, setTotalAccounts] = useState(6);

  const [result, setResult] = useState<CreditResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    setSaved(false);
    const inputs = {
      paymentHistory,
      creditUtilization,
      creditAgeYears: creditAge,
      creditMix,
      newInquiries,
      totalAccounts,
    };
    const analysis = analyzeCredit(inputs);
    setResult(analysis);
    setLoading(false);
    await saveAssessment(
      'credit_score',
      inputs,
      analysis as unknown as Record<string, unknown>,
      `Score ${analysis.estimatedScore} — ${analysis.band}`,
    );
    setSaved(true);
  };

  const scoreColor =
    result?.band === 'Excellent'
      ? 'text-accent-400'
      : result?.band === 'Good'
        ? 'text-primary-400'
        : result?.band === 'Fair'
          ? 'text-gold-400'
          : 'text-danger-400';

  const gaugeColor =
    result?.band === 'Excellent'
      ? '#25e884'
      : result?.band === 'Good'
        ? '#1f9bff'
        : result?.band === 'Fair'
          ? '#e6b23a'
          : '#f04848';

  const gaugePct = result ? ((result.estimatedScore - 300) / 600) * 100 : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Input panel */}
      <div className="lg:col-span-2">
        <GlassCard className="p-6">
          <SectionHeader
            icon={<CreditCard className="h-6 w-6" />}
            title="Credit Score Analyzer"
            subtitle="Understand the factors behind your credit score"
          />

          <div className="mt-6 space-y-5">
            <Slider
              label="On-Time Payment Rate"
              value={paymentHistory}
              onChange={setPaymentHistory}
              min={0}
              max={100}
              suffix="%"
            />
            <Slider
              label="Credit Utilization"
              value={creditUtilization}
              onChange={setCreditUtilization}
              min={0}
              max={100}
              suffix="%"
            />
            <Slider
              label="Credit History Age"
              value={creditAge}
              onChange={setCreditAge}
              min={0}
              max={20}
              suffix="yrs"
            />
            <Slider
              label="Credit Mix Diversity"
              value={creditMix}
              onChange={setCreditMix}
              min={0}
              max={100}
              suffix="%"
            />
            <NumberInput
              label="Recent Inquiries (6 months)"
              value={String(newInquiries)}
              onChange={(v) => setNewInquiries(Number(v) || 0)}
              min={0}
              max={20}
            />
            <NumberInput
              label="Total Active Accounts"
              value={String(totalAccounts)}
              onChange={(v) => setTotalAccounts(Number(v) || 0)}
              min={0}
              max={50}
            />

            <LoadingButton onClick={handleAnalyze} loading={loading}>
              <Sparkles className="h-4 w-4" />
              Analyze Score
            </LoadingButton>
            {saved && (
              <p className="text-center text-xs text-accent-400 animate-fade-in">
                Analysis saved to your history
              </p>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Results panel */}
      <div className="lg:col-span-3">
        {result ? (
          <div className="space-y-4 animate-fade-up">
            {/* Score gauge */}
            <GlassCard strong className="p-6">
              <div className="flex flex-col items-center">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Estimated Credit Score
                </p>
                <div className="relative mt-4 flex h-40 w-40 items-center justify-center">
                  <svg className="absolute inset-0 -rotate-90" viewBox="0 0 144 144">
                    <circle
                      cx="72"
                      cy="72"
                      r="60"
                      fill="none"
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth="10"
                    />
                    <circle
                      cx="72"
                      cy="72"
                      r="60"
                      fill="none"
                      stroke={gaugeColor}
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${(gaugePct / 100) * 377} 377`}
                      style={{ transition: 'stroke-dasharray 1s ease-out' }}
                    />
                  </svg>
                  <div className="text-center">
                    <p className={`font-display text-4xl font-bold ${scoreColor}`}>
                      {result.estimatedScore}
                    </p>
                    <p className="text-xs text-slate-500">300–900</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <RiskBadge level={result.band} />
                  <span className="text-xs text-slate-500">
                    Top {100 - result.percentile}% of borrowers
                  </span>
                </div>
              </div>
            </GlassCard>

            {/* Factor breakdown */}
            <GlassCard className="p-6">
              <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-white">
                <Target className="h-5 w-5 text-primary-400" />
                Score Factors
              </h3>
              <div className="space-y-4">
                {result.factors.map((factor, i) => (
                  <div key={i}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-300">{factor.name}</span>
                        <span className="chip text-[10px]">{factor.weight}% weight</span>
                      </div>
                      <span className="font-mono text-xs text-slate-400">{factor.detail}</span>
                    </div>
                    <ProgressBar
                      value={factor.score}
                      max={100}
                      accent={
                        factor.status === 'Good'
                          ? 'green'
                          : factor.status === 'Fair'
                            ? 'gold'
                            : 'danger'
                      }
                      displayValue={`${factor.score}%`}
                    />
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Suggestions */}
            <GlassCard className="p-6">
              <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-white">
                <Lightbulb className="h-5 w-5 text-gold-400" />
                Improvement Tips
              </h3>
              <div className="space-y-3">
                {result.suggestions.map((sug, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3"
                  >
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" />
                    <p className="text-sm leading-relaxed text-slate-300">{sug}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        ) : (
          <GlassCard className="flex h-full min-h-[400px] flex-col items-center justify-center p-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-500/10 text-primary-400 ring-1 ring-primary-400/20">
              <CreditCard className="h-8 w-8" />
            </div>
            <h3 className="font-display text-lg font-semibold text-white">
              Analyze your credit health
            </h3>
            <p className="mt-2 max-w-sm text-sm text-slate-400">
              Adjust the sliders to match your credit profile and get an instant estimated score with
              personalized improvement tips.
            </p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}

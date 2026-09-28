import { useState } from 'react';
import {
  Brain,
  PiggyBank,
  TrendingUp,
  Umbrella,
  PieChart,
  Lightbulb,
  Sparkles,
  Rocket,
  Shield,
  Target,
  ArrowUpRight,
} from 'lucide-react';
import {
  GlassCard,
  SectionHeader,
  NumberInput,
  Slider,
  ToggleGroup,
  CheckboxGroup,
  LoadingButton,
  StatCard,
} from '@/components/ui';
import {
  generateFinancialTips,
  formatCurrencyFull,
  type FinancialTipResult,
} from '@/lib/finance';
import { saveAssessment } from '@/lib/supabase';

const goalOptions = [
  { value: 'home', label: 'Buy a Home' },
  { value: 'retirement', label: 'Retirement' },
  { value: 'education', label: 'Education' },
  { value: 'debt', label: 'Debt Freedom' },
  { value: 'emergency', label: 'Emergency Fund' },
  { value: 'wealth', label: 'Wealth Building' },
];

const priorityIcon = { High: Shield, Medium: Target, Low: Lightbulb } as const;
const priorityColor = {
  High: 'text-danger-400 bg-danger-500/10 ring-danger-400/20',
  Medium: 'text-gold-400 bg-gold-500/10 ring-gold-400/20',
  Low: 'text-accent-400 bg-accent-500/10 ring-accent-400/20',
} as const;

export function FinancialTips() {
  const [monthlyIncome, setMonthlyIncome] = useState('80000');
  const [monthlyExpenses, setMonthlyExpenses] = useState('40000');
  const [monthlySavings, setMonthlySavings] = useState('20000');
  const [age, setAge] = useState(30);
  const [riskTolerance, setRiskTolerance] = useState('Moderate');
  const [goals, setGoals] = useState<string[]>(['retirement', 'wealth']);

  const [result, setResult] = useState<FinancialTipResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleGoal = (value: string) => {
    setGoals((prev) =>
      prev.includes(value) ? prev.filter((g) => g !== value) : [...prev, value],
    );
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setSaved(false);
    const inputs = {
      monthlyIncome: Number(monthlyIncome) || 0,
      monthlyExpenses: Number(monthlyExpenses) || 0,
      monthlySavings: Number(monthlySavings) || 0,
      age,
      investmentHorizon: '10+ years',
      riskTolerance: riskTolerance as 'Conservative' | 'Moderate' | 'Aggressive',
      goals,
    };
    const analysis = generateFinancialTips(inputs);
    setResult(analysis);
    setLoading(false);
    await saveAssessment(
      'financial_tips',
      inputs,
      analysis as unknown as Record<string, unknown>,
      `${analysis.tips.length} tips — Savings rate ${analysis.savingsRate}%`,
    );
    setSaved(true);
  };

  const maxProjection = result
    ? Math.max(...result.projection.map((p) => p.value))
    : 1;

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Input panel */}
      <div className="lg:col-span-2">
        <GlassCard className="p-6">
          <SectionHeader
            icon={<Brain className="h-6 w-6" />}
            title="AI Financial Tips"
            subtitle="Personalized financial guidance based on your profile"
          />

          <div className="mt-6 space-y-5">
            <NumberInput
              label="Monthly Income"
              value={monthlyIncome}
              onChange={setMonthlyIncome}
              prefix="₹"
              placeholder="80000"
              min={0}
            />
            <NumberInput
              label="Monthly Expenses"
              value={monthlyExpenses}
              onChange={setMonthlyExpenses}
              prefix="₹"
              placeholder="40000"
              min={0}
            />
            <NumberInput
              label="Monthly Savings"
              value={monthlySavings}
              onChange={setMonthlySavings}
              prefix="₹"
              placeholder="20000"
              min={0}
            />
            <Slider
              label="Your Age"
              value={age}
              onChange={setAge}
              min={18}
              max={65}
              suffix="yrs"
            />
            <ToggleGroup
              label="Risk Tolerance"
              value={riskTolerance}
              onChange={setRiskTolerance}
              options={[
                { value: 'Conservative', label: 'Low' },
                { value: 'Moderate', label: 'Medium' },
                { value: 'Aggressive', label: 'High' },
              ]}
            />
            <CheckboxGroup
              label="Financial Goals"
              values={goals}
              onToggle={toggleGoal}
              options={goalOptions}
            />

            <LoadingButton onClick={handleAnalyze} loading={loading}>
              <Sparkles className="h-4 w-4" />
              Get AI Tips
            </LoadingButton>
            {saved && (
              <p className="text-center text-xs text-accent-400 animate-fade-in">
                Tips saved to your history
              </p>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Results panel */}
      <div className="lg:col-span-3">
        {result ? (
          <div className="space-y-4 animate-fade-up">
            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-4">
              <StatCard
                label="Savings Rate"
                value={`${result.savingsRate}%`}
                sublabel="of income"
                accent={result.savingsRate >= 20 ? 'green' : 'gold'}
                icon={<PiggyBank className="h-4 w-4" />}
              />
              <StatCard
                label="Emergency Fund"
                value={`${result.emergencyFundMonths}mo`}
                sublabel="to build 6mo fund"
                accent="blue"
                icon={<Umbrella className="h-4 w-4" />}
              />
              <StatCard
                label="10yr Projection"
                value={formatCurrencyFull(result.projection[9]?.value ?? 0)}
                sublabel="at current rate"
                accent="gold"
                icon={<TrendingUp className="h-4 w-4" />}
              />
            </div>

            {/* Investment allocation */}
            <GlassCard strong className="p-6">
              <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-white">
                <PieChart className="h-5 w-5 text-primary-400" />
                Recommended Allocation
              </h3>
              <div className="flex h-4 overflow-hidden rounded-full">
                {result.allocation.map((a, i) => {
                  const colors = ['bg-primary-400', 'bg-accent-400', 'bg-gold-400', 'bg-primary-600'];
                  return (
                    <div
                      key={i}
                      className={`${colors[i % colors.length]} transition-all duration-700`}
                      style={{ width: `${a.percentage}%` }}
                      title={`${a.asset}: ${a.percentage}%`}
                    />
                  );
                })}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {result.allocation.map((a, i) => {
                  const colors = ['bg-primary-400', 'bg-accent-400', 'bg-gold-400', 'bg-primary-600'];
                  return (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
                      <span className="flex items-center gap-2 text-xs text-slate-300">
                        <span className={`h-2.5 w-2.5 rounded-sm ${colors[i % colors.length]}`} />
                        {a.asset}
                      </span>
                      <span className="font-mono text-xs font-semibold text-white">{a.percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </GlassCard>

            {/* 10-year projection chart */}
            <GlassCard className="p-6">
              <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-white">
                <Rocket className="h-5 w-5 text-accent-400" />
                10-Year Wealth Projection
              </h3>
              <div className="flex items-end gap-1.5 h-32">
                {result.projection.map((p, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <div className="flex w-full items-end justify-center" style={{ height: '100px' }}>
                      <div
                        className="w-full rounded-t bg-gradient-to-t from-primary-600 to-primary-400 transition-all duration-700 ease-out"
                        style={{ height: `${(p.value / maxProjection) * 100}%` }}
                        title={formatCurrencyFull(p.value)}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500">Y{p.year}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-center text-xs text-slate-500">
                Projected value: <span className="font-semibold text-accent-400">{formatCurrencyFull(result.projection[9]?.value ?? 0)}</span>
              </p>
            </GlassCard>

            {/* AI Tips */}
            <GlassCard className="p-6">
              <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-white">
                <Sparkles className="h-5 w-5 text-primary-400" />
                Personalized Tips
              </h3>
              <div className="space-y-3">
                {result.tips.map((tip, i) => {
                  const Icon = priorityIcon[tip.priority];
                  return (
                    <div
                      key={i}
                      className="rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-all duration-200 hover:border-white/10 hover:bg-white/[0.04]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ${priorityColor[tip.priority]}`}>
                            <Icon className="h-4 w-4" />
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="chip text-[10px]">{tip.category}</span>
                              <span className={`text-[10px] font-semibold uppercase ${priorityColor[tip.priority].split(' ')[0]}`}>
                                {tip.priority}
                              </span>
                            </div>
                            <h4 className="mt-1.5 font-display text-sm font-semibold text-white">{tip.title}</h4>
                            <p className="mt-1 text-sm leading-relaxed text-slate-400">{tip.detail}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>

            {/* CTA */}
            <GlassCard className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <ArrowUpRight className="h-5 w-5 text-accent-400" />
                <p className="text-sm text-slate-300">
                  Increase savings by 5% to add <span className="font-semibold text-accent-400">{formatCurrencyFull(Math.round((Number(monthlyIncome) * 0.05) * 12 * 10 * 1.5))}</span> over 10 years
                </p>
              </div>
            </GlassCard>
          </div>
        ) : (
          <GlassCard className="flex h-full min-h-[400px] flex-col items-center justify-center p-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-500/10 text-primary-400 ring-1 ring-primary-400/20">
              <Brain className="h-8 w-8" />
            </div>
            <h3 className="font-display text-lg font-semibold text-white">
              Get personalized financial guidance
            </h3>
            <p className="mt-2 max-w-sm text-sm text-slate-400">
              Share your financial profile and goals to receive AI-powered tips on savings,
              investments, emergency funds, and long-term wealth building.
            </p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}

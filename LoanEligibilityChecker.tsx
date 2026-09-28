import { useState } from 'react';
import {
  Landmark,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  IndianRupee,
  Gauge,
  Sparkles,
} from 'lucide-react';
import {
  GlassCard,
  SectionHeader,
  NumberInput,
  Slider,
  LoadingButton,
  StatCard,
  RiskBadge,
  ProgressBar,
} from '@/components/ui';
import { analyzeLoan, formatCurrency, formatCurrencyFull, type LoanResult } from '@/lib/finance';
import { saveAssessment } from '@/lib/supabase';

export function LoanEligibilityChecker() {
  const [monthlyIncome, setMonthlyIncome] = useState('75000');
  const [monthlyExpenses, setMonthlyExpenses] = useState('25000');
  const [existingEMIs, setExistingEMIs] = useState('5000');
  const [creditScore, setCreditScore] = useState(720);
  const [tenure, setTenure] = useState(20);
  const [interestRate, setInterestRate] = useState(9.5);
  const [dependents, setDependents] = useState(2);

  const [result, setResult] = useState<LoanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    setSaved(false);
    const inputs = {
      monthlyIncome: Number(monthlyIncome) || 0,
      monthlyExpenses: Number(monthlyExpenses) || 0,
      existingEMIs: Number(existingEMIs) || 0,
      creditScore,
      loanTenureYears: tenure,
      interestRate,
      dependents,
    };
    const analysis = analyzeLoan(inputs);
    setResult(analysis);
    setLoading(false);
    await saveAssessment(
      'loan_eligibility',
      inputs,
      analysis as unknown as Record<string, unknown>,
      `Max loan ${formatCurrency(analysis.maxLoanAmount)} — ${analysis.riskLevel} risk`,
    );
    setSaved(true);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Input panel */}
      <div className="lg:col-span-2">
        <GlassCard className="p-6">
          <SectionHeader
            icon={<Landmark className="h-6 w-6" />}
            title="Loan Eligibility Checker"
            subtitle="Get an instant estimate of how much you can borrow"
          />

          <div className="mt-6 space-y-5">
            <NumberInput
              label="Monthly Income"
              value={monthlyIncome}
              onChange={setMonthlyIncome}
              prefix="₹"
              placeholder="75000"
              min={0}
            />
            <NumberInput
              label="Monthly Expenses"
              value={monthlyExpenses}
              onChange={setMonthlyExpenses}
              prefix="₹"
              placeholder="25000"
              min={0}
            />
            <NumberInput
              label="Existing EMIs"
              value={existingEMIs}
              onChange={setExistingEMIs}
              prefix="₹"
              placeholder="5000"
              min={0}
            />
            <Slider
              label="Credit Score"
              value={creditScore}
              onChange={setCreditScore}
              min={300}
              max={900}
              step={5}
            />
            <Slider
              label="Loan Tenure"
              value={tenure}
              onChange={setTenure}
              min={1}
              max={30}
              suffix="yrs"
            />
            <Slider
              label="Interest Rate"
              value={interestRate}
              onChange={setInterestRate}
              min={4}
              max={20}
              step={0.1}
              suffix="%"
              displayValue={interestRate.toFixed(1)}
            />
            <Slider
              label="Dependents"
              value={dependents}
              onChange={setDependents}
              min={0}
              max={6}
            />

            <LoadingButton onClick={handleAnalyze} loading={loading}>
              <Sparkles className="h-4 w-4" />
              Check Eligibility
            </LoadingButton>
            {saved && (
              <p className="text-center text-xs text-accent-400 animate-fade-in">
                Assessment saved to your history
              </p>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Results panel */}
      <div className="lg:col-span-3">
        {result ? (
          <div className="space-y-4 animate-fade-up">
            {/* Headline card */}
            <GlassCard strong className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    Maximum Loan Eligibility
                  </p>
                  <p className="mt-1 font-display text-4xl font-bold text-gradient">
                    {formatCurrency(result.maxLoanAmount)}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Estimated EMI: {formatCurrencyFull(result.eligibleEMI)}/month
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <RiskBadge level={result.riskLevel} />
                  <span className="text-xs text-slate-500">Risk Profile</span>
                </div>
              </div>

              <div className="mt-5">
                <ProgressBar
                  label="Approval Probability"
                  value={result.approvalProbability}
                  max={100}
                  accent={result.approvalProbability >= 70 ? 'green' : result.approvalProbability >= 45 ? 'gold' : 'danger'}
                  displayValue={`${result.approvalProbability}%`}
                />
              </div>
            </GlassCard>

            {/* Stat grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard
                label="Current DTI"
                value={`${result.dtiRatio}%`}
                accent={result.dtiRatio < 35 ? 'green' : 'gold'}
                icon={<Gauge className="h-4 w-4" />}
              />
              <StatCard
                label="Post-Loan DTI"
                value={`${result.postDtiRatio}%`}
                accent={result.postDtiRatio < 50 ? 'green' : 'danger'}
                icon={<TrendingUp className="h-4 w-4" />}
              />
              <StatCard
                label="FOIR"
                value={`${result.foir}%`}
                sublabel="Fixed obligation ratio"
                accent="blue"
                icon={<IndianRupee className="h-4 w-4" />}
              />
              <StatCard
                label="Net Income"
                value={formatCurrency(Number(monthlyIncome) - Number(monthlyExpenses))}
                sublabel="after expenses"
                accent="gold"
              />
            </div>

            {/* Recommendations */}
            <GlassCard className="p-6">
              <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-white">
                <Sparkles className="h-5 w-5 text-primary-400" />
                AI Recommendations
              </h3>
              <div className="space-y-3">
                {result.recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3"
                  >
                    {result.riskLevel === 'Low' ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" />
                    ) : (
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                    )}
                    <p className="text-sm leading-relaxed text-slate-300">{rec}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        ) : (
          <GlassCard className="flex h-full min-h-[400px] flex-col items-center justify-center p-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-500/10 text-primary-400 ring-1 ring-primary-400/20">
              <Landmark className="h-8 w-8" />
            </div>
            <h3 className="font-display text-lg font-semibold text-white">
              Ready to check your eligibility
            </h3>
            <p className="mt-2 max-w-sm text-sm text-slate-400">
              Fill in your financial details on the left and click "Check Eligibility" to get an
              instant AI-powered analysis of your borrowing capacity.
            </p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}

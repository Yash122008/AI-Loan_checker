import { useState, useMemo } from 'react';
import {
  Calculator,
  IndianRupee,
  Percent,
  Calendar,
  TrendingUp,
  PieChart,
  Sparkles,
  Wallet,
} from 'lucide-react';
import {
  GlassCard,
  SectionHeader,
  Slider,
  LoadingButton,
  StatCard,
} from '@/components/ui';
import { calculateEmiSchedule, formatCurrencyFull, type EmiResult } from '@/lib/finance';
import { saveAssessment } from '@/lib/supabase';

export function EmiCalculator() {
  const [loanAmount, setLoanAmount] = useState(500000);
  const [interestRate, setInterestRate] = useState(9.5);
  const [tenure, setTenure] = useState(20);
  const [result, setResult] = useState<EmiResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Live preview of EMI (no need to click)
  const previewEMI = useMemo(() => {
    const monthlyRate = interestRate / 12 / 100;
    const months = tenure * 12;
    if (monthlyRate === 0) return loanAmount / months;
    return (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);
  }, [loanAmount, interestRate, tenure]);

  const handleCalculate = async () => {
    setLoading(true);
    setSaved(false);
    const inputs = { loanAmount, interestRate, tenureYears: tenure };
    const analysis = calculateEmiSchedule(inputs);
    setResult(analysis);
    setLoading(false);
    await saveAssessment(
      'emi_calculator',
      inputs,
      analysis as unknown as Record<string, unknown>,
      `EMI ${formatCurrencyFull(analysis.monthlyEMI)}/mo for ${formatCurrencyFull(loanAmount)}`,
    );
    setSaved(true);
  };

  const principalPct = result ? (result.principal / result.totalPayment) * 100 : 0;
  const interestPct = result ? (result.totalInterest / result.totalPayment) * 100 : 0;

  // Show amortization chart data points (yearly summary)
  const yearlyData = useMemo(() => {
    if (!result) return [];
    const yearly: { year: number; principal: number; interest: number; balance: number }[] = [];
    for (let y = 1; y <= tenure; y++) {
      const monthStart = (y - 1) * 12;
      const monthEnd = y * 12;
      const yearSlice = result.amortizationSchedule.slice(monthStart, monthEnd);
      const principal = yearSlice.reduce((s, m) => s + m.principal, 0);
      const interest = yearSlice.reduce((s, m) => s + m.interest, 0);
      const balance = yearSlice[yearSlice.length - 1]?.balance ?? 0;
      yearly.push({ year: y, principal, interest, balance });
    }
    return yearly;
  }, [result, tenure]);

  const maxBalance = yearlyData.length > 0 ? loanAmount : 1;

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Input panel */}
      <div className="lg:col-span-2">
        <GlassCard className="p-6">
          <SectionHeader
            icon={<Calculator className="h-6 w-6" />}
            title="EMI Calculator"
            subtitle="Calculate your monthly loan installment instantly"
          />

          <div className="mt-6 space-y-5">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className="label-text mb-0">Loan Amount</label>
                <span className="font-mono text-sm font-semibold text-primary-300">
                  {formatCurrencyFull(loanAmount)}
                </span>
              </div>
              <input
                type="range"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                min={50000}
                max={10000000}
                step={50000}
                className="slider-range w-full"
                style={{
                  background: `linear-gradient(to right, rgb(31, 155, 255) 0%, rgb(31, 155, 255) ${((loanAmount - 50000) / (10000000 - 50000)) * 100}%, rgba(255,255,255,0.08) ${((loanAmount - 50000) / (10000000 - 50000)) * 100}%, rgba(255,255,255,0.08) 100%)`,
                }}
              />
            </div>

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
              label="Tenure"
              value={tenure}
              onChange={setTenure}
              min={1}
              max={30}
              suffix="yrs"
            />

            {/* Live EMI preview */}
            <div className="rounded-xl border border-primary-400/20 bg-primary-500/5 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Live EMI Preview
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-primary-300">
                {formatCurrencyFull(Math.round(previewEMI))}
                <span className="text-sm font-normal text-slate-500">/month</span>
              </p>
            </div>

            <LoadingButton onClick={handleCalculate} loading={loading}>
              <Sparkles className="h-4 w-4" />
              Calculate & Save
            </LoadingButton>
            {saved && (
              <p className="text-center text-xs text-accent-400 animate-fade-in">
                Calculation saved to your history
              </p>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Results panel */}
      <div className="lg:col-span-3">
        {result ? (
          <div className="space-y-4 animate-fade-up">
            {/* Headline EMI */}
            <GlassCard strong className="p-6">
              <div className="flex flex-col items-center text-center">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Your Monthly EMI
                </p>
                <p className="mt-2 font-display text-5xl font-bold text-gradient">
                  {formatCurrencyFull(result.monthlyEMI)}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  for {tenure} years at {interestRate.toFixed(1)}% p.a.
                </p>
              </div>

              {/* Principal vs Interest bar */}
              <div className="mt-6">
                <div className="mb-2 flex justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span className="h-2.5 w-2.5 rounded-sm bg-primary-400" />
                    Principal {principalPct.toFixed(1)}%
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span className="h-2.5 w-2.5 rounded-sm bg-gold-400" />
                    Interest {interestPct.toFixed(1)}%
                  </span>
                </div>
                <div className="flex h-3 overflow-hidden rounded-full">
                  <div
                    className="bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-700"
                    style={{ width: `${principalPct}%` }}
                  />
                  <div
                    className="bg-gradient-to-r from-gold-500 to-gold-400 transition-all duration-700"
                    style={{ width: `${interestPct}%` }}
                  />
                </div>
              </div>
            </GlassCard>

            {/* Stat grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <StatCard
                label="Principal"
                value={formatCurrencyFull(result.principal)}
                accent="blue"
                icon={<IndianRupee className="h-4 w-4" />}
              />
              <StatCard
                label="Total Interest"
                value={formatCurrencyFull(result.totalInterest)}
                accent="gold"
                icon={<Percent className="h-4 w-4" />}
              />
              <StatCard
                label="Total Payment"
                value={formatCurrencyFull(result.totalPayment)}
                accent="green"
                icon={<Wallet className="h-4 w-4" />}
              />
            </div>

            {/* Amortization chart */}
            <GlassCard className="p-6">
              <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-white">
                <PieChart className="h-5 w-5 text-primary-400" />
                Amortization Schedule
              </h3>

              {/* Bar chart — yearly principal vs interest */}
              <div className="space-y-1.5">
                {yearlyData.filter((_, i) => (yearlyData.length > 15 ? i % 2 === 0 : true)).map((d) => (
                  <div key={d.year} className="flex items-center gap-3">
                    <span className="w-10 shrink-0 text-right font-mono text-xs text-slate-500">
                      Y{d.year}
                    </span>
                    <div className="flex h-5 flex-1 overflow-hidden rounded-md bg-white/[0.02]">
                      <div
                        className="bg-primary-400/60 transition-all duration-500"
                        style={{ width: `${(d.principal / loanAmount) * 100}%` }}
                        title={`Principal: ${formatCurrencyFull(Math.round(d.principal))}`}
                      />
                      <div
                        className="bg-gold-400/50 transition-all duration-500"
                        style={{ width: `${(d.interest / loanAmount) * 100}%` }}
                        title={`Interest: ${formatCurrencyFull(Math.round(d.interest))}`}
                      />
                    </div>
                    <span className="w-24 shrink-0 text-right font-mono text-xs text-slate-400">
                      {formatCurrencyFull(Math.round(d.balance))}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-primary-400/60" />
                  Principal paid
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-gold-400/50" />
                  Interest paid
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" />
                  Balance remaining
                </span>
              </div>
            </GlassCard>

            {/* Summary insight */}
            <GlassCard className="p-4">
              <div className="flex items-start gap-3">
                <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-accent-400" />
                <p className="text-sm leading-relaxed text-slate-300">
                  You'll pay <span className="font-semibold text-gold-400">{formatCurrencyFull(result.totalInterest)}</span> in interest over {tenure} years — that's{' '}
                  <span className="font-semibold text-gold-400">{interestPct.toFixed(0)}%</span> of your loan amount.
                  {interestPct > 60 && ' Consider a shorter tenure or prepayments to reduce interest costs.'}
                </p>
              </div>
            </GlassCard>
          </div>
        ) : (
          <GlassCard className="flex h-full min-h-[400px] flex-col items-center justify-center p-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-500/10 text-primary-400 ring-1 ring-primary-400/20">
              <Calculator className="h-8 w-8" />
            </div>
            <h3 className="font-display text-lg font-semibold text-white">
              Calculate your EMI
            </h3>
            <p className="mt-2 max-w-sm text-sm text-slate-400">
              Adjust the loan amount, interest rate, and tenure to see your monthly payment. The live
              preview updates instantly — click "Calculate & Save" for the full breakdown.
            </p>
            <div className="mt-6 rounded-xl border border-primary-400/20 bg-primary-500/5 px-6 py-3">
              <p className="text-xs text-slate-500">Current EMI preview</p>
              <p className="font-display text-2xl font-bold text-primary-300">
                {formatCurrencyFull(Math.round(previewEMI))}
                <span className="text-sm font-normal text-slate-500">/month</span>
              </p>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}

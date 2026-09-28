import { useState, useEffect, useCallback } from 'react';
import {
  Landmark,
  CreditCard,
  Calculator,
  Brain,
  LayoutDashboard,
  Clock,
  Trash2,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  LineChart,
  Banknote,
  Lock,
} from 'lucide-react';
import { LoanEligibilityChecker } from '@/components/LoanEligibilityChecker';
import { CreditScoreAnalyzer } from '@/components/CreditScoreAnalyzer';
import { EmiCalculator } from '@/components/EmiCalculator';
import { FinancialTips } from '@/components/FinancialTips';
import { GlassCard } from '@/components/ui';
import { fetchAssessments, deleteAssessment, type Assessment, type ToolType } from '@/lib/supabase';

type Tab = 'loan' | 'credit' | 'emi' | 'tips' | 'history';

interface TabConfig {
  id: Tab;
  label: string;
  icon: typeof Landmark;
  short: string;
  description: string;
}

const tabs: TabConfig[] = [
  {
    id: 'loan',
    label: 'Loan Eligibility',
    icon: Landmark,
    short: 'Check how much you can borrow',
    description: 'Instant analysis of your borrowing capacity',
  },
  {
    id: 'credit',
    label: 'Credit Score',
    icon: CreditCard,
    short: 'Analyze your credit health',
    description: 'Understand factors behind your score',
  },
  {
    id: 'emi',
    label: 'EMI Calculator',
    icon: Calculator,
    short: 'Plan your monthly payments',
    description: 'Calculate installments with full breakdown',
  },
  {
    id: 'tips',
    label: 'AI Financial Tips',
    icon: Brain,
    short: 'Personalized money guidance',
    description: 'AI-powered tips for wealth building',
  },
  {
    id: 'history',
    label: 'History',
    icon: Clock,
    short: 'View past assessments',
    description: 'Review your saved financial analyses',
  },
];

const toolTypeLabel: Record<ToolType, string> = {
  loan_eligibility: 'Loan Eligibility',
  credit_score: 'Credit Score',
  emi_calculator: 'EMI Calculator',
  financial_tips: 'Financial Tips',
};

const toolIcon: Record<ToolType, typeof Landmark> = {
  loan_eligibility: Landmark,
  credit_score: CreditCard,
  emi_calculator: Calculator,
  financial_tips: Brain,
};

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('loan');
  const [history, setHistory] = useState<Assessment[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    const data = await fetchAssessments();
    setHistory(data);
    setHistoryLoading(false);
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleDelete = async (id: string) => {
    const ok = await deleteAssessment(id);
    if (ok) {
      setHistory((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const activeConfig = tabs.find((t) => t.id === activeTab)!;

  return (
    <div className="min-h-screen">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-ink-950/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/30">
              <Banknote className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold text-white">
                FinSight<span className="text-primary-400"> AI</span>
              </h1>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                Smart Financial Intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="chip hidden sm:inline-flex">
              <ShieldCheck className="h-3 w-3 text-accent-400" />
              Secure & Private
            </span>
            <span className="chip">
              <Sparkles className="h-3 w-3 text-primary-400" />
              AI-Powered
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section — only on tool tabs, not history */}
      {activeTab !== 'history' && (
        <section className="relative overflow-hidden px-4 pt-12 pb-8 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-400/20 bg-primary-500/5 px-4 py-1.5 text-xs font-medium text-primary-300">
                <Sparkles className="h-3.5 w-3.5" />
                Powered by AI Financial Reasoning
              </div>
              <h2 className="font-display text-3xl font-bold text-white sm:text-5xl">
                Make smarter financial
                <br />
                <span className="text-gradient">decisions in seconds</span>
              </h2>
              <p className="mt-4 max-w-2xl text-sm text-slate-400 sm:text-base">
                Four powerful AI-driven tools to check loan eligibility, analyze your credit score,
                calculate EMIs, and get personalized financial guidance — all in one place.
              </p>

              {/* Trust indicators */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" />
                  Bank-grade encryption
                </span>
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Real-time analysis
                </span>
                <span className="flex items-center gap-1.5">
                  <LineChart className="h-3.5 w-3.5" />
                  Instant results
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <main className="px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          {/* Tab Navigation */}
          <nav className="mb-8">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group relative flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all duration-300 ${
                      isActive
                        ? 'border-primary-400/40 bg-primary-500/10 shadow-lg shadow-primary-500/10'
                        : 'border-white/8 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]'
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 transition-colors ${
                        isActive ? 'text-primary-400' : 'text-slate-400 group-hover:text-slate-300'
                      }`}
                    />
                    <div>
                      <p className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-slate-300'}`}>
                        {tab.label}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">{tab.short}</p>
                    </div>
                    {isActive && (
                      <div className="absolute -bottom-px left-4 right-4 h-0.5 rounded-full bg-gradient-to-r from-primary-400 to-transparent" />
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Active tool content */}
          {activeTab === 'loan' && <LoanEligibilityChecker />}
          {activeTab === 'credit' && <CreditScoreAnalyzer />}
          {activeTab === 'emi' && <EmiCalculator />}
          {activeTab === 'tips' && <FinancialTips />}
          {activeTab === 'history' && (
            <HistoryView
              history={history}
              loading={historyLoading}
              onDelete={handleDelete}
              onRefresh={loadHistory}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700">
              <Banknote className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-display text-sm font-bold text-white">
                FinSight<span className="text-primary-400"> AI</span>
              </p>
              <p className="text-[10px] text-slate-500">Empowering financial decisions</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <LayoutDashboard className="h-3.5 w-3.5" />
              4 AI Tools
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" />
              Data encrypted
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ---------- History View ---------- */

interface HistoryViewProps {
  history: Assessment[];
  loading: boolean;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

function HistoryView({ history, loading, onDelete, onRefresh }: HistoryViewProps) {
  if (loading) {
    return (
      <GlassCard className="flex min-h-[300px] items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-400/30 border-t-primary-400" />
          <p className="text-sm text-slate-400">Loading your history…</p>
        </div>
      </GlassCard>
    );
  }

  if (history.length === 0) {
    return (
      <GlassCard className="flex min-h-[300px] flex-col items-center justify-center p-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.03] text-slate-500 ring-1 ring-white/10">
          <Clock className="h-8 w-8" />
        </div>
        <h3 className="font-display text-lg font-semibold text-white">No saved assessments yet</h3>
        <p className="mt-2 max-w-sm text-sm text-slate-400">
          Use any of the four tools above and your results will be saved here for future reference.
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-white">Your Financial History</h2>
          <p className="text-sm text-slate-400">{history.length} saved assessment{history.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={onRefresh}
          className="btn-ghost"
        >
          <TrendingUp className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {history.map((item) => {
          const Icon = toolIcon[item.tool_type];
          const date = new Date(item.created_at);
          return (
            <GlassCard key={item.id} hover className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-500/10 text-primary-400 ring-1 ring-primary-400/20">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-display text-sm font-semibold text-white">
                      {toolTypeLabel[item.tool_type]}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">{item.summary}</p>
                    <p className="mt-1.5 text-[11px] text-slate-500">
                      {date.toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}{' '}
                      at{' '}
                      {date.toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onDelete(item.id)}
                  className="rounded-lg p-2 text-slate-500 transition-all duration-200 hover:bg-danger-500/10 hover:text-danger-400"
                  aria-label="Delete assessment"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}

export default App;

import { type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  strong?: boolean;
  hover?: boolean;
}

export function GlassCard({ children, className = '', strong = false, hover = false }: GlassCardProps) {
  const base = strong ? 'glass-strong' : 'glass';
  const hoverCls = hover ? 'glass-hover' : '';
  return <div className={`${base} ${hoverCls} ${className}`}>{children}</div>;
}

interface SectionHeaderProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
}

export function SectionHeader({ icon, title, subtitle }: SectionHeaderProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-500/10 text-primary-400 ring-1 ring-primary-400/20">
        {icon}
      </div>
      <div>
        <h2 className="font-display text-xl font-bold text-white sm:text-2xl">{title}</h2>
        <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
      </div>
    </div>
  );
}

interface NumberInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suffix?: string;
  prefix?: string;
  min?: number;
  max?: number;
  step?: number;
}

export function NumberInput({
  label,
  value,
  onChange,
  placeholder,
  suffix,
  prefix,
  min,
  max,
  step,
}: NumberInputProps) {
  return (
    <div>
      <label className="label-text">{label}</label>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          className={`input-field ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-12' : ''}`}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  displayValue?: string;
}

export function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
  displayValue,
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <label className="label-text mb-0">{label}</label>
        <span className="font-mono text-sm font-semibold text-primary-300">
          {displayValue ?? value}
          {suffix && ` ${suffix}`}
        </span>
      </div>
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="slider-range w-full"
        style={{
          background: `linear-gradient(to right, rgb(31, 155, 255) 0%, rgb(31, 155, 255) ${percentage}%, rgba(255,255,255,0.08) ${percentage}%, rgba(255,255,255,0.08) 100%)`,
        }}
      />
    </div>
  );
}

interface SelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

export function Select({ label, value, onChange, options }: SelectProps) {
  return (
    <div>
      <label className="label-text">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_1rem_center] bg-no-repeat pr-10"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-ink-800 text-white">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface ToggleGroupProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

export function ToggleGroup({ label, value, onChange, options }: ToggleGroupProps) {
  return (
    <div>
      <label className="label-text">{label}</label>
      <div className="grid grid-cols-3 gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
              value === opt.value
                ? 'border-primary-400/40 bg-primary-500/15 text-primary-300'
                : 'border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20 hover:text-slate-300'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

interface CheckboxGroupProps {
  label: string;
  values: string[];
  onToggle: (value: string) => void;
  options: { value: string; label: string }[];
}

export function CheckboxGroup({ label, values, onToggle, options }: CheckboxGroupProps) {
  return (
    <div>
      <label className="label-text">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = values.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onToggle(opt.value)}
              className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all duration-200 ${
                active
                  ? 'border-accent-400/40 bg-accent-500/15 text-accent-300'
                  : 'border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface LoadingButtonProps {
  onClick: () => void;
  loading: boolean;
  children: ReactNode;
  disabled?: boolean;
}

export function LoadingButton({ onClick, loading, children, disabled }: LoadingButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="btn-primary w-full"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Analyzing…
        </>
      ) : (
        children
      )}
    </button>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  sublabel?: string;
  accent?: 'blue' | 'green' | 'gold' | 'danger';
  icon?: ReactNode;
}

export function StatCard({ label, value, sublabel, accent = 'blue', icon }: StatCardProps) {
  const accentMap = {
    blue: 'text-primary-300',
    green: 'text-accent-300',
    gold: 'text-gold-400',
    danger: 'text-danger-400',
  };
  const ringMap = {
    blue: 'ring-primary-400/20 bg-primary-500/5',
    green: 'ring-accent-400/20 bg-accent-500/5',
    gold: 'ring-gold-400/20 bg-gold-500/5',
    danger: 'ring-danger-400/20 bg-danger-500/5',
  };
  return (
    <div className={`rounded-xl border border-white/10 p-4 ring-1 ${ringMap[accent]}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</span>
        {icon && <span className={accentMap[accent]}>{icon}</span>}
      </div>
      <p className={`mt-2 font-display text-xl font-bold ${accentMap[accent]}`}>{value}</p>
      {sublabel && <p className="mt-0.5 text-xs text-slate-500">{sublabel}</p>}
    </div>
  );
}

interface RiskBadgeProps {
  level: 'Low' | 'Moderate' | 'High' | 'Excellent' | 'Good' | 'Fair' | 'Poor';
}

export function RiskBadge({ level }: RiskBadgeProps) {
  const map: Record<string, { bg: string; text: string; ring: string }> = {
    Low: { bg: 'bg-accent-500/10', text: 'text-accent-300', ring: 'ring-accent-400/30' },
    Excellent: { bg: 'bg-accent-500/10', text: 'text-accent-300', ring: 'ring-accent-400/30' },
    Good: { bg: 'bg-primary-500/10', text: 'text-primary-300', ring: 'ring-primary-400/30' },
    Moderate: { bg: 'bg-gold-500/10', text: 'text-gold-400', ring: 'ring-gold-400/30' },
    Fair: { bg: 'bg-gold-500/10', text: 'text-gold-400', ring: 'ring-gold-400/30' },
    High: { bg: 'bg-danger-500/10', text: 'text-danger-400', ring: 'ring-danger-400/30' },
    Poor: { bg: 'bg-danger-500/10', text: 'text-danger-400', ring: 'ring-danger-400/30' },
  };
  const c = map[level] ?? map['Moderate'];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${c.bg} ${c.text} ${c.ring}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.text.replace('text-', 'bg-')} animate-pulse`} />
      {level}
    </span>
  );
}

interface ProgressBarProps {
  value: number;
  max: number;
  accent?: 'blue' | 'green' | 'gold' | 'danger';
  label?: string;
  displayValue?: string;
}

export function ProgressBar({ value, max, accent = 'blue', label, displayValue }: ProgressBarProps) {
  const pct = Math.min(100, (value / max) * 100);
  const colorMap = {
    blue: 'from-primary-500 to-primary-400',
    green: 'from-accent-500 to-accent-400',
    gold: 'from-gold-500 to-gold-400',
    danger: 'from-danger-500 to-danger-400',
  };
  return (
    <div>
      {label && (
        <div className="mb-2 flex justify-between text-xs">
          <span className="text-slate-400">{label}</span>
          <span className="font-mono font-semibold text-slate-300">{displayValue ?? value}</span>
        </div>
      )}
      <div className="h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${colorMap[accent]} transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

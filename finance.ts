/* ------------------------------------------------------------------ *
 *  Financial calculation engine
 *  Pure functions — no React, no side effects. Used by every tool.
 * ------------------------------------------------------------------ */

export interface LoanInputs {
  monthlyIncome: number;
  monthlyExpenses: number;
  existingEMIs: number;
  creditScore: number;
  loanTenureYears: number;
  interestRate: number;
  dependents: number;
}

export interface LoanResult {
  maxLoanAmount: number;
  eligibleEMI: number;
  dtiRatio: number;
  postDtiRatio: number;
  foir: number;
  riskLevel: 'Low' | 'Moderate' | 'High';
  approvalProbability: number;
  recommendations: string[];
}

function calculateEMI(principal: number, annualRate: number, months: number): number {
  if (months <= 0) return 0;
  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) return principal / months;
  return (
    (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1)
  );
}

/** Present-value of an annuity: how much loan a given EMI can support */
function maxPrincipalForEMI(emi: number, annualRate: number, months: number): number {
  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) return emi * months;
  return (emi * (Math.pow(1 + monthlyRate, months) - 1)) / (monthlyRate * Math.pow(1 + monthlyRate, months));
}

export function analyzeLoan(inputs: LoanInputs): LoanResult {
  const {
    monthlyIncome,
    monthlyExpenses,
    existingEMIs,
    creditScore,
    loanTenureYears,
    interestRate,
    dependents,
  } = inputs;

  const netIncome = monthlyIncome - monthlyExpenses;
  // Banks typically allow 40-50% of net income for total EMIs (FOIR)
  const maxFoir = creditScore >= 750 ? 0.55 : creditScore >= 700 ? 0.5 : creditScore >= 650 ? 0.45 : 0.4;
  const foir = existingEMIs / Math.max(monthlyIncome, 1);
  const availableForEMI = Math.max(0, monthlyIncome * maxFoir - existingEMIs);
  const eligibleEMI = Math.min(availableForEMI, netIncome * 0.7);
  const tenureMonths = loanTenureYears * 12;

  const maxLoanAmount = maxPrincipalForEMI(eligibleEMI, interestRate, tenureMonths);

  const dtiRatio = (existingEMIs / Math.max(monthlyIncome, 1)) * 100;
  const postDtiRatio = ((existingEMIs + eligibleEMI) / Math.max(monthlyIncome, 1)) * 100;

  // Risk scoring
  let riskScore = 0;
  if (creditScore >= 750) riskScore += 30;
  else if (creditScore >= 700) riskScore += 20;
  else if (creditScore >= 650) riskScore += 10;
  else riskScore += 0;

  if (dtiRatio < 20) riskScore += 30;
  else if (dtiRatio < 35) riskScore += 20;
  else if (dtiRatio < 50) riskScore += 10;

  if (dependents <= 1) riskScore += 20;
  else if (dependents <= 3) riskScore += 10;

  if (monthlyIncome > 100000) riskScore += 20;
  else if (monthlyIncome > 50000) riskScore += 10;

  const riskLevel: LoanResult['riskLevel'] =
    riskScore >= 70 ? 'Low' : riskScore >= 45 ? 'Moderate' : 'High';
  const approvalProbability = Math.min(95, Math.round(riskScore * 1.2 + (creditScore >= 700 ? 10 : 0)));

  const recommendations: string[] = [];
  if (creditScore < 700) {
    recommendations.push('Improve your credit score to 750+ by paying dues on time and keeping credit utilization below 30%.');
  }
  if (foir > 0.4) {
    recommendations.push('Your existing EMI obligations are high. Consider closing smaller loans before applying.');
  }
  if (dependents > 2) {
    recommendations.push('With multiple dependents, opt for a longer tenure to reduce monthly burden.');
  }
  if (postDtiRatio > 50) {
    recommendations.push('Post-loan DTI exceeds 50%. Reduce loan amount or increase tenure for safer repayment.');
  }
  if (riskLevel === 'Low') {
    recommendations.push('You have a strong financial profile. You may qualify for preferential interest rates.');
  }
  if (recommendations.length === 0) {
    recommendations.push('Your profile looks healthy. Maintain consistent income and timely payments.');
  }

  return {
    maxLoanAmount: Math.round(maxLoanAmount),
    eligibleEMI: Math.round(eligibleEMI),
    dtiRatio: Math.round(dtiRatio * 10) / 10,
    postDtiRatio: Math.round(postDtiRatio * 10) / 10,
    foir: Math.round(foir * 100 * 10) / 10,
    riskLevel,
    approvalProbability,
    recommendations,
  };
}

/* ---------- Credit Score Analyzer ---------- */

export interface CreditInputs {
  paymentHistory: number;       // 0-100 on-time percentage
  creditUtilization: number;    // 0-100 percentage
  creditAgeYears: number;
  creditMix: number;            // 0-100 diversity score
  newInquiries: number;         // count in last 6 months
  totalAccounts: number;
}

export interface CreditResult {
  estimatedScore: number;
  band: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  factors: { name: string; weight: number; score: number; status: 'Good' | 'Fair' | 'Poor'; detail: string }[];
  suggestions: string[];
  percentile: number;
}

export function analyzeCredit(inputs: CreditInputs): CreditResult {
  const {
    paymentHistory,
    creditUtilization,
    creditAgeYears,
    creditMix,
    newInquiries,
    totalAccounts,
  } = inputs;

  // Weighted score components (maps to 300-900 range)
  const paymentScore = (paymentHistory / 100) * 350;        // 35% weight
  const utilizationScore = (1 - Math.min(creditUtilization, 100) / 100) * 200; // 20% weight — lower is better
  const ageScore = Math.min(creditAgeYears / 10, 1) * 150;   // 15% weight
  const mixScore = (creditMix / 100) * 100;                  // 10% weight
  const inquiryPenalty = Math.min(newInquiries * 15, 60);    // 10% weight
  const accountScore = Math.min(totalAccounts / 10, 1) * 100; // 10% weight

  const estimatedScore = Math.round(
    300 + paymentScore + utilizationScore + ageScore + mixScore + accountScore - inquiryPenalty,
  );
  const clampedScore = Math.max(300, Math.min(900, estimatedScore));

  const band: CreditResult['band'] =
    clampedScore >= 750 ? 'Excellent' : clampedScore >= 650 ? 'Good' : clampedScore >= 550 ? 'Fair' : 'Poor';

  const factors = [
    {
      name: 'Payment History',
      weight: 35,
      score: Math.round((paymentScore / 350) * 100),
      status: paymentHistory >= 95 ? 'Good' as const : paymentHistory >= 80 ? 'Fair' as const : 'Poor' as const,
      detail: `${paymentHistory}% on-time payments`,
    },
    {
      name: 'Credit Utilization',
      weight: 20,
      score: Math.round((utilizationScore / 200) * 100),
      status: creditUtilization <= 30 ? 'Good' as const : creditUtilization <= 50 ? 'Fair' as const : 'Poor' as const,
      detail: `${creditUtilization}% of limit used`,
    },
    {
      name: 'Credit Age',
      weight: 15,
      score: Math.round((ageScore / 150) * 100),
      status: creditAgeYears >= 7 ? 'Good' as const : creditAgeYears >= 3 ? 'Fair' as const : 'Poor' as const,
      detail: `${creditAgeYears} years history`,
    },
    {
      name: 'Credit Mix',
      weight: 10,
      score: Math.round((mixScore / 100) * 100),
      status: creditMix >= 70 ? 'Good' as const : creditMix >= 40 ? 'Fair' as const : 'Poor' as const,
      detail: `${creditMix}% diversity`,
    },
    {
      name: 'Recent Inquiries',
      weight: 10,
      score: Math.round(((100 - inquiryPenalty) / 100) * 100),
      status: newInquiries <= 2 ? 'Good' as const : newInquiries <= 4 ? 'Fair' as const : 'Poor' as const,
      detail: `${newInquiries} inquiries in 6 months`,
    },
    {
      name: 'Account Count',
      weight: 10,
      score: Math.round((accountScore / 100) * 100),
      status: totalAccounts >= 5 ? 'Good' as const : totalAccounts >= 3 ? 'Fair' as const : 'Poor' as const,
      detail: `${totalAccounts} total accounts`,
    },
  ];

  const suggestions: string[] = [];
  if (paymentHistory < 95) suggestions.push('Set up auto-pay for all accounts to ensure 100% on-time payments.');
  if (creditUtilization > 30) suggestions.push('Pay down balances to bring utilization under 30% — ideally under 10%.');
  if (creditAgeYears < 5) suggestions.push('Keep your oldest credit card open to maintain a long credit history.');
  if (creditMix < 60) suggestions.push('Diversify with a mix of revolving credit and installment loans.');
  if (newInquiries > 3) suggestions.push('Avoid applying for new credit for the next 6 months to reduce hard inquiries.');
  if (totalAccounts < 5) suggestions.push('Consider adding 1-2 accounts over time, but avoid multiple applications at once.');
  if (suggestions.length === 0) suggestions.push('Excellent credit health. Maintain your current habits.');

  const percentile = Math.round(((clampedScore - 300) / 600) * 100);

  return {
    estimatedScore: clampedScore,
    band,
    factors,
    suggestions,
    percentile,
  };
}

/* ---------- EMI Calculator ---------- */

export interface EmiInputs {
  loanAmount: number;
  interestRate: number;
  tenureYears: number;
}

export interface EmiResult {
  monthlyEMI: number;
  totalPayment: number;
  totalInterest: number;
  principal: number;
  amortizationSchedule: { month: number; principal: number; interest: number; balance: number }[];
}

export function calculateEmiSchedule(inputs: EmiInputs): EmiResult {
  const { loanAmount, interestRate, tenureYears } = inputs;
  const months = tenureYears * 12;
  const monthlyEMI = calculateEMI(loanAmount, interestRate, months);
  const totalPayment = monthlyEMI * months;
  const totalInterest = totalPayment - loanAmount;

  const schedule: EmiResult['amortizationSchedule'] = [];
  let balance = loanAmount;
  const monthlyRate = interestRate / 12 / 100;

  for (let m = 1; m <= months; m++) {
    const interest = balance * monthlyRate;
    const principal = monthlyEMI - interest;
    balance = Math.max(0, balance - principal);
    schedule.push({ month: m, principal, interest, balance });
  }

  return {
    monthlyEMI: Math.round(monthlyEMI),
    totalPayment: Math.round(totalPayment),
    totalInterest: Math.round(totalInterest),
    principal: loanAmount,
    amortizationSchedule: schedule,
  };
}

/* ---------- AI Financial Tips ---------- */

export interface FinancialProfile {
  monthlyIncome: number;
  monthlySavings: number;
  monthlyExpenses: number;
  age: number;
  investmentHorizon: string;
  riskTolerance: 'Conservative' | 'Moderate' | 'Aggressive';
  goals: string[];
}

export interface FinancialTipResult {
  savingsRate: number;
  emergencyFundMonths: number;
  recommendedEmergencyFund: number;
  tips: { category: string; title: string; detail: string; priority: 'High' | 'Medium' | 'Low' }[];
  allocation: { asset: string; percentage: number }[];
  projection: { year: number; value: number }[];
}

export function generateFinancialTips(profile: FinancialProfile): FinancialTipResult {
  const savingsRate = (profile.monthlySavings / Math.max(profile.monthlyIncome, 1)) * 100;
  const recommendedEmergencyFund = profile.monthlyExpenses * 6;
  const emergencyFundMonths = profile.monthlySavings > 0
    ? Math.round(recommendedEmergencyFund / profile.monthlySavings * 10) / 10
    : 0;

  const tips: FinancialTipResult['tips'] = [];

  if (savingsRate < 20) {
    tips.push({
      category: 'Savings',
      title: 'Boost your savings rate',
      detail: `You're saving ${savingsRate.toFixed(1)}% of income. Aim for at least 20% by cutting discretionary spending. Even a 5% increase can add up significantly over time.`,
      priority: 'High',
    });
  } else if (savingsRate >= 20 && savingsRate < 30) {
    tips.push({
      category: 'Savings',
      title: "You're on track — push further",
      detail: `Great job saving ${savingsRate.toFixed(1)}% of income. Consider targeting 30%+ to accelerate wealth building and reach financial independence sooner.`,
      priority: 'Low',
    });
  } else {
    tips.push({
      category: 'Savings',
      title: 'Excellent savings discipline',
      detail: `You're saving ${savingsRate.toFixed(1)}% — well above average. Focus now on optimizing where those savings are invested for better returns.`,
      priority: 'Low',
    });
  }

  tips.push({
    category: 'Emergency Fund',
    title: emergencyFundMonths > 0
      ? `Build a 6-month emergency fund`
      : 'Start an emergency fund',
    detail: `Target ₹${Math.round(recommendedEmergencyFund).toLocaleString('en-IN')} (6× monthly expenses). At your current savings rate, this takes ~${emergencyFundMonths} months. Park it in a liquid fund or high-yield savings account.`,
    priority: 'High',
  });

  // Investment allocation based on risk tolerance
  let allocation: { asset: string; percentage: number }[] = [];
  if (profile.riskTolerance === 'Conservative') {
    allocation = [
      { asset: 'Equity (Index Funds)', percentage: 30 },
      { asset: 'Bonds & Debt Funds', percentage: 45 },
      { asset: 'Gold / Commodities', percentage: 10 },
      { asset: 'Cash / Liquid Funds', percentage: 15 },
    ];
  } else if (profile.riskTolerance === 'Moderate') {
    allocation = [
      { asset: 'Equity (Index Funds)', percentage: 55 },
      { asset: 'Bonds & Debt Funds', percentage: 25 },
      { asset: 'Gold / Commodities', percentage: 10 },
      { asset: 'International Equity', percentage: 10 },
    ];
  } else {
    allocation = [
      { asset: 'Equity (Index + Sectoral)', percentage: 70 },
      { asset: 'Bonds & Debt Funds', percentage: 15 },
      { asset: 'International Equity', percentage: 10 },
      { asset: 'Gold / Crypto', percentage: 5 },
    ];
  }

  tips.push({
    category: 'Investment',
    title: `Diversify with a ${profile.riskTolerance.toLowerCase()} allocation`,
    detail: `Split your investments: ${allocation.map(a => `${a.asset} ${a.percentage}%`).join(', ')}. Rebalance annually to maintain your target mix.`,
    priority: 'Medium',
  });

  if (profile.age < 35) {
    tips.push({
      category: 'Retirement',
      title: 'Leverage compound interest early',
      detail: `At age ${profile.age}, you have 25+ years of compounding ahead. Even ₹5,000/month in an index fund at 12% could grow to over ₹1.7 crore by age 60.`,
      priority: 'High',
    });
  } else if (profile.age < 50) {
    tips.push({
      category: 'Retirement',
      title: 'Accelerate retirement contributions',
      detail: `At age ${profile.age}, maximize tax-advantaged accounts. Consider increasing equity allocation if retirement is 15+ years away.`,
      priority: 'High',
    });
  } else {
    tips.push({
      category: 'Retirement',
      title: 'Focus on capital preservation',
      detail: `At age ${profile.age}, gradually shift towards debt and stable income instruments while maintaining some equity for inflation protection.`,
      priority: 'High',
    });
  }

  if (profile.goals.includes('home')) {
    tips.push({
      category: 'Home Purchase',
      title: 'Plan your down payment',
      detail: 'Save at least 20% of the property value for a down payment to avoid PMI and get better interest rates. Use a dedicated sinking fund.',
      priority: 'Medium',
    });
  }
  if (profile.goals.includes('debt')) {
    tips.push({
      category: 'Debt Management',
      title: 'Use the avalanche method',
      detail: 'Pay off your highest-interest debt first while making minimums on the rest. This saves the most money compared to the snowball method.',
      priority: 'High',
    });
  }
  if (profile.goals.includes('education')) {
    tips.push({
      category: 'Education',
      title: 'Start an education fund early',
      detail: 'Use a combination of SIPs in balanced funds and education-specific savings plans. Start now — education inflation runs 8-10% annually.',
      priority: 'Medium',
    });
  }

  // 10-year projection
  const annualReturn = profile.riskTolerance === 'Conservative' ? 7 : profile.riskTolerance === 'Moderate' ? 10 : 13;
  const annualSavings = profile.monthlySavings * 12;
  const projection: { year: number; value: number }[] = [];
  let value = 0;
  for (let y = 1; y <= 10; y++) {
    value = (value + annualSavings) * (1 + annualReturn / 100);
    projection.push({ year: y, value: Math.round(value) });
  }

  return {
    savingsRate: Math.round(savingsRate * 10) / 10,
    emergencyFundMonths,
    recommendedEmergencyFund: Math.round(recommendedEmergencyFund),
    tips: tips.sort((a, b) => (a.priority === 'High' ? -1 : b.priority === 'High' ? 1 : 0)),
    allocation,
    projection,
  };
}

/* ---------- Formatting helpers ---------- */

export function formatCurrency(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatCurrencyFull(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

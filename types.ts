export interface YearlyData {
  year: number;
  age: number;
  monthlyInvestment: number;
  investment: number; // Yearly investment
  interest: number;
  closingBalance: number;
  totalInvestment: number;
  withdrawal: number;
}

export interface CalculationResult {
  yearlyData: YearlyData[];
  totalInvestment: number;
  totalInterest: number;
  maturityValue: number;
  totalWithdrawal: number;
}

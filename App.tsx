import React, { useState, useCallback } from 'react';
import { CalculationResult } from './types';
import { DEPOSIT_PERIOD_YEARS, INTEREST_RATE, MATURITY_PERIOD_YEARS, MAX_INVESTMENT, MIN_INVESTMENT, MIN_GIRL_AGE, MAX_GIRL_AGE } from './constants';
import CalculatorForm from './components/CalculatorForm';
import ResultsDisplay from './components/ResultsDisplay';

const TaxBenefitInfo: React.FC = () => (
  <div className="bg-teal-50 border border-teal-200 text-teal-800 p-4 rounded-lg shadow-sm flex items-start space-x-4 mb-8">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 flex-shrink-0 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
    <div>
      <h3 className="font-bold text-lg">Triple Tax Benefit (EEE Status)</h3>
      <p className="text-sm">
        SSY investments offer an Exempt-Exempt-Exempt status under Section 80C of the Income Tax Act, making it a highly efficient saving tool.
      </p>
      <ul className="list-disc list-inside text-sm mt-2 space-y-1">
        <li><strong>Contribution Exempt:</strong> Investment up to ₹1.5 lakh per year is tax-deductible.</li>
        <li><strong>Interest Earned Exempt:</strong> The accumulated interest is completely tax-free.</li>
        <li><strong>Maturity Amount Exempt:</strong> The final maturity value and withdrawals are also tax-free.</li>
      </ul>
    </div>
  </div>
);


const App: React.FC = () => {
  const [monthlyInvestment, setMonthlyInvestment] = useState<number>(4000);
  const [girlAge, setGirlAge] = useState<number>(1);
  const [results, setResults] = useState<CalculationResult | null>(null);
  
  // Input validation state
  const [investmentError, setInvestmentError] = useState<string | null>(null);
  const [ageError, setAgeError] = useState<string | null>(null);

  // Withdrawal state
  const [isWithdrawalEnabled, setIsWithdrawalEnabled] = useState<boolean>(false);
  const [withdrawalAge, setWithdrawalAge] = useState<number>(18);
  const [withdrawalAmount, setWithdrawalAmount] = useState<number>(100000);
  const [withdrawalAgeError, setWithdrawalAgeError] = useState<string | null>(null);
  const [withdrawalAmountError, setWithdrawalAmountError] = useState<string | null>(null);


  const handleCalculate = useCallback(() => {
    const yearlyInvestment = monthlyInvestment * 12;
    // Re-validate all inputs before calculating
    const isInvestmentValid = yearlyInvestment >= MIN_INVESTMENT && yearlyInvestment <= MAX_INVESTMENT;
    const isAgeValid = girlAge >= MIN_GIRL_AGE && girlAge <= MAX_GIRL_AGE;

    if (!isInvestmentValid || !isAgeValid) return;
    
    // Clear previous withdrawal errors
    setWithdrawalAmountError(null);

    let openingBalance = 0;
    let totalInvestment = 0;
    const yearlyData = [];
    let totalWithdrawal = 0;

    // Pre-calculation to validate withdrawal amount if enabled
    if (isWithdrawalEnabled) {
      if (withdrawalAge < 18 || withdrawalAge >= MATURITY_PERIOD_YEARS) {
          setWithdrawalAgeError(`Withdrawal age must be between 18 and ${MATURITY_PERIOD_YEARS -1}.`);
          return;
      }
      if (withdrawalAmount <= 0) {
          setWithdrawalAmountError('Withdrawal amount must be positive.');
          return;
      }

      let balanceAtWithdrawalStart = 0;
      const withdrawalYear = withdrawalAge - girlAge;
      for (let i = 1; i < withdrawalYear; i++) {
        const investment = i <= DEPOSIT_PERIOD_YEARS ? yearlyInvestment : 0;
        const interest = (balanceAtWithdrawalStart + investment) * INTEREST_RATE;
        balanceAtWithdrawalStart += investment + interest;
      }
      const maxWithdrawal = balanceAtWithdrawalStart * 0.5;

      if (withdrawalAmount > maxWithdrawal) {
        setWithdrawalAmountError(`Amount cannot exceed 50% of the balance (Max: ₹${Math.floor(maxWithdrawal).toLocaleString('en-IN')}).`);
        return;
      }
    }

    // Main calculation loop
    for (let i = 1; i <= MATURITY_PERIOD_YEARS; i++) {
      const currentAge = girlAge + i;
      const currentYearInvestment = i <= DEPOSIT_PERIOD_YEARS ? yearlyInvestment : 0;
      const currentMonthInvestment = i <= DEPOSIT_PERIOD_YEARS ? monthlyInvestment : 0;
      totalInvestment += currentYearInvestment;
      
      const interest = (openingBalance + currentYearInvestment) * INTEREST_RATE;
      let closingBalance = openingBalance + currentYearInvestment + interest;

      let currentYearWithdrawal = 0;
      if (isWithdrawalEnabled && currentAge === withdrawalAge) {
        currentYearWithdrawal = withdrawalAmount;
        closingBalance -= currentYearWithdrawal;
        totalWithdrawal += currentYearWithdrawal;
      }

      yearlyData.push({
        year: i,
        age: currentAge,
        monthlyInvestment: currentMonthInvestment,
        investment: currentYearInvestment,
        interest: interest,
        closingBalance: closingBalance,
        totalInvestment: totalInvestment,
        withdrawal: currentYearWithdrawal,
      });

      openingBalance = closingBalance;
    }

    const totalInterest = openingBalance + totalWithdrawal - totalInvestment;

    setResults({
      yearlyData,
      totalInvestment,
      totalInterest,
      maturityValue: openingBalance,
      totalWithdrawal,
    });
  }, [monthlyInvestment, girlAge, isWithdrawalEnabled, withdrawalAge, withdrawalAmount]);
  
  const handleMonthlyInvestmentChange = (value: number) => {
    setMonthlyInvestment(value);
    if (isNaN(value)) {
        setInvestmentError('Please enter a valid amount.');
        return;
    }
    const yearlyValue = value * 12;
    if (yearlyValue < MIN_INVESTMENT) {
      setInvestmentError(`Yearly total must be at least ₹${MIN_INVESTMENT.toLocaleString('en-IN')}.`);
    } else if (yearlyValue > MAX_INVESTMENT) {
      setInvestmentError(`Yearly total cannot exceed ₹${MAX_INVESTMENT.toLocaleString('en-IN')}.`);
    } else {
      setInvestmentError(null);
    }
  };

  const handleAgeChange = (value: number) => {
    setGirlAge(value);
     if (isNaN(value)) {
        setAgeError('Please enter a valid age.');
        return;
    }
    if (value < MIN_GIRL_AGE) {
      setAgeError(`Girl's age cannot be less than ${MIN_GIRL_AGE}.`);
    } else if (value > MAX_GIRL_AGE) {
      setAgeError(`Girl's age cannot be more than ${MAX_GIRL_AGE}.`);
    } else {
      setAgeError(null);
    }
  };

  const handleWithdrawalAgeChange = (value: number) => {
    setWithdrawalAge(value);
    if(value < 18 || value >= MATURITY_PERIOD_YEARS) {
        setWithdrawalAgeError(`Age must be between 18 and ${MATURITY_PERIOD_YEARS - 1}.`);
    } else {
        setWithdrawalAgeError(null);
    }
  };
  
  const handleWithdrawalAmountChange = (value: number) => {
      setWithdrawalAmount(value);
      if (value <= 0) {
        setWithdrawalAmountError('Amount must be positive.');
      } else {
        // Error for exceeding 50% is handled dynamically on calculate
        setWithdrawalAmountError(null); 
      }
  };


  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-brand-dark mb-2">Sukanya Samriddhi Yojana (SSY) Calculator</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Plan for your daughter's future. Estimate the maturity amount from the SSY scheme, with an option to include partial withdrawal.
          </p>
        </header>

        <TaxBenefitInfo />
        
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <CalculatorForm 
              monthlyInvestment={monthlyInvestment}
              onMonthlyInvestmentChange={handleMonthlyInvestmentChange}
              girlAge={girlAge}
              onAgeChange={handleAgeChange}
              onCalculate={handleCalculate}
              investmentError={investmentError}
              ageError={ageError}
              isWithdrawalEnabled={isWithdrawalEnabled}
              onIsWithdrawalEnabledChange={setIsWithdrawalEnabled}
              withdrawalAge={withdrawalAge}
              onWithdrawalAgeChange={handleWithdrawalAgeChange}
              withdrawalAmount={withdrawalAmount}
              onWithdrawalAmountChange={handleWithdrawalAmountChange}
              withdrawalAgeError={withdrawalAgeError}
              withdrawalAmountError={withdrawalAmountError}
            />
          </div>
          <div className="lg:col-span-2">
            <ResultsDisplay results={results} />
          </div>
        </main>
        
        <footer className="text-center mt-12 py-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            <strong>Disclaimer:</strong> This calculator is for illustrative purposes only. The projected values are based on the current interest rate of 8.2% and are subject to change. Please consult a financial advisor for personalized advice.
          </p>
        </footer>
      </div>
    </div>
  );
};

// Fix: Add default export for the App component.
export default App;
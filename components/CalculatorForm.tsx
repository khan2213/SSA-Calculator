import React from 'react';
import { MIN_INVESTMENT, MAX_INVESTMENT, MIN_GIRL_AGE, MAX_GIRL_AGE, MATURITY_PERIOD_YEARS } from '../constants';

interface CalculatorFormProps {
  monthlyInvestment: number;
  onMonthlyInvestmentChange: (value: number) => void;
  girlAge: number;
  onAgeChange: (value: number) => void;
  onCalculate: () => void;
  investmentError: string | null;
  ageError: string | null;
  isWithdrawalEnabled: boolean;
  onIsWithdrawalEnabledChange: (enabled: boolean) => void;
  withdrawalAge: number;
  onWithdrawalAgeChange: (value: number) => void;
  withdrawalAmount: number;
  onWithdrawalAmountChange: (value: number) => void;
  withdrawalAgeError: string | null;
  withdrawalAmountError: string | null;
}

const RupeeIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 8.25H9m6 3H9m3 6.75h3.75c.621 0 1.125-.504 1.125-1.125V4.125c0-.621-.504-1.125-1.125-1.125H7.875c-.621 0-1.125.504-1.125 1.125v14.25c0 .621.504 1.125 1.125 1.125h8.25c.621 0 1.125-.504 1.125-1.125v-1.5a1.125 1.125 0 0 0-1.125-1.125H9.75" />
    </svg>
);

const UserIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
);

const CalendarIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h18M-4.5 12h22.5" />
    </svg>
);


const CalculatorForm: React.FC<CalculatorFormProps> = ({
  monthlyInvestment, onMonthlyInvestmentChange, girlAge, onAgeChange, onCalculate,
  investmentError, ageError, isWithdrawalEnabled, onIsWithdrawalEnabledChange,
  withdrawalAge, onWithdrawalAgeChange, withdrawalAmount, onWithdrawalAmountChange,
  withdrawalAgeError, withdrawalAmountError,
}) => {
  const isCoreInvalid = !!investmentError || !!ageError;
  const isWithdrawalInvalid = isWithdrawalEnabled && (!!withdrawalAgeError || !!withdrawalAmountError || withdrawalAmount <= 0);
  const isInvalid = isCoreInvalid || isWithdrawalInvalid;
  const monthlyMax = MAX_INVESTMENT / 12;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 sticky top-8">
      <h2 className="text-2xl font-bold text-brand-primary mb-6">Investment Details</h2>
      <div className="space-y-6">
        {/* Monthly Investment */}
        <div>
          <label htmlFor="monthlyInvestment" className="block text-sm font-medium text-gray-700 mb-2">
            Monthly Investment (₹)
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <RupeeIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number" id="monthlyInvestment" name="monthlyInvestment"
              className={`w-full pl-10 pr-4 py-2 border rounded-md shadow-sm transition-colors ${
                investmentError ? 'border-red-500 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-brand-secondary focus:border-brand-secondary'
              }`}
              value={monthlyInvestment} onChange={(e) => onMonthlyInvestmentChange(Number(e.target.value))}
              min="0" max={monthlyMax} step="100"
              aria-invalid={!!investmentError} aria-describedby={investmentError ? "investment-error" : undefined}
            />
          </div>
          {investmentError && <p id="investment-error" className="mt-2 text-sm text-red-600">{investmentError}</p>}
          <input
            type="range" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-3 accent-brand-secondary"
            min="0" max={monthlyMax} step="100"
            value={monthlyInvestment} onChange={(e) => onMonthlyInvestmentChange(Number(e.target.value))}
          />
           <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>₹0</span>
            <span>₹{monthlyMax.toLocaleString('en-IN')}</span>
          </div>
        </div>
        
        {/* Girl's Age */}
        <div>
          <label htmlFor="girlAge" className="block text-sm font-medium text-gray-700 mb-2">
            Girl's Age (at account opening)
          </label>
           <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <UserIcon className="h-5 w-5 text-gray-400" />
            </div>
             <input
              type="number" id="girlAge" name="girlAge"
              className={`w-full pl-10 pr-4 py-2 border rounded-md shadow-sm transition-colors ${
                ageError ? 'border-red-500 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-brand-secondary focus:border-brand-secondary'
              }`}
              value={girlAge} onChange={(e) => onAgeChange(Number(e.target.value))}
              min={MIN_GIRL_AGE} max={MAX_GIRL_AGE}
              aria-invalid={!!ageError} aria-describedby={ageError ? "age-error" : undefined}
            />
          </div>
          {ageError && <p id="age-error" className="mt-2 text-sm text-red-600">{ageError}</p>}
        </div>

        {/* Partial Withdrawal Section */}
        <div className="border-t border-gray-200 pt-6 space-y-4">
            <div className="relative flex items-start">
                <div className="flex h-6 items-center">
                    <input
                        id="withdrawal-enabled"
                        aria-describedby="withdrawal-description"
                        name="withdrawal-enabled"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-brand-secondary focus:ring-brand-secondary"
                        checked={isWithdrawalEnabled}
                        onChange={(e) => onIsWithdrawalEnabledChange(e.target.checked)}
                    />
                </div>
                <div className="ml-3 text-sm leading-6">
                    <label htmlFor="withdrawal-enabled" className="font-medium text-gray-900">
                        Apply for Partial Withdrawal
                    </label>
                    <p id="withdrawal-description" className="text-gray-500">
                        Simulate a one-time withdrawal after age 18.
                    </p>
                </div>
            </div>

            {isWithdrawalEnabled && (
                <div className="space-y-4 rounded-lg bg-blue-50 p-4 border border-blue-200">
                    {/* Withdrawal Age */}
                    <div>
                        <label htmlFor="withdrawalAge" className="block text-sm font-medium text-gray-700 mb-2">
                            Withdrawal Age
                        </label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <CalendarIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="number" id="withdrawalAge" name="withdrawalAge"
                                className={`w-full pl-10 pr-4 py-2 border rounded-md shadow-sm transition-colors ${
                                    withdrawalAgeError ? 'border-red-500 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-brand-secondary focus:border-brand-secondary'
                                }`}
                                value={withdrawalAge} onChange={(e) => onWithdrawalAgeChange(Number(e.target.value))}
                                min="18" max={MATURITY_PERIOD_YEARS - 1}
                                aria-invalid={!!withdrawalAgeError} aria-describedby={withdrawalAgeError ? "withdrawal-age-error" : undefined}
                            />
                        </div>
                         {withdrawalAgeError && <p id="withdrawal-age-error" className="mt-2 text-sm text-red-600">{withdrawalAgeError}</p>}
                    </div>
                     {/* Withdrawal Amount */}
                    <div>
                        <label htmlFor="withdrawalAmount" className="block text-sm font-medium text-gray-700 mb-2">
                            Withdrawal Amount (₹)
                        </label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <RupeeIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="number" id="withdrawalAmount" name="withdrawalAmount"
                                className={`w-full pl-10 pr-4 py-2 border rounded-md shadow-sm transition-colors ${
                                    withdrawalAmountError ? 'border-red-500 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-brand-secondary focus:border-brand-secondary'
                                }`}
                                value={withdrawalAmount} onChange={(e) => onWithdrawalAmountChange(Number(e.target.value))}
                                min="1" step="1000"
                                aria-invalid={!!withdrawalAmountError} aria-describedby={withdrawalAmountError ? "withdrawal-amount-error" : undefined}
                            />
                        </div>
                        {withdrawalAmountError && <p id="withdrawal-amount-error" className="mt-2 text-sm text-red-600">{withdrawalAmountError}</p>}
                    </div>
                </div>
            )}
        </div>


        <button
          onClick={onCalculate}
          disabled={isInvalid}
          className="w-full bg-brand-accent text-white font-bold py-3 px-4 rounded-lg hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent transition-all duration-300 ease-in-out transform hover:scale-105 disabled:bg-gray-400 disabled:scale-100 disabled:cursor-not-allowed"
        >
          Calculate Maturity Value
        </button>
      </div>
    </div>
  );
};

export default CalculatorForm;
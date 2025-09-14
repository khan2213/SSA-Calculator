import React, { useCallback } from 'react';
import { CalculationResult, YearlyData } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ResultsDisplayProps {
  results: CalculationResult | null;
}

const formatCurrency = (value: number) => {
  if (value === 0) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Fix: Define explicit props for CustomTooltip to resolve library type conflicts.
// The props passed to a custom tooltip component were not matching the imported TooltipProps type.
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string | number;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data: YearlyData = payload[0].payload;
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="font-bold text-gray-800">{`Age: ${label}`}</p>
        <ul className="mt-2 space-y-1 text-sm">
          <li className="flex justify-between items-center">
            <span className="text-gray-600">Yearly Deposit:</span>
            <span className="font-medium text-blue-600 ml-4">{formatCurrency(data.investment)}</span>
          </li>
          <li className="flex justify-between items-center">
            <span className="text-gray-600">Interest Earned:</span>
            <span className="font-medium text-green-600 ml-4">{formatCurrency(data.interest)}</span>
          </li>
          <li className="flex justify-between items-center">
            <span className="text-gray-600">Closing Balance:</span>
            <span className="font-medium text-pink-600 ml-4">{formatCurrency(data.closingBalance)}</span>
          </li>
        </ul>
      </div>
    );
  }
  return null;
};


const GrowthChart: React.FC<{ data: YearlyData[] }> = ({ data }) => {
  return (
    <div className="w-full h-80 bg-white p-4 rounded-xl shadow-md border border-gray-200">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="age" label={{ value: "Girl's Age", position: 'insideBottom', offset: -5 }} />
          <YAxis tickFormatter={(value) => `${formatCurrency(value as number)}`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line type="monotone" dataKey="totalInvestment" name="Total Investment" stroke="#3b82f6" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="closingBalance" name="Maturity Value" stroke="#ec4899" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const TaxBenefitInfo: React.FC = () => (
  <div className="bg-teal-50 border border-teal-200 text-teal-800 p-4 rounded-lg shadow-sm flex items-start space-x-4">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 flex-shrink-0 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
    <div>
      <h3 className="font-bold text-lg">Reminder: Your SSY Investment is Tax-Free!</h3>
      <p className="text-sm">
        The numbers you see are even better because they are not subject to tax. The SSY scheme has an <strong>Exempt-Exempt-Exempt (EEE)</strong> status, meaning the contribution, interest, and maturity amount are all tax-free.
      </p>
    </div>
  </div>
);


const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
  const handleDownloadPDF = useCallback(() => {
    if (!results) return;

    const { yearlyData, totalInvestment, totalInterest, maturityValue, totalWithdrawal } = results;
    const hasWithdrawal = totalWithdrawal > 0;
    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.text("Sukanya Samriddhi Yojana (SSY) Summary", 14, 22);
    doc.setFontSize(11);
    
    // Summary Data
    let startY = 32;
    doc.text(`Total Investment: ${formatCurrency(totalInvestment)}`, 14, startY);
    doc.text(`Total Interest Earned: ${formatCurrency(totalInterest)}`, 14, startY + 8);
    if (hasWithdrawal) {
      startY += 8;
      doc.text(`Amount Withdrawn: ${formatCurrency(totalWithdrawal)}`, 14, startY + 8);
    }
    startY += 16;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Final Maturity Value: ${formatCurrency(maturityValue)}`, 14, startY);
    doc.setFont('helvetica', 'normal');
    startY += 10;

    // Table
    const tableHead = [
      'Year', 'Age', 'Monthly', 'Yearly', 'Withdrawal', 'Interest', 'Balance'
    ];
    const tableBody = yearlyData.map(row => [
      row.year,
      row.age,
      formatCurrency(row.monthlyInvestment),
      formatCurrency(row.investment),
      formatCurrency(row.withdrawal),
      formatCurrency(row.interest),
      formatCurrency(row.closingBalance),
    ]);

    autoTable(doc, {
      startY: startY,
      head: [tableHead],
      body: tableBody,
      headStyles: { fillColor: [30, 64, 175] }, // brand-dark color
      styles: { fontSize: 8 },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 }, // Year
        1: { halign: 'center', cellWidth: 15 }, // Age
        2: { halign: 'right' }, // Monthly
        3: { halign: 'right' }, // Yearly
        4: { halign: 'right' }, // Withdrawal
        5: { halign: 'right' }, // Interest
        6: { halign: 'right' }, // Balance
      },
      didDrawPage: (data) => {
        // Watermark
        const { width, height } = doc.internal.pageSize;
        doc.saveGraphicsState();
        doc.setFontSize(60);
        doc.setTextColor("#d3d3d3");
        try {
          doc.setGState(new (doc as any).GState({ opacity: 0.2 }));
          doc.text("Postalguide", width / 2, height / 2, { align: "center", angle: -45 });
        } catch (e) {
            // Fallback for environments where GState might not be available
            console.error("Could not set GState for PDF watermark:", e);
            doc.text("Postalguide", width / 2, height / 2, { align: "center", angle: -45 });
        }
        doc.restoreGraphicsState();
      },
    });

    doc.save('SSY_Summary.pdf');
  }, [results]);

  if (!results) {
    return (
      <div className="flex flex-col items-center justify-center bg-white p-8 rounded-2xl shadow-lg border border-gray-200 h-full">
         <img src="https://storage.googleapis.com/aistudio-hosting/ssy-placeholder.svg" alt="Illustration of a piggy bank with coins" className="w-64 h-auto mb-6"/>
        <h2 className="text-2xl font-bold text-brand-primary">Plan Your Investment</h2>
        <p className="text-gray-600 mt-2 text-center">
          Enter your investment details and click 'Calculate' to see a projection of your savings.
        </p>
      </div>
    );
  }

  const { yearlyData, totalInvestment, totalInterest, maturityValue, totalWithdrawal } = results;
  const hasWithdrawal = totalWithdrawal > 0;

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${hasWithdrawal ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6`}>
        <div className="bg-blue-100 p-6 rounded-2xl text-center shadow-md border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800">Total Investment</h3>
          <p className="text-3xl font-bold text-blue-900">{formatCurrency(totalInvestment)}</p>
        </div>
        <div className="bg-pink-100 p-6 rounded-2xl text-center shadow-md border border-pink-200">
          <h3 className="text-lg font-semibold text-pink-800">Total Interest</h3>
          <p className="text-3xl font-bold text-pink-900">{formatCurrency(totalInterest)}</p>
        </div>
        {hasWithdrawal && (
             <div className="bg-orange-100 p-6 rounded-2xl text-center shadow-md border border-orange-200">
                <h3 className="text-lg font-semibold text-orange-800">Amount Withdrawn</h3>
                <p className="text-3xl font-bold text-orange-900">{formatCurrency(totalWithdrawal)}</p>
            </div>
        )}
        <div className={`bg-green-100 p-6 rounded-2xl text-center shadow-md border border-green-200 ${hasWithdrawal ? 'md:col-span-2 lg:col-span-1' : ''}`}>
          <h3 className="text-lg font-semibold text-green-800">Maturity Value</h3>
          <p className="text-3xl font-bold text-green-900">{formatCurrency(maturityValue)}</p>
        </div>
      </div>
      
      {/* Chart */}
      <GrowthChart data={yearlyData} />

      {/* Tax Info */}
      <TaxBenefitInfo />

      {/* Yearly Breakdown Table */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-brand-primary">Year-by-Year Breakdown</h3>
          <button
            onClick={handleDownloadPDF}
            className="bg-brand-secondary text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary transition-all duration-300 ease-in-out flex items-center space-x-2"
            aria-label="Download summary as PDF"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Download PDF</span>
          </button>
        </div>
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
              <tr>
                <th scope="col" className="px-4 py-3">Year</th>
                <th scope="col" className="px-4 py-3">Age</th>
                <th scope="col" className="px-4 py-3">Monthly Deposit</th>
                <th scope="col" className="px-4 py-3">Yearly Deposit</th>
                <th scope="col" className="px-4 py-3">Withdrawal</th>
                <th scope="col" className="px-4 py-3">Interest Earned</th>
                <th scope="col" className="px-4 py-3">Closing Balance</th>
              </tr>
            </thead>
            <tbody>
              {yearlyData.map((row) => (
                <tr key={row.year} className={`bg-white border-b hover:bg-gray-50 ${row.withdrawal > 0 ? 'bg-orange-50' : ''}`}>
                  <td className="px-4 py-3 font-medium">{row.year}</td>
                  <td className="px-4 py-3">{row.age}</td>
                  <td className="px-4 py-3">{formatCurrency(row.monthlyInvestment)}</td>
                  <td className="px-4 py-3">{formatCurrency(row.investment)}</td>
                  <td className={`px-4 py-3 font-semibold ${row.withdrawal > 0 ? 'text-orange-700' : ''}`}>{formatCurrency(row.withdrawal)}</td>
                  <td className="px-4 py-3">{formatCurrency(row.interest)}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{formatCurrency(row.closingBalance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;

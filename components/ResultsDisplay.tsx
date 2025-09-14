import React, { useCallback } from 'react';
import { CalculationResult, YearlyData } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ResultsDisplayProps {
  results: CalculationResult | null;
  onReset: () => void;
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


const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, onReset }) => {
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
         <img src="https://storage.googleapis.com/aistudio-hosting/ssy-family-illustration.svg" alt="Illustration of a family planning their child's future" className="w-80 h-auto mb-4"/>
        <h2 className="text-2xl font-bold text-brand-primary">Plan Your Investment</h2>
        <p className="text-gray-600 mt-2 text-center">
          Enter your investment details and click 'Calculate' to see a projection of your savings.
        </p>
      </div>
    );
  }

  const { yearlyData, totalInvestment, totalInterest, maturityValue, totalWithdrawal } = results;
  const hasWithdrawal = totalWithdrawal > 0;
  
  const shareText = `I just calculated my Sukanya Samriddhi Yojana investment! With a monthly investment of ${formatCurrency(yearlyData[0].monthlyInvestment)}, the estimated maturity value is ${formatCurrency(maturityValue)}. Plan for your daughter's future too!`;
  const encodedShareText = encodeURIComponent(shareText);
  const pageUrl = encodeURIComponent(window.location.href);

  const shareLinks = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodedShareText}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedShareText}&url=${pageUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}&quote=${encodedShareText}`,
  };

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
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <h3 className="text-xl font-bold text-brand-primary">Your Projection</h3>
           <div className="flex items-center gap-2 flex-wrap justify-center">
              <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors" title="Share on WhatsApp"><svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path d="M20.07,4.33C17.89,2.16,15.3,1,12,1C5.79,1,0.85,5.94,0.85,12.15c0,2.12,0.56,4.14,1.61,5.89L1,24l6.24-1.55 c1.68,0.92,3.6,1.4,5.59,1.4h0.01c6.21,0,11.15-4.94,11.15-11.15C24,9.15,22.25,6.5,20.07,4.33z M12,21.8c-1.82,0-3.57-0.49-5.07-1.39 l-0.36-0.21l-3.76,0.94l0.95-3.67l-0.23-0.38C2.68,15.74,2.1,13.9,2.1,12.15c0-5.46,4.44-9.9,9.9-9.9c2.64,0,5.13,1.04,6.99,2.9 c1.87,1.87,2.9,4.35,2.9,6.99C21.9,17.36,17.46,21.8,12,21.8z M17.29,14.46c-0.28-0.14-1.64-0.81-1.9-0.9c-0.26-0.09-0.45-0.14-0.64,0.14 c-0.19,0.28-0.72,0.9-0.88,1.08c-0.16,0.18-0.32,0.21-0.6,0.07c-0.28-0.14-1.18-0.43-2.25-1.39c-0.83-0.75-1.39-1.68-1.55-1.96 c-0.16-0.28-0.02-0.43,0.12-0.57c0.13-0.13,0.28-0.34,0.42-0.51c0.14-0.17,0.19-0.28,0.28-0.47c0.09-0.19,0.05-0.36-0.02-0.5 c-0.07-0.14-0.64-1.55-0.88-2.12c-0.23-0.55-0.47-0.48-0.64-0.48c-0.17,0-0.36-0.05-0.55-0.05s-0.5,0.07-0.76,0.36 c-0.26,0.29-1,0.98-1,2.38c0,1.4,1.03,2.76,1.17,2.94c0.14,0.18,2,3.19,4.84,4.25c0.68,0.26,1.22,0.41,1.64,0.53 c0.73,0.2,1.39,0.17,1.9-0.12c0.57-0.3,1.64-1.08,1.87-2.05c0.23-0.97,0.23-1.79,0.16-1.96C17.74,14.6,17.57,14.6,17.29,14.46z"/></svg></a>
              <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-colors" title="Share on Twitter"><svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.223.085c.645 1.956 2.508 3.38 4.718 3.42a9.863 9.863 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg></a>
              <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors" title="Share on Facebook"><svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/></svg></a>
              <div className="border-l h-6 mx-1"></div>
              <button onClick={onReset} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 flex items-center space-x-2" aria-label="Reset calculator">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 1V6a4 4 0 00-4-4H5a4 4 0 00-4 4v12a4 4 0 004 4h14a4 4 0 004-4v-3m-5-4l-5 5m0-5l5 5" /></svg>
                <span>Reset</span>
              </button>
              <button onClick={handleDownloadPDF} className="bg-brand-secondary text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 flex items-center space-x-2" aria-label="Download summary as PDF">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                <span>Download PDF</span>
              </button>
          </div>
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
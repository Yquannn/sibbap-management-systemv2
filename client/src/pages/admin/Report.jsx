import React, { useState } from 'react';
import { Calendar, Download, FileText, Filter, Printer } from 'lucide-react';

export default function LoanReportGenerator() {
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [reportType, setReportType] = useState('summary');
  const [loanStatus, setLoanStatus] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  
  const handleGenerateReport = () => {
    setIsGenerating(true);
    
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
      setReportGenerated(true);
    }, 1500);
  };
  
  const mockReportData = {
    summary: {
      totalLoans: 245,
      activeLoans: 180,
      completedLoans: 42,
      defaultedLoans: 23,
      totalAmount: '$2,450,000',
      averageLoanAmount: '$10,000',
      averageInterestRate: '8.5%',
    },
    loansByStatus: [
      { status: 'Active', count: 180, amount: '$1,800,000' },
      { status: 'Completed', count: 42, amount: '$420,000' },
      { status: 'Defaulted', count: 23, amount: '$230,000' },
    ],
    recentLoans: [
      { id: 'L-2025-042', client: 'John Smith', amount: '$15,000', date: '2025-04-01', status: 'Active' },
      { id: 'L-2025-041', client: 'Maria Garcia', amount: '$8,500', date: '2025-03-28', status: 'Active' },
      { id: 'L-2025-040', client: 'Robert Johnson', amount: '$12,000', date: '2025-03-25', status: 'Active' },
      { id: 'L-2025-039', client: 'Sarah Williams', amount: '$5,000', date: '2025-03-20', status: 'Completed' },
      { id: 'L-2025-038', client: 'David Brown', amount: '$20,000', date: '2025-03-15', status: 'Defaulted' },
    ]
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Loan Report Generator</h1>
        <p className="text-gray-600">Generate customized reports for loan data analysis</p>
      </div>
      
      {/* Report Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="summary">Summary Report</option>
              <option value="detailed">Detailed Report</option>
              <option value="client">Client-wise Report</option>
              <option value="performance">Loan Performance Report</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loan Status</label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={loanStatus}
              onChange={(e) => setLoanStatus(e.target.value)}
            >
              <option value="all">All Loans</option>
              <option value="active">Active Loans</option>
              <option value="completed">Completed Loans</option>
              <option value="defaulted">Defaulted Loans</option>
              <option value="pending">Pending Approval</option>
            </select>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <input 
                  type="date" 
                  className="w-full p-2 pl-8 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                />
                <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              </div>
              <div className="relative">
                <input 
                  type="date" 
                  className="w-full p-2 pl-8 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                />
                <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              </div>
            </div>
          </div>
          
          <div className="pt-6">
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md shadow-sm flex items-center justify-center gap-2"
              onClick={handleGenerateReport}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <FileText className="h-5 w-5" />
                  <span>Generate Report</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Advanced Filters (collapsible) */}
      <div className="mb-8">
        <button 
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
          onClick={() => {}}
        >
          <Filter className="h-4 w-4 mr-1" />
          Advanced Filters
        </button>
      </div>
      
      {/* Report Preview */}
      {reportGenerated && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              {reportType === 'summary' ? 'Loan Summary Report' : 
               reportType === 'detailed' ? 'Detailed Loan Report' :
               reportType === 'client' ? 'Client-wise Loan Report' : 'Loan Performance Report'}
            </h2>
            <div className="flex space-x-2">
              <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-md">
                <Printer className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-md">
                <Download className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {reportType === 'summary' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(mockReportData.summary).map(([key, value]) => (
                  <div key={key} className="bg-white p-4 rounded-md shadow-sm">
                    <p className="text-sm text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                    <p className="text-xl font-bold text-gray-800">{value}</p>
                  </div>
                ))}
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">Loans by Status</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                        <th className="px-4 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {mockReportData.loansByStatus.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{item.status}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{item.count}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{item.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">Recent Loans</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loan ID</th>
                        <th className="px-4 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                        <th className="px-4 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-4 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {mockReportData.recentLoans.map((loan, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{loan.id}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{loan.client}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{loan.amount}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{loan.date}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium 
                              ${loan.status === 'Active' ? 'bg-green-100 text-green-800' : 
                                loan.status === 'Completed' ? 'bg-blue-100 text-blue-800' : 
                                'bg-red-100 text-red-800'}`}
                            >
                              {loan.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
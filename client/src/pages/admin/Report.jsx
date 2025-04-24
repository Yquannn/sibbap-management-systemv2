// src/pages/admin/Report.jsx
import React, { useState } from 'react';
import dayjs from 'dayjs';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

// Report Table Component
const ReportTable = ({ data }) => {
  if (!data || data.length === 0) return null;
  
  // Get column headers from the first item
  const columns = Object.keys(data[0]);
  
  return (
    <div className="mt-6 overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
      <div className="overflow-x-auto max-h-[440px]">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              {columns.map((column) => (
                <th key={column} className="py-3.5 px-4 text-left text-sm font-semibold text-gray-900">
                  {column.replace(/_/g, ' ').toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {data.map((row, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {columns.map((column) => (
                  <td key={`${index}-${column}`} className="whitespace-nowrap py-3 px-4 text-sm text-gray-500">
                    {row[column]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Report = () => {
  const [module, setModule] = useState('report-members');
  const [reportType, setReportType] = useState('summary');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        type: reportType,
        startDate: startDate ? dayjs(startDate).format('YYYY-MM-DD') : '',
        endDate: endDate ? dayjs(endDate).format('YYYY-MM-DD') : '',
      }).toString();
  
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      const endpoint = `${baseUrl}/${module}?${queryParams}`;
      
      console.log("Fetching from:", endpoint);
  
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setReportData(result.data);
      } else {
        console.error("API returned error:", result.message);
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Failed to fetch report:", error);
      alert(`Failed to fetch report: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${module}-${reportType}`);
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    saveAs(data, `${module}-${reportType}-report-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Report Generator</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <select
            value={module}
            onChange={(e) => setModule(e.target.value)}
            className="block w-full rounded-md border-0 py-2.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
          >
            <option value="report-members">Members</option>
            <option value="report-share-capital">Share Capital</option>
            <option value="report-regular-savings">Regular Savings</option>
            <option value="report-time-deposit">Time Deposit</option>
            <option value="report-loans">Loans</option>
            <option value="report-kalinga">Kalinga Fund</option>
          </select>
        </div>
        
        <div>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="block w-full rounded-md border-0 py-2.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
          >
            <option value="summary">Summary Report</option>
            <option value="detailed">Detailed Report</option>
          </select>
        </div>
        
        <div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
            placeholder="Start Date"
          />
        </div>
        
        <div>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
            placeholder="End Date"
          />
        </div>
      </div>
      
      <div className="flex gap-3">
        <button 
          onClick={fetchReport}
          disabled={loading}
          className="inline-flex justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : 'Generate Report'}
        </button>
        
        <button 
          onClick={exportToExcel}
          disabled={!reportData.length}
          className="inline-flex justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-indigo-600 shadow-sm ring-1 ring-inset ring-indigo-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Export to Excel
        </button>
      </div>
      
      {reportData.length > 0 && <ReportTable data={reportData} />}
    </div>
  );
};

export default Report;
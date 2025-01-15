import React, { useState, useEffect } from 'react';

function TableWithGrouping() {
  const [data, setData] = useState([]);
  const [activeMonths, setActiveMonths] = useState([]);
  const [currentMonth, setCurrentMonth] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/maintenance/'); // Verify this endpoint
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const jsonData = await response.json();
        if (!jsonData || jsonData.length === 0) {
          console.error('No data found or data format is incorrect');
          return;
        }
        setData(jsonData);
        setCurrentMonth(jsonData[0].month); // Safely assuming the first item has a month
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, []);

  const toggleMonth = (month) => {
    setActiveMonths(activeMonths.includes(month) ? activeMonths.filter(m => m !== month) : [...activeMonths, month]);
  };

  const paginate = (month) => {
    setCurrentMonth(month);
  };

  return (
    <div className="flex flex-col">
      <div className="p-6 overflow-hidden flex-grow min-h-[450px]">
        <div className="overflow-x-auto">
          <div className="max-h-[400px] overflow-y-auto relative">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-green-200 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dividend</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.filter(item => item.month === currentMonth).map((record, index) => (
                  <tr key={index} className="hover:bg-gray-100">
                    <td className="px-6 py-4 text-sm text-gray-900">{record.month}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{record.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{record.service}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{record.dividend}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="flex justify-center space-x-2">
        {Array.from(new Set(data.map(item => item.month))).map((month, index) => (
          <button key={index} onClick={() => paginate(month)} className="px-2 py-1 text-sm border rounded text-blue-600 border-blue-600 hover:bg-blue-500 hover:text-white">
            {month}
          </button>
        ))}
      </div>
    </div>
  );
}

export default TableWithGrouping;

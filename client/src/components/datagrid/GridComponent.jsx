import React, { useState, useEffect } from "react";

function TableWithGrouping() {
  const [data, setData] = useState([]);
  const [currentMonth, setCurrentMonth] = useState("");
  const [activeGroups, setActiveGroups] = useState([]);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/maintenance/");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const jsonData = await response.json();

        if (!jsonData || !Array.isArray(jsonData) || jsonData.length === 0) {
          console.error("No data found or data format is incorrect");
          return;
        }

        setData(jsonData);

        if (jsonData.length > 0 && jsonData[0].month) {
          setCurrentMonth(jsonData[0].month);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, []);

  const paginate = (month) => {
    setCurrentMonth(month);
  };

  const toggleGroup = (month) => {
    setActiveGroups((prev) =>
      prev.includes(month) ? prev.filter((m) => m !== month) : [...prev, month]
    );
  };

  return (
    <div className="flex flex-col">
      {/* Month selector buttons */}
      <div className="flex justify-center space-x-2">
        {months.map((month, index) => (
          <button
            key={index}
            onClick={() => paginate(month)}
            className="px-2 py-1 text-sm border rounded text-blue-600 border-blue-600 hover:bg-blue-500 hover:text-white"
          >
            {month}
          </button>
        ))}
      </div>

      {/* Table section */}
      <div className="p-6 overflow-hidden flex-grow min-h-[700px]">
        <div className="overflow-x-auto">
          <div className="max-h-[650px] overflow-y-auto relative">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-green-200 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year/Month</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dividend</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 ">
                {data
                .filter((monthData) => monthData.month === currentMonth)
                .map((monthGroup) => (
                  <React.Fragment key={`${monthGroup.year}-${monthGroup.month}`}>
                    <tr
                      className="bg-gray-100 cursor-pointer"
                      onClick={() => toggleGroup(monthGroup.month)}
                    >
                      <td
                        colSpan={4}
                        className="px-6 py-2 text-sm font-medium text-gray-900"
                      >
                        Year: {monthGroup.year} - Month: {monthGroup.month} -{" "}
                        {monthGroup.data.length} items
                      </td>
                    </tr>
                    {activeGroups.includes(monthGroup.month) &&
                      monthGroup.data.map((record, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 text-sm whitespace-nowrap">
                            {monthGroup.month} - {monthGroup.year}
                          </td>
                          <td className="px-6 py-4 text-sm whitespace-nowrap">
                            {record.name}
                          </td>
                          <td className="px-6 py-4 text-sm whitespace-nowrap">
                            {record.service}
                          </td>
                          <td className="px-6 py-4 text-sm whitespace-nowrap">
                            {record.dividend}
                          </td>
                        </tr>
                      ))}
                  </React.Fragment>
                ))}
            </tbody>


            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TableWithGrouping;



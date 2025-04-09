import React, { useState } from 'react';

const TabHeader = ({ searchQuery, handleSearch, handleFilterClick }) => (
  <div className="flex items-center gap-5">
    <div className="flex items-center gap-2">
      <input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={handleSearch}
        className="p-2 border border-gray-300 rounded"
      />
      <span onClick={handleFilterClick} className="cursor-pointer">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 text-blue-600"
          viewBox="0 0 24 24"
        >
          <path d="M3 4h18l-7 9v7l-4-2v-5l-7-9z" />
        </svg>
      </span>
    </div>
  </div>
);

const LoanDashboardMaintenance = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('loan');

  // State for Loan Type data.
  const [loans, setLoans] = useState([
    { name: 'Emergency', rate: '5.0%', amount: 'Php 100,000', fee: 'Php 1,000' },
    { name: 'Educational', rate: '7.0%', amount: 'Php 150,000', fee: 'Php 2,000' },
    { name: 'Business', rate: '8.5%', amount: 'Php 200,000', fee: 'Php 3,000' }
  ]);

  // State for Dropdown Manager data.
  const [dropdowns, setDropdowns] = useState([
    'Member Types',
    'Civil Status',
    'Employment Status',
    'Region'
  ]);

  // State for archived items.
  const [archivedLoans, setArchivedLoans] = useState([]);
  const [archivedDropdowns, setArchivedDropdowns] = useState([]);

  // Handler functions for editing.
  const handleEdit = (item, type) => {
    if (type === 'Loan Type') {
      const newName = prompt('Enter new loan type name:', item);
      if (newName) {
        setLoans(loans.map(loan => (loan.name === item ? { ...loan, name: newName } : loan)));
      }
    } else if (type === 'Dropdown') {
      const newVal = prompt('Enter new dropdown value:', item);
      if (newVal) {
        setDropdowns(dropdowns.map(dd => (dd === item ? newVal : dd)));
      }
    }
  };

  // Handler for Archive button.
  const handleArchive = (item, type) => {
    if (window.confirm(`Are you sure you want to archive ${type}: ${item}?`)) {
      if (type === 'Loan Type') {
        const archivedItem = loans.find(loan => loan.name === item);
        setArchivedLoans([...archivedLoans, archivedItem]);
        setLoans(loans.filter(loan => loan.name !== item));
      } else if (type === 'Dropdown') {
        setArchivedDropdowns([...archivedDropdowns, item]);
        setDropdowns(dropdowns.filter(dd => dd !== item));
      }
      setActiveTab('archive'); // Switch to archive view
    }
  };

  // Handler for the search/filter input.
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handler for filter icon click.
  const handleFilterClick = () => {
    alert('Filter clicked');
  };

  // Render content based on active tab.
  const renderTabContent = () => {
    if (activeTab === 'loan') {
      return (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Loan Type</h2>
            <TabHeader
              searchQuery={searchQuery}
              handleSearch={handleSearch}
              handleFilterClick={handleFilterClick}
            />
          </div>
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left border-b">Loan Type</th>
                <th className="px-4 py-2 text-left border-b">Interest Rate</th>
                <th className="px-4 py-2 text-left border-b">Loanable Amount</th>
                <th className="px-4 py-2 text-left border-b">Service Fee</th>
                <th className="px-4 py-2 text-right border-b">Action</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((loan, index) => (
                <tr key={index}>
                  <td className="px-4 py-2 border-b">{loan.name}</td>
                  <td className="px-4 py-2 border-b">{loan.rate}</td>
                  <td className="px-4 py-2 border-b">{loan.amount}</td>
                  <td className="px-4 py-2 border-b">{loan.fee}</td>
                  <td className="px-4 py-2 text-right border-b">
                    <button
                      className="bg-blue-500 text-white p-2 rounded mr-2"
                      onClick={() => handleEdit(loan.name, 'Loan Type')}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 text-white p-2 rounded"
                      onClick={() => handleArchive(loan.name, 'Loan Type')}
                    >
                      Archive
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else if (activeTab === 'dropdown') {
      return (
        <div className="flex justify-center">
          <div className="bg-white p-6 rounded-lg shadow-md w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Dropdown Manager</h2>
              <TabHeader
                searchQuery={searchQuery}
                handleSearch={handleSearch}
                handleFilterClick={handleFilterClick}
              />
            </div>
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left border-b">Dropdown Name</th>
                  <th className="px-4 py-2 text-right border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {dropdowns.map((dropdown, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 border-b">{dropdown}</td>
                    <td className="px-4 py-2 text-right border-b">
                      <button
                        className="bg-blue-500 text-white p-2 rounded mr-2"
                        onClick={() => handleEdit(dropdown, 'Dropdown')}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-500 text-white p-2 rounded"
                        onClick={() => handleArchive(dropdown, 'Dropdown')}
                      >
                        Archive
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    } else if (activeTab === 'archive') {
      return (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">Archive</h2>
          <h3 className="text-lg font-semibold mt-4">Loan Type Archive</h3>
          {archivedLoans.length === 0 ? (
            <p>No archived loans.</p>
          ) : (
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left border-b">Loan Type</th>
                  <th className="px-4 py-2 text-left border-b">Interest Rate</th>
                  <th className="px-4 py-2 text-left border-b">Loanable Amount</th>
                  <th className="px-4 py-2 text-left border-b">Service Fee</th>
                </tr>
              </thead>
              <tbody>
                {archivedLoans.map((loan, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 border-b">{loan.name}</td>
                    <td className="px-4 py-2 border-b">{loan.rate}</td>
                    <td className="px-4 py-2 border-b">{loan.amount}</td>
                    <td className="px-4 py-2 border-b">{loan.fee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <h3 className="text-lg font-semibold mt-4">Dropdown Archive</h3>
          {archivedDropdowns.length === 0 ? (
            <p>No archived dropdowns.</p>
          ) : (
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left border-b">Dropdown Name</th>
                </tr>
              </thead>
              <tbody>
                {archivedDropdowns.map((dropdown, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 border-b">{dropdown}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      );
    }
  };

  return (
    <div className="container p-6">
      {/* New Tab Navigation: each tab item with balanced spacing and underline */}
      <div className="flex gap-10 border-b-2 pb-2">
        <div
          className={`cursor-pointer ${activeTab === 'loan' ? 'font-bold text-blue-600' : 'text-gray-700'}`}
          onClick={() => setActiveTab('loan')}
        >
          Loan Type
          {activeTab === 'loan' && <div className="border-b-2 border-blue-600 w-full" />}
        </div>
        <div
          className={`cursor-pointer ${activeTab === 'dropdown' ? 'font-bold text-blue-600' : 'text-gray-700'}`}
          onClick={() => setActiveTab('dropdown')}
        >
          Dropdown Manager
          {activeTab === 'dropdown' && <div className="border-b-2 border-blue-600 w-full" />}
        </div>
        <div
          className={`cursor-pointer ${activeTab === 'archive' ? 'font-bold text-blue-600' : 'text-gray-700'}`}
          onClick={() => setActiveTab('archive')}
        >
          Archive
          {activeTab === 'archive' && <div className="border-b-2 border-blue-600 w-full" />}
        </div>
      </div>

      {/* Render active tab content */}
      {renderTabContent()}
    </div>
  );
};

export default LoanDashboardMaintenance;

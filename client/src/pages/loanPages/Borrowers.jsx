import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaDollarSign } from 'react-icons/fa';

const Borrowers = () => {
    const apiBaseURL = 'http://localhost:3001/api/members'; // Ensure this URL is correct

    const [borrowers, setBorrowers] = useState([]);
    const [activeTab, setActiveTab] = useState("RegularSavings");
    const [error, setError] = useState(""); // State for handling error messages

    const loanTypes = [
        "Feeds Loan", "Rice Loan", "Marketing Loan", "Back-to-Back Loan",
        "Regular Loan", "Livelihood Assistance Loan", "Educational Loan",
        "Emergency Loan", "Quick Cash Loan", "Car Loan", "Housing Loan",
        "Motorcycle Loan", "Memorial Lot Loan", "Travel Loan",
        "OFW Assistance Loan", "Savings Loan", "Health Insurance Loan",
        "Special Loan", "Reconstruction Loan"
    ];

    useEffect(() => {
        fetchBorrowers();
    }, []);

    const fetchBorrowers = async () => {
        try {
            const response = await axios.get(apiBaseURL);
            setBorrowers(response.data);
        } catch (error) {
            setError('Failed to fetch borrowers. Please try again later.');
            console.error('Error fetching borrowers:', error);
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-3xl font-bold mb-6">Borrowers</h2>
            
            {/* Loan Type Dropdown */}
            <div className="mb-6 p-4 bg-gray-100 shadow-sm rounded-lg">
                <label htmlFor="loanType" className="block text-lg font-medium text-gray-700 mb-2">Kinds of Loan</label>
                <select
                    id="loanType"
                    value={activeTab}
                    onChange={(e) => setActiveTab(e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-300 max-w-sm rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {loanTypes.map((tab) => (
                        <option key={tab} value={tab}>
                            {tab.replace(/([A-Z])/g, ' $1').trim()}
                        </option>
                    ))}
                </select>
            </div>

            {/* Error Handling */}
            {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

            {/* Content Area */}
            <div className="content p-6 bg-white rounded-lg shadow mb-6">
                <h3 className="text-2xl font-semibold mb-4">{activeTab.replace(/([A-Z])/g, ' $1').trim()}</h3>
                <p className="text-gray-700">Content related to {activeTab} will be displayed here.</p>
            </div>

            {/* Borrower Table */}
            <h3 className="text-2xl font-semibold mb-4">Borrower List for {activeTab.replace(/([A-Z])/g, ' $1').trim()}</h3>
            <div className="overflow-x-auto" style={{ maxHeight: "50vh" }}>
                <table className="min-w-full bg-white p-4 rounded-lg shadow-md">
                    <thead className="sticky top-0 bg-green-200 z-20 text-center">
                        <tr>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Client Voucher Number</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Full Name</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Loan Type</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Application</th>
                            <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Loan Amount</th>
                            <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Interest</th>
                            <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Terms</th>
                            <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Application Date</th>
                            <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Balance</th>
                            <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Remarks</th>
                            <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {borrowers.length > 0 ? (
                            borrowers.map((borrower) => (
                                <tr key={borrower.id} className="border-b">
                                 <td className="px-4 py-2 text-sm text-gray-700">{borrower.clientVoucherNumber || "N/A"}</td>
                                    <td className="px-4 py-2 text-sm text-gray-700">{borrower.LastName}, {borrower.FirstName} {borrower.MiddleName}</td>
                                    <td className="px-4 py-2 text-sm text-gray-700">{borrower.loanType || "N/A"}</td>
                                    <td className="px-4 py-2 text-sm text-gray-700">{borrower.applicationDate || "N/A"}</td>
                                    <td className="px-4 py-2 text-center text-sm text-gray-700">{borrower.loanAmount || "N/A"}</td>
                                    <td className="px-4 py-2 text-center text-sm text-gray-700">{borrower.interest || "N/A"}</td>
                                    <td className="px-4 py-2 text-center text-sm text-gray-700">{borrower.terms || "N/A"}</td>
                                    <td className="px-4 py-2 text-center text-sm text-gray-700">{borrower.applicationDate || "N/A"}</td>
                                    <td className="px-4 py-2 text-center text-sm text-gray-700">{borrower.balance || 0 }</td>
                                    <td className="px-4 py-2 text-center   text-sm text-gray-700">{borrower.remarks || "Pending"}</td>
                                    <td className="px-4 py-2 text-center  text-sm text-gray-700">
                                        <div className="flex justify-center space-x-3 ">
                                            <button className="bg-green-500 text-sm m-2 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center">
                                                <FaDollarSign /> Repayment
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="10" className="text-center py-4 text-gray-600">No borrowers available.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Borrowers;

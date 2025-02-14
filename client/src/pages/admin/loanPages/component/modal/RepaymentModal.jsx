import React from "react";

export default function LoanDetailsModal({ isOpen, onClose, borrower }) {
  if (!isOpen || !borrower) return null; // Prevents rendering if not open or borrower is missing

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 px-4">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-2xl">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-xl font-bold">Loan Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500"
          >
            ✖
          </button>
        </div>

        {/* Borrower Information */}
        <div className="mt-4">
          <p className="text-gray-700"><strong>Borrower:</strong> <span className="text-xl font-bold text-gray-500"> {borrower.LastName}, {borrower.FirstName} {borrower.MiddleName}</span> </p>
          <p className="text-gray-700"><strong>Loan Type:</strong> {borrower.loanType}</p>
        </div>

        {/* Loan Breakdown */}
        <div className="grid grid-cols-2 gap-6 mt-4 text-sm p-6 bg-white shadow-lg rounded-lg">
            {/* Left Column */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly Interest:</span> 
                <span className="font-semibold ">₱{borrower.interest || 100}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Loan Amount:</span> 
                <span className="font-semibold">₱{borrower.loanAmount || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly Amortization:</span> 
                <span className="font-semibold">₱450</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Terms:</span> 
                <span className="font-semibold">{borrower.terms || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date Release:</span> 
                <span className="font-semibold">N/A</span>
              </div>         
           </div>

            {/* Right Column */}
            <div className="space-y-3">
             <div className="flex justify-between">
                <span className="text-gray-600">Service Fee (3%):</span> 
                <span className="font-semibold">₱150</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Additional Savings Deposit (1%):</span> 
                <span className="font-semibold">₱50</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Capital Buildup (1%):</span> 
                <span className="font-semibold">₱50</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gift Check:</span> 
                <span className="font-semibold">₱30</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Insurance:</span> 
                <span className="font-semibold">₱70</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Others/Receivables:</span> 
                <span className="font-semibold">₱40</span>
              </div>
              <div className="flex justify-between border-t pt-3 font-bold text-lg">
                <span className="text-gray-800">Total Disbursed:</span> 
                <span className="text-green-600">₱4,460</span>
              </div>
            </div>
          </div>
          <div className="mt-6 ">
            <h3 className="text-lg font-semibold ">Payment Schedule</h3>
              {/* Scrollable Table Container */}
              <div className="overflow-y-auto max-h-[350px] border border-gray-300 rounded-lg mt-2 ">
                <table className="w-full border-collapse border border-green-300 text-sm">
                  {/* Table Head (Fixed) */}
                  <thead className="sticky top-0 bg-green-200 z-10">
                    <tr>
                      <th className="border p-2">Period Term</th>
                      <th className="border p-2">Due Date</th>
                      <th className="border p-2">Amortization</th>
                      <th className="border p-2">Principal Amount</th>
                      <th className="border p-2">Interest</th>
                      <th className="border p-2">Savings Deposit</th>
                      <th className="border p-2">Penalty</th>
                      <th className="border p-2">Balance</th>
                      <th className="border p-2">PAY</th>
                    </tr>
                  </thead>

                  {/* Table Body (Scrollable) */}
                  <tbody>
                    {[...Array(15)].map((_, index) => (
                      <tr key={index} className="hover:bg-gray-100 transition">
                        <td className="border p-2">{index + 1}</td>
                        <td className="border p-2">2025-03-01</td>
                        <td className="border p-2">₱450</td>
                        <td className="border p-2">₱400</td>
                        <td className="border p-2">₱50</td>
                        <td className="border p-2">₱50</td>
                        <td className="border p-2">₱0</td>
                        <td className="border p-2">₱4,000</td>
                        <td className="border p-2">
                          <button className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600">
                            Pay
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div> 
      </div>
    </div>
  );
}

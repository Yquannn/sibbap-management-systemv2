// LoanCalculationSummary.jsx
import React from "react";

const LoanCalculationSummary = ({
  loanAmount,
  terms,
  loanType,
  computedValues,
  loanRates
}) => {
  if (!computedValues) return null;

  return (
    <div className="mt-6 p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-2">
        Loan Calculation Summary
      </h3>
      <p>
        <strong>Loan Amount:</strong> ₱{parseFloat(loanAmount).toFixed(2)}
      </p>
      <p>
        <strong>Term (Months):</strong> {terms}
      </p>
      <p>
        <strong>Interest Rate (Annual):</strong>{" "}
        {loanRates[loanType]?.interest || 0}%
      </p>
      <p>
        <strong>Total Interest:</strong>{" "}
        ₱{computedValues.totalInterest.toFixed(2)}
      </p>
      <p>
        <strong>Service Fee:</strong>{" "}
        ₱{computedValues.serviceFee.toFixed(2)}
      </p>
      <p>
        <strong>Total Repayment:</strong>{" "}
        ₱{computedValues.totalRepayment.toFixed(2)}
      </p>
      <p>
        <strong>Monthly Payment:</strong>{" "}
        ₱{computedValues.monthlyPayment.toFixed(2)}
      </p>
    </div>
  );
};

export default LoanCalculationSummary;

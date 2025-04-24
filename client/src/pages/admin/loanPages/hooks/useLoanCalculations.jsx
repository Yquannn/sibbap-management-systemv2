import { useMemo } from 'react';

const useLoanCalculations = (loanInfo, memberInfo, commodityDetails, maxSacks) => {
  // Calculate maximum loanable amount as a function
  const calculateLoanableAmount = () => {
    let loanableAmount = 0;
    
    if (loanInfo.loanType === "feeds" || loanInfo.loanType === "rice") {
      const pricePerUnit = commodityDetails.price_per_unit || Number(loanInfo.loanAmount) || 0;
      
      if (memberInfo.share_capital) {
        loanableAmount = maxSacks * pricePerUnit;
      }
    } else if (loanInfo.loanType === "marketing") {
      loanableAmount = 75000; // Maximum marketing loan amount
    } else if (loanInfo.loanType === "backToBack") {
      loanableAmount = Number(memberInfo.share_capital) || 0;
    } else if (loanInfo.loanType === "regular") {
      // For regular loans, the loanable amount is 2x the share capital
      loanableAmount = Number(memberInfo.share_capital) * 2 || 0;
    }
    
    console.log(`Loanable Amount for ${loanInfo.loanType}: ₱${loanableAmount.toLocaleString()}`);
    console.log(`Share Capital: ₱${Number(memberInfo.share_capital).toLocaleString()}`);
    
    if (loanInfo.loanType === "regular") {
      console.log(`Regular Loan Calculation: ₱${Number(memberInfo.share_capital).toLocaleString()} × 2 = ₱${(Number(memberInfo.share_capital) * 2).toLocaleString()}`);
    }
    
    return loanableAmount;
  };

  // Calculate requested loan amount as a function
  const calculateRequestedAmount = () => {
    let requestedAmount = 0;
    
    if (loanInfo.loanType === "feeds" || loanInfo.loanType === "rice") {
      const pricePerUnit = commodityDetails.price_per_unit || Number(loanInfo.loanAmount) || 0;
      const sacks = Number(loanInfo.sacks) || 0;
      
      requestedAmount = pricePerUnit * sacks;
      
      if (commodityDetails.loan_percentage > 0) {
        // If loan percentage is available, no further calculation needed here
      }
    } else if (loanInfo.loanType === "marketing" || loanInfo.loanType === "backToBack" || loanInfo.loanType === "regular") {
      requestedAmount = Number(loanInfo.loanAmount) || 0;
    }
    
    console.log(`Requested Amount: ₱${requestedAmount.toLocaleString()}`);
    return requestedAmount;
  };

  return {
    calculateLoanableAmount,
    calculateRequestedAmount
  };
};

export default useLoanCalculations;
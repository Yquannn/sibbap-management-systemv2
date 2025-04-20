
import axios from "axios";

const BASE_URL = "http://localhost:3001/api";

// Helper function to format numbers with commas and two decimals.
export const formatNumber = (num) => {
  if (isNaN(num)) return "";
  return Number(num).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Fetch the Time Deposit module ID
export const fetchTimeDepositModuleId = async () => { 
  try {
    const response = await axios.get(`${BASE_URL}/modules`);
    // Find the module with name "Time Deposit"
    const timeDepositModule = response.data.find(module => 
      module.name === "Time Deposit" || module.name === "TIME DEPOSIT" || module.name === "time deposit"
    );
    
    // If found, return its id, otherwise return the first module id as fallback
    if (timeDepositModule) {
      return timeDepositModule.id;
    } else {
      console.warn("Time Deposit module not found, using first module as fallback");
      return response.data[0]?.id;
    }
  } catch (error) {
    console.error("Error fetching moduleId:", error);
    throw error;
  }
};

// Fetch interest rates based on module ID
export const fetchInterestRates = async (moduleId) => {
  if (!moduleId) {
    moduleId = await fetchTimeDepositModuleId();
  }
  
  const response = await axios.get(`${BASE_URL}/time-deposit/${moduleId}`);
  return response.data;
};

// Calculate the interest rate based on amount and term
export const calculateInterestRate = (interestRates, amount, termMonths) => {
  // Ensure amount and termMonths are valid numbers
  const amt = parseFloat(amount);
  const m = parseInt(termMonths, 10);
  
  if (isNaN(amt) || isNaN(m)) return 0;
  
  // If interest rates haven't been fetched yet, return 0
  if (!interestRates || interestRates.length === 0) return 0;

  // Find rates for the specified term
  const termRates = interestRates.filter(rate => rate.term_months === m);
  if (!termRates.length) return 0;

  // Sort rates by threshold (ascending)
  const sortedRates = [...termRates].sort((a, b) => 
    parseFloat(a.threshold) - parseFloat(b.threshold)
  );

  // Find the applicable rate based on amount
  let applicableRate = 0;
  for (const rate of sortedRates) {
    if (amt >= parseFloat(rate.threshold)) {
      // Convert rate from percentage string to decimal
      applicableRate = parseFloat(rate.rate) / 100;
    } else {
      break;
    }
  }

  return applicableRate;
};

// Calculate maturity date, interest and payout
export const calculateTimeDepositValues = (principal, termMonths, interestRate) => {
  if (!principal || !termMonths || !interestRate) {
    return {
      maturityDate: "",
      interest: "0.00",
      payout: "0.00",
      interestRate: "0.00"
    };
  }
  
  // Assuming 6-month term uses 182 days, otherwise 365 days.
  const days = termMonths === 6 ? 182 : 365;
  const interest = principal * interestRate * (days / 365);
  const payout = principal + interest;
  
  // Create maturity date
  const currentDate = new Date();
  const maturityDate = new Date(currentDate);
  maturityDate.setMonth(maturityDate.getMonth() + termMonths);
  
  return {
    maturityDate: maturityDate.toISOString().slice(0, 10),
    interest: formatNumber(interest),
    payout: formatNumber(payout),
    interestRate: formatNumber(interestRate * 100)
  };
};
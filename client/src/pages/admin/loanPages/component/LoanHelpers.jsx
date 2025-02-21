// loanHelpers.js

export const getSackLimit = (shareCapital, loanType, sop) => {
  if (loanType === "feeds") {
    if (shareCapital === 20000) return 15;
    if (shareCapital > 20000) return 30;
    return 0;
  } else if (loanType === "rice") {
    if (sop === "business") {
      if (shareCapital === 20000) return 30;
      if (shareCapital > 20000) return 50;
      return 0;
    } else if (sop === "personal") {
      if (shareCapital >= 6000) return 4;
      return 2;
    }
  }
  return 0;
};

export const computeVariableTerms = (amount) => {
  const amt = Number(amount);
  if (amt >= 6000 && amt <= 10000) return 6;
  if (amt >= 10001 && amt <= 50000) return 12;
  if (amt >= 50001 && amt <= 100000) return 24;
  if (amt >= 100001) return 36;
  return "";
};

export const loanRates = {
  marketing: { interest: 3.5, fee: 5 },
  backToBack: { interest: 2, fee: 3 },
  regular: { interest: 2, fee: 3 },
  livelihood: { interest: 2, fee: 3 },
  educational: { interest: 1.75, fee: 5 },
  emergency: { interest: 1.75, fee: 5 },
  quickCash: { interest: 2, fee: 1 },
  car: { interest: 1.75, fee: 1.2 },
  housing: { interest: 1.75, fee: 1.2 },
  motorcycle: { interest: 2, fee: 5 },
  memorialLot: { interest: 1.25, fee: 2 },
  intermentLot: { interest: 0, fee: 2 }, // default; override via state if needed
  travel: { interest: 2, fee: 5 },
  ofw: { interest: 2, fee: 5 },
  savings: { interest: 1.5, fee: 2 },
  health: { interest: 1.5, fee: 1.2 },
  special: { interest: 2.5, fee: 3 },
  reconstruction: { interest: 2, fee: 3 }
};

export const computeLoanCalculation = (
  loanAmount,
  terms,
  loanType,
  intermentInterest = 0
) => {
  const amount = parseFloat(loanAmount);
  const t = parseFloat(terms);
  if (!amount || !t || loanType === "feeds" || loanType === "rice") return null;

  // For intermentLot, override interest if provided
  const { interest, fee } =
    loanType === "intermentLot"
      ? { interest: parseFloat(intermentInterest) || 0, fee: 2 }
      : loanRates[loanType] || { interest: 0, fee: 0 };

  // Simple interest: interest calculated over t months (t/12 in years)
  const totalInterest = amount * (interest / 100) * (t / 12);
  const serviceFee = amount * (fee / 100);
  const totalRepayment = amount + totalInterest + serviceFee;
  const monthlyPayment = totalRepayment / t;
  return { totalInterest, serviceFee, totalRepayment, monthlyPayment };
};

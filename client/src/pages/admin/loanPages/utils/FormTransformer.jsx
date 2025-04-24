// utils/FormTransformer.js
export const transformFormData = (memberInfo, loanInfo, commodityDetails, maxSacks, requestedAmount, loanableAmount) => {
  // Convert loanType to the format expected by the API
  const apiLoanType = 
    loanInfo.loanType === "feeds" ? "Feeds Loan" : 
    loanInfo.loanType === "rice" ? "Rice Loan" :
    loanInfo.loanType === "marketing" ? "Marketing Loan" :
    loanInfo.loanType === "backToBack" ? "BackToBack Loan" : "Regular Loan";

  // Build the appropriate details object based on loan type
  let details = {
    statement_of_purpose: loanInfo.statementOfPurpose || ""
  };

  if (loanInfo.loanType === "feeds" || loanInfo.loanType === "rice") {
    details = {
      ...details,
      sacks: Number(loanInfo.sacks) || 0,
      max_sacks: Number(maxSacks) || 0,
      proof_of_business: loanInfo.proofOfBusiness || "",
      price_per_unit: commodityDetails.price_per_unit || 0,
      loan_percentage: commodityDetails.loan_percentage || 0
    };
  } else if (loanInfo.loanType === "marketing") {
    details = {
      ...details,
      comaker_name: loanInfo.coMakerDetails?.name || "",
      comaker_member_id: loanInfo.coMakerDetails?.memberId || ""
    };
  } else if (loanInfo.loanType === "backToBack") {
    details = {
      ...details,
      coborrower_member_id: loanInfo.coBorrower?.memberId || "",
      coborrower_relationship: loanInfo.coBorrower?.relationship || "",
      coborrower_name: loanInfo.coBorrower?.name || "",
      coborrower_contact: loanInfo.coBorrower?.contact || "",
      coborrower_address: loanInfo.coBorrower?.address || ""
    };
  } else if (loanInfo.loanType === "regular") {
    details = {
      ...details,
      comaker_name: loanInfo.coMakerDetails?.name || "",
      comaker_member_id: loanInfo.coMakerDetails?.memberId || ""
    };
  }

  return {
    memberId: String(memberInfo.memberId),
    loan_type: apiLoanType,
    application: loanInfo.applicationType || "New",
    loan_amount: requestedAmount,
    loanable_amount: loanableAmount,
    interest: Number(loanInfo.interest) || 0,
    terms: Number(loanInfo.loanTerms) || 0,
    balance: requestedAmount, // Initial balance equals the loan amount
    service_fee: Number(loanInfo.serviceFee) || 0,
    details: details,
    personalInfo: {
      memberCode: memberInfo.memberCode || "",
      last_name: memberInfo.last_name || "",
      first_name: memberInfo.first_name || "",
      middle_name: memberInfo.middle_name || "",
      date_of_birth: memberInfo.date_of_birth || "",
      birthplace_province: memberInfo.birthplace_province || "",
      age: memberInfo.age ? Number(memberInfo.age) : 0,
      civil_status: memberInfo.civil_status || "",
      sex: memberInfo.sex || "",
      number_of_dependents: memberInfo.number_of_dependents 
        ? Number(memberInfo.number_of_dependents) 
        : 0,
      spouse_name: memberInfo.spouse_name || "",
      spouse_occupation_source_of_income: memberInfo.spouse_occupation_source_of_income || "",
      occupation_source_of_income: memberInfo.occupation_source_of_income || "",
      monthly_income: memberInfo.monthly_income ? Number(memberInfo.monthly_income) : 0,
      employer_address: memberInfo.employer_address || "",
      employer_address2: memberInfo.employer_address2 || ""
    }
  };
};

// Export the sack limit calculation function
export const getSackLimit = (share_capital, loanType) => {
  const capital = parseFloat(share_capital);
  if (isNaN(capital)) return 0;

  if (loanType === "feeds") {
    if (capital < 6000) return 0;
    if (capital >= 20000) return 15;
    return Math.floor(((capital - 6000) / (20000 - 6000)) * 15);
  } else if (loanType === "rice") {
    if (capital >= 20000) return 30;
    else if (capital >= 6000) return 4;
    else return 2;
  }
  return 0;
};
 function generateTransactionNumber() {
    const timestamp = Date.now();
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    return `TXN-${timestamp}-${randomPart}`;
  }

  function generateAccountNumber() {
    const timestamp = Date.now().toString().slice(-5);  // Take the last 5 digits of the timestamp
    const randomPart = Math.floor(100 + Math.random() * 900);  // Generate a 3-digit random number
    return `${timestamp}${randomPart}`; // Combine both parts to form a 9-digit account number
  }
    
  
  module.exports = { generateTransactionNumber, generateAccountNumber };
  
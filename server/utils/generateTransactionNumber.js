export function generateTransactionNumber() {
    const timestamp = Date.now();
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    return `TXN-${timestamp}-${randomPart}`;
  }
  
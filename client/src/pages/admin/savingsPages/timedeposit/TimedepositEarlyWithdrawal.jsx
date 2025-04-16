import { useState, useEffect } from 'react';
import { DollarSign, AlertCircle, Calendar, Info, CheckCircle, ArrowLeft, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export default function TimeDepositEarlyWithdrawal() {
  const navigate = useNavigate();
  const { timeDepositId } = useParams();
  
  const [timeDeposit, setTimeDeposit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [withdrawalAmount, setWithdrawalAmount] = useState(0);
  const [isPartial, setIsPartial] = useState(false);
  const [confirmationStep, setConfirmationStep] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch time deposit data
  useEffect(() => {
    const fetchTimeDeposit = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3001/api/timedepositor/${timeDepositId}`);
        const result = await response.json();
        
        if (result.success) {
          setTimeDeposit(result.data.timeDeposit);
          setWithdrawalAmount(result.data.timeDeposit.amount);
        } else {
          setError('Failed to fetch time deposit data');
        }
      } catch (err) {
        setError('Error fetching time deposit data');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (timeDepositId) {
      fetchTimeDeposit();
    }
  }, [timeDepositId]);

  // Calculate days elapsed since deposit
  const calculateDaysElapsed = () => {
    if (!timeDeposit?.maturityDate) return 0;
    const maturityDate = new Date(timeDeposit.maturityDate);
    const termMonths = timeDeposit.fixedTerm;
    const startDate = new Date(maturityDate);
    startDate.setMonth(startDate.getMonth() - termMonths);
    
    const today = new Date();
    const daysElapsed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysElapsed);
  };

  // Calculate early withdrawal details
  const calculateWithdrawalDetails = () => {
    if (!timeDeposit) return { 
      penaltyAmount: 0, 
      newInterest: 0, 
      totalWithdrawalAmount: 0, 
      remainingBalance: 0,
      daysElapsed: 0 
    };

    const daysElapsed = calculateDaysElapsed();
    const earlyWithdrawalRate = 0.005; // 0.5% per annum for early withdrawal
    const daysInYear = 365;

    // Calculate new interest based on days elapsed
    const newInterest = (withdrawalAmount * earlyWithdrawalRate * daysElapsed) / daysInYear;

    // Calculate penalty (if any)
    const penaltyAmount = 0; // No additional penalty since we're using reduced interest rate

    const totalWithdrawalAmount = isPartial
      ? withdrawalAmount + newInterest
      : timeDeposit.amount + newInterest;

    const remainingBalance = isPartial 
      ? timeDeposit.amount - withdrawalAmount 
      : 0;

    return {
      penaltyAmount,
      newInterest,
      totalWithdrawalAmount,
      remainingBalance,
      daysElapsed
    };
  };

  const { 
    penaltyAmount, 
    newInterest,
    totalWithdrawalAmount, 
    remainingBalance,
    daysElapsed 
  } = calculateWithdrawalDetails();

  const handleSubmit = () => {
    if (!confirmationStep) {
      setConfirmationStep(true);
      return;
    }
    
    console.log("Processing early withdrawal:", {
      accountNumber: timeDeposit?.account_number,
      withdrawalAmount,
      newInterest,
      totalWithdrawalAmount,
      isPartial,
      remainingBalance,
      daysElapsed
    });
    
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      navigate(-1);
    }, 3000);
  };

  const handleAmountChange = (e) => {
    const amount = parseFloat(e.target.value) || 0;
    if (!timeDeposit) return;

    if (amount > timeDeposit.amount) {
      setWithdrawalAmount(timeDeposit.amount);
    } else {
      setWithdrawalAmount(amount);
    }
    
    setIsPartial(amount < timeDeposit.amount && amount > 0);
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!timeDeposit) return <div className="p-4">No time deposit data found</div>;

  return (
    <div className="mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium">Early Withdrawal Request</h2>
            <button onClick={() => navigate(-1)} className="text-gray-500">
              <X className="h-5 w-5" />
            </button>
          </div>

          {!confirmationStep ? (
            <>
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-amber-400 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium text-amber-800">Early Withdrawal Notice</h3>
                    <p className="text-sm text-amber-700 mt-1">
                      Interest will be calculated at 0.5% per annum based on the number of days your money was deposited ({daysElapsed} days).
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 mb-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-4">Current Time Deposit Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Account Number</label>
                      <div className="font-medium">{timeDeposit.account_number}</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Principal Amount</label>
                      <div className="font-medium">{timeDeposit.amount.toLocaleString()}</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Days Deposited</label>
                      <div className="font-medium">{daysElapsed} days</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Maturity Date</label>
                      <div className="font-medium">{new Date(timeDeposit.maturityDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-4">Withdrawal Details</h3>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Enter Withdrawal Amount</label>
                    <div className="relative">
                      <input
                        type="number"
                        className="w-full border rounded p-2 pl-8"
                        value={withdrawalAmount}
                        onChange={handleAmountChange}
                        max={timeDeposit.amount}
                        min={0}
                      />
                      <DollarSign className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                    <div className="mt-2 flex items-center text-sm">
                      <span className={`rounded-full px-2 py-1 ${isPartial ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                        {isPartial ? 'Partial Withdrawal' : 'Full Withdrawal'}
                      </span>
                      <span className="ml-2 text-gray-500">
                        Max: {timeDeposit.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-medium mb-4">Withdrawal Impact</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Early Withdrawal Interest (0.5% p.a.)</span>
                      <span className="text-green-600">+{newInterest.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Remaining Balance</span>
                      <span>{remainingBalance.toLocaleString()}</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-medium">
                        <span>Total to Receive</span>
                        <span>{totalWithdrawalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
              >
                Continue to Confirmation
              </button>
            </>
          ) : (
            <>
              <div className="border rounded-lg p-6 bg-gray-50 mb-6">
                <h3 className="font-medium mb-4">Confirm Withdrawal Details</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Account</label>
                      <div className="font-medium">{timeDeposit.account_number}</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Days Deposited</label>
                      <div className="font-medium">{daysElapsed} days</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Withdrawal Amount</label>
                      <div className="font-medium">{withdrawalAmount.toLocaleString()}</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Interest Earned</label>
                      <div className="font-medium">{newInterest.toLocaleString()}</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Total to Receive</label>
                      <div className="font-medium">{totalWithdrawalAmount.toLocaleString()}</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Remaining Balance</label>
                      <div className="font-medium">{remainingBalance.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex gap-4">
                  <button
                    onClick={() => setConfirmationStep(false)}
                    className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
                  >
                    Back to Details
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                  >
                    Confirm Withdrawal
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {showSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-100 text-green-800 p-4 rounded-lg shadow-lg">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>Withdrawal request submitted successfully</span>
          </div>
        </div>
      )}
    </div>
  );
};
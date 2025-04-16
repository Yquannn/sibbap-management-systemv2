import { useState, useEffect } from 'react';
import { Calendar, ChevronDown, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export default function TimeDepositRollover() {
  const navigate = useNavigate();
  const { timeDepositId } = useParams();
  
  const [timeDeposit, setTimeDeposit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [rolloverOptions, setRolloverOptions] = useState({
    selectedTerm: 12,
    includeInterest: true,
    additionalDeposit: 0,
  });

  const [isTermDropdownOpen, setIsTermDropdownOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const termOptions = [6, 12];

  const calculateInterestRate = (amount, termMonths) => {
    const parsedAmount = parseFloat(amount);
    const parsedTermMonths = parseInt(termMonths, 10);

    if (isNaN(parsedAmount) || isNaN(parsedTermMonths)) return 0;

    const rates = {
      6: [
        { threshold: 10000, rate: 0.0075 },
        { threshold: 100000, rate: 0.01 },
        { threshold: 200000, rate: 0.0175 },
        { threshold: 300000, rate: 0.0225 },
        { threshold: 400000, rate: 0.025 },
        { threshold: 500000, rate: 0.0325 },
        { threshold: Infinity, rate: 0.035 }
      ],
      12: [
        { threshold: 10000, rate: 0.01 },
        { threshold: 100000, rate: 0.015 },
        { threshold: 200000, rate: 0.02 },
        { threshold: 300000, rate: 0.0275 },
        { threshold: 400000, rate: 0.03 },
        { threshold: 500000, rate: 0.035 },
        { threshold: Infinity, rate: 0.04 }
      ]
    };

    const termRates = rates[parsedTermMonths];
    if (!termRates) return 0;

    for (let i = termRates.length - 1; i >= 0; i--) {
      if (parsedAmount >= termRates[i].threshold) {
        return termRates[i].rate;
      }
    }
    return 0;
  };

  useEffect(() => {
    const fetchTimeDeposit = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3001/api/timedepositor/${timeDepositId}`);
        const result = await response.json();
        
        if (result.success) {
          setTimeDeposit(result.data.timeDeposit);
          setRolloverOptions(prev => ({
            ...prev,
            selectedTerm: result.data.timeDeposit.fixedTerm
          }));
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

  const totalRolloverAmount = timeDeposit
    ? (rolloverOptions.includeInterest 
        ? timeDeposit.amount + timeDeposit.interest + rolloverOptions.additionalDeposit 
        : timeDeposit.amount + rolloverOptions.additionalDeposit)
    : 0;

  const newInterestRate = calculateInterestRate(totalRolloverAmount, rolloverOptions.selectedTerm);

  const calculateNewMaturityDate = () => {
    const today = new Date();
    const newDate = new Date(today);
    newDate.setMonth(today.getMonth() + rolloverOptions.selectedTerm);
    return newDate.toISOString().split('T')[0];
  };

  const handleRollover = () => {
    console.log("Processing rollover with options:", {
      ...rolloverOptions,
      totalAmount: totalRolloverAmount,
      newInterestRate: newInterestRate,
      newMaturityDate: calculateNewMaturityDate()
    });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!timeDeposit) return <div className="p-4">No time deposit data found</div>;

  return (
    <div className="p-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium">Time Deposit Rollover</h2>
          <button onClick={() => navigate(-1)} className="text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-6 mb-6">
          {/* Current Deposit Details */}
          <div className="border-b pb-4">
            <h3 className="font-medium mb-4">Current Deposit Details</h3>
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
                <label className="text-sm text-gray-600">Interest Earned</label>
                <div className="font-medium">{timeDeposit.interest.toLocaleString()}</div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Maturity Date</label>
                <div className="font-medium">{new Date(timeDeposit.maturityDate).toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          {/* Rollover Options */}
          <div>
            <h3 className="font-medium mb-4">Rollover Options</h3>
            
            <div className="space-y-4">
              {/* Term Selection */}
              <div>
                <label className="text-sm text-gray-600 block mb-1">Select Term</label>
                <select
                  className="w-full border rounded-lg p-2"
                  value={rolloverOptions.selectedTerm}
                  onChange={(e) => setRolloverOptions({
                    ...rolloverOptions,
                    selectedTerm: parseInt(e.target.value)
                  })}
                >
                  {termOptions.map(term => (
                    <option key={term} value={term}>{term} months</option>
                  ))}
                </select>
              </div>

              {/* Include Interest Option */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={rolloverOptions.includeInterest}
                    onChange={(e) => setRolloverOptions({
                      ...rolloverOptions,
                      includeInterest: e.target.checked
                    })}
                  />
                  <span>Include earned interest</span>
                </label>
              </div>

              {/* Additional Deposit */}
              <div>
                <label className="text-sm text-gray-600 block mb-1">Additional Deposit</label>
                <input
                  type="number"
                  className="w-full border rounded-lg p-2"
                  value={rolloverOptions.additionalDeposit}
                  onChange={(e) => setRolloverOptions({
                    ...rolloverOptions,
                    additionalDeposit: parseFloat(e.target.value) || 0
                  })}
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-3">Rollover Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Total Amount</span>
                <div className="font-medium">{totalRolloverAmount.toLocaleString()}</div>
              </div>
              <div>
                <span className="text-sm text-gray-600">New Interest Rate</span>
                <div className="font-medium">{(newInterestRate * 100).toFixed(2)}%</div>
              </div>
              <div>
                <span className="text-sm text-gray-600">New Term</span>
                <div className="font-medium">{rolloverOptions.selectedTerm} months</div>
              </div>
              <div>
                <span className="text-sm text-gray-600">New Maturity Date</span>
                <div className="font-medium">{calculateNewMaturityDate()}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={handleRollover}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Confirm Rollover
          </button>
          <p className="text-sm text-gray-500">
            <AlertCircle className="inline h-4 w-4 mr-1" />
            Early termination penalties may apply
          </p>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-100 text-green-800 p-4 rounded-lg shadow">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>Rollover request submitted successfully</span>
          </div>
        </div>
      )}
    </div>
  );
}
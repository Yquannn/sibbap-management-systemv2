import React, { useEffect, useState } from "react";
import axios from "axios";
import { ChevronDown, Users, DollarSign, CreditCard, Clock } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminLoanMonitorUI() {
  const { id } = useParams();
  const memberId = id || sessionStorage.getItem("memberId");
  const navigate = useNavigate();

  // Data states
  const [loanData, setLoanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Dropdown filter state: "all" or specific loan_application_id (as string)
  const [selectedLoanId, setSelectedLoanId] = useState("all");

  // Placeholders for chart data
  const [statusCounts, setStatusCounts] = useState({});
  const [userDistribution, setUserDistribution] = useState({
    totalUsers: 0,
    activeUsers: 0,
  });

  useEffect(() => {
    const fetchLoanData = async () => {
      try {
        const response = await axios.get(
          `http://192.168.254.103:3001/api/member-loan/${memberId}`
        );
        if (!response.data || response.data.length === 0) {
          setError("No loan data found.");
        } else {
          // Use the first record if an array is returned
          const data = Array.isArray(response.data)
            ? response.data[0]
            : response.data;
          setLoanData(data);

          // Build status counts from loanApplications
          const loanApps = data.loanApplications || [];
          const counts = loanApps.reduce((acc, app) => {
            const status = app.status?.toLowerCase();
            acc[status] = (acc[status] || 0) + 1;
            return acc;
          }, {});
          setStatusCounts(counts);

          // Placeholder user distribution
          setUserDistribution({
            totalUsers: 821,
            activeUsers: 384280,
          });
        }
      } catch (err) {
        console.error("Error fetching loan data:", err);
        setError("Failed to load loan data.");
      } finally {
        setLoading(false);
      }
    };

    fetchLoanData();
  }, [memberId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-base-200">
        <span className="text-lg font-semibold">Loading...</span>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-center text-error">{error}</div>;
  }

  if (!loanData) {
    return <div className="p-6 text-center">No data available.</div>;
  }

  // Extract loan applications array
  const loanApps = loanData.loanApplications || [];

  // Calculate aggregated totals for "All" or specific loan when selected
  let statLoanCount, statTotalLoan, statTotalBalance;
  if (selectedLoanId === "all") {
    statLoanCount = loanApps.length;
    statTotalLoan = loanApps
      .reduce((acc, app) => acc + parseFloat(app.loan_amount), 0)
      .toFixed(2);
    statTotalBalance = loanApps
      .reduce((acc, app) => acc + parseFloat(app.balance), 0)
      .toFixed(2);
  } else {
    const selectedLoan = loanApps.find(
      (app) => app.loan_application_id.toString() === selectedLoanId
    );
    statLoanCount = selectedLoan ? 1 : 0;
    statTotalLoan = selectedLoan ? selectedLoan.loan_amount : "0.00";
    statTotalBalance = selectedLoan ? selectedLoan.balance : "0.00";
  }

  // Filter data arrays based on selected loan
  const filteredLoanApps =
    selectedLoanId === "all"
      ? loanApps
      : loanApps.filter(
          (app) => app.loan_application_id.toString() === selectedLoanId
        );

  const filteredInstallments =
    selectedLoanId === "all"
      ? loanData.installments || []
      : (loanData.installments || []).filter(
          (inst) => inst.loan_application_id.toString() === selectedLoanId
        );

  const filteredRepayments =
    selectedLoanId === "all"
      ? loanData.repayments || []
      : (() => {
          const installmentIds = (loanData.installments || [])
            .filter(
              (inst) =>
                inst.loan_application_id.toString() === selectedLoanId
            )
            .map((inst) => inst.installment_id);
          return (loanData.repayments || []).filter((rep) =>
            installmentIds.includes(rep.installment_id)
          );
        })();

  // Prepare chart data for Traffic Overview
  const barData = {
    labels: ["Approved", "Active", "Rejected", "Paid", "Unpaid"],
    datasets: [
      {
        label: "Loan Status",
        data: [
          statusCounts["approved"] || 0,
          statusCounts["active"] || 0,
          statusCounts["rejected"] || 0,
          statusCounts["paid"] || 0,
          statusCounts["unpaid"] || 0,
        ],
        backgroundColor: [
          "#16a34a",
          "#3b82f6",
          "#dc2626",
          "#2563eb",
          "#eab308",
        ],
      },
    ],
  };

  // Prepare chart data for Active Users
  const pieData = {
    labels: ["Active Users", "Other Users"],
    datasets: [
      {
        label: "User Distribution",
        data: [userDistribution.activeUsers, userDistribution.totalUsers],
        backgroundColor: ["#4ade80", "#a5b4fc"],
        hoverOffset: 4,
      },
    ],
  };

  // Utility function to format date strings
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen space-y-6">
      {/* Sticky Top Stats Section */}
      <div className="">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {/* Total Loan Applications Stat with Dropdown */}
          <div className="stat bg-white shadow-md rounded-lg p-4 flex flex-col justify-between">
            <div className="flex items-center">
              <Users size={65} className="text-green-500 mr-2" />
              <div>
                <div className="stat-title text-sm text-gray-500">
                  Total Loan Applications
                </div>
                <div className="stat-value text-2xl font-bold">
                  {statLoanCount}
                </div>
                <div className="stat-desc text-gray-400">
                  {selectedLoanId === "all"
                    ? "From the beginning"
                    : "Selected Loan"}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-xs text-gray-500 mb-1">
                Filter by Loan:
              </label>
              <div className="relative">
                <select
                  className="select select-bordered w-full text-sm pr-8"
                  value={selectedLoanId}
                  onChange={(e) => setSelectedLoanId(e.target.value)}
                >
                  <option value="all">All Loans</option>
                  {loanApps.map((app) => (
                    <option
                      key={app.loan_application_id}
                      value={app.loan_application_id}
                    >
                      {app.client_voucher_number} - {app.loan_type}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-500 pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* Total Loan Stat */}
          <div className="stat bg-white shadow-md rounded-lg p-4 flex items-center">
            <DollarSign size={65} className="text-green-500 mr-2" />
            <div>
              <div className="stat-title text-sm text-gray-500">
                Total Loan
              </div>
              <div className="stat-value text-2xl font-bold">₱{statTotalLoan}</div>
              <div className="stat-desc text-gray-400">
                {selectedLoanId === "all"
                  ? "Cumulative loan amount"
                  : "Loan amount"}
              </div>
            </div>
          </div>

          {/* Balance Stat */}
          <div className="stat bg-white shadow-md rounded-lg p-4 flex items-center">
            <CreditCard size={65} className="text-green-500 mr-2" />
            <div>
              <div className="stat-title text-sm text-gray-500">Balance</div>
              <div className="stat-value text-2xl font-bold">₱{statTotalBalance}</div>
              <div className="stat-desc text-gray-400">
                {selectedLoanId === "all"
                  ? "Total outstanding balance"
                  : "Outstanding balance"}
              </div>
            </div>
          </div>

          {/* Pending Stat */}
          <div className="stat bg-white shadow-md rounded-lg p-4 flex items-center">
            <Clock size={65} className="text-green-500 mr-2" />
            <div>
              <div className="stat-title text-sm text-gray-500">Pending</div>
              <div className="stat-value text-2xl font-bold">821</div>
              <div className="stat-desc text-gray-400">Current pending</div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Content: Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-4">
        {/* Loan Applications Table */}
        <div className="card bg-white shadow-md  rounded-lg p-4" style={{ maxHeight: "300px" }}>
          <div className="card-title text-lg font-bold mb-2">
            Loan Applications
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Details of all loan applications.
          </p>
          <div className="overflow-x-auto" style={{ maxHeight: "500px" }}>
            <table className="table w-full table-zebra">
              <thead className="bg-green-100">
                <tr>
                  <th>Voucher</th>
                  <th>Type</th>
                  <th>Application</th>
                  <th>Loan Amt</th>
                  <th>Interest</th>
                  <th>Terms</th>
                  <th>Balance</th>
                  <th>Fee</th>
                  <th>Created At</th>
                  <th>Status</th>
                  <th>Remarks</th>
                  <th>Loan Status</th>
                  <th>Action</th>

                </tr>
              </thead>
              <tbody>
                {filteredLoanApps.map((app) => (
                  <tr key={app.loan_application_id}>
                    <td>{app.client_voucher_number}</td>
                    <td>{app.loan_type}</td>
                    <td>{app.application}</td>
                    <td>₱{app.loan_amount}</td>
                    <td>{app.interest}</td>
                    <td>{app.terms}</td>
                    <td>₱{app.balance}</td>
                    <td>{app.service_fee}</td>
                    <td>{formatDate(app.created_at)}</td>
                    <td>{app.status}</td>
                    <td>{app.remarks}</td>
                    <td>{app.loan_status}</td>
                    <button
                          className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                          onClick={() => navigate("/")}
                        >
                          Renew
                        </button>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Users Card */}
        <div className="card bg-white shadow-md rounded-lg p-4" style={{ maxHeight: "300px" }}>
          <div className="card-title text-lg font-bold">
            Active Users
          </div>
          <p className="text-sm text-gray-500 mb-4">
            User distribution overview
          </p>
          <div className="flex flex-col items-center justify-center h-34">
            <Pie
              data={pieData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
              }}
            />
          </div>
          <div className="text-center mt-2">
            <div className="text-sm font-bold">
              {userDistribution.activeUsers.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">Active</div>
            <div className="text-xs text-gray-500">
              / {userDistribution.totalUsers.toLocaleString()} total
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Content: Two Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Installments Table */}
        <div className="card bg-white shadow-md rounded-lg p-4">
          <div className="card-title text-lg font-bold mb-2">
            Installments
          </div>
          <p className="text-sm text-gray-500 mb-4">
            A list of installment data.
          </p>
          <div className="overflow-x-auto">
            <table className="table w-full table-zebra">
              <thead className="bg-green-100">
                <tr>
                  <th>Terms</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Repayment</th>
                </tr>
              </thead>
              <tbody>
                {filteredInstallments.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.installment_number}</td>
                    <td>₱{row.amount}</td>
                    <td>{formatDate(row.due_date)}</td>
                    <td>{row.status}</td>
                    <td>
                      {row.status.toLowerCase() === "unpaid" ? (
                        <button
                          className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                          onClick={() => navigate(`/loan-repayment/${row.installment_id}`)}
                          >
                          Repay
                        </button>
                      ) : (
                        <span className="text-green-600 font-medium">
                          Paid
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Repayments Table */}
        <div className="card bg-white shadow-md rounded-lg p-4">
          <div className="card-title text-lg font-bold mb-2">
            Repayments
          </div>
          <p className="text-sm text-gray-500 mb-4">
            A list of repayment data.
          </p>
          <div className="overflow-x-auto">
            <table className="table w-full table-zebra">
              <thead className="bg-green-100">
                <tr>
                  <th>Txn #</th>
                  <th>Amount Paid</th>
                  <th>Payment Date</th>
                  <th>Method</th>
                </tr>
              </thead>
              <tbody>
                {filteredRepayments.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.transaction_number}</td>
                    <td>₱{row.amount_paid}</td>
                    <td>{formatDate(row.payment_date)}</td>
                    <td>{row.method}</td>
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

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Eye,
  Search,
  Clock,
  Plus,
  BarChart4,
  Users,
  Loader,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import MemberAccountModal from "../../childModal/MemberAccountModal";
import { useNavigate } from "react-router-dom";

// Format numbers as ₱1,234.56
const formatCurrency = (value) =>
  Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const TimeDeposit = ({ openModal, handleDelete }) => {
  const [timeDeposits, setTimeDeposits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [filterQuery, setFilterQuery] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const navigate = useNavigate();

  const handleOpenModal = (type, member = null) => {
    setModalType(type);
    setSelectedMember(member);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalType("");
    setSelectedMember(null);
  };

  // Fetch function
  const fetchTimeDeposits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get("http://localhost:3001/api/active");
      // Always an array
      setTimeDeposits(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Error fetching time deposits."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTimeDeposits();
  }, [fetchTimeDeposits]);

  // Filter & sort
  const filtered = timeDeposits.filter((d) => {
    const q = filterQuery.toLowerCase();
    const name = `${d.first_name} ${d.last_name}`.toLowerCase();
    const code = (d.memberCode || "").toLowerCase();
    return q === "" || name.includes(q) || code.includes(q);
  });
  const sorted = [...filtered].sort(
    (a, b) => b.timeDepositId - a.timeDepositId
  );

  // Summary stats
  const totalAmount = sorted.reduce(
    (sum, d) => sum + (parseFloat(d.amount) || 0),
    0
  );
  const avgAmount =
    sorted.length > 0 ? totalAmount / sorted.length : 0;

  // Pagination logic
  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const idxLast = currentPage * itemsPerPage;
  const idxFirst = idxLast - itemsPerPage;
  const currentItems = sorted.slice(idxFirst, idxLast);

  const handlePageChange = (p) => {
    if (p >= 1 && p <= totalPages) setCurrentPage(p);
  };
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(+e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Time Deposit
        </h1>
        <p className="text-gray-600">
          Manage time deposit accounts and transactions
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Accounts */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">
                Total Accounts
              </p>
              <p className="text-3xl font-bold text-gray-800">
                {sorted.length}
              </p>
            </div>
            <Users className="h-6 w-6 text-blue-500 bg-blue-50 p-2 rounded-lg" />
          </div>
        </div>

        {/* Total Deposited */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">
                Total Deposits
              </p>
              <p className="text-3xl font-bold text-gray-800">
                ₱{formatCurrency(totalAmount)}
              </p>
            </div>
            <Clock className="h-6 w-6 text-green-500 bg-green-50 p-2 rounded-lg"/>
          </div>
        </div>

        {/* Average Deposit */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">
                Average Deposit
              </p>
              <p className="text-3xl font-bold text-gray-800">
                ₱{formatCurrency(avgAmount)}
              </p>
            </div>
            <BarChart4 className="h-6 w-6 text-purple-500 bg-purple-50 p-2 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Search & Actions */}
      <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h4 className="text-lg font-semibold text-gray-800">
            Time Deposit Accounts
          </h4>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input
                type="text"
                placeholder="Search by name or code..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <button
              onClick={fetchTimeDeposits}
              className="flex items-center space-x-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <RefreshCw className="h-4 w-4"/> <span>Refresh</span>
            </button>
            <button
              onClick={() => handleOpenModal("deposit")}
              className="flex items-center bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2"/> Open Account
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <MemberAccountModal
        openModal={openModal}
        handleDelete={handleDelete}
        showModal={isModalOpen}
        closeModal={handleCloseModal}
        modalType={modalType}
        member={selectedMember}
      />

      {/* Loading */}
      {loading && (
        <div className="flex justify-center my-12">
          <div className="flex flex-col items-center">
            <Loader className="h-10 w-10 text-green-600 animate-spin"/>
            <p className="mt-4 text-gray-600">
              Loading time deposits...
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6">
          <p className="flex items-center font-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-9.707a1 1 0 10-1.414 1.414L9.586 11l-.293.293a1 1 0 001.414 1.414L11 12.414l.293.293a1 1 0 001.414-1.414L12.414 11l.293-.293a1 1 0 00-1.414-1.414L11 9.586l-.293-.293z"
                clipRule="evenodd"
              />
            </svg>
            Error
          </p>
          <p className="mt-1 ml-7">{error}</p>
        </div>
      )}

      {/* Data Table */}
      {!loading && !error && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <div className="max-h-96 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    {[
                      "Code Number",
                      "Account No.",
                      "Type",
                      "Holder",
                      "Amount",
                      "Term",
                      "Status",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {currentItems.length > 0 ? (
                    currentItems.map((d, i) => (
                      <tr
                        key={`${d.timeDepositId}-${i}`}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-4 py-4 text-sm text-gray-700">
                          {d.memberCode || "N/A"}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700">
                          {d.account_number || "N/A"}
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                            {d.account_type || "N/A"}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700">
                          {d.first_name} {d.last_name}
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-gray-700">
                          ₱{formatCurrency(d.amount)}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700">
                          <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-xs">
                            {d.fixedTerm} mo.
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              d.account_status === "ACTIVE"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {d.account_status || "ACTIVE"}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right text-sm">
                          <button
                            onClick={() =>
                              navigate(
                                `/member/time-deposit-info/${d.timeDepositId}`
                              )
                            }
                            className="bg-green-50 text-green-700 px-3 py-1.5 rounded-md text-xs flex items-center hover:bg-green-100"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1.5" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-16 text-center">
                        <div className="flex flex-col items-center">
                          <Clock className="h-12 w-12 text-gray-300 mb-4"/>
                          <p className="text-gray-500 text-lg font-medium">
                            No active time deposits
                          </p>
                          <p className="text-gray-400 mt-1">
                            Click “Open Account” to create one
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {sorted.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t flex flex-col sm:flex-row items-center justify-between">
              <div className="flex items-center mb-4 sm:mb-0">
                <span className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">{idxFirst + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(idxLast, sorted.length)}
                  </span>{" "}
                  of <span className="font-medium">{sorted.length}</span>{" "}
                  deposits
                </span>
                <select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="ml-4 text-sm border rounded-md px-2 py-1 focus:ring-green-500"
                >
                  {[5, 10, 25, 50].map((n) => (
                    <option key={n} value={n}>
                      {n} / page
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1.5 text-sm rounded-md flex items-center ${
                    currentPage === 1
                      ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                      : "text-gray-700 bg-white hover:bg-gray-100"
                  }`}
                >
                  <ChevronLeft className="h-4 w-4 mr-1"/> Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .slice(
                    Math.max(0, currentPage - 3),
                    Math.min(totalPages, currentPage + 2)
                  )
                  .map((p) => (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`px-3 py-1.5 text-sm rounded-md ${
                        p === currentPage
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 bg-white hover:bg-gray-100"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1.5 text-sm rounded-md flex items-center ${
                    currentPage === totalPages
                      ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                      : "text-gray-700 bg-white hover:bg-gray-100"
                  }`}
                >
                  Next <ChevronRight className="h-4 w-4 ml-1"/>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TimeDeposit;

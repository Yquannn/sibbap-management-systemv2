import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft, FaDownload, FaFileAlt, FaUserCircle } from "react-icons/fa";

const KalingaFundInfo = () => {
  const [member, setMember] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [claims, setClaims] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("contributions");
  
  // Modal states
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
  const [selectedClaimId, setSelectedClaimId] = useState(null);
  
  // Form states
  const [newContribution, setNewContribution] = useState({
    amount: "",
    payment_method: "Cash",
    receipt_number: "",
    remarks: ""
  });
  
  const [newClaim, setNewClaim] = useState({
    claim_type: "Hospitalization",
    amount: "",
    beneficiary_name: "",
    relationship: "",
    supporting_documents: "",
    remarks: ""
  });
  
  const [claimStatus, setClaimStatus] = useState({
    status: "Approved"
    // We'll use userId from sessionStorage when submitting
  });

  const { memberId } = useParams();
  const navigate = useNavigate();
  const userId = sessionStorage.getItem("userid");

  useEffect(() => {
    const fetchMemberDetails = async () => {
      setLoading(true);
      try {
        // Fetch member details
        const memberResponse = await axios.get(`http://localhost:3001/api/member-info/${memberId}`);
        setMember(memberResponse.data);

        // Fetch member's contributions
        const contributionsResponse = await axios.get(`http://localhost:3001/api/kalinga/contributions/member/${memberId}`);
        setContributions(contributionsResponse.data);

        // Fetch member's claims
        const claimsResponse = await axios.get(`http://localhost:3001/api/kalinga/claims/member/${memberId}`);
        setClaims(claimsResponse.data);

        // Fetch active settings
        const settingsResponse = await axios.get("http://localhost:3001/api/kalinga/settings/active");
        setSettings(settingsResponse.data);
      } catch (error) {
        console.error("Error fetching member details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMemberDetails();
  }, [memberId]);

  // Create a new contribution
  const handleCreateContribution = async (e) => {
    e.preventDefault();
    try {
      const contributionData = {
        ...newContribution,
        memberId: parseInt(memberId),
        payment_date: new Date().toISOString().split('T')[0] // Current date in YYYY-MM-DD format
      };
      
      const response = await axios.post("http://localhost:3001/api/kalinga/contributions", contributionData);
      
      // Add new contribution to the list
      const newContributionWithId = {
        ...contributionData,
        contribution_id: response.data.id,
        created_at: new Date().toISOString() // Add created_at for UI display
      };
      
      setContributions([...contributions, newContributionWithId]);
      setShowContributionModal(false);
      setNewContribution({
        amount: "",
        payment_method: "Cash",
        receipt_number: "",
        remarks: ""
      });
      
      alert("Contribution added successfully!");
    } catch (error) {
      console.error("Error creating contribution:", error);
      alert(`Failed to add contribution: ${error.response?.data?.message || error.message}`);
    }
  };

  // Create a new claim
  const handleCreateClaim = async (e) => {
    e.preventDefault();
    try {
      const claimData = {
        ...newClaim,
        member_id: parseInt(memberId),
        claim_date: new Date().toISOString().split('T')[0] // Current date in YYYY-MM-DD format
      };
      
      const response = await axios.post("http://localhost:3001/api/kalinga/claims", claimData);
      
      // Add new claim to the list
      const newClaimWithId = {
        ...claimData,
        claim_id: response.data.id,
        status: "Pending"
      };
      
      setClaims([...claims, newClaimWithId]);
      setShowClaimModal(false);
      setNewClaim({
        claim_type: "Hospitalization",
        amount: "",
        beneficiary_name: "",
        relationship: "",
        supporting_documents: "",
        remarks: ""
      });
      
      alert("Claim submitted successfully!");
    } catch (error) {
      console.error("Error creating claim:", error);
      alert("Failed to submit claim. Please try again.");
    }
  };

  const handleUpdateClaimStatus = async (e) => {
    e.preventDefault();
    
    if (!selectedClaimId) {
      alert("No claim selected. Please select a claim first.");
      return;
    }
    
    try {
      // Make sure approved_by is a number, not a string
      const updatedStatus = {
        status: claimStatus.status,
        approved_by: parseInt(userId)  // Use parseInt instead of Number for clarity
      };
      
      // Send the request to update the claim status
      const response = await axios.put(
        `http://localhost:3001/api/kalinga/claims/${selectedClaimId}/status`, 
        updatedStatus
      );
      
      // Update the claims array with the new status
      const updatedClaims = claims.map(claim => 
        claim.claim_id === parseInt(selectedClaimId) ? {...claim, status: claimStatus.status} : claim
      );
      
      setClaims(updatedClaims);
      setShowUpdateStatusModal(false);
      setSelectedClaimId(null);
      setClaimStatus({ status: "Approved" }); // Reset to default after submission
      
      alert("Claim status updated successfully!");
    } catch (error) {
      console.error("Error updating claim status:", error);
      
      // Provide more specific error message based on the response
      const errorMsg = error.response?.data?.message || error.message || "An unknown error occurred";
      alert(`Failed to update claim status: ${errorMsg}`);
    }
  };




  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return `₱${parseFloat(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getTotalContributions = () => {
    return contributions.reduce((total, contribution) => total + parseFloat(contribution.amount || 0), 0);
  };

  const getKalingaStatus = () => {
    if (!member) return "Unknown";
    
    // Check if there's any approved or disbursed claim
    const hasClaimed = claims.some(claim => 
      claim.status === "Approved" || claim.status === "Disbursed"
    );
    
    if (hasClaimed) return "Claimed";
    if (contributions.length === 0) return "Inactive";
    return "Active";
  };

  const getMostRecentContribution = () => {
    if (contributions.length === 0) return null;
    
    return contributions.reduce((latest, contribution) => {
      const currentDate = new Date(contribution.payment_date);
      const latestDate = new Date(latest.payment_date);
      return currentDate > latestDate ? contribution : latest;
    }, contributions[0]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="flex flex-col items-center">
          <div className="bg-red-50 p-3 rounded-full mb-4">
            <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">Member Not Found</h3>
          <p className="text-gray-500 mb-6">The member you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate("/kalinga-fund-members")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          >
            <FaArrowLeft size={14} />
            Back to Kalinga Funds
          </button>
        </div>
      </div>
    );
  }

  const memberName = member.full_name || `${member.first_name || ''} ${member.last_name || ''}`;
  const mostRecentContribution = getMostRecentContribution();
  const kalingaStatus = getKalingaStatus();
  const totalContributions = getTotalContributions();

  return (
    <div className="space-y-6 mx-auto">
      {/* Back button */}
      <button 
        onClick={() => navigate("/kalinga-fund-members")}
        className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 transition mt-4"
      >
        <FaArrowLeft size={14} />
        Back to Kalinga Funds
      </button>

      {/* Member Header */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-5">
          <h2 className="text-xl font-medium">Kalinga Fund Details</h2>
          <p className="text-sm text-blue-100 mt-1">Member information and contribution history</p>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Member Info */}
            <div className="md:w-1/3">
              <div className="flex flex-col items-center p-6 border border-gray-100 rounded-lg bg-white shadow-sm">
                <div className="mb-4">
                  <FaUserCircle size={80} className="text-gray-300" />
                </div>
                <h3 className="text-xl font-medium text-gray-800 mb-1">{memberName}</h3>
                <p className="text-gray-500 mb-4">
                  Account Number: {contributions.length > 0 && contributions[0].account_number 
                    ? contributions[0].account_number 
                    : "N/A"}
                </p>
                <p className="text-gray-500 mb-4">Member ID: {member.memberCode}</p>
                
                <div className="w-full pt-4 border-t border-gray-100">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">Status</span>
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      kalingaStatus === "Active" ? "bg-green-50 text-green-700" :
                      kalingaStatus === "Claimed" ? "bg-amber-50 text-amber-700" :
                      "bg-gray-50 text-gray-700"
                    }`}>
                      {kalingaStatus}
                    </span>
                  </div>
                  
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">First Contribution</span>
                    <span className="text-gray-700">{
                      contributions.length > 0 ? 
                        formatDate(contributions.sort((a, b) => 
                          new Date(a.payment_date) - new Date(b.payment_date)
                        )[0].payment_date) : 
                        "None"
                    }</span>
                  </div>
                  
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">Latest Contribution</span>
                    <span className="text-gray-700">{
                      mostRecentContribution ? 
                        formatDate(mostRecentContribution.payment_date) : 
                        "None"
                    }</span>
                  </div>
                  
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">Total Contributed</span>
                    <span className="text-gray-800 font-medium">{formatCurrency(totalContributions)}</span>
                  </div>
                  
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">Claims Filed</span>
                    <span className="text-gray-700">{claims.length}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tabs Content */}
            <div className="md:w-2/3">
              <div className="border-b border-gray-200 mb-6">
                <nav className="flex space-x-8">
                  <button
                    onClick={() => setActiveTab("contributions")}
                    className={`py-3 px-1 font-medium text-sm border-b-2 ${
                      activeTab === "contributions" 
                        ? "border-blue-500 text-blue-600" 
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Contributions
                  </button>
                  <button
                    onClick={() => setActiveTab("claims")}
                    className={`py-3 px-1 font-medium text-sm border-b-2 ${
                      activeTab === "claims" 
                        ? "border-blue-500 text-blue-600" 
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Claims
                  </button>
                </nav>
              </div>
              
              {/* Contributions Tab */}
              {activeTab === "contributions" && (
                <div>
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="text-lg font-medium text-gray-800">Contribution History</h3>
                    {settings && (
                      <p className="text-sm text-gray-500">
                        Required Contribution: {formatCurrency(settings.contribution_amount)}
                      </p>
                    )}
                  </div>
                  
                  {contributions.length > 0 ? (
                    <div className="overflow-x-auto rounded-lg border border-gray-100">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Payment Method
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Receipt #
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {contributions
                            .sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date))
                            .map((contribution) => (
                              <tr key={contribution.contribution_id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                  {formatDate(contribution.payment_date)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 font-medium">
                                  {formatCurrency(contribution.amount)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  {contribution.payment_method || "Cash"}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  {contribution.receipt_number || "—"}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-100">
                      <FaFileAlt className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                      <p className="text-gray-600 font-medium">No contributions recorded yet</p>
                      <p className="text-gray-400 text-sm mt-1">This member hasn't made any Kalinga Fund contributions</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Claims Tab */}
              {activeTab === "claims" && (
                <div>
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="text-lg font-medium text-gray-800">Claims History</h3>
                    {settings && (
                      <div className="text-sm text-gray-500 text-right">
                        <p>Death Benefit: {formatCurrency(settings.death_benefit_amount)}</p>
                        <p>Hospitalization: {formatCurrency(settings.hospitalization_benefit_amount)}</p>
                      </div>
                    )}
                  </div>
                  
                  {claims.length > 0 ? (
                    <div className="overflow-x-auto rounded-lg border border-gray-100">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date Filed
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Beneficiary
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {claims
                            .sort((a, b) => new Date(b.claim_date) - new Date(a.claim_date))
                            .map((claim) => (
                              <tr key={claim.claim_id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                  {formatDate(claim.claim_date)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                  {claim.claim_type}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 font-medium">
                                  {formatCurrency(claim.amount)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  {claim.beneficiary_name} 
                                  {claim.relationship && ` (${claim.relationship})`}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className={`px-2.5 py-1 inline-flex text-xs font-medium rounded-full ${
                                    claim.status === "Approved" ? "bg-green-50 text-green-700" :
                                    claim.status === "Rejected" ? "bg-red-50 text-red-700" :
                                    claim.status === "Disbursed" ? "bg-blue-50 text-blue-700" :
                                    "bg-amber-50 text-amber-700"
                                  }`}>
                                    {claim.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                  {claim.status === "Pending" && (
                                    <button 
                                      onClick={() => {
                                        setSelectedClaimId(claim.claim_id);
                                        setShowUpdateStatusModal(true);
                                      }}
                                      className="text-blue-600 hover:text-blue-900"
                                    >
                                      Update Status
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-100">
                      <FaFileAlt className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                      <p className="text-gray-600 font-medium">No claims filed yet</p>
                      <p className="text-gray-400 text-sm mt-1">This member hasn't submitted any benefit claims</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Actions */}
              <div className="mt-8 flex flex-wrap gap-3">
                {/* Add new contribution button */}
                <button 
                  onClick={() => setShowContributionModal(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition flex items-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Contribution
                </button>
                
                {/* Add new claim button */}
                <button 
                  onClick={() => setShowClaimModal(true)}
                  className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition flex items-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  File Claim
                </button>
                
                {/* Download statement button */}
                <button 
                  onClick={() => {/* Download action */}}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition flex items-center gap-2"
                >
                  <FaDownload size={14} />
                  Download Statement
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Contribution Modal */}
      {showContributionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-5 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-800">Add New Contribution</h3>
              <p className="text-gray-500 text-sm mt-1">Record a new Kalinga Fund contribution</p>
            </div>
            <form onSubmit={handleCreateContribution}>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">₱</span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={newContribution.amount}
                      onChange={(e) => setNewContribution({...newContribution, amount: e.target.value})}
                      className="pl-7 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                    value={newContribution.payment_method}
                    onChange={(e) => setNewContribution({...newContribution, payment_method: e.target.value})}
                    className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Check">Check</option>
                    <option value="GCash">GCash</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Number</label>
                  <input
                    type="text"
                    value={newContribution.receipt_number}
                    onChange={(e) => setNewContribution({...newContribution, receipt_number: e.target.value})}
                    className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Optional receipt number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                  <textarea
                    value={newContribution.remarks}
                    onChange={(e) => setNewContribution({...newContribution, remarks: e.target.value})}
                    rows={3}
                    className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Optional notes"
                  />
                </div>
              </div>
              <div className="px-5 py-4 bg-gray-50 flex justify-end gap-3 rounded-b-lg">
                <button
                  type="button"
                  onClick={() => setShowContributionModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded-md transition-colors"
                >
                  Save Contribution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Claim Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-5 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-800">File New Claim</h3>
              <p className="text-gray-500 text-sm mt-1">Submit a new Kalinga Fund benefit claim</p>
            </div>
            <form onSubmit={handleCreateClaim}>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Claim Type</label>
                  <select
                    value={newClaim.claim_type}
                    onChange={(e) => setNewClaim({...newClaim, claim_type: e.target.value})}
                    className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border focus:ring-blue-500 focus:border-blue-500"
                    >
                   <option value="Death">Death</option>
                   <option value="Hospitalization">Hospitalization</option>
                   <option value="Other">Other</option>
                 </select>
               </div>
               
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                 <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <span className="text-gray-500 sm:text-sm">₱</span>
                   </div>
                   <input
                     type="number"
                     step="0.01"
                     required
                     value={newClaim.amount}
                     onChange={(e) => setNewClaim({...newClaim, amount: e.target.value})}
                     className="pl-7 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border focus:ring-blue-500 focus:border-blue-500"
                     placeholder="0.00"
                   />
                 </div>
               </div>
               
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Beneficiary Name</label>
                 <input
                   type="text"
                   required
                   value={newClaim.beneficiary_name}
                   onChange={(e) => setNewClaim({...newClaim, beneficiary_name: e.target.value})}
                   className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border focus:ring-blue-500 focus:border-blue-500"
                   placeholder="Full name of beneficiary"
                 />
               </div>
               
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                 <input
                   type="text"
                   value={newClaim.relationship}
                   onChange={(e) => setNewClaim({...newClaim, relationship: e.target.value})}
                   className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border focus:ring-blue-500 focus:border-blue-500"
                   placeholder="E.g., Self, Spouse, Child"
                 />
               </div>
               
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Supporting Documents</label>
                 <input
                   type="text"
                   value={newClaim.supporting_documents}
                   onChange={(e) => setNewClaim({...newClaim, supporting_documents: e.target.value})}
                   className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border focus:ring-blue-500 focus:border-blue-500"
                   placeholder="List of document filenames"
                 />
               </div>
               
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                 <textarea
                   value={newClaim.remarks}
                   onChange={(e) => setNewClaim({...newClaim, remarks: e.target.value})}
                   rows={3}
                   className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border focus:ring-blue-500 focus:border-blue-500"
                   placeholder="Additional details about the claim"
                 />
               </div>
             </div>
             <div className="px-5 py-4 bg-gray-50 flex justify-end gap-3 rounded-b-lg">
               <button
                 type="button"
                 onClick={() => setShowClaimModal(false)}
                 className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
               >
                 Cancel
               </button>
               <button
                 type="submit"
                 className="px-4 py-2 text-white bg-purple-500 hover:bg-purple-600 rounded-md transition-colors"
               >
                 Submit Claim
               </button>
             </div>
           </form>
         </div>
       </div>
     )}

     {/* Update Claim Status Modal */}
     {showUpdateStatusModal && (
       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
         <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
           <div className="p-5 border-b border-gray-200">
             <h3 className="text-lg font-medium text-gray-800">Update Claim Status</h3>
             <p className="text-gray-500 text-sm mt-1">Change the status of this claim request</p>
           </div>
           <form onSubmit={handleUpdateClaimStatus}>
             <div className="p-5 space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                 <select
                   value={claimStatus.status}
                   onChange={(e) => setClaimStatus({...claimStatus, status: e.target.value})}
                   className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border focus:ring-blue-500 focus:border-blue-500"
                 >
                   <option value="Approved">Approved</option>
                   <option value="Rejected">Rejected</option>
                   <option value="Disbursed">Disbursed</option>
                   {/* <option value="Pending">Pending</option> */}
                 </select>
               </div>
               
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Approved By</label>
                 <input
                   type="text"
                   value={userId ? `User ${userId}` : "Unknown User"}
                   disabled
                   className="block w-full shadow-sm sm:text-sm border-gray-300 bg-gray-50 rounded-md p-2 border"
                 />
               </div>
             </div>
             <div className="px-5 py-4 bg-gray-50 flex justify-end gap-3 rounded-b-lg">
               <button
                 type="button"
                 onClick={() => {
                   setShowUpdateStatusModal(false);
                   setSelectedClaimId(null);
                 }}
                 className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
               >
                 Cancel
               </button>
               <button
                 type="submit"
                 className="px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded-md transition-colors"
               >
                 Update Status
               </button>
             </div>
           </form>
         </div>
       </div>
     )}
   </div>
 );
};

export default KalingaFundInfo;
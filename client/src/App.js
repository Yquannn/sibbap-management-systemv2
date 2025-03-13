import { Routes, Route } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import Dashboard from "./pages/admin/Dashboard";
import FileMaintenance from "./pages/admin/FileMaintenance";
import Savings from "./pages/admin/Savings";
import LoanApplication from "./pages/admin/LoanApplication";
import Maintenance from "./pages/admin/Maintenance";
import Members from "./pages/admin/Members";
import Report from "./pages/admin/Report";
import Users from "./pages/admin/Users";
import NotFoundPage from "./pages/admin/NotFound";
import Announcement from "./pages/admin/Announcement";
import LogIn from "./pages/admin/LogIn";
import Borrowers from "./pages/admin/loanPages/Borrowers";
import LoanApplicant from "./pages/admin/loanPages/LoanApplicant";
import LoanEvaluation from "./pages/admin/loanPages/LoanEvaluation";
import LoanApproval from "./pages/admin/loanPages/LoanApproval";
import MemberDashboard from "./pages/members/home/MemberDashboard";
import AdminLayout from "./layouts/AdminLayout";
import MemberLayout from "./layouts/MemberLayout";
import Transaction from "./pages/members/transaction/MemberTransaction";
import Notification from "./pages/members/notification/NotificationPage";
import MemberProfile from "./pages/members/profile/MemberProfile";
import TimedepositCalculatorPage from "./pages/members/home/TimedepositCalculatorPage";
import RegularSavingsCalculator from "./pages/members/home/utils/RegularSavingsCalculator";
import ShareCapitalCalculator from "./pages/members/home/utils/ShareCapitalCalculator";
import MemberLoanTracker from "./pages/members/loan/MemberLoanTracker"
import RegularSavingsTransactionHistory from "./pages/members/home/transaction/RegularSavingsTransaction";
import LoanDetails from "./pages/members/loan/LoanDetails";
import MembershipRegistration from "./pages/admin/RegisterMemberPages/MembershipRegistration"; 
import ApplyForLoan from "./pages/admin/loanPages/ApplyForLoan";
import RegularSavingsInfo from "./pages/admin/savingsPages/RegularSavingsInfo";
import TransactionInfo from "./pages/members/transaction/TransactionInfo"
import LoanPage from "./pages/members/loan/LoanPage";
import LoanInformation from './pages/members/loan/LoanInformation';

function App() {
  return (
    <Routes>
      {/* Public Route */}
      <Route index element={<LogIn />} />

      {/* Layout Selection */}
      <Route path="/" element={<RootLayout />} />

      {/* Admin Routes */}
      <Route element={<AdminLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="members" element={<Members />} />
        <Route path="file-maintenance" element={<FileMaintenance />} />
        <Route path="maintenance" element={<Maintenance />} />
        <Route path="savings" element={<Savings />} />
        <Route path="apply-for-loan" element={<LoanApplication/>} />
        <Route path="borrower" element={<Borrowers />} />
        <Route path="loan-applicant" element={<LoanApplicant />} />
        <Route path="loan-evaluation" element={<LoanEvaluation />} />
        <Route path="loan-approval" element={<LoanApproval />} />
        <Route path="report" element={<Report />} />
        <Route path="users" element={<Users />} />
        <Route path="announcement" element={<Announcement />} />



        {/* Regular Savings Info */}
        <Route path="regular-savings-info/:memberId" element={<RegularSavingsInfo />} />

        {/* Membership Registration */}
        <Route path="register-member/*" element={<MembershipRegistration />} />
        <Route path="apply-loan/*" element={<ApplyForLoan />} />


        

        {/* Admin-Specific 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Member Routes */}
      <Route element={<MemberLayout />}>
        <Route path="member-dashboard" element={<MemberDashboard />} />
        <Route path="member-transactions" element={<Transaction />} />
        <Route path="member-notification" element={<Notification />} />
        <Route path="member-profile" element={<MemberProfile />} />
        <Route path="timedeposit-calculator" element={<TimedepositCalculatorPage />} />
        <Route path="regular-savings-calculator" element={<RegularSavingsCalculator />} />
        <Route path="share-capital-calculator" element={<ShareCapitalCalculator />} />
        <Route path="member-loan/:memberId" element={<LoanPage />} />
        <Route path="member-loan-tracker" element={<MemberLoanTracker />} />
        <Route path="member-regular-savings-transaction" element={<RegularSavingsTransactionHistory />} />
        <Route path="member-loan-details" element={<LoanDetails />} />
        <Route path="regular-savings-transaction-info/:transactionNumber" element={<TransactionInfo />} />
        <Route path="loan-information" element={<LoanInformation />} />

      </Route>
    </Routes>
  );
}

export default App;

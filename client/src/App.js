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
import NotFoundPage from "./pages/NotFound";
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
import MemberLoanTracker from "./pages/members/loan/MemberLoanTracker";
import RegularSavingsTransactionHistory from "./pages/members/home/transaction/RegularSavingsTransaction";
import LoanDetails from "./pages/members/loan/LoanDetails";
import MembershipApplication from "./pages/admin/RegisterMemberPages/MembershipApplication";
import ApplyForLoan from "./pages/admin/loanPages/ApplyForLoan";
import RegularSavingsInfo from "./pages/admin/savingsPages/RegularSavingsInfo";
import TransactionInfo from "./pages/members/transaction/TransactionInfo";
import LoanPage from "./pages/members/loan/LoanPage";
import LoanInformation from './pages/members/loan/LoanInformation';
import Bills from "./pages/members/loan/Bills";
import TransactionDetails from "./pages/members/loan/TransactionDetails";
import LoanTransactionHistory from "./pages/members/loan/LoanTransactionHistory";
import LoanDetailsPage from "./pages/admin/loanPages/LoanDetailsPage";
import InstallmentRepayment from "./pages/admin/loanPages/components/InstallmentRepayment";
import LoanEvaluationProfilePage from "./pages/admin/loanPages/LoanEvaluationProfilePage";
import Authorize from "./pages/Unauthorize"; // Ensure filename matches
import BareLayout from "./layouts/BareLayout";
import LoanApprovalProfile from "./pages/admin/loanPages/LoanApprovalProfilePage";
import MemberProfilePage from "./pages/admin/MemberProfilePage";
import ApplyTimedeposit from "./pages/admin/savingsPages/timedeposit/ApplyTimedeposit";
import RegularSavings from "./pages/admin/savingsPages/RegularSavings";
import TimeDeposit from "./pages/admin/savingsPages/timedeposit/TimeDeposit";
import ShareCapital from "./pages/admin/savingsPages/SharedCapital";
import TimeDepositDetails from "./pages/admin/savingsPages/timedeposit/TimedepositDetails";
import TransactionForm from "./pages/admin/savingsPages/utils/TransactionForm";
import SavingsDashboard from "./pages/admin/savingsPages/SavingsDashboard";
import LoanDashboard from "./pages/admin/loanPages/LoanDashboard";
import MemberRegistrationList from "./pages/admin/RegisterMemberPages/MemberRegistrationList";
import MemberRegistration from "./pages/admin/RegisterMemberPages/MemberRegistration";
import MemberApplicant from "./pages/admin/RegisterMemberPages/MemberApplicant";
import LoanModule from "./pages/admin/system maintenance/LoanModule";
import SavingsModule from "./pages/admin/system maintenance/SavingsModule";
import MembersModule from "./pages/admin/system maintenance/MembersModule";
import RegularAnalytics from "./pages/members/home/SavingsAnalytics";
import ShareCapitalInfo from "./pages/admin/savingsPages/shareCapital/SharecapitalInfo";

import TimedepositRollover from "./pages/admin/savingsPages/timedeposit/TimedepositRollover"
import TimedepositEarlyWithdrawal from "./pages/admin/savingsPages/timedeposit/TimedepositEarlyWithdrawal";
import LoanHistory from "./pages/admin/loanPages/LoanHistory";
import LoanApplicationView from "./pages/admin/loanPages/LoanApplicationView";
import KalingaFundList from "./pages/admin/savingsPages/kalingaFunds/KalingaFundList";
import KalingaFundInfo from "./pages/admin/savingsPages/kalingaFunds/KalingaFundInfo";

import PushNotification from "./pages/admin/PushNotification";

function App() {
  return (
    <Routes>
  {/* Public Route */}
  <Route index element={<LogIn />} />
  <Route path="*" index element={<NotFoundPage />} />


  {/* Layout Selection */}
  <Route path="/" element={<RootLayout />} />

  {/* Admin Routes (with Navbar & Sidebar) */}
  <Route element={<AdminLayout />}>
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="savings-dashboard" element={<SavingsDashboard />} />
    <Route path="loan-dashboard" element={<LoanDashboard />} />
    <Route path="members-registration" element={<MemberRegistrationList />} />
    {/* <Route path="member-registration/:memberId" element={<MemberRegistrationParent />} /> */}
    {/* <Route path="members-applicant" element={<MemberApplicant/>} /> */}
    <Route path="member-application/*" element={<MembershipApplication />} />


    <Route path="/transaction-form" element={<TransactionForm />} />

    <Route path="member-registration/:memberId" element={<MemberRegistration />} />
    <Route path="member-registration/:mode/:memberId" element={<MemberRegistration />} />


    <Route path="system-maintenance/loan" element={<LoanModule />} />
    <Route path="system-maintenance/savings" element={<SavingsModule />} />
    <Route path="system-maintenance/members" element={<MembersModule />} />

    <Route path="members" element={<Members />} />
    <Route path="member-profile/:memberId" element={<MemberProfilePage />} />

    <Route path="file-maintenance" element={<FileMaintenance />} />
    <Route path="maintenance" element={<Maintenance />} />
    <Route path="savings" element={<Savings />} />
    <Route path="loan-application" element={<LoanApplication />} />
    <Route path="borrower" element={<Borrowers />} />
    <Route path="loan-applicant" element={<LoanApplicant />} />
    <Route path="loan-evaluation" element={<LoanEvaluation />} />
    <Route path="loan-approval" element={<LoanApproval />} />
    <Route path="report" element={<Report />} />
    <Route path="users" element={<Users />} />
    <Route path="announcement" element={<Announcement />} />
    <Route path="loan-application/:loan_application_id" element={<LoanEvaluationProfilePage />} />
    <Route path="regular-savings" element={<RegularSavings />} />
    <Route path="time-deposit" element={<TimeDeposit />} />
    <Route path="member/time-deposit-info/:timeDepositId" element={<TimeDepositDetails />} />

    <Route path="share-capital" element={<ShareCapital />} />
    <Route path="regular-savings-deposit/:memberId" element={<TransactionForm />} />
    <Route path="regular-savings-withdrawal/:memberId" element={<TransactionForm />} />
    <Route path="member/share-capital/:memberId" element={<ShareCapitalInfo />} />
    <Route path="timedeposit-early-withdrawal/:timeDepositId" element={<TimedepositEarlyWithdrawal />} />
    <Route path="timedeposit-rollover/:timeDepositId" element={<TimedepositRollover />} />
    <Route path="loan-history" element={<LoanHistory />} />
    <Route path="loan-application-view/:loanId" element={<LoanApplicationView />} />
    <Route path="kalinga-fund-members" element={<KalingaFundList />} />
    <Route path="kalinga-fund-info/:memberId" element={<KalingaFundInfo />} />

    <Route path="test-push-notif" element={<PushNotification />} />



    <Route path="loan-application-approval/:loan_application_id" element={<LoanApprovalProfile />} />

    <Route path="apply-timedeposit/:memberId" element={<ApplyTimedeposit />} />




    {/* Regular Savings Info */}
    <Route path="regular-savings-info/:memberId" element={<RegularSavingsInfo />} />

    {/* Membership Registration */}
    <Route path="apply-loan/*" element={<ApplyForLoan />} />
    <Route path="borrower-loan-information/:id" element={<LoanDetailsPage />} />

    {/* Loan Repayment */}
    <Route path="loan-repayment/:id" element={<InstallmentRepayment />} />

    {/* Admin-Specific 404 (Navbar & Sidebar Still Visible) */}
  </Route>

  {/* Member Routes (with Navbar & Sidebar) */}
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
    <Route path="member-bills" element={<Bills />} />
    <Route path="bill-details/:billId" element={<TransactionDetails />} />
    <Route path="loan-transaction-history" element={<LoanTransactionHistory />} />
    <Route path="member-regular-savings-analytics" element={<RegularAnalytics />} />

    {/* Member-Specific 404 (Navbar & Sidebar Still Visible) */}
    <Route path="*" element={<NotFoundPage />} />
  </Route>

  {/* Bare Layout Routes (NO Navbar & Sidebar) */}
  <Route element={<BareLayout />}>
     <Route index path="authorize" element={<Authorize />} /> 
    <Route index  path="*" element={<NotFoundPage />} /> {/* Only for pages under BareLayout */}
  </Route>

  
</Routes>

  );
}

export default App;

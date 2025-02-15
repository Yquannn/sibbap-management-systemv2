import { Routes, Route } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import Dashboard from "./pages/admin/Dashboard";
import FileMaintenance from "./pages/admin/FileMaintenance";
import Savings from "./pages/admin/Savings";
import Loan from "./pages/admin/Loan";
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
import Inbox from "./pages/members/inbox/MemberInbox";

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
        <Route path="apply-for-loan" element={<Loan />} />
        <Route path="borrower" element={<Borrowers />} />
        <Route path="loan-applicant" element={<LoanApplicant />} />
        <Route path="loan-evaluation" element={<LoanEvaluation />} />
        <Route path="loan-approval" element={<LoanApproval />} />
        <Route path="report" element={<Report />} />
        <Route path="users" element={<Users />} />
        <Route path="announcement" element={<Announcement />} />

        {/* Admin-Specific 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Member Routes */}
      <Route element={<MemberLayout />}>
        <Route path="member-dashboard" element={<MemberDashboard />} />
        {/* No wildcard route for members, preventing access to NotFoundPage */}
        <Route path="member-transactions" element={<Transaction />} />
        <Route path="member-inbox" element={<Inbox />} />

      </Route>
    </Routes>
  );
}

export default App;

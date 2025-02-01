import { Routes, Route } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import Dashboard from "./pages/Dashboard";
import FileMaintenance from "./pages/FileMaintenance";
import Savings from "./pages/Savings";
import Loan from "./pages/Loan";
import Maintenance from "./pages/Maintenance";
import Members from "./pages/Members";
// import Membership from "./pages/Membership"; // Fixed: you were importing Maintenance again
import Report from "./pages/Report";
import Users from "./pages/Users";
import NotFoundPage from "./pages/NotFound";
import Announcement from "./pages/Announcement";
import LogIn from "./pages/LogIn";
import Borrowers from "./pages/loanPages/Borrowers";

function App() {
  return (
    <Routes>
      <Route index element={<LogIn />} />

      <Route path="/" element={<RootLayout />}>
        <Route path="dashboard" element={<Dashboard />} /> {/* index matches "/" */}
        <Route path="members" element={<Members />} />
        {/* <Route path="membership" element={<Membership />} /> */}
        <Route path="file-maintenance" element={<FileMaintenance />} />
        <Route path="maintenance" element={<Maintenance />} />
        <Route path="savings" element={<Savings />} />
        <Route path="apply-for-loan" element={<Loan />} />
        {/* <Route path="loan-applicant" element={<Borrowers />} />
        <Route path="loan-evaluation" element={<Loan />} />
        <Route path="loan-approval" element={<Loan />} /> */}
        <Route path="borrower" element={<Borrowers />} />

        <Route path="report" element={<Report />} />
        <Route path="users" element={<Users />} />
        <Route path="announcement" element={<Announcement />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
